import type { OfferType } from '../types/index.js';

interface SMSTemplateData {
  firstName: string;
  offerType: OfferType;
  location: string;
  locationAddress: string;
  locationHours: string;
}

const OFFER_TYPE_DISPLAY: Record<OfferType, string> = {
  'complimentary-consult': 'Complimentary Consultation',
  'new-client-offer': 'New Client Special',
  'vip-experience': 'VIP Experience',
};

function displayOfferType(offerType: OfferType): string {
  return OFFER_TYPE_DISPLAY[offerType] ?? offerType;
}

const TEMPLATES: Record<string, (data: SMSTemplateData) => string> = {
  consultation_confirmation: (data) =>
    `Hi ${data.firstName}! Great chatting with you! Your consultation at NakedMD ${data.location} is confirmed.

Here's what to expect: Your provider will discuss your aesthetic goals, answer all your questions, and create a personalized treatment plan — zero pressure, zero obligation.

${data.locationAddress}
${data.locationHours}

Questions before your visit? Reply here anytime.

- Vi @ NakedMD`,

  new_client_info: (data) =>
    `Hi ${data.firstName}! Your ${displayOfferType(data.offerType)} at NakedMD ${data.location} is all set!

${data.locationAddress}
${data.locationHours}

Remember: New clients get $50 off their first treatment when they book during their consultation.

We can't wait to meet you!

- Vi @ NakedMD`,

  pricing_summary: (data) =>
    `Hi ${data.firstName}! Here's a quick overview of what we discussed:

Popular services:
- Lip Fillers: $450-$850/syringe
- Neurotoxins: $12-$15/unit
- Microneedling: $350-$600/session
- Dermaplaning: $175-$250/session

Your ${displayOfferType(data.offerType)} is ready — visit us at NakedMD ${data.location} to get started!

- Vi @ NakedMD`,

  general_followup: (data) =>
    `Hi ${data.firstName}! Thanks for chatting with us about NakedMD!

Your ${displayOfferType(data.offerType)} is ready to go at NakedMD ${data.location}.

${data.locationAddress}
${data.locationHours}

When you're ready, we'd love to help you look and feel your absolute best. Reply here or call anytime!

- Vi @ NakedMD`,

  welcome: (data) =>
    `Hi ${data.firstName}! Welcome to the NakedMD family!

You're all set at NakedMD ${data.location}.
${data.locationAddress}
${data.locationHours}

We're thrilled to have you. Our team is here to help you achieve your aesthetic goals — naturally and beautifully.

- Vi @ NakedMD`,
};

export function getSMSTemplate(
  templateType: string,
  data: SMSTemplateData,
): string {
  const templateFn = TEMPLATES[templateType];
  if (!templateFn) {
    throw new Error(`Unknown SMS template type: ${templateType}`);
  }
  return templateFn(data);
}
