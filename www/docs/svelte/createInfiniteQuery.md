---
id: createInfiniteQuery
title: createInfiniteQuery
sidebar_label: createInfiniteQuery()
slug: /svelte/createinfinitequery
---

:::info

- Your procedure needs to accept a `cursor` input of any type (`string`, `number`, etc) to expose this hook.
- For more details on infinite queries read the [svelte-query docs](https://tanstack.com/query/v4/docs/svelte/examples/svelte/load-more-infinite-scroll)
- In this example we're using Prisma - see their docs on [cursor-based pagination](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

:::

## Example Procedure

```tsx title='src/lib/server/trpc.ts'
import { initTRPC } from '@trpc/server'

export const t = initTRPC.create()

export const appRouter = t.router({
  infinitePosts: t
    .procedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
    }))
    .query(({ input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await prisma.post.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: {
          title: {
            contains: 'Prisma' /* Optional filter */,
          },
        },
        cursor: cursor ? { myCursor: cursor } : undefined,
        orderBy: {
          myCursor: 'asc',
        },
      })
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.myCursor;
      }

      return {
        items,
        nextCursor,
      };
    })
})
```

## Example Svelte Component

```html title='src/lib/MyComponent.svelte'
<script lang="ts">
  import { trpc } from '$lib/trpc';
  const myQuery = trpc.infinitePosts.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // initialCursor: 1, // <-- optional you can pass an initialCursor
    },
  );

  function nextPage() {
    $myQuery.fetchNextPage()
  }
</script>

<ul>
  {#each $myQuery.data?.pages ?? [] as page}
    {#each page as myPage}
      <li>{ ... }</li>
    {/each}
  {/each}
</ul>

<button on:click={nextPage>Fetch More!</button>
```

## Helpers

### `getInfiniteData()`

This helper gets the currently cached data from an existing infinite query

```html title='src/components/MyComponent.svelte'
<script lang="ts">
  import { trpc } from '$lib/trpc';

  // utils is a special key at the root of the tRPC + svelte-query proxy with helper methods
  const utils = trpc.utils

  const myMutation = trpc.infinitePosts.add.useMutation({
    async onMutate({ post }) {
      await utils.infinitePosts.cancel();
      const allPosts = utils.infinitePosts.getInfiniteData({ limit: 10 });
      // [...]
    },
  });
</script>

{ ... }
```

### `setInfiniteData()`

This helper allows you to update a query's cached data

```html title='src/components/MyComponent.svelte'
<script lang="ts">
  import { trpc } from '../utils/trpc';

  // utils is a special key at the root of the tRPC + svelte-query proxy with helper methods
  const utils = trpc.utils

  const myMutation = trpc.infinitePosts.delete.useMutation({
    async onMutate({ post }) {
      await utils.infinitePosts.cancel();

      utils.infinitePosts.setInfiniteData({ limit: 10 }, (data) => {
        if (!data) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.status === 'published'),
          })),
        };
      });
    },
  });
</script>

{ ... }
```
