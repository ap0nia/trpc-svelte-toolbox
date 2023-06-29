import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
  const { trpc } = await parent()

  return {
    '': trpc.context[''].prefetch('Elysia'),
    greeting: trpc.context.greeting.fetch('Aponia'),
    goodbye: trpc.context.goodbye.ensureData('Kiana'),
  }
}
