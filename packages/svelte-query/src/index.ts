import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import { CreateTRPCProxyClient, createTRPCProxyClient, createTRPCUntypedClient } from '@trpc/client'
import {
  CreateInfiniteQueryOptions,
  CreateMutationOptions,
  CreateQueryOptions,
  QueryClient,
  createInfiniteQuery,
  createMutation,
  createQuery,
} from '@tanstack/svelte-query'
import type { CreateTRPCClientOptions, TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getArrayQueryKey } from './getArrayQueryKey'
import type { TRPCSvelteQueryProcedure } from './query'

/**
 * Additional properties at the root of the tRPC + svelte-query proxy.
 */
type RootProperties<T extends AnyRouter> = {
  client: CreateTRPCProxyClient<T>
}

/**
 * Map all properties of a tRPC router to svelte-query methods.
 */
export type TRPCSvelteQueryRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? TRPCSvelteQueryRouter<T[k]> : TRPCSvelteQueryProcedure<T[k]>
} & RootProperties<T>

/**
 * Create a tRPC + svelte-query proxy.
 */
function createTRPCSvelteQueryProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  proxyClient: CreateTRPCProxyClient<T>,
  queryClient: QueryClient
): TRPCSvelteQueryRouter<T> {
  /**
   * All the properties that TS believes to exist, actually don't exist.
   * This proxy allows dynamic access to these non-existent properties during runtime.
   */
  const proxy = createFlatProxy<TRPCSvelteQueryRouter<T>>((key) => {
    if (key === 'client') return proxyClient

    /**
     * Access nested properties of the tRPC + svelte-query proxy via the recursive proxy.
     * @example `createQuery`, `createMutation`
     */
    return createRecursiveProxy((opts) => {
      /**
       * Depending on the call, args can vary.
       * Check the type definition of the function and index accordingly.
       *
       * @example
       * `createQuery` accepts 1 argument, so use args[0] for input
       * `setData` accepts 2 arguments, so use args[0] for input and args[1] for params
       *
       * @remarks only svelte-query options are currently available,
       * but they're passed into the tRPC method as a "proof of concept".
       */
      const args: any = opts.args

      /**
       * The tRPC route represented as an array of strings, excluding input.
       * @example `['post', 'byId']`
       */
      const pathArray = [key, ...opts.path]

      /**
       * @example `createQuery`, `createMutation`, etc.
       */
      const method = pathArray.pop() ?? ''

      /**
       * The query key used for caching with svelte-query.
       * @example [ [...pathArray], { input, type } ]
       */
      const queryKey = getArrayQueryKey(pathArray, args[0], method)

      /**
       * The tRPC route represented as a string, exluding input.
       * @example `post.byId`
       */
      const path = pathArray.join('.')

      const fetchArgs: CreateQueryOptions = {
        ...args[1],
        queryKey,
        queryFn: () => client.query(path, args[0], args[1]),
      }

      const mutationArgs: CreateMutationOptions = {
        ...args[0],
        mutationKey: [pathArray],
        mutationFn: (data) => client.mutation(path, data, args[0]),
      }

      const fetchInfiniteArgs: CreateInfiniteQueryOptions = {
        ...args[1],
        queryKey,
        queryFn: ({ pageParam }) => client.query(path, { ...args[0], cursor: pageParam }, args[1]),
      }

      switch (method) {
        case 'getQueryKey':
          return getArrayQueryKey(pathArray, args[0], args[1] ?? 'any')

        case 'createQuery':
          return createQuery(fetchArgs)

        case 'createMutation':
          return createMutation(mutationArgs)

        case 'createInfiniteQuery':
          return createInfiniteQuery(fetchInfiniteArgs)

        /** TODO: createSubscription */
        case 'createSubscription':
          break

        case 'fetchInfinite':
          return queryClient.fetchInfiniteQuery(fetchInfiniteArgs)

        case 'prefetchInfinite':
          return queryClient.prefetchInfiniteQuery(fetchInfiniteArgs)

        case 'setInfiniteData':
          return queryClient.setQueryData(queryKey, args[0], args[1])

        case 'getInfiniteData':
          return queryClient.getQueryData(queryKey, ...args)

        case 'fetch':
          return queryClient.fetchQuery(fetchArgs)

        case 'prefetch':
          return queryClient.prefetchQuery(fetchArgs)

        case 'invalidate':
          return queryClient.invalidateQueries(queryKey, ...args)

        case 'reset':
          return queryClient.resetQueries(queryKey, ...args)

        case 'cancel':
          return queryClient.cancelQueries(queryKey, ...args)

        case 'ensureData':
          return queryClient.ensureQueryData(queryKey, ...args)

        case 'setData':
          return queryClient.setQueryData(queryKey, args[0], args[1])

        case 'getData':
          return queryClient.getQueryData(queryKey, ...args)

        default:
          throw new TypeError(`trpc.${path}.${method} is not a function`)
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
  const untypedClient = createTRPCUntypedClient<T>(opts)

  /**
   * The `proxyClient` is a native tRPC client without the svelte-query integration.
   * Can be accessed via `proxy.client`
   */
  const proxyClient = createTRPCProxyClient<T>(opts)

  /**
   * Use `createFlatProxy` and `createRecursiveProxy` to allow dynamic access
   * of all tRPC routes and their corresponding svelte-query methods.
   */
  const proxy = createTRPCSvelteQueryProxy<T>(untypedClient, proxyClient, queryClient)
  return proxy
}
