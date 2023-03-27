import { z } from 'zod'
import { router, procedure } from '../init'

export const appRouter = router({
  '': procedure.input(z.string().nullish()).query(async ({ input }) => {
    return `Hello, ${input}!`
  })
})

export type AppRouter = typeof appRouter
