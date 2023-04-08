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

/**
 * Root properties of the tRPC + svelte-query proxy.
 * TODO: warning if provided tRPC router has conflicting initial keys.
 */
interface TRPCSvelteRoot<T extends AnyRouter> {
  /**
   * query client if `svelteQueryContext` was provided.
   */
  queryClient: QueryClient

  /**
   * untyped tRPC client used to make queries internally.
   */
  client: TRPCUntypedClient<T>

  /**
   * type-safe tRPC proxy client that can be used to make queries externally.
   */
  proxy: CreateTRPCProxyClient<T>

  /**
   * Direct access to context helper functions. Only defined if `svelteQueryContext` was provided.
   */
  context: ContextProxy<T>

  /**
   * Set the tRPC context for all context helpers in components.
   */
  setContext: SetContextProxy<T>

  /**
   * Get the tRPC context. Has helper functions with more control over the query client.
   */
  getContext: GetContextProxy<T>

  /**
   * Create multiple type-safe tRPC queries with svelte-query's `createQueries` API.
   */
  createQueries: CreateQueriesFn<T>
}

/**
 * The main tRPC + svelte-query proxy.
 * Contains all root properties and extends the main svelte-query proxy.
 */
export type TRPCSvelte<T extends AnyRouter> = SvelteQueryProxy<T> & TRPCSvelteRoot<T>

/**
 * Create a proxy that will provide access to all other tRPC + svelte-query proxies.
 */
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

      case 'context': 
        return context

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
