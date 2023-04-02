---
title: "createTRPCRequestHandler()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# createTRPCRequestHandler()

Create a `RequestHandler` for SvelteKit `+server.ts`, e.g. GET, POST, etc.
Example file location: `src/routes/api/trpc/[...trpc]/+server.ts`

 If `endpoint` isn't specified, it will be inferred from the pathname.
e.g. if pathname is '/api/trpc/,a,b,c', where '/a,b,c' are params, the endpoint should be calculated as '/api/trpc'

## Signature

```ts
createTRPCRequestHandler<TRouter, TRouteParams, TRouteId>(options: TRPCHandleOptions<TRouter, TRouteParams, TRouteId>): RequestHandler<TRouteParams, TRouteId>;
```

## Type parameters

- `TRouter` *extends* `Router`<`AnyRouterDef`<`AnyRootConfig`, `any`\>, `TRouter`\>
- `TRouteParams` *extends* `Partial`<`Record`<`string`, `string`\>\> = `Partial`<`Record`<`string`, `string`\>\>
- `TRouteId` *extends* `null` \| `string` = `null` \| `string`

## Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`TRPCHandleOptions`](../types/TRPCHandleOptions.md)<`TRouter`, `TRouteParams`, `TRouteId`\> |

## Returns

`RequestHandler`<`TRouteParams`, `TRouteId`\>

Defined in:  [requestHandler.ts:13](https://github.com/bevm0/trpc-svelte-toolbox/blob/1f94003/packages/trpc-sveltekit/src/requestHandler.ts#L13)
