/**
 * Setup tRPC + svelte-query client.
 * @remarks load functions must use a special tRPC client (@see +layout.ts) that shares the same queryClient
 */

import superjson from 'superjson'
import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/svelte-query'
import { queryClient } from '$lib/queryClient'
import type { AppRouter } from '$lib/server/trpc'

/**
 * Initialize tRPC + svelte-query with the router definition
 */
export const trpc = createTRPCSvelte<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      fetch(fetchUrl, options) {
        return fetch(fetchUrl, {
          ...options,
          credentials: 'include',
        })
      },
    }),
  ],
}, queryClient)
