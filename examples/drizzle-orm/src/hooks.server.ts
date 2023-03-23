import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { Handle } from '@sveltejs/kit';
import { appRouter } from '$lib/trpc/routes'

export const handle: Handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith('/trpc')) {
    return await resolve(event)
  }
  const response = fetchRequestHandler({
    endpoint: '/trpc',
    req: event.request,
    router: appRouter,
    createContext: () => event
  });
  return response
}
