import {
  createInfiniteQuery as __useInfiniteQuery,
  createMutation as __useMutation,
  createQueries as __useQueries,
  createQuery as __useQuery,
  hashQueryKey,
  useQueryClient,
  type DehydratedState,
} from '@tanstack/svelte-query';
import { createTRPCClient, type TRPCClientErrorLike } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import type { Observable } from '@trpc/server/observable';
import type { TRPCContextState, SSRState } from '../../internals/context';
import { getArrayQueryKey } from '../../internals/getArrayQueryKey';
import type { QueryType } from '../../internals/getArrayQueryKey';
import { getClientArgs } from '../../internals/getClientArgs';
import { useHookResult } from '../../internals/useHookResult';
import type { TRPCUseQueries } from '../../internals/useQueries';
import { createUseQueriesProxy } from '../proxy/useQueriesProxy';
import type { CreateTRPCReactOptions, UseMutationOverride } from '../types';
import type {
  CreateClient,
  TRPCProvider,
  TRPCQueryOptions,
  UseDehydratedState,
  UseTRPCInfiniteQueryOptions,
  UseTRPCInfiniteQueryResult,
  UseTRPCMutationOptions,
  UseTRPCMutationResult,
  UseTRPCQueryOptions,
  UseTRPCQueryResult,
  UseTRPCSubscriptionOptions,
} from './types';

/**
 * @see {@link https://svelte.dev/repl/300c16ee38af49e98261eef02a9b04a8?version=3.55.1}
 */
import { afterUpdate, onDestroy } from 'svelte';

export function useEffect(cb: Function, deps: () => any[]) {
	let cleanup: Function | undefined;
	
	function apply() {
		if (cleanup) cleanup();
		cleanup = cb();
	}
	
	if (deps) {
		let values: any[] = [];
		afterUpdate(() => {
			const new_values = deps();
			if (new_values.some((value, i) => value !== values[i])) {
				apply();
				values = new_values;
			}
		});
	} else {
		// no deps = always run
		afterUpdate(apply);
	}
	
	onDestroy(() => {
		if (cleanup) cleanup();
	});
}

/**
 * @internal
 */
export function createRootHooks<
  TRouter extends AnyRouter,
  TSSRContext = unknown,
>(config?: CreateTRPCReactOptions<TRouter>) {
  const mutationSuccessOverride: UseMutationOverride['onSuccess'] =
    config?.unstable_overrides?.useMutation?.onSuccess ??
    ((options) => options.originalFn());

  type TError = TRPCClientErrorLike<TRouter>;

  /**
   * getContext(TRPCContextKey) is expected to return this
   */
  type ProviderContext = TRPCContextState<TRouter, TSSRContext>;

  /**
   * query client context
   */
  const ReactQueryContext = config?.reactQueryContext

  const createClient: CreateClient<TRouter> = (opts) => {
    return createTRPCClient(opts);
  };

  let context: ProviderContext;

  /**
   * in React, the TRPCProvider wraps around the app to provide context
   * instead, we call it as a function to initialize the context
   */
  const TRPCProvider: TRPCProvider<TRouter, TSSRContext> = (props) => {
    const { abortOnUnmount = false, client, queryClient, ssrContext } = props;
    let ssrState: SSRState = props.ssrState ?? false
    ssrState = ssrState ? 'mounted' : false

    /**
     * set the context, different from React because no provider
     */
    context = {
      abortOnUnmount,
      queryClient,
      client,
      ssrContext: ssrContext || null,
      ssrState,

      fetchQuery(pathAndInput: any, opts: any) {
        return queryClient.fetchQuery({
          ...opts,
          queryKey: getArrayQueryKey(pathAndInput, 'query'),
          queryFn: () =>
            (client as any).query(...getClientArgs(pathAndInput, opts)),
        });
      },

      fetchInfiniteQuery(pathAndInput: any, opts: any) {
        return queryClient.fetchInfiniteQuery({
          ...opts,
          queryKey: getArrayQueryKey(pathAndInput, 'infinite'),
          queryFn: ({ pageParam }: { pageParam: any }) => {
            const [path, input] = pathAndInput;
            const actualInput = { ...input, cursor: pageParam };
            return (client as any).query(
              ...getClientArgs([path, actualInput], opts),
            );
          },
        });
      },

      prefetchQuery(pathAndInput: any, opts: any) {
        return queryClient.prefetchQuery({
          ...opts,
          queryKey: getArrayQueryKey(pathAndInput, 'query'),
          queryFn: () =>
            (client as any).query(...getClientArgs(pathAndInput, opts)),
        });
      },

      prefetchInfiniteQuery(pathAndInput: any, opts: any) {
        return queryClient.prefetchInfiniteQuery({
          ...opts,
          queryKey: getArrayQueryKey(pathAndInput, 'infinite'),
          queryFn: ({ pageParam }: { pageParam: any }) => {
            const [path, input] = pathAndInput;
            const actualInput = { ...input, cursor: pageParam };
            return (client as any).query(
              ...getClientArgs([path, actualInput], opts),
            );
          },
        });
      },

      invalidateQueries(queryKey: any, filters: any, options: any) {
        return queryClient.invalidateQueries(
          {
            ...filters,
            queryKey: getArrayQueryKey(queryKey, 'any'),
          },
          options,
        );
      },

      resetQueries(...args: any[]) {
        const [queryKey, filters, options] = args;

        return queryClient.resetQueries(
          {
            ...filters,
            queryKey: getArrayQueryKey(queryKey, 'any'),
          },
          options,
        );
      },

      refetchQueries(...args: any[]) {
        const [queryKey, filters, options] = args;

        return queryClient.refetchQueries(
          {
            ...filters,
            queryKey: getArrayQueryKey(queryKey, 'any'),
          },
          options,
        );
      },

      cancelQuery(pathAndInput: any) {
        return queryClient.cancelQueries({
          queryKey: getArrayQueryKey(pathAndInput, 'any'),
        });
      },

      setQueryData(...args: any[]) {
          const [queryKey, ...rest] = args;

          return queryClient.setQueryData(
            getArrayQueryKey(queryKey, 'query'),
            rest, // ...rest,
          );
        },

      getQueryData(...args: any[]) {
        const [queryKey, ...rest] = args;

        return queryClient.getQueryData(
          getArrayQueryKey(queryKey, 'query'),
          ...rest,
        );
      },

      setInfiniteQueryData(...args: any[]) {
        const [queryKey, ...rest] = args;

        return queryClient.setQueryData(
          getArrayQueryKey(queryKey, 'infinite'),
          rest // ...rest,
        );
      },

      getInfiniteQueryData(...args: any[]) {
        const [queryKey, ...rest] = args;

        return queryClient.getQueryData(
          getArrayQueryKey(queryKey, 'infinite'),
          ...rest,
        );
      },
    }
    return context
  };

  function useContext() {
    return context
  }

  /**
   * Hack to make sure errors return `status`='error` when doing SSR
   * @link https://github.com/trpc/trpc/pull/1645
   */
  function useSSRQueryOptionsIfNeeded<
    TOptions extends { retryOnMount?: boolean } | undefined,
  >(
    pathAndInput: unknown[],
    type: Exclude<QueryType, 'any'>,
    opts: TOptions,
  ): TOptions {
    const { queryClient, ssrState } = useContext();
    return ssrState &&
      ssrState !== 'mounted' &&
      queryClient.getQueryCache().find(getArrayQueryKey(pathAndInput, type))
        ?.state.status === 'error'
      ? {
          retryOnMount: false,
          ...opts,
        }
      : opts;
  }

  function useQuery(
    // FIXME path should be a tuple in next major
    pathAndInput: [path: string, ...args: unknown[]],
    opts?: UseTRPCQueryOptions<unknown, unknown, unknown, unknown, TError>,
  ): UseTRPCQueryResult<unknown, TError> {
    const { abortOnUnmount, client, ssrState, queryClient, prefetchQuery } =
      useContext();

    if (
      typeof window === 'undefined' &&
      ssrState === 'prepass' &&
      opts?.trpc?.ssr !== false &&
      opts?.enabled !== false &&
      !queryClient.getQueryCache().find(getArrayQueryKey(pathAndInput, 'query'))
    ) {
      void prefetchQuery(pathAndInput as any, opts as any);
    }
    const ssrOpts = useSSRQueryOptionsIfNeeded(pathAndInput, 'query', opts);
    // request option should take priority over global
    const shouldAbortOnUnmount = opts?.trpc?.abortOnUnmount ?? abortOnUnmount;

    const hook = __useQuery({
      ...ssrOpts,
      queryKey: getArrayQueryKey(pathAndInput, 'query') as any,
      queryFn: (queryFunctionContext) => {
        const actualOpts = {
          ...ssrOpts,
          trpc: {
            ...ssrOpts?.trpc,
            ...(shouldAbortOnUnmount
              ? { signal: queryFunctionContext.signal }
              : {}),
          },
        };

        return (client as any).query(
          ...getClientArgs(pathAndInput, actualOpts),
        );
      },
      context: ReactQueryContext,
    }) as UseTRPCQueryResult<unknown, TError>;

    hook.trpc = useHookResult({
      path: pathAndInput[0],
    });

    return hook;
  }

  function useMutation(
    // FIXME: this should only be a tuple path in next major
    path: string | [string],
    opts?: UseTRPCMutationOptions<unknown, TError, unknown, unknown>,
  ): UseTRPCMutationResult<unknown, TError, unknown, unknown> {
    const { client } = useContext();
    const queryClient = ReactQueryContext || useQueryClient()
    const actualPath = Array.isArray(path) ? path[0] : path;

    const hook = __useMutation({
      ...opts,
      mutationKey: [actualPath.split('.')],
      mutationFn: (input) => {
        return (client.mutation as any)(
          ...getClientArgs([actualPath, input], opts),
        );
      },
      context: ReactQueryContext,
      onSuccess(...args) {
        const originalFn = () => opts?.onSuccess?.(...args);

        return mutationSuccessOverride({
          originalFn,
          queryClient,
          meta: opts?.meta ?? {},
        });
      },
    }) as UseTRPCMutationResult<unknown, TError, unknown, unknown>;

    hook.trpc = useHookResult({
      path: actualPath,
    });

    return hook;
  }

  /* istanbul ignore next */
  function useSubscription(
    pathAndInput: [
      // FIXME: tuple me in next major
      path: string,
      ...args: unknown[],
    ],
    opts: UseTRPCSubscriptionOptions<Observable<unknown, unknown>, TError>,
  ) {
    const enabled = opts?.enabled ?? true;
    const queryKey = hashQueryKey(pathAndInput);
    const { client } = useContext();

    return useEffect(() => {
      if (!enabled) {
        return;
      }
      const [path, input] = pathAndInput;
      let isStopped = false;
      const subscription = client.subscription(
        path,
        (input ?? undefined) as any,
        {
          onStarted: () => {
            if (!isStopped) {
              opts.onStarted?.();
            }
          },
          onData: (data) => {
            if (!isStopped) {
              // FIXME this shouldn't be needed as both should be `unknown` in next major
              opts.onData(data as any);
            }
          },
          onError: (err) => {
            if (!isStopped) {
              opts.onError?.(err);
            }
          },
        },
      );
      return () => {
        isStopped = true;
        subscription.unsubscribe();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, () => [queryKey, enabled]);
  }

  function useInfiniteQuery(
    pathAndInput: [
      // FIXME tuple in next major
      path: string,
      input: Record<any, unknown>,
    ],
    opts?: UseTRPCInfiniteQueryOptions<unknown, unknown, unknown, TError>,
  ): UseTRPCInfiniteQueryResult<unknown, TError> {
    const [path, input] = pathAndInput;
    const {
      client,
      ssrState,
      prefetchInfiniteQuery,
      queryClient,
      abortOnUnmount,
    } = useContext();

    if (
      typeof window === 'undefined' &&
      ssrState === 'prepass' &&
      opts?.trpc?.ssr !== false &&
      opts?.enabled !== false &&
      !queryClient
        .getQueryCache()
        .find(getArrayQueryKey(pathAndInput, 'infinite'))
    ) {
      void prefetchInfiniteQuery(pathAndInput as any, opts as any);
    }

    const ssrOpts = useSSRQueryOptionsIfNeeded(pathAndInput, 'infinite', opts);

    // request option should take priority over global
    const shouldAbortOnUnmount = opts?.trpc?.abortOnUnmount ?? abortOnUnmount;

    const hook = __useInfiniteQuery({
      ...ssrOpts,
      queryKey: getArrayQueryKey(pathAndInput, 'infinite') as any,
      queryFn: (queryFunctionContext) => {
        const actualOpts = {
          ...ssrOpts,
          trpc: {
            ...ssrOpts?.trpc,
            ...(shouldAbortOnUnmount
              ? { signal: queryFunctionContext.signal }
              : {}),
          },
        };

        const actualInput = {
          ...((input as any) ?? {}),
          cursor: queryFunctionContext.pageParam,
        };

        // FIXME as any shouldn't be needed as client should be untyped too
        return (client as any).query(
          ...getClientArgs([path, actualInput], actualOpts),
        );
      },
      // context: ReactQueryContext,
    }) as UseTRPCInfiniteQueryResult<unknown, TError>;

    hook.trpc = useHookResult({
      path,
    });
    return hook;
  }

  const useQueries: TRPCUseQueries<TRouter> = (queriesCallback, context) => {
    const { ssrState, queryClient, prefetchQuery, client } = useContext();

    const proxy = createUseQueriesProxy(client);

    const queries = queriesCallback(proxy);

    if (typeof window === 'undefined' && ssrState === 'prepass') {
      for (const query of queries) {
        const queryOption = query as TRPCQueryOptions<any, any, any, any>;
        if (
          queryOption.trpc?.ssr !== false &&
          !queryClient
            .getQueryCache()
            .find(getArrayQueryKey(queryOption.queryKey!, 'query'))
        ) {
          void prefetchQuery(queryOption.queryKey as any, queryOption as any);
        }
      }
    }

    return __useQueries(
      queries.map((query) => ({
        ...query,
        queryKey: getArrayQueryKey(query.queryKey, 'query'),
      })),
    ) as any;
  };

  const useDehydratedState: UseDehydratedState<TRouter> = (
    client,
    trpcState,
  ) => {
      if (!trpcState) {
        return trpcState;
      }

      return client.runtime.transformer.deserialize(trpcState) as DehydratedState;
  };

  return {
    Provider: TRPCProvider,
    createClient,
    useContext,
    useQuery,
    useQueries,
    useMutation,
    useSubscription,
    useDehydratedState,
    useInfiniteQuery,
  };
}

/**
 * Hack to infer the type of `createReactQueryHooks`
 * @link https://stackoverflow.com/a/59072991
 */
class GnClass<TRouter extends AnyRouter, TSSRContext = unknown> {
  fn() {
    return createRootHooks<TRouter, TSSRContext>();
  }
}

type returnTypeInferer<TType> = TType extends (
  a: Record<string, string>
) => infer U
  ? U
  : never;
type fooType<TRouter extends AnyRouter, TSSRContext = unknown> = GnClass<
  TRouter,
  TSSRContext
>["fn"];

/**
 * Infer the type of a `createReactQueryHooks` function
 * @internal
 */
export type CreateSvelteQueryHooks<
  TRouter extends AnyRouter,
  TSSRContext = unknown
> = returnTypeInferer<fooType<TRouter, TSSRContext>>;
