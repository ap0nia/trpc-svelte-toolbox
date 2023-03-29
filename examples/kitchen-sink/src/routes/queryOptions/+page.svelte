<script lang="ts">
  import { trpc } from '$lib/trpc'

  const queryOptions = trpc.greeting.createOptions('Aponia')
  const infiniteQueryOptions = trpc.infinite.createOptions({ cursor: 1 })

  console.log({ queryOptions, infiniteQueryOptions })
</script>
