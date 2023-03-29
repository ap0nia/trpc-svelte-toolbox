<script lang="ts">
  import { trpc } from '$lib/trpc'

  const query = trpc.greeting.createQuery('Aponia')

  function invalidate() {
    trpc.utils.greeting.invalidate()
  }
</script>

<p>{$query.data}</p>

<button on:click={invalidate}>Invalidate</button>
