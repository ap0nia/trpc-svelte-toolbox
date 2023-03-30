/**
 * `query`
 *
 * Refers to both svelte-query and a type of tRPC procedure.
 * The tRPC router and its procedures are translated to svelte-query methods.
 * e.g. `query` to `createQuery`, `mutation` to `createMutation`, etc.
 */

import type { TRPCClientError, TRPCClientErrorLike, TRPCRequestOptions } from '@trpc/client'
import type { TRPCSubscriptionObserver } from '@trpc/client/dist/internals/TRPCUntypedClient'
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  AnySubscriptionProcedure,
  inferProcedureInput,
} from '@trpc/server'
import type { Unsubscribable } from '@trpc/server/observable'
import type { inferTransformedProcedureOutput, inferTransformedSubscriptionOutput } from '@trpc/server/shared'
import type {
  CreateQueryOptions,
  CreateQueryResult,
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  CreateMutationOptions,
  CreateMutationResult,
} from '@tanstack/svelte-query'
import type { CreateQueriesResult, QueriesOptions } from '@tanstack/svelte-query/build/lib/createQueries'
import type { InfiniteQueryInput, TRPCOptions } from './types'
import type { MaybeWritable } from './reactive'

/**
 * Map a tRPC `query` procedure to svelte-query methods.
 */
type TRPCQueryProcedure<T extends AnyProcedure> = {
  createQuery: (
    input: MaybeWritable<inferProcedureInput<T>>,
    opts?: CreateQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
  ) => CreateQueryResult<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>>

  /**
   * Used inside `createQueries` to get options for each query.
   */
  createOptions: (
    input: MaybeWritable<inferProcedureInput<T>>,
    opts?: CreateQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
  ) => CreateQueryOptions<inferTransformedProcedureOutput<T>>
} & MaybeInfiniteQueryProcedure<T>

/**
 * Additional svelte-query methods available to infinite queries.
 */
type MaybeInfiniteQueryProcedure<T extends AnyProcedure> = inferProcedureInput<T> extends InfiniteQueryInput
  ? {
      createInfiniteQuery: (
        input: MaybeWritable<inferProcedureInput<T>>,
        opts?: CreateInfiniteQueryOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
      ) => CreateInfiniteQueryResult<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>>
    }
  : object

/**
 * Map a tRPC `mutation` procedure to svelte-query methods.
 */
interface TRPCMutationProcedure<T extends AnyProcedure> {
  createMutation: (
    opts?: CreateMutationOptions<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>, inferProcedureInput<T>> &
      TRPCOptions
  ) => CreateMutationResult<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>, inferProcedureInput<T>>
}

/**
 * Map a tRPC `subscription` procedure to svelte-query methods.
 */
interface TRPCSubscriptionProcedure<T extends AnyProcedure> {
  createSubscription: (
    input: inferProcedureInput<T>,
    opts?: TRPCRequestOptions &
      Partial<TRPCSubscriptionObserver<inferTransformedSubscriptionOutput<T>, TRPCClientError<T>>>
  ) => Unsubscribable
}

/**
 * Map a tRPC procedure to svelte-query methods.
 */
// prettier-ignore
type TRPCSvelteQueryProcedure<T> = 
  T extends AnyQueryProcedure ? TRPCQueryProcedure<T> :
  T extends AnyMutationProcedure ? TRPCMutationProcedure<T> :
  T extends AnySubscriptionProcedure ? TRPCSubscriptionProcedure<T> : never

/**
 * Convert tRPC router to tRPC + svelte-query router.
 */
export type TRPCSvelteQueryRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? TRPCSvelteQueryRouter<T[k]> : TRPCSvelteQueryProcedure<T[k]>
}

/**
 * Create multiple tRPC queries.
 */
export type CreateQueries<T extends AnyRouter> = <Options extends unknown[]>(
  callback: (t: TRPCSvelteQueryRouter<T>) => readonly [...QueriesOptions<Options>]
) => CreateQueriesResult<Options>
