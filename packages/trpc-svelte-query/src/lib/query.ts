import type { TRPCClientErrorLike, TRPCRequestOptions } from '@trpc/client'
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
  CreateQueryOptions,
  CreateQueryResult,
  DefinedCreateQueryResult,
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  CreateMutationOptions,
  CreateMutationResult,
} from '@tanstack/svelte-query'
import type { CreateQueriesResult, QueriesOptions } from '@tanstack/svelte-query/build/lib/createQueries'
import type { InfiniteQueryInput, TRPCOptions } from './types'
import type { MaybeWritable } from './reactive'

type CreateTRPCQuery<T extends AnyProcedure, TPath extends string> = {
  <TInput = inferProcedureInput<T>, TOutput = inferTransformedProcedureOutput<T>>(
    input: MaybeWritable<TInput>,
    opts?: CreateQueryOptions<TOutput, TRPCClientErrorLike<T>, TOutput, [TPath, TInput]> & TRPCOptions
  ): CreateQueryResult<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>>

  <TInput = inferProcedureInput<T>, TOutput = inferTransformedProcedureOutput<T>>(
    input: MaybeWritable<TInput>,
    opts?: CreateQueryOptions<TOutput, TRPCClientErrorLike<T>, TOutput, [TPath, TInput]> & TRPCOptions
  ): DefinedCreateQueryResult<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>>
}

type CreateTRPCInfiniteQuery<T extends AnyProcedure, TPath extends String> = {
  <TInput = inferProcedureInput<T>, TOutput = inferTransformedProcedureOutput<T>, NoCursor = Omit<TInput, 'cursor'>>(
    input: MaybeWritable<NoCursor>,
    opts?: CreateInfiniteQueryOptions<TOutput, TRPCClientErrorLike<T>, TOutput, [TPath, NoCursor]> & TRPCOptions
  ): CreateInfiniteQueryResult<inferTransformedProcedureOutput<T>, TRPCClientErrorLike<T>>
}

type CreateTRPCMutation<T extends AnyProcedure> = {
  <TInput = inferProcedureInput<T>, TOutput = inferTransformedProcedureOutput<T>, TContext = unknown>(
    opts?: CreateMutationOptions<TOutput, TRPCClientErrorLike<T>, TInput, TContext> & TRPCOptions
  ): CreateMutationResult<TOutput, TRPCClientErrorLike<T>, TInput, TContext>
}

type CreateTRPCSubscriptionOptions<TOutput, TError> = {
  enabled?: boolean
  onStarted?: () => void
  onData: (data: TOutput) => void
  onError?: (err: TError) => void
}

type CreateTRPCSubscriptionProcedure<T extends AnyProcedure> = {
  <TInput = inferProcedureInput<T>, TOutput = inferTransformedProcedureOutput<T>>(
    input: TInput,
    opts?: TRPCRequestOptions & CreateTRPCSubscriptionOptions<TOutput, TRPCClientErrorLike<T>>
  ): void
}

type QueryProcedure<TProcedure extends AnyProcedure, TPath extends string> = {
  createQuery: CreateTRPCQuery<TProcedure, TPath>
} & (inferProcedureInput<TProcedure> extends InfiniteQueryInput ? CreateTRPCInfiniteQuery<TProcedure, TPath> : object)

type MutationProcedure<T extends AnyProcedure> = {
  createMutation: CreateTRPCMutation<T>
}

type SubscriptionProcedure<T extends AnyProcedure> = {
  createSubscription: CreateTRPCSubscriptionProcedure<T>
}

export type CreateQueries<T extends AnyRouter> = <Options extends unknown[]>(
  callback: (t: TRPCSvelteQueryRouter<T>) => readonly [...QueriesOptions<Options>]
) => CreateQueriesResult<Options>

// prettier-ignore
type TRPCSvelteQueryProcedure<TProcedure, TPath extends string> = 
  TProcedure extends AnyQueryProcedure ? QueryProcedure<TProcedure, TPath> :
  TProcedure extends AnyMutationProcedure ? MutationProcedure<TProcedure> :
  TProcedure extends AnySubscriptionProcedure ? SubscriptionProcedure<TProcedure> : never

export type TRPCSvelteQueryRouter<T extends AnyRouter, TPath extends string = ''> = {
  [k in keyof T]: T[k] extends AnyRouter
    ? TRPCSvelteQueryRouter<T[k]['_def']['record'], `${TPath}${k & string}`>
    : TRPCSvelteQueryProcedure<T[k], TPath>
}
