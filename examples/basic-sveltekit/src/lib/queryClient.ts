import { QueryClient } from '@tanstack/svelte-query'
import { browser } from '$app/environment'

/**
 * Shared query client for the application.
 * @see {@link https://tanstack.com/query/latest/docs/svelte/ssr#setup}
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: browser,

      refetchOnWindowFocus: false,

      /**
       * make sure you pre-fetch ALL data in +page.ts or +layout.ts!
       * i.e. including fetches needed by ALL components that will be rendered
       */
      refetchOnMount: false,

      /**
       * if there's an error, then retrying causes bad lag
       */
      retryOnMount: false,
    },
  },
})
