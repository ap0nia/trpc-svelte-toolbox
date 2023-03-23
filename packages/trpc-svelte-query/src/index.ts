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
import { getArrayQueryKey } from './getQueryKey'
import type { TRPCSvelteQueryProcedure } from './query'
import type { UtilsRouter } from './utils'

/**
 * Properties available at the tRPC + svelte-query proxy root.
 */
type TRPCSvelteQueryProxyRoot<T extends AnyRouter> = {
  /**
   * tRPC proxy client that can be used to directly invoke request procedures.
   */
  client: CreateTRPCProxyClient<T>

  /**
   * The QueryClient instance.
   */
  queryClient: QueryClient

  /**
   * Shadows the entire proxy, provides additional methods for greater control over queries.
   */
  utils: UtilsRouter<T>
}

/**
 * tRPC + svelte-query proxy without root properties.
 */
export type InnerTRPCSvelteQueryProxy<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter
    ? InnerTRPCSvelteQueryProxy<T[k]>
    : TRPCSvelteQueryProcedure<T[k]>
}

/**
 * Map a tRPC router to a tRPC + svelte-query proxy.
 */
export type TRPCSvelteQueryProxy<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter
    ? InnerTRPCSvelteQueryProxy<T[k]>
    : TRPCSvelteQueryProcedure<T[k]>
} & TRPCSvelteQueryProxyRoot<T>

/**
 * Create a tRPC + svelte-query proxy.
 */
function createTRPCSvelteQueryProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  proxyClient: CreateTRPCProxyClient<T>,
  queryClient: QueryClient
): TRPCSvelteQueryProxy<T> {
  /**
   * The properties defined by TS don't actually exist during runtime.
   * This proxy facilitates dynamic access to these non-existent properties.
   */
  const proxy = createFlatProxy<TRPCSvelteQueryProxy<T>>((initialKey) => {
    //-------------------------------------------------------------------------------
    // handle top level properties
    //-------------------------------------------------------------------------------

    if (initialKey === 'client') return proxyClient
    if (initialKey === 'queryClient') return queryClient

    /**
     * `context` uses the exact same proxy, but "context" has to be removed from the path array.
     * Mark as `undefined` and remove inside the recursive proxy.
     */
    const key = initialKey === 'context' ? undefined : initialKey

    //-------------------------------------------------------------------------------
    // handle nested properties
    //-------------------------------------------------------------------------------

    const nestedProperties = createRecursiveProxy((opts) => {
      /**
       * `args` can vary depending on the call.
       * Check the type definition of the function and index the args accordingly.
       *
       * @example
       * `createQuery` accepts 1 argument, so use args[0] for input
       * `setData` accepts 2 arguments, so use args[0] for input and args[1] for params
       *
       * @remarks
       * Only svelte-query options are currently available,
       * but they're passed into the tRPC method as a "proof of concept".
       */
      const anyArgs: any = opts.args

      /**
       * The tRPC route as an array of strings, excluding input.
       * If initial key is `undefined`, omit it from the path array.
       * @example `['post', 'byId']`
       */
      const pathArray = key != null ? [key, ...opts.path] : [...opts.path]

      /**
       * @example `createQuery`, `createMutation`, etc.
       */
      const method = pathArray.pop() ?? ''

      /**
       * The key used to identify this query in the QueryClient.
       * @example [ [...pathArray], { input, type } ]
       */
      const queryKey = getArrayQueryKey(pathArray, anyArgs[0], method)

      /**
       * The tRPC route represented as a string, exluding input.
       * @example `post.byId`
       */
      const path = pathArray.join('.')

      const fetchArgs: CreateQueryOptions = {
        ...anyArgs[1],
        queryKey,
        queryFn: () => client.query(path, anyArgs[0], anyArgs[1]),
      }

      const mutationArgs: CreateMutationOptions = {
        ...anyArgs[0],
        mutationKey: [pathArray],
        mutationFn: (data) => client.mutation(path, data, anyArgs[0]),
      }

      const fetchInfiniteArgs: CreateInfiniteQueryOptions = {
        ...anyArgs[1],
        queryKey,
        queryFn: ({ pageParam }) => client.query(path, { ...anyArgs[0], cursor: pageParam }, anyArgs[1]),
      }

      /**
       * All proxy methods are always available,
       * but the type definitions define the perceived shape of the object.
       */
      switch (method) {
        case 'getQueryKey':
          return getArrayQueryKey(pathArray, anyArgs[0], anyArgs[1] ?? 'any')

        case 'createQuery':
          return createQuery(fetchArgs)

        case 'createMutation':
          return createMutation(mutationArgs)

        case 'createInfiniteQuery':
          return createInfiniteQuery(fetchInfiniteArgs)

        /** TODO: createSubscription */
        case 'createSubscription':
          return 'TODO: not implemented'

        case 'fetchInfinite':
          return queryClient.fetchInfiniteQuery(fetchInfiniteArgs)

        case 'prefetchInfinite':
          return queryClient.prefetchInfiniteQuery(fetchInfiniteArgs)

        case 'setInfiniteData':
          return queryClient.setQueryData(queryKey, anyArgs[0], anyArgs[1])

        case 'getInfiniteData':
          return queryClient.getQueryData(queryKey, ...anyArgs)

        case 'fetch':
          return queryClient.fetchQuery(fetchArgs)

        case 'prefetch':
          return queryClient.prefetchQuery(fetchArgs)

        case 'invalidate':
          return queryClient.invalidateQueries(queryKey, ...anyArgs)

        case 'reset':
          return queryClient.resetQueries(queryKey, ...anyArgs)

        case 'cancel':
          return queryClient.cancelQueries(queryKey, ...anyArgs)

        case 'ensureData':
          return queryClient.ensureQueryData(queryKey, ...anyArgs)

        case 'setData':
          return queryClient.setQueryData(queryKey, anyArgs[0], anyArgs[1])

        case 'getData':
          return queryClient.getQueryData(queryKey, ...anyArgs)

        default:
          throw new TypeError(`trpc.${path}.${method} is not a function`)
      }
    })

    return nestedProperties
  })
  return proxy
}

/**
 * Create a tRPC + svelte-query proxy.
 * @param opts Options for creating the tRPC clients.
 * @param queryClient Initialized `QueryClient` to use for the proxy.
 */
export function createTRPCSvelte<T extends AnyRouter>(
  opts: CreateTRPCClientOptions<T>,
  queryClient: QueryClient
): TRPCSvelteQueryProxy<T> {
  /**
   * An untyped tRPC client has `query`, `mutation`, etc. that use full paths to make the request.
   * This is used inside a `recursiveProxy` to dynamically create the path and request.
   */
  const untypedClient = createTRPCUntypedClient<T>(opts)

  /**
   * tRPC client that can be used to make direct requests to the API.
   */
  const proxyClient = createTRPCProxyClient<T>(opts)

  const proxy = createTRPCSvelteQueryProxy<T>(untypedClient, proxyClient, queryClient)

  return proxy
}
