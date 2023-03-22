import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import { createTRPCUntypedClient } from '@trpc/client'
import { CreateInfiniteQueryOptions, CreateMutationOptions, CreateQueryOptions, QueryClient, createInfiniteQuery, createMutation, createQuery } from '@tanstack/svelte-query'
import type { CreateTRPCClientOptions, TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getArrayQueryKey } from './getArrayQueryKey'
import type { TRPCSvelteQueryProcedure } from './query'

/**
 * Map all properties of a tRPC router to svelte-query methods.
 */
export type TRPCSvelteQueryRouter<T extends AnyRouter> = {
  [k in keyof T]: T[k] extends AnyRouter ? TRPCSvelteQueryRouter<T[k]> : TRPCSvelteQueryProcedure<T[k]>
}

/**
 * Create a tRPC + svelte-query proxy.
 */
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
      const args: any = opts.args

      /**
       * The tRPC route represented as an array of strings, excluding input.
       * @example `['post', 'byId']`
       */
      const pathArray = [key, ...opts.path]

      /**
       * `createQuery`, `createMutation`, etc.
       */
      const method = pathArray.pop()

      if (method == null) return

      /**
       * The tRPC route represented as a string, exluding input.
       * @example `post.byId`
       */
      const path = pathArray.join('.')

      /**
       * Generally, the first argument is input, and the second is params for tRPC or svelte-query.
       * Verify this by checking the type definitions for each function call.
       */
      const [input, params] = args;

      const queryKey = getArrayQueryKey(pathArray, input, method)

      const fetchArgs: CreateQueryOptions = {
        ...params,
        queryKey,
        queryFn() {
          return client.query(path, input, params)
        }
      }

      const mutationArgs: CreateMutationOptions = {
        ...args,
        mutationKey: queryKey,
        mutationFn(data) {
          return client.mutation(path, data, args)
        }
      }

      const fetchInfiniteArgs: CreateInfiniteQueryOptions = {
        ...params,
        queryKey,
        queryFn({ pageParam }) {
          const infiniteQueryInput = { ...input, cursor: pageParam }
          return client.query(path, infiniteQueryInput, params)
        }
      }

      switch (method) {
        case 'getQueryKey':
          return queryKey

        case 'createQuery':
          return createQuery(fetchArgs)

        case 'createMutation':
          return createMutation(mutationArgs)

        case 'createInfiniteQuery':
          return createInfiniteQuery(fetchInfiniteArgs)

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
  const client = createTRPCUntypedClient<T>(opts)

  /**
   * Use `createFlatProxy` and `createRecursiveProxy` to allow dynamic access
   * of all tRPC routes and their corresponding svelte-query methods.
   */
  const proxy = createTRPCSvelteQueryProxy<T>(client, queryClient || new QueryClient())
  return proxy
}
