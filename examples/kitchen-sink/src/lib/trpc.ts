import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import type { AppRouter } from './server/trpc/routes'

export const url = 'http://localhost:5173/api/trpc'

/**
 * tRPC proxy that uses `useQueryClient` to get and write to the query cache.
 * Should only call this in components.
 */
export const trpc = createTRPCSvelte<AppRouter>({
  links: [ httpBatchLink({ url }) ],
})
