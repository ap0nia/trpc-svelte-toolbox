import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared'
import type { CreateQueryOptions } from '@tanstack/svelte-query'
import type { TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import { getQueryKeyInternal } from '../../helpers/getQueryKey'
import type { CreateQueriesProxy } from './types'

export type CreateCreateQueriesProxy = <T extends AnyRouter>(
  client: TRPCUntypedClient<T>
) => CreateQueriesProxy<T>

export function createCreateQueriesProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>
): CreateQueriesProxy<T> {
  const innerCreateQueriesProxy = createRecursiveProxy((options) => {
    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const path = pathCopy.join('.')

    const [input, ...rest] = anyArgs

    const queryOptions = {
      queryKey: getQueryKeyInternal(pathCopy, input, 'query'),
      queryFn: async (_context) =>
        await client.query(path, input, {
          ...rest?.trpc,
        }),
      ...rest,
    } satisfies CreateQueryOptions

    return queryOptions
  }) as CreateQueriesProxy<T>

  const createQueriesProxy = createFlatProxy<CreateQueriesProxy<T>>(
    (initialKey) => innerCreateQueriesProxy[initialKey]
  )
  return createQueriesProxy
}
