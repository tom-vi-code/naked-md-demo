import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFilteredDMs } from '@/app/lib/seed-data';
import type { DMChannel, DMSummary, OutcomeType } from '@/app/lib/types';
import { OUTCOME_LABELS, WS_BACKEND_URL } from '@/app/lib/constants';

const VALID_OUTCOMES = Object.keys(OUTCOME_LABELS) as OutcomeType[];

// ---------------------------------------------------------------------------
// Fetch real tracked DMs from the ws-backend /api/dm-events endpoint.
// Returns an empty array on any failure so seed data still renders.
// ---------------------------------------------------------------------------
async function fetchTrackedDMs(channel: DMChannel): Promise<DMSummary[]> {
  if (channel !== 'instagram') return [];

  try {
    const res = await fetch(`${WS_BACKEND_URL}/api/dm-events`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 10 }, // light cache so we don't hammer the backend
    });

    if (!res.ok) return [];

    const data = await res.json();
    const raw: Array<Record<string, unknown>> = Array.isArray(data?.dms) ? data.dms : [];

    return raw.map((dm) => {
      const contact = dm.contact as { firstName?: string; lastName?: string; handle?: string } | undefined;
      return {
        // Prefix id with "tracked-" so the frontend can distinguish live rows
        id: String(dm.id).startsWith('tracked-') ? String(dm.id) : `tracked-${dm.id}`,
        channel: 'instagram' as DMChannel,
        contact: {
          firstName: contact?.firstName ?? 'Unknown',
          lastName: contact?.lastName ?? '',
          handle: contact?.handle ?? '',
        },
        location: (dm.location as DMSummary['location']) ?? 'newport-beach',
        outcome: (dm.outcome as OutcomeType) ?? null,
        sentiment: typeof dm.sentiment === 'number' ? dm.sentiment : null,
        messageCount: typeof dm.messageCount === 'number' ? dm.messageCount : 0,
        lastMessageAt: String(dm.lastMessageAt ?? dm.startedAt ?? new Date().toISOString()),
        startedAt: String(dm.startedAt ?? new Date().toISOString()),
      } satisfies DMSummary;
    });
  } catch (err) {
    console.warn('[dms] Failed to fetch tracked DMs from ws-backend:', err);
    return [];
  }
}

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
    // Fetch seed (mock) data as before
    const result = getFilteredDMs({ channel, location, outcome: outcomeParam, search, page, limit });

    // For Instagram, also pull real tracked DMs from ws-backend and prepend them
    if (channel === 'instagram' && page === 1) {
      const tracked = await fetchTrackedDMs(channel);

      if (tracked.length > 0) {
        // Apply the same location / outcome / search filters to tracked DMs
        let filtered = tracked;
        if (location) filtered = filtered.filter((d) => d.location === location);
        if (outcomeParam) filtered = filtered.filter((d) => d.outcome === outcomeParam);
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (d) =>
              d.contact.firstName.toLowerCase().includes(q) ||
              d.contact.lastName.toLowerCase().includes(q) ||
              d.contact.handle.toLowerCase().includes(q),
          );
        }

        if (filtered.length > 0) {
          result.conversations = [...filtered, ...result.conversations];
          result.total += filtered.length;
          // Recalculate totalPages with the extra rows
          result.totalPages = Math.max(1, Math.ceil(result.total / limit));
        }
      }
    }

    const response = NextResponse.json(result, { status: 200 });
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    return response;
  } catch (err) {
    console.error('[dms] Error fetching DMs:', err);
    return NextResponse.json({ error: 'Failed to fetch DMs' }, { status: 500 });
  }
}
