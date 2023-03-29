<script lang="ts">
  import { trpc } from '$lib/trpc'

  const queries = trpc.createQueries(t => {
    return [
      t[''].createOptions('Elysia'),
      t.greeting.createOptions('Aponia'),
      t.goodbye.createOptions('Kiana'),
    ]
  })
</script>

{#each $queries as query}
  <p>{query.data}</p>
{/each}
