import type {
  FetchCreateContextFnOptions,
  FetchHandlerRequestOptions,
} from '@trpc/server/adapters/fetch'
import type { AnyRouter, inferRouterContext } from '@trpc/server'
import type { RequestEvent } from '@sveltejs/kit'

/**
 * Make the specified keys of `T` optional.
 */
type OptionalKeys<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>

/**
 * Override properties of `T` with any from `U`.
 */
type Override<T, U> = Omit<T, keyof U> & U

/**
 * Modified `createContext` function gets event from SvelteKit `RequestEvent`
 * and opts from the `fetchRequestHandler` callback.
 */
type CreateContext<T extends AnyRouter> = (
  opts: FetchCreateContextFnOptions,
  event: RequestEvent
) => inferRouterContext<T>

/**
 * Make some default tRPC fetch handler options optional.
 */
type OptionalOptions<T extends AnyRouter> = OptionalKeys<
  FetchHandlerRequestOptions<T>,
  'req' | 'endpoint'
>

/**
 * Options for `createTRPCHandle`.
 */
export type TRPCHandleOptions<T extends AnyRouter> = Override<
  OptionalOptions<T>,
  {
    createContext: CreateContext<T>
  }
>
