import { createFlatProxy } from '@trpc/server/shared'
import { createTRPCProxyClient, createTRPCUntypedClient } from '@trpc/client'
import { createQueries } from '@tanstack/svelte-query'
import type {
  CreateTRPCProxyClient,
  CreateTRPCClientOptions,
  TRPCUntypedClient,
} from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import type { QueryClient } from '@tanstack/svelte-query'
import { createContextProxy, setContextProxy, getContextProxy } from './proxies/context'
import { createCreateQueriesProxy } from './proxies/createQueries'
import { createSvelteQueryProxy } from './proxies/svelteQuery'
import type { SetContextProxy, GetContextProxy, ContextProxy } from './proxies/context'
import type { CreateQueriesFn } from './proxies/createQueries'
import type { SvelteQueryProxy, SvelteQueryProxyOptions } from './proxies/svelteQuery'

type TRPCSvelteRootProperties<T extends AnyRouter> = {
  client: TRPCUntypedClient<T>
  proxy: CreateTRPCProxyClient<T>
  queryClient: QueryClient

  loadContext: ContextProxy<T>
  setContext: SetContextProxy<T>
  getContext: GetContextProxy<T>

  createQueries: CreateQueriesFn<T>
}

export type TRPCSvelte<T extends AnyRouter> = SvelteQueryProxy<T> & TRPCSvelteRootProperties<T>

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

  const createQueriesFn: CreateQueriesFn<T> = (callback) => {
    return createQueries(callback(createQueriesProxy))
  }

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
        return createQueriesFn

      default:
        return svelteQueryProxy[initialKey]
    }
  })

  return TRPCSvelte
}
