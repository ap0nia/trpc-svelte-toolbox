import type { TRPCClientError } from '@trpc/client'
import type { AnyProcedure, AnyQueryProcedure, AnyRouter, DeepPartial, inferProcedureInput } from '@trpc/server'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'
import type {
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
import type { InfiniteQueryInput, TRPCOptions } from './types'
import type { Override } from './utils'

export type GetQueryProcedureInput<TProcedureInput> = TProcedureInput extends InfiniteQueryInput
  ? keyof Omit<TProcedureInput, 'cursor'> extends never
    ? undefined
    : DeepPartial<Omit<TProcedureInput, 'cursor'>> | undefined
  : DeepPartial<TProcedureInput> | undefined

export type QueryType = 'query' | 'infinite' | 'any'

export type QueryKey = [string[], { input?: unknown; type?: Exclude<QueryType, 'any'> }?]

export type QueryKeyKnown<TInput, TType extends Exclude<QueryType, 'any'>> = [
  string[],
  { input?: GetQueryProcedureInput<TInput>; type: TType }?
]

export type QueryContext<TRouter extends AnyRouter, TProcedure extends AnyProcedure> = {
  fetch: (
    input: inferProcedureInput<TProcedure>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<TProcedure>, TRPCClientError<TRouter>> & TRPCOptions
  ) => Promise<inferTransformedProcedureOutput<TProcedure>>

  prefetch: (
    input: inferProcedureInput<TProcedure>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<TProcedure>, TRPCClientError<TRouter>> & TRPCOptions
  ) => Promise<void>

  ensureData: (
    input: inferProcedureInput<TProcedure>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<TProcedure>, TRPCClientError<TRouter>> & TRPCOptions
  ) => Promise<inferTransformedProcedureOutput<TProcedure>>

  getData: (input: inferProcedureInput<TProcedure>) => inferTransformedProcedureOutput<TProcedure> | undefined

  setData: (
    input: inferProcedureInput<TProcedure>,
    updater: Updater<
      inferTransformedProcedureOutput<TProcedure> | undefined,
      inferTransformedProcedureOutput<TProcedure> | undefined
    >,
    options?: SetDataOptions
  ) => void

  invalidate: (
    input?: DeepPartial<inferProcedureInput<TProcedure>>,
    filters?: Override<
      InvalidateQueryFilters,
      {
        predicate?: (
          query: Query<
            inferProcedureInput<TProcedure>,
            TRPCClientError<TRouter>,
            inferProcedureInput<TProcedure>,
            QueryKeyKnown<
              inferProcedureInput<TProcedure>,
              inferProcedureInput<TProcedure> extends InfiniteQueryInput ? 'infinite' : 'query'
            >
          >
        ) => boolean
      }
    >,
    options?: InvalidateOptions
  ) => Promise<void>

  refetch: (input?: inferProcedureInput<TProcedure>, filters?: QueryFilters, options?: RefetchOptions) => Promise<void>

  cancel: (input?: inferProcedureInput<TProcedure>, filters?: QueryFilters, options?: CancelOptions) => Promise<void>

  reset: (input?: inferProcedureInput<TProcedure>, filters?: QueryFilters, options?: ResetOptions) => Promise<void>
}

export type InfiniteContext<TRouter extends AnyRouter, TProcedure extends AnyProcedure> = {
  fetchInfinite: (
    input: inferProcedureInput<TProcedure>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<TProcedure>, TRPCClientError<TRouter>> & TRPCOptions
  ) => Promise<InfiniteData<inferTransformedProcedureOutput<TProcedure>>>

  prefetchInfinite: (
    input: inferProcedureInput<TProcedure>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<TProcedure>, TRPCClientError<TRouter>> & TRPCOptions
  ) => Promise<void>

  getInfiniteData: (
    input: inferProcedureInput<TProcedure>
  ) => InfiniteData<inferTransformedProcedureOutput<TProcedure>> | undefined

  setInfiniteData: (
    input: inferProcedureInput<TProcedure>,
    updater: Updater<
      InfiniteData<inferTransformedProcedureOutput<TProcedure>> | undefined,
      InfiniteData<inferTransformedProcedureOutput<TProcedure>> | undefined
    >,
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
