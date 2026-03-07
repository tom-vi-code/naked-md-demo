'use client';

import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

interface ConversionFunnelProps {
  funnel: {
    leads: number;
    connected: number;
    engaged: number;
    converted: number;
  };
}

interface FunnelStage {
  label: string;
  count: number;
  tooltip: string;
}

export default function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(false);
    const timer = window.setTimeout(() => setAnimateIn(true), 60);
    return () => window.clearTimeout(timer);
  }, [funnel]);

  const stages: FunnelStage[] = [
    { label: 'Leads', count: funnel.leads, tooltip: 'Total leads from web forms, inbound calls, or manual entry.' },
    { label: 'Connected', count: funnel.connected, tooltip: 'Leads where Vi successfully reached the prospect by phone.' },
    { label: 'Engaged', count: funnel.engaged, tooltip: 'Connected calls where the prospect showed meaningful interest.' },
    { label: 'Converted', count: funnel.converted, tooltip: 'Leads who booked a consultation, purchased a treatment, or bought a package.' },
  ];

  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <div className="surface-card-dark rounded-[28px] p-6">
      <div className="mb-6">
        <Tooltip text="Lead-to-close progression showing how many leads convert at each stage.">
          <span className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
            Conversion Funnel
          </span>
        </Tooltip>
        <p className="dashboard-copy mt-2 text-sm leading-6">
          Lead-to-close progression across all locations.
        </p>
      </div>

      <div className="space-y-5">
        {stages.map((stage, index) => {
          const widthPct = Math.max((stage.count / maxCount) * 100, 12);
          const dropoff =
            index > 0 && stages[index - 1].count > 0
              ? Math.round(((stages[index - 1].count - stage.count) / stages[index - 1].count) * 100)
              : null;

          return (
            <div key={stage.label}>
              {dropoff !== null && (
                <div className="dashboard-label mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em]">
                  <span className="text-red-300">&#9660;</span>
                  <span>{dropoff}% drop-off from prior stage</span>
                </div>
              )}

              <div className="grid grid-cols-[92px_1fr_78px] items-center gap-4">
                <Tooltip text={stage.tooltip}>
                  <span className="dashboard-copy text-sm font-semibold">{stage.label}</span>
                </Tooltip>
                <div className="overflow-hidden rounded-full bg-white/6">
                  <div
                    className="flex h-12 items-center rounded-full bg-[linear-gradient(90deg,#1F8A84_0%,#187F80_100%)] pl-5 text-sm font-semibold text-white transition-all duration-700 ease-out"
                    style={{ width: animateIn ? `${widthPct}%` : '0%' }}
                  >
                    {animateIn ? stage.count.toLocaleString() : ''}
                  </div>
                </div>
                <div className="dashboard-value text-right text-xl font-black tracking-tight">
                  {stage.count.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
