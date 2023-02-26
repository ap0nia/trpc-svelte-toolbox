/**
 * setup tRPC + svelte-query client for the *client*
 * @remarks load functions must use a special tRPC client (@see +layout.ts) that shares the same queryClient
 */

import { httpBatchLink } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@apps/server/src'
import { createTRPCSvelte } from '@packages/svelte-query'
import { queryClient } from '$lib/queryClient'

/**
 * Initialize tRPC + svelte-query with the router definition
 */
export const trpc = createTRPCSvelte<AppRouter>({
  reactQueryContext: queryClient,
})

const url = import.meta.env.DEV ? 'http://localhost:5173/trpc' : 'http://localhost:4173/trpc'

/**
 * initialize a client with the same router definition
 */
const client = trpc.createClient({
  links: [ httpBatchLink({ url }) ],
})

/**
 * initialize the tRPC context with the Provider function
 */
trpc.Provider({ queryClient, client })

// helpful types to infer input/output from the tRPC router
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
