import { NextResponse, type NextRequest } from 'next/server';
import { canUserPerform } from '@/lib/roles';
import { auth } from 'firebase-admin';

// Define the required action to view API status
const REQUIRED_ACTION = 'viewApiStatus';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new NextResponse('Unauthorized: Missing or invalid token', { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    const userRole = (decodedToken.role || 'Analyst') as any;

    if (!canUserPerform(userRole, REQUIRED_ACTION)) {
      return new NextResponse('Forbidden: Insufficient permissions', { status: 403 });
    }

    // In a real app, you'd fetch this from a database or a monitoring service.
    // We'll simulate some status fluctuation.
    const mockApiStatuses = [
      { id: 'auth-service', name: 'Authentication Service', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 52 },
      { id: 'payment-gateway', name: 'Payment Gateway', status: 'degraded', lastChecked: new Date().toISOString(), responseTimeMs: 258 },
      { id: 'user-database', name: 'User Database', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 34 },
      { id: 'notification-service', name: 'Notification Service', status: 'down', lastChecked: new Date().toISOString(), responseTimeMs: 5000 },
      { id: 'asset-pipeline', name: 'Asset Pipeline', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 120 },
      { id: 'search-api', name: 'Search API', status: 'healthy', lastChecked: new Date().toISOString(), responseTimeMs: 88 },
    ];

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
  } catch (error) {
    console.error('API Status Error:', error);
    return new NextResponse('Unauthorized: Invalid token', { status: 401 });
  }
}
