---
title: "createTRPCHandle()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# createTRPCHandle()

Create `handle` function for SvelteKit `hooks.server`.

## Signature

```ts
createTRPCHandle<T>(options: TRPCHandleOptions<T>): Handle;
```

## Type parameters

- `T` *extends* `Router`<`AnyRouterDef`<`AnyRootConfig`, `any`\>, `T`\>

## Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`TRPCHandleOptions`](../types/TRPCHandleOptions.md)<`T`\> |

## Returns

`Handle`

Defined in:  [handle.ts:11](https://github.com/trpc/trpc/blob/6ffba67/packages/trpc-sveltekit/src/handle.ts#L11)
