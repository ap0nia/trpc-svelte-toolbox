import { setContext, getContext } from 'svelte'
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import type { TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import type { FetchQueryOptions, FetchInfiniteQueryOptions } from '@tanstack/svelte-query'
import { useQueryClient } from '@tanstack/svelte-query'
import { getQueryKeyInternal } from '$lib/getQueryKey'
import type { ContextRouter } from './types'

const TRPC_CONTEXT_KEY = Symbol('TRPC_CONTEXT_KEY')

export function setTRPCContext<T extends AnyRouter>(client: TRPCUntypedClient<T>) {
  const innerProxy = createRecursiveProxy((options) => {
    const queryClient = useQueryClient()

    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const lastArg = pathCopy.pop() ?? ''

    const path = pathCopy.join('.')

    const queryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, anyArgs[0], 'query'),
      queryFn: (context) =>
        client.query(path, anyArgs[0], {
          ...anyArgs[1],
          signal: anyArgs[1]?.trpc?.abortOnUnmount ? context.signal : undefined,
        }),
      ...anyArgs[1],
    } satisfies FetchQueryOptions

    const infiniteQueryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, anyArgs[0], 'infinite'),
      queryFn: (context) =>
        client.query(path, anyArgs[0], {
          ...anyArgs[1],
          signal: anyArgs[1]?.trpc?.abortOnUnmount ? context.signal : undefined,
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
        throw new TypeError(`trpc.${path}.${lastArg} is not a function`)
    }
  }) as ContextRouter<T>

  const proxy = createFlatProxy<ContextRouter<T>>((initialKey) => {
    return innerProxy[initialKey]
  })

  setContext(TRPC_CONTEXT_KEY, proxy)
}

export function getTRPCContext<T extends AnyRouter>(): ContextRouter<T> {
  return getContext(TRPC_CONTEXT_KEY)
}
