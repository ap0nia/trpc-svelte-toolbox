import { QueryClient } from '@tanstack/svelte-query';
import type { QueryClientConfig } from '@tanstack/svelte-query';

/**
 * @internal
 */
export type CreateTRPCSvelteQueryClientConfig =
  | {
      queryClient?: QueryClient;
      queryClientConfig?: never;
    }
  | {
      queryClientConfig?: QueryClientConfig;
      queryClient?: never;
    };

/**
 * @internal
 */
export const getQueryClient = (config: CreateTRPCSvelteQueryClientConfig) =>
  config.queryClient ?? new QueryClient(config.queryClientConfig);
