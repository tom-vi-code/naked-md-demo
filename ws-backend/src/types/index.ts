export type OutcomeType =
  | 'consultation-booked'
  | 'treatment-sold'
  | 'appointment-scheduled'
  | 'package-sold'
  | 'callback-requested'
  | 'info-sent'
  | 'info-provided'
  | 'nurture'
  | 'no-answer'
  | 'voicemail'
  | 'declined'
  | 'tech-issue'
  | 'win-back-success'
  | 'referral-generated';

export type Location = 'newport-beach' | 'beverly-hills' | 'scottsdale';
export type OfferType = 'complimentary-consult' | 'new-client-offer' | 'vip-experience';
export type CallDirection = 'outbound' | 'inbound';
export type LeadSource = 'web-form' | 'inbound-call' | 'manual' | 'instagram-dm';
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

export interface LeadSubmission {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  offerType: OfferType;
  interest: string;
  location: Location;
}

export interface ClassificationResult {
  summary: string;
  outcome: OutcomeType;
  outcomeConfidence: number;
  sentiment: number;
  keyMoments: string[];
  objections: string[];
  nextAction: string;
}

export interface ActiveCallSession {
  callId: string;
  leadId: string;
  callSid: string;
  lead: Lead;
  streamSid: string | null;
  deepgramWs: WebSocket | null;
  transcript: TranscriptEntry[];
  startedAt: string;
  connectedAt: string | null;
}
