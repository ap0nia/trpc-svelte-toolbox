import { createWSClient, httpBatchLink, wsLink } from '@trpc/client';
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query'
import type { TRPCSvelteQueryProxy } from '@bevm0/trpc-svelte-query'
import { browser } from '$app/environment';
import type { AppRouter } from '$lib/trpc/router';

/**
 * configure TRPCClient to use WebSockets transport
 */
export const trpc = createTRPCSvelte<AppRouter>({
  links: [ 
    httpBatchLink({ url: 'http://localhost:3001/trpc' })
  ],
});

export let wsTrpc: TRPCSvelteQueryProxy<AppRouter>

export let wsClient: ReturnType<typeof createWSClient>

/**
 * Can only initialize websockets in the browser.
 */
if (browser) {
  wsClient = createWSClient({ url: `ws://localhost:3001` });
  wsTrpc = createTRPCSvelte<AppRouter>({
    links: [ wsLink({ client: wsClient }) ],
  });
}
