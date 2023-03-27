import db from '$lib/server/db'
import { customers } from '$rizz/schema'
import { router, procedure } from '../init'

export const appRouter = router({
  customers: procedure.query(async () => {
    const allCustomers = db.select().from(customers).prepare().all()
    return allCustomers
  })
})

export type AppRouter = typeof appRouter
