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

interface TRPCSvelteRoot<T extends AnyRouter> {
  queryClient: QueryClient
  client: TRPCUntypedClient<T>
  proxy: CreateTRPCProxyClient<T>

  context: ContextProxy<T>
  setContext: SetContextProxy<T>
  getContext: GetContextProxy<T>

  createQueries: CreateQueriesFn<T>
}

export type TRPCSvelte<T extends AnyRouter> = SvelteQueryProxy<T> & TRPCSvelteRoot<T>

export function createTRPCSvelte<T extends AnyRouter>(
  trpcClientOptions: CreateTRPCClientOptions<T>,
  svelteQueryOptions?: SvelteQueryProxyOptions
): TRPCSvelte<T> {
  const client = createTRPCUntypedClient<T>(trpcClientOptions)

  const proxyClient = createTRPCProxyClient<T>(trpcClientOptions)

  const context =
    svelteQueryOptions?.svelteQueryContext != null
      ? createContextProxy<T>(client, svelteQueryOptions.svelteQueryContext)
      : null

  const createQueriesProxy = createCreateQueriesProxy<T>(client)

  const createQueriesFn: CreateQueriesFn<T> = (callback) =>
    createQueries(callback(createQueriesProxy))

  const svelteQueryProxy = createSvelteQueryProxy<T>(client, svelteQueryOptions)

  const TRPCSvelte = createFlatProxy<TRPCSvelte<T>>((initialKey) => {
    switch (initialKey) {
      case 'queryClient':
        return svelteQueryOptions?.svelteQueryContext

      case 'client':
        return client

      case 'proxy':
        return proxyClient

      case 'context': {
        if (context == null) {
          throw new Error('`loadContext` is not available, did you provide a query client?')
        }
        return context
      }

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
