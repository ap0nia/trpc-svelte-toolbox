<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { queryClient } from '$lib/trpc/client'
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
