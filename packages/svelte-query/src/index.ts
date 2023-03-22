import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import { createTRPCUntypedClient } from '@trpc/client'
import type { CreateTRPCClientOptions, TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import type { TRPCSvelteQueryProcedure } from './query'
import { QueryClient, createInfiniteQuery, createMutation, createQuery } from '@tanstack/svelte-query'

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

/**
 * Map all properties of a tRPC router to svelte-query methods.
 */
export type TRPCSvelteQueryRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? TRPCSvelteQueryRouter<T[k]> : TRPCSvelteQueryProcedure<T[k]>
}

function createTRPCSvelteQueryProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient
): TRPCSvelteQueryRouter<T> {
  /**
   * All the properties that TS believes to exist, actually don't exist.
   * This proxy allows dynamic access to these non-existent properties during runtime.
   */
  const proxy = createFlatProxy<TRPCSvelteQueryRouter<T>>((key) => {
    /**
     * Nested properties of the tRPC + svelte-query proxy. 
     * @example `createQuery`, `createMutation`
     */
    return createRecursiveProxy((opts) => {
      /**
       * Arguments to the desired method.
       */
      const args = opts.args;

      /**
       * The tRPC route represented as an array of strings, excluding input.
       * @example `['post', 'byId']`
       */
      const pathArray = [key, ...opts.path];

      /**
       * `createQuery`, `createMutation`, etc.
       */
      const queryMethod = pathArray.pop()

      /**
       * The tRPC route represented as a string, exluding input.
       * @example `post.byId`
       */
      const path = pathArray.join('.');

      /**
       * tRPC args are under the "trpc" key. Dynamic runtime checks are used to satisfy TS.
       */
      const trpcArgs = ('trpc' in args && typeof args.trpc === 'object' ? args.trpc : null) || {};

      const [input, ..._rest] = args;

      // the type of key to use for svelte-query methods is described here: 
      // https://github.com/ottomated/trpc-svelte-query/blob/main/src/createTRPCSvelte.ts#L165
      //
      // the type of key to use for query client methods is described here:
      // https://github.com/ottomated/trpc-svelte-query/blob/main/src/shared/utils.ts#L164

      const queryKey = getArrayQueryKey(pathArray, input, 'query')
      const infiniteQueryKey = getArrayQueryKey(pathArray, input, 'infinite')
      const anyQueryKey = getArrayQueryKey(pathArray, input, 'any')

      switch(queryMethod) {
        case 'getQueryKey':
          return queryKey

        case 'createQuery':
          return createQuery({
            ...args,
            queryKey,
            queryFn: () => client.query(path, input, trpcArgs),
          })

        case 'createMutation': 
          return createMutation({
            ...args,
            mutationKey: anyQueryKey,
            mutationFn: data => client.mutation(path, data, trpcArgs),
          })

        case 'createInfiniteQuery':
          return createInfiniteQuery({
            ...args,
            queryKey: infiniteQueryKey,
            queryFn: () => client.query(path, input, trpcArgs),
          })

        case 'fetchInfinite':
          return queryClient.fetchInfiniteQuery

        case 'prefetchInfinite':
          return queryClient.prefetchInfiniteQuery

        case 'setInfiniteData':
          return queryClient.setQueryData

        case 'getInfiniteData':
          return queryClient.setQueryData

        case 'invalidate':
          return queryClient.invalidateQueries

        case 'fetch':
          return queryClient.fetchQuery

        case 'prefetch':
          return queryClient.prefetchQuery

        case 'reset':
          return queryClient.resetQueries

        case 'cancel':
          return queryClient.cancelQueries

        case 'ensureData':
          return queryClient.ensureQueryData

        case 'setData':
          return queryClient.setQueryData

        case 'getData':
          return queryClient.getQueryData

        default:
          throw new TypeError(`trpc.${path}.${queryMethod} is not a function`);
      }
    })
  })
  return proxy
}

/**
 * Main entrypoint for creating a tRPC + svelte-query client.
 * @param opts Options for creating the client.
 * @param queryClient Initialized query client to use for the adapter.
 */
export function createTRPCSvelte<T extends AnyRouter>(
  opts: CreateTRPCClientOptions<T>,
  queryClient: QueryClient
): TRPCSvelteQueryRouter<T> {
  /**
   * An untyped tRPC client has `query`, `mutation`, etc. methods at the root,
   * and requires a full path to construct the request.
   * This is used for compatibility with the `createProxy` utilities from trpc.
   */
  const client = createTRPCUntypedClient<T>(opts)

  /**
   * Use `createFlatProxy` and `createRecursiveProxy` to allow dynamic access
   * of all tRPC routes and their corresponding svelte-query methods.
   */
  const proxy = createTRPCSvelteQueryProxy<T>(client, queryClient || new QueryClient())
  return proxy
}
