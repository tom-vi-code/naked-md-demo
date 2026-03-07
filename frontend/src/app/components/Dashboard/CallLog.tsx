'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { CallSummary, CallsResponse, OutcomeType } from '@/app/lib/types';
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

interface CallLogProps {
  onSelectCall: (id: string) => void;
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
          'w-full appearance-none rounded-2xl border px-4 py-3 pr-11 text-sm focus:border-[#1F8A84]',
          theme === 'dark'
            ? 'border-white/10 bg-[#262626] text-slate-200'
            : 'border-slate-200 bg-white text-slate-700',
        )}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
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
            theme === 'dark' ? 'border-white/6' : 'border-slate-200',
          )}
        >
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="skeleton h-5 rounded-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function CallLog({
  onSelectCall,
  autopilot = false,
  theme = 'dark',
}: CallLogProps) {
  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [locationFilter, outcomeFilter, debouncedSearch]);

  useEffect(() => {
    async function fetchCalls() {
      setLoading(true);

      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (locationFilter !== 'all') params.set('location', locationFilter);
        if (outcomeFilter !== 'all') params.set('outcome', outcomeFilter);
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const res = await fetch(`/api/calls?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch calls');

        const data: CallsResponse = await res.json();
        setCalls(data.calls);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        setCalls([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    void fetchCalls();
  }, [page, locationFilter, outcomeFilter, debouncedSearch]);

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

  return (
    <div className="surface-card-dark overflow-hidden rounded-[28px]">
      <div
        className={cn(
          'border-b px-5 py-5 sm:px-6',
          theme === 'dark' ? 'border-white/8' : 'border-slate-200',
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
              {autopilot ? 'Action Queue' : 'Call Log'}
            </div>
            <p className="dashboard-copy mt-2 text-sm leading-6">
              {autopilot
                ? 'Only the conversations that still need a person, plus a clear receipt of what NakedMD AI already handled.'
                : 'All Vi conversations with full transcripts, AI classification, and follow-up status.'}
            </p>
          </div>

          <div className="dashboard-muted text-sm">
            {autopilot
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
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or phone..."
              className={cn(
                'w-full rounded-2xl border px-11 py-3 text-sm focus:border-[#1F8A84]',
                theme === 'dark'
                  ? 'border-white/10 bg-[#262626] text-slate-200 placeholder:text-slate-500'
                  : 'border-slate-200 bg-white text-slate-700 placeholder:text-slate-400',
              )}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto dashboard-scroll">
        <table className={cn('w-full text-sm', autopilot ? 'min-w-[980px]' : 'min-w-[860px]')}>
          <thead>
            <tr
              className={cn(
                'dashboard-label border-b text-left text-[11px] uppercase tracking-[0.18em]',
                theme === 'dark' ? 'border-white/8' : 'border-slate-200',
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
                      : 'border-slate-200 hover:bg-slate-50',
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
                            'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]',
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
                              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]',
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
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
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
                            className="rounded-full px-2.5 py-1 text-xs font-semibold"
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
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
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
                      className="rounded-full border border-[#1F8A84]/22 bg-[#1F8A84]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#59B1AB] hover:border-[#1F8A84]/45 hover:bg-[#1F8A84]/16"
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

      {totalPages > 1 && (
        <div
          className={cn(
            'flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6',
            theme === 'dark' ? 'border-white/8' : 'border-slate-200',
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
                'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                page === 1
                  ? theme === 'dark'
                    ? 'cursor-not-allowed bg-white/5 text-slate-600'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : theme === 'dark'
                    ? 'bg-white/7 text-slate-200 hover:bg-white/12'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              )}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                page === totalPages
                  ? theme === 'dark'
                    ? 'cursor-not-allowed bg-white/5 text-slate-600'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : theme === 'dark'
                    ? 'bg-white/7 text-slate-200 hover:bg-white/12'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
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
