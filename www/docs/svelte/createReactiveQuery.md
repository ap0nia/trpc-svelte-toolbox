---
id: createReactiveQuery
title: createReactiveQuery()
sidebar_label: createReactiveQuery()
slug: /svelte/createreactivequery
---

:::note
This implementation is based on the 
[alpha-branch of svelte-query](https://github.com/TanStack/query/blob/alpha/packages/svelte-query/src/createBaseQuery.ts)
:::

### Example

<details><summary>Backend code</summary>

```tsx title='src/lib/server/trpc.ts'
import { z } from 'zod';
import { initTRPC } from '@trpc/server';

export const t = initTRPC.create();

export const appRouter = t.router({
  // Create procedure at path 'hello'
  hello: t.procedure
    // using zod schema to validate and infer input values
    .input(
      z.object({ text: z.string().nullish() }).nullish(),
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
      };
    }),
});
```
</details>

:::tip
Same API as the regular `createQuery`,
just pass in a writable (store) version of your input and the query will be reactive.
:::

:::note
The [currently prescribed method](https://tanstack.com/query/latest/docs/svelte/reactivity)
of reactivity will always cause a flash of data because the **entire** 
query is reconstructed reactively, instead of only the options. 
This means that it's impossible to "keepPreviousData" since it was recomputed and loses all its original data.

[GitHub issue](https://github.com/TanStack/query/issues/4851)

[Merged fix on alpha branch](https://github.com/TanStack/query/pull/5050)
:::

```html title='src/routes/+page.svelte'
<script lang="ts">
  import { writable } from 'svelte/store'
  import { trpc } from '$lib/trpc';
  
  const input = writable('Aponia')

  const helloWithArgs = trpc.hello.createQuery({ text: $input }, { keepPreviousData: true });
</script>

<div>
  <h1>Hello World Example</h1>
  <ul>
    <li>
      helloNoArgs ({$helloNoArgs.status}):{' '}
      <pre>{JSON.stringify($helloNoArgs.data, null, 2)}</pre>
    </li>
  </ul>
</div>

<label for="">
  <span>My Name is...</span>
  <input type="text" bind:value={$input} />
</label>
}
```
