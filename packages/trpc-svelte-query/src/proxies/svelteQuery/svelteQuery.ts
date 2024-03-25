import { get, writable } from 'svelte/store'
import { createRecursiveProxy } from '@trpc/server/shared'
import {
  createInfiniteQuery,
  createMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/svelte-query'
import type {
  QueryClient,
  CreateInfiniteQueryOptions,
  CreateMutationOptions,
  CreateQueryOptions,
} from '@tanstack/svelte-query'
import type { TRPCUntypedClient } from '@trpc/client'
import type { AnyRouter, MaybePromise } from '@trpc/server'
import { isWritable } from '../../extensions/createReactiveQuery'
import { getQueryKeyInternal } from '../../helpers/getQueryKey'
import type { SvelteQueryProxy, TRPCOptions } from './types'

interface CreateMutationOverride {
  onSuccess: (opts: {
    originalFn: () => MaybePromise<unknown>
    queryClient: QueryClient
    meta: Record<string, unknown>
  }) => MaybePromise<unknown>
}

export interface SvelteQueryProxyOptions {
  overrides?: {
    createMutation?: Partial<CreateMutationOverride>
  }
  abortOnUnmount?: boolean
  svelteQueryContext?: QueryClient
}

export function createSvelteQueryProxy<T extends AnyRouter>(
  client: TRPCUntypedClient<T>,
  svelteQueryOptions?: SvelteQueryProxyOptions
): SvelteQueryProxy<T> {
  const svelteProxy = createRecursiveProxy((options) => {
    const anyArgs: any = options.args

    const pathCopy = [...options.path]

    const lastArg = pathCopy.pop() ?? ''

    const path = pathCopy.join('.')

    const input = isWritable(anyArgs[0]) ? get(anyArgs[0]) : anyArgs[0]

    const abortOnUnmount =
      Boolean(svelteQueryOptions?.abortOnUnmount) || Boolean(anyArgs[1]?.trpc?.abortOnUnmount)

    switch (lastArg) {
      case 'createQuery': {
        const queryOptions = {
          queryKey: getQueryKeyInternal(pathCopy, input, 'query'),
          queryFn: async (context) =>
            await client.query(path, input, {
              ...anyArgs[1]?.trpc,
              signal: abortOnUnmount ? context.signal : undefined,
            }),
          ...anyArgs[1],
        } satisfies CreateQueryOptions

        if (!isWritable(anyArgs[0])) {
          return createQuery(queryOptions)
        }

        const inputStore = anyArgs[0]

        const optionsStore = writable<CreateQueryOptions<any>>(queryOptions, (set) => {
          const unsubscribe = inputStore.subscribe((newInput) => {
            set({
              ...queryOptions,
              queryKey: getQueryKeyInternal(pathCopy, newInput, 'query'),
              queryFn: async (context) =>
                await client.query(path, newInput, {
                  ...anyArgs[1]?.trpc,
                  signal: abortOnUnmount ? context.signal : undefined,
                }),
            })
          })

          return unsubscribe
        })

        return createQuery(optionsStore)
      }

      case 'createInfiniteQuery': {
        const infiniteQueryOptions = {
          queryKey: getQueryKeyInternal(pathCopy, input, 'infinite'),
          queryFn: async (context) =>
            await client.query(
              path,
              { ...input, cursor: context.pageParam },
              {
                ...anyArgs[1]?.trpc,
                signal: abortOnUnmount ? context.signal : undefined,
              }
            ),
          ...anyArgs[1],
        } satisfies CreateInfiniteQueryOptions

        if (!isWritable(anyArgs[0])) {
          return createInfiniteQuery(infiniteQueryOptions)
        }

        const inputStore = anyArgs[0]

        const optionsStore = writable<CreateInfiniteQueryOptions & TRPCOptions>(
          infiniteQueryOptions,
          (set) => {
            const unsubscribe = inputStore.subscribe((newInput) => {
              set({
                ...infiniteQueryOptions,
                queryKey: getQueryKeyInternal(pathCopy, newInput, 'infinite'),
                queryFn: async (context) =>
                  await client.query(
                    path,
                    { ...newInput, cursor: context.pageParam },
                    {
                      ...anyArgs[1]?.trpc,
                      signal: abortOnUnmount ? context.signal : undefined,
                    }
                  ),
              })
            })
            return unsubscribe
          }
        )

        return createInfiniteQuery(optionsStore)
      }

      case 'createMutation': {
        const queryClient = svelteQueryOptions?.svelteQueryContext ?? useQueryClient()
        return createMutation({
          mutationKey: [pathCopy],
          mutationFn: async (variables) => await client.mutation(path, variables, anyArgs[0]?.trpc),
          onSuccess(data, variables, context) {
            const originalFn = (): unknown => anyArgs[0]?.onSuccess?.(data, variables, context)
            return svelteQueryOptions?.overrides?.createMutation?.onSuccess != null
              ? svelteQueryOptions.overrides.createMutation.onSuccess({
                  queryClient,
                  meta: anyArgs[0]?.meta,
                  originalFn,
                })
              : originalFn()
          },
          ...anyArgs[0],
        } satisfies CreateMutationOptions)
      }

      case 'createSubscription':
        return client.subscription(path, anyArgs[0], anyArgs[1])

      case '_def':
        return pathCopy

      default:
        throw new TypeError(`trpc.${path}.${lastArg} is not a function`)
    }
  }) as SvelteQueryProxy<T>

  return svelteProxy
}
