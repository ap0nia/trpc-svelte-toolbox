import type { AnyProcedure, AnyRouter, DeepPartial } from '@trpc/server'
import type { QueryProcedure } from '../proxies/svelteQuery'

interface InfiniteQueryInput {
  cursor?: unknown
}

export type KnownQueryType = 'query' | 'infinite'

export type QueryType = 'query' | 'infinite' | 'any'

export type QueryKey = [string[]?, { input?: unknown; type?: KnownQueryType }?]

export type GetQueryProcedureInput<TProcedureInput> = TProcedureInput extends InfiniteQueryInput
  ? keyof Omit<TProcedureInput, 'cursor'> extends never
    ? undefined
    : DeepPartial<Omit<TProcedureInput, 'cursor'>> | undefined
  : DeepPartial<TProcedureInput> | undefined

export type QueryKeyKnown<TInput, TType extends Exclude<QueryType, 'any'>> = [
  string[],
  { input?: GetQueryProcedureInput<TInput>; type: TType }?
]

/**
 * Create a query key, usually within a `recursiveProxy`.
 */
export function getQueryKeyInternal(
  pathArray: string[],
  input?: unknown,
  type?: QueryType
): QueryKey {
  const hasInput = typeof input !== 'undefined'
  const hasType = Boolean(type) && type !== 'any'

  if (!hasInput && !hasType) return pathArray.length > 0 ? [pathArray] : []
  return [pathArray, { ...(hasInput && { input }), ...(hasType && { type }) }]
}

/**
 * Public API for getting a query key from a procedure or router.
 * The `svelteQueryProxy` returns a path array when `_def()` is called, not indicated by type definitions.
 */
export function getQueryKey<T extends AnyProcedure | AnyRouter | QueryProcedure<any, any>>(
  procedureOrRouter: T,
  input?: unknown,
  type: QueryType = 'any'
): QueryKey {
  // eslint-disable-next-line no-underscore-dangle
  const path = (procedureOrRouter as any)._def()
  const queryKey = getQueryKeyInternal(path, input, type)
  return queryKey
}
