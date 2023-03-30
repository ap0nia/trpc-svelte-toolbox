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
        return { id: input.id, title: 'Hello' };
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
    httpBatchLink({ url: 'http://localhost:5173/trpc' })
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

