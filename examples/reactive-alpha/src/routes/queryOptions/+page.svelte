<script lang="ts">
  import { trpc } from '$lib/trpc'

  const queryOptions = trpc.greeting.getQueryOptions('Aponia')
  const infiniteQueryOptions = trpc.infinite.getQueryOptions({ cursor: 1 })

  console.log({ queryOptions, infiniteQueryOptions })
</script>
