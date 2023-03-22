import { trpc } from '$lib/trpc'
import type { PageServerLoad  } from './$types'

export const load: PageServerLoad = async () => {
  const props =  await trpc.context.count.fetch(1)
  return { props }
}
