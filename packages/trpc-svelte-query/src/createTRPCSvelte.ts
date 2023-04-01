import { createFlatProxy } from '@trpc/server/shared'
import {
  type CreateTRPCProxyClient,
  createTRPCProxyClient,
  createTRPCUntypedClient,
  type CreateTRPCClientOptions,
  type TRPCUntypedClient,
} from '@trpc/client'
import { createQueries } from '@tanstack/svelte-query'
import type { AnyRouter } from '@trpc/server'
import type { QueryClient } from '@tanstack/svelte-query'
import { createContextProxy, setContextProxy, getContextProxy } from './proxies/context/context'
import { createCreateQueriesProxy } from './proxies/createQueries/createQueries'
import { createSvelteQueryProxy } from './proxies/svelteQuery/svelteQuery'
import type { SetContextProxy, GetContextProxy } from './proxies/context/context'
import type { ContextProxy } from './proxies/context/types'
import type { CreateQueriesFn } from './proxies/createQueries/types'
import type { SvelteQueryProxyOptions, SvelteQueryProxy } from './proxies/svelteQuery/types'

export type TRPCSvelte<T extends AnyRouter> = SvelteQueryProxy<T> & {
  client: TRPCUntypedClient<T>
  proxy: CreateTRPCProxyClient<T>
  queryClient: QueryClient
  loadContext: ContextProxy<T>
  setContext: SetContextProxy<T>
  getContext: GetContextProxy<T>
  createQueries: CreateQueriesFn<T>
}

export function createTRPCSvelte<T extends AnyRouter>(
  trpcClientOptions: CreateTRPCClientOptions<T>,
  svelteQueryOptions?: SvelteQueryProxyOptions
): TRPCSvelte<T> {
  const client = createTRPCUntypedClient<T>(trpcClientOptions)

  const proxyClient = createTRPCProxyClient<T>(trpcClientOptions)

  const loadContextProxy =
    svelteQueryOptions?.svelteQueryContext != null
      ? createContextProxy<T>(client, svelteQueryOptions.svelteQueryContext)
      : null

  const createQueriesProxy = createCreateQueriesProxy<T>(client)

  const svelteQueryProxy = createSvelteQueryProxy<T>(client, svelteQueryOptions)

  const customCreateQueries: CreateQueriesFn<T> = (callback) =>
    createQueries(callback(createQueriesProxy))

  const TRPCSvelte = createFlatProxy<TRPCSvelte<T>>((initialKey) => {
    switch (initialKey) {
      case 'client':
        return client

      case 'proxy':
        return proxyClient

      case 'queryClient':
        return svelteQueryOptions?.svelteQueryContext

      case 'loadContext':
        return loadContextProxy

      case 'createContext':
        return createContextProxy

      case 'setContext':
        return setContextProxy

      case 'getContext':
        return getContextProxy

      case 'createQueries':
        return customCreateQueries

      default:
        return svelteQueryProxy[initialKey]
    }
  })

  return TRPCSvelte
}
