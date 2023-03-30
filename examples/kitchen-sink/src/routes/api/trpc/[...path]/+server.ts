import { appRouter } from '$lib/server/trpc/routes'
import type { AppRouter } from '$lib/server/trpc/routes'
import { createTRPCRequestHandler } from '@bevm0/trpc-sveltekit'
import type { RouteParams, RouteId } from './$types'

const requestHandler = createTRPCRequestHandler<AppRouter, RouteParams, RouteId>({
  router: appRouter,
  createContext: (opts, event) => ({ event, opts })
})

export const GET = requestHandler
export const POST = requestHandler
