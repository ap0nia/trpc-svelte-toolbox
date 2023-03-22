<script lang="ts">
  import { trpc } from '$lib/trpc'
  const countQuery = trpc[''].createQuery()

  function invalidate() {
  }
</script>

<button on:click={invalidate}>Invalidate</button>
{JSON.stringify($countQuery.data)}
