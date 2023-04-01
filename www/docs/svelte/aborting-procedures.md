---
id: aborting-procedure-calls
title: Aborting Procedure Calls
sidebar_label: Aborting Procedure Calls
slug: /svelte/aborting-procedure-calls
---

By default, tRPC does not cancel requests via Svelte Query.
If you want to opt into this behaviour, you can provide `abortOnUnmount` in your configuration.

:::note
@tanstack/svelte-query only supports aborting queries.

You may want to opt into this behavior if you prefetch queries in SvelteKit `load` functions.
When changing pages, you may notice that the *current* page will refetch all of its queries 
in addition to any prefetches on the *next* page.

It seems to be implemented in @trpc/react-query by forwarding the queryFn's `context.signal` to trpc's query function,
and this behavior is replicated in this library...
but, it doesn't look like it's working and I'm not sure how to properly enable cancelling on page change in SvelteKit.
:::

```ts title='src/lib/server/trpc.ts'
import { z } from "zod";
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

const appRouter = t.router({
  post: t.router({
    byId: t.procedure
      .input(z.object({ id: z.string() }))
      .query(async ({input}) => {
        return { id: input.id, title: 'Kiana' };
      }),
  })
});

export type AppRouter = typeof appRouter;
```

### Globally

```ts title="src/lib/trpc.ts"
import { createTRPCSvelte } from '@bevm0/trpc-svelte-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/trpc';

export const trpc = createTRPCSvelte<AppRouter>({
  links: [ 
    httpBatchLink({ url: 'http://localhost:5173/api/trpc' })
  ]
}, {
  abortOnUnmount: true
});
```

### Per-request

You may also override this behaviour at the query level.

```html title="src/routes/+page.svelte"
<script lang="ts">
  import { trpc } from '$lib/trpc';
  import type { PageData } from './$types'

  export let data: PageData

  const postQuery = trpc.post.byId.createQuery(
    { id: data.id },
    { trpc: { abortOnUnmount: true } }
  );
</script>

{...}
```

