import type { RequestEvent } from '@sveltejs/kit'
import type { inferAsyncReturnType } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export const createContext = (opts: FetchCreateContextFnOptions, event: RequestEvent) => ({ opts, event })
export type Context = inferAsyncReturnType<typeof createContext>
