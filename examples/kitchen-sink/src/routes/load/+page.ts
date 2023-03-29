export async function load({ parent }) {
  const { trpc } = await parent()

  return {
    '': trpc.utils[''].prefetch('Elysia'),
    greeting: trpc.utils.greeting.fetch('Aponia'),
    goodbye: trpc.utils.goodbye.ensureData('Kiana'),
  }
}
