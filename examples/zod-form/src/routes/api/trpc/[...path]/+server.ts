import { appRouter } from '$lib/server/trpc/routes'
import type { RequestHandler } from './$types'
import { createTRPCRequestHandler } from '@bevm0/trpc-sveltekit'

/**
 * Handle a request to the tRPC API.
 */
const requestHandler = createTRPCRequestHandler({
  router: appRouter,
  endpoint: '/api/trpc',
  createContext: (opts, event) => ({ opts, event })
})

export const GET: RequestHandler = requestHandler
export const POST: RequestHandler = requestHandler
