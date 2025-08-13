import { type NextRequest, NextResponse } from 'next/server';
import { canUserPerform } from '@/lib/roles';
import { auth } from 'firebase-admin';
import { revenueChartData, revenueMetricsData } from '@/lib/financial-data';

// Define the required action to view financial data
const REQUIRED_ACTION = 'viewFinancials';

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

    // In a real app, this would be fetched from a secure backend service
    const financialData = {
      revenueChartData,
      revenueMetricsData,
    };

    return NextResponse.json(financialData);

  } catch (error) {
    console.error('Financial Data Error:', error);
    return new NextResponse('Unauthorized: Invalid token', { status: 401 });
  }
}
