import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDMDetail } from '@/app/lib/seed-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = await cookies();
  const session = cookieStore.get('nakedmd_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return NextResponse.json({ error: 'DM ID is required' }, { status: 400 });
  }

  try {
    const detail = getDMDetail(id);

    if (!detail) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const response = NextResponse.json(detail, { status: 200 });
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (err) {
    console.error(`[dms/${id}] Error fetching DM detail:`, err);
    return NextResponse.json({ error: 'Failed to fetch DM details' }, { status: 500 });
  }
}
