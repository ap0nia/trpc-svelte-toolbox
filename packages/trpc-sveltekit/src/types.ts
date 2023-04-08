import type { RequestEvent } from '@sveltejs/kit'
import type { AnyRouter, inferRouterContext } from '@trpc/server'
import type { FetchCreateContextFnOptions, FetchHandlerRequestOptions } from '@trpc/server/adapters/fetch'

/**
 * Make the specified keys of `T` optional.
 */
type OptionalKeys<T, Keys extends keyof T> = Omit<T, Keys> & Partial<Pick<T, Keys>>

/**
 * Override properties of `Left` with any from `Right`.
 */
type Override<Left, Right> = Omit<Left, keyof Right> & Right

export type TRPCSvelteContextOptions<
  TRouteParams extends RouteParams = RouteParams,
  TRouteId extends RouteId = RouteId
> = {
  opts: FetchCreateContextFnOptions,
  event: RequestEvent<TRouteParams, TRouteId>
}


/**
 * Modified `createContext` function gets event from SvelteKit `RequestEvent` and
 * opts from the `fetchRequestHandler` callback.
 */
export type CreateContext<TRouter extends AnyRouter, TRouteParams extends RouteParams, TRouteId extends RouteId> = (
  options: TRPCSvelteContextOptions<TRouteParams, TRouteId>
) => inferRouterContext<TRouter>

/**
 * Make some default tRPC fetch handler properties optional.
 */
type OptionalOptions<T extends AnyRouter> = OptionalKeys<FetchHandlerRequestOptions<T>, 'req' | 'endpoint'>

/**
 * Options to create a request handler.
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

/**
 * Default `RouteParams` SvelteKit generic for `RequestHandler` and `RequestEvent`.
 */
export type RouteParams = RequestEvent['params']

/**
 * Default `RouteId` SvelteKit generic for `RequestHandler` and `RequestEvent`.
 */
export type RouteId = RequestEvent['route']['id']
