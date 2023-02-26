import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type{import('@sveltejs/kit').Config } */
export default {
  preprocess: [
    vitePreprocess()
  ],
  kit: {
    alias: {
      '@apps/server': '../server',
      '@packages/svelte-query': '../../packages/svelte-query/src',
      $lib: './src/lib',
    }
  }
}
