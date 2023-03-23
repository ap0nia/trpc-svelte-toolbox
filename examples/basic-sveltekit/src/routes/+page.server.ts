import { trpc } from '$lib/trpc'
import type { PageServerLoad  } from './$types'

export const load: PageServerLoad = async () => {
  return { 
    a: trpc.utils.count.fetch(1),
    b: trpc.utils.count.fetch(1),
    c: trpc.utils.count.fetch(1),
  }
}
