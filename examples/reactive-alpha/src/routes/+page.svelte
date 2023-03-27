<script lang="ts">
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { createQuery, keepPreviousData } from '@tanstack/svelte-query';
  import type { CreateQueryOptions } from '@tanstack/svelte-query';
  import { client, queryClient } from '$lib/trpc'

  /**
   * Create writable options for the query.
   */
  const options = writable<CreateQueryOptions>({
    context: queryClient,
    queryKey: [[ '' ], { input: '', type: 'query' }],
    queryFn: () => {
      return client.query('', '')
    },
    placeholderData: keepPreviousData
  })

  /**
   * Create a store for the input that updates the query options.
   */
  function bindReactiveInput<T>(queryOptions: Writable<CreateQueryOptions>, input: T) {
    const value = writable(input)

    const set = (input: T) => {
      queryOptions.update(x => ({
        ...x,
        queryFn: () => client.query('', input),
        queryKey: [[ '' ], { input, type: 'query' }],
      }))
      value.set(input)
    }
    return { ...value, set }
  }

  const input = bindReactiveInput(options, '')
  const query = createQuery(options as any)
</script>

<input type="" bind:value={$input}>
{$query.data}
