type QueryType = 'query' | 'infinite' | 'any';

type QueryKey = [
	string[],
	{ input?: unknown; type?: Exclude<QueryType, 'any'> }?,
];

/**
 * Construct a query key that is easy to destructure and flexible for partial selecting etc.
 * To allow easy interactions with groups of related queries, 
 * such as invalidating all queries of a router,
 * we use an array as the path when storing in tanstack query.
 * @see {@link https://github.com/trpc/trpc/issues/3128}
 * 
 * @remarks This function doesn't need to convert legacy formats, unlike the one from react-query.
 */
export function getArrayQueryKey(path: string[], input: unknown, type: QueryType): QueryKey {
	const hasInput = typeof input !== 'undefined';
	const hasType = type && type !== 'any';

  if (!hasInput && !hasType)
    /**
     * For `utils.invalidate()` to match all queries (including vanilla react-query),
     * we don't want nested array if path is empty, i.e. `[]` instead of `[[]]`.
     */
    return path.length ? [path] : ([] as unknown as QueryKey);

  return [
    path, 
    { ...(hasInput && { input: input }), ...(hasType && { type: type }) },
  ];
}

