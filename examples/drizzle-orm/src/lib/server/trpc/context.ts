import type { inferAsyncReturnType } from '@trpc/server'
import type { RequestEvent } from '@sveltejs/kit'

export const createContext = (event: RequestEvent) => ({ event })
export type Context = inferAsyncReturnType<typeof createContext>
