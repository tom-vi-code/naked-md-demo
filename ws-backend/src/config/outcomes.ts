import { OutcomeType } from '../types/index.js';

export interface OutcomeDefinition {
  id: OutcomeType;
  label: string;
  description: string;
  smsTemplate: string | null;
  isConversion: boolean;
}

export const OUTCOMES: OutcomeDefinition[] = [
  { id: 'consultation-booked', label: 'Consultation Booked', description: 'Caller committed to a free consultation', smsTemplate: 'consultation_confirmation', isConversion: true },
  { id: 'treatment-sold', label: 'Treatment Sold', description: 'Caller booked and committed to a treatment', smsTemplate: 'welcome', isConversion: true },
  { id: 'appointment-scheduled', label: 'Appointment Scheduled', description: 'Specific appointment was booked', smsTemplate: 'consultation_confirmation', isConversion: true },
  { id: 'package-sold', label: 'Package Sold', description: 'Caller purchased a treatment package', smsTemplate: 'welcome', isConversion: true },
  { id: 'callback-requested', label: 'Callback Requested', description: 'Caller asked to be called back at a different time', smsTemplate: 'general_followup', isConversion: false },
  { id: 'info-sent', label: 'Info Sent', description: 'Caller requested info to be sent via text/email', smsTemplate: 'pricing_summary', isConversion: false },
  { id: 'info-provided', label: 'Info Provided', description: 'Questions answered, no specific commitment made', smsTemplate: 'pricing_summary', isConversion: false },
  { id: 'nurture', label: 'Nurture', description: 'Interested but not ready, follow up later', smsTemplate: 'general_followup', isConversion: false },
  { id: 'no-answer', label: 'No Answer', description: 'Call was not answered', smsTemplate: null, isConversion: false },
  { id: 'voicemail', label: 'Voicemail', description: 'Went to voicemail, message left', smsTemplate: 'general_followup', isConversion: false },
  { id: 'declined', label: 'Declined', description: 'Caller explicitly declined interest', smsTemplate: null, isConversion: false },
  { id: 'tech-issue', label: 'Tech Issue', description: 'Call had technical problems', smsTemplate: 'general_followup', isConversion: false },
  { id: 'win-back-success', label: 'Win-Back Success', description: 'Lapsed client re-engaged successfully', smsTemplate: 'new_client_info', isConversion: true },
  { id: 'referral-generated', label: 'Referral Generated', description: 'Caller referred a friend or family member', smsTemplate: 'general_followup', isConversion: true },
];

export const CONVERSION_OUTCOMES: OutcomeType[] = OUTCOMES
  .filter(o => o.isConversion)
  .map(o => o.id);

export function getOutcomeDefinition(outcome: OutcomeType): OutcomeDefinition {
  return OUTCOMES.find(o => o.id === outcome)!;
}
