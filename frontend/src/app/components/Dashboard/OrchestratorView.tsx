'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type {
  OrchestratorResponse,
  OrchestrationRecord,
  ChannelType,
  ChannelFinalStatus,
} from '@/app/lib/types';
import { OUTCOME_LABELS, OUTCOME_COLORS } from '@/app/lib/constants';
import { cn } from '@/app/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CHANNEL_META: Record<ChannelType, { label: string; color: string; icon: string }> = {
  voice: { label: 'Voice', color: '#818cf8', icon: 'V' },
  sms: { label: 'SMS', color: '#34d399', icon: 'S' },
  chat: { label: 'Chat', color: '#fbbf24', icon: 'C' },
};

const STATUS_META: Record<ChannelFinalStatus, { label: string; color: string }> = {
  engaged: { label: 'Engaged', color: '#22c55e' },
  suppressed: { label: 'Paused', color: '#475569' },
  failed: { label: 'Failed', color: '#ef4444' },
  repurposed: { label: 'Switched', color: '#f59e0b' },
};

const EVENT_ACTION_LABELS: Record<string, string> = {
  launched: 'Started',
  delivered: 'Delivered',
  ready: 'Ready',
  ringing: 'Ringing',
  connected: 'Answered',
  engaged: 'Replied',
  suppressed: 'Paused',
  failed: 'Failed',
  repurposed: 'Switched',
};

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}m ${rem}s`;
}

function formatEventAction(action: string): string {
  return EVENT_ACTION_LABELS[action] ?? action;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="surface-card-dark rounded-[24px] p-5">
      <div className="h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />
      <div className="dashboard-label mt-4 text-xs font-semibold uppercase tracking-[0.2em]">
        {label}
      </div>
      <div className="dashboard-value mt-2 text-3xl font-black tracking-tight">{value}</div>
      <div className="dashboard-muted mt-2 text-xs leading-5">{detail}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Channel Win Bar
// ---------------------------------------------------------------------------
function ChannelWinBar({
  channel,
  wins,
  total,
  animate,
  theme,
}: {
  channel: ChannelType;
  wins: number;
  total: number;
  animate: boolean;
  theme: 'dark' | 'light';
}) {
  const pct = total > 0 ? (wins / total) * 100 : 0;
  const meta = CHANNEL_META[channel];

  return (
    <div className="flex items-center gap-4">
      <div className="flex w-20 items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
          style={{ backgroundColor: meta.color + '30' }}
        >
          {meta.icon}
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <div
        className={cn(
          'h-9 flex-1 overflow-hidden rounded-full',
          theme === 'dark' ? 'bg-white/5' : 'bg-slate-100',
        )}
      >
        <div
          className="flex h-full items-center justify-end rounded-full px-3 transition-all duration-700 ease-out"
          style={{
            width: animate ? `${Math.max(pct, 10)}%` : '0%',
            backgroundColor: meta.color + '25',
            borderRight: `3px solid ${meta.color}`,
          }}
        >
          <span className={cn('text-xs font-bold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
            {wins} <span className="dashboard-label">({pct.toFixed(0)}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lead Orchestration Card
// ---------------------------------------------------------------------------
function LeadCard({
  record,
  expanded,
  onToggle,
  theme,
}: {
  record: OrchestrationRecord;
  expanded: boolean;
  onToggle: (id: string) => void;
  theme: 'dark' | 'light';
}) {
  const winnerMeta = CHANNEL_META[record.winningChannel];
  const maxOffset = Math.max(...record.events.map((e) => e.offsetMs), 1);

  return (
    <div
      className={cn(
        'rounded-[20px] border transition-all duration-200',
        expanded
          ? theme === 'dark'
            ? 'border-white/12 bg-white/[0.04]'
            : 'border-slate-200 bg-slate-50'
          : theme === 'dark'
            ? 'border-white/6 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.03]'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => onToggle(record.id)}
        className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="dashboard-heading text-sm font-semibold">{record.leadName}</div>
          <div className="dashboard-muted mt-0.5 text-xs">
            {record.location === 'newport-beach' ? 'Newport Beach' : record.location === 'beverly-hills' ? 'Beverly Hills' : 'Scottsdale'} ·{' '}
            {record.interest}
          </div>
        </div>

        {record.outcome && (
          <span
            className={cn(
              'dashboard-copy inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
              theme === 'dark' ? 'border-white/10 bg-white/4' : 'border-slate-200 bg-slate-50',
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: OUTCOME_COLORS[record.outcome] }}
            />
            {OUTCOME_LABELS[record.outcome]}
          </span>
        )}

        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{
            color: winnerMeta.color,
            backgroundColor: winnerMeta.color + '18',
          }}
        >
          {winnerMeta.icon} {winnerMeta.label} Won
        </span>

        <span
          className={cn(
            'dashboard-label rounded-full border px-2.5 py-1 font-mono text-[11px]',
            theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50',
          )}
        >
          {formatMs(record.firstResponseMs)}
        </span>

        <svg
          className={cn('h-4 w-4 text-slate-500 transition-transform', expanded && 'rotate-180')}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Expanded timeline */}
      {expanded && (
        <div
          className={cn(
            'border-t px-5 pb-5 pt-4',
            theme === 'dark' ? 'border-white/6' : 'border-slate-200',
          )}
        >
          {/* First response marker */}
          <div className="mb-4 flex items-center gap-2 text-xs">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />
            <span className="font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
              First Response: {formatMs(record.firstResponseMs)}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />
          </div>

          {/* Channel swim lanes */}
          <div className="space-y-3">
            {(['voice', 'sms', 'chat'] as ChannelType[]).map((ch) => {
              const chMeta = CHANNEL_META[ch];
              const status = record.channels[ch];
              const statusMeta = STATUS_META[status];
              const chEvents = record.events.filter((e) => e.channel === ch);
              const isWinner = record.winningChannel === ch;

              return (
                <div key={ch} className="flex items-center gap-3">
                  {/* Channel label */}
                  <div className="flex w-20 items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{
                        color: isWinner ? '#fff' : chMeta.color,
                        backgroundColor: isWinner ? chMeta.color + '50' : chMeta.color + '15',
                      }}
                    >
                      {chMeta.icon}
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: isWinner ? chMeta.color : '#64748b' }}
                    >
                      {chMeta.label}
                    </span>
                  </div>

                  {/* Timeline bar */}
                  <div
                    className={cn(
                      'relative h-8 flex-1 overflow-hidden rounded-full',
                      theme === 'dark' ? 'bg-white/[0.04]' : 'bg-slate-100',
                    )}
                  >
                    {/* Background fill for winner */}
                    {isWinner && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${chMeta.color}08, ${chMeta.color}18)`,
                        }}
                      />
                    )}

                    {/* Event markers */}
                    {chEvents.map((event, i) => {
                      const leftPct = (event.offsetMs / maxOffset) * 92 + 2;
                      const isEngaged = event.action === 'engaged' || event.action === 'connected';
                      const isFailed =
                        event.action === 'failed' || event.action === 'suppressed';
                      const isRepurposed = event.action === 'repurposed';

                      let dotColor = chMeta.color;
                      if (isEngaged) dotColor = '#22c55e';
                      if (isFailed) dotColor = event.action === 'failed' ? '#ef4444' : '#475569';
                      if (isRepurposed) dotColor = '#f59e0b';

                      return (
                        <div
                          key={i}
                          className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${leftPct}%` }}
                        >
                          <div
                            className={cn(
                              'rounded-full transition-transform',
                              isEngaged
                                ? theme === 'dark'
                                  ? 'h-3.5 w-3.5 ring-2 ring-white/20'
                                  : 'h-3.5 w-3.5 ring-2 ring-white'
                                : 'h-2.5 w-2.5',
                            )}
                            style={{ backgroundColor: dotColor }}
                          />
                          {/* Tooltip */}
                          <div
                            className={cn(
                              'pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[10px] opacity-0 shadow-lg transition-opacity group-hover:opacity-100',
                              theme === 'dark'
                                ? 'border-white/10 bg-[#0e1118] text-slate-300'
                                : 'border-slate-200 bg-white text-slate-700',
                            )}
                          >
                            <span className="font-semibold" style={{ color: dotColor }}>
                              {formatEventAction(event.action)}
                            </span>{' '}
                            · {formatMs(event.offsetMs)}
                            <div className={cn('mt-0.5', theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>
                              {event.detail}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* First response line */}
                    {isWinner && (
                      <div
                        className="absolute top-0 h-full w-px bg-[#22c55e]/50"
                        style={{
                          left: `${(record.firstResponseMs / maxOffset) * 92 + 2}%`,
                        }}
                      />
                    )}
                  </div>

                  {/* Status badge */}
                  <span
                    className="w-24 text-right text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: statusMeta.color }}
                  >
                    {statusMeta.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Event log */}
          <div
            className={cn(
              'mt-4 rounded-[14px] border px-4 py-3',
              theme === 'dark' ? 'border-white/6 bg-white/[0.02]' : 'border-slate-200 bg-slate-50',
            )}
          >
            <div className="dashboard-muted text-[10px] font-semibold uppercase tracking-[0.18em]">
              Action Sequence
            </div>
            <div className="mt-2 grid gap-1">
              {record.events.map((event, i) => {
                const chMeta = CHANNEL_META[event.channel];
                return (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="dashboard-muted w-14 font-mono tabular-nums">
                      {formatMs(event.offsetMs)}
                    </span>
                    <span
                      className="w-5 text-center text-[10px] font-bold"
                      style={{ color: chMeta.color }}
                    >
                      {chMeta.icon}
                    </span>
                    <span className="dashboard-copy font-medium">{formatEventAction(event.action)}</span>
                    <span className="dashboard-muted">- {event.detail}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MemoizedLeadCard = React.memo(LeadCard);

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function OrchestratorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card-dark rounded-[24px] p-5">
            <div className="skeleton h-1 w-12 rounded-full" />
            <div className="skeleton mt-4 h-3 w-24 rounded-full" />
            <div className="skeleton mt-3 h-8 w-20 rounded-full" />
            <div className="skeleton mt-3 h-3 w-36 rounded-full" />
          </div>
        ))}
      </div>
      <div className="surface-card-dark rounded-[28px] p-6">
        <div className="skeleton h-4 w-48 rounded-full" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-9 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function OrchestratorView({
  data,
  theme = 'dark',
}: {
  data: OrchestratorResponse | null;
  theme?: 'dark' | 'light';
}) {
  const loading = data === null;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (data) {
      const timer = window.setTimeout(() => setAnimate(true), 80);
      return () => window.clearTimeout(timer);
    }
  }, [data]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    if (data && data.records.length > 0 && expandedId === null) {
      setExpandedId(data.records[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (loading || !data) {
    return <OrchestratorSkeleton />;
  }

  const { stats, records } = data;
  const totalWins = stats.channelWins.voice + stats.channelWins.sms + stats.channelWins.chat;

  return (
    <div className="space-y-6">
      {/* Orchestrator overview */}
      <div className="rounded-[24px] border border-[#818cf8]/20 bg-[#818cf8]/[0.06] px-6 py-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#818cf8]/20 text-lg font-black text-[#818cf8]">
            3
          </div>
          <div className="min-w-0 flex-1">
            <div className="dashboard-heading text-sm font-bold">First-Response Coverage</div>
            <p className="dashboard-copy mt-1 max-w-3xl text-sm leading-6">
              When a lead comes in, NakedMD AI reaches out across call, text, and chat. The first
              channel that gets a response takes over, and the others back off so the lead does not
              get spammed.
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Leads Reached"
          value={`${stats.engagementRate}%`}
          detail="Leads reached via any channel"
          accent="#22c55e"
        />
        <StatCard
          label="Avg First Reply"
          value={formatMs(stats.avgFirstResponseMs)}
          detail="Time to first engagement"
          accent="#C5A572"
        />
        <StatCard
          label="Leads Saved"
          value={`${stats.leakagePrevented}`}
          detail="Leads saved by fallback channel"
          accent="#818cf8"
        />
        <StatCard
          label="Extra Touches Avoided"
          value={`${stats.duplicatesSuppressed}`}
          detail="Duplicate contacts prevented"
          accent="#fbbf24"
        />
      </div>

      {/* Channel win distribution */}
      <div className="surface-card-dark rounded-[28px] p-6">
        <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
          What Got the Reply
        </div>
        <p className="dashboard-copy mt-2 text-sm leading-6">
          Which channel reached the lead first.
        </p>
        <div className="mt-6 space-y-3">
          {(['voice', 'sms', 'chat'] as ChannelType[]).map((ch) => (
            <ChannelWinBar
              key={ch}
              channel={ch}
              wins={stats.channelWins[ch]}
              total={totalWins}
              animate={animate}
              theme={theme}
            />
          ))}
        </div>
      </div>

      {/* Lead orchestration timeline */}
      <div className="surface-card-dark rounded-[28px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
              Lead Follow-Up Timeline
            </div>
            <p className="dashboard-copy mt-2 text-sm leading-6">
              Each lead&apos;s call, text, and chat sequence. Click to expand.
            </p>
          </div>
          <span
            className={cn(
              'dashboard-label rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.14em]',
              theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50',
            )}
          >
            {records.length} leads
          </span>
        </div>

        <div className="mt-6 max-h-[640px] space-y-2 overflow-y-auto dashboard-scroll">
          {records.map((record) => (
            <MemoizedLeadCard
              key={record.id}
              record={record}
              expanded={expandedId === record.id}
              onToggle={handleToggle}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
