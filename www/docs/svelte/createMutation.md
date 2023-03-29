---
id: createMutation
title: createMutation()
sidebar_label: createMutation()
slug: /svelte/createmutation
---

:::note
The hooks provided by `@bevm0/trpc-svelte-query` are a thin wrapper around @tanstack/svelte-query.
For in-depth information about options and usage patterns,
refer to their docs on [queries](https://tanstack.com/query/v4/docs/svelte/overview#available-functions).
:::

Works like svelte-query's mutations - 
[see their docs](https://tanstack.com/query/v4/docs/svelte/examples/svelte/optimistic-updates-typescript).

### Example

<details><summary>Backend code</summary>

```tsx title='src/lib/server/trpc.ts'
import { z } from 'zod';
import { initTRPC } from '@trpc/server';

export const t = initTRPC.create();

export const appRouter = t.router({
  // Create procedure at path 'login'
  // The syntax is identical to creating queries
  login: t.procedure
    // using zod schema to validate and infer input values
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(({ input }) => {
      // Here some login stuff would happen
      return {
        user: {
          name: input.name,
          role: 'ADMIN',
        },
      };
    }),
});
```

</details>

```html title='src/routes/+page.svelte'
<script lang="ts">
  import { trpc } from '$lib/trpc';

  // This can either be a tuple ['login'] or string 'login'
  const mutation = trpc.login.useMutation();

  const handleLogin = () => {
    const name = 'John Doe';

    mutation.mutate({ name });
  };
</script>

<div>
  <h1>Login Form</h1>
  <button onClick={handleLogin} disabled={$mutation.isLoading}>
    Login
  </button>

  {#if $mutation.error}
    <p>Something went wrong! {$mutation.error.message}</p>
  {/if}
</div>
```
