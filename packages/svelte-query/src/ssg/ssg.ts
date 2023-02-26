import type {
  DehydrateOptions,
  DehydratedState,
  InfiniteData,
} from '@tanstack/svelte-query';
import { dehydrate, } from '@tanstack/svelte-query';
import type {
  AnyRouter,
  ClientDataTransformerOptions,
  inferHandlerInput,
  inferProcedureOutput,
  inferRouterContext,
} from '@trpc/server';
import { callProcedure, } from '@trpc/server';
import { getArrayQueryKey } from '../internals/getArrayQueryKey';
import { getQueryClient } from '../shared';
import type { CreateTRPCSvelteQueryClientConfig } from '../shared';

interface CreateSSGHelpersOptionsBase<TRouter extends AnyRouter> {
  router: TRouter;
  ctx: inferRouterContext<TRouter>;
  transformer?: ClientDataTransformerOptions;
}
export type CreateSSGHelpersOptions<TRouter extends AnyRouter> =
  CreateSSGHelpersOptionsBase<TRouter> & CreateTRPCSvelteQueryClientConfig;

/**
 * Create functions you can use for server-side rendering / static generation
 * @deprecated use `createProxySSGHelpers` instead
 */
export function createSSGHelpers<TRouter extends AnyRouter>(
  opts: CreateSSGHelpersOptions<TRouter>,
) {
  const { router, transformer, ctx } = opts;
  type TQueries = TRouter['_def']['queries'];
  const queryClient = getQueryClient(opts);

  const serialize = transformer
    ? ('input' in transformer ? transformer.input : transformer).serialize
    : (obj: unknown) => obj;

  const prefetchQuery = async <
    TPath extends keyof TQueries & string,
    TProcedure extends TQueries[TPath],
  >(
    ...pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>]
  ) => {
    return queryClient.prefetchQuery({
      queryKey: getArrayQueryKey(pathAndInput, 'query'),
      queryFn: () => {
        return callProcedure({
          procedures: router._def.procedures,
          path: pathAndInput[0],
          rawInput: pathAndInput[1],
          ctx,
          type: 'query',
        });
      },
    });
  };

  const prefetchInfiniteQuery = async <
    TPath extends keyof TQueries & string,
    TProcedure extends TQueries[TPath],
  >(
    ...pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>]
  ) => {
    return queryClient.prefetchInfiniteQuery({
      queryKey: getArrayQueryKey(pathAndInput, 'infinite'),
      queryFn: () => {
        return callProcedure({
          procedures: router._def.procedures,
          path: pathAndInput[0],
          rawInput: pathAndInput[1],
          ctx,
          type: 'query',
        });
      },
    });
  };

  const fetchQuery = async <
    TPath extends keyof TQueries & string,
    TProcedure extends TQueries[TPath],
    TOutput extends inferProcedureOutput<TProcedure>,
  >(
    ...pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>]
  ): Promise<TOutput> => {
    return queryClient.fetchQuery({
      queryKey: getArrayQueryKey(pathAndInput, 'query'),
      queryFn: () => {
        return callProcedure({
          procedures: router._def.procedures,
          path: pathAndInput[0],
          rawInput: pathAndInput[1],
          ctx,
          type: 'query',
        });
      },
    });
  };

  const fetchInfiniteQuery = async <
    TPath extends keyof TQueries & string,
    TProcedure extends TQueries[TPath],
    TOutput extends inferProcedureOutput<TProcedure>,
  >(
    ...pathAndInput: [path: TPath, ...args: inferHandlerInput<TProcedure>]
  ): Promise<InfiniteData<TOutput>> => {
    return queryClient.fetchInfiniteQuery({
      queryKey: getArrayQueryKey(pathAndInput, 'infinite'),
      queryFn: () => {
        return callProcedure({
          procedures: router._def.procedures,
          path: pathAndInput[0],
          rawInput: pathAndInput[1],
          ctx,
          type: 'query',
        });
      },
    });
  };

  function _dehydrate(
    opts: DehydrateOptions = {
      shouldDehydrateQuery() {
        // makes sure to serialize errors
        return true;
      },
    },
  ): DehydratedState {
    const before = dehydrate(queryClient, opts);
    const after = serialize(before);
    return after;
  }

  return {
    prefetchQuery,
    prefetchInfiniteQuery,
    fetchQuery,
    fetchInfiniteQuery,
    dehydrate: _dehydrate,
    queryClient,
  };
}
