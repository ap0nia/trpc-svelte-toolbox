<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { queryClient } from '$lib/trpc'
</script>

<QueryClientProvider client={queryClient}>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/createQuery">Create Query</a></li>
    <li><a href="/createReactiveQuery">Create Reactive Query</a></li>
    <li><a href="/createQueries">Create Queries</a></li>
    <li><a href="/createMutation">Create Mutation</a></li>
    <li><a href="/queryKey">Query Keys</a></li>
    <li><a href="/queryOptions">Query Options</a></li>
    <li><a href="/invalidate">Invalidation</a></li>
    <li><a href="/refetch">Refetch</a></li>
    <li><a href="/load">Load Function</a></li>
    <li><a href="/no-load">Without Load Function</a></li>
  </ul>

  <slot/>
</QueryClientProvider>
