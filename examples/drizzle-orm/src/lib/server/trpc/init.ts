import { initTRPC } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()
export const { procedure, router, mergeRouters, middleware, _config } = t
