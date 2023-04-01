import type { TRPCClientError, TRPCRequestOptions } from '@trpc/client'
import type {
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  DeepPartial,
  inferProcedureInput,
} from '@trpc/server'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'
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
import type { QueryKeyKnown } from '../../helpers/getQueryKey'

type TRPCSvelteRequestOptions = Omit<TRPCRequestOptions, 'signal'> & { abortOnUnmount?: boolean }

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

type QueryContextProcedure<
  Trouter extends AnyRouter,
  TProcedure extends AnyProcedure
> = QueryContext<Trouter, TProcedure> &
  (inferProcedureInput<TProcedure> extends InfiniteQueryInput
    ? InfiniteContext<Trouter, TProcedure>
    : object)

interface SharedContext {
  invalidate: (filters?: InvalidateQueryFilters, opts?: InvalidateOptions) => Promise<void>
}

type RootContext = { queryClient: QueryClient } & SharedContext

type ContextProcedure<TRouter extends AnyRouter, TProcedure> = TProcedure extends AnyQueryProcedure
  ? QueryContextProcedure<TRouter, TProcedure>
  : never

type InnerContextProxy<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextProxy<T[k]> : ContextProcedure<T, T[k]>
} & SharedContext

export type ContextProxy<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextProxy<T[k]> : ContextProcedure<T, T[k]>
} & RootContext
