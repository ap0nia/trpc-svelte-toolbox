import { appRouter } from '$lib/server/trpc/routes'
import { createTRPCRequestHandler } from '@bevm0/trpc-sveltekit'

const requestHandler = createTRPCRequestHandler({
  router: appRouter,
  createContext(opts, event) {
      return { event, opts }
  },
})

export const GET = requestHandler
export const POST = requestHandler
