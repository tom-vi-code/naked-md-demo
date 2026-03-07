'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnalyticsResponse, CallSummary, OrchestratorResponse } from '@/app/lib/types';
import { OUTCOME_LABELS, OUTCOME_COLORS } from '@/app/lib/constants';
import { formatDuration, formatRelativeTime, getSentimentColor, cn } from '@/app/lib/utils';
import { getAutopilotCounts } from '@/app/lib/autopilot';

import KPICards from '@/app/components/Dashboard/KPICards';
import CallLog from '@/app/components/Dashboard/CallLog';
import CallDetail from '@/app/components/Dashboard/CallDetail';
import ConversionFunnel from '@/app/components/Dashboard/ConversionFunnel';
import LocationBreakdown from '@/app/components/Dashboard/LocationBreakdown';
import OutcomeDistribution from '@/app/components/Dashboard/OutcomeDistribution';
import OrchestratorView from '@/app/components/Dashboard/OrchestratorView';
import NakedMDAICommand from '@/app/components/Dashboard/NakedMDAICommand';
import AutopilotOverview from '@/app/components/Dashboard/AutopilotOverview';
import AgentConfigPanel from '@/app/components/Dashboard/AgentConfigPanel';

type Tab = 'overview' | 'calls' | 'analytics' | 'orchestrator' | 'agent-config';
type Period = 'today' | 'week' | 'all';

const BASE_NAV_ITEMS: Array<{ id: Tab; label: string; icon: string; description: string }> = [
  { id: 'overview', label: 'Overview', icon: '01', description: 'Real-time KPIs across all NakedMD studio locations' },
  { id: 'calls', label: 'Call Log', icon: '02', description: 'Every Vi conversation with transcripts, classification, and follow-up status' },
  { id: 'analytics', label: 'Analytics', icon: '03', description: 'Conversion funnels, outcome distribution, and location performance' },
  { id: 'orchestrator', label: 'Follow-Up', icon: '04', description: 'How NakedMD AI covers each lead across calls, texts, and chat' },
  { id: 'agent-config', label: 'Agent Config', icon: '05', description: 'Customize the chat concierge personality, language, and tone' },
];

const PERIOD_OPTIONS: Array<{ id: Period; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'all', label: 'All Time' },
];

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="surface-card-dark rounded-[24px] p-5">
            <div className="skeleton h-1 rounded-full" />
            <div className="skeleton mt-5 h-4 w-28 rounded-full" />
            <div className="skeleton mt-5 h-10 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card-dark rounded-[28px] p-6">
          <div className="skeleton h-5 w-40 rounded-full" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="skeleton h-48 rounded-[24px]" />
            ))}
          </div>
        </div>
        <div className="surface-card-dark rounded-[28px] p-6">
          <div className="skeleton h-5 w-40 rounded-full" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-5 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="surface-card-dark rounded-[28px] p-6">
        <div className="skeleton h-5 w-32 rounded-full" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-12 rounded-[18px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('all');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [orchestrator, setOrchestrator] = useState<OrchestratorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [autopilot, setAutopilot] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('nakedmd_theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    const savedAutopilot = localStorage.getItem('nakedmd_autopilot');
    if (savedAutopilot) setAutopilot(savedAutopilot === 'on');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nakedmd_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nakedmd_autopilot', autopilot ? 'on' : 'off');
  }, [autopilot]);

  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => {
        if (!res.ok) {
          router.push('/');
        } else {
          setAuthed(true);
        }
      })
      .catch(() => router.push('/'));
  }, [router]);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    fetch('/api/orchestrator')
      .then((res) => res.json())
      .then((d: OrchestratorResponse) => { if (!cancelled) setOrchestrator(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authed]);

  const navItems = useMemo(
    () =>
      BASE_NAV_ITEMS.map((item) =>
        item.id === 'calls' && autopilot
          ? {
              ...item,
              label: 'Action Queue',
              description: 'Only the conversations that still need review or that NakedMD AI already handled',
            }
          : item.id === 'overview' && autopilot
            ? {
                ...item,
                label: 'Autopilot',
                description: 'Active operations across all NakedMD studio locations',
              }
            : item,
      ),
    [autopilot],
  );

  const activeNavItem = useMemo(() => {
    const item = navItems.find((entry) => entry.id === activeTab) ?? navItems[0];
    return item;
  }, [navItems, activeTab]);

  const autopilotCounts = useMemo(
    () => (analytics ? getAutopilotCounts(analytics, orchestrator) : null),
    [analytics, orchestrator],
  );

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data: AnalyticsResponse = await res.json();
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (authed) {
      void fetchAnalytics();
    }
  }, [authed, fetchAnalytics]);

  useEffect(() => {
    setMenuOpen(false);
  }, [activeTab, selectedCallId]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#1a1a1a]">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
          <div className="surface-card-dark w-full max-w-md rounded-[28px] p-8 text-center">
            <div className="skeleton mx-auto h-14 w-14 rounded-2xl" />
            <div className="skeleton mx-auto mt-6 h-6 w-48 rounded-full" />
            <div className="skeleton mx-auto mt-3 h-4 w-64 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-dashboard
      className={cn(
        'min-h-screen overflow-hidden transition-colors duration-300',
        theme === 'dark'
          ? 'bg-[#1a1a1a] text-[#F0F0F5]'
          : 'bg-[#f5f6fa] text-[#1f2937]',
      )}
    >
      <div className={cn(
        'pointer-events-none fixed inset-0 transition-opacity duration-300',
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_top_left,rgba(31,138,132,0.16),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(31,138,132,0.55),transparent_32%)]'
          : 'bg-[radial-gradient(circle_at_top_left,rgba(31,138,132,0.06),transparent_18%)] opacity-60',
      )} />

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/70 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="relative flex min-h-screen">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r px-4 py-5 transition-all duration-300 md:sticky md:translate-x-0',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
            theme === 'dark'
              ? 'border-white/8 bg-[#1e1e1e]'
              : 'border-slate-200 bg-white',
          )}
        >
          <div className={cn('flex items-center gap-4 border-b pb-5', theme === 'dark' ? 'border-white/8' : 'border-slate-200')}>
            <Image
              src={theme === 'dark' ? '/nmd-logo-white.svg' : '/nmd-logo.svg'}
              alt="NakedMD"
              width={85}
              height={48}
              className="h-12 w-auto drop-shadow-[0_18px_34px_rgba(31,138,132,0.28)]"
            />
            <div>
              <div className={cn('text-lg font-extrabold tracking-tight', theme === 'dark' ? 'text-white' : 'text-gray-900')}>NakedMD</div>
              <div className={cn('text-xs uppercase tracking-[0.22em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                Manager Dashboard
              </div>
            </div>
          </div>

          <div className={cn('mt-5 rounded-[24px] border p-4', theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-50')}>
            <div className={cn('text-xs font-semibold uppercase tracking-[0.2em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
              Portfolio
            </div>
            <div className={cn('mt-3 text-xl font-black tracking-tight', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
              NakedMD Studios
            </div>
            <div className={cn('mt-1 text-sm', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
              Newport Beach + Beverly Hills + Scottsdale
            </div>
          </div>

          <nav className="mt-5 flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'rounded-[22px] border px-4 py-4 text-left',
                  activeTab === item.id
                    ? theme === 'dark'
                      ? 'border-[#1F8A84]/35 bg-[#1F8A84]/12 text-white'
                      : 'border-[#1F8A84]/30 bg-[#1F8A84]/8 text-gray-900'
                    : theme === 'dark'
                      ? 'border-white/0 bg-transparent text-slate-400 hover:border-white/8 hover:bg-white/4 hover:text-slate-200'
                      : 'border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.16em]">
                    {item.label}
                  </div>
                  <div
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                      theme === 'dark' ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500',
                    )}
                  >
                    {item.icon}
                  </div>
                </div>
                <div
                  className={cn(
                    'mt-2 text-sm leading-6',
                    activeTab === item.id
                      ? theme === 'dark' ? 'text-white/72' : 'text-slate-700'
                      : theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
                  )}
                >
                  {item.description}
                </div>
              </button>
            ))}
          </nav>

          <div className={cn('space-y-3 border-t pt-4', theme === 'dark' ? 'border-white/8' : 'border-slate-200')}>
            <a
              href="/join"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex w-full items-center justify-between rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]',
                theme === 'dark'
                  ? 'border-[#1F8A84]/20 text-[#59B1AB] hover:border-[#1F8A84]/40 hover:bg-[#1F8A84]/10'
                  : 'border-[#1F8A84]/20 text-[#166f6b] hover:border-[#1F8A84]/40 hover:bg-[#1F8A84]/5',
              )}
            >
              <span>Prospect View</span>
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                'flex w-full items-center justify-between rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]',
                theme === 'dark'
                  ? 'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                {theme === 'dark' ? (
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                ) : (
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                )}
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className={cn(
                'w-full rounded-full border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]',
                theme === 'dark'
                  ? 'border-white/10 text-slate-300 hover:border-red-400/26 hover:bg-red-400/10 hover:text-red-200'
                  : 'border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600',
              )}
            >
              Log Out
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className={cn(
            'sticky top-0 z-20 border-b backdrop-blur transition-colors duration-300',
            theme === 'dark' ? 'border-white/8 bg-[#1a1a1a]/86' : 'border-slate-200 bg-white/80',
          )}>
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className={cn(
                      'mt-1 rounded-full border p-2 md:hidden',
                      theme === 'dark'
                        ? 'border-white/10 bg-white/5 text-slate-300'
                        : 'border-slate-200 bg-white text-slate-700',
                    )}
                    aria-label="Open navigation"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="min-w-0">
                    <div className={cn('text-xs font-semibold uppercase tracking-[0.24em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                      NakedMD · Studios
                    </div>
                    <h1 className={cn('mt-2 text-2xl font-black tracking-tight sm:text-3xl', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                      {activeNavItem.label}
                    </h1>
                    <p className={cn('mt-2 max-w-2xl text-sm leading-6', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                      {activeNavItem.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 self-start">
                  <div className={cn('flex items-center gap-2 rounded-full border p-1', theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-100')}>
                    {PERIOD_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setPeriod(option.id)}
                        className={cn(
                          'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                          period === option.id
                            ? 'bg-[linear-gradient(135deg,#1F8A84_0%,#187F80_100%)] text-white shadow-[0_10px_24px_rgba(31,138,132,0.24)]'
                            : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-gray-900',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={autopilot}
                    onClick={() => setAutopilot((current) => !current)}
                    className={cn(
                      'flex items-center gap-3 rounded-full border px-4 py-2.5',
                      autopilot
                        ? 'border-[#1F8A84]/30 bg-[rgba(31,138,132,0.1)]'
                        : theme === 'dark'
                          ? 'border-white/10 bg-white/[0.04]'
                          : 'border-slate-200 bg-slate-50',
                    )}
                  >
                    <div className="text-left">
                      <div className={cn('text-[10px] font-semibold uppercase tracking-[0.22em]', autopilot ? 'text-[#59B1AB]' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                        Autopilot
                      </div>
                      <div className={cn('mt-0.5 text-xs', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                        {autopilot ? 'Active operations' : 'Manual review'}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'relative flex h-7 w-12 items-center rounded-full transition-colors',
                        autopilot ? 'bg-[linear-gradient(135deg,#1F8A84_0%,#187F80_100%)]' : theme === 'dark' ? 'bg-white/10' : 'bg-slate-300',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                          autopilot ? 'translate-x-6' : 'translate-x-1',
                        )}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {analytics && !loading && (
                <div className={cn('flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
                  {(
                    autopilot && activeTab === 'overview' && autopilotCounts
                      ? [
                          `Handled: ${autopilotCounts.handledCount}`,
                          `Booked: ${autopilotCounts.bookedCount}`,
                          `Needs you: ${autopilotCounts.needsYouCount}`,
                        ]
                      : [
                          `Total calls: ${analytics.kpis.totalCalls}`,
                          `Connect rate: ${analytics.kpis.connectRate.toFixed(1)}%`,
                          `Conversion rate: ${analytics.kpis.conversionRate.toFixed(1)}%`,
                        ]
                  ).map((label) => (
                    <span key={label} className={cn('rounded-full border px-3 py-1.5', theme === 'dark' ? 'border-white/8 bg-white/4' : 'border-slate-200 bg-slate-100')}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {loading && !analytics ? (
              <OverviewSkeleton />
            ) : analytics ? (
              <>
                {activeTab === 'overview' && (
                  autopilot ? (
                    <AutopilotOverview
                      theme={theme}
                      analytics={analytics}
                      orchestrator={orchestrator}
                      onOpenCalls={() => setActiveTab('calls')}
                      onOpenCall={setSelectedCallId}
                    />
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <KPICards kpis={analytics.kpis} />

                      <div className="grid gap-6 xl:grid-cols-2">
                        <LocationBreakdown
                          newportBeach={analytics.locationBreakdown.newportBeach}
                          beverlyHills={analytics.locationBreakdown.beverlyHills}
                          scottsdale={analytics.locationBreakdown.scottsdale}
                        />
                        <OutcomeDistribution distribution={analytics.outcomeDistribution} />
                      </div>

                      <div className="surface-card-dark rounded-[28px] p-6">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
                              Recent Calls
                            </div>
                            <p className="dashboard-copy mt-2 text-sm leading-6">
                              Latest call activity with outcomes and transcript access.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab('calls')}
                            className="rounded-full border border-[#1F8A84]/22 bg-[#1F8A84]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#59B1AB] hover:border-[#1F8A84]/45 hover:bg-[#1F8A84]/16"
                          >
                            View full log
                          </button>
                        </div>

                        <RecentCallsPreview
                          calls={analytics.recentCalls}
                          onSelectCall={setSelectedCallId}
                        />
                      </div>
                    </div>
                  )
                )}

                {activeTab === 'calls' && (
                  <div className="animate-fade-in">
                    <CallLog
                      onSelectCall={setSelectedCallId}
                      autopilot={autopilot}
                      theme={theme}
                    />
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6 animate-fade-in">
                    <ConversionFunnel funnel={analytics.conversionFunnel} />

                    <div className="grid gap-6 xl:grid-cols-2">
                      <OutcomeDistribution distribution={analytics.outcomeDistribution} />
                      <DailyTrendChart data={analytics.dailyTrend} />
                    </div>

                    {analytics.topObjections.length > 0 && (
                      <div className="surface-card-dark rounded-[28px] p-6">
                        <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
                          Top Objections
                        </div>
                        <p className="dashboard-copy mt-2 text-sm leading-6">
                          Most common objections raised during calls.
                        </p>
                        <div className="mt-5 space-y-3">
                          {analytics.topObjections.map((obj, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <span className="dashboard-copy flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="dashboard-heading text-sm">{obj.objection}</div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                  <div
                                    className="h-full rounded-full bg-[#1F8A84]/60"
                                    style={{ width: `${obj.percentage}%` }}
                                  />
                                </div>
                              </div>
                              <span className="dashboard-copy text-xs font-semibold">
                                {obj.count} ({obj.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'orchestrator' && (
                  <div className="animate-fade-in">
                    <OrchestratorView data={orchestrator} theme={theme} />
                  </div>
                )}

                {activeTab === 'agent-config' && (
                  <AgentConfigPanel theme={theme} />
                )}
              </>
            ) : (
              <div className="surface-card-dark rounded-[28px] px-6 py-16 text-center">
                <div className="dashboard-heading text-xl font-semibold">Dashboard data could not load</div>
                <p className="dashboard-copy mx-auto mt-3 max-w-md text-sm leading-6">
                  Refresh the page or try a different period filter.
                </p>
                <button
                  onClick={() => void fetchAnalytics()}
                  className="mt-6 rounded-full bg-[linear-gradient(135deg,#1F8A84_0%,#187F80_100%)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {!selectedCallId && (
        <NakedMDAICommand
          theme={theme}
          analytics={analytics}
          orchestrator={orchestrator}
          autopilot={autopilot}
          onChangeTab={setActiveTab}
          onOpenCall={setSelectedCallId}
        />
      )}

      {selectedCallId && (
        <CallDetail
          callId={selectedCallId}
          onClose={() => setSelectedCallId(null)}
          theme={theme}
          autopilot={autopilot}
        />
      )}
    </div>
  );
}

function RecentCallsPreview({
  calls,
  onSelectCall,
}: {
  calls: CallSummary[];
  onSelectCall: (id: string) => void;
}) {
  if (!calls || calls.length === 0) {
    return (
      <div className="dashboard-copy rounded-[24px] border border-dashed border-white/10 px-6 py-14 text-center text-sm">
        No recent calls for this period.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto dashboard-scroll">
      <table className="min-w-[720px] w-full text-sm">
        <thead>
          <tr className="dashboard-label border-b border-white/8 text-left text-[11px] uppercase tracking-[0.18em]">
            <th className="px-4 py-3 font-semibold">Contact</th>
            <th className="px-4 py-3 font-semibold">Outcome</th>
            <th className="px-4 py-3 font-semibold">Duration</th>
            <th className="px-4 py-3 font-semibold">Sentiment</th>
            <th className="px-4 py-3 font-semibold">When</th>
          </tr>
        </thead>
        <tbody>
          {calls.slice(0, 8).map((call) => (
            <tr
              key={call.id}
              onClick={() => onSelectCall(call.id)}
              className="border-b border-white/6 cursor-pointer hover:bg-white/[0.03]"
            >
              <td className="dashboard-heading px-4 py-3.5 font-semibold">
                {call.contact.firstName} {call.contact.lastName}
              </td>
              <td className="px-4 py-3.5">
                {call.outcome ? (
                  <span className="dashboard-copy inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: OUTCOME_COLORS[call.outcome] }}
                    />
                    {OUTCOME_LABELS[call.outcome]}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Pending</span>
                )}
              </td>
              <td className="dashboard-copy px-4 py-3.5 font-mono">
                {formatDuration(call.duration)}
              </td>
              <td className="px-4 py-3.5">
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
                  <span className="text-xs uppercase tracking-[0.14em] text-slate-500">n/a</span>
                )}
              </td>
              <td className="dashboard-copy px-4 py-3.5">{formatRelativeTime(call.startedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DailyTrendChart({
  data,
}: {
  data: Array<{ date: string; calls: number; conversions: number }>;
}) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(false);
    const timer = window.setTimeout(() => setAnimateIn(true), 60);
    return () => window.clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="surface-card-dark rounded-[28px] p-6">
        <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
          Daily Trend
        </div>
        <div className="dashboard-copy mt-6 rounded-[24px] border border-dashed border-white/10 px-6 py-14 text-center text-sm">
          No trend data available for this period.
        </div>
      </div>
    );
  }

  const maxCalls = Math.max(...data.map((day) => day.calls), 1);

  return (
    <div className="surface-card-dark rounded-[28px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
            Daily Trend
          </div>
          <p className="dashboard-copy mt-2 text-sm leading-6">
            Day-by-day call volume and conversion counts.
          </p>
        </div>

        <div className="dashboard-label flex items-center gap-4 text-xs uppercase tracking-[0.16em]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-[#1F8A84]" />
            Calls
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-[#22c55e]" />
            Conversions
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-end gap-2" style={{ height: 220 }}>
        {data.map((day) => {
          const dateLabel = new Date(day.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const callHeight = Math.max((day.calls / maxCalls) * 150, 8);
          const conversionHeight = Math.max((day.conversions / maxCalls) * 150, 4);

          return (
            <div key={day.date} className="group relative flex flex-1 flex-col items-center gap-2">
              <div className="pointer-events-none absolute -top-12 rounded-full border border-white/10 bg-[#222222] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {dateLabel}: {day.calls} calls, {day.conversions} conversions
              </div>

              <div className="flex w-full items-end justify-center gap-1" style={{ height: 160 }}>
                <div
                  className="w-full max-w-4 rounded-t-full bg-[#1F8A84] transition-all duration-700 ease-out"
                  style={{ height: animateIn ? callHeight : 0 }}
                />
                <div
                  className="w-full max-w-4 rounded-t-full bg-[#22c55e] transition-all duration-700 ease-out"
                  style={{ height: animateIn ? conversionHeight : 0 }}
                />
              </div>

              <div className="dashboard-label text-[10px] uppercase tracking-[0.12em]">
                {dateLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
