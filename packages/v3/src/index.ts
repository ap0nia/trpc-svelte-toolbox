import { initTRPC } from '@trpc/server'
import type { TRPCClientErrorLike } from '@trpc/client'
import type { AnyRouter, AnyProcedure, Procedure, inferProcedureInput, inferProcedureOutput } from '@trpc/server'
import type { 
  InvalidateQueryFilters,
  InvalidateOptions,
  CreateQueryOptions,
  CreateQueryResult,
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  CreateMutationOptions,
  CreateMutationResult,
  FetchQueryOptions,
  ResetOptions,
  ResetQueryFilters,
  QueryFilters,
  Updater,
} from '@tanstack/svelte-query'

const t = initTRPC.create()

const router = t.router({
  a: t.procedure.query(() => 1),
  b: t.procedure.mutation(() => 'yeet'),
  c: t.router({
    d: t.procedure.query(() => 'yeet'),
    e: t.procedure.mutation(() => 'yeet'),
  })
})

type Router = typeof router

/**
 * An infinite query must have the "cursor" property required as input.
 * The procedure will acquire additional methods if it's an infinite query.
 */
type InfiniteQueryInput = { cursor: any }

/**
 * Utilities from "context" for infinite queries.
 */
type MaybeInfiniteUtils<T extends AnyProcedure> = inferProcedureInput<T> extends InfiniteQueryInput ? {
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
type QueryUtils<T extends AnyProcedure> = {
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
} & MaybeInfiniteUtils<T>

/**
 * Additional svelte-query methods if the procedure is an infinite query.
 */
type MaybeInfiniteQuery<T extends AnyProcedure> = inferProcedureInput<T> extends InfiniteQueryInput ? {
  createInfiniteQuery: (
    input: inferProcedureInput<T>,
    opts?: CreateInfiniteQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ) => CreateInfiniteQueryResult
} : object

/**
 * Map a tRPC query procedure to svelte-query methods.
 * A query will always have a "createQuery", and maybe "createInfiniteQuery".
 */
type TrpcQuery<T extends AnyProcedure> = {
  createQuery: (
    input: inferProcedureInput<T>,
    opts?: CreateQueryOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ) => CreateQueryResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
} & MaybeInfiniteQuery<T> & QueryUtils<T>

/**
 * Map a tRPC mutation procedure to svelte-query methods.
 */
type TrpcMutation<T extends AnyProcedure> = {
  createMutation: (
    input: inferProcedureInput<T>,
    opts?: CreateMutationOptions<inferProcedureOutput<T>, TRPCClientErrorLike<T>>
  ) => CreateMutationResult<inferProcedureOutput<T>, TRPCClientErrorLike<T>, inferProcedureInput<T> /**, FIXME: context? */ >
}

/**
 * Map a tRPC procedure to a svelte-query methods.
 */
type ToTanstack<T> = 
  T extends Procedure<infer Type, infer _TParams> ? 
    Type extends 'query' ? TrpcQuery<T> :
    Type extends 'mutation' ? TrpcMutation<T> :
    never : never

/**
 * Map all properties of a tRPC router to svelte-query methods.
 */
type TanstackRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? TanstackRouter<T[k]> : ToTanstack<T[k]>
} & RootMethods

/**
 */
type RootMethods = {
  context: any
}


//----------------------------------------------------------------------------------
// testing
//----------------------------------------------------------------------------------

type Test = TanstackRouter<Router>

let test: Test

let x = test.a.createQuery(undefined, {})
