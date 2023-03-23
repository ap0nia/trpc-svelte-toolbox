import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import { QueryClient } from '@tanstack/svelte-query'
import type { AppRouter } from './routes'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      staleTime: Infinity,
    }
  }
})

export const trpc = createTRPCSvelte<AppRouter>({
  links: [
    httpBatchLink({ url: 'http://localhost:5173/trpc' })
  ]
}, queryClient)
