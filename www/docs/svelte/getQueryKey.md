---
id: getQueryKey
title: getQueryKey
sidebar_label: getQueryKey()
slug: /svelte/getquerykey
---

We provide a getQueryKey helper that accepts a `router` or `procedure` 
so that you can easily provide the native function the correct query key.

:::note
Currently, `getQueryKey` is exposed per procedure in the `utils` proxy,
instead of being a general purpose function like @trpc/react-query's implementation.
:::

```html
<script lang="ts">
  import { useIsFetching, useQueryClient } from '@tanstack/svelte-query';
  import { getQueryKey } from '@trpc/react-query';
  import { trpc } from '$lib/trpc';

  const queryClient = useQueryClient();

  const posts = trpc.post.list.createQuery();

  // See if a query is fetching
  const postListKey = trpc.utils.post.list.getQueryKey()
  const isFetching = useIsFetching(postListKey);

  // Set some query defaults for an entire router
  const postKey = trpc.utils.post.getQueryKey()
  queryClient.setQueryDefaults(postKey, { staleTime: 30 * 60 * 1000 });
</script>

{...}

```
