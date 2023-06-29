import type { CreateContext } from '@bevm0/trpc-sveltekit'
import type { inferAsyncReturnType } from '@trpc/server'

export const createContext: CreateContext<any, any, any> = (context) => (context)
export type Context = inferAsyncReturnType<typeof createContext>
