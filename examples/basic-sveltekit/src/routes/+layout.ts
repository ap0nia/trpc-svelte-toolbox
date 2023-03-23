import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ data }) => {
  console.log(data)
  return {}
}
