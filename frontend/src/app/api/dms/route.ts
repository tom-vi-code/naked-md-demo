import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFilteredDMs } from '@/app/lib/seed-data';
import type { DMChannel, OutcomeType } from '@/app/lib/types';
import { OUTCOME_LABELS } from '@/app/lib/constants';

const VALID_OUTCOMES = Object.keys(OUTCOME_LABELS) as OutcomeType[];

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('nakedmd_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const channel = (searchParams.get('channel') || undefined) as DMChannel | undefined;
  const location = searchParams.get('location') || undefined;
  const outcomeParam = searchParams.get('outcome') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));

  if (channel && !['instagram', 'facebook'].includes(channel)) {
    return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
  }

  if (location && !['newport-beach', 'beverly-hills', 'scottsdale'].includes(location)) {
    return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
  }

  if (outcomeParam && !VALID_OUTCOMES.includes(outcomeParam as OutcomeType)) {
    return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 });
  }

  try {
    const result = getFilteredDMs({ channel, location, outcome: outcomeParam, search, page, limit });
    const response = NextResponse.json(result, { status: 200 });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (err) {
    console.error('[dms] Error fetching DMs:', err);
    return NextResponse.json({ error: 'Failed to fetch DMs' }, { status: 500 });
  }
}
