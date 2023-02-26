import type {
  DefinedQueryObserverResult,
  DehydratedState,
  InfiniteQueryObserverSuccessResult,
  InitialDataFunction,
  QueryObserverSuccessResult,
  QueryOptions,
  CreateQueryOptions,
  CreateQueryResult,
  CreateMutationOptions,
  CreateMutationResult,
  CreateInfiniteQueryOptions,
  CreateInfiniteQueryResult,
} from '@tanstack/svelte-query';
import type {
  CreateTRPCClientOptions,
  TRPCClient,
  TRPCRequestOptions,
} from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import type { TRPCContextProps } from '../../internals/context';
import type { TRPCHookResult } from '../../internals/useHookResult';

export type OutputWithCursor<TData, TCursor = any> = {
  cursor: TCursor | null;
  data: TData;
};

export interface TRPCReactRequestOptions
  // For RQ, we use their internal AbortSignals instead of letting the user pass their own
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

export interface TRPCUseQueryBaseOptions {
  /**
   * tRPC-related options
   */
  trpc?: TRPCReactRequestOptions;
}

export interface UseTRPCQueryOptions<TPath, TInput, TOutput, TData, TError>
  extends CreateQueryOptions<TOutput, TError, TData, [TPath, TInput]>,
    TRPCUseQueryBaseOptions {}

/** @internal **/
export interface DefinedUseTRPCQueryOptions<
  TPath,
  TInput,
  TOutput,
  TData,
  TError,
> extends UseTRPCQueryOptions<TPath, TInput, TOutput, TData, TError> {
  initialData: TOutput | InitialDataFunction<TOutput>;
}

export interface TRPCQueryOptions<TPath, TInput, TData, TError>
  extends QueryOptions<TData, TError, TData, [TPath, TInput]>,
    TRPCUseQueryBaseOptions {}

export interface UseTRPCInfiniteQueryOptions<TPath, TInput, TOutput, TError>
  extends CreateInfiniteQueryOptions<
      TOutput,
      TError,
      TOutput,
      TOutput,
      [TPath, TInput]
    >,
    TRPCUseQueryBaseOptions {}

export interface UseTRPCMutationOptions<
  TInput,
  TError,
  TOutput,
  TContext = unknown,
> extends CreateMutationOptions<TOutput, TError, TInput, TContext>,
    TRPCUseQueryBaseOptions {}

export interface UseTRPCSubscriptionOptions<TOutput, TError> {
  enabled?: boolean;
  onStarted?: () => void;
  onData: (data: TOutput) => void;
  onError?: (err: TError) => void;
}
export interface TRPCProviderProps<TRouter extends AnyRouter, TSSRContext>
  extends TRPCContextProps<TRouter, TSSRContext> {
}

export type TRPCProvider<TRouter extends AnyRouter, TSSRContext> = (
  props: TRPCProviderProps<TRouter, TSSRContext>,
) => any

export type UseDehydratedState<TRouter extends AnyRouter> = (
  client: TRPCClient<TRouter>,
  trpcState: DehydratedState | undefined,
) => DehydratedState | undefined;

export type CreateClient<TRouter extends AnyRouter> = (
  opts: CreateTRPCClientOptions<TRouter>,
) => TRPCClient<TRouter>;

/**
 * @internal
 */
export type UseTRPCQueryResult<TData, TError> = CreateQueryResult<TData, TError> &
  TRPCHookResult;

/**
 * @internal
 */
export type DefinedUseTRPCQueryResult<TData, TError> = DefinedQueryObserverResult<
  TData,
  TError
> &
  TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCQuerySuccessResult<TData, TError> =
  QueryObserverSuccessResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCInfiniteQueryResult<TData, TError> = CreateInfiniteQueryResult<
  TData,
  TError
> &
  TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCInfiniteQuerySuccessResult<TData, TError> =
  InfiniteQueryObserverSuccessResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCMutationResult<TData, TError, TVariables, TContext> =
  CreateMutationResult<TData, TError, TVariables, TContext> & TRPCHookResult;
