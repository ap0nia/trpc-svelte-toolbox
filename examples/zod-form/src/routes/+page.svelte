<script lang="ts">
  import { z } from 'zod'
  import { trpc } from '$lib/trpc'
  import { createForm } from '$lib/form'

  const query = trpc.customers.createQuery()

  interface Form {
    name: string
    password: string
  }

  const { form, data, errors, field } = createForm<Form>({
    schema: z.object({
      name: z.string(),
      password: z.number(),
    })
  })

  $: console.log($data)
  $: console.log($errors)
</script>

<div>
  <form use:form>
    <input type="" use:field={'name'}>
    <input type="" use:field={'password'}>
    <div style="height: 100vh"></div>
    <button>Submit</button>
  </form>
  <h1>All Customers</h1>
  <ul>
    {#each $query.data || [] as customer}
      <li>{customer.contactName}</li>
    {/each}
  </ul>
</div>
