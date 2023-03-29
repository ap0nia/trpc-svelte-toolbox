import { createTRPCUntypedClient, httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query-alpha'
import { QueryClient } from '@tanstack/svelte-query'
import type { AppRouter } from './server/trpc/routes'
import type { AnyQueryProcedure, AnyRouter, inferProcedureInput, inferProcedureOutput } from '@trpc/server'

const url = 'http://localhost:5173/trpc'

export const queryClient: any = new QueryClient({})

export const trpc = createTRPCSvelte<AppRouter>({
  links: [ httpBatchLink({ url }) ],
}, queryClient)

export const client = createTRPCUntypedClient<AppRouter>({
  links: [ httpBatchLink({ url }) ],
})



type Mapped<T> = {
  [k in keyof T]: 
    T[k] extends AnyRouter ? Mapped<T[k]> :
    T[k] extends AnyQueryProcedure ? (input: inferProcedureInput<T[k]>) => T[k]
  : never
}

type ParseArray<Left extends unknown[], Right extends unknown[] = []> = 
  Left extends [] ? [] : 
  Left extends [infer Head] ? [...Right, Head] :
  Left extends [infer Head, ...infer Tail] ? ParseArray<Tail, [...Right, Head]> :
  unknown[] extends Left ? Left : []


type Results<T extends any[]> = {
  [k in keyof T]: inferProcedureOutput<T[k]>
}

type TRPCUseQueries = 
  <TQueryOptions extends any[]>(callback: (t: Mapped<AppRouter>) => readonly [...ParseArray<TQueryOptions>]) 
=> Results<TQueryOptions>;

let x: TRPCUseQueries = undefined as any

let y = x((t) => {
  let a = t.greeting()
  let b = t['']()
  return [a, b]
})

export type Y = typeof y
