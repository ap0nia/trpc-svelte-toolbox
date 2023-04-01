---
id: createQueries
title: createQueries()
sidebar_label: createQueries()
slug: /svelte/createqueries
---

The `createQueries` hook can be used to fetch a variable number of queries 
at the same time using only one hook call.

The main use case for such a hook is to be able to fetch a number of queries, usually of the same type.
For example if you fetch a list of todo ids,
you can then map over them in a useQueries hook calling a byId endpoint
that would fetch the details of each todo.

## Usage

The useQueries hook is the same as that of 
[@tanstack/svelte-query createQueries](https://tanstack.com/query/v4/docs/svelte/overview).
The only difference is that you pass in a function that returns an array of queries instead of an array of queries inside an object parameter.

:::tip
When you're using the 
[`httpBatchLink`](https://trpc.io/docs/links/httpBatchLink) or 
[`wsLink`](https://trpc.io/docs/links/wsLink), 
the below will end up being only 1 HTTP call to your server. 
Additionally, if the underlying procedure is using something like Prisma's `findUnique()` it will 
[automatically batch](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance#solving-n1-in-graphql-with-findunique-and-prismas-dataloader)
& do exactly 1 database query as well.
:::

:::tip
The returned array needs to be of "readonly" nature, this means that you can't store
the array in a variable and return it (I think); you must return the array itself from the callback.
:::

```html title='src/components/MyComponent.svelte'
<script lang="ts">
  import { trpc } from '$lib/trpc'

  const postQueries = trpc.createQueries((t) =>
    props.postIds.map((id) => t.post.byId({ id })),
  );
</script>

{...}

```

### Providing options to individual queries

You can also pass in any normal query options to the second parameter of any of the query calls 
in the array such as `enabled`, `suspense`, `refetchOnWindowFocus`...etc.

For a complete overview of all the available options, see the 
[tanstack useQuery](https://tanstack.com/query/v4/docs/react/reference/useQuery) documentation.

```html title='src/components/MyComponent.svelte'
<script lang="ts">
  const [post, greeting] = trpc.createQueries((t) => [
    t.post.byId({ id: '1' }, { enabled: false }),
    t.greeting({ text: 'world' }),
  ]);

  const onButtonClick = () => {
    $post.refetch();
  };
</script>

<div>
  {#if $post.data}
    <h1>{$post.data.title}</h1>
  {/if}
  <p>{$greeting.data.message}</p>
  <button on:click={onButtonClick}>Click to fetch</button>
</div>

```

### Context

You can also pass in an optional Svelte Query context to override the default.

:::note
I think this is WIP actually
:::

```html
<script lang="ts">
  const [post, greeting] = trpc.createQueries((t) => [
      t.post.byId({ id: '1' }),
      t.greeting({ text: 'world' })
    ],
    myCustomContext,
  );
</script>
```
