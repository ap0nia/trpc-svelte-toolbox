import createTRPCHandle from '@bevm0/trpc-sveltekit'
import { appRouter } from '$lib/trpc/router'
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(
  ({ event, resolve }) => {
    console.log('connection: ', event.request.headers.get('connection'))
    return resolve(event)
  },
  createTRPCHandle({ router: appRouter, createContext: () => ({}) })
)
