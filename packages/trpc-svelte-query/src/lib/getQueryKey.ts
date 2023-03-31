export type QueryType = 'query' | 'infinite'

export type QueryKey = [string[]?, { input?: unknown; type?: QueryType }?]

const MethodQueryTypes: Record<string, QueryType> = {
  getQueryKey: 'query',
  fetch: 'query',
  prefetch: 'query',
  getData: 'query',
  ensureData: 'query',
  setData: 'query',
  getState: 'query',
  isFetching: 'query',
  createQuery: 'query',

  getInfiniteQueryKey: 'infinite',
  fetchInfinite: 'infinite',
  prefetchInfinite: 'infinite',
  getInfiniteData: 'infinite',
  ensureInfiniteData: 'infinite',
  setInfiniteData: 'infinite',
  getInfiniteState: 'infinite',
  createInfiniteQuery: 'infinite',
}

const MethodInputs = Object.keys(MethodQueryTypes)

export function getQueryKey(pathArray: string[], input: unknown, method: string): QueryKey {
  const hasInput = typeof input !== 'undefined' && MethodInputs.includes(method)

  const type = MethodQueryTypes[method]

  const hasType = Boolean(type)

  if (!hasInput && !hasType) return pathArray.length > 0 ? [pathArray] : []

  return [pathArray, { ...(hasInput && { input }), ...(hasType && { type }) }]
}
