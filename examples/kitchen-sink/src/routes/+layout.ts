import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import type { AppRouter } from '$lib/server/trpc/routes'
const url = 'http://localhost:5173/trpc'

export async function load() {
  const trpc = createTRPCSvelte<AppRouter>({
    links: [ httpBatchLink({ url }) ],
  })
  return { trpc }
}
