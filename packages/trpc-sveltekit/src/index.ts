import { FetchHandlerRequestOptions, fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { AnyRouter, inferRouterContext } from '@trpc/server'
import type { Handle, RequestEvent } from '@sveltejs/kit'

export type MaybePromise<T> = T | Promise<T>

export type Url = `/${string}`

export type Options<T extends AnyRouter> = FetchHandlerRequestOptions<T> & {
  createContext?: (event: RequestEvent) => MaybePromise<inferRouterContext<T>>
  url?: Url
}

const defaultUrl = '/trpc'

export function createTRPCHandle<T extends AnyRouter>(options: Options<T>) {
  const handle: Handle = async ({ event, resolve }) => {
    if (!event.url.pathname.startsWith(options.url ?? defaultUrl)) {
      return await resolve(event)
    }
    const response = await fetchRequestHandler({
      ...options,
      router: options.router,
      req: event.request,
      endpoint: event.url.pathname.slice((options.url ?? defaultUrl).length + 1)
    })
    return response
  }
  return handle
}
