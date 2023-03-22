import { trpc } from '$lib/trpc'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ data }) => {
  trpc.context.count.setData(data.props)
  return { }
}
