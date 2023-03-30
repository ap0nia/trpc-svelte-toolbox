---
id: createQuery
title: createQuery()
sidebar_label: createQuery()
slug: /svelte/createquery
---

:::note
The hooks provided by `@bevm0/trpc-svelte-query` are a thin wrapper around @tanstack/svelte-query.
For in-depth information about options and usage patterns,
refer to their docs on [queries](https://tanstack.com/query/v4/docs/svelte/overview#available-functions).
:::

```tsx
function createQuery(input: TInput, opts?: CreateTRPCQueryOptions)

interface CreateTRPCQueryOptions extends CreateQueryOptions {
  trpc: {
    context?: OperationContext;
    abortOnUnmount?: boolean;
  }
}
```

Since `CreateTRPCQueryOptions` extends @tanstack/svelte-query's `CreateQueryOptions`,
you can use any of their options here such as `enabled`, `refetchOnWindowFocus`, etc.
We also have some `trpc` specific options that let you opt in or out of certain behaviors on a per-procedure level:

From `TRPCRequestOptions`
- **`trpc.context`:** Forwarded to the `client.query` call

Custom
- **`trpc.abortOnUnmount`**: Indicates that the `queryFn`'s `context.signal` should be forwarded to 
  trpc's `query` function to enabling aborting the request.

:::tip
If you need to set any options but don't want to pass any input, you can pass `undefined` as the input.

e.g. trpc.hello.createQuery(undefined, {...})
:::

You'll notice that you get autocompletion on the `input` based on what you have set in your `input` schema on your backend.

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

```html title='src/routes/+page.svelte'
<script lang="ts">
  import { trpc } from '$lib/trpc';

  const helloNoArgs = trpc.hello.createQuery();
  const helloWithArgs = trpc.hello.createQuery({ text: 'client' });
</script>

<div>
  <h1>Hello World Example</h1>
  <ul>
    <li>
      helloNoArgs ({$helloNoArgs.status}):{' '}
      <pre>{JSON.stringify($helloNoArgs.data, null, 2)}</pre>
    </li>
    <li>
      helloWithArgs ({$helloWithArgs.status}):{' '}
      <pre>{JSON.stringify($helloWithArgs.data, null, 2)}</pre>
    </li>
  </ul>
</div>
}
```
