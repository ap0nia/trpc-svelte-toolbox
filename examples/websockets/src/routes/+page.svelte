<script lang="ts">
  import { onMount } from 'svelte';
  import { wsTrpc } from '$lib/trpc/client'

  let messages: string[] = []

  onMount(() => {
    wsTrpc.receive.createSubscription(undefined, {
      onData(message) {
        messages = [...messages, message]
      },
    })
  })
</script>

<p>Hello, World</p>
{#each messages as message}
  <p>{message}</p>
{/each}
