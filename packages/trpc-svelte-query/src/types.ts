import type { TRPCRequestOptions } from '@trpc/client'
import type { MaybePromise } from '@trpc/server'
import type { QueryClient } from '@tanstack/svelte-query'

interface TRPCSvelteRequestOptions extends Omit<TRPCRequestOptions, 'signal'> {
  /**
   * Opt out or into aborting request on unmount
   */
  abortOnUnmount?: boolean
}

/**
 * Additional tRPC options can appended to svelte-query options under a `tRPC` property.
 */
export interface TRPCOptions {
  trpc?: TRPCSvelteRequestOptions
}

/**
 * Infinite queries must have the "cursor" property in the input.
 */
export interface InfiniteQueryInput {
  cursor?: unknown
}

/**
 * Override properites for all mutations
 */
export interface CreateMutationOverride {
  onSuccess: (opts: {
    /**
     * Calls the original function that was defined in the query's `onSuccess` option
     */
    originalFn: () => MaybePromise<unknown>
    queryClient: QueryClient
    meta: Record<string, unknown>
  }) => MaybePromise<unknown>
}

/**
 * TODO: make generic interface when applicable in the future.
 */
export interface CreateTRPCSvelteOptions {
  /**
   * Override behaviors of the built-in hooks
   */
  overrides?: {
    createMutation?: Partial<CreateMutationOverride>
  }

  /**
   * Abort all queries when unmounting
   * @default false
   */
  abortOnUnmount?: boolean

  /**
   * Override the default Svelte Query context
   * @default undefined
   */
  svelteQueryContext?: QueryClient
}
