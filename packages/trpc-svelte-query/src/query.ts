/**
 * `query`
 * Refers to both svelte-query and a type of tRPC procedure.
 * This file maps tRPC procedures to svelte-query functions,
 * e.g. `query` to `createQuery`, `mutation` to `createMutation`, etc.
 */

import type { TRPCClientError, TRPCClientErrorLike, TRPCRequestOptions } from '@trpc/client'
import type { TRPCSubscriptionObserver } from '@trpc/client/dist/internals/TRPCUntypedClient'
import type {
  AnyProcedure,
  Procedure,
  ProcedureParams,
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

/**
 * Additional tRPC options can be under a `tRPC` property.
 */
type AdditionalOptions = { trpc?: TRPCRequestOptions }

/**
 * Infinite queries must have the "cursor" property in the input.
 */
type InfiniteQueryInput = { cursor?: unknown }

/**
 * Additional svelte-query methods available to infinite queries.
 */
type MaybeInfiniteQueryProcedure<T extends AnyProcedure> =
  inferProcedureInput<T> extends InfiniteQueryInput
    ? {
        createInfiniteQuery: (
          input: inferProcedureInput<T>,
          opts?: CreateInfiniteQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> &
            AdditionalOptions
        ) => CreateInfiniteQueryResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
      }
    : object

/**
 * Map a tRPC `query` procedure to svelte-query methods.
 */
type TRPCQueryProcedure<T extends AnyProcedure> = {
  createQuery: (
    input: inferProcedureInput<T>,
    opts?: CreateQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>> & AdditionalOptions
  ) => CreateQueryResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
} & MaybeInfiniteQueryProcedure<T>

/**
 * Map a tRPC `mutation` procedure to svelte-query methods.
 */
type TRPCMutationProcedure<T extends AnyProcedure> = {
  createMutation: (
    opts?: CreateMutationOptions<
      inferProcedureOutput<T>,
      TRPCClientErrorLike<T>,
      inferProcedureInput<T>
    > &
      AdditionalOptions
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
// prettier-ignore
export type TRPCSvelteQueryProcedure<T> = 
  T extends Procedure<infer Type, ProcedureParams> ? 
    Type extends 'query' ? TRPCQueryProcedure<T> :
    Type extends 'mutation' ? TRPCMutationProcedure<T> :
    Type extends 'subscription' ? TRPCSubscriptionProcedure<T> : 'Unknown procedure type'
  : never
