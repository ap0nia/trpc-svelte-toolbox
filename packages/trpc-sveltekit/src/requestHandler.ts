import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { AnyRouter } from '@trpc/server'
import type { RequestHandler } from '@sveltejs/kit'
import type { TRPCHandleOptions } from './types'

const defaultEndpoint = '/trpc'

/**
 * Create `RequestHandler` function for SvelteKit `+server.ts`, e.g. GET, POST, etc.
 */
export function createTRPCRequestHandler<T extends AnyRouter>(
  options: TRPCHandleOptions<T>
): RequestHandler {
  const endpoint = options.endpoint ?? defaultEndpoint

  return (event) =>
    event.url.pathname.startsWith(endpoint)
      ? fetchRequestHandler({
          ...options,
          req: event.request,
          endpoint,
          createContext: (opts) => options?.createContext(opts, event),
        })
      : new Response('Invalid tRPC endpoint')
}
