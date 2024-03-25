import type { Readable } from 'svelte/store'

import type { CreateQueryOptions, StoreOrVal } from '@tanstack/svelte-query'
import type { QueriesOptions, QueriesResults } from '@tanstack/svelte-query/dist/createQueries'
import type { TRPCClientErrorLike, TRPCRequestOptions } from '@trpc/client'
import type { AnyProcedure, AnyQueryProcedure, AnyRouter, inferProcedureInput } from '@trpc/server'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'

interface TRPCOptions {
  trpc?: Omit<TRPCRequestOptions, 'signal'> & { abortOnUnmount?: boolean }
}

type CreateQueriesProcedure<
  T extends AnyProcedure,
  TPath extends string,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = (
  input: TInput,
  opts?: Partial<CreateQueryOptions<TOutput, TError, TOutput, [TPath, TInput]> & TRPCOptions>
) => CreateQueryOptions<TOutput, unknown, TOutput, [TPath, TInput]>

export type CreateQueriesProxy<TRouter extends AnyRouter, TPath extends string = ''> = {
  [k in keyof TRouter]: TRouter[k] extends AnyRouter
    ? CreateQueriesProxy<TRouter[k], `${TPath}${k & string}`>
    : TRouter[k] extends AnyQueryProcedure
    ? CreateQueriesProcedure<TRouter[k], TPath>
    : never
}

export type CreateQueriesFn<T extends AnyRouter> = <
  TData extends any[],
  TCombinedResult = QueriesResults<TData>
>(
  callback: (t: CreateQueriesProxy<T>) => {
    queries: StoreOrVal<[...QueriesOptions<TData>]>
    combine?: (result: QueriesResults<TData>) => TCombinedResult
  }
) => Readable<TCombinedResult>
