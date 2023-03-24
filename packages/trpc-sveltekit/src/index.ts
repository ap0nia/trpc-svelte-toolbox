import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { FetchHandlerRequestOptions } from '@trpc/server/adapters/fetch'
import type { AnyRouter } from '@trpc/server'
import type { Handle } from '@sveltejs/kit'

const defaultEndpoint = '/trpc'

/**
 * Make the specified keys of `T` optional.
 */
type OptionalKeys<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>

/**
 * Options for `createTRPCHandle`.
 */
type Options<T extends AnyRouter> = OptionalKeys<FetchHandlerRequestOptions<T>, 'req' | 'endpoint'>

/**
 * Create `handle` function for SvelteKit `hooks.server`.
 */
function createTRPCHandle<T extends AnyRouter>(options: Options<T>): Handle {
  const endpoint = options.endpoint ?? defaultEndpoint

  return ({ event, resolve }) =>
    event.url.pathname.startsWith(endpoint)
      ? resolve(event)
      : fetchRequestHandler({ ...options, endpoint, req: event.request })
}

export default createTRPCHandle
