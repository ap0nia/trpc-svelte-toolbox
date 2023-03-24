/**
 * Identifies known query types.
 */
export type QueryType = 'query' | 'infinite'

/**
 * Unknown query types can be indicated with "any".
 */
export type AnyQueryType = QueryType | 'any'

/**
 * Format of keys used to identify queries in the QueryClient.
 */
export type QueryKey = [string[]?, { input?: unknown; type?: QueryType }?]

/**
 * Translate methods to `AnyQueryType`.
 */
export const methodToQueryType: Record<string, AnyQueryType> = {
  getQueryKey: 'any',
  createQuery: 'query',
  createInfiniteQuery: 'infinite',
  invalidate: 'any',
  prefetch: 'query',
  prefetchInfinite: 'infinite',
  fetch: 'query',
  fetchInfinite: 'infinite',
  refetch: 'any',
  cancel: 'any',
  reset: 'any',
  setData: 'query',
  setInfiniteData: 'infinite',
  getData: 'query',
  getInfiniteData: 'infinite',
}

/**
 * Construct a `QueryKey` that is easy to destructure and flexible for partial selecting
 * to easily control groups of related queries, e.g. invalidating all queries of a router.
 * Use an array as the path when storing in tanstack query.
 * @see {@link https://github.com/trpc/trpc/issues/3128}
 *
 * @remarks This function doesn't need to convert legacy formats, unlike the one from react-query.
 *
 * @param path The tRPC path represented as a string array.
 * @param input The query input.
 * @param method The svelte-query method. i.e. The last key found during a `recursiveProxy`.
 */
export function getQueryKey(pathArray: string[], input: unknown, method: string): QueryKey {
  const type = methodToQueryType[method]

  /**
   * Mutations don't have input because they return a function that will accept input.
   * They only have options, which aren't used for the query key.
   */
  const hasInput = typeof input !== 'undefined' && !method.toLowerCase().includes('mutation')
  const hasType = type && type !== 'any'

  /**
   * For `utils.invalidate()` to match all queries (including vanilla react-query),
   * we don't want nested array if path is empty, i.e. `[]` instead of `[[]]`.
   */
  if (!hasInput && !hasType) return pathArray.length ? [pathArray] : []

  return [pathArray, { ...(hasInput && { input }), ...(hasType && { type }) }]
}
