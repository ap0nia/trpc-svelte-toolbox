import {} from './ssr'

declare module '@sveltejs/kit' {
  namespace App {
    interface Locals {
      trpcSSRData: Map<any, any>
    }
  }
}

