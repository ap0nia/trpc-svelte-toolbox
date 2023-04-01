---
title: "createTRPCRequestHandler()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# createTRPCRequestHandler()

Create `RequestHandler` function for SvelteKit `+server.ts`, e.g. GET, POST, etc.
e.g. Default file location `src/routes/trpc/[...path]/+server.ts`

 If endpoint isn't provided, it will be inferred from the pathname.
e.g. if pathname is '/api/trpc/,a,b,c', where '/a,b,c' are params, the endpoint will be '/api/trpc'

## Signature

```ts
createTRPCRequestHandler<TRouter, TRouteParams, TRouteId>(options: TRPCHandleOptions<TRouter, TRouteParams, TRouteId>): RequestHandler<TRouteParams, TRouteId>;
```

## Type parameters

- `TRouter` *extends* `Router`<`AnyRouterDef`<`AnyRootConfig`, `any`\>, `TRouter`\>
- `TRouteParams` *extends* `Partial`<`Record`<`string`, `string`\>\> = `Partial`<`Record`<`string`, `string`\>\>
- `TRouteId` *extends* [`RouteId`](../types/RouteId.md) = [`RouteId`](../types/RouteId.md)

## Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`TRPCHandleOptions`](../types/TRPCHandleOptions.md)<`TRouter`, `TRouteParams`, `TRouteId`\> |

## Returns

`RequestHandler`<`TRouteParams`, `TRouteId`\>

Defined in:  [requestHandler.ts:13](https://github.com/bevm0/trpc-svelte-toolbox/blob/e436d4e/packages/trpc-sveltekit/src/requestHandler.ts#L13)
