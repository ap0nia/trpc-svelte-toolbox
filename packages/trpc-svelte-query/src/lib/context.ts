import { setContext, getContext } from 'svelte'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import { QueryClient, useQueryClient } from '@tanstack/svelte-query'
import type { TRPCUntypedClient, TRPCClientError, TRPCRequestOptions } from '@trpc/client'
import type {
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  DeepPartial,
  inferProcedureInput,
} from '@trpc/server'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'
import type {
  InvalidateQueryFilters,
  InvalidateOptions,
  InfiniteData,
  FetchQueryOptions,
  FetchInfiniteQueryOptions,
  ResetOptions,
  QueryFilters,
  Updater,
  CancelOptions,
  SetDataOptions,
  Query,
  RefetchOptions,
} from '@tanstack/svelte-query'
import { getQueryKeyInternal } from '$lib/getQueryKey'
import type { QueryKeyKnown } from '$lib/getQueryKey'

interface TRPCSvelteRequestOptions extends Omit<TRPCRequestOptions, 'signal'> {
  abortOnUnmount?: boolean
}

interface TRPCOptions {
  trpc?: TRPCSvelteRequestOptions
}

interface InfiniteQueryInput {
  cursor?: unknown
}

type Override<Left, Right> = Omit<Left, keyof Right> & Right

export type QueryContext<
  TRouter extends AnyRouter,
  TProcedure extends AnyProcedure,
  TInput = inferProcedureInput<TProcedure>,
  TOutput = inferTransformedProcedureOutput<TProcedure>,
  TError = TRPCClientError<TRouter>
> = {
  fetch: (
    input: TInput,
    options?: FetchQueryOptions<TOutput, TError> & TRPCOptions
  ) => Promise<TOutput>

  prefetch: (
    input: TInput,
    options?: FetchQueryOptions<TOutput, TError> & TRPCOptions
  ) => Promise<void>

  ensureData: (
    input: TInput,
    options?: FetchQueryOptions<TOutput, TError> & TRPCOptions
  ) => Promise<TOutput>

  getData: (input: TInput) => TOutput | undefined

  setData: (
    input: TOutput,
    updater: Updater<TOutput | undefined, TOutput | undefined>,
    options?: SetDataOptions
  ) => void

  invalidate: (
    input?: DeepPartial<TInput>,
    filters?: Override<
      InvalidateQueryFilters,
      {
        predicate?: (
          query: Query<
            TInput,
            TError,
            TInput,
            QueryKeyKnown<TInput, TInput extends InfiniteQueryInput ? 'infinite' : 'query'>
          >
        ) => boolean
      }
    >,
    options?: InvalidateOptions
  ) => Promise<void>

  refetch: (input?: TInput, filters?: QueryFilters, options?: RefetchOptions) => Promise<void>

  cancel: (input?: TInput, filters?: QueryFilters, options?: CancelOptions) => Promise<void>

  reset: (input?: TInput, filters?: QueryFilters, options?: ResetOptions) => Promise<void>
}

export type InfiniteContext<
  TRouter extends AnyRouter,
  TProcedure extends AnyProcedure,
  TInput = inferProcedureInput<TProcedure>,
  TOutput = inferTransformedProcedureOutput<TProcedure>,
  TError = TRPCClientError<TRouter>
> = {
  fetchInfinite: (
    input: TInput,
    options?: FetchQueryOptions<TOutput, TError> & TRPCOptions
  ) => Promise<InfiniteData<TOutput>>

  prefetchInfinite: (
    input: TInput,
    options?: FetchQueryOptions<TOutput, TError> & TRPCOptions
  ) => Promise<void>

  getInfiniteData: (input: TInput) => InfiniteData<TOutput> | undefined

  setInfiniteData: (
    input: TInput,
    updater: Updater<InfiniteData<TOutput> | undefined, InfiniteData<TOutput> | undefined>,
    options?: SetDataOptions
  ) => void
}

// prettier-ignore
type QueryContextProcedure<Trouter extends AnyRouter, TProcedure extends AnyProcedure> = 
  QueryContext<Trouter, TProcedure> &
  inferProcedureInput<TProcedure> extends InfiniteQueryInput ? InfiniteContext<Trouter, TProcedure> : object

interface SharedContext {
  invalidate: (filters?: InvalidateQueryFilters, opts?: InvalidateOptions) => Promise<void>
}

// prettier-ignore
type ContextProcedure<TRouter extends AnyRouter, TProcedure> = 
  TProcedure extends AnyQueryProcedure ? QueryContextProcedure<TRouter, TProcedure> : never

export type ContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? ContextRouter<T[k]> : ContextProcedure<T, T[k]>
} & SharedContext

const TRPC_CONTEXT_KEY = Symbol('TRPC_CONTEXT_KEY')

export function createTRPCContext<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient = useQueryClient()
): ContextRouter<T> {
  const innerProxy = createRecursiveProxy((options) => {
    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const lastArg = pathCopy.pop() ?? ''

    const path = pathCopy.join('.')

    const queryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, anyArgs[0], 'query'),
      queryFn: (context) =>
        client.query(path, anyArgs[0], {
          ...anyArgs[1],
          signal: anyArgs[1]?.trpc?.abortOnUnmount ? context.signal : undefined,
        }),
      ...anyArgs[1],
    } satisfies FetchQueryOptions

    const infiniteQueryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, anyArgs[0], 'infinite'),
      queryFn: (context) =>
        client.query(path, anyArgs[0], {
          ...anyArgs[1],
          signal: anyArgs[1]?.trpc?.abortOnUnmount ? context.signal : undefined,
        }),
      ...anyArgs[1],
    } satisfies FetchInfiniteQueryOptions

    // general query key used for invalidations, etc.
    const queryKey = getQueryKeyInternal(pathCopy, anyArgs[0], 'any')

    switch (lastArg) {
      case 'fetch':
        return queryClient.fetchQuery(queryOptions)

      case 'prefetch':
        return queryClient.prefetchQuery(queryOptions)

      case 'getData':
        return queryClient.getQueryData(queryOptions.queryKey)

      case 'ensureData':
        return queryClient.ensureQueryData(queryOptions)

      case 'setData':
        return queryClient.setQueryData(queryOptions.queryKey, anyArgs[0], anyArgs[1])

      case 'fetchInfinite':
        return queryClient.fetchInfiniteQuery(infiniteQueryOptions)

      case 'prefetchInfinite':
        return queryClient.prefetchInfiniteQuery(infiniteQueryOptions)

      case 'getInfiniteData':
        return queryClient.getQueryData(infiniteQueryOptions.queryKey)

      case 'ensureInfiniteData':
        return queryClient.ensureQueryData(infiniteQueryOptions)

      case 'setInfiniteData':
        return queryClient.setQueryData(infiniteQueryOptions.queryKey, anyArgs[0], anyArgs[1])

      case 'invalidate':
        return queryClient.invalidateQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      case 'refetch':
        return queryClient.refetchQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      case 'cancel':
        return queryClient.cancelQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      case 'reset':
        return queryClient.resetQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      default:
        throw new TypeError(`trpc.${path}.${lastArg} is not a function`)
    }
  }) as ContextRouter<T>

  const proxy = createFlatProxy<ContextRouter<T>>((initialKey) => innerProxy[initialKey])
  return proxy
}

export function setTRPCContext<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient
) {
  const proxy = createTRPCContext(client, queryClient)
  setContext(TRPC_CONTEXT_KEY, proxy)
}

export function getTRPCContext<T extends AnyRouter>(): ContextRouter<T> {
  return getContext(TRPC_CONTEXT_KEY)
}
