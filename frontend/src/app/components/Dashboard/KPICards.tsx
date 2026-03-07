'use client';

import { useEffect, useMemo, useRef } from 'react';
import { KPIs } from '@/app/lib/types';
import { formatDuration } from '@/app/lib/utils';
import Tooltip from './Tooltip';

interface KPICardsProps {
  kpis: KPIs;
}

interface KPICard {
  icon: string;
  label: string;
  value: number;
  accent: string;
  formatter: (value: number) => string;
  tooltip: string;
}

function AnimatedMetric({
  value,
  formatter,
}: {
  value: number;
  formatter: (value: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startTime: number | null = null;
    let frame: number;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatter(value * eased);
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value, formatter]);

  return <span ref={ref}>{formatter(0)}</span>;
}

export default function KPICards({ kpis }: KPICardsProps) {
  const cards = useMemo<KPICard[]>(() => [
    {
      icon: '01',
      label: 'Total Calls',
      value: kpis.totalCalls,
      accent: 'from-[#C5A572] to-[#B8944A]',
      formatter: (value) => Math.round(value).toLocaleString(),
      tooltip: 'Total inbound and outbound calls across both locations in the selected period.',
    },
    {
      icon: '02',
      label: 'Connect Rate',
      value: kpis.connectRate,
      accent: 'from-emerald-400 to-emerald-600',
      formatter: (value) => `${value.toFixed(1)}%`,
      tooltip: 'Percentage of calls where the prospect answered and a live conversation occurred.',
    },
    {
      icon: '03',
      label: 'Avg Duration',
      value: kpis.avgDuration,
      accent: 'from-cyan-400 to-sky-600',
      formatter: (value) => formatDuration(Math.round(value)),
      tooltip: 'Average length of connected calls, excluding unanswered and voicemail.',
    },
    {
      icon: '04',
      label: 'Consultations Booked',
      value: kpis.consultationsBooked,
      accent: 'from-amber-300 to-amber-500',
      formatter: (value) => Math.round(value).toLocaleString(),
      tooltip: 'Prospects who booked a consultation during their call.',
    },
    {
      icon: '05',
      label: 'Conversion Rate',
      value: kpis.conversionRate,
      accent: 'from-lime-300 to-emerald-500',
      formatter: (value) => `${value.toFixed(1)}%`,
      tooltip: 'Percentage of connected calls that resulted in a consultation, treatment, or package sale.',
    },
    {
      icon: '06',
      label: 'Escalations',
      value: kpis.escalations,
      accent: 'from-rose-400 to-red-500',
      formatter: (value) => Math.round(value).toLocaleString(),
      tooltip: 'Calls transferred to a human manager due to complex issues or complaints.',
    },
    {
      icon: '07',
      label: 'Avg Sentiment',
      value: kpis.avgSentiment,
      accent: 'from-violet-400 to-indigo-500',
      formatter: (value) => `${Math.round(value)}/100`,
      tooltip: 'AI-scored caller satisfaction from 0 (negative) to 100 (positive), based on tone and language.',
    },
  ], [kpis.totalCalls, kpis.connectRate, kpis.avgDuration, kpis.consultationsBooked, kpis.conversionRate, kpis.escalations, kpis.avgSentiment]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {cards.map((card) => (
        <div
          key={card.label}
          className="surface-card-dark group overflow-visible rounded-[24px] p-5 hover:-translate-y-0.5 hover:border-white/12"
        >
          <div className="overflow-hidden rounded-t-[24px] -mx-5 -mt-5 px-5 pt-5">
            <div className={`h-1 w-full rounded-full bg-gradient-to-r ${card.accent}`} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Tooltip text={card.tooltip}>
              <span className="dashboard-label text-xs font-semibold uppercase tracking-[0.2em]">
                {card.label}
              </span>
            </Tooltip>
            <div className="dashboard-label rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold">
              {card.icon}
            </div>
          </div>

          <div className="dashboard-value mt-5 text-3xl font-black tracking-tight">
            <AnimatedMetric value={card.value} formatter={card.formatter} />
          </div>
        </div>
      ))}
    </div>
  );
}
