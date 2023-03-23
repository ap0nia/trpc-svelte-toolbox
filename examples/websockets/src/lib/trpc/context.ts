import type { IncomingMessage } from 'http';
import type { inferAsyncReturnType } from '@trpc/server'
import type { RequestEvent } from '@sveltejs/kit'
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http';
import type ws from 'ws'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (
  event: RequestEvent |  NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => event

export type Context = inferAsyncReturnType<typeof createContext>;
