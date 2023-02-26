<script lang="ts">
  import { trpc } from '$lib/trpc'

  // expectation:
  // whichever queries were prefetched in +page.ts will be immediately available from the cache

  const countQuery = trpc.count.useQuery()
  const greetingQuery = trpc.greeting.useQuery()
</script>

Hello, World

{$countQuery.data}

{$greetingQuery.data}
