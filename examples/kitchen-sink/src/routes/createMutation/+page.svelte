<script lang="ts">
  import { getQueryKey } from "@bevm0/trpc-svelte-query";
  import { trpc } from "$lib/trpc";

  let value = "";

  const query = trpc.getName.createQuery("Elysia");
  const mutation = trpc.addName.createMutation();
  const utils = trpc.getContext();

  let count = 0

  function submit() {
    $mutation.mutate(value, {
      onSuccess(data) {
        utils.queryClient.setQueryData(getQueryKey(trpc.getName, 'Elysia', 'query'), count++)
        console.log("Successfully submitted", data);
      },
    });
  }
</script>

<h1>Database</h1>

<p>
  {JSON.stringify($mutation.data)}
</p>

<p>
  {JSON.stringify($query.data)}
</p>

<input type="text" bind:value />
<button on:click={submit}>Submit Name</button>
