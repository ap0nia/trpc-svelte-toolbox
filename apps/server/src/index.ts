import { initTRPC } from '@trpc/server'

export const trpc = initTRPC.create()

const { router, procedure } = trpc

export const appRouter = router({
  greeting: procedure.query(() => {
    return 'Hello world!'
  }),

  count: procedure.query(() => {
    return 100
  })
})

export type AppRouter = typeof appRouter
