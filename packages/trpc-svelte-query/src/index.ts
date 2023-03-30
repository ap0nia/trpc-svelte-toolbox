import { writable, get } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { createTRPCProxyClient, createTRPCUntypedClient } from '@trpc/client'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import {
  createInfiniteQuery,
  createMutation,
  createQuery,
  createQueries,
  type CreateQueryOptions,
  InfiniteQueryObserver,
  type QueryClient,
  QueryObserver,
  useQueryClient,
  type CreateInfiniteQueryOptions,
  type CreateMutationOptions,
} from '@tanstack/svelte-query'
import type { CreateTRPCProxyClient, CreateTRPCClientOptions, TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getQueryKey } from './getQueryKey'
import { createReactiveQuery, isWritable } from './reactive'
import type { TRPCSvelteQueryRouter, CreateQueries } from './query'
import type { UtilsRouter } from './utils'
import type { CreateTRPCSvelteOptions, TRPCOptions } from './types'

/**
 * @internal
 * Properties available at the proxy root.
 */
interface TRPCSvelteQueryProxyRoot<T extends AnyRouter> {
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

  /**
   * Invokes a callback function to use the `createQueries` API with tRPC.
   */
  createQueries: CreateQueries<T>
}

/**
 * Map a tRPC router to a tRPC + svelte-query proxy.
 */
export type TRPCSvelteQueryProxy<T extends AnyRouter> = TRPCSvelteQueryRouter<T> & TRPCSvelteQueryProxyRoot<T>

/**
 * @internal
 * Create a tRPC + svelte-query proxy.
 */
function createTRPCSvelteQueryProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  proxyClient: CreateTRPCProxyClient<T>,
  options?: CreateTRPCSvelteOptions
): TRPCSvelteQueryProxy<T> {
  /**
   * Properties indicated by the type information don't exist during runtime.
   * Proxies allows dynamic access to these properties.
   *
   * `flatProxy` handles root level properties; `recursiveProxy` handles the query operations.
   */
  const proxy = createFlatProxy<TRPCSvelteQueryProxy<T>>((initialKey) => {
    if (initialKey === 'client') return proxyClient
    if (initialKey === 'queryClient') return options?.svelteQueryContext

    /**
     * `utils` refers to the same proxy, but "utils" is not part of the tRPC path.
     * Mark as `undefined` and remove inside the recursive proxy.
     */
    const key = initialKey === 'utils' ? undefined : initialKey

    const nestedProperties = createRecursiveProxy((opts) => {
      const queryClient = options?.svelteQueryContext ?? useQueryClient()

      /**
       * Handle `args` based on the method.
       *
       * @example
       * `setData` has 2 arguments: args[0] -> input, args[1] -> params.
       * `createMutation` has 1 argument: args[0] -> input, args[0]?.trpc -> tRPC options
       */
      const anyArgs: any[] = opts.args

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
       * Evaluate query input. Can be writable store. Ignore later if not a query.
       */
      const input = isWritable(anyArgs[0]) ? get(anyArgs[0]) : anyArgs[0]

      /**
       * The key used to identify this query in the QueryClient.
       * @example [ ['post', 'byId'], { input: 69, type: 'query' } ]
       */
      const queryKey = getQueryKey(pathArray, input, method)

      /**
       * The tRPC path as a string.
       * @example `post.byId`
       */
      const path = pathArray.join('.')

      const abortOnUnmount = options?.abortOnUnmount ?? anyArgs[1]?.trpc?.abortOnUnmount

      const queryOptions = {
        context: queryClient,
        queryKey,
        queryFn: async (context) =>
          await client.query(path, input, {
            ...anyArgs[1]?.trpc,
            ...(Boolean(abortOnUnmount) && { signal: context.signal }),
          }),
        ...anyArgs[1],
      } satisfies CreateQueryOptions

      const mutationOptions = {
        context: queryClient,
        mutationKey: [pathArray],
        mutationFn: async (data) => await client.mutation(path, data, anyArgs[0]?.trpc),
        onSuccess(data, variables, context) {
          options?.overrides?.createMutation?.onSuccess?.({
            queryClient,
            meta: anyArgs[0]?.meta,
            originalFn: () => anyArgs[0]?.onSuccess?.(data, variables, context),
          })
        },
        ...anyArgs[0],
      } satisfies CreateMutationOptions

      const infiniteQueryOptions = {
        queryKey,
        queryFn: async (context) =>
          await client.query(
            path,
            { ...input, cursor: context.pageParam },
            { ...anyArgs[1]?.trpc, ...(Boolean(abortOnUnmount) && { signal: context.signal }) }
          ),
        ...anyArgs[1],
      } satisfies CreateInfiniteQueryOptions

      switch (method) {
        case 'createQuery': {
          if (isWritable(anyArgs[0])) {
            const optionsStore: Writable<CreateQueryOptions & TRPCOptions> = writable(queryOptions)

            const inputStore = anyArgs[0]
            const { set, update } = inputStore

            inputStore.set = (newInput) => {
              optionsStore.update((previous) => ({
                ...previous,
                queryKey: getQueryKey(pathArray, newInput, method),
                queryFn: async (context) =>
                  await client.query(path, newInput, {
                    ...previous.trpc,
                    signal:
                      Boolean(abortOnUnmount) || Boolean(previous.trpc?.abortOnUnmount) ? context.signal : undefined,
                  }),
              }))
              set(newInput)
            }

            inputStore.update = (updater) => {
              update(updater)

              const newInput = get(inputStore)
              optionsStore.update((previous) => ({
                ...previous,
                queryKey: getQueryKey(pathArray, newInput, method),
                queryFn: async (context) =>
                  await client.query(path, newInput, {
                    ...previous.trpc,
                    signal:
                      Boolean(abortOnUnmount) || Boolean(previous.trpc?.abortOnUnmount) ? context.signal : undefined,
                  }),
              }))
            }
            return createReactiveQuery(optionsStore, QueryObserver, queryClient)
          }
          return createQuery(queryOptions)
        }

        case 'createInfiniteQuery': {
          if (isWritable(anyArgs[0])) {
            const optionsStore: Writable<CreateInfiniteQueryOptions & TRPCOptions> = writable(infiniteQueryOptions)

            const inputStore = anyArgs[0]
            const { set, update } = inputStore

            inputStore.set = (newInput) => {
              optionsStore.update((previous) => ({
                ...previous,
                queryKey: getQueryKey(pathArray, newInput, method),
                queryFn: async (context) =>
                  await client.query(
                    path,
                    { ...newInput, cursor: context.pageParam },
                    {
                      ...previous.trpc,
                      signal:
                        Boolean(abortOnUnmount) || Boolean(previous.trpc?.abortOnUnmount) ? context.signal : undefined,
                    }
                  ),
              }))
              set(newInput)
            }

            inputStore.update = (updater) => {
              update(updater)

              const newInput = get(inputStore)
              optionsStore.update((previous) => ({
                ...previous,
                queryKey: getQueryKey(pathArray, newInput, method),
                queryFn: async (context) =>
                  await client.query(
                    path,
                    { ...newInput, cursor: context.pageParam },
                    {
                      ...previous.trpc,
                      signal:
                        Boolean(abortOnUnmount) || Boolean(previous.trpc?.abortOnUnmount) ? context.signal : undefined,
                    }
                  ),
              }))
            }
            return createReactiveQuery(optionsStore, InfiniteQueryObserver as typeof QueryObserver, queryClient)
          }
          return createInfiniteQuery(infiniteQueryOptions)
        }

        case 'createMutation':
          return createMutation(mutationOptions)

        case 'createSubscription':
          return client.subscription(path, anyArgs[0], anyArgs[1])

        case 'getQueryKey':
          return queryKey

        case 'getInfiniteQueryKey':
          return queryKey

        case 'getMutationKey':
          return queryKey

        case 'getSubscriptionKey':
          return queryKey

        case 'createOptions':
          return queryOptions

        case 'fetch':
          return queryClient.fetchQuery(queryOptions)

        case 'prefetch':
          return queryClient.prefetchQuery(queryOptions)

        case 'getData':
          return queryClient.getQueryData(queryKey)

        case 'ensureData':
          return queryClient.ensureQueryData(queryOptions)

        case 'setData':
          return queryClient.setQueryData(queryKey, anyArgs[0], anyArgs[1])

        case 'getState':
          return queryClient.getQueryState(queryKey)

        case 'fetchInfinite':
          return queryClient.fetchInfiniteQuery(infiniteQueryOptions)

        case 'prefetchInfinite':
          return queryClient.prefetchInfiniteQuery(infiniteQueryOptions)

        case 'getInfiniteData':
          return queryClient.getQueryData(queryKey)

        case 'ensureInfiniteData':
          return queryClient.ensureQueryData(infiniteQueryOptions)

        case 'setInfiniteData':
          return queryClient.setQueryData(queryKey, anyArgs[0], anyArgs[1])

        case 'getInfiniteState':
          return queryClient.getQueryState(queryKey)

        case 'invalidate':
          return queryClient.invalidateQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

        case 'refetch':
          return queryClient.refetchQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

        case 'cancel':
          return queryClient.cancelQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

        case 'remove':
          return queryClient.removeQueries({ queryKey, ...anyArgs[0] })

        case 'reset':
          return queryClient.resetQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

        case 'isFetching':
          return queryClient.isFetching({ queryKey, ...anyArgs[0] })

        case 'isFetchingRecursive':
          return queryClient.isFetching({ queryKey, ...anyArgs[0] })

        case 'isMutating':
          return queryClient.isMutating({ mutationKey: [pathArray], ...anyArgs[0] })

        default:
          throw new TypeError(`trpc.${path}.${method} is not a function`)
      }
    })

    if (initialKey === 'createQueries') {
      const customCreateQueries: CreateQueries<T> = (callback) => {
        const results = callback(proxy)
        const queries = createQueries(results)
        return queries
      }
      return customCreateQueries
    }

    return nestedProperties
  })

  return proxy
}

/**
 * Create a tRPC + svelte-query proxy.
 * @param trpcClientOptions Options for creating the tRPC client.
 * @param svelteQueryOptions Options that affect svelte-query behavior.
 */
export function createTRPCSvelte<T extends AnyRouter>(
  trpcClientOptions: CreateTRPCClientOptions<T>,
  svelteQueryOptions?: CreateTRPCSvelteOptions
): TRPCSvelteQueryProxy<T> {
  /**
   * An untyped tRPC client has `query`, `mutation`, etc. that require full paths to make the request.
   * This is used inside a `recursiveProxy` to dynamically create the path and request.
   */
  const untypedClient = createTRPCUntypedClient<T>(trpcClientOptions)

  /**
   * tRPC client that can be used to send requests directly.
   */
  const proxyClient = createTRPCProxyClient<T>(trpcClientOptions)

  const proxy = createTRPCSvelteQueryProxy<T>(untypedClient, proxyClient, svelteQueryOptions)
  return proxy
}
