'use client';

import { useEffect, useState } from 'react';
import { OutcomeType } from '@/app/lib/types';
import { OUTCOME_LABELS, OUTCOME_COLORS } from '@/app/lib/constants';
import Tooltip from './Tooltip';

interface OutcomeDistributionProps {
  distribution: Record<OutcomeType, number>;
}

export default function OutcomeDistribution({ distribution }: OutcomeDistributionProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(false);
    const timer = window.setTimeout(() => setAnimateIn(true), 60);
    return () => window.clearTimeout(timer);
  }, [distribution]);

  const sorted = (Object.entries(distribution) as [OutcomeType, number][])
    .sort((a, b) => b[1] - a[1]);

  const maxCount = Math.max(...sorted.map(([, count]) => count), 1);

  return (
    <div className="surface-card-dark rounded-none p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Tooltip text="How calls are classified across 14 outcomes. Green = conversion, amber = nurture, gray/red = lost.">
            <span className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
              Outcome Distribution
            </span>
          </Tooltip>
          <p className="dashboard-copy mt-2 text-sm leading-6">
            14-outcome classification across all calls this period.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map(([outcome, count]) => {
          const widthPct = Math.max((count / maxCount) * 100, 4);

          return (
            <div key={outcome} className="grid grid-cols-[minmax(0,154px)_1fr_44px] items-center gap-3">
              <div className="dashboard-copy text-sm">{OUTCOME_LABELS[outcome]}</div>

              <div className="h-5 overflow-hidden bg-white/6">
                <div
                  className="h-full rounded-none transition-all duration-700 ease-out"
                  style={{
                    width: animateIn ? `${widthPct}%` : '0%',
                    background: `linear-gradient(90deg, ${OUTCOME_COLORS[outcome]} 0%, ${OUTCOME_COLORS[outcome]}CC 100%)`,
                  }}
                />
              </div>

              <div className="dashboard-copy text-right text-sm font-semibold">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
