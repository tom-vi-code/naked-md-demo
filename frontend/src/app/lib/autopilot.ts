import { LOCATIONS, OUTCOME_LABELS } from './constants';
import type {
  AnalyticsResponse,
  CallDetailResponse,
  CallSummary,
  OrchestratorResponse,
  OutcomeType,
} from './types';

export type QueueStatus = 'handled' | 'needs-you';

export interface AutopilotResolution {
  status: QueueStatus;
  statusLabel: string;
  whatHappened: string;
  aiDid: string;
  nextStep: string;
}

const NEEDS_ATTENTION_OUTCOMES = new Set<OutcomeType>(['declined', 'tech-issue']);
const RECOVERY_OUTCOMES = new Set<OutcomeType>([
  'callback-requested',
  'info-sent',
  'info-provided',
  'nurture',
  'no-answer',
  'voicemail',
]);

export function formatLocationShort(location: string): string {
  return LOCATIONS[location]?.name.replace('NakedMD ', '') ?? location;
}

export function needsManagerReview(
  outcome: OutcomeType | null,
  sentiment: number | null,
): boolean {
  return (
    (outcome !== null && NEEDS_ATTENTION_OUTCOMES.has(outcome)) ||
    (sentiment !== null && sentiment < 45)
  );
}

function formatShortTime(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getOutcomeAction(
  outcome: OutcomeType | null,
  completedAt?: string | null,
): string {
  const atTime = formatShortTime(completedAt);
  const withTime = atTime ? ` at ${atTime}` : '';

  switch (outcome) {
    case 'consultation-booked':
      return `Booked a consultation and sent the confirmation${withTime}.`;
    case 'treatment-sold':
      return `Closed a treatment sale and sent payment details${withTime}.`;
    case 'package-sold':
      return `Sold a treatment package and sent the summary${withTime}.`;
    case 'referral-generated':
      return `Generated a referral and sent introduction details${withTime}.`;
    case 'appointment-scheduled':
      return `Scheduled an appointment and sent the reminder${withTime}.`;
    case 'callback-requested':
      return `Logged a callback request and queued follow-up${withTime}.`;
    case 'info-sent':
      return `Sent treatment information via text${withTime}.`;
    case 'info-provided':
      return `Provided detailed treatment info during the call${withTime}.`;
    case 'nurture':
      return `Added to nurture sequence with next touch scheduled for${withTime}.`;
    case 'no-answer':
      return `No answer — queued a text follow-up${withTime}.`;
    case 'voicemail':
      return `Left a voicemail and queued a text follow-up${withTime}.`;
    case 'declined':
      return `Prospect declined — marked inactive${withTime}.`;
    case 'tech-issue':
      return `Technical issue encountered — flagged for review${withTime}.`;
    case 'win-back-success':
      return `Win-back successful — reactivated account${withTime}.`;
    default:
      return `Finished processing the conversation${withTime}.`;
  }
}

function getWhatHappened(
  outcome: OutcomeType | null,
  summary?: string | null,
): string {
  if (summary && summary.trim().length > 0) {
    return summary.trim();
  }

  if (!outcome) {
    return 'This conversation is still being processed.';
  }

  switch (outcome) {
    case 'callback-requested':
      return 'The lead wanted to talk later instead of deciding on the spot.';
    case 'info-provided':
      return 'The lead asked questions and needed more detail before taking the next step.';
    case 'nurture':
      return 'The lead showed interest but was not ready to commit during the call.';
    case 'no-answer':
      return 'The lead did not answer the call.';
    case 'voicemail':
      return 'The call went to voicemail.';
    case 'declined':
      return 'The lead pushed back and the conversation needs human judgment.';
    case 'tech-issue':
      return 'A technical issue interrupted the conversation.';
    default:
      return `The call ended as ${OUTCOME_LABELS[outcome].toLowerCase()}.`;
  }
}

export function getAutopilotResolution(input: {
  outcome: OutcomeType | null;
  sentiment: number | null;
  summary?: string | null;
  completedAt?: string | null;
}): AutopilotResolution {
  const status = needsManagerReview(input.outcome, input.sentiment)
    ? 'needs-you'
    : 'handled';

  return {
    status,
    statusLabel: status === 'needs-you' ? 'Needs You' : 'Handled',
    whatHappened: getWhatHappened(input.outcome, input.summary),
    aiDid: getOutcomeAction(input.outcome, input.completedAt),
    nextStep:
      status === 'needs-you'
        ? 'Review this conversation and decide whether to follow up personally.'
        : input.outcome !== null && RECOVERY_OUTCOMES.has(input.outcome)
          ? 'No action needed unless the lead goes quiet again.'
          : 'No action needed right now.',
  };
}

export function getSummaryResolution(call: CallSummary): AutopilotResolution {
  return getAutopilotResolution({
    outcome: call.outcome,
    sentiment: call.sentiment,
  });
}

export function getDetailResolution(call: CallDetailResponse): AutopilotResolution {
  return getAutopilotResolution({
    outcome: call.outcome,
    sentiment: call.sentiment,
    summary: call.summary,
    completedAt: call.timestamps.smsFollowUpSent ?? call.timestamps.summaryGenerated,
  });
}

function queuePriority(call: Pick<CallSummary, 'outcome' | 'sentiment' | 'startedAt'>): number {
  let score = 0;
  if (needsManagerReview(call.outcome, call.sentiment)) score += 100;
  if (call.outcome !== null && RECOVERY_OUTCOMES.has(call.outcome)) score += 40;
  if (call.sentiment !== null) score += Math.max(0, 60 - call.sentiment);
  score += new Date(call.startedAt).getTime() / 1_000_000_000_000;
  return score;
}

export function sortActionQueueCalls<T extends Pick<CallSummary, 'outcome' | 'sentiment' | 'startedAt'>>(
  calls: T[],
): T[] {
  return [...calls].sort((a, b) => queuePriority(b) - queuePriority(a));
}

export function getAutopilotCounts(
  analytics: AnalyticsResponse,
  orchestrator: OrchestratorResponse | null,
) {
  const recentNeedsYou = analytics.recentCalls.filter((call) =>
    needsManagerReview(call.outcome, call.sentiment),
  ).length;
  const handledCount = Math.max(0, analytics.kpis.totalCalls - analytics.kpis.escalations);
  const bookedCount = analytics.kpis.consultationsBooked;
  const nurtureCount = [
    'callback-requested',
    'info-sent',
    'info-provided',
    'nurture',
    'no-answer',
    'voicemail',
  ].reduce((total, outcome) => total + (analytics.outcomeDistribution[outcome as OutcomeType] ?? 0), 0);
  const needsYouCount = Math.max(recentNeedsYou, analytics.kpis.escalations);
  const preventedCount = orchestrator?.stats.leakagePrevented ?? 0;

  return {
    handledCount,
    bookedCount,
    nurtureCount,
    needsYouCount,
    preventedCount,
  };
}
