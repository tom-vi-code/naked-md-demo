'use client';

import { useEffect, useState } from 'react';
import { CallDetailResponse } from '@/app/lib/types';
import { OUTCOME_LABELS, OUTCOME_COLORS, LOCATIONS } from '@/app/lib/constants';
import {
  formatDuration,
  formatPhoneDisplay,
  getSentimentColor,
  getSentimentLabel,
  cn,
} from '@/app/lib/utils';
import { getDetailResolution } from '@/app/lib/autopilot';

interface CallDetailProps {
  callId: string;
  onClose: () => void;
  theme?: 'dark' | 'light';
  autopilot?: boolean;
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[22px] border border-white/8 bg-white/4 p-4">
            <div className="skeleton h-4 w-20 rounded-full" />
            <div className="skeleton mt-3 h-6 rounded-full" />
          </div>
        ))}
      </div>
      <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton mt-4 h-20 rounded-[20px]" />
      </div>
      <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
        <div className="skeleton h-4 w-28 rounded-full" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-16 rounded-[18px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CallDetail({
  callId,
  onClose,
  theme = 'dark',
  autopilot = false,
}: CallDetailProps) {
  const dark = theme === 'dark';
  const [call, setCall] = useState<CallDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/calls/${callId}`);
        if (!res.ok) throw new Error('Failed to load call detail');
        const data: CallDetailResponse = await res.json();
        if (!cancelled) setCall(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [callId]);

  function formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  }

  const resolution = call ? getDetailResolution(call) : null;

  return (
    <>
      <button
        type="button"
        aria-label="Close call detail"
        className={cn('fixed inset-0 z-40 backdrop-blur-sm', dark ? 'bg-black/70' : 'bg-black/30')}
        onClick={onClose}
      />

      <aside className={cn(
        'fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-hidden border-l animate-slide-in-right',
        dark
          ? 'border-white/10 bg-[#090a10] text-white shadow-[0_0_60px_rgba(0,0,0,0.45)]'
          : 'border-slate-200 bg-white text-gray-900 shadow-[0_0_60px_rgba(0,0,0,0.12)]',
      )}>
        <div className="flex h-full flex-col">
          <div className={cn(
            'border-b px-5 py-5 sm:px-6',
            dark ? 'border-white/8 bg-[linear-gradient(180deg,rgba(197,165,114,0.08),rgba(255,255,255,0))]' : 'border-slate-200 bg-gradient-to-b from-amber-50/60 to-transparent',
          )}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={cn('text-xs font-semibold uppercase tracking-[0.22em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                  Call Detail
                </div>
                {call ? (
                  <>
                    <h2 className={cn('mt-2 text-2xl font-black tracking-tight', dark ? 'text-white' : 'text-gray-900')}>
                      {call.contact.firstName} {call.contact.lastName}
                    </h2>
                    <p className={cn('mt-1 text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
                      {formatPhoneDisplay(call.contact.phone)}
                    </p>
                  </>
                ) : (
                  <div className="skeleton mt-3 h-7 w-56 rounded-full" />
                )}
              </div>

              <button
                onClick={onClose}
                className={cn(
                  'rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                  dark
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/18 hover:bg-white/10 hover:text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-200 hover:text-gray-900',
                )}
              >
                Back
              </button>
            </div>
          </div>

          <div className="dashboard-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {loading && <DetailSkeleton />}

            {!loading && error && (
              <div className={cn(
                'flex min-h-[320px] items-center justify-center rounded-[24px] border px-6 text-center text-sm',
                dark ? 'border-red-400/20 bg-red-400/8 text-red-200' : 'border-red-200 bg-red-50 text-red-600',
              )}>
                {error}
              </div>
            )}

            {!loading && !error && call && (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: 'Location',
                      value: LOCATIONS[call.location]?.name.replace('NakedMD ', '') ?? call.location,
                    },
                    {
                      label: 'Direction',
                      value: call.direction === 'outbound' ? 'Outbound' : 'Inbound',
                    },
                    { label: 'Duration', value: formatDuration(call.duration) },
                    {
                      label: 'Started',
                      value: call.timestamps.callInitiated
                        ? new Date(call.timestamps.callInitiated).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : '--',
                    },
                  ].map((meta) => (
                    <div
                      key={meta.label}
                      className={cn('rounded-[22px] border p-4', dark ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50')}
                    >
                      <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                        {meta.label}
                      </div>
                      <div className={cn('mt-2 text-lg font-semibold', dark ? 'text-white' : 'text-gray-900')}>{meta.value}</div>
                    </div>
                  ))}
                </div>

                {autopilot && (
                  <div className="rounded-[24px] border border-[rgba(197,165,114,0.18)] bg-[rgba(197,165,114,0.08)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-[#d4bd8a]' : 'text-[#8a6d3b]')}>
                        System Resolution
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]',
                          resolution?.status === 'needs-you'
                            ? dark
                              ? 'border-[rgba(251,113,133,0.2)] bg-[rgba(251,113,133,0.1)] text-[#ffb4c3]'
                              : 'border-rose-200 bg-rose-50 text-rose-700'
                            : dark
                              ? 'border-emerald-400/18 bg-emerald-400/10 text-emerald-200'
                              : 'border-emerald-400/18 bg-emerald-400/10 text-emerald-700',
                        )}
                      >
                        {resolution?.statusLabel}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {[
                        { label: 'What Happened', value: resolution?.whatHappened ?? '' },
                        { label: 'NakedMD AI Did', value: resolution?.aiDid ?? '' },
                        { label: 'Next Step', value: resolution?.nextStep ?? '' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cn(
                            'rounded-[18px] border px-4 py-4',
                            dark ? 'border-white/8 bg-[#11131b]' : 'border-slate-200 bg-white',
                          )}
                        >
                          <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                            {item.label}
                          </div>
                          <div className={cn('mt-2 text-sm leading-6', dark ? 'text-slate-200' : 'text-slate-700')}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className={cn('rounded-[24px] border p-5', dark ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50')}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                        Outcome
                      </span>
                      {call.outcome ? (
                        <span className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]',
                          dark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-gray-900',
                        )}>
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: OUTCOME_COLORS[call.outcome] }}
                          />
                          {OUTCOME_LABELS[call.outcome]}
                        </span>
                      ) : (
                        <span className={cn('text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>Outcome pending</span>
                      )}
                    </div>

                    <div className="mt-5 space-y-4">
                      {call.outcomeConfidence !== null && (
                        <div>
                          <div className={cn('mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                            <span>Confidence</span>
                            <span className={dark ? 'text-slate-300' : 'text-gray-900'}>{Math.round(call.outcomeConfidence * 100)}%</span>
                          </div>
                          <div className={cn('h-2 rounded-full', dark ? 'bg-white/8' : 'bg-slate-200')}>
                            <div
                              className="h-2 rounded-full bg-[linear-gradient(90deg,#C5A572_0%,#B8944A_100%)]"
                              style={{ width: `${Math.round(call.outcomeConfidence * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {call.sentiment !== null && (
                        <div className="flex items-center gap-3">
                          <span className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                            Sentiment
                          </span>
                          <span
                            className="text-2xl font-black"
                            style={{ color: getSentimentColor(call.sentiment) }}
                          >
                            {call.sentiment}
                          </span>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                            style={{
                              color: getSentimentColor(call.sentiment),
                              backgroundColor: `${getSentimentColor(call.sentiment)}18`,
                            }}
                          >
                            {getSentimentLabel(call.sentiment)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={cn('rounded-[24px] border p-5', dark ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50')}>
                    <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                      AI Summary
                    </div>
                    <div className={cn(
                      'mt-4 rounded-[20px] border p-4 text-sm leading-7',
                      dark ? 'border-white/8 bg-[#11131b] text-slate-300' : 'border-slate-200 bg-white text-slate-700',
                    )}>
                      {call.summary || 'No summary available for this call.'}
                    </div>

                    {call.keyMoments && call.keyMoments.length > 0 && (
                      <div className="mt-5">
                        <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                          Key Moments
                        </div>
                        <ul className="mt-3 space-y-2">
                          {call.keyMoments.map((moment, index) => (
                            <li key={index} className={cn('flex items-start gap-3 text-sm leading-6', dark ? 'text-slate-300' : 'text-slate-700')}>
                              <span className="mt-2 h-2 w-2 rounded-full bg-[#C5A572]" />
                              <span>{moment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn('rounded-[24px] border p-5', dark ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50')}>
                  <div className="flex items-center justify-between gap-3">
                    <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-slate-500')}>
                      Transcript
                    </div>
                    <div className={cn('text-xs uppercase tracking-[0.16em]', dark ? 'text-slate-500' : 'text-slate-400')}>
                      {call.transcript.length} turn{call.transcript.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {call.transcript.length === 0 ? (
                      <div className={cn(
                        'rounded-[18px] border border-dashed px-4 py-8 text-center text-sm',
                        dark ? 'border-white/10 text-slate-500' : 'border-slate-300 text-slate-400',
                      )}>
                        No transcript available.
                      </div>
                    ) : (
                      call.transcript.map((entry, index) => {
                        const isAgent = entry.speaker === 'agent';

                        return (
                          <div
                            key={index}
                            className={cn('flex flex-col', isAgent ? 'items-start' : 'items-end')}
                          >
                            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                              <span className={isAgent ? 'text-[#C5A572]' : dark ? 'text-slate-400' : 'text-slate-500'}>
                                {isAgent ? 'Vi' : call.contact.firstName}
                              </span>
                              <span className={dark ? 'text-slate-500' : 'text-slate-400'}>{formatTimestamp(entry.timestamp)}</span>
                            </div>
                            <div
                              className={cn(
                                'max-w-[88%] rounded-[20px] px-4 py-3 text-sm leading-7 sm:max-w-[78%]',
                                isAgent
                                  ? dark
                                    ? 'rounded-tl-md bg-[linear-gradient(135deg,rgba(197,165,114,0.2),rgba(197,165,114,0.06))] text-white'
                                    : 'rounded-tl-md bg-gradient-to-br from-amber-50 to-amber-100/60 text-gray-900'
                                  : dark
                                    ? 'rounded-tr-md border border-white/8 bg-[#11131b] text-slate-300'
                                    : 'rounded-tr-md border border-slate-200 bg-white text-slate-700',
                              )}
                            >
                              {entry.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
