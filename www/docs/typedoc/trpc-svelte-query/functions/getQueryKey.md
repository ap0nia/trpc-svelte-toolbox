---
title: "getQueryKey()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# getQueryKey()

## Signature

```ts
getQueryKey<T>(procedureOrRouter: T, input?: unknown, type: QueryType = 'any'): QueryKey;
```

## Type parameters

- `T` *extends* `AnyProcedure` \| `AnyRouter`

## Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `procedureOrRouter` | `T` | `undefined` |
| `input?` | `unknown` | `undefined` |
| `type` | `QueryType` | `'any'` |

## Returns

`QueryKey`

Defined in:  [helpers/getQueryKey.ts:36](https://github.com/bevm0/trpc-svelte-toolbox/blob/9381f64/packages/trpc-svelte-query/src/helpers/getQueryKey.ts#L36)
