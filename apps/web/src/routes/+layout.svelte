<script lang="ts">
  import { QueryClientProvider  } from '@tanstack/svelte-query'
  import { queryClient } from '$lib/queryClient'
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
