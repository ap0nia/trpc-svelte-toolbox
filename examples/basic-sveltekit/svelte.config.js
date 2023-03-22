import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type { import('@sveltejs/kit').Config } */
export default {
  preprocess: [vitePreprocess()],
  kit: {
    alias: {
      "@bevm0/trpc-svelte-query": "../../packages/trpc-svelte-query/src"
    }
  }
}
