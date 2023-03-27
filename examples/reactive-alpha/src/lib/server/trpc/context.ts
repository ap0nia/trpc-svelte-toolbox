import type { RequestEvent } from '@sveltejs/kit'
import { inferAsyncReturnType } from '@trpc/server'

export const createContext = (event: RequestEvent) => ({ event })
export type Context = inferAsyncReturnType<typeof createContext>
