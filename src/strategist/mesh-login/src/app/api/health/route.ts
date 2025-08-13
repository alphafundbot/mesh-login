import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return new Response('mesh-dashboard healthy', { status: 200 });
}