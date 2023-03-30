import type { FetchCreateContextFnOptions, FetchHandlerRequestOptions } from '@trpc/server/adapters/fetch'
import type { AnyRouter, inferRouterContext } from '@trpc/server'
import type { RequestEvent } from '@sveltejs/kit'

/**
 * Make the specified keys of `T` optional.
 */
type OptionalKeys<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>

/**
 * Override properties of `Left` with any from `Right`.
 */
type Override<Left, Right> = Omit<Left, keyof Right> & Right

/**
 * Modified `createContext` function gets event from SvelteKit `RequestEvent`
 * and opts from the `fetchRequestHandler` callback.
 */
type CreateContext<TRouter extends AnyRouter, TRouteParams extends RouteParams, TRouteId extends RouteId> = (
  opts: FetchCreateContextFnOptions,
  event: RequestEvent<TRouteParams, TRouteId>
) => inferRouterContext<TRouter>

/**
 * Make some default tRPC fetch handler options optional.
 */
type OptionalOptions<T extends AnyRouter> = OptionalKeys<FetchHandlerRequestOptions<T>, 'req' | 'endpoint'>

/**
 * Options for `createTRPCHandle`.
 */
export type TRPCHandleOptions<
  TRouter extends AnyRouter,
  TRouteParams extends RouteParams = RouteParams,
  TRouteId extends RouteId = RouteId
> = Override<
  OptionalOptions<TRouter>,
  {
    createContext: CreateContext<TRouter, TRouteParams, TRouteId>
  }
>

export type RouteParams = Partial<Record<string, string>>
export type RouteId = string | null
