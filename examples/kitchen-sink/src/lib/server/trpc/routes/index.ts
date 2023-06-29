import { z } from 'zod'
import { router, procedure } from '../init'

let db: Record<string, string> = {}
let pages: string[] = ['home', 'about', 'contact']

export const appRouter = router({
  '': procedure.input(z.string().nullish()).query(async ({ input }) => {
    return `Hello, ${input}!`
  }),

  greeting: procedure.input(z.string().nullish()).query(async ({ input }) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `Salutations, ${input}!`
  }),

  goodbye: procedure.input(z.string().nullish()).query(async ({ input }) => {
    return `Farewell, ${input}!`
  }),

  infinite: procedure.input(z.object({ cursor: z.number() })).query(async ({ input }) => {
    const page = pages[input.cursor]
    return page
  }),

  addName: procedure.input(z.string()).mutation(async ({ input }) => {
    db[input] = input
    return db
  }),

  getName: procedure.input(z.string()).query(async ({ input }) => {
    const name = db[input]
    return name
  }),

  addCookie: procedure.query(async ({ ctx }) => {
    ctx.opts.resHeaders.append('set-cookie', ctx.event.cookies.serialize('test', 'test', { path: '/' }))
    return true
  }),

  deleteCookie: procedure.query(async ({ ctx }) => {
    ctx.opts.resHeaders.append('set-cookie', ctx.event.cookies.serialize('test', 'test', { maxAge: 0, path: '/'}))
    return true
  })
})

export type AppRouter = typeof appRouter
