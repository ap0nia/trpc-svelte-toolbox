import { trpc } from '$lib/trpc'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  return {
    '': trpc.utils[''].prefetch('Elysia'),
    greeting: trpc.utils.greeting.fetch('Aponia'),
    goodbye: trpc.utils.goodbye.ensureData('Kiana'),
  }
}
