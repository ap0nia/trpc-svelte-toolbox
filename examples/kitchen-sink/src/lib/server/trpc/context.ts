import type { RequestEvent } from '@sveltejs/kit'
import type { inferAsyncReturnType } from '@trpc/server'

export const createContext = (event: RequestEvent) => ({ event })
export type Context = inferAsyncReturnType<typeof createContext>
