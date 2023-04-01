import { setContext, getContext } from 'svelte'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import type {
  QueryClient,
  FetchQueryOptions,
  FetchInfiniteQueryOptions,
} from '@tanstack/svelte-query'
import type { TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getQueryKeyInternal } from '../../helpers/getQueryKey'
import type { ContextProxy } from './types'

interface SvelteQueryOptions {
  abortOnUnmount?: boolean
}

const TRPC_CONTEXT_KEY = Symbol('TRPC_CONTEXT_KEY')

export type CreateContextProxy<T extends AnyRouter> = (
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient,
  svelteQueryOptions?: SvelteQueryOptions
) => ContextProxy<T>

export const createContextProxy = <T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient,
  svelteQueryOptions: SvelteQueryOptions = {}
): ContextProxy<T> => {
  const innerContextProxy = createRecursiveProxy((options) => {
    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const lastArg = pathCopy.pop() ?? ''

    const path = pathCopy.join('.')

    const abortOnUnmount =
      Boolean(svelteQueryOptions.abortOnUnmount) || Boolean(anyArgs[1]?.trpc?.abortOnUnmount)

    const queryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, anyArgs[0], 'query'),
      queryFn: async (context) =>
        await client.query(path, anyArgs[0], {
          ...anyArgs[1],
          signal: abortOnUnmount ? context.signal : undefined,
        }),
      ...anyArgs[1],
    } satisfies FetchQueryOptions

    const infiniteQueryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, anyArgs[0], 'infinite'),
      queryFn: async (context) =>
        await client.query(path, anyArgs[0], {
          ...anyArgs[1],
          signal: abortOnUnmount ? context.signal : undefined,
        }),
      ...anyArgs[1],
    } satisfies FetchInfiniteQueryOptions

    // general query key used for invalidations, etc.
    const queryKey = getQueryKeyInternal(pathCopy, anyArgs[0], 'any')

    switch (lastArg) {
      case 'fetch':
        return queryClient.fetchQuery(queryOptions)

      case 'prefetch':
        return queryClient.prefetchQuery(queryOptions)

      case 'getData':
        return queryClient.getQueryData(queryOptions.queryKey)

      case 'ensureData':
        return queryClient.ensureQueryData(queryOptions)

      case 'setData':
        return queryClient.setQueryData(queryOptions.queryKey, anyArgs[0], anyArgs[1])

      case 'fetchInfinite':
        return queryClient.fetchInfiniteQuery(infiniteQueryOptions)

      case 'prefetchInfinite':
        return queryClient.prefetchInfiniteQuery(infiniteQueryOptions)

      case 'getInfiniteData':
        return queryClient.getQueryData(infiniteQueryOptions.queryKey)

      case 'ensureInfiniteData':
        return queryClient.ensureQueryData(infiniteQueryOptions)

      case 'setInfiniteData':
        return queryClient.setQueryData(infiniteQueryOptions.queryKey, anyArgs[0], anyArgs[1])

      case 'invalidate':
        return queryClient.invalidateQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      case 'refetch':
        return queryClient.refetchQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      case 'cancel':
        return queryClient.cancelQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      case 'reset':
        return queryClient.resetQueries({ queryKey, ...anyArgs[0] }, anyArgs[1])

      default:
        throw new TypeError(`context.${path}.${lastArg} is not a function`)
    }
  }) as ContextProxy<T>

  const contextProxy = createFlatProxy<ContextProxy<T>>((initialKey) => {
    switch (initialKey) {
      case 'queryClient':
        return queryClient

      default:
        return innerContextProxy[initialKey]
    }
  })
  return contextProxy
}

export type SetContextProxy<T extends AnyRouter> = (
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient,
  svelteQueryOptions?: SvelteQueryOptions
) => void

export const setContextProxy = <T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  queryClient: QueryClient,
  svelteQueryOptions: SvelteQueryOptions = {}
): void => {
  const contextProxy = createContextProxy(client, queryClient, svelteQueryOptions)
  setContext(TRPC_CONTEXT_KEY, contextProxy)
}

export type GetContextProxy<T extends AnyRouter> = () => ContextProxy<T>

export const getContextProxy = <T extends AnyRouter>(): ContextProxy<T> =>
  getContext<ContextProxy<T>>(TRPC_CONTEXT_KEY)
