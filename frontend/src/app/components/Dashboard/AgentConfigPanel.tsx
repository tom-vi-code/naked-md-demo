'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_PERSONA, LANGUAGES } from '@/app/lib/constants';
import { cn } from '@/app/lib/utils';
import type { AgentPersona, ResponseStyle } from '@/app/lib/types';

interface AgentConfigPanelProps {
  theme: 'dark' | 'light';
}

const STYLE_OPTIONS: { value: ResponseStyle; label: string; description: string }[] = [
  { value: 'concise', label: 'Concise', description: 'Short, punchy replies' },
  { value: 'conversational', label: 'Conversational', description: 'Natural, friendly tone' },
  { value: 'detailed', label: 'Detailed', description: 'Thorough explanations' },
];

function Slider({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
  tooltip,
  theme,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  tooltip: string;
  theme: 'dark' | 'light';
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="relative flex items-center gap-1.5">
          <label className={cn('text-sm font-semibold', theme === 'dark' ? 'text-slate-200' : 'text-slate-700')}>
            {label}
          </label>
          <button
            type="button"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            onClick={() => setShowTip((p) => !p)}
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-none text-[10px] font-bold leading-none',
              theme === 'dark'
                ? 'bg-white/8 text-slate-400 hover:bg-white/14'
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300',
            )}
            aria-label={`Info about ${label}`}
          >
            ?
          </button>
          {showTip && (
            <div className={cn(
              'absolute left-0 top-full z-10 mt-2 w-56 rounded-none border px-3 py-2.5 text-xs leading-5 shadow-lg',
              theme === 'dark'
                ? 'border-white/10 bg-[#282828] text-slate-300'
                : 'border-slate-200 bg-white text-slate-600',
            )}>
              {tooltip}
            </div>
          )}
        </div>
        <span className={cn('text-xs font-mono tabular-nums', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[#C4B59A]"
      />
      <div className="mt-1 flex justify-between">
        <span className={cn('text-[10px] uppercase tracking-[0.16em]', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
          {lowLabel}
        </span>
        <span className={cn('text-[10px] uppercase tracking-[0.16em]', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
          {highLabel}
        </span>
      </div>
    </div>
  );
}

export default function AgentConfigPanel({ theme }: AgentConfigPanelProps) {
  const [persona, setPersona] = useState<AgentPersona>(DEFAULT_PERSONA);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);
  const changeCountRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    fetch('/api/persona')
      .then((res) => res.json())
      .then((data: AgentPersona) => { if (mountedRef.current) setPersona(data); })
      .catch(() => {});
    return () => {
      mountedRef.current = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const debouncedSave = useCallback((updated: AgentPersona) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaving(true);
      fetch('/api/persona', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
        .then(() => {
          if (!mountedRef.current) return;
          setSaved(true);
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => { if (mountedRef.current) setSaved(false); }, 1500);
        })
        .catch(() => {})
        .finally(() => { if (mountedRef.current) setSaving(false); });
    }, 400);
  }, []);

  function update(patch: Partial<AgentPersona>) {
    const next = { ...persona, ...patch };
    changeCountRef.current += 1;
    setPersona(next);
    debouncedSave(next);
  }

  // Auto-preview: debounce 800ms, skip until the user has made at least one change
  useEffect(() => {
    if (changeCountRef.current === 0) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      setPreviewing(true);
      // Flush persona to server first
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      try {
        await fetch('/api/persona', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(persona),
        });
      } catch {
        // continue even if save fails
      }
      // Fetch preview
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'What treatments do you recommend for me?' }],
            leadContext: {
              firstName: 'Alex',
              offerType: 'complimentary-consult',
              location: 'newport-beach',
              interest: 'General Consultation',
            },
          }),
        });
        const data = await res.json();
        if (mountedRef.current) setPreview(data.message?.content || '');
      } catch {
        if (mountedRef.current) setPreview('Preview unavailable');
      } finally {
        if (mountedRef.current) setPreviewing(false);
      }
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona]);

  function handleReset() {
    fetch('/api/persona', { method: 'DELETE' })
      .then((res) => res.json())
      .then((data: AgentPersona) => {
        if (!mountedRef.current) return;
        setPersona(data);
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => { if (mountedRef.current) setSaved(false); }, 1500);
      })
      .catch(() => {});
  }

  async function handlePreview() {
    // Cancel any pending auto-preview debounce
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    // Flush any pending debounced save so the server has the latest persona (including language)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setPreviewing(true);
    try {
      await fetch('/api/persona', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona),
      });
    } catch {
      // continue with preview even if save fails
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What treatments do you recommend for me?' }],
          leadContext: {
            firstName: 'Alex',
            offerType: 'complimentary-consult',
            location: 'newport-beach',
            interest: 'General Consultation',
          },
        }),
      });
      const data = await res.json();
      if (mountedRef.current) setPreview(data.message?.content || '');
    } catch {
      if (mountedRef.current) setPreview('Preview unavailable');
    } finally {
      if (mountedRef.current) setPreviewing(false);
    }
  }

  const isDark = theme === 'dark';
  const cardClass = cn(
    'rounded-none border p-5',
    isDark ? 'border-white/8 bg-white/[0.03]' : 'border-slate-200 bg-white',
  );
  const inputClass = cn(
    'w-full rounded-none border px-4 py-3 text-sm',
    isDark
      ? 'border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus:border-[#4C4C4B]/50'
      : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[#4C4C4B]',
  );
  const selectClass = cn(
    'w-full rounded-none border px-4 py-3 text-sm appearance-none',
    isDark
      ? 'border-white/10 bg-white/[0.04] text-white focus:border-[#4C4C4B]/50'
      : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#4C4C4B]',
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className={cn('text-xs font-semibold uppercase tracking-[0.22em]', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Agent Configuration
          </div>
          <p className={cn('mt-1 text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
            Customize how the chat concierge sounds and behaves with prospects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(saving || saved) && (
            <span className={cn('text-xs font-semibold uppercase tracking-[0.14em]', saved ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-slate-500')}>
              {saved ? 'Saved' : 'Saving...'}
            </span>
          )}
          <button
            onClick={handleReset}
            className={cn(
              'rounded-none border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]',
              isDark
                ? 'border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            Reset to Default
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Identity */}
        <div className={cardClass}>
          <div className={cn('text-xs font-semibold uppercase tracking-[0.2em]', isDark ? 'text-[#f4f1ea]' : 'text-[#151515]')}>
            Identity
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className={cn('text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-700')}>
                Agent Name
              </label>
              <input
                type="text"
                value={persona.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Vi"
                className={cn(inputClass, 'mt-2')}
              />
            </div>

            <div>
              <label className={cn('text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-700')}>
                Language
              </label>
              <select
                value={persona.language}
                onChange={(e) => update({ language: e.target.value })}
                className={cn(selectClass, 'mt-2')}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={cn('text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-700')}>
                Response Style
              </label>
              <div className="mt-2 flex gap-2">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update({ style: opt.value })}
                    className={cn(
                      'flex-1 rounded-none border px-3 py-3 text-left',
                      persona.style === opt.value
                        ? 'border-[#C4B59A]/40 bg-[#C4B59A]/10'
                        : isDark
                          ? 'border-white/8 bg-white/[0.02] hover:border-white/16'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300',
                    )}
                  >
                    <div className={cn('text-xs font-semibold', persona.style === opt.value ? (isDark ? 'text-[#f4f1ea]' : 'text-[#151515]') : isDark ? 'text-slate-200' : 'text-slate-700')}>
                      {opt.label}
                    </div>
                    <div className={cn('mt-1 text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {opt.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className={cn('text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-700')}>
                  Use Emoji
                </div>
                <div className={cn('mt-0.5 text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Add contextual emoji to responses
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={persona.useEmoji}
                onClick={() => update({ useEmoji: !persona.useEmoji })}
                className={cn(
                  'relative flex h-7 w-12 items-center rounded-full transition-colors',
                  persona.useEmoji ? 'bg-[#151515]' : isDark ? 'bg-white/10' : 'bg-slate-300',
                )}
              >
                <span
                  className={cn(
                    'absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    persona.useEmoji ? 'translate-x-6' : 'translate-x-1',
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Tone */}
        <div className={cardClass}>
          <div className={cn('text-xs font-semibold uppercase tracking-[0.2em]', isDark ? 'text-[#f4f1ea]' : 'text-[#151515]')}>
            Tone
          </div>

          <div className="mt-5 space-y-6">
            <Slider
              label="Warmth"
              value={persona.warmth}
              onChange={(v) => update({ warmth: v })}
              lowLabel="Professional"
              highLabel="Friendly"
              tooltip="Controls how warm the agent sounds. Low keeps replies direct and businesslike. High adds friendly openers and personal touches."
              theme={theme}
            />
            <Slider
              label="Humor"
              value={persona.humor}
              onChange={(v) => update({ humor: v })}
              lowLabel="Straight"
              highLabel="Playful"
              tooltip="Controls playful asides. Low stays straight and factual. High adds light humor and casual commentary."
              theme={theme}
            />
            <Slider
              label="Energy"
              value={persona.energy}
              onChange={(v) => update({ energy: v })}
              lowLabel="Calm"
              highLabel="Enthusiastic"
              tooltip="Controls enthusiasm. Low is calm and measured. High adds exclamation marks and energetic phrases."
              theme={theme}
            />
            <Slider
              label="Formality"
              value={persona.formality}
              onChange={(v) => update({ formality: v })}
              lowLabel="Casual"
              highLabel="Formal"
              tooltip="Controls language register. Low uses casual contractions and relaxed phrasing. High uses polished, professional language."
              theme={theme}
            />
          </div>
        </div>

        {/* Custom phrases */}
        <div className={cardClass}>
          <div className={cn('text-xs font-semibold uppercase tracking-[0.2em]', isDark ? 'text-[#f4f1ea]' : 'text-[#151515]')}>
            Custom Phrases
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className={cn('text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-700')}>
                Custom Greeting
              </label>
              <input
                type="text"
                value={persona.greeting}
                onChange={(e) => update({ greeting: e.target.value })}
                placeholder="Hey there"
                className={cn(inputClass, 'mt-2')}
              />
              <p className={cn('mt-1 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Used as the opening of the welcome message. Leave blank for default.
              </p>
            </div>
            <div>
              <label className={cn('text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-700')}>
                Sign-off
              </label>
              <input
                type="text"
                value={persona.signoff}
                onChange={(e) => update({ signoff: e.target.value })}
                placeholder="Talk soon!"
                className={cn(inputClass, 'mt-2')}
              />
              <p className={cn('mt-1 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                Appended to every response. Leave blank for none.
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div className={cn('text-xs font-semibold uppercase tracking-[0.2em]', isDark ? 'text-[#f4f1ea]' : 'text-[#151515]')}>
              Live Preview
            </div>
            <button
              onClick={handlePreview}
              className="rounded-none bg-[#151515] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-none hover:-translate-y-0.5 active:translate-y-0"
            >
              Test Response
            </button>
          </div>
          <p className={cn('mt-2 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            Sends &quot;What treatments do you recommend for me?&quot; as a test prospect and shows the response with your current settings.
          </p>

          {previewing ? (
            <div className={cn(
              'mt-4 rounded-none border border-dashed px-6 py-10 text-center text-sm',
              isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500',
            )}>
              <div className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating preview...
              </div>
            </div>
          ) : preview ? (
            <div className={cn(
              'mt-4 rounded-none border px-4 py-4 text-sm leading-7',
              isDark ? 'border-white/8 bg-white/[0.02] text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700',
            )}>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-none bg-[#151515] text-[10px] font-bold text-white">
                  {(persona.name || 'Vi').slice(0, 2)}
                </div>
                <span className={cn('text-xs font-semibold', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {persona.name || 'Vi'}
                </span>
              </div>
              {preview}
            </div>
          ) : (
            <div className={cn(
              'mt-4 rounded-none border border-dashed px-6 py-10 text-center text-sm',
              isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400',
            )}>
              Click &quot;Test Response&quot; to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
