import { getContext, setContext } from 'svelte'
import { writable, get } from 'svelte/store'
import type { Writable } from 'svelte/store'
import { createTRPCUntypedClient } from '@trpc/client'
import { createFlatProxy } from '@trpc/server/shared'
import type { QueryClient } from '@tanstack/svelte-query'
import type { CreateTRPCProxyClient, CreateTRPCClientOptions } from '@trpc/client'
import type { AnyRouter } from '@trpc/server'
import type { TRPCSvelteQueryRouter, CreateQueries } from './query'
import type { ContextRouter } from './context'

interface TRPCSvelteQueryProxyRoot<T extends AnyRouter> {
  client: CreateTRPCProxyClient<T>
  queryClient: QueryClient
  context: ContextRouter<T>
  getContext: () => ContextRouter<T>
  createQueries: CreateQueries<T>
}

type TRPCSvelteQueryProxy<T extends AnyRouter> = TRPCSvelteQueryRouter<T> &
  TRPCSvelteQueryProxyRoot<T>

const TRPC_CONTEXT_KEY = Symbol('TRPC_CONTEXT_KEY')

function getTRPCContext() {
  return getContext<any>(TRPC_CONTEXT_KEY)
}

function createTRPCSvelteQueryProxy<T extends AnyRouter>(
  context?: unknown
): TRPCSvelteQueryProxy<T> {
  return createFlatProxy<TRPCSvelteQueryProxy<T>>(
    (initialKey) => context ?? getTRPCContext()[initialKey]
  )
}

export function createTRPCSvelte<T extends AnyRouter>(
  trpcClientOptions: CreateTRPCClientOptions<T>
): TRPCSvelteQueryProxy<T> {
  const untypedClient = createTRPCUntypedClient<T>(trpcClientOptions)
  const proxy = createTRPCSvelteQueryProxy<T>(untypedClient)
  return proxy
}
