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
} from '@tanstack/svelte-query'

/**
 * An infinite query must have the "cursor" property required as input.
 * The procedure will acquire additional methods if it's an infinite query.
 */
type InfiniteQueryInput = { cursor: any }

/**
 * Utilities from "context" for infinite queries.
 */
export type MaybeInfiniteContextProcedure<T extends AnyProcedure> = inferProcedureInput<T> extends InfiniteQueryInput ? {
  fetchInfinite(
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<void>

  prefetchInfinite(
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<void>

  setInfiniteData(
    data: Updater<inferProcedureInput<T>, inferProcedureOutput<T>>
  ): Promise<void>

  getInfiniteData(filters?: QueryFilters): inferProcedureOutput<T> | undefined
} : object

/**
 * Utilities from "context" that directly control the QueryClient for a procedure.
 */
export type QueryContextProcedure<T extends AnyProcedure> = {
  invalidate(
    filters?: InvalidateQueryFilters<inferProcedureInput<T>>,
    opts?: InvalidateOptions
  ): Promise<void>

  fetch(
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<void>

  prefetch(
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<void>

  reset(
    filters?: ResetQueryFilters<inferProcedureInput<T>>,
    opts?: ResetOptions
  ): Promise<void>

  cancel(opts?: QueryFilters): Promise<void>

  ensureData(
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ): Promise<void>

  setData(
    data: Updater<inferProcedureInput<T>, inferProcedureOutput<T>>
  ): Promise<void>

  getData(filters?: QueryFilters): inferProcedureOutput<T> | undefined

} & MaybeInfiniteContextProcedure<T>

/**
 * Map tRPC procedures to context.
 * Only queries are supported right now.
 */
export type ContextProcedure<T> = 
  T extends Procedure<infer Type, infer _TParams> ? 
    Type extends 'query' ? QueryContextProcedure<T> :
    Type extends 'mutation' ? never : 
    Type extends 'subscription' ? never :
    never : never

/**
 * Map tRPC router properties to context.
 */
export type ContextRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? ContextRouter<T[k]> : ContextProcedure<T[k]>
}
