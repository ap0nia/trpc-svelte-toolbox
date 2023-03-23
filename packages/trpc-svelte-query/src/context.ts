/**
 * `context`
 * A function that operates directly on the `QueryClient`, usually on behalf of a tRPC procedure.
 */

import type { TRPCClientErrorLike } from '@trpc/client'
import type {
  AnyProcedure,
  AnyRouter,
  inferProcedureInput,
  inferProcedureOutput,
  Procedure,
} from '@trpc/server'
import type {
  InvalidateQueryFilters,
  InvalidateOptions,
  FetchQueryOptions,
  ResetOptions,
  ResetQueryFilters,
  QueryFilters,
  Updater,
  CancelOptions,
  SetDataOptions,
  QueryKey,
} from '@tanstack/svelte-query'

type QueryType = 'query' | 'infinite' | 'any'

/**
 * Infinite queries must have the "cursor" property in the input.
 */
type InfiniteQueryInput = { cursor: any }

/**
 * Utilities available to infinite queries.
 */
export type MaybeInfiniteContextProcedure<T extends AnyProcedure> =
  inferProcedureInput<T> extends InfiniteQueryInput
    ? {
        fetchInfinite(
          opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
        ): Promise<inferProcedureOutput<T>>

        prefetchInfinite(
          opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
        ): Promise<void>

        setInfiniteData(data: Updater<inferProcedureInput<T>, inferProcedureOutput<T>>): Promise<void>

        getInfiniteData(filters?: QueryFilters): inferProcedureOutput<T> | undefined
      }
    : object

/**
 * Utilities available query procedures.
 */
export type QueryContextProcedure<T extends AnyProcedure> = {
  getQueryKey(input: inferProcedureInput<T>, type?: QueryType): QueryKey

  fetch(
    input: inferProcedureInput<T>,
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<inferProcedureOutput<T>>

  prefetch(
    input: inferProcedureInput<T>,
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<void>

  invalidate(
    filters?: InvalidateQueryFilters<inferProcedureInput<T>>,
    opts?: InvalidateOptions
  ): Promise<void>

  reset(filters?: ResetQueryFilters<inferProcedureInput<T>>, opts?: ResetOptions): Promise<void>

  cancel(filters?: QueryFilters, options?: CancelOptions): Promise<void>

  ensureData(opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>): Promise<void>

  setData(
    data: Updater<inferProcedureInput<T>, inferProcedureOutput<T>>,
    options?: SetDataOptions
  ): Promise<void>

  getData(filters?: QueryFilters): inferProcedureOutput<T> | undefined
} & MaybeInfiniteContextProcedure<T>

/**
 * Utilities available to mutation procedures.
 */
export type MutationContextProcedure<T extends AnyProcedure> = {}

/**
 * Utilities available to subscription procedures.
 */
export type SubscriptionContextProcedure<T extends AnyProcedure> = {}

/**
 * Map tRPC procedures to context.
 */
// prettier-ignore
export type ContextProcedure<T> = 
  T extends Procedure<infer Type, infer _TParams> ?
    Type extends 'query' ? QueryContextProcedure<T> : 
    Type extends 'mutation' ? MutationContextProcedure<T> :
    Type extends 'subscription' ? SubscriptionContextProcedure<T> : never 
  : never

/**
 * Properties available at the root context.
 */
type RootContextRouter = {
  invalidate(filters?: InvalidateQueryFilters, opts?: InvalidateOptions): Promise<void>
}

/**
 * Properties available at all levels of context.
 */
type SharedContext = {
  invalidate(filters?: InvalidateQueryFilters, opts?: InvalidateOptions): Promise<void>
}

/**
 * Inner context router has the shared properties, but not the root properties.
 */
type InnerContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T[k]>
} & SharedContext

/**
 * Map tRPC router to context router.
 */
export type ContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T[k]>
} & RootContextRouter