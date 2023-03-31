import type { TRPCClientErrorLike } from '@trpc/client'
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  AnySubscriptionProcedure,
  inferProcedureInput,
} from '@trpc/server'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'
import type {
  InvalidateQueryFilters,
  InvalidateOptions,
  FetchQueryOptions,
  ResetOptions,
  QueryFilters,
  Updater,
  CancelOptions,
  SetDataOptions,
  QueryState,
  RefetchOptions,
} from '@tanstack/svelte-query'
import type { QueryKey } from './getQueryKey'
import type { InfiniteQueryInput, TRPCOptions } from './types'

export type QueryContextProcedure<T extends AnyProcedure> = {
  getQueryKey: (input: inferProcedureInput<T>) => QueryKey

  fetch: (
    input: inferProcedureInput<T>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
  ) => Promise<inferTransformedProcedureOutput<T>>

  prefetch: (
    input: inferProcedureInput<T>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
  ) => Promise<void>

  getData: (input: inferProcedureInput<T>) => inferTransformedProcedureOutput<T> | undefined

  ensureData: (
    input: inferProcedureInput<T>,
    options?: FetchQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>>
  ) => Promise<inferTransformedProcedureOutput<T>>

  setData: (
    input: Updater<inferProcedureInput<T>, inferTransformedProcedureOutput<T>>,
    options?: SetDataOptions
  ) => Promise<void>

  getState: (
    input: inferProcedureInput<T>
  ) => QueryState<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> | undefined

  invalidate: (filters?: InvalidateQueryFilters, options?: InvalidateOptions) => Promise<void>

  refetch: (filters?: QueryFilters, options?: RefetchOptions) => Promise<void>

  cancel: (filters?: QueryFilters, options?: CancelOptions) => Promise<void>

  remove: (filters?: QueryFilters) => void

  reset: (filters?: QueryFilters, options?: ResetOptions) => Promise<void>

  isFetching: (input: inferProcedureInput<T>) => number

  isFetchingRecursive: () => number
} & MaybeInfiniteContextProcedure<T>

export type MaybeInfiniteContextProcedure<T extends AnyProcedure> = inferProcedureInput<T> extends InfiniteQueryInput
  ? {
      getInfiniteQueryKey: (input: inferProcedureInput<T>) => QueryKey

      fetchInfinite: (
        input: inferProcedureInput<T>,
        options?: FetchQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
      ) => Promise<inferTransformedProcedureOutput<T>>

      prefetchInfinite: (
        input: inferProcedureInput<T>,
        options?: FetchQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
      ) => Promise<void>

      getInfiniteData: (input: inferProcedureInput<T>) => inferTransformedProcedureOutput<T> | undefined

      ensureInfiniteData: (
        input: inferProcedureInput<T>,
        options?: FetchQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>>
      ) => Promise<inferTransformedProcedureOutput<T>>

      setInfiniteData: (
        input: Updater<inferTransformedProcedureOutput<T> | undefined, inferTransformedProcedureOutput<T> | undefined>,
        options?: SetDataOptions
      ) => Promise<void>

      getInfiniteState: (
        input: inferProcedureInput<T>
      ) => QueryState<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> | undefined
    }
  : object

export interface MutationContextProcedure {
  getMutationKey: () => QueryKey
  isMutating: () => number
}

export interface SubscriptionContextProcedure {
  getSubscriptionKey: () => QueryKey
}

// prettier-ignore
export type ContextProcedure<T> = 
  T extends AnyQueryProcedure ? QueryContextProcedure<T> : 
  T extends AnyMutationProcedure ? MutationContextProcedure :
  T extends AnySubscriptionProcedure ? SubscriptionContextProcedure  : never

interface SharedContext {
  invalidate: (filters?: InvalidateQueryFilters, opts?: InvalidateOptions) => Promise<void>
}

type InnerContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T[k]>
} & SharedContext

type RootContextRouter = SharedContext & object

export type ContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T[k]>
} & RootContextRouter
