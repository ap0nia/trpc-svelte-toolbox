import type { TRPCOptions } from '$lib'
import { getQueryKeyInternal } from '$lib/query-key/getQueryKey'
import type { CreateQueryOptions } from '@tanstack/svelte-query'
import type {
  CreateQueriesResult,
  QueriesOptions,
} from '@tanstack/svelte-query/build/lib/createQueries'
import type { TRPCClientErrorLike, TRPCUntypedClient } from '@trpc/client'
import type { AnyProcedure, AnyQueryProcedure, AnyRouter, inferProcedureInput } from '@trpc/server'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import type { inferTransformedProcedureOutput } from '@trpc/server/shared'

type CreateQueriesProcedure<
  T extends AnyProcedure,
  TPath extends string,
  TInput = inferProcedureInput<T>,
  TOutput = inferTransformedProcedureOutput<T>,
  TError = TRPCClientErrorLike<T>
> = (
  input: TInput,
  opts?: CreateQueryOptions<TOutput, TError, TOutput, [TPath, TInput]> & TRPCOptions
) => CreateQueryOptions<TOutput, unknown, TOutput, [TPath, TInput]>

type TRPCSvelteQueriesProcedure<
  TProcedure,
  TPath extends string
> = TProcedure extends AnyQueryProcedure ? CreateQueriesProcedure<TProcedure, TPath> : never

export type TRPCSvelteQueriesRouter<TRouter extends AnyRouter, TPath extends string = ''> = {
  [k in keyof TRouter]: TRouter[k] extends AnyRouter
    ? TRPCSvelteQueriesRouter<TRouter[k]['_def']['record'], `${TPath}${k & string}`>
    : TRPCSvelteQueriesProcedure<TRouter[k], TPath>
}

export type CreateQueries<T extends AnyRouter> = <Options extends unknown[]>(
  callback: (t: TRPCSvelteQueriesRouter<T>) => readonly [...QueriesOptions<Options>]
) => CreateQueriesResult<Options>

export function createTRPCQueriesProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
): TRPCSvelteQueriesRouter<T> {
  const innerProxy = createRecursiveProxy((options) => {
    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const path = pathCopy.join('.')

    const [input, ...rest] = anyArgs

    const queryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, input, 'query'),
      queryFn: async (_context) =>
        await client.query(path, input, {
          ...rest?.trpc,
        }),
      ...rest,
    } satisfies CreateQueryOptions

    return queryOptions

  }) as TRPCSvelteQueriesRouter<T>

  const proxy = createFlatProxy<TRPCSvelteQueriesRouter<T>>(initialKey => innerProxy[initialKey])

  return proxy
}
