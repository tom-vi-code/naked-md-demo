export type OutcomeType =
  | 'consultation-booked'
  | 'treatment-sold'
  | 'package-sold'
  | 'referral-generated'
  | 'appointment-scheduled'
  | 'callback-requested'
  | 'info-sent'
  | 'info-provided'
  | 'nurture'
  | 'no-answer'
  | 'voicemail'
  | 'declined'
  | 'tech-issue'
  | 'win-back-success';

export type Location = 'newport-beach' | 'beverly-hills' | 'scottsdale';
export type OfferType = 'complimentary-consult' | 'new-client-offer' | 'vip-experience';
export type CallDirection = 'outbound' | 'inbound';
export type LeadSource = 'web-form' | 'inbound-call' | 'manual';
export type LeadStatus = 'new' | 'calling' | 'connected' | 'completed' | 'classified' | 'followed-up' | 'no-answer';
export type CallStatus = 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed' | 'no-answer';

export interface LocationInfo {
  id: Location;
  name: string;
  address: string;
  hours: string;
  staffedHours: string;
  phone: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  offerType: OfferType;
  interest: string;
  location: Location;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  callAttempts: number;
  lastCallAttempt: string | null;
  callId: string | null;
}

export interface TranscriptEntry {
  speaker: 'agent' | 'caller';
  text: string;
  timestamp: number;
}

export interface CallRecord {
  id: string;
  leadId: string;
  callSid: string;
  direction: CallDirection;
  location: Location;
  status: CallStatus;
  duration: number;
  startedAt: string;
  connectedAt: string | null;
  endedAt: string | null;
  outcome: OutcomeType | null;
  outcomeConfidence: number | null;
  sentiment: number | null;
  summary: string | null;
  keyMoments: string[] | null;
  objections: string[] | null;
  nextAction: string | null;
  transcript: TranscriptEntry[];
  smsFollowUpSent: boolean;
  smsFollowUpTemplate: string | null;
  smsFollowUpSentAt: string | null;
}

export interface CallSummary {
  id: string;
  contact: { firstName: string; lastName: string; phone: string };
  location: Location;
  outcome: OutcomeType | null;
  duration: number;
  sentiment: number | null;
  startedAt: string;
}

export interface CallDetailResponse {
  id: string;
  leadId: string;
  contact: { firstName: string; lastName: string; phone: string; email: string };
  location: Location;
  direction: CallDirection;
  duration: number;
  outcome: OutcomeType | null;
  outcomeConfidence: number | null;
  sentiment: number | null;
  summary: string | null;
  keyMoments: string[] | null;
  transcript: TranscriptEntry[];
  timestamps: {
    callInitiated: string;
    callConnected: string | null;
    callEnded: string | null;
    summaryGenerated: string | null;
    smsFollowUpSent: string | null;
  };
}

export interface KPIs {
  totalCalls: number;
  connectRate: number;
  avgDuration: number;
  consultationsBooked: number;
  conversionRate: number;
  escalations: number;
  avgSentiment: number;
}

export interface LocationStats {
  location: Location;
  name: string;
  totalCalls: number;
  connectRate: number;
  topOutcomes: { outcome: OutcomeType; count: number }[];
}

export interface AnalyticsResponse {
  kpis: KPIs;
  locationBreakdown: {
    newportBeach: LocationStats;
    beverlyHills: LocationStats;
    scottsdale: LocationStats;
  };
  outcomeDistribution: Record<OutcomeType, number>;
  conversionFunnel: {
    leads: number;
    connected: number;
    engaged: number;
    converted: number;
  };
  dailyTrend: Array<{ date: string; calls: number; conversions: number }>;
  topObjections: Array<{ objection: string; count: number; percentage: number }>;
  recentCalls: CallSummary[];
}

export interface CallsResponse {
  calls: CallSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LeadSubmission {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  offerType: OfferType;
  interest: string;
  location: Location;
}

export interface ChatQuickReply {
  label: string;
  prompt: string;
}

export interface ChatInfoCard {
  eyebrow?: string;
  title: string;
  description?: string;
  bullets?: string[];
  footer?: string;
  tone?: 'gold' | 'green' | 'slate';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  quickReplies?: ChatQuickReply[];
  cards?: ChatInfoCard[];
}

export interface LeadContext {
  firstName: string;
  offerType: string;
  location: string;
  interest: string;
}

export interface ChatResponsePayload {
  message: ChatMessage;
}

// ---------------------------------------------------------------------------
// First-Response Wins Orchestrator
// ---------------------------------------------------------------------------
export type ChannelType = 'voice' | 'sms' | 'chat';
export type ChannelFinalStatus = 'engaged' | 'suppressed' | 'failed' | 'repurposed';

export interface OrchestrationEvent {
  channel: ChannelType;
  action: string;
  offsetMs: number;
  detail: string;
}

export interface OrchestrationRecord {
  id: string;
  leadId: string;
  leadName: string;
  location: Location;
  interest: string;
  outcome: OutcomeType | null;
  winningChannel: ChannelType;
  firstResponseMs: number;
  channels: Record<ChannelType, ChannelFinalStatus>;
  events: OrchestrationEvent[];
  startedAt: string;
}

export interface OrchestratorStats {
  totalLeads: number;
  engagementRate: number;
  avgFirstResponseMs: number;
  channelWins: Record<ChannelType, number>;
  leakagePrevented: number;
  duplicatesSuppressed: number;
}

export interface OrchestratorResponse {
  stats: OrchestratorStats;
  records: OrchestrationRecord[];
}

// ---------------------------------------------------------------------------
// Agent Persona / Personality Config
// ---------------------------------------------------------------------------
export type ResponseStyle = 'concise' | 'detailed' | 'conversational';

export interface AgentPersona {
  name: string;
  language: string;
  warmth: number;
  humor: number;
  energy: number;
  formality: number;
  greeting: string;
  signoff: string;
  useEmoji: boolean;
  style: ResponseStyle;
}
