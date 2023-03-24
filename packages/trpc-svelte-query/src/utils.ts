/**
 * `utils`
 * Methods that operate directly on the `QueryClient`, usually on behalf of a tRPC procedure.
 * They'll actually be directly accessible from the same path as `createQuery`,
 * but splitting it up makes the autocomplete easier to work with.
 *
 * e.g. `trpc.utils.users.fetch()` and `trpc.users.fetch()` are both valid calls,
 * but only the former is recognized by TypeScript.
 */

import type { TRPCClientErrorLike, TRPCRequestOptions } from '@trpc/client'
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
} from '@tanstack/svelte-query'
import type { AnyQueryType, QueryKey } from './getQueryKey'

/**
 * Dummy type that indicates WIP.
 */
type TODO<T> = T extends unknown ? 'TODO!' : 'WIP!'

/**
 * Additional tRPC options can be under a `tRPC` property.
 */
type AdditionalOptions = {
  trpc?: TRPCRequestOptions
}

/**
 * Infinite queries must have the "cursor" property in the input.
 */
type InfiniteQueryInput = { cursor: any }

/**
 * Additional utilities available to infinite queries.
 */
export type MaybeInfiniteUtilsProcedure<T extends AnyProcedure> =
  inferProcedureInput<T> extends InfiniteQueryInput
    ? {
        fetchInfinite(
          opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> & AdditionalOptions
        ): Promise<inferProcedureOutput<T>>

        prefetchInfinite(
          opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> & AdditionalOptions
        ): Promise<void>

        setInfiniteData(data: Updater<inferProcedureInput<T>, inferProcedureOutput<T>>): Promise<void>

        getInfiniteData(filters?: QueryFilters): inferProcedureOutput<T> | undefined
      }
    : object

/**
 * Map a tRPC `query` procedure to utilities.
 */
export type QueryUtilsProcedure<T extends AnyProcedure> = {
  getQueryKey(input: inferProcedureInput<T>, type?: AnyQueryType): QueryKey

  fetch(
    input: inferProcedureInput<T>,
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> & AdditionalOptions
  ): Promise<inferProcedureOutput<T>>

  prefetch(
    input: inferProcedureInput<T>,
    opts?: FetchQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> & AdditionalOptions
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
} & MaybeInfiniteUtilsProcedure<T>

/**
 * Map a tRPC `mutation` procedure to utilities.
 */
export type MutationUtilsProcedure<T extends AnyProcedure> = TODO<T>

/**
 * Map a tRPC `subscription` procedure to utilities.
 */
export type SubscriptionUtilsProcedure<T extends AnyProcedure> = TODO<T>

/**
 * Map tRPC procedures to utilites.
 */
// prettier-ignore
export type UtilsProcedure<T> = 
  T extends Procedure<infer Type, any> ?
    Type extends 'query' ? QueryUtilsProcedure<T> : 
    Type extends 'mutation' ? MutationUtilsProcedure<T> :
    Type extends 'subscription' ? SubscriptionUtilsProcedure<T> : never 
  : never

/**
 * Properties available at all levels of utilities.
 */
type SharedUtils = {
  invalidate(filters?: InvalidateQueryFilters, opts?: InvalidateOptions): Promise<void>
}

/**
 * Inner utilities router has shared properties, but not root properties.
 */
type InnerUtilsRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerUtilsRouter<T[k]> : UtilsProcedure<T[k]>
} & SharedUtils

/**
 * Properties available at the root utilities.
 */
type RootUtilsRouter = {
  invalidate(filters?: InvalidateQueryFilters, opts?: InvalidateOptions): Promise<void>
}

/**
 * Map tRPC router to utilities router.
 */
export type UtilsRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? InnerUtilsRouter<T[k]> : UtilsProcedure<T[k]>
} & RootUtilsRouter
