// /hooks/useApiStatuses.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface ApiStatus {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  responseTimeMs: number;
}

async function fetchStatuses(): Promise<ApiStatus[]> {
  const { data } = await axios.get('/api/status');
  return data;
}

export function useApiStatuses() {
  return useQuery<ApiStatus[], Error>(['api-statuses'], fetchStatuses, {
    refetchInterval: 15_000,  // poll every 15s
    retry: 2,                 // retry twice on failure
  });
}
