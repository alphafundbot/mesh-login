// /app/api/status/route.ts
import { NextResponse } from 'next/server';

const mockApiStatuses = [
  { id: 'auth-service', name: 'Authentication Service', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 52 },
  { id: 'payment-gateway', name: 'Payment Gateway', status: 'degraded', lastChecked: new Date().toISOString(), responseTimeMs: 258 },
  { id: 'user-database', name: 'User Database', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 34 },
  { id: 'notification-service', name: 'Notification Service', status: 'down', lastChecked: new Date().toISOString(), responseTimeMs: 5000 },
  { id: 'asset-pipeline', name: 'Asset Pipeline', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 120 },
  { id: 'search-api', name: 'Search API', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 88 },
];

export async function GET() {
  // In a real app, you'd fetch this from a database or a monitoring service.
  // We'll simulate some status fluctuation.
  const updatedStatuses = mockApiStatuses.map(api => {
    const random = Math.random();
    if (api.status !== 'down' && random < 0.1) {
      return { ...api, status: 'degraded', responseTimeMs: api.responseTimeMs + 150 };
    }
    if (api.status === 'degraded' && random < 0.3) {
      return { ...api, status: 'healthy', responseTimeMs: Math.max(50, api.responseTimeMs - 150) };
    }
    return { ...api, lastChecked: new Date().toISOString() };
  });

  return NextResponse.json(updatedStatuses);
}
