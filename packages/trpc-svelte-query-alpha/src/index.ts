import { get, writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import {
  CreateTRPCProxyClient,
  TRPCRequestOptions,
  createTRPCProxyClient,
  createTRPCUntypedClient,
} from '@trpc/client'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import { createInfiniteQuery, createMutation, createQuery, QueryClient } from '@tanstack/svelte-query'

import type { CreateTRPCClientOptions, TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import type {
  CreateInfiniteQueryOptions,
  CreateMutationOptions,
  CreateQueryOptions,
  QueryClientConfig,
} from '@tanstack/svelte-query'

import { getQueryKey } from './getQueryKey'
import type { TRPCSvelteQueryProcedure } from './query'
import type { UtilsRouter } from './utils'

/**
 * Additional tRPC options can be under a `tRPC` property.
 */
type AdditionalOptions = { trpc?: TRPCRequestOptions }

/**
 * @internal
 * Properties available at the proxy root.
 */
type TRPCSvelteQueryProxyRoot<T extends AnyRouter> = {
  /**
   * tRPC client that can be used to send requests directly.
   */
  client: CreateTRPCProxyClient<T>

  /**
   * The `QueryClient` instance.
   */
  queryClient: QueryClient

  /**
   * Shadows the proxy, providing methods with more control over queries.
   */
  utils: UtilsRouter<T>
}

/**
 * @internal
 * Proxy without root properties.
 */
type InnerTRPCSvelteQueryProxy<T extends AnyRouter> = {
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
 * @internal
 * Create a tRPC + svelte-query proxy.
 */
function createTRPCSvelteQueryProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  proxyClient: CreateTRPCProxyClient<T>,
  queryClient: QueryClient
): TRPCSvelteQueryProxy<T> {
  /**
   * Properties indicated by the type information don't exist during runtime.
   * Proxies allows dynamic access to these properties.
   *
   * `flatProxy` handles root level properties; `recursiveProxy` handles the query operations.
   */
  const proxy = createFlatProxy<TRPCSvelteQueryProxy<T>>((initialKey) => {
    if (initialKey === 'client') return proxyClient
    if (initialKey === 'queryClient') return queryClient

    /**
     * `utils` refers to the same proxy, but "utils" is not part of the tRPC path.
     * Mark as `undefined` and remove inside the recursive proxy.
     */
    const key = initialKey === 'utils' ? undefined : initialKey

    const nestedProperties = createRecursiveProxy((opts) => {
      /**
       * Handle `args` based on the method.
       *
       * @example
       * `setData` has 2 arguments: args[0] -> input, args[1] -> params.
       * `createMutation` has 1 argument: args[0] -> input, args[0]?.trpc -> tRPC options
       */
      const anyArgs: any = opts.args

      /**
       * The tRPC path as an array of strings; omit initial key if `undefined`.
       * @example `['post', 'byId']`
       */
      const pathArray = key != null ? [key, ...opts.path] : [...opts.path]

      /**
       * @example `createQuery`, `createMutation`, `fetch` etc.
       */
      const method = pathArray.pop() ?? ''

      /**
       * The key used to identify this query in the QueryClient.
       * @example [ ['post', 'byId'], { input: 69, type: 'query' } ]
       */
      const queryKey = getQueryKey(pathArray, anyArgs[0], method)

      /**
       * The tRPC path as a string.
       * @example `post.byId`
       */
      const path = pathArray.join('.')

      const queryOptions = {
        context: queryClient,
        queryKey,
        queryFn: () => client.query(path, anyArgs[0], anyArgs[1]?.trpc),
        ...anyArgs[1],
      } satisfies CreateQueryOptions

      const mutationOptions = {
        context: queryClient,
        mutationKey: [pathArray],
        mutationFn: (data) => client.mutation(path, data, anyArgs[0]?.trpc),
        ...anyArgs[0],
      } satisfies CreateMutationOptions

      const infiniteQueryOptions = {
        context: queryClient,
        queryKey,
        queryFn: (context) =>
          client.query(path, { ...anyArgs[0], cursor: context.pageParam }, anyArgs[1]?.trpc),
        ...anyArgs[1],
      } satisfies CreateInfiniteQueryOptions

      switch (method) {
        case 'getQueryKey':
          return getQueryKey(pathArray, anyArgs[0], anyArgs[1] ?? 'any')

        case 'getQueryOptions':
          return { ...queryOptions, trpc: anyArgs[1]?.trpc }

        case 'getMutationOptions':
          return { ...mutationOptions, trpc: anyArgs[0]?.trpc }

        case 'getInfiniteQueryOptions':
          return { ...infiniteQueryOptions, trpc: anyArgs[1]?.trpc }

        /**
         * FIXME: the alpha branch of svelte-query screws up `CreateQueryOptions`
         */
        case 'createQuery':
          return createQuery(queryOptions)

        case 'createMutation':
          return createMutation(mutationOptions)

        case 'createInfiniteQuery':
          return createInfiniteQuery(infiniteQueryOptions)

        case 'createSubscription':
          return client.subscription(path, anyArgs[0], anyArgs[1])

        case 'fetchInfinite':
          return queryClient.fetchInfiniteQuery(infiniteQueryOptions)

        case 'prefetchInfinite':
          return queryClient.prefetchInfiniteQuery(infiniteQueryOptions)

        case 'setInfiniteData':
          return queryClient.setQueryData(queryKey, anyArgs[0], anyArgs[1])

        case 'getInfiniteData':
          return queryClient.getQueryData(queryKey)

        case 'fetch':
          return queryClient.fetchQuery(queryOptions)

        case 'prefetch':
          return queryClient.prefetchQuery(queryOptions)

        case 'invalidate': {
          return queryClient.invalidateQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])
        }

        case 'reset': {
          return queryClient.resetQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])
        }

        case 'cancel': {
          return queryClient.cancelQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])
        }

        case 'ensureData': {
          return queryClient.ensureQueryData({ queryKey, ...anyArgs[0] })
        }

        case 'setData':
          return queryClient.setQueryData(queryKey, anyArgs[0], anyArgs[1])

        case 'getData':
          return queryClient.getQueryData(queryKey)

        /**
         * anyArgs[0] -> writable store created from the output of `getQueryOptions`.
         * Get the input from `queryKey` to set the initial value of the `input` store.
         * Whenever the `input` store changes, also update `anyArgs[0]`, the writable `queryOptions` store.
         */
        case 'bindQueryInput': {
          const input = writable((get(anyArgs[0]) as any).queryKey[1].input)

          const set = (newInput: any) => {
            anyArgs[0].update((opts: CreateQueryOptions & AdditionalOptions): CreateQueryOptions => {
              return {
                ...opts,
                queryKey: getQueryKey(pathArray, newInput, method),
                queryFn: () => client.query(path, newInput, opts.trpc),
              }
            })
            input.set(newInput)
          }

          const update = (updater: any) => {
            input.update(updater)

            const newInput = get(input)
            anyArgs[0].update((opts: CreateQueryOptions & AdditionalOptions): CreateQueryOptions => {
              return {
                ...opts,
                queryKey: getQueryKey(pathArray, newInput, method),
                queryFn: () => client.query(path, newInput, opts.trpc),
              }
            })
          }

          return { ...input, set, update }
        }

        /**
         * anyArgs[0] -> writable store created from the output of `getQueryOptions`.
         * Get the input from `queryKey` to set the initial value of the `input` store.
         * Whenever the `input` store changes, also update `anyArgs[0]`, the writable `queryOptions` store.
         */
        case 'bindInfiniteQueryInput': {
          const input = writable((get(anyArgs[0]) as any).queryKey[1].input)

          const set = (newInput: any) => {
            anyArgs[0].update(
              (opts: CreateInfiniteQueryOptions & AdditionalOptions): CreateInfiniteQueryOptions => {
                return {
                  ...opts,
                  queryKey: getQueryKey(pathArray, newInput, method),
                  queryFn: (context) =>
                    client.query(path, { ...newInput, cursor: context.pageParam }, opts.trpc),
                }
              }
            )
            input.set(newInput)
          }

          const update = (updater: any) => {
            input.update(updater)

            const newInput = get(input)
            anyArgs[0].update((opts: CreateQueryOptions & AdditionalOptions): CreateQueryOptions => {
              return {
                ...opts,
                queryKey: getQueryKey(pathArray, newInput, method),
                queryFn: () => client.query(path, newInput, opts.trpc),
              }
            })
          }

          return { ...input, set, update }
        }

        case 'createReactiveQuery': {
          const options = writable(queryOptions)
          const input = writable(anyArgs[0])

          const set = (newInput: any) => {
            options.update(original => ({
              ...original,
              queryKey: getQueryKey(pathArray, newInput, method),
              queryFn: () => client.query(path, newInput, anyArgs[1]?.trpc),
            }))
            input.set(newInput)
          }

          const update = (updater: any) => {
            input.update(updater)

            const newInput = get(input)
            options.update(original => ({
              ...original,
              queryKey: getQueryKey(pathArray, newInput, method),
              queryFn: () => client.query(path, newInput, anyArgs[1]?.trpc),
            }))
          }

          const query = createQuery(options)

          return [ query, { ...input, set, update } ]
        }

        case 'createReactiveInfiniteQuery': {
          const options = writable(infiniteQueryOptions)
          const input = writable(anyArgs[0])

          const set = (newInput: any) => {
            options.update(original => ({
              ...original,
              queryKey: getQueryKey(pathArray, newInput, method),
              queryFn: (context) =>
                client.query(path, { ...newInput, cursor: context.pageParam }, anyArgs[1]?.trpc),
            }))
            input.set(newInput)
          }

          const update = (updater: any) => {
            input.update(updater)

            const newInput = get(input)
            options.update(original => ({
              ...original,
              queryKey: getQueryKey(pathArray, newInput, method),
              queryFn: (context) =>
                client.query(path, { ...newInput, cursor: context.pageParam }, anyArgs[1]?.trpc),
            }))
          }

          const query = createInfiniteQuery(options as Writable<CreateInfiniteQueryOptions>)

          return [ query, { ...input, set, update } ]
        }

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
 * @param opts Options for creating the tRPC client.
 * @param queryInit Initialized `QueryClient`, or options to initialize one.
 */
export function createTRPCSvelte<T extends AnyRouter>(
  opts: CreateTRPCClientOptions<T>,
  queryInit?: QueryClient | QueryClientConfig
): TRPCSvelteQueryProxy<T> {
  /**
   * An untyped tRPC client has `query`, `mutation`, etc. that require full paths to make the request.
   * This is used inside a `recursiveProxy` to dynamically create the path and request.
   */
  const untypedClient = createTRPCUntypedClient<T>(opts)

  /**
   * tRPC client that can be used to send requests directly.
   */
  const proxyClient = createTRPCProxyClient<T>(opts)

  /**
   * Determine if `queryInit` is a `QueryClient` by checking for any unique key.
   */
  const isQueryClient = queryInit && 'clear' in queryInit

  /**
   * Use the provided `QueryClient`, or initialize one with the options.
   */
  const queryClient = isQueryClient ? queryInit : new QueryClient(queryInit)

  const proxy = createTRPCSvelteQueryProxy<T>(untypedClient, proxyClient, queryClient)
  return proxy
}
