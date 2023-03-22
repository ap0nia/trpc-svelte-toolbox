import { resolveHTTPResponse } from '@trpc/server/http'
import type { AnyRouter, inferRouterContext } from '@trpc/server'
import type { HTTPRequest } from '@trpc/server/dist/http/internals/types'
import type { HTTPBaseHandlerOptions } from '@trpc/server/dist/http/internals/types'
import type { Handle, RequestEvent } from '@sveltejs/kit'

export type MaybePromise<T> = T | Promise<T>

export type Url = `/${string}`

export interface Options<T extends AnyRouter> extends HTTPBaseHandlerOptions<T, HTTPRequest> {
  createContext?: (event: RequestEvent) => MaybePromise<inferRouterContext<T>>
  router: T
  url?: Url
}

const defaultUrl = '/trpc'

export async function createTRPCHandle<T extends AnyRouter>(options: Options<T>) {
  const handle: Handle = async ({ event }) => {
    const router = options.router
    const createContext = async () => options.createContext?.(event)
    const req = {
      method: event.request.method,
      query: event.url.searchParams,
      headers: Object.fromEntries(event.request.headers.entries()),
      body: await event.request.text(),
    }
    const path = event.url.pathname.slice((options.url ?? defaultUrl).length + 1)

    const fullOptions = { ...options, router, createContext, req, path }

    const httpResponse = await resolveHTTPResponse(fullOptions)

    const response = new Response(httpResponse.body, {
      status: httpResponse.status,
      headers: httpResponse.headers as HeadersInit,
    })

    return response
  }

  return handle
}
