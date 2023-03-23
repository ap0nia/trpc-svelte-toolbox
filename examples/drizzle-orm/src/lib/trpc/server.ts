import { initTRPC } from '@trpc/server'

const t = initTRPC.create()
export const { procedure, router, mergeRouters, middleware, _config } = t
