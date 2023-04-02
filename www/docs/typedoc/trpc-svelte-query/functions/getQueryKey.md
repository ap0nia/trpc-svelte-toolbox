---
title: "getQueryKey()"
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# getQueryKey()

Public API for getting a query key from a procedure or router.
The `svelteQueryProxy` returns a path array when `_def()` is called, not indicated by type definitions.

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

Defined in:  [helpers/getQueryKey.ts:43](https://github.com/bevm0/trpc-svelte-toolbox/blob/1f94003/packages/trpc-svelte-query/src/helpers/getQueryKey.ts#L43)
