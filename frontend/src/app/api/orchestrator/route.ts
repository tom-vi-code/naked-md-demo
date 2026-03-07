import { NextResponse } from 'next/server';
import { getOrchestratorData } from '@/app/lib/orchestration-data';

export async function GET() {
  const data = getOrchestratorData();
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
  return response;
}
