import { v4 as uuidv4 } from 'uuid';
import type { CallRecord, Lead } from '../types/index.js';
import { twilioService } from './twilio-service.js';

interface LeadProcessorStore {
  leads: Map<string, Lead>;
  calls: Map<string, CallRecord>;
}

export async function processLead(
  lead: Lead,
  store: LeadProcessorStore,
): Promise<{ callSid: string }> {
  // Update lead status to calling
  lead.status = 'calling';
  lead.callAttempts += 1;
  lead.lastCallAttempt = new Date().toISOString();
  store.leads.set(lead.id, lead);

  try {
    const callSid = await twilioService.initiateCall(lead);

    // Create call record
    const callRecord: CallRecord = {
      id: uuidv4(),
      leadId: lead.id,
      callSid,
      direction: 'outbound',
      location: lead.location,
      status: 'initiated',
      duration: 0,
      startedAt: new Date().toISOString(),
      connectedAt: null,
      endedAt: null,
      outcome: null,
      outcomeConfidence: null,
      sentiment: null,
      summary: null,
      keyMoments: null,
      objections: null,
      nextAction: null,
      transcript: [],
      smsFollowUpSent: false,
      smsFollowUpTemplate: null,
      smsFollowUpSentAt: null,
    };

    store.calls.set(callRecord.id, callRecord);

    // Link call ID back to lead
    lead.callId = callRecord.id;
    store.leads.set(lead.id, lead);

    console.log(
      `[LeadProcessor] Call initiated for lead ${lead.id} (${lead.firstName} ${lead.lastName}) — callSid: ${callSid}`,
    );

    return { callSid };
  } catch (error) {
    // Mark lead as no-answer on failure
    lead.status = 'no-answer';
    store.leads.set(lead.id, lead);

    console.error(
      '[LeadProcessor] Failed to initiate call for lead',
      lead.id,
      error instanceof Error ? error.message : error,
    );

    throw error;
  }
}
