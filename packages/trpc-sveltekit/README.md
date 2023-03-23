# `@bevm0/trpc-sveltekit`

> Move fast and break nothing.  
> End-to-end typesafe APIs for your  
> SvelteKit applications.

## Quickstart

### Install the package and its dependencies:

```bash
# npm
npm install @bevm0/trpc-sveltekit @trpc/client @trpc/server

# Yarn
yarn add @bevm0/trpc-sveltekit @trpc/client @trpc/server

# pnpm
pnpm add @bevm0/trpc-sveltekit @trpc/client @trpc/server
```

<div id="create-a-trpc-context"></div>

### Create a [tRPC context](https://trpc.io/docs/context):

```ts
// src/lib/trpc/context.ts
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

export async function createContext(event: RequestEvent) {
  return { event, ... };
}

export type Context = inferAsyncReturnType<typeof createContext>;
```

<div id="create-your-trpc-router"></div>

### Create your [tRPC router](https://trpc.io/docs/router):

```ts
// src/lib/trpc/router.ts
import delay from 'delay';
import { initTRPC } from '@trpc/server';
import type { Context } from '$lib/trpc/context';

const t = initTRPC.context<Context>().create();
export const { router, procedure } = t

export const appRouter = router({
  greeting: procedure.query(async () => {
    await delay(500); // 👈 simulate an expensive operation
    return `Hello tRPC v10 @ ${new Date().toLocaleTimeString()}`;
  })
});

export type AppRouter = typeof appRouter;
```

### Add this handle to your SvelteKit hooks [hooks](https://kit.svelte.dev/docs/hooks):

```ts
// hooks.server.ts
import { createTRPCHandle } from '@bevm0/trpc-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { createContext } from '$lib/trpc/context';
import { appRouter } from '$lib/trpc/router';

export const handle: Handle = createTRPCHandle({ router: appRouter, createContext });
```

### Define a helper function to easily use the tRPC client in your pages:
```ts
// src/lib/trpc/client.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '$lib/trpc/router';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [ httpBatchLink({ url: 'http://localhost:5173/trpc' }) ]
})

/**
 * Load functions use a special fetch request, so you can define a special function.
 */
export const loadTrpc = (loadFetch: typeof fetch) => (
  createTRPCProxyClient<AppRouter>({
    links: [ 
      httpBatchLink({ 
        url: 'http://localhost:5173/trpc',
        fetch: loadFetch,
      })
    ]
  })
)
```

### Call the tRPC procedures in your pages:
```html
<!-- routes/+page.svelte -->
<script lang="ts">
  import trpc from '$lib/trpc/client';

  let greeting = 'press the button to load data';
  let loading = false;

  async function loadData () {
    loading = true;
    greeting = await trpc().greeting.query();
    loading = false;
  };
</script>

<h6>Loading data in<br /><code>+page.svelte</code></h6>

<a
  href="#load"
  role="button"
  class="secondary"
  aria-busy={loading}
  on:click|preventDefault={loadData}>Load</a
>
<p>{greeting}</p>
```

### Using the svelte-query + tRPC proxy client from `@bevm0/trpc-svelte-query`

Same steps as the other README


### Define the client
```ts
// lib/trpc/client.ts
import { httpBatchLink } from '@trpc/client'
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query';
import type { AppRouter } from '$lib/trpc/router';

const trpc = createTRPCSvelte<AppRouter>({
  links: [ httpBatchLink({ url: 'http://localhost:5173/trpc' }) ]
})

export default trpc
```

### Add the provider to the root layout to connect to your API.
```html
<!-- src/routes/+layout.svelte -->
<script>
  import { QueryClientProvider } from '@tanstack/react-query';
  import trpc from '$lib/trpc'
</script>

<QueryClientProvider client={trpc.queryClient}>
  <slot />
</QueryClientProvider>
```

### Call the tRPC procedures in your pages:

```html
// src/routes/+page.svelte
<script lang="ts">
  import trpc from '$lib/trpc/client';
  const query = trpc.greeting.createQuery()
</script>

<p>Your greeting is: {query.data}</p>
```
