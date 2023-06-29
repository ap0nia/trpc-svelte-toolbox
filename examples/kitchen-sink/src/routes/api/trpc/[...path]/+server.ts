import { appRouter } from '$lib/server/trpc/routes'
import type { AppRouter } from '$lib/server/trpc/routes'
import { createTRPCRequestHandler } from '@bevm0/trpc-sveltekit'
import type { RouteParams, RouteId } from './$types'
import { createContext } from '$lib/server/trpc/context'
import type { RequestHandler } from './$types'

const trpcRequestHandler = createTRPCRequestHandler<AppRouter, RouteParams, RouteId>({
  router: appRouter,
  createContext
})

const requestHandler: RequestHandler = event => {
  event.request.headers.set('x-organization-handle', event.params.path)
  return trpcRequestHandler(event)
}

export const GET = requestHandler
export const POST = requestHandler
