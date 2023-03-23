<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { trpc } from '$lib/trpc/client'
</script>

<QueryClientProvider client={trpc.queryClient}>
  <slot />
</QueryClientProvider>
