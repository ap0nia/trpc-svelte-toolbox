<script lang="ts">
  import { writable } from 'svelte/store';
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query';
  import { trpc } from '$lib/trpc'

  /**
   * Get the query options for this tRPC query as a regular object.
   */
  const queryOptions = trpc.utils[''].getQueryOptions('', { placeholderData: keepPreviousData })

  /**
   * Convert the query options to a writable store.
   */
  const options = writable(queryOptions)

  /**
   * Create a store for the input, and "bind" it to the query options.
   */
  const input = trpc.utils[''].bindQueryInput(options)

  /**
   * Manually create a new reactive query.
   */
  const query = createQuery(options)
</script>

<input type="" bind:value={$input}>
{$query.data}
