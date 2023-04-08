<script lang="ts">
  import { trpc } from "$lib/trpc";

  // query returns no data, but deletes a cookie
  const query = trpc.deleteCookie.createQuery()
</script>

{$query.data}
