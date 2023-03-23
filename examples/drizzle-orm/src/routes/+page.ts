import { trpc } from '$lib/trpc/client'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  return {
    customers: trpc.utils.customers.fetch()
  }
}
