<script lang="ts">
  import { trpc } from '$lib/trpc'

  const query = trpc.greeting.createQuery('Aponia')

  const utils = trpc.getContext()

  function invalidate() {
    utils.greeting.invalidate()
  }
</script>

<p>{$query.data}</p>

<button on:click={invalidate}>Invalidate</button>
