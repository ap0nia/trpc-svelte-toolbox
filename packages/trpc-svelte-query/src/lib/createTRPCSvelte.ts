import { get, writable } from 'svelte/store'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import type {
  CreateTRPCClientOptions,
  TRPCClientErrorLike,
  TRPCRequestOptions,
  TRPCUntypedClient,
} from '@trpc/client'
import { createTRPCUntypedClient } from '@trpc/client'
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  AnySubscriptionProcedure,
  MaybePromise,
  inferProcedureInput,
} from '@trpc/server'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'
import {
  type CreateQueryOptions,
  type CreateQueryResult,
  type DefinedCreateQueryResult,
  type CreateInfiniteQueryOptions,
  type CreateInfiniteQueryResult,
  type CreateMutationOptions,
  type CreateMutationResult,
  type QueryClient,
  createQuery,
  createMutation,
  createInfiniteQuery,
  QueryObserver,
  InfiniteQueryObserver,
  useQueryClient,
} from '@tanstack/svelte-query'
import { getQueryKeyInternal } from '$lib/query-key/getQueryKey'
import { createReactiveQuery, isWritable } from '$lib/svelte-query/createReactiveQuery'
import { createTRPCContext, setTRPCContext, getTRPCContext, type ContextRouter } from '$lib/context'
import type { MaybeWritable } from '$lib/svelte-query/createReactiveQuery'

interface TRPCSvelteRequestOptions extends Omit<TRPCRequestOptions, 'signal'> {
  abortOnUnmount?: boolean
}

interface TRPCOptions {
  trpc?: TRPCSvelteRequestOptions
}

interface InfiniteQueryInput {
  cursor?: unknown
}

interface CreateTRPCQuery<
  T extends AnyProcedure,
  TPath extends string,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> {
  (
    input: MaybeWritable<TInput>,
    opts?: CreateQueryOptions<TOutput, TError, TOutput, [TPath, TInput]> & TRPCOptions
  ): CreateQueryResult<TOutput, TError>

  (
    input: MaybeWritable<TInput>,
    opts?: CreateQueryOptions<TOutput, TError, TOutput, [TPath, TInput]> & TRPCOptions
  ): DefinedCreateQueryResult<TOutput, TError>
}

type CreateTRPCInfiniteQuery<
  T extends AnyProcedure,
  TPath extends string,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>,
  NoCursor = Omit<TInput, 'cursor'>
> = (
  input: MaybeWritable<NoCursor>,
  opts?: CreateInfiniteQueryOptions<TOutput, TError, TOutput, [TPath, NoCursor]> & TRPCOptions
) => CreateInfiniteQueryResult<TOutput, TError>

type CreateTRPCMutation<
  T extends AnyProcedure,
  TContext = unknown,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = (
  opts?: CreateMutationOptions<TOutput, TError, TInput, TContext> & TRPCOptions
) => CreateMutationResult<TOutput, TError, TInput, TContext>

interface CreateTRPCSubscriptionOptions<TOutput, TError> {
  enabled?: boolean
  onStarted?: () => void
  onData: (data: TOutput) => void
  onError?: (err: TError) => void
}

type CreateTRPCSubscription<
  T extends AnyProcedure,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = (
  input: TInput,
  opts?: TRPCRequestOptions & CreateTRPCSubscriptionOptions<TOutput, TError>
) => void

type QueryProcedure<TProcedure extends AnyProcedure, TPath extends string> = {
  createQuery: CreateTRPCQuery<TProcedure, TPath>
} & (inferProcedureInput<TProcedure> extends InfiniteQueryInput
  ? CreateTRPCInfiniteQuery<TProcedure, TPath>
  : object)

interface MutationProcedure<T extends AnyProcedure> {
  createMutation: CreateTRPCMutation<T>
}

interface SubscriptionProcedure<T extends AnyProcedure> {
  createSubscription: CreateTRPCSubscription<T>
}

// prettier-ignore
type TRPCSvelteQueryProcedure<TProcedure, TPath extends string> = 
  TProcedure extends AnyQueryProcedure ? QueryProcedure<TProcedure, TPath> :
  TProcedure extends AnyMutationProcedure ? MutationProcedure<TProcedure> :
  TProcedure extends AnySubscriptionProcedure ? SubscriptionProcedure<TProcedure> : never

export type TRPCSvelteQueryRouter<TRouter extends AnyRouter, TPath extends string = ''> = {
  [k in keyof TRouter]: TRouter[k] extends AnyRouter
    ? TRPCSvelteQueryRouter<TRouter[k]['_def']['record'], `${TPath}${k & string}`>
    : TRPCSvelteQueryProcedure<TRouter[k], TPath>
}

export interface CreateMutationOverride {
  onSuccess: (opts: {
    originalFn: () => MaybePromise<unknown>
    queryClient: QueryClient
    meta: Record<string, unknown>
  }) => MaybePromise<unknown>
}

export interface CreateTRPCSvelteOptions {
  overrides?: {
    createMutation?: Partial<CreateMutationOverride>
  }
  abortOnUnmount?: boolean
  svelteQueryContext?: QueryClient
}

function createTRPCSvelteInner<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  svelteQueryOptions?: CreateTRPCSvelteOptions
): TRPCSvelteQueryRouter<T> {
  const innerProxy = createRecursiveProxy((options) => {
    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const lastArg = pathCopy.pop() ?? ''

    const path = pathCopy.join('.')

    const input = isWritable(anyArgs[0]) ? get(anyArgs[0]) : anyArgs[0]

    const abortOnUnmount =
      Boolean(svelteQueryOptions?.abortOnUnmount) || Boolean(anyArgs[1]?.trpc?.abortOnUnmount)

    switch (lastArg) {
      case 'createQuery': {
        const queryOptions = {
          queryKey: getQueryKeyInternal(pathCopy, input, 'query'),
          queryFn: async (context) =>
            await client.query(path, input, {
              ...anyArgs[1]?.trpc,
              signal: abortOnUnmount ? context.signal : undefined,
            }),
          ...anyArgs[1],
        } satisfies CreateQueryOptions

        if (!isWritable(anyArgs[0])) {
          return createQuery(queryOptions)
        }

        const optionsStore = writable<CreateQueryOptions & TRPCOptions>(queryOptions)
        const inputStore = anyArgs[0]
        const { set, update } = inputStore

        inputStore.set = (newInput) => {
          optionsStore.update(() => ({
            ...queryOptions,
            queryKey: getQueryKeyInternal(pathCopy, newInput, 'query'),
            queryFn: async (context) =>
              await client.query(path, newInput, {
                ...anyArgs[1]?.trpc,
                signal: abortOnUnmount ? context.signal : undefined,
              }),
          }))
          set(newInput)
        }

        inputStore.update = (updaterFn) => {
          update(updaterFn)

          const newInput = get(inputStore)

          optionsStore.update(() => ({
            ...queryOptions,
            queryKey: getQueryKeyInternal(pathCopy, newInput, 'query'),
            queryFn: async (context) =>
              await client.query(path, newInput, {
                ...anyArgs[1]?.trpc,
                signal: abortOnUnmount ? context.signal : undefined,
              }),
          }))
        }
        return createReactiveQuery(optionsStore, QueryObserver)
      }

      case 'createInfiniteQuery': {
        const infiniteQueryOptions = {
          queryKey: getQueryKeyInternal(pathCopy, input, 'infinite'),
          queryFn: async (context) =>
            await client.query(
              path,
              { ...input, cursor: context.pageParam },
              {
                ...anyArgs[1]?.trpc,
                signal: abortOnUnmount ? context.signal : undefined,
              }
            ),
          ...anyArgs[1],
        } satisfies CreateInfiniteQueryOptions

        if (!isWritable(anyArgs[0])) {
          return createInfiniteQuery(infiniteQueryOptions)
        }

        const inputStore = anyArgs[0]
        const optionsStore = writable<CreateInfiniteQueryOptions & TRPCOptions>(
          infiniteQueryOptions
        )
        const { set, update } = inputStore

        inputStore.set = (newInput) => {
          optionsStore.update(() => ({
            ...infiniteQueryOptions,
            queryKey: getQueryKeyInternal(pathCopy, newInput, 'infinite'),
            queryFn: async (context) =>
              await client.query(
                path,
                { ...newInput, cursor: context.pageParam },
                {
                  ...anyArgs[1]?.trpc,
                  signal: abortOnUnmount ? context.signal : undefined,
                }
              ),
          }))
          set(newInput)
        }

        inputStore.update = (updaterFn) => {
          update(updaterFn)

          const newInput = get(inputStore)

          optionsStore.update(() => ({
            ...infiniteQueryOptions,
            queryKey: getQueryKeyInternal(pathCopy, newInput, 'infinite'),
            queryFn: async (context) =>
              await client.query(
                path,
                { ...newInput, cursor: context.pageParam },
                {
                  ...anyArgs[1]?.trpc,
                  signal: abortOnUnmount ? context.signal : undefined,
                }
              ),
          }))
        }
        return createReactiveQuery(optionsStore, InfiniteQueryObserver as typeof QueryObserver)
      }

      case 'createMutation': {
        return createMutation({
          mutationKey: [pathCopy],
          mutationFn: async (variables) => await client.mutation(path, variables, anyArgs[0]?.trpc),
          onSuccess(data, variables, context) {
            const originalFn = (): unknown => anyArgs[0]?.onSuccess?.(data, variables, context)
            return svelteQueryOptions?.overrides?.createMutation?.onSuccess != null
              ? svelteQueryOptions.overrides.createMutation.onSuccess({
                  queryClient: svelteQueryOptions.svelteQueryContext ?? useQueryClient(),
                  meta: anyArgs[0]?.meta,
                  originalFn,
                })
              : originalFn()
          },
          ...anyArgs[0],
        } satisfies CreateMutationOptions)
      }

      // TODO
      case 'createSubscription': {
        return 'WIP'
      }

      // invoked by public `getQueryKey` helper
      case '_def':
        return pathCopy

      default:
        throw new TypeError(`trpc.${path}.${lastArg} is not a function`)
    }
  }) as TRPCSvelteQueryRouter<T>

  return innerProxy
}

export type CreateTRPCSvelte<T extends AnyRouter> = {
  client: TRPCUntypedClient<T>
  queryClient: QueryClient
  loadContext: ContextRouter<T>
  createContext: typeof createTRPCContext
  setContext: (queryClient: QueryClient) => void
  getContext: () => ContextRouter<T>
} & TRPCSvelteQueryRouter<T>

export function createTRPCSvelte<T extends AnyRouter>(
  trpcClientOptions: CreateTRPCClientOptions<T>,
  svelteQueryOptions?: CreateTRPCSvelteOptions
): CreateTRPCSvelte<T> {
  const client = createTRPCUntypedClient<T>(trpcClientOptions)

  const innerProxy = createTRPCSvelteInner(client, svelteQueryOptions)

  let loadContext: ContextRouter<T>

  const proxy = createFlatProxy<CreateTRPCSvelte<T>>((initialKey) => {
    switch (initialKey) {
      case 'client':
        return client

      case 'queryClient':
        return svelteQueryOptions?.svelteQueryContext

      case 'loadContext': {
        if (svelteQueryOptions?.svelteQueryContext == null) {
          throw new Error('QueryClient must be provided in load functions.')
        }
        if (loadContext == null) {
          loadContext = createTRPCContext<T>(client, svelteQueryOptions.svelteQueryContext)
        }
        return loadContext
      }

      case 'createContext':
        return createTRPCContext

      case 'setContext':
        return (queryClient: QueryClient) => setTRPCContext(client, queryClient, svelteQueryOptions)

      case 'getContext':
        return getTRPCContext

      default:
        return innerProxy[initialKey]
    }
  })

  return proxy
}
