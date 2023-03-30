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
createTRPCSvelte<T>(trpcClientOptions: CreateTRPCClientOptions<T>, svelteQueryOptions?: CreateTRPCSvelteOptions): TRPCSvelteQueryProxy<T>;
```

## Type parameters

- `T` *extends* `Router`<`AnyRouterDef`<`AnyRootConfig`, `any`\>, `T`\>

## Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `trpcClientOptions` | `CreateTRPCClientOptions`<`T`\> | Options for creating the tRPC client. |
| `svelteQueryOptions?` | `CreateTRPCSvelteOptions` | Options that affect svelte-query behavior. |

## Returns

[`TRPCSvelteQueryProxy`](../types/TRPCSvelteQueryProxy.md)<`T`\>

Defined in:  [index.ts:357](https://github.com/bevm0/trpc-svelte-toolbox/blob/86569fd/packages/trpc-svelte-query/src/index.ts#L357)
