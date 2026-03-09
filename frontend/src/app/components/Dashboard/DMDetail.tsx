'use client';

import { useEffect, useState } from 'react';
import { DMConversation } from '@/app/lib/types';
import { OUTCOME_LABELS, OUTCOME_COLORS, LOCATIONS } from '@/app/lib/constants';
import { formatRelativeTime, getSentimentColor, getSentimentLabel, cn } from '@/app/lib/utils';

interface DMDetailProps {
  dmId: string;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

function InstagramLogoLarge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad-lg" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad-lg)" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad-lg)" strokeWidth="1.8" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad-lg)" />
    </svg>
  );
}

function FacebookLogoLarge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2" />
    </svg>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-none border border-white/8 bg-white/4 p-4">
            <div className="skeleton h-4 w-20 rounded-none" />
            <div className="skeleton mt-3 h-6 rounded-none" />
          </div>
        ))}
      </div>
      <div className="rounded-none border border-white/8 bg-white/4 p-5">
        <div className="skeleton h-4 w-28 rounded-none" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-16 rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DMDetail({ dmId, onClose, theme = 'dark' }: DMDetailProps) {
  const dark = theme === 'dark';
  const [dm, setDm] = useState<DMConversation | null>(null);
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
        const res = await fetch(`/api/dms/${dmId}`);
        if (!res.ok) throw new Error('Failed to load conversation');
        const data: DMConversation = await res.json();
        if (!cancelled) setDm(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchDetail();
    return () => { cancelled = true; };
  }, [dmId]);

  const platformName = dm?.channel === 'instagram' ? 'Instagram' : 'Facebook';
  const PlatformLogo = dm?.channel === 'instagram' ? InstagramLogoLarge : FacebookLogoLarge;

  return (
    <>
      <button
        type="button"
        aria-label="Close conversation detail"
        className={cn('fixed inset-0 z-40 backdrop-blur-sm', dark ? 'bg-black/70' : 'bg-black/30')}
        onClick={onClose}
      />

      <aside className={cn(
        'fixed inset-y-0 right-0 z-50 w-full overflow-hidden border-l animate-slide-in-right sm:max-w-2xl',
        dark
          ? 'border-white/10 bg-[#151515] text-white shadow-[0_0_60px_rgba(0,0,0,0.45)]'
          : 'border-[#E0DEDB] bg-[#fdfcfa] text-gray-900 shadow-[0_0_60px_rgba(0,0,0,0.12)]',
      )}>
        <div className="flex h-full flex-col">
          <div className={cn(
            'border-b px-5 py-5 sm:px-6',
            dark ? 'border-white/8 bg-[rgba(244,241,234,0.06)]' : 'border-[#E0DEDB] bg-gradient-to-b from-[#f4f1ea]/40 to-transparent',
          )}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {dm && <PlatformLogo className="h-5 w-5" />}
                  <div className={cn('text-xs font-semibold uppercase tracking-[0.22em]', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                    {dm ? `${platformName} DM` : 'Conversation Detail'}
                  </div>
                </div>
                {dm ? (
                  <>
                    <h2 className={cn('mt-2 text-2xl font-black tracking-tight', dark ? 'text-white' : 'text-gray-900')}>
                      {dm.contact.firstName} {dm.contact.lastName}
                    </h2>
                    <p className={cn('mt-1 text-sm', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                      {dm.contact.handle}
                    </p>
                  </>
                ) : (
                  <div className="skeleton mt-3 h-7 w-56 rounded-none" />
                )}
              </div>

              <button
                onClick={onClose}
                className={cn(
                  'rounded-none border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
                  dark
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/18 hover:bg-white/10 hover:text-white'
                    : 'border-[#E0DEDB] bg-[#f4f1ea]/40 text-[#6B5E4E] hover:border-[#C4B59A] hover:bg-[#E0DEDB] hover:text-[#3D342A]',
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
                'flex min-h-[320px] items-center justify-center rounded-none border px-6 text-center text-sm',
                dark ? 'border-red-400/20 bg-red-400/8 text-red-200' : 'border-red-200 bg-red-50 text-red-600',
              )}>
                {error}
              </div>
            )}

            {!loading && !error && dm && (
              <div className="space-y-6">
                {/* Metadata */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Platform', value: platformName },
                    { label: 'Location', value: LOCATIONS[dm.location]?.name.replace('NakedMD ', '') ?? dm.location },
                    { label: 'Messages', value: `${dm.messageCount} messages` },
                    { label: 'Started', value: new Date(dm.startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) },
                  ].map((meta) => (
                    <div key={meta.label} className={cn('rounded-none border p-4', dark ? 'border-white/8 bg-white/4' : 'border-[#E0DEDB] bg-[#f4f1ea]/30')}>
                      <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                        {meta.label}
                      </div>
                      <div className={cn('mt-2 flex items-center gap-2 text-lg font-semibold', dark ? 'text-white' : 'text-gray-900')}>
                        {meta.label === 'Platform' && <PlatformLogo className="h-5 w-5" />}
                        {meta.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Outcome & Sentiment */}
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className={cn('rounded-none border p-5', dark ? 'border-white/8 bg-white/4' : 'border-[#E0DEDB] bg-[#f4f1ea]/30')}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                        Outcome
                      </span>
                      {dm.outcome ? (
                        <span className={cn(
                          'inline-flex items-center gap-2 rounded-none border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]',
                          dark ? 'border-white/10 bg-white/5 text-white' : 'border-[#E0DEDB] bg-white text-gray-900',
                        )}>
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: OUTCOME_COLORS[dm.outcome] }} />
                          {OUTCOME_LABELS[dm.outcome]}
                        </span>
                      ) : (
                        <span className={cn('text-sm', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>Pending</span>
                      )}
                    </div>

                    {dm.sentiment !== null && (
                      <div className="mt-5 flex items-center gap-3">
                        <span className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                          Sentiment
                        </span>
                        <span className="text-2xl font-black" style={{ color: getSentimentColor(dm.sentiment) }}>
                          {dm.sentiment}
                        </span>
                        <span
                          className="rounded-none px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                          style={{
                            color: getSentimentColor(dm.sentiment),
                            backgroundColor: `${getSentimentColor(dm.sentiment)}18`,
                          }}
                        >
                          {getSentimentLabel(dm.sentiment)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={cn('rounded-none border p-5', dark ? 'border-white/8 bg-white/4' : 'border-[#E0DEDB] bg-[#f4f1ea]/30')}>
                    <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                      AI Summary
                    </div>
                    <div className={cn(
                      'mt-4 rounded-none border p-4 text-sm leading-7',
                      dark ? 'border-white/8 bg-[#1e1e1e] text-slate-300' : 'border-[#E0DEDB] bg-[#fdfcfa] text-[#4A3F33]',
                    )}>
                      {dm.summary || 'No summary available.'}
                    </div>

                    {dm.keyMoments && dm.keyMoments.length > 0 && (
                      <div className="mt-5">
                        <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                          Key Moments
                        </div>
                        <ul className="mt-3 space-y-2">
                          {dm.keyMoments.map((moment, index) => (
                            <li key={index} className={cn('flex items-start gap-3 text-sm leading-6', dark ? 'text-slate-300' : 'text-[#4A3F33]')}>
                              <span className="mt-2 h-2 w-2 rounded-full bg-[#C4B59A]" />
                              <span>{moment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conversation thread */}
                <div className={cn('rounded-none border p-5', dark ? 'border-white/8 bg-white/4' : 'border-[#E0DEDB] bg-[#f4f1ea]/30')}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PlatformLogo className="h-4 w-4" />
                      <div className={cn('text-[11px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-slate-400' : 'text-[#8B7D6B]')}>
                        Conversation
                      </div>
                    </div>
                    <div className={cn('text-xs uppercase tracking-[0.16em]', dark ? 'text-slate-500' : 'text-[#A69A80]')}>
                      {dm.messages.length} message{dm.messages.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {dm.messages.map((msg, index) => {
                      const isAgent = msg.sender === 'agent';
                      const time = new Date(msg.timestamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      });

                      return (
                        <div key={index} className={cn('flex flex-col', isAgent ? 'items-start' : 'items-end')}>
                          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                            {isAgent ? (
                              <>
                                <span className="text-[#C4B59A]">Vi</span>
                                <PlatformLogo className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <PlatformLogo className="h-3 w-3" />
                                <span className={dark ? 'text-slate-400' : 'text-[#8B7D6B]'}>
                                  {dm.contact.firstName}
                                </span>
                              </>
                            )}
                            <span className={dark ? 'text-slate-500' : 'text-[#A69A80]'}>{time}</span>
                          </div>
                          <div
                            className={cn(
                              'max-w-[88%] rounded-none px-4 py-3 text-sm leading-7 sm:max-w-[78%]',
                              isAgent
                                ? dark
                                  ? 'bg-[rgba(244,241,234,0.12)] text-white'
                                  : 'bg-gradient-to-br from-amber-50 to-amber-100/60 text-gray-900'
                                : dm.channel === 'instagram'
                                  ? dark
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/20 text-slate-200'
                                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/40 text-[#4A3F33]'
                                  : dark
                                    ? 'bg-[#1877F2]/15 border border-[#1877F2]/20 text-slate-200'
                                    : 'bg-blue-50 border border-blue-200/40 text-[#4A3F33]',
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
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
