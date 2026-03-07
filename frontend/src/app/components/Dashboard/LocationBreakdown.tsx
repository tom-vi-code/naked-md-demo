'use client';

import { LocationStats } from '@/app/lib/types';
import { OUTCOME_LABELS, OUTCOME_COLORS } from '@/app/lib/constants';
import Tooltip from './Tooltip';

interface LocationBreakdownProps {
  newportBeach: LocationStats;
  beverlyHills: LocationStats;
  scottsdale: LocationStats;
}

function LocationCard({ stats }: { stats: LocationStats }) {
  return (
    <div className="surface-card-dark rounded-[28px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
            Location
          </div>
          <h4 className="dashboard-heading mt-2 text-2xl font-black tracking-tight">
            {stats.name.replace('NakedMD ', '')}
          </h4>
        </div>
        <div className="dashboard-label rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
          {stats.totalCalls} calls
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
          <div className="dashboard-label text-[11px] font-semibold uppercase tracking-[0.16em]">
            Total Calls
          </div>
          <div className="dashboard-value mt-2 text-3xl font-black tracking-tight">
            {stats.totalCalls}
          </div>
        </div>
        <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
          <Tooltip text="Percentage of dialed calls where the prospect picked up.">
            <span className="dashboard-label text-[11px] font-semibold uppercase tracking-[0.16em]">
              Connect Rate
            </span>
          </Tooltip>
          <div className="dashboard-value mt-2 text-3xl font-black tracking-tight">
            {stats.connectRate.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="dashboard-label mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em]">
          <Tooltip text="Proportion of dialed calls that resulted in a live conversation.">
            <span>Connect performance</span>
          </Tooltip>
          <span>{stats.connectRate.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/8">
          <div
            className="h-2 rounded-full bg-[linear-gradient(90deg,#1F8A84_0%,#187F80_100%)]"
            style={{ width: `${Math.min(stats.connectRate, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <Tooltip text="The three most common call results at this location.">
          <span className="dashboard-label text-[11px] font-semibold uppercase tracking-[0.16em]">
            Top Outcomes
          </span>
        </Tooltip>
        <div className="mt-4 space-y-3">
          {stats.topOutcomes.slice(0, 3).map((item) => (
            <div key={item.outcome} className="flex items-center justify-between gap-4">
              <span className="dashboard-copy inline-flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: OUTCOME_COLORS[item.outcome] }}
                />
                {OUTCOME_LABELS[item.outcome]}
              </span>
              <span className="dashboard-copy rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-semibold">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LocationBreakdown({
  newportBeach,
  beverlyHills,
  scottsdale,
}: LocationBreakdownProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <Tooltip text="Side-by-side performance comparison across NakedMD studios.">
            <span className="dashboard-label text-xs font-semibold uppercase tracking-[0.22em]">
              Location Breakdown
            </span>
          </Tooltip>
          <p className="dashboard-copy mt-2 text-sm leading-6">
            Performance across NakedMD studio locations.
          </p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <LocationCard stats={newportBeach} />
        <LocationCard stats={beverlyHills} />
        <LocationCard stats={scottsdale} />
      </div>
    </div>
  );
}
