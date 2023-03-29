<script lang="ts">
  import { trpc } from '$lib/trpc'

  export let data

  const emptyQuery = trpc[''].createQuery('Elysia')
  const greetingQuery = trpc.greeting.createQuery('Aponia')
  const goodbyeQuery = trpc.goodbye.createQuery('Kiana')
</script>

<p>
  With a load function, the data is fetched and cached prior to the page load,
  which prevents a flash.
</p>
<p>
  It seems that two fetches are done; 
  this is because the first fetch hydrates the query client cache,
  and the second occurs to refresh the data. 
  The query client has a stale time of 0 by default,
  so setting this to a higher number or "refetchOnMount" to false
  will prevent the second fetch.
</p>

<div>
  <h1>Page Load Data</h1>
  <div>
    <h2>'' (prefetch)</h2>
    <p>{data['']}</p>
  </div>

  <div>
    <h2>Greeting (fetch)</h2>
    <p>{data.greeting}</p>
  </div>

  <div>
    <h2>Goodbye (ensureData)</h2>
    <p>{data.goodbye}</p>
  </div>
</div>

<div>
  <h1>Svelte-Query Data</h1>
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
</div>
