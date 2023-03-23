<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { queryClient } from '$lib/queryClient'
  // import type { PageData } from './$types'
  // export let data: PageData
</script>

<QueryClientProvider client={queryClient}>
    <slot />
</QueryClientProvider>
