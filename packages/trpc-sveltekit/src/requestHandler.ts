import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { AnyRouter } from '@trpc/server'
import type { RequestHandler } from '@sveltejs/kit'
import type { TRPCHandleOptions } from './types'

const defaultEndpoint = '/trpc'

/**
 * Create `RequestHandler` function for SvelteKit `+server.ts`, e.g. GET, POST, etc.
 * e.g. Default file location `src/routes/trpc/[...path]/+server.ts`
 */
export function createTRPCRequestHandler<T extends AnyRouter>(
  options: TRPCHandleOptions<T>
): RequestHandler {
  return async (event) =>
    await fetchRequestHandler({
      ...options,
      req: event.request,
      endpoint: options.endpoint ?? defaultEndpoint,
      createContext: (opts) => options?.createContext(opts, event),
    })
}

export type TRPCRequestHandler = ReturnType<typeof createTRPCRequestHandler>
