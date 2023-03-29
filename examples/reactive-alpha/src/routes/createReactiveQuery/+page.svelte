<script lang="ts">
  import { writable } from 'svelte/store';
  import { trpc } from '$lib/trpc'

  const input = writable('')
  const query = trpc.greeting.createQuery(input, { keepPreviousData: true })
</script>

<p>{$query.data}</p>

<label for="">
  <span>Name</span>
  <input type="" bind:value={$input}>
</label>
