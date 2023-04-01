/**
 * Maps a tRPC router to a context router.
 */

import type { QueryKeyKnown } from '../../helpers/getQueryKey'
import type {
  QueryClient,
  InvalidateQueryFilters,
  InvalidateOptions,
  InfiniteData,
  FetchQueryOptions,
  ResetOptions,
  QueryFilters,
  Updater,
  CancelOptions,
  SetDataOptions,
  Query,
  RefetchOptions,
} from '@tanstack/svelte-query'
import type { TRPCClientError, TRPCRequestOptions } from '@trpc/client'
import type {
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  DeepPartial,
  inferProcedureInput,
} from '@trpc/server'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'

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

interface QueryContext<
  TRouter extends AnyRouter,
  TProcedure extends AnyProcedure,
  TInput = inferProcedureInput<TProcedure>,
  TOutput = inferTransformedProcedureOutput<TProcedure>,
  TError = TRPCClientError<TRouter>
> {
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

interface InfiniteContext<
  TRouter extends AnyRouter,
  TProcedure extends AnyProcedure,
  TInput = inferProcedureInput<TProcedure>,
  TOutput = inferTransformedProcedureOutput<TProcedure>,
  TError = TRPCClientError<TRouter>
> {
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
  (inferProcedureInput<TProcedure> extends InfiniteQueryInput ? InfiniteContext<Trouter, TProcedure> : object)

interface SharedContext {
  invalidate: (filters?: InvalidateQueryFilters, opts?: InvalidateOptions) => Promise<void>
}

interface RootContext extends SharedContext {
  queryClient: QueryClient
}

type ContextProcedure<TRouter extends AnyRouter, TProcedure> = TProcedure extends AnyQueryProcedure
  ? QueryContextProcedure<TRouter, TProcedure>
  : never

type InnerContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T, T[k]>
} & SharedContext

export type ContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T, T[k]>
} & RootContext
