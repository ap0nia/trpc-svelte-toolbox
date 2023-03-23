import { trpc } from '$lib/trpc'
import type { PageServerLoad  } from './$types'

export const load: PageServerLoad = async (event) => {
  const a = await trpc.context.count.fetch(1, undefined, { event })
  const b = await trpc.context.count.fetch(1, undefined, { event })
  const c = await trpc.context.count.fetch(1, undefined, { event })

  console.log('page server', event.locals)

  return { a, b, c }
}
