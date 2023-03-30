---
title: "createTRPCRequestHandler()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# createTRPCRequestHandler()

Create `RequestHandler` function for SvelteKit `+server.ts`, e.g. GET, POST, etc.
e.g. Default file location `src/routes/trpc/[...path]/+server.ts`

## Signature

```ts
createTRPCRequestHandler<T>(options: TRPCHandleOptions<T>): RequestHandler;
```

## Type parameters

- `T` *extends* `Router`<`AnyRouterDef`<`AnyRootConfig`, `any`\>, `T`\>

## Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`TRPCHandleOptions`](../types/TRPCHandleOptions.md)<`T`\> |

## Returns

`RequestHandler`

Defined in:  [requestHandler.ts:12](https://github.com/bevm0/trpc-svelte-toolbox/blob/003683b/packages/trpc-sveltekit/src/requestHandler.ts#L12)
