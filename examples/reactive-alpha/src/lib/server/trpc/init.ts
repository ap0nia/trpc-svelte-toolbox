import { initTRPC } from '@trpc/server'
import type { Context } from './context'

const trpc = initTRPC.context<Context>().create({})

export const { procedure, router, middleware, mergeRouters, _config } = trpc
