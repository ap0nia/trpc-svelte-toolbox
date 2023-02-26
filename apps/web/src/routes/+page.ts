import type { PageLoad } from './$types'
import { trpc } from '$lib/trpc'

export const load: PageLoad = async () => {
  /**
   * same API as trpc react-query's use context
   */
  const utils = trpc.useContext()

  /**
   * fetch the count query (and any others desired) and cache it before the page loads
   */

  /**
   * don't fetch the greeting; it should briefly be undefined
   */
  // const queries = await Promise.all([ utils.count.fetch() ])

  /**
   * don't fetch either; both should briefly be undefined
   */
  // const queries = await Promise.all([ ])

  /**
   * fetch both; both should be defined on mount; the requests are also successfully batched
   */
  const queries = await Promise.all([ utils.count.fetch(), utils.greeting.fetch() ])

  return { queries }
}
