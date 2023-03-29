<script lang="ts">
  import { trpc } from '$lib/trpc'

  const queries = trpc.createQueries(t => {
    return [
      t[''].getQueryOptions('Elysia'),
      t.greeting.getQueryOptions('Aponia'),
      t.goodbye.getQueryOptions('Kiana'),
    ]
  })
</script>

{#each $queries as query}
  <p>{query.data}</p>
{/each}
