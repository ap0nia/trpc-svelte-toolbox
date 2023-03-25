import { initTRPC } from '@trpc/server'
// import type { Context } from './context'
// const t = initTRPC.context<Context>().create()

const t = initTRPC.create()

export const { procedure, router, middleware, mergeRouters, _config } = t
