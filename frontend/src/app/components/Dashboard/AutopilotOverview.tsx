'use client';

import type { AnalyticsResponse, OrchestratorResponse } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/utils';
import {
  formatLocationShort,
  getAutopilotCounts,
  getSummaryResolution,
  sortActionQueueCalls,
} from '@/app/lib/autopilot';
import { cn } from '@/app/lib/utils';

interface AutopilotOverviewProps {
  theme: 'dark' | 'light';
  analytics: AnalyticsResponse;
  orchestrator: OrchestratorResponse | null;
  onOpenCalls: () => void;
  onOpenCall: (id: string) => void;
}

function ImpactCard({
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
    <div className="surface-card-dark rounded-none p-6">
      <div className="h-1 w-16 rounded-none" style={{ background: accent }} />
      <div className="dashboard-label mt-5 text-xs font-semibold uppercase tracking-[0.2em]">
        {label}
      </div>
      <div className="dashboard-value mt-3 text-4xl font-black tracking-tight">
        {value}
      </div>
      <div className="dashboard-copy mt-3 text-sm leading-6">
        {detail}
      </div>
    </div>
  );
}

export default function AutopilotOverview({
  theme,
  analytics,
  orchestrator,
  onOpenCalls,
  onOpenCall,
}: AutopilotOverviewProps) {
  const counts = getAutopilotCounts(analytics, orchestrator);
  const actionFeed = sortActionQueueCalls(analytics.recentCalls).slice(0, 6);
  const needsYou = actionFeed.filter((call) => getSummaryResolution(call).status === 'needs-you').slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-none border border-[#C4B59A]/18 bg-[rgba(244,241,234,0.08)] px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f4f1ea]">
              Autopilot Active
            </div>
            <h2 className="mt-3 dashboard-heading text-2xl font-black tracking-tight">
              NakedMD AI is handling the routine work and raising only the exceptions.
            </h2>
            <p className="dashboard-copy mt-3 max-w-2xl text-sm leading-6">
              This view is the receipt: what got handled, what got booked, and what still needs a
              person.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCalls}
            className="rounded-none border border-[#C4B59A]/24 bg-[#C4B59A]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] hover:border-[#C4B59A]/40 hover:bg-[#C4B59A]/16"
          >
            Open Action Queue
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ImpactCard
          label="Handled"
          value={counts.handledCount.toString()}
          detail={`${counts.nurtureCount} leads were kept warm automatically and ${counts.preventedCount} would-be drop-offs were saved.`}
          accent="linear-gradient(90deg,#60a5fa 0%,#22c55e 100%)"
        />
        <ImpactCard
          label="Booked"
          value={counts.bookedCount.toString()}
          detail="Consultations and treatments moved forward without a manager needing to step in."
          accent="#C4B59A"
        />
        <ImpactCard
          label="Needs You"
          value={counts.needsYouCount.toString()}
          detail={
            counts.needsYouCount > 0
              ? 'Only the conversations that need judgment rise to this list.'
              : 'Everything is caught up right now.'
          }
          accent="linear-gradient(90deg,#fb7185 0%,#f97316 100%)"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card-dark rounded-none p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
                Live Action Feed
              </div>
              <p className="dashboard-copy mt-2 text-sm leading-6">
                What NakedMD AI has already done across the floor.
              </p>
            </div>
            <span
              className={cn(
                'dashboard-label rounded-none border px-3 py-1.5 text-xs uppercase tracking-[0.14em]',
                theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-[#E0DEDB] bg-[#f4f1ea]/30',
              )}
            >
              {actionFeed.length} recent actions
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {actionFeed.length === 0 ? (
              <div
                className={cn(
                  'rounded-none border border-dashed px-5 py-12 text-center',
                  theme === 'dark' ? 'border-white/10' : 'border-[#C4B59A]',
                )}
              >
                <div className="dashboard-heading text-lg font-semibold">No recent actions yet</div>
                <div className="dashboard-copy mt-2 text-sm leading-6">
                  NakedMD AI will show handled work here as soon as the next conversations complete.
                </div>
              </div>
            ) : (
              actionFeed.map((call) => {
                const resolution = getSummaryResolution(call);

                return (
                  <button
                    key={call.id}
                    type="button"
                    onClick={() => onOpenCall(call.id)}
                    className={cn(
                      'flex w-full items-start gap-4 rounded-none border px-4 py-4 text-left',
                      theme === 'dark'
                        ? 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'
                        : 'border-[#E0DEDB] bg-[#f4f1ea]/30 hover:border-[#C4B59A] hover:bg-[#fdfcfa]',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-1 h-2.5 w-2.5 rounded-full',
                        resolution.status === 'needs-you' ? 'bg-[#fb7185]' : 'bg-[#22c55e]',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="dashboard-heading text-sm font-semibold leading-6">
                        {resolution.aiDid}
                      </div>
                      <div className="dashboard-copy mt-1 text-sm leading-6">
                        {call.contact.firstName} {call.contact.lastName} ·{' '}
                        {formatLocationShort(call.location)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="dashboard-label text-[11px] font-semibold uppercase tracking-[0.14em]">
                        {resolution.statusLabel}
                      </div>
                      <div className="dashboard-muted mt-1 text-xs">
                        {formatRelativeTime(call.startedAt)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="surface-card-dark rounded-none p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
                Needs You
              </div>
              <p className="dashboard-copy mt-2 text-sm leading-6">
                Only the items that still need judgment.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCalls}
              className={cn(
                'dashboard-label rounded-none border px-3 py-1.5 text-xs uppercase tracking-[0.14em]',
                theme === 'dark'
                  ? 'border-white/8 bg-white/4 hover:border-white/14 hover:bg-white/[0.08]'
                  : 'border-[#E0DEDB] bg-[#f4f1ea]/30 hover:border-[#C4B59A] hover:bg-[#fdfcfa]',
              )}
            >
              View Queue
            </button>
          </div>

          {needsYou.length === 0 ? (
            <div
              className={cn(
                'mt-6 rounded-none border border-dashed px-5 py-12 text-center',
                theme === 'dark' ? 'border-white/10' : 'border-[#C4B59A]',
              )}
            >
              <div className="dashboard-heading text-lg font-semibold">Everything is handled</div>
              <div className="dashboard-copy mt-2 text-sm leading-6">
                NakedMD AI has not raised any manager exceptions in the current view.
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {needsYou.map((call) => {
                const resolution = getSummaryResolution(call);

                return (
                  <button
                    key={call.id}
                  type="button"
                  onClick={() => onOpenCall(call.id)}
                  className="w-full rounded-none border border-[rgba(251,113,133,0.18)] bg-[rgba(251,113,133,0.06)] px-4 py-4 text-left hover:border-[rgba(251,113,133,0.28)] hover:bg-[rgba(251,113,133,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="dashboard-heading text-sm font-semibold">
                          {call.contact.firstName} {call.contact.lastName}
                        </div>
                        <div className="dashboard-copy mt-1 text-sm leading-6">
                          {resolution.whatHappened}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            'text-[11px] font-semibold uppercase tracking-[0.14em]',
                            theme === 'dark' ? 'text-[#ffb4c3]' : 'text-rose-700',
                          )}
                        >
                          Needs You
                        </div>
                        <div className="dashboard-muted mt-1 text-xs">
                          {formatRelativeTime(call.startedAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
