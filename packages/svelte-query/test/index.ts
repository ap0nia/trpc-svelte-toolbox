import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import type { TRPCSvelteQueryRouter } from '../src'

const infinite = z.object({
  cursor: z.number(),
})

const t = initTRPC.create()

const router = t.router({
  a: t.procedure.query(() => 1),
  b: t.procedure.mutation(() => 'yeet'),
  c: t.router({
    d: t.procedure.input(infinite).query(() => 'yeet'),
    e: t.procedure.mutation(() => 'yeet'),
  })
})

type Router = typeof router
type Test = TRPCSvelteQueryRouter<Router>

let test: Test

test.a.createQuery(undefined, {})
test.c.d.createInfiniteQuery
let context = test.context()
