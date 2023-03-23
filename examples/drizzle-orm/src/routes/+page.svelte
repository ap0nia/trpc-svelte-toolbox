<script lang="ts">
  import { trpc } from '$lib/trpc/client'

  const query = trpc.customers.createQuery()
</script>

<div>
  <h1>All Customers</h1>
  <ul>
    {#each $query.data || [] as customer}
      <li>{customer.contactName}</li>
    {/each}
  </ul>
</div>
