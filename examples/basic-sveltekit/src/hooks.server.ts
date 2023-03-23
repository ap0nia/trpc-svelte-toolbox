import { createTRPCHandle } from '@bevm0/trpc-sveltekit'
import { router } from '$lib/server/trpc'
import type { HandleFetch } from '@sveltejs/kit'

export const handle = createTRPCHandle({ router })

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  if (!event.locals.request) {
    event.locals.request = []
  }
  event.locals.request.push(event.url.href)
  return fetch(request)
}
