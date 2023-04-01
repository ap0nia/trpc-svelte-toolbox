export async function load({ parent }) {
  const { trpc } = await parent()

  return {
    '': trpc.loadContext[''].prefetch('Elysia'),
    greeting: trpc.loadContext.greeting.fetch('Aponia'),
    goodbye: trpc.loadContext.goodbye.ensureData('Kiana'),
  }
}
