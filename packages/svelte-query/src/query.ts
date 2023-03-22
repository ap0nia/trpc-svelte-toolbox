/**
 * `query`
 * Refers to both svelte-query and a type of tRPC procedure.
 * This file maps tRPC procedures to svelte-query functions, like `createQuery`, `createMutation`.
 *
 * `context` is traditionally available after requesting `useContext` from the root.
 * @see {@link https://trpc.io/docs/reactjs/usecontext}
 */

import type { TRPCClientErrorLike } from '@trpc/client'
import type { AnyProcedure, Procedure, inferProcedureInput, inferProcedureOutput } from '@trpc/server'
import type {
  CreateQueryOptions,
  CreateQueryResult,
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  CreateMutationOptions,
  CreateMutationResult,
} from '@tanstack/svelte-query'

/**
 * An infinite query must have the "cursor" property required as input.
 * The procedure will acquire additional methods if it's an infinite query.
 */
type InfiniteQueryInput = { cursor: any }

/**
 * Additional svelte-query methods if the procedure is an infinite query.
 */
type MaybeInfiniteQueryProcedure<T extends AnyProcedure> =
  inferProcedureInput<T> extends InfiniteQueryInput
    ? {
        createInfiniteQuery: (
          input: inferProcedureInput<T>,
          opts?: CreateInfiniteQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
        ) => CreateInfiniteQueryResult
      }
    : object

/**
 * Map a tRPC `query` procedure to svelte-query methods.
 */
type TRPCQueryProcedure<T extends AnyProcedure> = {
  createQuery: (
    input: inferProcedureInput<T>,
    opts?: CreateQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ) => CreateQueryResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
} & MaybeInfiniteQueryProcedure<T>

/**
 * Map a tRPC `mutation` procedure to svelte-query methods.
 */
type TRPCMutationProcedure<T extends AnyProcedure> = {
  createMutation: (
    input: inferProcedureInput<T>,
    opts?: CreateMutationOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ) => CreateMutationResult<
    inferProcedureOutput<T>,
    TRPCClientErrorLike<T>,
    inferProcedureInput<T> /**, FIXME: context? */
  >
}

/**
 * Map a tRPC `subscription procedure to svelte-query methods.
 */
type TRPCSubscriptionProcedure<T extends AnyProcedure> = {
  createSubscription: (
    input: inferProcedureInput<T>,
    opts?: CreateQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ) => CreateQueryResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
}

/**
 * Map all tRPC procedures to svelte-query methods.
 */

// prettier-ignore
export type TRPCSvelteQueryProcedure<T> = 
  T extends Procedure<infer Type, infer _TParams> ? 
    Type extends 'query' ? TRPCQueryProcedure<T> :
    Type extends 'mutation' ? TRPCMutationProcedure<T> :
    Type extends 'subscription' ? TRPCSubscriptionProcedure<T> : never
  : never
