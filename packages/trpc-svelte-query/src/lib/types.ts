import type { TRPCRequestOptions } from '@trpc/client'
import type { MaybePromise } from '@trpc/server'
import type { QueryClient } from '@tanstack/svelte-query'

export interface TRPCSvelteRequestOptions extends Omit<TRPCRequestOptions, 'signal'> {
  abortOnUnmount?: boolean
}

export interface TRPCOptions {
  trpc?: TRPCSvelteRequestOptions
}

export interface InfiniteQueryInput {
  cursor?: unknown
}

export interface CreateMutationOverride {
  onSuccess: (opts: {
    originalFn: () => MaybePromise<unknown>
    queryClient: QueryClient
    meta: Record<string, unknown>
  }) => MaybePromise<unknown>
}

export interface CreateTRPCSvelteOptions {
  overrides?: {
    createMutation?: Partial<CreateMutationOverride>
  }
  abortOnUnmount?: boolean
  svelteQueryContext?: QueryClient
}
