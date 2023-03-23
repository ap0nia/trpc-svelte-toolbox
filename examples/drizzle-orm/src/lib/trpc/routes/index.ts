import db from '$lib/db'
import { customers } from '$rizz/schema'
import { router, procedure } from '../server'

export const appRouter = router({
  customers: procedure.query(async () => {
    const allCustomers = db.select().from(customers).prepare().all()
    return allCustomers
  })
})

export type AppRouter = typeof appRouter
