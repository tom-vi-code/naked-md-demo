import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DMMessage {
  sender: 'agent' | 'prospect';
  text: string;
  timestamp: string;
}

export interface TrackedDM {
  id: string;
  channel: 'instagram' | 'facebook';
  contact: { firstName: string; lastName: string; handle: string };
  location: string;
  outcome: string | null;
  sentiment: number | null;
  messageCount: number;
  lastMessageAt: string;
  startedAt: string;
  summary: string | null;
  keyMoments: string[] | null;
  messages: DMMessage[];
}

export interface WebhookPayload {
  name: string;
  ig_handle: string;
  keyword: string;
  timestamp: string;
}

export interface TriggerPayload {
  name: string;
  handle: string;
}

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const trackedDMs: Map<string, TrackedDM> = new Map();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || 'Unknown';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

function offsetTimestamp(base: string, offsetSeconds: number): string {
  const d = new Date(base);
  d.setSeconds(d.getSeconds() + offsetSeconds);
  return d.toISOString();
}

function generateConversation(
  firstName: string,
  keyword: string,
  baseTimestamp: string,
): DMMessage[] {
  const interest = keyword || 'our treatments';

  return [
    {
      sender: 'agent',
      text: `Hey ${firstName}! 👋 Thanks for your interest in ${interest} at NakedMD — we'd love to help you learn more. What area are you most curious about?`,
      timestamp: offsetTimestamp(baseTimestamp, 0),
    },
    {
      sender: 'agent',
      text: `We're currently offering a complimentary consultation for new clients. It's a great way to get a personalized plan tailored to your goals.`,
      timestamp: offsetTimestamp(baseTimestamp, 5),
    },
    {
      sender: 'agent',
      text: `Would you like to book a free consultation? I can send you a link to pick a time that works best 🗓️`,
      timestamp: offsetTimestamp(baseTimestamp, 10),
    },
  ];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function addTrackedDMFromWebhook(payload: WebhookPayload): TrackedDM {
  const id = randomUUID();
  const { firstName, lastName } = splitName(payload.name);
  const now = payload.timestamp || new Date().toISOString();

  const messages = generateConversation(firstName, payload.keyword, now);

  const dm: TrackedDM = {
    id,
    channel: 'instagram',
    contact: { firstName, lastName, handle: payload.ig_handle },
    location: 'newport-beach',
    outcome: null,
    sentiment: null,
    messageCount: messages.length,
    lastMessageAt: messages[messages.length - 1].timestamp,
    startedAt: now,
    summary: `Automated DM flow triggered by comment keyword "${payload.keyword}". Reached out to ${firstName} with consultation offer.`,
    keyMoments: [
      `Triggered by keyword: ${payload.keyword}`,
      'Sent personalized greeting',
      'Offered complimentary consultation',
    ],
    messages,
  };

  trackedDMs.set(id, dm);
  return dm;
}

export function addTrackedDMFromTrigger(payload: TriggerPayload): TrackedDM {
  const webhookPayload: WebhookPayload = {
    name: payload.name,
    ig_handle: payload.handle,
    keyword: 'demo-trigger',
    timestamp: new Date().toISOString(),
  };
  return addTrackedDMFromWebhook(webhookPayload);
}

export function getTrackedDMs(): TrackedDM[] {
  return Array.from(trackedDMs.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

export function getTrackedDM(id: string): TrackedDM | undefined {
  return trackedDMs.get(id);
}
