import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
  const { trpc } = await parent()

  return {
    mei: trpc.context.greeting.fetch('Mei')
  }
}
