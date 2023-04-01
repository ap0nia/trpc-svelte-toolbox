<script lang="ts">
  import { trpc } from '$lib/trpc'

  const query = trpc.greeting.createQuery('Aponia')

  const utils = trpc.getContext()

  function refetch() {
    utils.greeting.refetch()
  }
</script>

<p>{$query.data}</p>

<button on:click={refetch}>Refetch</button>
