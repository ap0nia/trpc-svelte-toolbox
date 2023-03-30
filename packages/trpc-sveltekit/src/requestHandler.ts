import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { AnyRouter } from '@trpc/server'
import type { RequestHandler } from '@sveltejs/kit'
import type { TRPCHandleOptions, RouteParams, RouteId } from './types'

/**
 * Create `RequestHandler` function for SvelteKit `+server.ts`, e.g. GET, POST, etc.
 * e.g. Default file location `src/routes/trpc/[...path]/+server.ts`
 *
 * @experimental If endpoint isn't provided, it will be inferred from the pathname.
 * e.g. if pathname is '/api/trpc/,a,b,c', where '/a,b,c' are params, the endpoint will be '/api/trpc'
 */
export function createTRPCRequestHandler<
  TRouter extends AnyRouter,
  TRouteParams extends RouteParams = RouteParams,
  TRouteId extends RouteId = RouteId
>(options: TRPCHandleOptions<TRouter, TRouteParams, TRouteId>): RequestHandler<TRouteParams, TRouteId> {
  return (event) =>
    fetchRequestHandler({
      ...options,
      req: event.request,
      endpoint: options.endpoint ?? event.url.pathname.substring(0, event.url.pathname.lastIndexOf('/')),
      createContext: (opts) => options?.createContext(opts, event),
    })
}

export type TRPCRequestHandler = ReturnType<typeof createTRPCRequestHandler>
