import { createTRPCUntypedClient, httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query-alpha'
import { QueryClient } from '@tanstack/svelte-query'
import type { AppRouter } from './server/trpc/routes'

const url = 'http://localhost:5173/trpc'

export const queryClient: any = new QueryClient({})

export const trpc = createTRPCSvelte<AppRouter>({
  links: [ httpBatchLink({ url }) ],
}, queryClient)

export const client = createTRPCUntypedClient<AppRouter>({
  links: [ httpBatchLink({ url }) ],
})
