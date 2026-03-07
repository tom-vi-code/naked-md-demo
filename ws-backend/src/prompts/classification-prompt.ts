import { LOCATIONS } from '../config/med-spa-knowledge.js';
import type { Location, OfferType } from '../types/index.js';

interface ClassificationPromptData {
  firstName: string;
  lastName: string;
  interest: string;
  offerType: OfferType;
  location: Location;
}

const OFFER_TYPE_DISPLAY: Record<OfferType, string> = {
  'complimentary-consult': 'Complimentary Consultation',
  'new-client-offer': 'New Client Special ($50 off)',
  'vip-experience': 'VIP Experience',
};

export function buildClassificationPrompt(
  transcript: string,
  lead: ClassificationPromptData,
): string {
  const locationInfo = LOCATIONS[lead.location];
  const locationName = locationInfo?.name ?? lead.location;
  const offerDisplay = OFFER_TYPE_DISPLAY[lead.offerType] ?? lead.offerType;

  return `You are a call analyst for NakedMD Medical Spa. Analyze this phone call transcript and provide a structured analysis.

TRANSCRIPT:
${transcript}

LEAD CONTEXT:
- Name: ${lead.firstName} ${lead.lastName}
- Interest: ${lead.interest}
- Offer: ${offerDisplay}
- Location: ${locationName}

Respond in JSON format:
{
  "summary": "2-3 sentence summary of the call",
  "outcome": "one of the 14 outcomes below",
  "outcomeConfidence": 0.0 to 1.0,
  "sentiment": 0 to 100,
  "keyMoments": ["array of notable moments"],
  "objections": ["any objections raised"],
  "nextAction": "recommended follow-up action"
}

OUTCOMES (choose exactly one):
1. consultation-booked
2. treatment-sold
3. appointment-scheduled
4. package-sold
5. callback-requested
6. info-sent
7. info-provided
8. nurture
9. no-answer
10. voicemail
11. declined
12. tech-issue
13. win-back-success
14. referral-generated`;
}
