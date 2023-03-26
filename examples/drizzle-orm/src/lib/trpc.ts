import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import type { AppRouter } from '$lib/server/trpc/routes'

export const trpc = createTRPCSvelte<AppRouter>({
  links: [
    httpBatchLink({ url: 'http://localhost:5173/api/trpc' })
  ]
}, {
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      staleTime: Infinity,
    }
  }
})
