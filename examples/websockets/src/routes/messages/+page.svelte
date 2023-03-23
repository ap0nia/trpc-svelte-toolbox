<script lang="ts">
  import { trpc } from '$lib/trpc/client'

  let value = ''

  const query = trpc.send.createMutation('')

  function sendMessage() {
    $query.mutate(value)
  }

</script>

<form on:submit|preventDefault={sendMessage}>
  <label for="">
    <span>Message</span>
    <input type="text" bind:value>
  </label>
</form>
