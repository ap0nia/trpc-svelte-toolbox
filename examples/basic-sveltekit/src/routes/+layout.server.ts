import superjson from 'superjson'
import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import { queryClient } from '$lib/queryClient'
import type { AppRouter } from '$lib/server/trpc'
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
  const trpc = createTRPCSvelte<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({ url: 'http://localhost:5173/trpc', fetch }),
    ],
  }, queryClient)

  return { };
};
