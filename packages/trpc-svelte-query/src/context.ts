/**
 * `context`:
 * A function that operates directly on data from the `QueryClient` for a tRPC procedure.
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
import type { SSROpts } from './ssr'

type QueryType = 'query' | 'infinite' | 'any'

/**
 * An infinite query must have the "cursor" property required as input.
 * The procedure will acquire additional methods if it's an infinite query.
 */
type InfiniteQueryInput = { cursor: any }

/**
 * Utilities from "context" for infinite queries.
 */
export type MaybeInfiniteContextProcedure<T extends AnyProcedure> =
  inferProcedureInput<T> extends InfiniteQueryInput
    ? {
        fetchInfinite(
          opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>,
          ssrOpts?: SSROpts
        ): Promise<void>

        prefetchInfinite(
          opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
        ): Promise<void>

        setInfiniteData(data: Updater<inferProcedureInput<T>, inferProcedureOutput<T>>): Promise<void>

        getInfiniteData(filters?: QueryFilters): inferProcedureOutput<T> | undefined
      }
    : object

/**
 * Utilities from "context" that directly control the QueryClient for a query procedure.
 */
export type QueryContextProcedure<T extends AnyProcedure> = {
  getQueryKey(input: inferProcedureInput<T>, type?: QueryType): QueryKey

  fetch(
    input: inferProcedureInput<T>,
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>,
    ssrOpts?: SSROpts
  ): Promise<inferProcedureOutput<T>>

  prefetch(
    input: inferProcedureInput<T>,
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<inferProcedureOutput<T>>

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
 * Utilities from "context" that directly control the QueryClient for a mutation procedure.
 */
export type MutationContextProcedure<T extends AnyProcedure> = {}

/**
 * Utilities from "context" that directly control the QueryClient for a subscription procedure.
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
type RootContextRouter = {}

/**
 * Properties available at all levels of context.
 */
type SharedContext = {
  invalidate(filters?: InvalidateQueryFilters, opts?: InvalidateOptions): Promise<void>
}

/**
 * Context router has the shared properties, and not the root properties.
 */
type InnerContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T[k]>
} & SharedContext

/**
 * Map tRPC router properties to context.
 */
export type ContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerContextRouter<T[k]> : ContextProcedure<T[k]>
} & RootContextRouter 
