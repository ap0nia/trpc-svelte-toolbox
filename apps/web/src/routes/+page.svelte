<script lang="ts">
  import { trpc } from '$lib/trpc'

  /**
   * this should already have been fetched and cached; so it's always defined
   */
  const countQuery = trpc.count.useQuery()

  /**
   * this wasn't explicitly fetched, so it's briefly undefined
   */
  const greetingQuery = trpc.greeting.useQuery()
</script>

Hello, World

{$countQuery.data}

{$greetingQuery.data}
