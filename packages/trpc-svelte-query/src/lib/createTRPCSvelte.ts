import { get } from 'svelte/store'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import { createTRPCContext, setTRPCContext, getTRPCContext, type ContextRouter } from './context'
import { isWritable } from './createReactiveQuery'
import { getQueryKeyInternal } from './getQueryKey'
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
  useQueryClient,
} from '@tanstack/svelte-query'
import type { MaybeWritable } from '$lib/createReactiveQuery'

interface TRPCSvelteRequestOptions extends Omit<TRPCRequestOptions, 'signal'> {
  abortOnUnmount?: boolean
}

interface TRPCOptions {
  trpc?: TRPCSvelteRequestOptions
}

interface InfiniteQueryInput {
  cursor?: unknown
}

type CreateTRPCQuery<
  T extends AnyProcedure,
  TPath extends string,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = {
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
  TPath extends String,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>,
  NoCursor = Omit<TInput, 'cursor'>
> = {
  (
    input: MaybeWritable<NoCursor>,
    opts?: CreateInfiniteQueryOptions<TOutput, TError, TOutput, [TPath, NoCursor]> & TRPCOptions
  ): CreateInfiniteQueryResult<TOutput, TError>
}

type CreateTRPCMutation<
  T extends AnyProcedure,
  TContext = unknown,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = {
  (
    opts?: CreateMutationOptions<TOutput, TError, TInput, TContext> & TRPCOptions
  ): CreateMutationResult<TOutput, TError, TInput, TContext>
}

type CreateTRPCSubscriptionOptions<TOutput, TError> = {
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
> = {
  (input: TInput, opts?: TRPCRequestOptions & CreateTRPCSubscriptionOptions<TOutput, TError>): void
}

type QueryProcedure<TProcedure extends AnyProcedure, TPath extends string> = {
  createQuery: CreateTRPCQuery<TProcedure, TPath>
} & (inferProcedureInput<TProcedure> extends InfiniteQueryInput
  ? CreateTRPCInfiniteQuery<TProcedure, TPath>
  : object)

type MutationProcedure<T extends AnyProcedure> = {
  createMutation: CreateTRPCMutation<T>
}

type SubscriptionProcedure<T extends AnyProcedure> = {
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
) {
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
        return createQuery({
          queryKey: getQueryKeyInternal(pathCopy, input, 'query'),
          queryFn: (context) =>
            client.query(path, input, {
              ...anyArgs[1],
              signal: abortOnUnmount ? context.signal : undefined,
            }),
          ...anyArgs[1],
        } satisfies CreateQueryOptions)
      }

      case 'createInfiniteQuery': {
        return createInfiniteQuery({
          queryKey: getQueryKeyInternal(pathCopy, input, 'infinite'),
          queryFn: (context) =>
            client.query(path, input, {
              ...anyArgs[1],
              signal: abortOnUnmount ? context.signal : undefined,
            }),
          ...anyArgs[1],
        } satisfies CreateInfiniteQueryOptions)
      }

      case 'createMutation': {
        const queryClient = svelteQueryOptions?.svelteQueryContext ?? useQueryClient()
        return createMutation({
          mutationKey: [pathCopy],
          mutationFn: (variables) => client.mutation(path, variables, anyArgs[0]?.trpc),
          onSuccess(data, variables, context) {
            const originalFn = () => anyArgs[0]?.onSuccess?.(data, variables, context)
            return svelteQueryOptions?.overrides?.createMutation?.onSuccess != null
              ? svelteQueryOptions.overrides.createMutation.onSuccess({
                  queryClient,
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
        return
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
  createContext: (client: TRPCUntypedClient<T>, queryClient: QueryClient) => ContextRouter<T>
  setContext: (client: TRPCUntypedClient<T>, queryClient: QueryClient) => void
  getContext: () => ContextRouter<T>
}

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

      case 'loadContext':
        loadContext = createTRPCContext<T>(client, svelteQueryOptions?.svelteQueryContext)
        return loadContext

      case 'createContext':
        return createTRPCContext

      case 'setContext':
        return setTRPCContext

      case 'getContext':
        return getTRPCContext

      default:
        return innerProxy[initialKey]
    }
  })

  return proxy
}
