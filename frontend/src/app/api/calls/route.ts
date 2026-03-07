import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFilteredCalls } from '@/app/lib/seed-data';
import type { OutcomeType } from '@/app/lib/types';
import { OUTCOME_LABELS } from '@/app/lib/constants';

const VALID_OUTCOMES = Object.keys(OUTCOME_LABELS) as OutcomeType[];

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get('nakedmd_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const location = searchParams.get('location') || undefined;
  const outcomeParam = searchParams.get('outcome') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));

  // Validate location
  if (location && !['newport-beach', 'beverly-hills', 'scottsdale'].includes(location)) {
    return NextResponse.json(
      { error: 'Invalid location. Use "newport-beach", "beverly-hills", or "scottsdale".' },
      { status: 400 },
    );
  }

  // Validate outcome
  if (outcomeParam && !VALID_OUTCOMES.includes(outcomeParam as OutcomeType)) {
    return NextResponse.json(
      { error: `Invalid outcome. Valid values: ${VALID_OUTCOMES.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const result = getFilteredCalls({
      location,
      outcome: outcomeParam,
      search,
      page,
      limit,
    });

    const response = NextResponse.json(result, { status: 200 });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (err) {
    console.error('[calls] Error fetching calls:', err);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 },
    );
  }
}
