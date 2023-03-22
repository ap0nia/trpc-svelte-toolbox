import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type { import('@sveltejs/kit').Config } */
export default {
  preprocess: [vitePreprocess()],
  kit: {
    alias: {
      "@bevm0/svelte-query": "../../packages/svelte-query/src"
    }
  }
}
