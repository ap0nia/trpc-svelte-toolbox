import { writable, get } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { createTRPCProxyClient, createTRPCUntypedClient } from '@trpc/client'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import {
  createInfiniteQuery,
  createMutation,
  createQuery,
  createQueries,
  InfiniteQueryObserver,
  QueryObserver,
  useQueryClient,
} from '@tanstack/svelte-query'
import type {
  CreateQueryOptions,
  QueryClient,
  CreateInfiniteQueryOptions,
  CreateMutationOptions,
} from '@tanstack/svelte-query'
import type { CreateTRPCProxyClient, CreateTRPCClientOptions, TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getQueryKey } from './getQueryKey'
import { createReactiveQuery, isWritable } from './reactive'
import type { TRPCSvelteQueryRouter, CreateQueries } from './query'
import type { ContextRouter } from './context'
import type { CreateTRPCSvelteOptions, TRPCOptions } from './types'

interface TRPCSvelteQueryProxyRoot<T extends AnyRouter> {
  client: CreateTRPCProxyClient<T>
  queryClient: QueryClient
  context: ContextRouter<T>
  createContext: () => ContextRouter<T>
  createQueries: CreateQueries<T>
}

export type TRPCSvelteQueryProxy<T extends AnyRouter> = TRPCSvelteQueryRouter<T> & TRPCSvelteQueryProxyRoot<T>

function createTRPCSvelteQueryProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  proxyClient: CreateTRPCProxyClient<T>,
  options?: CreateTRPCSvelteOptions
): TRPCSvelteQueryProxy<T> {
  const proxy = createFlatProxy<TRPCSvelteQueryProxy<T>>((initialKey) => {
    switch (initialKey) {
      case 'client':
        return proxyClient

      case 'queryClient':
        return options?.svelteQueryContext

      case 'context':
        return createInnerProxy<T>(client, options?.svelteQueryContext ?? useQueryClient(), undefined, options)

      case 'useContext':
        return () => createInnerProxy<T>(client, options?.svelteQueryContext ?? useQueryClient(), undefined, options)

      case 'createQueries': {
        const customCreateQueries: CreateQueries<T> = (callback) => {
          const queryOptions = callback(proxy)
          return createQueries(queryOptions)
        }
        return customCreateQueries
      }

      default:
        return createInnerProxy<T>(client, options?.svelteQueryContext ?? useQueryClient(), initialKey, options)
    }
  })

  return proxy
}

function createInnerProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient,
  key?: string | undefined,
  options?: CreateTRPCSvelteOptions
) {
  return createRecursiveProxy((opts) => {
    const anyArgs: any[] = opts.args

    const pathArray = key != null ? [key, ...opts.path] : [...opts.path]

    const method = pathArray.pop() ?? ''

    const input = isWritable(anyArgs[0]) ? get(anyArgs[0]) : anyArgs[0]

    const queryKey = getQueryKey(pathArray, input, method)

    const path = pathArray.join('.')

    const trpcOptions = anyArgs[1]?.trpc

    const abortOnUnmount = Boolean(options?.abortOnUnmount) || Boolean(trpcOptions?.abortOnUnmount)

    const queryOptions = {
      context: queryClient,
      queryKey,
      queryFn: async (context) =>
        await client.query(path, input, {
          ...trpcOptions,
          signal: abortOnUnmount ? context.signal : undefined,
        }),
      ...anyArgs[1],
    } satisfies CreateQueryOptions

    const mutationOptions = {
      context: queryClient,
      mutationKey: [pathArray],
      mutationFn: async (data) => await client.mutation(path, data, anyArgs[0]?.trpc),
      onSuccess: (data, variables, context) =>
        options?.overrides?.createMutation?.onSuccess != null
          ? options.overrides.createMutation.onSuccess({
              queryClient,
              meta: anyArgs[0]?.meta,
              originalFn: () => anyArgs[0]?.onSuccess?.(data, variables, context),
            })
          : anyArgs[0]?.onSuccess?.(data, variables, context),
      ...anyArgs[0],
    } satisfies CreateMutationOptions

    const infiniteQueryOptions = {
      queryKey,
      queryFn: async (context) =>
        await client.query(
          path,
          { ...input, cursor: context.pageParam },
          { ...trpcOptions, signal: abortOnUnmount ? context.signal : undefined }
        ),
      ...anyArgs[1],
    } satisfies CreateInfiniteQueryOptions

    switch (method) {
      case 'createQuery': {
        if (!isWritable(anyArgs[0])) return createQuery(queryOptions)

        const optionsStore: Writable<CreateQueryOptions & TRPCOptions> = writable(queryOptions)
        const inputStore = anyArgs[0]
        const { set, update } = inputStore

        inputStore.set = (newInput) => {
          optionsStore.update(() => ({
            ...queryOptions,
            queryKey: getQueryKey(pathArray, newInput, method),
            queryFn: async (context) =>
              await client.query(path, newInput, {
                ...trpcOptions,
                signal: abortOnUnmount ? context.signal : undefined,
              }),
          }))

          set(newInput)
        }

        inputStore.update = (updaterFn) => {
          update(updaterFn)

          const newInput = get(inputStore)

          optionsStore.update(() => ({
            ...queryOptions,
            queryKey: getQueryKey(pathArray, newInput, method),
            queryFn: async (context) =>
              await client.query(path, newInput, {
                ...trpcOptions,
                signal: abortOnUnmount ? context.signal : undefined,
              }),
          }))
        }
        return createReactiveQuery(optionsStore, QueryObserver, queryClient)
      }

      case 'createInfiniteQuery': {
        if (!isWritable(anyArgs[0])) return createInfiniteQuery(infiniteQueryOptions)

        const optionsStore: Writable<CreateInfiniteQueryOptions & TRPCOptions> = writable(infiniteQueryOptions)
        const inputStore = anyArgs[0]
        const { set, update } = inputStore

        inputStore.set = (newInput) => {
          optionsStore.update(() => ({
            ...infiniteQueryOptions,
            queryKey: getQueryKey(pathArray, newInput, method),
            queryFn: async (context) =>
              await client.query(
                path,
                { ...newInput, cursor: context.pageParam },
                {
                  ...trpcOptions,
                  signal: abortOnUnmount ? context.signal : undefined,
                }
              ),
          }))

          set(newInput)
        }

        inputStore.update = (updaterFn) => {
          update(updaterFn)

          const newInput = get(inputStore)

          optionsStore.update(() => ({
            ...infiniteQueryOptions,
            queryKey: getQueryKey(pathArray, newInput, method),
            queryFn: async (context) =>
              await client.query(
                path,
                { ...newInput, cursor: context.pageParam },
                {
                  ...trpcOptions,
                  signal: abortOnUnmount ? context.signal : undefined,
                }
              ),
          }))
        }
        return createReactiveQuery(optionsStore, InfiniteQueryObserver as typeof QueryObserver, queryClient)
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
}

export function createTRPCSvelte<T extends AnyRouter>(
  trpcClientOptions: CreateTRPCClientOptions<T>,
  svelteQueryOptions?: CreateTRPCSvelteOptions
): TRPCSvelteQueryProxy<T> {
  const untypedClient = createTRPCUntypedClient<T>(trpcClientOptions)
  const proxyClient = createTRPCProxyClient<T>(trpcClientOptions)
  const proxy = createTRPCSvelteQueryProxy<T>(untypedClient, proxyClient, svelteQueryOptions)
  return proxy
}
