---
title: "createTRPCSvelte()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# createTRPCSvelte()

Create a tRPC + svelte-query proxy.

## Signature

```ts
createTRPCSvelte<T>(opts: CreateTRPCClientOptions<T>, queryClient?: QueryClient): TRPCSvelteQueryProxy<T>;
```

## Type parameters

- `T` *extends* `Router`<`AnyRouterDef`<`AnyRootConfig`, `any`\>, `T`\>

## Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `CreateTRPCClientOptions`<`T`\> | Options for creating the tRPC client. |
| `queryClient?` | `QueryClient` | - |

## Returns

[`TRPCSvelteQueryProxy`](../types/TRPCSvelteQueryProxy.md)<`T`\>

Defined in:  [index.ts:311](https://github.com/bevm0/trpc-svelte-toolbox/blob/94bbd02/packages/trpc-svelte-query/src/index.ts#L311)
