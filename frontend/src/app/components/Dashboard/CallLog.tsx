'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { CallSummary, CallsResponse, DMSummary, DMsResponse, OutcomeType } from '@/app/lib/types';
import { OUTCOME_LABELS, OUTCOME_COLORS, LOCATIONS } from '@/app/lib/constants';
import {
  formatDuration,
  formatRelativeTime,
  formatPhoneDisplay,
  getSentimentColor,
  cn,
} from '@/app/lib/utils';
import {
  formatLocationShort,
  getSummaryResolution,
  sortActionQueueCalls,
} from '@/app/lib/autopilot';

type ChannelTab = 'calls' | 'instagram' | 'facebook';

interface CallLogProps {
  onSelectCall: (id: string) => void;
  onSelectDM?: (id: string, channel: 'instagram' | 'facebook') => void;
  autopilot?: boolean;
  theme?: 'dark' | 'light';
}

const GREEN_OUTCOMES = new Set([
  'consultation-booked', 'treatment-sold', 'package-sold',
  'referral-generated', 'appointment-scheduled', 'win-back-success',
]);

const AMBER_OUTCOMES = new Set([
  'nurture', 'callback-requested', 'info-sent', 'info-provided',
]);

function outcomeBadgeClasses(outcome: OutcomeType, theme: 'dark' | 'light') {
  if (GREEN_OUTCOMES.has(outcome)) {
    return theme === 'dark'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
      : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-700';
  }

  if (AMBER_OUTCOMES.has(outcome)) {
    return theme === 'dark'
      ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
      : 'border-amber-400/20 bg-amber-400/10 text-amber-700';
  }

  return theme === 'dark'
    ? 'border-red-400/18 bg-red-400/10 text-red-200'
    : 'border-red-400/18 bg-red-400/10 text-red-700';
}

// --- Platform logos ---

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="1.8" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad)" />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2" />
    </svg>
  );
}

function ChannelIcon({ channel, className }: { channel: ChannelTab; className?: string }) {
  if (channel === 'instagram') return <InstagramLogo className={className} />;
  if (channel === 'facebook') return <FacebookLogo className={className} />;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
  theme,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  theme: 'dark' | 'light';
}) {
  return (
    <div className="relative min-w-[180px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-none border px-4 py-3 pr-11 text-sm focus:border-[#4C4C4B]',
          theme === 'dark'
            ? 'border-white/10 bg-[#1e1e1e] text-slate-200'
            : 'border-[#E0DEDB] bg-[#fdfcfa] text-[#4A3F33]',
        )}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8B7D6B]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function LoadingRows({
  columns = 7,
  theme,
}: {
  columns?: number;
  theme: 'dark' | 'light';
}) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr
          key={index}
          className={cn(
            'border-b',
            theme === 'dark' ? 'border-white/6' : 'border-[#E0DEDB]',
          )}
        >
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="skeleton h-5 rounded-none" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const CHANNEL_TABS: { id: ChannelTab; label: string; shortLabel: string }[] = [
  { id: 'calls', label: 'Voice Calls', shortLabel: 'Calls' },
  { id: 'instagram', label: 'Instagram DMs', shortLabel: 'Instagram' },
  { id: 'facebook', label: 'Facebook DMs', shortLabel: 'Facebook' },
];

export default function CallLog({
  onSelectCall,
  onSelectDM,
  autopilot = false,
  theme = 'dark',
}: CallLogProps) {
  const [channelTab, setChannelTab] = useState<ChannelTab>('calls');
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [dms, setDms] = useState<DMSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isDM = channelTab === 'instagram' || channelTab === 'facebook';

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [locationFilter, outcomeFilter, debouncedSearch, channelTab]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      try {
        if (isDM) {
          const params = new URLSearchParams({ page: String(page), limit: '20', channel: channelTab });
          if (locationFilter !== 'all') params.set('location', locationFilter);
          if (outcomeFilter !== 'all') params.set('outcome', outcomeFilter);
          if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

          const res = await fetch(`/api/dms?${params.toString()}`);
          if (!res.ok) throw new Error('Failed to fetch DMs');

          const data: DMsResponse = await res.json();
          setDms(data.conversations);
          setCalls([]);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        } else {
          const params = new URLSearchParams({ page: String(page), limit: '20' });
          if (locationFilter !== 'all') params.set('location', locationFilter);
          if (outcomeFilter !== 'all') params.set('outcome', outcomeFilter);
          if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

          const res = await fetch(`/api/calls?${params.toString()}`);
          if (!res.ok) throw new Error('Failed to fetch calls');

          const data: CallsResponse = await res.json();
          setCalls(data.calls);
          setDms([]);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      } catch {
        setCalls([]);
        setDms([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [page, locationFilter, outcomeFilter, debouncedSearch, channelTab, isDM]);

  const outcomeTypes = Object.keys(OUTCOME_LABELS) as OutcomeType[];
  const displayCalls = useMemo(
    () => (autopilot ? sortActionQueueCalls(calls) : calls),
    [autopilot, calls],
  );
  const needsYouCount = useMemo(
    () =>
      displayCalls.filter((call) => getSummaryResolution(call).status === 'needs-you').length,
    [displayCalls],
  );

  const channelLabel = channelTab === 'instagram' ? 'Instagram DM' : channelTab === 'facebook' ? 'Facebook DM' : 'Call';

  return (
    <div className="surface-card-dark overflow-hidden rounded-none">
      {/* Channel tabs */}
      <div className={cn(
        'flex items-center gap-0 border-b',
        theme === 'dark' ? 'border-white/8' : 'border-[#E0DEDB]',
      )}>
        {CHANNEL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setChannelTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3.5 sm:px-5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
              channelTab === tab.id
                ? theme === 'dark'
                  ? 'border-b-2 border-[#C4B59A] bg-white/[0.04] text-white'
                  : 'border-b-2 border-[#C4B59A] bg-[#f4f1ea]/40 text-gray-900'
                : theme === 'dark'
                  ? 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                  : 'text-[#8B7D6B] hover:bg-[#f4f1ea]/20 hover:text-[#4A3F33]',
            )}
          >
            <ChannelIcon channel={tab.id} className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      <div
        className={cn(
          'border-b px-5 py-5 sm:px-6',
          theme === 'dark' ? 'border-white/8' : 'border-[#E0DEDB]',
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
              {isDM
                ? `${channelTab === 'instagram' ? 'Instagram' : 'Facebook'} Direct Message Log`
                : autopilot ? 'Action Queue' : 'Outbound Call Log'}
            </div>
            <p className="dashboard-copy mt-2 text-sm leading-6">
              {isDM
                ? `Vi agent outbound DMs to prospects who submitted lead forms through ${channelTab === 'instagram' ? 'Instagram' : 'Facebook'} ads.`
                : autopilot
                  ? 'Only the conversations that still need a person, plus a clear receipt of what NakedMD AI already handled.'
                  : 'All outbound Vi agent calls to leads, with full transcripts, AI classification, and follow-up status.'}
            </p>
          </div>

          <div className="dashboard-muted text-sm">
            {isDM
              ? `${total} conversation${total !== 1 ? 's' : ''}`
              : autopilot
                ? `${needsYouCount} need${needsYouCount === 1 ? 's' : ''} you`
                : `${total} total call${total !== 1 ? 's' : ''}`}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
          <FilterSelect value={locationFilter} onChange={setLocationFilter} theme={theme}>
            <option value="all">All Locations</option>
            {Object.values(LOCATIONS).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={outcomeFilter} onChange={setOutcomeFilter} theme={theme}>
            <option value="all">All Outcomes</option>
            {outcomeTypes.map((ot) => (
              <option key={ot} value={ot}>
                {OUTCOME_LABELS[ot]}
              </option>
            ))}
          </FilterSelect>

          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8B7D6B]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isDM ? 'Search name or handle...' : 'Search name or phone...'}
              className={cn(
                'w-full rounded-none border px-11 py-3 text-sm focus:border-[#4C4C4B]',
                theme === 'dark'
                  ? 'border-white/10 bg-[#1e1e1e] text-slate-200 placeholder:text-slate-500'
                  : 'border-[#E0DEDB] bg-[#fdfcfa] text-[#4A3F33] placeholder:text-[#A69A80]',
              )}
            />
          </div>
        </div>
      </div>

      {/* ===================== DM VIEW ===================== */}
      {isDM ? (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden">
            {loading ? (
              <div className="space-y-3 px-4 py-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'rounded-none border p-4',
                      theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-[#E0DEDB] bg-[#f4f1ea]/30',
                    )}
                  >
                    <div className="skeleton h-5 w-32 rounded-none" />
                    <div className="skeleton mt-3 h-4 w-24 rounded-none" />
                  </div>
                ))}
              </div>
            ) : dms.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div className="mx-auto max-w-sm">
                  <div className="dashboard-heading text-lg font-semibold">No {channelLabel} conversations found</div>
                  <p className="dashboard-copy mt-2 text-sm leading-6">Try adjusting your filters or search term.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 px-4 py-4">
                {dms.map((dm) => (
                  <div
                    key={dm.id}
                    onClick={() => onSelectDM?.(dm.id, dm.channel)}
                    className={cn(
                      'cursor-pointer rounded-none border p-4',
                      theme === 'dark'
                        ? 'border-white/8 bg-white/[0.03] active:bg-white/[0.06]'
                        : 'border-[#E0DEDB] bg-[#f4f1ea]/30 active:bg-[#f4f1ea]/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <ChannelIcon channel={dm.channel === 'instagram' ? 'instagram' : 'facebook'} className="h-5 w-5 shrink-0" />
                        <div>
                          <div className="dashboard-heading font-semibold">
                            {dm.contact.firstName} {dm.contact.lastName}
                          </div>
                          <div className="dashboard-muted mt-0.5 text-xs">{dm.contact.handle}</div>
                        </div>
                      </div>
                      {dm.outcome && (
                        <span className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-none border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                          outcomeBadgeClasses(dm.outcome, theme),
                        )}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: OUTCOME_COLORS[dm.outcome] }} />
                          {OUTCOME_LABELS[dm.outcome]}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="dashboard-muted flex items-center gap-3 text-xs">
                        <span>{dm.messageCount} msgs</span>
                        <span>{formatRelativeTime(dm.lastMessageAt)}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectDM?.(dm.id, dm.channel); }}
                        className="rounded-none border border-[#C4B59A]/22 bg-[#C4B59A]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] hover:border-[#C4B59A]/45 hover:bg-[#C4B59A]/16"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden overflow-x-auto dashboard-scroll sm:block">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className={cn(
                  'dashboard-label border-b text-left text-[11px] uppercase tracking-[0.18em]',
                  theme === 'dark' ? 'border-white/8' : 'border-[#E0DEDB]',
                )}>
                  <th className="px-4 py-3 font-semibold">Platform</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Outcome</th>
                  <th className="px-4 py-3 font-semibold">Messages</th>
                  <th className="px-4 py-3 font-semibold">Sentiment</th>
                  <th className="px-4 py-3 font-semibold">Last Active</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <LoadingRows columns={8} theme={theme} />
                ) : dms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="dashboard-heading text-lg font-semibold">No {channelLabel} conversations found</div>
                        <p className="dashboard-copy mt-2 text-sm leading-6">Try adjusting your filters or search term.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dms.map((dm) => (
                    <tr
                      key={dm.id}
                      onClick={() => onSelectDM?.(dm.id, dm.channel)}
                      className={cn(
                        'cursor-pointer border-b bg-transparent',
                        theme === 'dark'
                          ? 'border-white/6 hover:bg-white/[0.03]'
                          : 'border-[#E0DEDB] hover:bg-[#f4f1ea]/20',
                      )}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={dm.channel === 'instagram' ? 'instagram' : 'facebook'} className="h-5 w-5" />
                          <span className={cn('text-xs font-semibold uppercase tracking-[0.1em]', theme === 'dark' ? 'text-slate-300' : 'text-[#4A3F33]')}>
                            {dm.channel === 'instagram' ? 'IG' : 'FB'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="dashboard-heading font-semibold">
                          {dm.contact.firstName} {dm.contact.lastName}
                        </div>
                        <div className="dashboard-muted mt-1 text-xs">{dm.contact.handle}</div>
                      </td>
                      <td className="dashboard-copy px-4 py-4">
                        {LOCATIONS[dm.location]?.name.replace('NakedMD ', '') ?? dm.location}
                      </td>
                      <td className="px-4 py-4">
                        {dm.outcome ? (
                          <span className={cn(
                            'inline-flex items-center gap-2 rounded-none border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]',
                            outcomeBadgeClasses(dm.outcome, theme),
                          )}>
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: OUTCOME_COLORS[dm.outcome] }} />
                            {OUTCOME_LABELS[dm.outcome]}
                          </span>
                        ) : (
                          <span className={cn('text-xs uppercase tracking-[0.14em]', theme === 'dark' ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="dashboard-copy px-4 py-4 font-mono">{dm.messageCount}</td>
                      <td className="px-4 py-4">
                        {dm.sentiment !== null ? (
                          <span
                            className="rounded-none px-2.5 py-1 text-xs font-semibold"
                            style={{
                              color: getSentimentColor(dm.sentiment),
                              backgroundColor: `${getSentimentColor(dm.sentiment)}18`,
                            }}
                          >
                            {dm.sentiment}
                          </span>
                        ) : (
                          <span className={cn('text-xs uppercase tracking-[0.14em]', theme === 'dark' ? 'text-slate-400' : 'text-[#8B7D6B]')}>n/a</span>
                        )}
                      </td>
                      <td className="dashboard-copy px-4 py-4">{formatRelativeTime(dm.lastMessageAt)}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectDM?.(dm.id, dm.channel); }}
                          className="rounded-none border border-[#C4B59A]/22 bg-[#C4B59A]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] hover:border-[#C4B59A]/45 hover:bg-[#C4B59A]/16"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ===================== CALLS VIEW (original) ===================== */
        <>
          {/* Mobile card view (< sm) */}
          <div className="sm:hidden">
            {loading ? (
              <div className="space-y-3 px-4 py-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'rounded-none border p-4',
                      theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-[#E0DEDB] bg-[#f4f1ea]/30',
                    )}
                  >
                    <div className="skeleton h-5 w-32 rounded-none" />
                    <div className="skeleton mt-3 h-4 w-24 rounded-none" />
                    <div className="skeleton mt-3 h-4 w-20 rounded-none" />
                  </div>
                ))}
              </div>
            ) : displayCalls.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div className="mx-auto max-w-sm">
                  <div className="dashboard-heading text-lg font-semibold">
                    {autopilot ? 'Action queue is clear' : 'No calls matched this view'}
                  </div>
                  <p className="dashboard-copy mt-2 text-sm leading-6">
                    {autopilot
                      ? 'NakedMD AI does not have any conversations waiting for review in this view.'
                      : 'Try clearing a filter, switching the time period, or using a broader search term.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 px-4 py-4">
                {displayCalls.map((call) => {
                  const resolution = getSummaryResolution(call);
                  return (
                    <div
                      key={call.id}
                      onClick={() => onSelectCall(call.id)}
                      className={cn(
                        'cursor-pointer rounded-none border p-4',
                        theme === 'dark'
                          ? 'border-white/8 bg-white/[0.03] active:bg-white/[0.06]'
                          : 'border-[#E0DEDB] bg-[#f4f1ea]/30 active:bg-[#f4f1ea]/40',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="dashboard-heading font-semibold">
                            {call.contact.firstName} {call.contact.lastName}
                          </div>
                          <div className="dashboard-muted mt-1 text-xs">
                            {formatPhoneDisplay(call.contact.phone)}
                          </div>
                        </div>
                        {call.outcome ? (
                          <span
                            className={cn(
                              'inline-flex shrink-0 items-center gap-1.5 rounded-none border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                              autopilot
                                ? resolution.status === 'needs-you'
                                  ? theme === 'dark'
                                    ? 'border-[rgba(251,113,133,0.2)] bg-[rgba(251,113,133,0.1)] text-[#ffb4c3]'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                                  : theme === 'dark'
                                    ? 'border-emerald-400/18 bg-emerald-400/10 text-emerald-200'
                                    : 'border-emerald-400/18 bg-emerald-400/10 text-emerald-700'
                                : outcomeBadgeClasses(call.outcome, theme),
                            )}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: OUTCOME_COLORS[call.outcome] }}
                            />
                            {autopilot ? resolution.statusLabel : OUTCOME_LABELS[call.outcome]}
                          </span>
                        ) : (
                          <span className={cn('text-[10px] uppercase tracking-[0.12em]', theme === 'dark' ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="dashboard-muted flex items-center gap-3 text-xs">
                          <span>{formatDuration(call.duration)}</span>
                          <span>{formatRelativeTime(call.startedAt)}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCall(call.id);
                          }}
                          className="rounded-none border border-[#C4B59A]/22 bg-[#C4B59A]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] hover:border-[#C4B59A]/45 hover:bg-[#C4B59A]/16"
                        >
                          {autopilot ? 'Open' : 'View'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop table view (>= sm) */}
          <div className="hidden overflow-x-auto dashboard-scroll sm:block">
            <table className={cn('w-full text-sm', autopilot ? 'min-w-[980px]' : 'min-w-[860px]')}>
              <thead>
                <tr
                  className={cn(
                    'dashboard-label border-b text-left text-[11px] uppercase tracking-[0.18em]',
                    theme === 'dark' ? 'border-white/8' : 'border-[#E0DEDB]',
                  )}
                >
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  {autopilot ? (
                    <>
                      <th className="px-4 py-3 font-semibold">What Happened</th>
                      <th className="px-4 py-3 font-semibold">NakedMD AI Did</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">When</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Outcome</th>
                      <th className="px-4 py-3 font-semibold">Duration</th>
                      <th className="px-4 py-3 font-semibold">Sentiment</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <LoadingRows columns={autopilot ? 6 : 7} theme={theme} />
                ) : displayCalls.length === 0 ? (
                  <tr>
                    <td colSpan={autopilot ? 6 : 7} className="px-4 py-16 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="dashboard-heading text-lg font-semibold">
                          {autopilot ? 'Action queue is clear' : 'No calls matched this view'}
                        </div>
                        <p className="dashboard-copy mt-2 text-sm leading-6">
                          {autopilot
                            ? 'NakedMD AI does not have any conversations waiting for review in this view.'
                            : 'Try clearing a filter, switching the time period, or using a broader search term.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayCalls.map((call) => {
                    const resolution = getSummaryResolution(call);

                    return (
                    <tr
                      key={call.id}
                      onClick={() => onSelectCall(call.id)}
                      className={cn(
                        'cursor-pointer border-b bg-transparent',
                        theme === 'dark'
                          ? 'border-white/6 hover:bg-white/[0.03]'
                          : 'border-[#E0DEDB] hover:bg-[#f4f1ea]/20',
                      )}
                    >
                      <td className="px-4 py-4">
                        <div className="dashboard-heading font-semibold">
                          {call.contact.firstName} {call.contact.lastName}
                        </div>
                        <div className="dashboard-muted mt-1 text-xs">
                          {formatPhoneDisplay(call.contact.phone)}
                        </div>
                      </td>
                      {autopilot ? (
                        <>
                          <td className="px-4 py-4">
                            <div className="dashboard-heading text-sm font-semibold">
                              {call.outcome ? OUTCOME_LABELS[call.outcome] : 'Pending'}
                            </div>
                            <div className="dashboard-copy mt-1 text-sm leading-6">
                              {resolution.whatHappened}
                            </div>
                          </td>
                          <td className="dashboard-copy px-4 py-4">
                            <div className="text-sm leading-6">{resolution.aiDid}</div>
                            <div className="dashboard-muted mt-1 text-xs">
                              {formatLocationShort(call.location)} · {formatDuration(call.duration)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-none border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]',
                                resolution.status === 'needs-you'
                                  ? theme === 'dark'
                                    ? 'border-[rgba(251,113,133,0.2)] bg-[rgba(251,113,133,0.1)] text-[#ffb4c3]'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                                  : theme === 'dark'
                                    ? 'border-emerald-400/18 bg-emerald-400/10 text-emerald-200'
                                    : 'border-emerald-400/18 bg-emerald-400/10 text-emerald-700',
                              )}
                            >
                              {resolution.statusLabel}
                            </span>
                          </td>
                          <td className="dashboard-copy px-4 py-4">{formatRelativeTime(call.startedAt)}</td>
                        </>
                      ) : (
                        <>
                          <td className="dashboard-copy px-4 py-4">
                            {LOCATIONS[call.location]?.name.replace('NakedMD ', '') ?? call.location}
                          </td>
                          <td className="px-4 py-4">
                            {call.outcome ? (
                              <span
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-none border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]',
                                  outcomeBadgeClasses(call.outcome, theme),
                                )}
                              >
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: OUTCOME_COLORS[call.outcome] }}
                                />
                                {OUTCOME_LABELS[call.outcome]}
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  'text-xs uppercase tracking-[0.14em]',
                                  theme === 'dark' ? 'text-slate-400' : 'text-[#8B7D6B]',
                                )}
                              >
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="dashboard-copy px-4 py-4 font-mono">
                            {formatDuration(call.duration)}
                          </td>
                          <td className="px-4 py-4">
                            {call.sentiment !== null ? (
                              <span
                                className="rounded-none px-2.5 py-1 text-xs font-semibold"
                                style={{
                                  color: getSentimentColor(call.sentiment),
                                  backgroundColor: `${getSentimentColor(call.sentiment)}18`,
                                }}
                              >
                                {call.sentiment}
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  'text-xs uppercase tracking-[0.14em]',
                                  theme === 'dark' ? 'text-slate-400' : 'text-[#8B7D6B]',
                                )}
                              >
                                n/a
                              </span>
                            )}
                          </td>
                          <td className="dashboard-copy px-4 py-4">{formatRelativeTime(call.startedAt)}</td>
                        </>
                      )}
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCall(call.id);
                          }}
                          className="rounded-none border border-[#C4B59A]/22 bg-[#C4B59A]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] hover:border-[#C4B59A]/45 hover:bg-[#C4B59A]/16"
                        >
                          {autopilot ? 'Open' : 'View'}
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div
          className={cn(
            'flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6',
            theme === 'dark' ? 'border-white/8' : 'border-[#E0DEDB]',
          )}
        >
          <div className="dashboard-label text-xs uppercase tracking-[0.16em]">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className={cn(
                'rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                page === 1
                  ? theme === 'dark'
                    ? 'cursor-not-allowed bg-white/5 text-slate-600'
                    : 'cursor-not-allowed bg-[#f4f1ea]/40 text-[#A69A80]'
                  : theme === 'dark'
                    ? 'bg-white/7 text-slate-200 hover:bg-white/12'
                    : 'bg-[#f4f1ea]/40 text-[#4A3F33] hover:bg-[#f4f1ea]/60',
              )}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className={cn(
                'rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                page === totalPages
                  ? theme === 'dark'
                    ? 'cursor-not-allowed bg-white/5 text-slate-600'
                    : 'cursor-not-allowed bg-[#f4f1ea]/40 text-[#A69A80]'
                  : theme === 'dark'
                    ? 'bg-white/7 text-slate-200 hover:bg-white/12'
                    : 'bg-[#f4f1ea]/40 text-[#4A3F33] hover:bg-[#f4f1ea]/60',
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
