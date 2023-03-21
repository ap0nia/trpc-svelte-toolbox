import type { AnyRouter } from '@trpc/server'
import type { TRPCSvelteQueryProcedure } from './query'
import type { ContextRouter } from './context'

/**
 * Map all properties of a tRPC router to svelte-query methods.
 */
export type TRPCSvelteQueryRouter<T extends AnyRouter> = 
{
  [k in keyof T]: T[k] extends AnyRouter ? TRPCSvelteQueryRouter<T[k]> : TRPCSvelteQueryProcedure<T[k]>
} &
{
  context(): ContextRouter<T>
}

