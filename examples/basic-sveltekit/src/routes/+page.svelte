<script lang="ts">
  import { trpc } from '$lib/trpc'
  
  const countQuery = trpc.count.createQuery(1)

  function invalidate() {
    trpc.context.count.invalidate()
  }
</script>

<button on:click={invalidate}>Invalidate</button>
{JSON.stringify($countQuery.data)}
