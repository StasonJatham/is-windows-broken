import type { ApiResponse } from '@/types/api';

const DEFAULT_PATCH_API_URL = 'https://api.is-windows-broken.com/api/v1/patch-status';

export const PATCH_API_URL =
  (import.meta.env.VITE_PATCH_API_URL as string | undefined)?.trim() || DEFAULT_PATCH_API_URL;

export async function fetchPatchHistory(signal?: AbortSignal): Promise<ApiResponse> {
  const response = await fetch(PATCH_API_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Patch API request failed with ${response.status}`);
  }

  const data = (await response.json()) as ApiResponse;
  if (!data?.ok || !Array.isArray(data.items)) {
    throw new Error('Patch API returned an invalid payload');
  }
  return data;
}
