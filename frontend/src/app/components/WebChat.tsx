'use client';

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ChatInfoCard,
  ChatMessage,
  ChatQuickReply,
  ChatResponsePayload,
  LeadContext,
} from '@/app/lib/types';
import { LOCATIONS } from '@/app/lib/constants';
import { cn } from '@/app/lib/utils';
import {
  createWelcomeMessage,
  getGoalProfile,
  getRecommendedTier,
} from '@/app/lib/chat-concierge';
import type { AgentPersona } from '@/app/lib/types';
import { transformMessage } from '@/app/lib/persona-transform';

interface WebChatProps {
  leadContext: LeadContext;
}

const OFFER_LABELS: Record<string, string> = {
  'complimentary-consult': 'Complimentary Consultation',
  'new-client-special': 'New Client Special',
  'vip-experience': 'VIP Experience',
};

const QUICK_PROMPTS = [
  'What treatments do you recommend?',
  'What are your hours?',
  'Which tier fits my goals?',
];

function InfoCard({ card }: { card: ChatInfoCard }) {
  return (
    <div
      className={cn(
        'rounded-none border px-4 py-4',
        card.tone === 'teal'
          ? 'border-[#C4B59A]/24 bg-[#f4f1ea]'
          : card.tone === 'green'
            ? 'border-emerald-200 bg-emerald-50/80'
            : 'border-slate-200 bg-white/80',
      )}
    >
      {card.eyebrow && (
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {card.eyebrow}
        </div>
      )}
      <div className="mt-1 text-sm font-semibold text-slate-950">{card.title}</div>
      {card.description && (
        <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
      )}
      {card.bullets && card.bullets.length > 0 && (
        <ul className="mt-3 space-y-2">
          {card.bullets.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#C4B59A]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {card.footer && (
        <div className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {card.footer}
        </div>
      )}
    </div>
  );
}

const ChatBubble = React.memo(function ChatBubble({ msg, agentName }: { msg: ChatMessage; agentName: string }) {
  return (
    <div
      className={cn(
        'flex animate-fade-up',
        msg.role === 'user' ? 'justify-end' : 'justify-start',
      )}
    >
      {msg.role === 'assistant' && (
        <div className="mr-3 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#151515] text-sm font-bold text-white shadow-none">
          {agentName.slice(0, 2)}
        </div>
      )}

      <div
        className={cn(
          'max-w-[88%] break-words whitespace-pre-wrap rounded-none px-4 py-3 text-sm leading-7 shadow-[0_10px_24px_rgba(15,23,42,0.05)]',
          msg.role === 'assistant' && msg.cards?.length ? 'sm:max-w-[90%]' : 'sm:max-w-[78%]',
          msg.role === 'user'
            ? 'rounded-none bg-[#151515] text-white'
            : 'rounded-none border border-slate-200 bg-slate-50 text-slate-900',
        )}
      >
        <div>{msg.content}</div>
        {msg.role === 'assistant' && msg.cards && msg.cards.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {msg.cards.map((card) => (
              <InfoCard key={`${card.title}-${card.eyebrow ?? 'card'}`} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

function MobileLeadSummary({
  leadContext,
  passLabel,
  locationName,
  recommendedTier,
}: {
  leadContext: LeadContext;
  passLabel: string;
  locationName: string;
  recommendedTier: { name: string; price: string };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-none border border-slate-200 bg-white px-4 py-3"
      >
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-slate-900">{leadContext.firstName}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">{recommendedTier.name}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">{leadContext.interest}</span>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={cn('h-4 w-4 text-slate-400 transition-transform', expanded && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {expanded && (
        <div className="rounded-none border border-t-0 border-slate-200 bg-white px-4 py-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">Offer selected</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">{passLabel}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Preferred studio</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">{locationName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Top goal</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">{leadContext.interest}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Recommended tier</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">{recommendedTier.name}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export default function WebChat({ leadContext }: WebChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callBadgeState, setCallBadgeState] = useState<'pulsing' | 'reviewing' | 'sent'>(
    'pulsing',
  );
  const [persona, setPersona] = useState<AgentPersona | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  const passLabel = OFFER_LABELS[leadContext.offerType] || leadContext.offerType;
  const locationInfo = LOCATIONS[leadContext.location];
  const locationName = locationInfo ? locationInfo.name : leadContext.location;
  const goalProfile = useMemo(() => getGoalProfile(leadContext.interest), [leadContext.interest]);
  const recommendedTier = useMemo(
    () => getRecommendedTier(leadContext.interest),
    [leadContext.interest],
  );
  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((msg) => msg.role === 'assistant'),
    [messages],
  );
  const latestQuickReplies = latestAssistantMessage?.quickReplies ?? [];

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetch('/api/persona')
      .then((res) => res.json())
      .then((p: AgentPersona) => {
        setPersona(p);
        const welcome = createWelcomeMessage(leadContext);
        setMessages([transformMessage(welcome, p, 'greeting', true)]);
      })
      .catch(() => {
        setMessages([createWelcomeMessage(leadContext)]);
      });
  }, [leadContext]);

  useEffect(() => {
    const reviewingTimer = setTimeout(() => {
      setCallBadgeState('reviewing');
    }, 12_000);
    const sentTimer = setTimeout(() => {
      setCallBadgeState('sent');
    }, 60_000);

    return () => {
      clearTimeout(reviewingTimer);
      clearTimeout(sentTimer);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const [res] = await Promise.all([
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages:
              updatedMessages.length > 20
                ? updatedMessages.slice(-20).map(({ role, content }) => ({ role, content }))
                : updatedMessages.map(({ role, content }) => ({ role, content })),
            leadContext,
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 450)),
      ]);

      if (!res.ok) throw new Error('Chat request failed');

      const data: ChatResponsePayload = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  function renderQuickReplies(replies: ChatQuickReply[], compact = false) {
    return (
      <div className={cn('flex flex-wrap gap-2', compact && 'gap-1.5')}>
        {replies.map((reply) => (
          <button
            key={reply.label}
            type="button"
            onClick={() => void sendMessage(reply.prompt)}
            className={cn(
              'rounded-none border px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#151515]/40 hover:bg-[#f4f1ea]/40 hover:text-slate-900',
              compact ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50',
            )}
          >
            {reply.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <div className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-[11px] uppercase tracking-[0.34em] sm:px-6">
          <span className="font-semibold text-white/92">NakedMD</span>
          <span className="hidden text-white/60 md:inline">Offer confirmed · concierge live</span>
        </div>
      </div>

      <div className="border-b border-white/10 bg-[#151515] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src="/nmd-logo-white.png"
              alt="NakedMD"
              width={85}
              height={48}
              className="h-12 w-auto drop-shadow-none"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                NakedMD Concierge
              </div>
              <h1 className="truncate text-xl font-extrabold tracking-tight">Chat with {persona?.name || 'Vi'}</h1>
            </div>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-none border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]',
              callBadgeState === 'pulsing'
                ? 'animate-pulse-badge border-[#C4B59A]/50 bg-[#C4B59A]/14 text-[#f4f1ea]'
                : callBadgeState === 'reviewing'
                  ? 'border-sky-400/30 bg-sky-400/12 text-sky-100'
                  : 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200',
            )}
          >
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                callBadgeState === 'pulsing'
                  ? 'bg-[#C4B59A]'
                  : callBadgeState === 'reviewing'
                    ? 'bg-sky-300'
                    : 'bg-emerald-300',
              )}
            />
            {callBadgeState === 'pulsing'
              ? 'Call incoming'
              : callBadgeState === 'reviewing'
                ? 'Team reviewing'
                : 'Team alerted'}
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-117px)] max-w-6xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row">
        <MobileLeadSummary
          leadContext={leadContext}
          passLabel={passLabel}
          locationName={locationName}
          recommendedTier={recommendedTier}
        />
        <aside className="hidden w-full max-w-[300px] shrink-0 flex-col gap-4 lg:flex">
          <div className="surface-card rounded-none p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]">
              Lead Snapshot
            </div>
            <div className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              {leadContext.firstName}
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-slate-400">Offer selected</dt>
                <dd className="mt-1 font-semibold text-slate-900">{passLabel}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Preferred studio</dt>
                <dd className="mt-1 font-semibold text-slate-900">{locationName}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Top goal</dt>
                <dd className="mt-1 font-semibold text-slate-900">{leadContext.interest}</dd>
              </div>
            </dl>
          </div>

          <div className="surface-card rounded-none p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]">
              What happens next
            </div>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
              <p>The studio team gets your details immediately for outbound follow-up.</p>
              <p>Vi stays live here to answer objections before the call arrives.</p>
              <p>Your questions help the rep start from context instead of starting cold.</p>
            </div>
          </div>

          <div className="surface-card rounded-none p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]">
              Your treatment plan
            </div>
            <div className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
              {goalProfile.treatments[0]} first
            </div>
            <ul className="mt-4 space-y-3">
              {goalProfile.starterPlan.map((step) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#C4B59A]" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card rounded-none p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#151515]">
              Vi&apos;s recommendation
            </div>
            <div className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
              {recommendedTier.name}
            </div>
            <div className="mt-2 text-sm leading-6 text-slate-600">
              Best fit for {leadContext.interest.toLowerCase()} based on the NakedMD options in this
              demo.
            </div>
            <div className="mt-4 rounded-none bg-[#f4f1ea] px-4 py-4 text-sm font-medium text-[#151515]">
              {recommendedTier.price}
            </div>
          </div>
        </aside>

        <section className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border border-slate-200/80 bg-white">
          <div className="border-b border-slate-200/80 bg-[rgba(244,241,234,0.04)] px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Personalized follow-up
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-600">
                  Ask about treatments, pricing, consultations, hours, or your first visit.
                </div>
              </div>
              <div className="rounded-none bg-[#f4f1ea] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#151515]">
                Enter sends
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
              {renderQuickReplies(
                latestQuickReplies.length > 0
                  ? latestQuickReplies
                  : QUICK_PROMPTS.map((prompt) => ({ label: prompt, prompt })),
                true,
              )}
            </div>
          </div>

          <div className="hide-scrollbar flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f9f7f3_0%,#ffffff_100%)] px-4 py-5 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((msg, index) => (
                <ChatBubble key={`${msg.role}-${index}`} msg={msg} agentName={persona?.name || 'Vi'} />
              ))}

              {isTyping && (
                <div className="flex justify-start animate-fade-up">
                  <div className="mr-3 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-[#151515] text-sm font-bold text-white shadow-none">
                    {(persona?.name || 'Vi').slice(0, 2)}
                  </div>
                  <div className="rounded-none rounded-none border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex gap-1.5">
                      <span
                        className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {!isTyping && (
            <div className="hidden border-t border-slate-200/80 bg-[#f4f1ea] px-4 py-4 sm:px-6 lg:block">
              <div className="mx-auto max-w-3xl">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Suggested next questions
                </div>
                <div className="mt-3">
                  {renderQuickReplies(
                    latestQuickReplies.length > 0
                      ? latestQuickReplies
                      : QUICK_PROMPTS.map((prompt) => ({ label: prompt, prompt })),
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <form
              onSubmit={handleSend}
              className="mx-auto flex max-w-3xl items-end gap-3 pb-[max(0px,env(safe-area-inset-bottom))]"
            >
              <label htmlFor="chat-input" className="sr-only">
                Type a message
              </label>
              <div className="flex-1">
                <input
                  ref={inputRef}
                  id="chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Type a message for ${persona?.name || 'Vi'}...`}
                  disabled={isTyping}
                  className="w-full rounded-none border border-slate-200 bg-slate-50 px-5 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#4C4C4B] disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-none shadow-none',
                  input.trim() && !isTyping
                    ? 'bg-[#151515] text-white hover:-translate-y-0.5 active:translate-y-0'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400 shadow-none',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
