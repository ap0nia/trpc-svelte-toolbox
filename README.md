# Hi

Took the code from [@trpc/react-query](https://github.com/trpc/trpc/tree/main/packages/react-query)
and plugged in @tanstack/svelte-query instead of @tanstack/react-query.

# Setup

## query client
  ```ts
  // $lib/queryClient

  import { QueryClient } from '@tanstack/svelte-query'
  import { browser } from '$app/environment'

  /**
   * universal query client for the application
   * @see {@link https://tanstack.com/query/latest/docs/svelte/ssr#setup}
   */
  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,

        /**
         * make sure you pre-fetch ALL data in +page.ts or +layout.ts!
         * i.e. including fetches needed by ALL components that will be rendered
         */
        refetchOnMount: false,
      },
    },
  })
  ```

## client-side client
  ```ts
    // $lib/trpc.ts
    import { queryClient } from '$lib/trpc'

    /**
     * Initialize tRPC + svelte-query with the router definition
     */
    export const trpc = createTRPCSvelte<AppRouter>({
      reactQueryContext: queryClient,
    })

    /**
     * initialize a client with the same router definition
     */
    const client = trpc.createClient({
      transformer: superjson,
      links: [ httpBatchLink({ url: '/trpc' }) ],
    })

    /**
     * initialize the tRPC context with the Provider function
     */
    trpc.Provider({ queryClient, client })
  ```

### Notes
  - there's references to React because I haven't fully purged everything
  - use the initialized queryClient to create a client-side trpc client
  - calling the `Provider` method initializes both of those properites inside 
    of the trpcSvelteQuery thing
    - this is normally done in React by calling trpc.Provider as JSX element
      (but I haven't done anything about it for Svelte land)
  - now you invoke trpc exactly like like described in the @trpc/react-query docs

## ~~server-side client~~ wait why does it work without this step now???
  ```ts
  // src/routes/+layout.ts

  import { queryClient } from '$lib/queryClient'

  // go through the same process of initializing the client for the client-side,
  // but override the fetch with the one from SvelteKit
  export const load: LayoutLoad = async (event) => {
  /**
   * separate tRPCClient for load functions
   * @remarks it uses the SAME queryClient as `$lib/trpc`, so it will share the cache
   */
  const trpcLoad = createTRPCSvelte<AppRouter>({
    reactQueryContext: queryClient,
  })

  /**
   * initialize a tRPC client specifically for load functions
   */
  const client = trpcLoad.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: '/trpc',
        fetch: event.fetch
      }),
    ],
  })

  /**
   * initialize the tRPC context with the special tRPCClient and *universal* query client
   * child load functions can now use it with `await parent`
   */
  trpcLoad.Provider({ queryClient, client })

  return { trpcLoad, ...event.data }
}
  ```

### Notes
  - after initializing, all child load functions can `await parent()` to get the `trpcLoad` function
  - this function can perform a trpc query + cache its results in the shared queryClient


## Usage (coming soon I guess)

also this isn't the most optimal way to do async fetching shenanigans in SvelteKit;
just needed an example up

```ts
// src/routes/+page.ts

import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
  const { trpcLoad } = await parent()

  /**
   * same behavior inherited from @trpc/react-query
   */
  const utils = trpcLoad.useContext()

  /**
   * the requests are fetched, cached in the shared queryClient, and returned by each promise
   */
  const [greeting, count] = await Promise.all([
    utils.greeting.fetch(),
    utils.count.prefetch()
  ])

  return { greeting, count } // value is ['greeting', void], because prefetch doesn't return a value
}
```

### Notes
- `prefetch` will fetch and cache the result, but *doesn't* return the value from the response
- `fetch` will do the same as `prefetch` but also return the result
  - useful if you just want the data without committing to creating a query

```html
<script>
  import { trpc } from '$lib/trpc'
  import { PageData } from './$types'

  export let data: PageData

  /**
   * despite not having any relation to the +layout.ts or +page.ts shenanigans,
   * the queryClient does have the cached results from the server, 
   * so the client-side trpc client will have data initially cached,
   * as a result to calling `fetch` or `prefetch` in those files
   */
  const greetingQuery = trpc.greeting.useQuery()
  const countQuery = trpc.count.useQuery()

  // you can also use the values returned by the queries
  const count = data.count // void because this was `prefetch`
  const greeting = data.greeting // some "greeting" becuase this was `fetch`
</script>

{$greetingQuery.data}
{$countQuery.data}

{count}

{greeting}
```

### Notes
- although it looks like the queries above only run after hitting the browser;
  the `+page.ts` already fetched it *and cached it into the same queryClient*


### Comparison

[trpc-svelte-query-adapter](https://github.com/vishalbalaji/trpc-svelte-query-adapter)
- TIL this existed lol; it's probably better than whatever I did

- I want to be able to prefetch whatever queries I want on the server;
  and this is accommodated in this package by calling `fetch` or `prefetch`;
  which will cache the results regardless of the query actually being created on the client

- trpc-svelte-query-adapter seems to require the `createServerQuery` 
  and then provide the query as page data in order to accomplish the same task

- I don't like the above strategy for my use-case because I have a lot of components
  that aren't necessarily linked to a page but perform their own queries;
  I'd still like to have that query data prefetched and cached on the server if possible

- TLDR:
  - trpc-svelte-query-adapter requires `createServerQuery` to generate a query
    and provide that as a prop to the component that needs it
    (i.e. as page data to the underlying `+page.svelte`)
    if I want server-side fetch and caching

  - this package just requires a call to `trpc.<route>.fetch` or `trpc.<route>.prefetch`
    in any `+layout.ts` or `+page.ts` and it will automatically fetch and cache;
    any component that invokes the corresponding query will simply acquire the prefetched data
