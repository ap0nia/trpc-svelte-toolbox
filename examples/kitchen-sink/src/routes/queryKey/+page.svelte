<script lang="ts">
  import { trpc } from '$lib/trpc'

  const queryKey = trpc.utils.greeting.getQueryKey('Aponia')
  const infiniteQueryKey = trpc.utils.infinite.getInfiniteQueryKey({ cursor: 1 })
  const mutationKey = trpc.utils.addName.getMutationKey()
</script>

<p>
  {JSON.stringify(queryKey)}
</p>

<p>
  {JSON.stringify(infiniteQueryKey)}
</p>

<p>
  {JSON.stringify(mutationKey)}
</p>
