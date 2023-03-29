<script lang="ts">
  import { trpc } from '$lib/trpc'

  const query = trpc.greeting.createQuery('Aponia')
</script>

<p>{$query.data}</p>
