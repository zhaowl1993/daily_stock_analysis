import apiClient from './index';
import { toCamelCase } from './utils';
import type { ProviderInfo } from '../types/analysis';

/**
 * Providers API – fetches the list of configured AI providers
 * from the backend so the UI can dynamically render model options.
 */
export const providersApi = {
  /**
   * List all configured AI providers.
   * Returns only public info (key, display name, type, model). No secrets.
   */
  list: async (): Promise<ProviderInfo[]> => {
    const response = await apiClient.get<Record<string, unknown>>('/api/v1/providers');
    const data = toCamelCase<{ providers: ProviderInfo[] }>(response.data);
    return data.providers ?? [];
  },
};

