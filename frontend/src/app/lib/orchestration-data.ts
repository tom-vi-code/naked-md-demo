import { getAllCalls, getContactForCall } from './seed-data';
import type {
  OrchestrationRecord,
  OrchestrationEvent,
  OrchestratorStats,
  OrchestratorResponse,
  ChannelType,
  ChannelFinalStatus,
  OutcomeType,
} from './types';

// ---------------------------------------------------------------------------
// Deterministic PRNG (separate seed from main seed-data)
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(137);

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

const NON_CONNECT_OUTCOMES: OutcomeType[] = ['no-answer', 'voicemail', 'tech-issue'];

// ---------------------------------------------------------------------------
// Determine which channel "wins" for each lead
// ---------------------------------------------------------------------------
function getWinningChannel(outcome: OutcomeType): ChannelType {
  if (outcome === 'tech-issue') return 'chat';
  if (outcome === 'no-answer' || outcome === 'voicemail') {
    return rng() > 0.45 ? 'sms' : 'chat';
  }
  const r = rng();
  if (r < 0.55) return 'voice';
  if (r < 0.78) return 'sms';
  return 'chat';
}

// ---------------------------------------------------------------------------
// Build the event timeline for a single lead
// ---------------------------------------------------------------------------
function buildEvents(
  winner: ChannelType,
  outcome: OutcomeType,
): {
  events: OrchestrationEvent[];
  firstResponseMs: number;
  channels: Record<ChannelType, ChannelFinalStatus>;
} {
  const events: OrchestrationEvent[] = [];
  const isVoiceFailed = NON_CONNECT_OUTCOMES.includes(outcome);

  // t=0: all channels launch simultaneously
  events.push({ channel: 'sms', action: 'launched', offsetMs: 0, detail: 'Intro SMS queued' });
  events.push({ channel: 'chat', action: 'launched', offsetMs: 200, detail: 'Chat session initialized' });
  events.push({ channel: 'voice', action: 'launched', offsetMs: 400, detail: 'Outbound call initiated' });

  // SMS delivers fast
  const smsDeliveredMs = 800 + randInt(200, 1400);
  events.push({ channel: 'sms', action: 'delivered', offsetMs: smsDeliveredMs, detail: 'SMS delivered to handset' });

  // Chat ready
  events.push({ channel: 'chat', action: 'ready', offsetMs: 600, detail: 'Chat widget ready' });

  // Voice ringing
  const ringMs = 2500 + randInt(500, 3000);
  events.push({ channel: 'voice', action: 'ringing', offsetMs: ringMs, detail: 'Phone ringing' });

  let firstResponseMs: number;
  const channels: Record<ChannelType, ChannelFinalStatus> = {
    voice: 'suppressed',
    sms: 'suppressed',
    chat: 'suppressed',
  };

  if (winner === 'voice') {
    const connectMs = ringMs + 2000 + randInt(1000, 4000);
    events.push({ channel: 'voice', action: 'connected', offsetMs: connectMs, detail: 'Call answered' });
    firstResponseMs = connectMs;

    const engageMs = connectMs + 1500 + randInt(500, 2500);
    events.push({
      channel: 'voice',
      action: 'engaged',
      offsetMs: engageMs,
      detail: 'Conversation started',
    });

    events.push({
      channel: 'sms',
      action: 'suppressed',
      offsetMs: engageMs + 500,
      detail: 'SMS thread paused -voice engaged',
    });
    events.push({
      channel: 'chat',
      action: 'suppressed',
      offsetMs: engageMs + 500,
      detail: 'Chat suppressed -voice engaged',
    });

    channels.voice = 'engaged';
    channels.sms = 'suppressed';
    channels.chat = 'suppressed';
  } else if (winner === 'sms') {
    const replyMs = smsDeliveredMs + randInt(8000, 52000);
    events.push({ channel: 'sms', action: 'engaged', offsetMs: replyMs, detail: 'Lead replied to SMS' });
    firstResponseMs = replyMs;

    if (isVoiceFailed) {
      const failMs = ringMs + randInt(15000, 25000);
      events.push({
        channel: 'voice',
        action: 'failed',
        offsetMs: failMs,
        detail: outcome === 'voicemail' ? 'Went to voicemail' : 'No answer',
      });
      channels.voice = 'failed';
    } else {
      events.push({
        channel: 'voice',
        action: 'suppressed',
        offsetMs: replyMs + 1000,
        detail: 'Call cancelled -SMS engaged first',
      });
      channels.voice = 'suppressed';
    }

    events.push({
      channel: 'chat',
      action: 'repurposed',
      offsetMs: replyMs + 500,
      detail: 'Chat repurposed to async support',
    });

    channels.sms = 'engaged';
    channels.chat = 'repurposed';
  } else {
    // chat wins
    const chatMs = randInt(3000, 18000);
    events.push({
      channel: 'chat',
      action: 'engaged',
      offsetMs: chatMs,
      detail: 'Lead sent first chat message',
    });
    firstResponseMs = chatMs;

    if (isVoiceFailed) {
      const failMs = ringMs + randInt(15000, 25000);
      events.push({
        channel: 'voice',
        action: 'failed',
        offsetMs: failMs,
        detail: 'No answer -call ended',
      });
      channels.voice = 'failed';
    } else {
      events.push({
        channel: 'voice',
        action: 'suppressed',
        offsetMs: chatMs + 1000,
        detail: 'Call cancelled -chat engaged first',
      });
      channels.voice = 'suppressed';
    }

    events.push({
      channel: 'sms',
      action: 'repurposed',
      offsetMs: chatMs + 500,
      detail: 'SMS repurposed to confirmation',
    });

    channels.chat = 'engaged';
    channels.sms = 'repurposed';
  }

  events.sort((a, b) => a.offsetMs - b.offsetMs);
  return { events, firstResponseMs, channels };
}

// ---------------------------------------------------------------------------
// Build all orchestration records at module load time
// ---------------------------------------------------------------------------
function buildOrchestrationData(): OrchestratorResponse {
  const calls = getAllCalls();
  const records: OrchestrationRecord[] = [];

  let totalFirstResponseMs = 0;
  let engagedCount = 0;
  let leakagePrevented = 0;
  let duplicatesSuppressed = 0;
  const channelWins: Record<ChannelType, number> = { voice: 0, sms: 0, chat: 0 };

  for (const call of calls) {
    const contact = getContactForCall(call.id);
    if (!contact || !call.outcome) continue;

    const winner = getWinningChannel(call.outcome);
    const { events, firstResponseMs, channels } = buildEvents(winner, call.outcome);

    channelWins[winner]++;
    totalFirstResponseMs += firstResponseMs;
    engagedCount++;

    if (NON_CONNECT_OUTCOMES.includes(call.outcome) && winner !== 'voice') {
      leakagePrevented++;
    }

    const suppressedCount = Object.values(channels).filter((s) => s === 'suppressed').length;
    duplicatesSuppressed += suppressedCount;

    records.push({
      id: `orch-${call.id}`,
      leadId: call.leadId,
      leadName: `${contact.firstName} ${contact.lastName}`,
      location: call.location,
      interest: contact.interest,
      outcome: call.outcome,
      winningChannel: winner,
      firstResponseMs,
      channels,
      events,
      startedAt: call.startedAt,
    });
  }

  const stats: OrchestratorStats = {
    totalLeads: records.length,
    engagementRate: records.length > 0 ? +((engagedCount / records.length) * 100).toFixed(1) : 0,
    avgFirstResponseMs: engagedCount > 0 ? Math.round(totalFirstResponseMs / engagedCount) : 0,
    channelWins,
    leakagePrevented,
    duplicatesSuppressed,
  };

  return { stats, records };
}

const ORCHESTRATION_DATA = buildOrchestrationData();

export function getOrchestratorData(): OrchestratorResponse {
  return ORCHESTRATION_DATA;
}
