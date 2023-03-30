import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { AnyRouter } from '@trpc/server'
import type { Handle } from '@sveltejs/kit'
import type { TRPCHandleOptions } from './types'

const defaultEndpoint = '/trpc'

/**
 * Create `handle` function for SvelteKit `hooks.server`.
 */
export function createTRPCHandle<T extends AnyRouter>(options: TRPCHandleOptions<T>): Handle {
  const endpoint = options.endpoint ?? defaultEndpoint

  return async ({ event, resolve }) =>
    !event.url.pathname.startsWith(endpoint)
      ? await resolve(event)
      : await fetchRequestHandler({
          ...options,
          req: event.request,
          endpoint,
          createContext: (opts) => options?.createContext(opts, event),
        })
}

export type TRPCHandle = ReturnType<typeof createTRPCHandle>
