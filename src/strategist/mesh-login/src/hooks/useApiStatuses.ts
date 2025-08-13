// /hooks/useApiStatuses.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { logTelemetryEvent } from '../monitoring/telemetry';

export interface ApiStatus {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
  responseTimeMs: number;
}

async function fetchStatuses(): Promise<ApiStatus[]> {
  logTelemetryEvent('apiStatus:fetch_start');
  try {
    const { data } = await axios.get('/api/status');
    logTelemetryEvent('apiStatus:fetch_success', { count: data.length });
    return data;
  } catch (error) {
    logTelemetryEvent('apiStatus:fetch_failure', { error: error.message });
    throw error;
  }
}

export function useApiStatuses() {
  return useQuery<ApiStatus[], Error>(['api-statuses'], fetchStatuses, {
    refetchInterval: 15_000,  // poll every 15s
    retry: 2,                 // retry twice on failure
  });
}
