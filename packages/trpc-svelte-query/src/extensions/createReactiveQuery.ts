/**
 * Create a properly reactive query.
 * The current recommended way to create queries is incorect: https://tanstack.com/query/latest/docs/svelte/reactivity.
 * The entire query observer is re-calculated, which prevents "keepPreviousData" from working properly.
 *
 * It's been implemented correctly on the svelte-query alpha branch.
 *
 * Issue: https://github.com/TanStack/query/issues/4851
 * PR: https://github.com/TanStack/query/pull/5050
 * Reference implementation: https://github.com/TanStack/query/blob/alpha/packages/svelte-query/src/createBaseQuery.ts
 */

import { derived, get, readable, writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { notifyManager, useQueryClient } from '@tanstack/svelte-query'
import type {
  QueryObserver,
  QueryClient,
  QueryKey,
  CreateQueryResult,
  QueryObserverOptions,
} from '@tanstack/svelte-query'

export type MaybeWritable<T> = T | Writable<T>

export const isWritable = <T>(obj: MaybeWritable<T>): obj is Writable<T> =>
  obj != null && typeof obj === 'object' && 'subscribe' in obj && 'set' in obj && 'update' in obj

export function createReactiveQuery<
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends QueryKey
>(
  options: MaybeWritable<QueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>>,
  Observer: typeof QueryObserver,
  queryClient: QueryClient = useQueryClient()
): CreateQueryResult<TData, TError> {
  const optionsStore = isWritable(options) ? options : writable(options)

  const defaultOptionsStore = derived(optionsStore, ($options) => {
    const defaultOptions = queryClient.defaultQueryOptions($options)
    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    defaultOptions._optimisticResults = 'optimistic'

    // if (defaultOptions.onError != null) {
    //   defaultOptions.onError = notifyManager.batchCalls(defaultOptions.onError)
    // }

    // if (defaultOptions.onSuccess != null) {
    //   defaultOptions.onSuccess = notifyManager.batchCalls(defaultOptions.onSuccess)
    // }

    // if (defaultOptions.onSettled != null) {
    //   defaultOptions.onSettled = notifyManager.batchCalls(defaultOptions.onSettled)
    // }

    return defaultOptions
  })

  const observer = new Observer<TQueryFnData, TError, TData, TQueryData, TQueryKey>(
    queryClient,
    get(defaultOptionsStore)
  )

  defaultOptionsStore.subscribe(($defaultedOptions) => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    observer.setOptions($defaultedOptions, { listeners: false })
  })

  const result = readable(observer.getCurrentResult(), (set) =>
    observer.subscribe(notifyManager.batchCalls(set))
  )

  const { subscribe } = derived(result, ($result) => {
    // eslint-disable-next-line no-param-reassign
    $result = observer.getOptimisticResult(get(defaultOptionsStore))
    return get(defaultOptionsStore).notifyOnChangeProps == null
      ? observer.trackResult($result)
      : $result
  })

  return { subscribe }
}
