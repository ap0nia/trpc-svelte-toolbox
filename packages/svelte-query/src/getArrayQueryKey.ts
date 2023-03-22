type QueryType = 'query' | 'infinite' | 'any'

type QueryKey = [string[], { input?: unknown; type?: Exclude<QueryType, 'any'> }?]

/**
 * the type of key to use for svelte-query methods is described here:
 * @see {@link https://github.com/ottomated/trpc-svelte-query/blob/main/src/createTRPCSvelte.ts#L165}
 *
 * the type of key to use for query client methods is described here:
 * @see {@link https://github.com/ottomated/trpc-svelte-query/blob/main/src/shared/utils.ts#L164}
 */

export const methodToQueryType: Record<string, QueryType> = {
  getQueryKey: 'any',
  query: 'query',
  mutation: 'any',
  infiniteQuery: 'infinite',
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
 * Construct a query key that is easy to destructure and flexible for partial selecting etc.
 * To allow easy interactions with groups of related queries,
 * such as invalidating all queries of a router,
 * we use an array as the path when storing in tanstack query.
 * @see {@link https://github.com/trpc/trpc/issues/3128}
 *
 * @remarks This function doesn't need to convert legacy formats, unlike the one from react-query.
 */
export function getArrayQueryKey(pathArray: string[], input: unknown, method: string): QueryKey {
  const type = methodToQueryType[method]

  const hasInput = typeof input !== 'undefined'
  const hasType = type && type !== 'any'

  if (!hasInput && !hasType)
    /**
     * For `utils.invalidate()` to match all queries (including vanilla react-query),
     * we don't want nested array if path is empty, i.e. `[]` instead of `[[]]`.
     */
    return pathArray.length ? [pathArray] : ([] as unknown as QueryKey)

  return [pathArray, { ...(hasInput && { input: input }), ...(hasType && { type: type }) }]
}
