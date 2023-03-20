import { createTRPCClient, CreateTRPCClientOptions, createTRPCClientProxy, TRPCClient, TRPCClientError, TRPCRequestOptions } from '@trpc/client'
import type { ProcedureOptions } from '@trpc/server/src';
import type { TRPCClientErrorLike } from '@trpc/client';
import type { UseMutationOverride } from '@trpc/react-query/src/shared/types'
import { QueryKeyKnown, QueryType, getArrayQueryKey } from '@trpc/react-query/src/internals/getArrayQueryKey'
import { getQueryKeyInternal } from '@trpc/react-query/src/internals/getQueryKey'
import { getClientArgs } from '@trpc/react-query/src/internals/getClientArgs'
import { useHookResult } from '@trpc/react-query/src/internals/useHookResult'
import type { TRPCHookResult } from '@trpc/react-query/src/internals/useHookResult'
import type { ExtractCursorType } from '@trpc/react-query/src/shared/hooks/types'
import type { DeepPartial, Filter, AnyRouter, AnySubscriptionProcedure, AnyQueryProcedure, AnyMutationProcedure, AnyProcedure } from '@trpc/server';
import { createInfiniteQuery, createQueries, FetchInfiniteQueryOptions, FetchQueryOptions } from '@tanstack/svelte-query';
import { TRPCContextState } from '@trpc/react-query/dist/shared';
import type { Observable } from '@trpc/server/observable';
import { createRecursiveProxy, createFlatProxy } from '@trpc/server/src/shared/createProxy'
import type { CreateTRPCProxyClient } from '@trpc/client/src/createTRPCClientProxy'
import type {
  InvalidateQueryFilters,
  InvalidateOptions,
  InitialDataFunction,
  InfiniteData,
  InfiniteQueryObserverSuccessResult,
  DefinedCreateQueryResult,
  QueryObserverSuccessResult,
  Query,
  QueryKey,
  CreateQueryOptions,
  CreateQueryResult,
  CreateMutationOptions,
  CreateMutationResult,
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
  RefetchQueryFilters,
  RefetchOptions,
  CancelOptions,
  ResetOptions,
  Updater,
  SetDataOptions,
} from '@tanstack/svelte-query'
import {
  QueryOptions,
  DehydratedState,
  QueryClient,
  createInfiniteQuery as __useInfiniteQuery,
  createMutation as __useMutation,
  createQueries as __useQueries,
  createQuery as __useQuery,
  hashQueryKey,
  useQueryClient,
} from '@tanstack/svelte-query';
import { createUseQueriesProxy } from '@trpc/react-query/src/shared/proxy/useQueriesProxy'
import type { UseQueriesProcedureRecord } from '@trpc/react-query/src/shared/proxy/useQueriesProxy'
import type { QueriesOptions } from '@trpc/react-query/src/internals/useQueries'
import { CreateQueriesResult } from '@tanstack/svelte-query/build/lib/createQueries';
import type { inferTransformedProcedureOutput, inferTransformedSubscriptionOutput } from '@trpc/server/src/shared/jsonify'
import type { inferProcedureInput } from '@trpc/server/src/core/types'

export type DefinedCreateTRPCQueryResult<TData, TError> = DefinedCreateQueryResult<
  TData,
  TError
> &
  TRPCHookResult;

export type CreateTRPCQuerySuccessResult<TData, TError> =
  QueryObserverSuccessResult<TData, TError> & TRPCHookResult;

/** @internal **/
export interface DefinedUseTRPCQueryOptions<
  TPath,
  TInput,
  TOutput,
  TData,
  TError,
> extends CreateTRPCQueryOptions<TPath, TInput, TOutput, TData, TError> {
  initialData: TOutput | InitialDataFunction<TOutput>;
}

export type UseTRPCInfiniteQuerySuccessResult<TData, TError> =
  InfiniteQueryObserverSuccessResult<TData, TError> & TRPCHookResult;

export type CreateDehydratedState<TRouter extends AnyRouter> = (
  client: TRPCClient<TRouter>,
  trpcState: DehydratedState | undefined,
) => DehydratedState | undefined;

export interface TRPCQueryOptions<TPath, TInput, TData, TError>
  extends QueryOptions<TData, TError, TData, [TPath, TInput]>,
    TRPCCreateQueryBaseOptions {}


/**
 * @internal
 */
export type UseQueryOptionsForUseQueries<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<CreateQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'context'>;

export type TRPCUseQueries<TRouter extends AnyRouter> = <
  TQueryOptions extends UseQueryOptionsForUseQueries<any, any, any, any>[],
>(
  queriesCallback: (
    t: UseQueriesProcedureRecord<TRouter>,
  ) => readonly [...QueriesOptions<TQueryOptions>],
  context?: CreateQueryOptions['context'],
) => CreateQueriesResult<TQueryOptions>;


export type CreateTRPCInfiniteQueryResult<TData, TError> = CreateInfiniteQueryResult<
  TData,
  TError
> &
  TRPCHookResult;

export interface CreateTRPCInfiniteQueryOptions<TPath, TInput, TOutput, TError>
  extends CreateInfiniteQueryOptions<
      TOutput,
      TError,
      TOutput,
      TOutput,
      [TPath, Omit<TInput, 'cursor'>]
    >,
    TRPCCreateQueryBaseOptions {
  initialCursor?: ExtractCursorType<TInput>;
}

export interface CreateTRPCSubscriptionOptions<TOutput, TError> {
  enabled?: boolean;
  onStarted?: () => void;
  onData: (data: TOutput) => void;
  onError?: (err: TError) => void;
}

export type CreateTRPCMutationResult<TData, TError, TVariables, TContext> =
  CreateMutationResult<TData, TError, TVariables, TContext> & TRPCHookResult;

export interface UseTRPCMutationOptions<
  TInput,
  TError,
  TOutput,
  TContext = unknown,
> extends CreateMutationOptions<TOutput, TError, TInput, TContext>,
    TRPCCreateQueryBaseOptions {}

/**
 * @internal
 * Merged `CreateTRPCReactOptions` with `TRPCProviderProps` -> `TRPCContextProps`.
 */
export interface CreateTRPCSvelteOptions<TRouter extends AnyRouter, TSSRContext> {

  /**
   * Override behaviors of the built-in hooks
   */
  unstable_overrides?: {
    useMutation?: Partial<UseMutationOverride>;
  };

  queryClient: QueryClient

  /**
   * State of SSR hydration.
   * - `false` if not using SSR.
   * - `prepass` when doing a prepass to fetch queries' data
   * - `mounting` before TRPCProvider has been rendered on the client
   * - `mounted` when the TRPCProvider has been rendered on the client
   * @default false
   */
  ssrState?: SSRState;

  /**
   * The SSR context when server-side rendering
   * @default null
   */
  ssrContext?: TSSRContext | null;

  /**
   * Abort loading query calls when unmounting a component - usually when navigating to a new page
   * @default false
   */
  abortOnUnmount?: boolean;

  /**
   * Override the client created in `createHooks`.
   */
  client?: TRPCClient<TRouter>

  /**
   * Override the default Svelte Query context
   * @default undefined
   */
  svelteQueryContext?: QueryClient | undefined;
}

export interface TRPCSvelteRequestOptions
  /**
   * For RQ, we use their internal AbortSignals instead of letting the user pass their own
   */
  extends Omit<TRPCRequestOptions, 'signal'> {

  /**
   * Opt out of SSR for this query by passing `ssr: false`
   */
  ssr?: boolean;

  /**
   * Opt out or into aborting request on unmount
   */
  abortOnUnmount?: boolean;
}

export interface TRPCCreateQueryBaseOptions {
  /**
   * tRPC-related options
   */
  trpc?: TRPCSvelteRequestOptions;
}

export interface CreateTRPCQueryOptions<TPath, TInput, TOutput, TData, TError>
  extends CreateQueryOptions<TOutput, TError, TData, [TPath, TInput]>,
    TRPCCreateQueryBaseOptions {}


export type CreateTRPCQueryResult<TData, TError> = CreateQueryResult<TData, TError> &
  TRPCHookResult;

export type SSRState = false | 'prepass' | 'mounting' | 'mounted';

export function __createHooksInternal<
  TRouter extends AnyRouter,
  TSSRContext
>(
  opts?: CreateTRPCClientOptions<TRouter>,
  config?: CreateTRPCSvelteOptions<TRouter, TSSRContext>
) {
  const mutationSuccessOverride =
    config?.unstable_overrides?.useMutation?.onSuccess ??
    ((options) => options.originalFn());

  type TError = TRPCClientErrorLike<TRouter>;
  type ProviderContext = TRPCContextState<TRouter, TSSRContext>;

  const client = config.client ?? createTRPCClient(opts)

  const { abortOnUnmount = false, queryClient, ssrContext } = config;

  const SvelteQueryContext = config?.svelteQueryContext

  const ssrState = config.ssrState ?? false

  let x = queryClient.fetchInfiniteQuery({
    queryFn: (seggs: any) => {
      return seggs
    }
  })
  

  queryClient.fetchInfiniteQuery({
    queryFn(queryFnContext) {
      queryFnContext.queryKey
    }
  })
  const context: ProviderContext = {
    abortOnUnmount,
    queryClient,
    client,
    ssrContext: ssrContext || null,
    ssrState,
    fetchQuery(pathAndInput, opts) {
      return queryClient.fetchQuery({
        ...opts,
        queryKey: getArrayQueryKey(pathAndInput, 'query'),
        queryFn: () =>
          (client as any).query(...getClientArgs(pathAndInput, opts)),
      });
    },
    fetchInfiniteQuery(pathAndInput, opts) {
      return queryClient.fetchInfiniteQuery({
        ...opts,
        queryKey: getArrayQueryKey(pathAndInput, 'infinite'),
        queryFn: ({ pageParam }) => {
          const [path, input] = pathAndInput;
          const actualInput = { ...input, cursor: pageParam };
          return (client as any).query(
            ...getClientArgs([path, actualInput], opts),
          );
        },
      });
    },
    prefetchQuery(pathAndInput, opts) {
      return queryClient.prefetchQuery({
        ...opts,
        queryKey: getArrayQueryKey(pathAndInput, 'query'),
        queryFn: () =>
          (client as any).query(...getClientArgs(pathAndInput, opts)),
      });
    },
    prefetchInfiniteQuery(pathAndInput, opts) {
      return queryClient.prefetchInfiniteQuery({
        ...opts,
        queryKey: getArrayQueryKey(pathAndInput, 'infinite'),
        queryFn: ({ pageParam }) => {
          const [path, input] = pathAndInput;
          const actualInput = { ...input, cursor: pageParam };
          return (client as any).query(
            ...getClientArgs([path, actualInput], opts),
          );
        },
      });
    },
    ensureQueryData(pathAndInput, opts) {
      return queryClient.ensureQueryData({
        ...opts,
        queryKey: getArrayQueryKey(pathAndInput, 'query'),
        queryFn: () =>
          (client as any).query(...getClientArgs(pathAndInput, opts)),
      });
    },
    invalidateQueries(queryKey, filters, options) {
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
    cancelQuery(pathAndInput) {
      return queryClient.cancelQueries({
        queryKey: getArrayQueryKey(pathAndInput, 'any'),
      });
    },
    setQueryData(...args) {
      const [queryKey, ...rest] = args;
      return queryClient.setQueryData(
        getArrayQueryKey(queryKey, 'query'),
        ...rest,
      );
    },
    getQueryData(...args) {
      const [queryKey, ...rest] = args;

      return queryClient.getQueryData(
        getArrayQueryKey(queryKey, 'query'),
        ...rest,
      );
    },
    setInfiniteQueryData(...args) {
      const [queryKey, ...rest] = args;

      return queryClient.setQueryData(
        getArrayQueryKey(queryKey, 'infinite'),
        ...rest,
      );
    },
    getInfiniteQueryData(...args) {
      const [queryKey, ...rest] = args;

      return queryClient.getQueryData(
        getArrayQueryKey(queryKey, 'infinite'),
        ...rest,
      );
    },
  }

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
    const { queryClient, ssrState } = context;
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
    opts?: CreateTRPCQueryOptions<unknown, unknown, unknown, unknown, TError>,
  ): CreateTRPCQueryResult<unknown, TError> {
    const { abortOnUnmount, client, ssrState, queryClient, prefetchQuery } = context;

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

    const query = __useQuery({
      ...ssrOpts,
      queryKey: getArrayQueryKey(pathAndInput, 'query') as any,
      queryFn: (queryFunctionContext) => {
        queryFunctionContext.signal
        const actualOpts = {
          ...ssrOpts,
          trpc: {
            ...ssrOpts?.trpc,
            ...(shouldAbortOnUnmount
              ? { signal: queryFunctionContext.signal }
              : {}),
          },
        };

        client.query('', '', {
          ...actualOpts.trpc
        })

        return (client as any).query(
          ...getClientArgs(pathAndInput, actualOpts),
        );
      },
      context: SvelteQueryContext,
    });

    const hook = {
      ...query,
      trpc: useHookResult({
        path: pathAndInput[0],
      })
    }


    return hook;
  }

  function useMutation(
    // FIXME: this should only be a tuple path in next major
    path: string | [string],
    opts?: UseTRPCMutationOptions<unknown, TError, unknown, unknown>,
  ): CreateTRPCMutationResult<unknown, TError, unknown, unknown> {
    const { client } = context
    const queryClient = useQueryClient();
    const actualPath = Array.isArray(path) ? path[0] : path;

    const hook = __useMutation({
      ...opts,
      mutationKey: [actualPath.split('.')],
      mutationFn: (input) => {
        return (client.mutation as any)(
          ...getClientArgs([actualPath, input], opts),
        );
      },
      context: SvelteQueryContext,
      onSuccess(...args) {
        const originalFn = () => opts?.onSuccess?.(...args);

        return mutationSuccessOverride({
          originalFn,
          queryClient,
          meta: opts?.meta ?? {},
        });
      },
    }) as CreateTRPCMutationResult<unknown, TError, unknown, unknown>;

    hook.trpc = useHookResult({
      path: actualPath,
    });

    return hook;
  }

  /* istanbul ignore next -- @preserve */
  function useSubscription(
    pathAndInput: [
      // FIXME: tuple me in next major
      path: string,
      ...args: unknown[],
    ],
    opts: CreateTRPCSubscriptionOptions<Observable<unknown, unknown>, TError>,
  ) {
    // const enabled = opts?.enabled ?? true;
    // const queryKey = hashQueryKey(pathAndInput);
    // const { client } = context

    // return useEffect(() => {
    //   if (!enabled) {
    //     return;
    //   }
    //   const [path, input] = pathAndInput;
    //   let isStopped = false;
    //   const subscription = client.subscription(
    //     path,
    //     (input ?? undefined) as any,
    //     {
    //       onStarted: () => {
    //         if (!isStopped) {
    //           opts.onStarted?.();
    //         }
    //       },
    //       onData: (data) => {
    //         if (!isStopped) {
    //           // FIXME this shouldn't be needed as both should be `unknown` in next major
    //           opts.onData(data as any);
    //         }
    //       },
    //       onError: (err) => {
    //         if (!isStopped) {
    //           opts.onError?.(err);
    //         }
    //       },
    //     },
    //   );
    //   return () => {
    //     isStopped = true;
    //     subscription.unsubscribe();
    //   };
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [queryKey, enabled]);
  }

  function useInfiniteQuery(
    pathAndInput: [
      // FIXME tuple in next major
      path: string,
      input: Record<any, unknown>,
    ],
    opts?: CreateTRPCInfiniteQueryOptions<unknown, unknown, unknown, TError>,
  ): CreateTRPCInfiniteQueryResult<unknown, TError> {
    const [path, input] = pathAndInput;
    const {
      client,
      ssrState,
      prefetchInfiniteQuery,
      queryClient,
      abortOnUnmount,
    } = context

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
          cursor: queryFunctionContext.pageParam ?? opts?.initialCursor,
        };

        // FIXME as any shouldn't be needed as client should be untyped too
        return (client as any).query(
          ...getClientArgs([path, actualInput], actualOpts),
        );
      },
      // context: SvelteQueryContext,
    }) as CreateTRPCInfiniteQueryResult<unknown, TError>;

    hook.trpc = useHookResult({
      path,
    });
    return hook;
  }

  const useQueries: TRPCUseQueries<TRouter> = (queriesCallback) => {
    const { ssrState, queryClient, prefetchQuery, client } = context;

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

    // return __useQueries({
    //   queries: queries.map((query) => ({
    //     ...query,
    //     queryKey: getArrayQueryKey(query.queryKey, 'query'),
    //   })),
    //   context,
    // }) as any;
  };

  const useDehydratedState: CreateDehydratedState<TRouter> = (
    client,
    trpcState,
  ) => {
    const transformed: DehydratedState | undefined = 
      !trpcState 
        ? trpcState : client.runtime.transformer.deserialize(trpcState);
    return transformed;
  };

  return {
    context,
    useContext,
    useQuery,
    useQueries,
    useMutation,
    useSubscription,
    useDehydratedState,
    useInfiniteQuery,
  };
}

export function createHooksInternalProxy<
  TRouter extends AnyRouter,
  TSSRContext = unknown,
  TFlags = null,
>(trpc: CreateReactQueryHooks<TRouter, TSSRContext>) {
  type CreateHooksInternalProxy = CreateTRPCReact<TRouter, TSSRContext, TFlags>;

  return createFlatProxy<CreateHooksInternalProxy>((key) => {
    if (key === 'useContext') {
      const context = trpc.useContext();
      // create a stable reference of the utils context
      return (createReactQueryUtilsProxy as any)(context);
    }

    if (trpc.hasOwnProperty(key)) {
      return (trpc as any)[key];
    }

    return createReactProxyDecoration(key, trpc);
  });
}

/**
 * Hack to infer the type of `createReactQueryHooks`
 * @link https://stackoverflow.com/a/59072991
 */
class GnClass<TRouter extends AnyRouter, TSSRContext = unknown> {
  fn() {
    return __createHooksInternal<TRouter, TSSRContext>();
  }
}

type returnTypeInferer<TType> = TType extends (
  a: Record<string, string>,
) => infer U
  ? U
  : never;
type fooType<TRouter extends AnyRouter, TSSRContext = unknown> = GnClass<
  TRouter,
  TSSRContext
>['fn'];

/**
 * Infer the type of a `createReactQueryHooks` function
 * @internal
 */
export type CreateReactQueryHooks<
  TRouter extends AnyRouter,
  TSSRContext = unknown,
> = returnTypeInferer<fooType<TRouter, TSSRContext>>;

export type CreateTRPCReact<
  TRouter extends AnyRouter,
  TSSRContext,
  TFlags,
> = ProtectedIntersection<
  CreateTRPCReactBase<TRouter, TSSRContext>,
  DecoratedProcedureRecord<TRouter['_def']['record'], TFlags>
>;

/**
 * @internal
 */
export type IntersectionError<TKey extends string> =
  `The property '${TKey}' in your router collides with a built-in method, rename this router or procedure on your backend.`;

/**
 * @internal
 */
export type ProtectedIntersection<TType, TWith> = keyof TType &
  keyof TWith extends never
  ? TType & TWith
  : IntersectionError<keyof TType & keyof TWith & string>;

export interface ProcedureRouterRecord {
  [key: string]: AnyProcedure | AnyRouter | ProcedureRouterRecord;
}

/**
 * @internal
 */
export type DecoratedProcedureRecord<
  TProcedures extends ProcedureRouterRecord,
  TFlags,
  TPath extends string = '',
> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? {
        /**
         * @deprecated - import `getQueryKey` from `@trpc/react-query` instead
         */
        getQueryKey: () => QueryKey;
      } & DecoratedProcedureRecord<
        TProcedures[TKey]['_def']['record'],
        TFlags,
        `${TPath}${TKey & string}.`
      >
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey], TFlags, `${TPath}${TKey & string}`>
    : never;
};

/**
 * @internal
 */
export type DecorateProcedure<
  TProcedure extends AnyProcedure,
  TFlags,
  TPath extends string,
> = TProcedure extends AnyQueryProcedure
  ? {
      getQueryKey: (input: inferProcedureInput<TProcedure>, type?: QueryType) => QueryKey;
      useQuery: ProcedureUseQuery<TProcedure, TPath>;
    } & 
      (inferProcedureInput<TProcedure> extends { cursor?: any }
      ? {
          useInfiniteQuery: <
            _TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
            TData = inferTransformedProcedureOutput<TProcedure>,
          >(
            input: Omit<inferProcedureInput<TProcedure>, 'cursor'>,
            opts?: CreateTRPCInfiniteQueryOptions<
              TPath,
              inferProcedureInput<TProcedure>,
              TData,
              TRPCClientErrorLike<TProcedure>
            >,
          ) => CreateTRPCInfiniteQueryResult<TData, TRPCClientErrorLike<TProcedure>>;
        } & 
          (TFlags extends 'ExperimentalSuspense'
          ? {
              useSuspenseInfiniteQuery: <
                _TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
                TData = inferTransformedProcedureOutput<TProcedure>,
              >(
                input: Omit<inferProcedureInput<TProcedure>, 'cursor'>,
                opts?: Omit<
                  CreateTRPCInfiniteQueryOptions<
                    TPath,
                    inferProcedureInput<TProcedure>,
                    TData,
                    TRPCClientErrorLike<TProcedure>
                  >,
                  'enabled' | 'suspense'
                >,
              ) => [
                InfiniteData<TData>,
                UseTRPCInfiniteQuerySuccessResult<
                  TData,
                  TRPCClientErrorLike<TProcedure>
                >,
              ];
            }
          : object)
      : object) &
      (TFlags extends 'ExperimentalSuspense'
        ? {
            useSuspenseQuery: <
              TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
              TData = inferTransformedProcedureOutput<TProcedure>,
            >(
              input: inferProcedureInput<TProcedure>,
              opts?: Omit<
                CreateTRPCQueryOptions<
                  TPath,
                  inferProcedureInput<TProcedure>,
                  TQueryFnData,
                  TData,
                  TRPCClientErrorLike<TProcedure>
                >,
                'enabled' | 'suspense'
              >,
            ) => [
              TData,
              CreateTRPCQuerySuccessResult<TData, TRPCClientErrorLike<TProcedure>>,
            ];
          }
        : object)
  : TProcedure extends AnyMutationProcedure
  ? {
      useMutation: <TContext = unknown>(
        opts?: UseTRPCMutationOptions<
          inferProcedureInput<TProcedure>,
          TRPCClientErrorLike<TProcedure>,
          inferTransformedProcedureOutput<TProcedure>,
          TContext
        >,
      ) => CreateTRPCMutationResult<
        inferTransformedProcedureOutput<TProcedure>,
        TRPCClientErrorLike<TProcedure>,
        inferProcedureInput<TProcedure>,
        TContext
      >;
    }
  : TProcedure extends AnySubscriptionProcedure
  ? {
      useSubscription: (
        input: inferProcedureInput<TProcedure>,
        opts?: CreateTRPCSubscriptionOptions<
          inferTransformedSubscriptionOutput<TProcedure>,
          TRPCClientErrorLike<TProcedure>
        >,
      ) => void;
    }
  : never;

export interface ProcedureUseQuery<
  TProcedure extends AnyProcedure,
  TPath extends string,
> {
  <
    TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
    TData = inferTransformedProcedureOutput<TProcedure>,
  >(
    input: inferProcedureInput<TProcedure>,
    opts: DefinedUseTRPCQueryOptions<
      TPath,
      inferProcedureInput<TProcedure>,
      TQueryFnData,
      TData,
      TRPCClientErrorLike<TProcedure>
    >,
  ): DefinedCreateTRPCQueryResult<TData, TRPCClientErrorLike<TProcedure>>;

  <
    TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
    TData = inferTransformedProcedureOutput<TProcedure>,
  >(
    input: inferProcedureInput<TProcedure>,
    opts?: CreateTRPCQueryOptions<
      TPath,
      inferProcedureInput<TProcedure>,
      TQueryFnData,
      TData,
      TRPCClientErrorLike<TProcedure>
    >,
  ): CreateTRPCQueryResult<TData, TRPCClientErrorLike<TProcedure>>;
}

export type CreateTRPCReactBase<TRouter extends AnyRouter, TSSRContext> = {
  useContext(): CreateReactUtilsProxy<TRouter, TSSRContext>;
  useQueries: TRPCUseQueries<TRouter>;
  useDehydratedState: CreateDehydratedState<TRouter>;
};

export type CreateReactUtilsProxy<
  TRouter extends AnyRouter,
  TSSRContext,
> = ProtectedIntersection<
  DecoratedProxyTRPCContextProps<TRouter, TSSRContext>,
  DecoratedProcedureUtilsRecord<TRouter>
>;

export type DecoratedProxyTRPCContextProps<
  TRouter extends AnyRouter,
  TSSRContext,
> = ProxyTRPCContextProps<TRouter, TSSRContext> & {
  client: CreateTRPCProxyClient<TRouter>;
};

export interface ProxyTRPCContextProps<TRouter extends AnyRouter, TSSRContext> {
  /**
   * The `TRPCClient`
   */
  client: TRPCClient<TRouter>;

  /**
   * The SSR context when server-side rendering
   * @default null
   */
  ssrContext?: TSSRContext | null;

  /**
   * State of SSR hydration.
   * - `false` if not using SSR.
   * - `prepass` when doing a prepass to fetch queries' data
   * - `mounting` before TRPCProvider has been rendered on the client
   * - `mounted` when the TRPCProvider has been rendered on the client
   * @default false
   */
  ssrState?: SSRState;
  /**
   * Abort loading query calls when unmounting a component - usually when navigating to a new page
   * @default false
   */
  abortOnUnmount?: boolean;
}

export type DecoratedProcedureUtilsRecord<TRouter extends AnyRouter> = {
  [TKey in keyof Filter<
    TRouter['_def']['record'],
    AnyRouter | AnyQueryProcedure
  >]: TRouter['_def']['record'][TKey] extends AnyRouter
    ? DecoratedProcedureUtilsRecord<TRouter['_def']['record'][TKey]> &
        DecorateRouter
    : // utils only apply to queries
      DecorateProcedureUtils<TRouter, TRouter['_def']['record'][TKey]>;
} & DecorateRouter; // Add functions that should be available at utils root

type DecorateRouter = {
  /**
   * Invalidate the full router
   * @link https://trpc.io/docs/v10/useContext#query-invalidation
   * @link https://react-query.tanstack.com/guides/query-invalidation
   */
  invalidate(
    input?: undefined,
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions,
  ): Promise<void>;
};

type DecorateProcedureUtils<
  TRouter extends AnyRouter,
  TProcedure extends AnyQueryProcedure,
> = {
  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientfetchquery
   */
  fetch(
    input: inferProcedureInput<TProcedure>,
    opts?: TRPCFetchQueryOptions<
      inferProcedureInput<TProcedure>,
      TRPCClientError<TRouter>,
      inferTransformedProcedureOutput<TProcedure>
    >,
  ): Promise<inferTransformedProcedureOutput<TProcedure>>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientfetchinfinitequery
   */
  fetchInfinite(
    input: inferProcedureInput<TProcedure>,
    opts?: TRPCFetchInfiniteQueryOptions<
      inferProcedureInput<TProcedure>,
      TRPCClientError<TRouter>,
      inferTransformedProcedureOutput<TProcedure>
    >,
  ): Promise<InfiniteData<inferTransformedProcedureOutput<TProcedure>>>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientprefetchquery
   */
  prefetch(
    input: inferProcedureInput<TProcedure>,
    opts?: TRPCFetchQueryOptions<
      inferProcedureInput<TProcedure>,
      TRPCClientError<TRouter>,
      inferTransformedProcedureOutput<TProcedure>
    >,
  ): Promise<void>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientprefetchinfinitequery
   */
  prefetchInfinite(
    input: inferProcedureInput<TProcedure>,
    opts?: TRPCFetchInfiniteQueryOptions<
      inferProcedureInput<TProcedure>,
      TRPCClientError<TRouter>,
      inferTransformedProcedureOutput<TProcedure>
    >,
  ): Promise<void>;

  /**
   * @link https://tanstack.com/query/v4/docs/react/reference/QueryClient#queryclientensurequerydata
   */
  ensureData(
    input: inferProcedureInput<TProcedure>,
    opts?: TRPCFetchQueryOptions<
      inferProcedureInput<TProcedure>,
      TRPCClientError<TRouter>,
      inferTransformedProcedureOutput<TProcedure>
    >,
  ): Promise<inferTransformedProcedureOutput<TProcedure>>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientinvalidatequeries
   */
  invalidate(
    input?: DeepPartial<inferProcedureInput<TProcedure>>,
    filters?: Omit<InvalidateQueryFilters, 'predicate'> & {
      predicate?: (
        query: Query<
          inferProcedureInput<TProcedure>,
          TRPCClientError<TRouter>,
          inferProcedureInput<TProcedure>,
          QueryKeyKnown<
            inferProcedureInput<TProcedure>,
            inferProcedureInput<TProcedure> extends { cursor?: any }
              ? 'infinite'
              : 'query'
          >
        >,
      ) => boolean;
    },
    options?: InvalidateOptions,
  ): Promise<void>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientrefetchqueries
   */
  refetch(
    input?: inferProcedureInput<TProcedure>,
    filters?: RefetchQueryFilters,
    options?: RefetchOptions,
  ): Promise<void>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientcancelqueries
   */
  cancel(
    input?: inferProcedureInput<TProcedure>,
    options?: CancelOptions,
  ): Promise<void>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientresetqueries
   */
  reset(
    input?: inferProcedureInput<TProcedure>,
    options?: ResetOptions,
  ): Promise<void>;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientsetquerydata
   */
  setData(
    /**
     * The input of the procedure
     */
    input: inferProcedureInput<TProcedure>,
    updater: Updater<
      inferTransformedProcedureOutput<TProcedure> | undefined,
      inferTransformedProcedureOutput<TProcedure> | undefined
    >,
    options?: SetDataOptions,
  ): void;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientsetquerydata
   */
  setInfiniteData(
    input: inferProcedureInput<TProcedure>,
    updater: Updater<
      InfiniteData<inferTransformedProcedureOutput<TProcedure>> | undefined,
      InfiniteData<inferTransformedProcedureOutput<TProcedure>> | undefined
    >,
    options?: SetDataOptions,
  ): void;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientgetquerydata
   */
  getData(
    input?: inferProcedureInput<TProcedure>,
  ): inferTransformedProcedureOutput<TProcedure> | undefined;

  /**
   * @link https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientgetquerydata
   */
  getInfiniteData(
    input?: inferProcedureInput<TProcedure>,
  ): InfiniteData<inferTransformedProcedureOutput<TProcedure>> | undefined;
};

export interface TRPCFetchQueryOptions<TInput, TError, TOutput>
  extends FetchQueryOptions<TInput, TError, TOutput>,
    TRPCRequestOptions {}

export interface TRPCFetchInfiniteQueryOptions<TInput, TError, TOutput>
  extends FetchInfiniteQueryOptions<TInput, TError, TOutput>,
    TRPCRequestOptions {}


/**
 * @internal
 */
export function createReactQueryUtilsProxy<
  TRouter extends AnyRouter,
  TSSRContext,
>(context: TRPCContextState<AnyRouter, unknown>) {
  type CreateReactUtilsProxyReturnType = CreateReactUtilsProxy<
    TRouter,
    TSSRContext
  >;

  return createFlatProxy<CreateReactUtilsProxyReturnType>((key) => {
    const contextName = key as typeof contextProps[number];
    if (contextName === 'client') {
      return createTRPCClientProxy(context.client);
    }
    if (contextProps.includes(contextName)) {
      return context[contextName];
    }

    return createRecursiveProxy(({ path, args }) => {
      const pathCopy = [key, ...path];
      const utilName = pathCopy.pop() as keyof AnyDecoratedProcedure;

      const fullPath = pathCopy.join('.');

      const getOpts = (name: typeof utilName) => {
        if (['setData', 'setInfiniteData'].includes(name)) {
          const [input, updater, ...rest] = args as Parameters<
            AnyDecoratedProcedure[typeof utilName]
          >;
          const queryKey = getQueryKeyInternal(fullPath, input);
          return {
            queryKey,
            updater,
            rest,
          };
        }

        const [input, ...rest] = args as Parameters<
          AnyDecoratedProcedure[typeof utilName]
        >;
        const queryKey = getQueryKeyInternal(fullPath, input);
        return {
          queryKey,
          rest,
        };
      };

      const { queryKey, rest, updater } = getOpts(utilName);

      const contextMap: Record<keyof AnyDecoratedProcedure, () => unknown> = {
        fetch: () => context.fetchQuery(queryKey, ...rest),
        fetchInfinite: () => context.fetchInfiniteQuery(queryKey, ...rest),
        prefetch: () => context.prefetchQuery(queryKey, ...rest),
        prefetchInfinite: () =>
          context.prefetchInfiniteQuery(queryKey, ...rest),
        ensureData: () => context.ensureQueryData(queryKey, ...rest),
        invalidate: () => context.invalidateQueries(queryKey, ...rest),
        reset: () => context.resetQueries(queryKey, ...rest),
        refetch: () => context.refetchQueries(queryKey, ...rest),
        cancel: () => context.cancelQuery(queryKey, ...rest),
        setData: () => context.setQueryData(queryKey, updater, ...rest),
        setInfiniteData: () =>
          context.setInfiniteQueryData(queryKey, updater, ...rest),
        getData: () => context.getQueryData(queryKey),
        getInfiniteData: () => context.getInfiniteQueryData(queryKey),
      };

      return contextMap[utilName]();
    });
  });
}

export const contextProps: (keyof ProxyTRPCContextProps<any, any>)[] = [
  'client',
  'ssrContext',
  'ssrState',
  'abortOnUnmount',
];

type AnyDecoratedProcedure = DecorateProcedureUtils<any, any>;

/**
 * Create proxy for decorating procedures
 * @internal
 */
export function createReactProxyDecoration<
  TRouter extends AnyRouter,
  TSSRContext = unknown,
>(name: string, hooks: CreateReactQueryHooks<TRouter, TSSRContext>) {
  return createRecursiveProxy((opts) => {
    const args = opts.args;

    const pathCopy = [name, ...opts.path];

    // The last arg is for instance `.useMutation` or `.useQuery()`
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastArg = pathCopy.pop()!;

    // The `path` ends up being something like `post.byId`
    const path = pathCopy.join('.');
    if (lastArg === 'useMutation') {
      return (hooks as any)[lastArg](path, ...args);
    }
    const [input, ...rest] = args;

    const queryKey = getQueryKeyInternal(path, input);

    // Expose queryKey helper
    if (lastArg === 'getQueryKey') {
      return getArrayQueryKey(queryKey, (rest[0] as any) ?? 'any');
    }

    if (lastArg === '_def') {
      return {
        path: pathCopy,
      };
    }

    if (lastArg.startsWith('useSuspense')) {
      const opts = rest[0] || {};
      const fn =
        lastArg === 'useSuspenseQuery' ? 'useQuery' : 'useInfiniteQuery';
      const result = (hooks as any)[fn](queryKey, {
        ...opts as any,
        suspense: true,
        enabled: true,
      });
      return [result.data, result];
    }
    return (hooks as any)[lastArg](queryKey, ...rest);
  });
}
