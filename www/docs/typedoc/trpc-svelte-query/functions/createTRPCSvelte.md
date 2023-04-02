---
title: "createTRPCSvelte()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# createTRPCSvelte()

Create a proxy that will provide access to all other tRPC + svelte-query proxies.

## Signature

```ts
createTRPCSvelte<T>(trpcClientOptions: CreateTRPCClientOptions<T>, svelteQueryOptions?: SvelteQueryProxyOptions): TRPCSvelte<T>;
```

## Type parameters

- `T` *extends* `Router`<`AnyRouterDef`<`AnyRootConfig`, `any`\>, `T`\>

## Parameters

| Name | Type |
| :------ | :------ |
| `trpcClientOptions` | `CreateTRPCClientOptions`<`T`\> |
| `svelteQueryOptions?` | `SvelteQueryProxyOptions` |

## Returns

[`TRPCSvelte`](../types/TRPCSvelte.md)<`T`\>

Defined in:  [createTRPCSvelte.ts:68](https://github.com/bevm0/trpc-svelte-toolbox/blob/1f94003/packages/trpc-svelte-query/src/createTRPCSvelte.ts#L68)
