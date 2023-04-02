---
id: context
title: context
sidebar_label: context
slug: /svelte/context
---

`getContext` is gives you access to helpers that let you manage the cached data of the queries you execute via `@bevm0/trpc-svelte-query`.
These helpers are actually thin wrappers around 
`@tanstack/svelte-query`'s [`queryClient`](https://tanstack.com/query/v4/docs/reference/QueryClient) methods.
If you want more in-depth information about options and usage patterns for `getContext` helpers than what we provide here,
we will link to their respective `@tanstack/react-query` docs so you can refer to them accordingly.

## Setup

`setContext` must be called in the root of the component tree with the desired query client.

:::note
The exposed helper functions don't rely on `useQueryClient` because `useQueryClient`
must be invoked at the top level of the component, and functions aren't necessarily called there.
e.g. You may want to `invalidate` after a form submission.

Instead, you should make sure to provide `trpc.setContext` with the same query client
as the `QueryClientProvider`. This ensures that both are referring to the same cache.
This allows the entire context proxy to be calculated once per `trpc.setContext`.
:::

```html title='src/routes/+layout.svelte'
<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { trpc } from '$lib/trpc'

  const queryClient = new QueryClient()

  // provide the context with an untyped tRPC client and a query client 
  trpc.setContext(trpc.client, queryClient)
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
```

:::note
It also doesn't matter **which** `trpc` is used to set the context.
All `tRPC + svelte-query` instances refer to the same context, 
so any of them just has to set the untyped client and query client.

e.g. in SvelteKit, you may see `data.trpc.setContext` used because an initialized
tRPC + svelte-query client was already initialized and provided to the page as a prop.

As long as any `trpc.setContext` calls are made with the correct untyped client and query client,
then any instance of `trpc.getContext` will work properly.
:::

## Usage

`getContext` returns an object with all the available queries you have in your routers.
You use it the same way as your `trpc` client object.
Once you reach a query, you'll have access to the query helpers.
For example, let's say you have a `post` router with an `all` query:

```ts
import { z } from 'zod';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

const appRouter = t.router({
  post: t.router({
    all: t.procedure.query(() => {
      return {
        posts: [
          { id: 1, title: 'everlong' },
          { id: 2, title: 'After Dark' },
        ],
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
```

Now in our component, when we navigate the object `getContext` gives us and reach the `post.all` query, we'll get access to our query helpers!

:::tip
`trpc.getContext` will only work after `trpc.setContext` was called with the desired query client
at the root of the component tree, i.e. +layout.svelte .
:::

```html title="src/lib/MyComponent.svelte"
import { trpc } from '$lib/trpc'

const utils = trpc.getContext()
utils.post.all.f;
//              ^|
// [...]
```

## Helpers

These are the helpers you'll get access to via `getContext`.
The table below will help you know which tRPC helper wraps which `@tanstack/react-query` helper method.
Each react-query method will link to its respective docs/guide:

| tRPC helper wrapper | `@tanstack/react-query` helper method                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `fetch`             | [`queryClient.fetchQuery`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientfetchquery)                       |
| `prefetch`          | [`queryClient.prefetchQuery`](https://tanstack.com/query/v4/docs/guides/prefetching)                                             |
| `fetchInfinite`     | [`queryClient.fetchInfiniteQuery`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientfetchinfinitequery)       |
| `prefetchInfinite`  | [`queryClient.prefetchInfiniteQuery`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientprefetchinfinitequery) |
| `ensureData`        | [`queryClient.ensureData`](https://tanstack.com/query/v4/docs/react/reference/QueryClient#queryclientensurequerydata)            |
| `invalidate`        | [`queryClient.invalidateQueries`](https://tanstack.com/query/v4/docs/guides/query-invalidation)                                  |
| `refetch`           | [`queryClient.refetchQueries`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientrefetchqueries)               |
| `cancel`            | [`queryClient.cancelQuery`](https://tanstack.com/query/v4/docs/guides/query-cancellation)                                        |
| `setData`           | [`queryClient.setQueryData`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientsetquerydata)                   |
| `getData`           | [`queryClient.getQueryData`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientgetquerydata)                   |
| `setInfiniteData`   | [`queryClient.setInfiniteQueryData`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientsetquerydata)           |
| `getInfiniteData`   | [`queryClient.getInfiniteData`](https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientgetquerydata)                |

## Proxy client

In addition to the above react-query helpers,
trpc also exposes your tRPC proxy client, i.e. **without the need for context**.
This lets you call your procedures with `async`/`await` without needing to create an additional vanilla client.

```html
<script lang="ts">
  import { trpc } from '../utils/trpc';

  let apiKey

  type FormSubmitEvent = Event & 
    { readonly submitter: HTMLElement | null } & 
    { currentTarget: EventTarget & HTMLFormElement }

  const handleSubmit = async (event: FormSubmitEvent) => {
    const apiKey = await trpc.proxy.apiKey.create.mutate(event);
    setApiKey(apiKey);
  }
</script>

<form on:submit={handleSubmit}>
  ...
</form>
```

## Query Invalidation

You invalidate queries via the `invalidate` helper.
`invalidate` is actually a special helper given that, unlike the other helpers,
it's available at every level of the router map.
This means you can either run `invalidate` on a single query, a whole router,
or every router if you want. We get more in detail in the sections below.

### Invalidating a single query

You can invalidate a query relating to a single procedure and even filter based
on the input passed to it to prevent unnecessary calls to the back end.

#### Example code

```html
<script lang="ts">
  import { trpc } from '$lib/trpc';

  const utils = trpc.getContext();

  const mutation = trpc.post.edit.useMutation({
    onSuccess(input) {
      utils.post.all.invalidate();
      utils.post.byId.invalidate({ id: input.id }); // Will not invalidate queries for other id's 👍
    },
  });
</script>

{...}

```

### Invalidating across whole routers

It is also possible to invalidate queries across an entire router rather then just one query.

#### Example code

<details><summary>Backend code</summary>

```tsx title='server/routers/_app.ts'
import { z } from 'zod';
import { initTRPC } from '@trpc/server';

export const t = initTRPC.create();

export const appRouter = t.router({
  // sub Post router
  post: t.router({
    all: t.procedure.query(() => {
      return {
        posts: [
          { id: 1, title: 'everlong' },
          { id: 2, title: 'After Dark' },
        ],
      };
    }),
    byId: t.procedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .query(({ input }) => {
        return {
          post: { id: input?.id, title: 'Look me up!' },
        };
      }),
    edit: t.procedure
      .input(z.object({ id: z.number(), title: z.string() }))
      .mutation(({ input }) => {
        return { post: { id: input.id, title: input.title } };
      }),
  }),
  // separate user router
  user: t.router({
    all: t.procedure.query(() => {
      return { users: [{ name: 'Dave Grohl' }, { name: 'Haruki Murakami' }] };
    }),
  }),
});
```

</details>

```html
<script lang="ts">
  import { trpc } from '$lib/trpc';

  const utils = trpc.getContext()

  const invalidateAllQueriesAcrossAllRouters = () => {
    // 1️⃣
    // All queries on all routers will be invalidated 🔥
    utils.invalidate();
  };

  const invalidateAllPostQueries = () => {
    // 2️⃣
    // All post queries will be invalidated 📭
    utils.post.invalidate();
  };

  const invalidatePostById = () => {
    // 3️⃣
    // All queries in the post router with input {id:1} invalidated 📭
    utils.post.byId.invalidate({ id: 1 });
  };

  // Example queries
  trpc.user.all.createQuery(); // Would only be validated by 1️⃣ only.
  trpc.post.all.createQuery(); // Would be invalidated by 1️⃣ & 2️⃣
  trpc.post.byId.createQuery({ id: 1 }); // Would be invalidated by 1️⃣, 2️⃣ and 3️⃣
  trpc.post.byId.createQuery({ id: 2 }); // would be invalidated by 1️⃣ and 2️⃣ but NOT 3️⃣!
</script>

{ ... }

```

### Invalidate full cache on every mutation

Keeping track of exactly what queries a mutation should invalidate is hard, therefore,
it can be a pragmatic solution to invalidate the _full cache_ as a side-effect on any mutation.
Since we have request batching, this invalidation will simply refetch all queries on the page you're looking at in one single request.

We have added a feature to help with this:

```ts
export const trpc = createTRPCSvelte<AppRouter, SSRContext>({
  overrides: {
    useMutation: {
      /**
       * This function is called whenever a `.useMutation` succeeds
       **/
      async onSuccess(opts) {
        /**
         * @note that order here matters:
         * The order here allows route changes in `onSuccess` without
         * having a flash of content change whilst redirecting.
         **/

        // Calls the `onSuccess` defined in the `createMutation()` options:
        await opts.originalFn();

        // Invalidate all queries in the svelte-query cache:
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});
```
