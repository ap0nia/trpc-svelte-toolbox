---
slug: how-it-works
title: How It Works
---

## Proxies

The core of the integration revolves around three proxies:
- `svelteQuery`: Provides typical svelte-query hooks, e.g. `createQuery`, `createMutation`, etc.

- `createQueries`: 
  Generates query options for any query procedures invoked;
  provided to the `trpc.createQueries` callback function.
  The resulting *readonly* array of options is passed to svelte-query's `createQueries`.

- `context`: 
  Provides helper functions with greater control over the query client.
  Generally intended to be used within components with `setContext` and `getContext`.
  Can be used directly if a query client is provided to `svelteQueryContext` during creation,
  i.e. in SvelteKit `load` functions.

### Folder Structure
- All proxies are located in the `src/proxies` folder.
- Each proxy has three files:
  - `index`: Exports everything from the `types` and `implementation` files.
  - `types`: Describes the perceived shape of the proxy.
  - `implementation`: 
  Implements the proxy, usually with a combination of 
  `createFlatProxy` and `createRecursiveProxy` from `@trpc/server/shared`.

### Implementation
Most of the implementation was inspired by the official tRPC + react-query integration.
You can read the [blog posts here](https://trpc.io/blog/tinyrpc-client)
to get a better idea of how proxies and their typing works.

The main difference is the approach to handling root properties.
Based on [this line here](https://github.com/trpc/trpc/blob/main/packages/react-query/src/createTRPCReact.tsx#L267),
it seems that a **new** recursive proxy is created everytime a nested property
access is made to a non-designated root property (those being `useContext`, `Provider`, etc.).

This is because the inner recursive proxy "missed" the initial key, 
so it's invoked with the initial key and the previously generated hooks.
But since it's a proxy, I thought you could just "access" it at the initial key to "re-insert" it.
By doing this, I'm able to extract the creation of the inner recursive **outside**
of the initial flat proxy, and only re-calculate the inner recursive proxy once,
instead of on every access.


## Miscellaneous

### Extensions
Extends functionality of existing libraries

#### `createReactiveQuery`
Creates a query that will react to changes in the options if provided as a writable Svelte store.
Note that the **options** must be provided as a writable store. 
For ease of use with tRPC, the `createQuery` hook in the proxy only requires the 
procedure **input** to be provided as a writable store. 

Internally, a new `options` writable store is created and linked to the input store.
The options store will automatically update itself when the input changes.

e.g. looks something like this

```ts
import { writable, get } from 'svelte/store'
import { getQueryKey } from '../../helpers/getQueryKey'

const client = TRPCUntypedClient(...)

// user provides a store as first input to the query
const input = writable('Mobius') 

// user can provide more options as a regular object
const otherOptions = { keepPreviousData: true, trpc: { ... }, ... }

// create a custom options writable store 
// based on the other options and current value of input
const optionsStore = writable({
  queryKey: getQueryKey(path, get(input), 'query'),
  queryFn: client.query(path, get(input), ...otherOptions.trpc),
  ...otherOptions,
}, (set) => {
  const unsubscribe = input.subscribe((newInput) => {
    set({
      queryKey: getQueryKey(path, get(newInput), 'query'),
      queryFn: client.query(path, get(newInput), ...otherOptions.trpc),
      ...otherOptions,
    })
  })
  return () => {
    unsubscribe()
  }
})

return createReactiveQuery(optionsStore)

```

1. the user provides a writable store and optionally some svelte-query options (regular object).
2. A new `optionsStore` is created with the default protocol for creating a `queryKey` and `queryFn`.
3. The second argument to `writable` is used to subscribe to the input store.
    - Whenever input changes to a new value, set the `optionsStore` accordingly
    - i.e. keep all of the original `otherOptions` the same and recalculate the `queryKey` and `queryFn` for the new input
4. Ensure the `optionsStore` unsubscribes from its subscription once it's done.


Hopefully this function can be deprecated in my library soon,
since this is pending release on `@tanstack/svelte-query@alpha`. 
Or it could be kept around for legacy reasons.

### Helpers
Helper functions for proxies

#### `getQueryKey`
Function that invokes a hidden `_def()` method on the tRPC + svelte-query proxy 
to get the path array and call `getQueryKeyInternal` to get the query key used for that procedure/router.

#### `getQueryKeyInternal`
Function that accepts a path array, input, and a query type to generate a query key.
Typically used inside proxies to assign a query key to a request.
i.e. tRPC requests are effectively cached and identified by these keys.
