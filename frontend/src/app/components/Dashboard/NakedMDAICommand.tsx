'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import type { AnalyticsResponse, CallSummary, OrchestratorResponse } from '@/app/lib/types';
import { cn } from '@/app/lib/utils';
import {
  getAutopilotCounts,
  getSummaryResolution,
  sortActionQueueCalls,
} from '@/app/lib/autopilot';

type Tab = 'overview' | 'calls' | 'analytics' | 'orchestrator' | 'agent-config';
type Theme = 'dark' | 'light';

interface NakedMDAICommandProps {
  theme: Theme;
  analytics: AnalyticsResponse | null;
  orchestrator: OrchestratorResponse | null;
  autopilot: boolean;
  onChangeTab: (tab: Tab) => void;
  onOpenCall: (id: string) => void;
}

interface AssistantSnapshot {
  handledCount: number;
  needsCount: number;
  handledText: string;
  needsText: string;
  whyItems: string[];
  primaryLabel: string;
  primaryTab: Tab;
  primaryCallId?: string;
}

function callName(call: CallSummary | undefined): string {
  if (!call) return 'A recent lead';
  return `${call.contact.firstName} ${call.contact.lastName}`;
}

export default function NakedMDAICommand({
  theme,
  analytics,
  orchestrator,
  autopilot,
  onChangeTab,
  onOpenCall,
}: NakedMDAICommandProps) {
  const [open, setOpen] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  const snapshot = useMemo<AssistantSnapshot>(() => {
    if (!analytics) {
      return {
        handledCount: 0,
        needsCount: 0,
        handledText: 'Loading the latest activity now.',
        needsText: 'Nothing to review until the dashboard finishes syncing.',
        whyItems: [
          'Pulling current lead activity',
          'Checking for anything that needs a person',
          'Preparing a simple summary for the GM',
        ],
        primaryLabel: 'Open Dashboard',
        primaryTab: 'overview',
      };
    }

    const counts = getAutopilotCounts(analytics, orchestrator);
    const urgentCall = sortActionQueueCalls(analytics.recentCalls).find(
      (call) => getSummaryResolution(call).status === 'needs-you',
    );

    return {
      handledCount: counts.handledCount,
      needsCount: counts.needsYouCount,
      handledText:
        counts.bookedCount > 0
          ? `Booked ${counts.bookedCount} consultations and kept ${counts.nurtureCount} leads moving without needing you.`
          : `Kept ${counts.nurtureCount} leads moving and handled the routine follow-up automatically.`,
      needsText:
        counts.needsYouCount > 0
          ? `${callName(urgentCall)} is the one to look at first.`
          : 'Nothing needs you right now.',
      whyItems: [
        `${counts.handledCount} conversations were handled without manager intervention.`,
        `${counts.bookedCount} consultations were secured in the current view.`,
        `${orchestrator?.stats.duplicatesSuppressed ?? 0} extra follow-ups were avoided automatically.`,
      ],
      primaryLabel:
        counts.needsYouCount > 0 ? 'Open Action Queue' : autopilot ? 'View Autopilot' : 'View Calls',
      primaryTab: counts.needsYouCount > 0 ? 'calls' : autopilot ? 'overview' : 'calls',
      primaryCallId: counts.needsYouCount > 0 ? urgentCall?.id : undefined,
    };
  }, [analytics, orchestrator, autopilot]);

  function handlePrimaryAction() {
    startTransition(() => {
      onChangeTab(snapshot.primaryTab);
      if (snapshot.primaryCallId) onOpenCall(snapshot.primaryCallId);
    });
    setOpen(false);
    setShowWhy(false);
  }

  const restingLabel = analytics
    ? `NakedMD AI handled ${snapshot.handledCount} leads. ${
        snapshot.needsCount === 0
          ? 'Nothing needs you.'
          : `${snapshot.needsCount} ${snapshot.needsCount === 1 ? 'needs' : 'need'} you.`
      }`
    : 'NakedMD AI is getting the floor ready.';

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'pointer-events-auto w-[min(100vw-2rem,23rem)] overflow-hidden rounded-[24px] border text-left shadow-[0_24px_72px_rgba(15,23,42,0.2)] animate-fade-up',
            theme === 'dark'
              ? 'border-white/10 bg-[#1e1e1e] text-white'
              : 'border-slate-200 bg-white text-slate-900',
          )}
        >
          <div className="bg-[linear-gradient(135deg,rgba(31,138,132,0.18),rgba(31,138,132,0.04))] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1F8A84_0%,#187F80_100%)] text-xs font-black uppercase tracking-[0.12em] text-white">
                AI
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#59B1AB]">
                  NakedMD AI
                </div>
                <div className={cn('mt-1 text-sm font-semibold leading-5', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                  {restingLabel}
                </div>
              </div>
            </div>
          </div>
        </button>
      )}

      {open && (
        <div
          className={cn(
            'pointer-events-auto w-[min(100vw-2rem,24rem)] overflow-hidden rounded-[30px] border shadow-[0_30px_90px_rgba(15,23,42,0.24)] animate-fade-up',
            theme === 'dark'
              ? 'border-white/10 bg-[#1a1a1a] text-white'
              : 'border-slate-200 bg-white text-slate-900',
          )}
        >
          <div className={cn(
            'border-b px-5 py-5',
            theme === 'dark'
              ? 'border-white/8 bg-[linear-gradient(180deg,rgba(31,138,132,0.14),rgba(255,255,255,0))]'
              : 'border-slate-200 bg-[linear-gradient(180deg,rgba(31,138,132,0.14),rgba(255,255,255,0))]',
          )}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#59B1AB]">
                  NakedMD AI
                </div>
                <h2 className={cn('mt-2 text-xl font-black tracking-tight', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                  {autopilot ? 'Autopilot is handling the routine work.' : 'Here is the simple version.'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShowWhy(false);
                }}
                className={cn(
                  'rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]',
                  theme === 'dark'
                    ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/18 hover:bg-white/[0.08] hover:text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900',
                )}
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            <section className={cn(
              'rounded-[24px] border px-4 py-4',
              theme === 'dark' ? 'border-white/8 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80',
            )}>
              <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                Handled
              </div>
              <div className={cn('mt-2 text-3xl font-black tracking-tight', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                {snapshot.handledCount}
              </div>
              <p className={cn('mt-2 text-sm leading-6', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                {snapshot.handledText}
              </p>
            </section>

            <section className={cn(
              'rounded-[24px] border px-4 py-4',
              snapshot.needsCount > 0
                ? 'border-[rgba(251,113,133,0.18)] bg-[rgba(251,113,133,0.06)]'
                : theme === 'dark'
                  ? 'border-white/8 bg-white/[0.03]'
                  : 'border-slate-200 bg-slate-50/80',
            )}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className={cn(
                      'text-[11px] font-semibold uppercase tracking-[0.18em]',
                      snapshot.needsCount > 0
                        ? theme === 'dark'
                          ? 'text-[#ffb4c3]'
                          : 'text-rose-700'
                        : theme === 'dark'
                          ? 'text-slate-400'
                          : 'text-slate-500',
                    )}
                  >
                    Needs You
                  </div>
                  <div className={cn('mt-2 text-3xl font-black tracking-tight', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {snapshot.needsCount}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  className="rounded-full bg-[linear-gradient(135deg,#1F8A84_0%,#187F80_100%)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[0_14px_28px_rgba(31,138,132,0.22)]"
                >
                  {snapshot.primaryLabel}
                </button>
              </div>
              <p className={cn('mt-2 text-sm leading-6', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                {snapshot.needsText}
              </p>
            </section>

            <section className={cn(
              'rounded-[24px] border px-4 py-4',
              theme === 'dark' ? 'border-white/8 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80',
            )}>
              <button
                type="button"
                onClick={() => setShowWhy((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                    View Why
                  </div>
                  <div className={cn('mt-1 text-sm leading-6', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                    Show the proof behind this summary.
                  </div>
                </div>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={cn('h-5 w-5 shrink-0 transition-transform', theme === 'dark' ? 'text-slate-400' : 'text-slate-500', showWhy && 'rotate-180')}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {showWhy && (
                <div className="mt-4 space-y-2">
                  {snapshot.whyItems.map((item) => (
                    <div
                      key={item}
                      className={cn(
                        'rounded-[18px] border px-3 py-3 text-sm leading-6',
                        theme === 'dark'
                          ? 'border-white/8 bg-[#222222] text-slate-200'
                          : 'border-slate-200 bg-white text-slate-700',
                      )}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
