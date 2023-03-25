<script lang="ts">
  import { onMount } from 'svelte';
  import { wsTrpc } from '$lib/trpc/client'

  let messages: string[] = []

  onMount(async () => {
    const data = await fetch('/', {
      headers: {
        connection: 'Upgrade',
        upgrade: 'websocket',
      }
    }).then(res => res.json())

    console.log({ data })

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
