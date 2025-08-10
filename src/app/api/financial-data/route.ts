import { getServerSession } from 'next-auth';
import { canUserPerform } from '@/lib/roles';

export async function GET(req: Request) {
  const session = await getServerSession();
  // Assuming user role is available in session.user.role
  const role = session?.user?.role as any; // Cast to any for now, refine with proper type later

  if (!canUserPerform(role, 'viewFinancials')) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Import and return the actual sensitive data here from a secure source
  // For now, we'll use a placeholder or mock data
  const revenueMetricsData = { /* ... actual data ... */ };

  return Response.json({ revenueMetricsData });
}