import { z } from 'zod'
import { EventEmitter } from 'events'
import { router, procedure } from '../server';
import { observable } from '@trpc/server/observable';

export const emitter = new EventEmitter();

export const appRouter = router({
  send: procedure.input(z.string()).mutation(({ input }) => {
    emitter.emit('message', input)
  }),

  receive: procedure.subscription(async () => {
    return observable<string>((emit) => {
      const broadcastMessage = (message: string) => emit.next(message)
      emitter.on('message', broadcastMessage)
      return () => {
        emitter.off('message', broadcastMessage)
      }
    })
  })
});

export type AppRouter = typeof appRouter
