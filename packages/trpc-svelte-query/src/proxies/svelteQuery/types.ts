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
import type { MaybeWritable } from '../../extensions/createReactiveQuery'

export interface TRPCOptions {
  trpc?: Omit<TRPCRequestOptions, 'signal'> & { abortOnUnmount?: boolean }
}

interface InfiniteQueryInput {
  cursor?: unknown
}

interface CreateTRPCQuery<
  T extends AnyProcedure,
  TPath extends string,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> {
  (
    input: MaybeWritable<TInput>,
    opts?: CreateQueryOptions<TOutput, TError, TOutput, [TPath, TInput]> & TRPCOptions
  ): CreateQueryResult<TOutput, TError>

  (
    input: MaybeWritable<TInput>,
    opts?: CreateQueryOptions<TOutput, TError, TOutput, [TPath, TInput]> & TRPCOptions
  ): DefinedCreateQueryResult<TOutput, TError>
}

type CreateTRPCInfiniteQuery<
  T extends AnyProcedure,
  TPath extends string,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>,
  NoCursor = Omit<TInput, 'cursor'>
> = (
  input: MaybeWritable<NoCursor>,
  opts?: CreateInfiniteQueryOptions<TOutput, TError, TOutput, [TPath, NoCursor]> & TRPCOptions
) => CreateInfiniteQueryResult<TOutput, TError>

type CreateTRPCMutation<
  T extends AnyProcedure,
  TContext = unknown,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = (
  opts?: CreateMutationOptions<TOutput, TError, TInput, TContext> & TRPCOptions
) => CreateMutationResult<TOutput, TError, TInput, TContext>

interface CreateTRPCSubscriptionOptions<TOutput, TError> {
  enabled?: boolean
  onStarted?: () => void
  onData: (data: TOutput) => void
  onError?: (err: TError) => void
}

type CreateTRPCSubscription<
  T extends AnyProcedure,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = (
  input: TInput,
  opts?: TRPCRequestOptions & CreateTRPCSubscriptionOptions<TOutput, TError>
) => void

type QueryProcedure<TProcedure extends AnyProcedure, TPath extends string> = {
  createQuery: CreateTRPCQuery<TProcedure, TPath>
} & (inferProcedureInput<TProcedure> extends InfiniteQueryInput
  ? CreateTRPCInfiniteQuery<TProcedure, TPath>
  : object)

interface MutationProcedure<T extends AnyProcedure> {
  createMutation: CreateTRPCMutation<T>
}

interface SubscriptionProcedure<T extends AnyProcedure> {
  createSubscription: CreateTRPCSubscription<T>
}

// prettier-ignore
type SvelteQueryProcedure<TProcedure, TPath extends string> = 
  TProcedure extends AnyQueryProcedure ? QueryProcedure<TProcedure, TPath> :
  TProcedure extends AnyMutationProcedure ? MutationProcedure<TProcedure> :
  TProcedure extends AnySubscriptionProcedure ? SubscriptionProcedure<TProcedure> : never

export type SvelteQueryProxy<TRouter extends AnyRouter, TPath extends string = ''> = {
  [k in keyof TRouter]: TRouter[k] extends AnyRouter
    ? SvelteQueryProxy<TRouter[k]['_def']['record'], `${TPath}${k & string}`>
    : SvelteQueryProcedure<TRouter[k], TPath>
}
