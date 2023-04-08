<script lang="ts">
  import { trpc } from "$lib/trpc";

  // query returns no data, but sets a new cookie
  const query = trpc.addCookie.createQuery()
</script>

{$query.data}
