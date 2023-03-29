import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import { QueryClient } from '@tanstack/svelte-query'
import type { AppRouter } from './server/trpc/routes'
// import { browser } from '$app/environment'

const url = 'http://localhost:5173/trpc'

/**
 * The server will initialize its own tRPC + svelte-query clients.
 * Beware of this since the server cache will outlive client caches,
 * and can leak data into the individual clients?
 */
export const queryClient: any = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Only enable in the browser
       */
       // enabled: browser,

      /**
       * Explicitly prevent refetching on mount.
       */
      // refetchOnMount: false,

      /**
       * Set to > 0 to prevent immediate refetching after load
       */
      // staleTime: 1000 * 60 * 60 * 24,
    }
  }
})

export const trpc = createTRPCSvelte<AppRouter>({
  links: [ httpBatchLink({ url }) ],
}, queryClient)
