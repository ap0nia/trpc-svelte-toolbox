---
title: "TRPCHandleOptions"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# TRPCHandleOptions<TRouter, TRouteParams, TRouteId\>

> <`TRouter`, `TRouteParams`, `TRouteId`\> `Override`<`OptionalOptions`<`TRouter`\>, {
    `createContext`: `CreateContext`<`TRouter`, `TRouteParams`, `TRouteId`\>;
}\>

Options to create a request handler.

## Type parameters

- `TRouter` *extends* `AnyRouter`
- `TRouteParams` *extends* [`RouteParams`](RouteParams.md) = [`RouteParams`](RouteParams.md)
- `TRouteId` *extends* [`RouteId`](RouteId.md) = [`RouteId`](RouteId.md)

Defined in:  [types.ts:32](https://github.com/bevm0/trpc-svelte-toolbox/blob/626d3e4/packages/trpc-sveltekit/src/types.ts#L32)
