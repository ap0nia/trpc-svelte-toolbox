import createTRPCHandle from '@bevm0/trpc-sveltekit'
import { router } from '$lib/server/trpc'

export const handle = createTRPCHandle({ router, createContext: () => ({}) })
