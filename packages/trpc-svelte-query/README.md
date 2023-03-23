<p align="center">
  <a href="https://trpc.io/"><img src="https://assets.trpc.io/icons/svgs/blue-bg-rounded.svg" alt="tRPC" height="75"/></a>
</p>

<h3 align="center">tRPC</h3>

<p align="center">
  <strong>End-to-end typesafe APIs made easy</strong>
</p>

<p align="center">
  <img src="https://assets.trpc.io/www/v10/v10-dark-landscape.gif" alt="Demo" />
</p>

# `@bevm0/trpc-svelte-query`

> A tRPC wrapper around @tanstack/svelte-query.

## Documentation

Full documentation for `@bevm0/trpc-svelte-query` can be found here...(WIP)

## Installation

```bash
# npm
npm install @bevm0/trpc-svelte-query @tanstack/svelte-query

# Yarn
yarn add @bevm0/trpc-svelte-query @tanstack/svelte-query

# pnpm
pnpm add @bevm0/trpc-svelte-query @tanstack/svelte-query
```

## Basic Example

1. Create a file that exports an initialized QueryClient and tRPC hooks.

```ts
// src/lib/trpc.ts
import { QueryClient } from '@tanstack/react-query';
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$lib/server/trpc';

export const queryClient = new QueryClient();

export const trpc = createTRPCSvelte<AppRouter>({
  links: [
    httpBatchLink({ url: 'http://localhost:5173/trpc' }),
  ],
}, queryClient);
```

2. Add the provider to the root layout to connect to your API.

```html
<!-- src/routes/+layout.svelte -->
<script>
  import { QueryClientProvider } from '@tanstack/react-query';
  import { queryClient } from '$lib/trpc'
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
```

3. Now in any component, you can query your API using the trpc proxy exported from the trpc file.

```html
<script>
  import { trpc } from '$lib/trpc';
  const query = trpc.count.createQuery()
</script>

<div>
  <p>Your number is: {$query.data}</p>
</div>
```

## SvelteKit Prefetch Example

1-3. Follow the same steps as the basic example.

4. Directly fetch the query using `utils` in a `+layout.ts` or `+page.ts` above the desired route.

```ts
// src/routes/+page.ts

import { trpc } from '$lib/trpc'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  return {
    // `fetch`, `prefetch`, `fetchInfinite`, `prefetchInfinite` 
    // will do the request cache it in the queryClient during the load function, before page load
    count: trpc.utils.count.fetch()
  }
}
```

5. Now the data is fetched and cached **prior** to the page loading.
- The data will be "undefined" at first if the prefetch step isn't done
- Another fetch may occur on mount if you don't explictly tune the QueryClient settings,
  e.g. by turning "refetchOnMount" to false.
  - The main difference from before is that this fetch request is done to refresh stale data,
    whereas it was trying to get data for the first time when not prefetching.
- `prefetch` and `prefetchInfinite` fetch and cache the results, but **don't return anything**
- `fetch` and `fetchInfinite` fetch, cache, and return the results.
- It's possible to simply fetch, cache, and use the value in a page without it being tied to any svelte-query construct.


## Root Properties
- `client`: a `TRPCProxyClient` that can be used to do a direct tRPC request.
- `queryClient`: the `QueryClient` used by the hooks to cache results.
- `utils`: a "shadow" of the proxy that provides greater control over the clients.
