<script lang="ts">
  import { trpc } from '$lib/trpc'

  let value = ''

  const mutation = trpc.addName.createMutation()

  function submit() {
    $mutation.mutate(value, {
      onSuccess(data) {
        console.log('Successfully submitted', data)
      }
    })
  }
</script>

<h1>Database</h1>
<p>
  {JSON.stringify($mutation.data)}
</p>

<input type="text" bind:value>
<button on:click={submit}>Submit Name</button>
