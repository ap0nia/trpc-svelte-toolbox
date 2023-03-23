import { z } from 'zod'
import superjson from 'superjson'
import { initTRPC } from '@trpc/server'

const t = initTRPC.create({
  transformer: superjson,
})

export const router = t.router({
  count: t.procedure.input(z.number()).query(({ input }) => input),
  hello: t.procedure.input(z.string()).query(({ input }) => input),
})

export type AppRouter = typeof router
