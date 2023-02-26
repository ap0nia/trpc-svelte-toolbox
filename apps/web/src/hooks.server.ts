// hooks.server.ts
import { appRouter } from '@apps/server/src';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';

export const handle: Handle = createTRPCHandle({ router: appRouter });
