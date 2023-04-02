import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { AnyRouter } from '@trpc/server'
import type { Handle } from '@sveltejs/kit'
import type { TRPCHandleOptions } from './types'

const defaultEndpoint = '/trpc'

/**
 * Create a `handle` function for SvelteKit `hooks.server`.
 */
function createTRPCHandle<T extends AnyRouter>(options: TRPCHandleOptions<T>): Handle {
  const endpoint = options.endpoint ?? defaultEndpoint
  return ({ event, resolve }) =>
    !event.url.pathname.startsWith(endpoint)
      ? resolve(event)
      : fetchRequestHandler({
          ...options,
          req: event.request,
          endpoint,
          createContext: (opts) => options?.createContext(opts, event),
        })
}

export default createTRPCHandle
