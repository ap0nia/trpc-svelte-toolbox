/**
 * `query`
 * Refers to both svelte-query and a type of tRPC procedure.
 * This file maps tRPC procedures to svelte-query functions,
 * e.g. `query` to `createQuery`, `mutation` to `createMutation`, etc.
 */

// import type { Writable } from 'svelte/store'
import type { TRPCClientError, TRPCClientErrorLike, TRPCRequestOptions } from '@trpc/client'
import type { TRPCSubscriptionObserver } from '@trpc/client/dist/internals/TRPCUntypedClient'
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  AnySubscriptionProcedure,
  inferProcedureInput,
  inferProcedureOutput,
} from '@trpc/server'
import type { Unsubscribable } from '@trpc/server/observable'
import type { inferTransformedSubscriptionOutput } from '@trpc/server/shared'
import type {
  CreateQueryOptions,
  CreateQueryResult,
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  CreateMutationOptions,
  CreateMutationResult,
} from '@tanstack/svelte-query'
import type { InfiniteQueryInput, TRPCOptions } from './types'

/**
 * Whether the object is a svelte store.
 */
// export const isWritable = <T>(obj: object): obj is Writable<T> => 'subscribe' in obj && 'set' in obj && 'update' in obj

/**
 * Additional svelte-query methods available to infinite queries.
 */
type MaybeInfiniteQueryProcedure<T extends AnyProcedure> = inferProcedureInput<T> extends InfiniteQueryInput
  ? {
      createInfiniteQuery: (
        input: inferProcedureInput<T>,
        opts?: CreateInfiniteQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
      ) => CreateInfiniteQueryResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
    }
  : object

/**
 * Map a tRPC `query` procedure to svelte-query methods.
 */
type TRPCQueryProcedure<T extends AnyProcedure> = {
  createQuery: (
    input: inferProcedureInput<T>,
    opts?: CreateQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> & TRPCOptions
  ) => CreateQueryResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
} & MaybeInfiniteQueryProcedure<T>

/**
 * Map a tRPC `mutation` procedure to svelte-query methods.
 */
type TRPCMutationProcedure<T extends AnyProcedure> = {
  createMutation: (
    opts?: CreateMutationOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>, inferProcedureInput<T>> & TRPCOptions
  ) => CreateMutationResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>, inferProcedureInput<T>>
}

/**
 * Map a tRPC `subscription` procedure to svelte-query methods.
 */
type TRPCSubscriptionProcedure<T extends AnyProcedure> = {
  createSubscription: (
    input: inferProcedureInput<T>,
    opts?: TRPCRequestOptions &
      Partial<TRPCSubscriptionObserver<inferTransformedSubscriptionOutput<T>, TRPCClientError<T>>>
  ) => Unsubscribable
}

/**
 * Map tRPC procedure to svelte-query methods.
 */
type TRPCSvelteQueryProcedure<T> = T extends AnyQueryProcedure
  ? TRPCQueryProcedure<T>
  : T extends AnyMutationProcedure
  ? TRPCMutationProcedure<T>
  : T extends AnySubscriptionProcedure
  ? TRPCSubscriptionProcedure<T>
  : never

/**
 * Convert tRPC router to trpc + svelte-query router. This is the shape of the proxy.
 */
export type TRPCSvelteQueryRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? TRPCSvelteQueryRouter<T[k]> : TRPCSvelteQueryProcedure<T[k]>
}

/**
 * Parses an array to extract its types.
 * @internal
 */
type ParseArray<Left extends unknown[], Right extends unknown[] = []> = Left extends []
  ? []
  : Left extends [infer Head]
  ? [...Right, Head]
  : Left extends [infer Head, ...infer Tail]
  ? ParseArray<Tail, [...Right, Head]>
  : Left

/**
 * Explicitly type each create query result.
 * @internal
 */
type QueriesResults<T> = {
  [k in keyof T]: T[k] extends CreateQueryResult<infer TOutput, infer TError>
    ? CreateQueryResult<TOutput, TError>
    : never
}

/**
 * Create multiple queries.
 */
export type CreateQueries<T extends AnyRouter> = <Queries extends unknown[]>(
  callback: (t: TRPCSvelteQueryRouter<T>) => readonly [...ParseArray<Queries>]
) => QueriesResults<Queries>
