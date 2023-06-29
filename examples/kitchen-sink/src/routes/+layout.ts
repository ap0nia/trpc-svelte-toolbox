import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import { QueryClient } from '@tanstack/svelte-query'
import type { AppRouter } from '$lib/server/trpc/routes'
import { url } from '$lib/trpc'
import { browser } from '$app/environment'

export async function load(event) {
  /**
   * Each user should initialize their own query client for the website.
   * The tRPC proxy itself can remain the same since it uses `useQueryClient` 
   * to figure out the query client, which will be set in +layout.svelte
   */
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  })

  /**
   * Initialize a new tRPC client that uses 
   * SvelteKit's special fetch function instead of the global fetch, and the new query client.
   * This also seems to prevent the second fetching on component mount (for some reason).
   *
   * This `trpc` should be used by load functions, e.g. `const { trpc } = await parent()`
   * Another `trpc` is initializd in `$lib/trpc` for use in components.
   * 
   * `trpc` can't be initialized in +layout.server.ts unfortunately, 
   * because "functions aren't serializable"
   */
  const trpc = createTRPCSvelte<AppRouter>({
    links: [ 
      httpBatchLink({ url, fetch: event.fetch })
    ],
  }, { svelteQueryContext: queryClient })

  return { 
    trpc,
    mei: trpc.context.greeting.fetch('Mei')
  }
}
