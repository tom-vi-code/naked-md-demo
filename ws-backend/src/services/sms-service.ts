import type { Lead, OutcomeType } from '../types/index.js';
import { LOCATIONS } from '../config/med-spa-knowledge.js';
import { getOutcomeDefinition } from '../config/outcomes.js';
import { getSMSTemplate } from '../prompts/sms-templates.js';
import { twilioService } from './twilio-service.js';

export async function sendFollowUpSMS(
  lead: Lead,
  outcome: OutcomeType,
): Promise<void> {
  try {
    const outcomeDef = getOutcomeDefinition(outcome);

    if (!outcomeDef.smsTemplate) {
      console.log(
        `[SMSService] No SMS template defined for outcome "${outcome}" — skipping`,
      );
      return;
    }

    const locationInfo = LOCATIONS[lead.location];
    if (!locationInfo) {
      console.error(
        `[SMSService] Unknown location "${lead.location}" for lead ${lead.id}`,
      );
      return;
    }

    const message = getSMSTemplate(outcomeDef.smsTemplate, {
      firstName: lead.firstName,
      offerType: lead.offerType,
      location: locationInfo.name.replace('NakedMD ', ''),
      locationAddress: locationInfo.address,
      locationHours: locationInfo.hours,
    });

    await twilioService.sendSMS(lead.phone, message);

    console.log(
      `[SMSService] Follow-up SMS sent to ${lead.phone} (template: ${outcomeDef.smsTemplate}, outcome: ${outcome})`,
    );
  } catch (error) {
    console.error(
      '[SMSService] Failed to send follow-up SMS:',
      error instanceof Error ? error.message : error,
    );
    // Gracefully swallow — do not rethrow
  }
}
