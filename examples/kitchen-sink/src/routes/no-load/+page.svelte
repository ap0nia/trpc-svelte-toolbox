<script lang="ts">
  import { trpc } from '$lib/trpc'

  const emptyQuery = trpc[''].createQuery('Elysia')
  const greetingQuery = trpc.greeting.createQuery('Aponia')
  const goodbyeQuery = trpc.goodbye.createQuery('Kiana')
</script>

<p>
  Without a load function, refreshing the page causes a flash while the data loads
  into the query client cache for the first time.
</p>

<p>
  {$emptyQuery.status}
  {$greetingQuery.status}
  {$goodbyeQuery.status}
</p>

<div>
  <h2>''</h2>
  <p>{$emptyQuery.data}</p>
</div>

<div>
  <h2>Greeting</h2>
  <p>{$greetingQuery.data}</p>
</div>

<div>
  <h2>Goodbye</h2>
  <p>{$goodbyeQuery.data}</p>
</div>
