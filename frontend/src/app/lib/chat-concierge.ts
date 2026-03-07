import { LOCATIONS, MEMBERSHIP_TIERS } from './constants';
import { formatPhoneDisplay } from './utils';
import type {
  ChatInfoCard,
  ChatMessage,
  ChatQuickReply,
  LeadContext,
  MembershipTier,
} from './types';

type Intent =
  | 'greeting'
  | 'pricing'
  | 'compare'
  | 'recommendation'
  | 'essential'
  | 'premium'
  | 'luxury'
  | 'services'
  | 'hours'
  | 'treatments'
  | 'injectables'
  | 'offer'
  | 'first-visit'
  | 'consultation'
  | 'location'
  | 'handoff'
  | 'unsupported'
  | 'thanks'
  | 'fallback';

interface GoalProfile {
  headline: string;
  treatments: string[];
  starterPlan: string[];
  recommendedTierId: MembershipTier['id'];
  recommendationReason: string;
}

const OFFER_LABELS: Record<string, string> = {
  'complimentary-consult': 'Complimentary Consultation',
  'new-client-offer': 'New Client Special ($50 off)',
  'vip-experience': 'VIP Experience',
};

const GOAL_PROFILES: Record<string, GoalProfile> = {
  'Lip Enhancement': {
    headline: 'Start with a personalized lip consultation',
    treatments: ['Lip Fillers', 'Lip Flip', 'Lip Hydration'],
    starterPlan: [
      'Book a complimentary consultation to discuss your goals.',
      'Your provider will assess your natural features and recommend the right filler volume.',
      'Most lip filler appointments take 30-45 minutes with minimal downtime.',
    ],
    recommendedTierId: 'luxury',
    recommendationReason:
      'Our Luxury tier includes lip fillers and advanced injectables with a personalized treatment plan.',
  },
  'Wrinkle Reduction': {
    headline: 'Smooth and refresh with neurotoxins',
    treatments: ['Botox', 'Dysport', 'Microneedling'],
    starterPlan: [
      'Start with a consultation to map your treatment areas.',
      'Neurotoxin treatments take about 15-20 minutes with no downtime.',
      'Results appear within 3-7 days and last 3-4 months.',
    ],
    recommendedTierId: 'premium',
    recommendationReason:
      'Premium gives you access to neurotoxins and microneedling for comprehensive wrinkle reduction.',
  },
  'Skin Rejuvenation': {
    headline: 'Restore your natural glow',
    treatments: ['Chemical Peels', 'Microneedling', 'Facials'],
    starterPlan: [
      'A skin analysis consultation identifies the right treatment approach.',
      'Start with a signature facial to experience the NakedMD difference.',
      'Build a custom regimen with your provider based on your skin goals.',
    ],
    recommendedTierId: 'premium',
    recommendationReason:
      'Premium includes microneedling and advanced treatments for visible skin rejuvenation.',
  },
  'Anti-Aging': {
    headline: 'Turn back the clock with a customized plan',
    treatments: ['Botox', 'Fillers', 'Microneedling'],
    starterPlan: [
      'Book a complimentary anti-aging consultation.',
      'Your provider will create a multi-treatment plan tailored to your concerns.',
      'Combine injectables with skin treatments for the best results.',
    ],
    recommendedTierId: 'luxury',
    recommendationReason:
      'Luxury gives you access to the full range of injectables and custom treatment packages.',
  },
  'Acne & Scarring': {
    headline: 'Clear skin starts with the right treatment plan',
    treatments: ['Chemical Peels', 'Microneedling', 'LED Therapy'],
    starterPlan: [
      'Start with a skin assessment to determine the best approach.',
      'Chemical peels and microneedling can dramatically improve texture.',
      'A series of treatments typically shows the best results.',
    ],
    recommendedTierId: 'premium',
    recommendationReason:
      'Premium includes microneedling and advanced peels to address acne scarring effectively.',
  },
  'Body Contouring': {
    headline: 'Sculpt and refine your natural shape',
    treatments: ['Body Contouring', 'Skin Tightening', 'Consultation'],
    starterPlan: [
      'A body contouring consultation maps your treatment areas.',
      'Non-invasive options mean no downtime and natural-looking results.',
      'Multiple sessions may be recommended for optimal results.',
    ],
    recommendedTierId: 'luxury',
    recommendationReason:
      'Luxury includes advanced body treatments and custom packages for comprehensive contouring.',
  },
  'General Consultation': {
    headline: 'Discover what NakedMD can do for you',
    treatments: ['Consultation', 'Skin Analysis', 'Treatment Planning'],
    starterPlan: [
      'Book a complimentary consultation - no commitment required.',
      'Your provider will assess your skin and discuss your aesthetic goals.',
      'Walk away with a personalized treatment roadmap.',
    ],
    recommendedTierId: 'essential',
    recommendationReason:
      'Essential is a great starting point with facials, peels, and dermaplaning.',
  },
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function quickReply(label: string, prompt = label): ChatQuickReply {
  return { label, prompt };
}

function card(input: ChatInfoCard): ChatInfoCard {
  return input;
}

function getOfferLabel(offerType: string): string {
  return OFFER_LABELS[offerType] ?? offerType;
}

function getLocation(location: string) {
  return LOCATIONS[location] ?? LOCATIONS['newport-beach'];
}

export function getGoalProfile(interest: string): GoalProfile {
  return GOAL_PROFILES[interest] ?? GOAL_PROFILES['General Consultation'];
}

export function getRecommendedTier(interest: string): MembershipTier {
  const profile = getGoalProfile(interest);
  return (
    MEMBERSHIP_TIERS.find((tier) => tier.id === profile.recommendedTierId) ?? MEMBERSHIP_TIERS[1]
  );
}

function serviceTierCard(
  tier: MembershipTier,
  tone: ChatInfoCard['tone'],
  description?: string,
): ChatInfoCard {
  return card({
    eyebrow: 'Service Tier',
    title: `${tier.name} \u00B7 ${tier.price}`,
    description,
    bullets: tier.features.slice(0, 4),
    tone,
  });
}

function locationCard(locationKey: string): ChatInfoCard {
  const location = getLocation(locationKey);

  return card({
    eyebrow: 'Your Studio',
    title: location.name,
    description: location.address,
    bullets: [
      `Hours: ${location.hours}`,
      `Phone: ${formatPhoneDisplay(location.phone)}`,
    ],
    tone: 'slate',
  });
}

function offerCard(ctx: LeadContext): ChatInfoCard {
  const location = getLocation(ctx.location);

  return card({
    eyebrow: 'Offer Confirmed',
    title: getOfferLabel(ctx.offerType),
    description: `Redeemable at ${location.name}.`,
    bullets: [
      'No commitment required.',
      'Personalized to your aesthetic goals.',
      'Meet with a licensed provider one-on-one.',
    ],
    footer: 'Walk-in consultations available during business hours.',
    tone: 'green',
  });
}

function treatmentRecommendationCard(ctx: LeadContext): ChatInfoCard {
  const profile = getGoalProfile(ctx.interest);
  const tier = getRecommendedTier(ctx.interest);

  return card({
    eyebrow: 'Recommended For You',
    title: tier.name,
    description: profile.recommendationReason,
    bullets: tier.features.slice(0, 4),
    tone: 'gold',
  });
}

// ---------------------------------------------------------------------------
// Message builders
// ---------------------------------------------------------------------------

function buildPricingMessage(ctx: LeadContext): ChatMessage {
  const recommended = getRecommendedTier(ctx.interest);

  return {
    role: 'assistant',
    content: `Here is the honest breakdown - our Essential tier starts at $150/session for facials, peels, and dermaplaning. Premium starts at $250/session and includes neurotoxins and microneedling. Luxury starts at $450/session for fillers and advanced injectables. Since you are interested in ${ctx.interest.toLowerCase()}, ${recommended.name} is probably where I would start.`,
    cards: [
      serviceTierCard(
        MEMBERSHIP_TIERS[0],
        'slate',
        'Perfect for maintaining healthy, glowing skin.',
      ),
      serviceTierCard(
        MEMBERSHIP_TIERS[1],
        'gold',
        'Most popular. Neurotoxins, microneedling, and more.',
      ),
      serviceTierCard(
        MEMBERSHIP_TIERS[2],
        'green',
        'Full suite of injectables and custom treatment packages.',
      ),
    ],
    quickReplies: [
      quickReply('Compare Essential vs Premium'),
      quickReply('What comes with Premium?'),
      quickReply('Which tier fits my goals?'),
    ],
  };
}

function buildServicesMessage(ctx: LeadContext): ChatMessage {
  const profile = getGoalProfile(ctx.interest);

  return {
    role: 'assistant',
    content: `For ${ctx.interest.toLowerCase()}, I would start with ${profile.treatments[0]} - it is a great fit and our providers are amazing at it. ${profile.treatments[1]} and ${profile.treatments[2]} are excellent follow-ups once you have seen your initial results.`,
    cards: [
      card({
        eyebrow: 'Start Here',
        title: profile.treatments[0],
        description: `Great match for ${ctx.interest.toLowerCase()}. Personalized and performed by licensed providers.`,
        bullets: profile.treatments,
        tone: 'gold',
      }),
    ],
    quickReplies: [
      quickReply('What should I expect at my consultation?'),
      quickReply('What are your hours?'),
      quickReply('Which tier fits my goals?'),
    ],
  };
}

function buildHoursMessage(ctx: LeadContext): ChatMessage {
  const location = getLocation(ctx.location);

  return {
    role: 'assistant',
    content: `${location.name} is open ${location.hours}. We recommend booking an appointment, but walk-in consultations are welcome during business hours.`,
    cards: [
      locationCard(ctx.location),
      card({
        eyebrow: 'Pro Tip',
        title: 'Best time to visit',
        description: 'Appointments are recommended for treatments.',
        bullets: [
          'Walk-in consultations are always welcome.',
          'Arriving 10 minutes early gives time for your intake form.',
          'Mention your offer at check-in and we will take it from there.',
        ],
        tone: 'gold',
      }),
    ],
    quickReplies: [
      quickReply('Can I just walk in for a consultation?'),
      quickReply('What should I expect at my first visit?'),
      quickReply('What treatments do you recommend?'),
    ],
  };
}

function buildTreatmentsMessage(): ChatMessage {
  return {
    role: 'assistant',
    content: 'We offer a full range of aesthetic treatments - from facials and dermaplaning to neurotoxins like Botox and Dysport, microneedling, lip fillers, and advanced injectables. Every treatment starts with a personalized consultation so your provider can create the perfect plan for your goals.',
    cards: [
      card({
        eyebrow: 'Essential Services',
        title: 'Skin care foundations',
        bullets: [
          'Dermaplaning',
          'Chemical Peels',
          'Signature Facials',
        ],
        tone: 'slate',
      }),
      card({
        eyebrow: 'Premium & Luxury',
        title: 'Advanced treatments',
        bullets: [
          'Botox / Dysport neurotoxins',
          'Microneedling with PRP',
          'Lip fillers and dermal fillers',
          'Custom treatment packages',
        ],
        tone: 'green',
      }),
    ],
    quickReplies: [
      quickReply('What comes with Premium?'),
      quickReply('Which tier fits my goals?'),
      quickReply('What should I expect at my consultation?'),
    ],
  };
}

function buildInjectablesMessage(): ChatMessage {
  return {
    role: 'assistant',
    content: 'Our injectable treatments are performed by licensed, experienced providers. Neurotoxins like Botox and Dysport smooth wrinkles in about 15 minutes with no downtime. Fillers add volume and definition to lips, cheeks, and jawline. Every treatment starts with a consultation to ensure natural-looking results.',
    cards: [
      serviceTierCard(
        MEMBERSHIP_TIERS[2],
        'green',
        'Full access to fillers, neurotoxins, and custom packages.',
      ),
    ],
    quickReplies: [
      quickReply('How much do lip fillers cost?'),
      quickReply('What should I expect at my first visit?'),
      quickReply('Can I walk in for a consultation?'),
    ],
  };
}

function buildOfferMessage(ctx: LeadContext): ChatMessage {
  return {
    role: 'assistant',
    content: `Your ${getOfferLabel(ctx.offerType)} is confirmed - this is the real deal. Come in, meet with a provider, and get a personalized treatment plan with zero obligation.`,
    cards: [offerCard(ctx)],
    quickReplies: [
      quickReply('What should I expect at my consultation?'),
      quickReply('Can I just walk in?'),
      quickReply('What are your hours?'),
    ],
  };
}

function buildFirstVisitMessage(ctx: LeadContext): ChatMessage {
  const location = getLocation(ctx.location);
  const profile = getGoalProfile(ctx.interest);

  return {
    role: 'assistant',
    content: `Do not overthink it - just arrive at ${location.name}, mention your ${getOfferLabel(ctx.offerType)}, and your provider will guide you through everything. For ${ctx.interest.toLowerCase()}, the consultation will cover ${profile.treatments[0]} and what to expect from treatment.`,
    cards: [
      card({
        eyebrow: 'Day-Of Checklist',
        title: 'What to do when you arrive',
        bullets: [
          'Check in at the front desk and mention your offer.',
          'Fill out a quick intake form about your goals and history.',
          'Meet one-on-one with your provider for a personalized assessment.',
          `Discuss ${profile.treatments[0]} and your treatment options.`,
        ],
        tone: 'green',
      }),
    ],
    quickReplies: [
      quickReply('Can I walk in for a consultation?'),
      quickReply('What treatments do you recommend?'),
      quickReply('Which tier fits my goals?'),
    ],
  };
}

function buildConsultationMessage(ctx: LeadContext): ChatMessage {
  const location = getLocation(ctx.location);

  return {
    role: 'assistant',
    content: `Absolutely, consultations are complimentary and no-obligation. Just come during business hours at ${location.name}. We recommend booking ahead so we can pair you with the right provider for your goals.`,
    cards: [
      locationCard(ctx.location),
      card({
        eyebrow: 'Consultation Info',
        title: 'What to expect',
        bullets: [
          'Completely free, no obligation.',
          'One-on-one with a licensed provider.',
          'Walk away with a personalized treatment plan.',
        ],
        tone: 'gold',
      }),
    ],
    quickReplies: [
      quickReply('What should I bring?'),
      quickReply('What treatments do you recommend?'),
      quickReply('What comes with Premium?'),
    ],
  };
}

function buildLocationMessage(ctx: LeadContext): ChatMessage {
  const selected = getLocation(ctx.location);
  const allLocations = Object.values(LOCATIONS).filter(l => l.id !== ctx.location);

  return {
    role: 'assistant',
    content: `${selected.name} is a beautiful studio. We have 40 locations across the country, so if you ever want to visit a different NakedMD studio, your treatment history follows you.`,
    cards: [
      locationCard(ctx.location),
      ...allLocations.slice(0, 1).map(alt => card({
        eyebrow: 'Also Nearby',
        title: alt.name,
        description: alt.address,
        bullets: [
          `Hours: ${alt.hours}`,
        ],
        tone: 'green',
      })),
    ],
    quickReplies: [
      quickReply('What comes with Premium?'),
      quickReply('What are your hours?'),
      quickReply('Can I walk in for a consultation?'),
    ],
  };
}

function buildRecommendationMessage(ctx: LeadContext): ChatMessage {
  const recommended = getRecommendedTier(ctx.interest);
  const profile = getGoalProfile(ctx.interest);

  return {
    role: 'assistant',
    content: `Honestly, for ${ctx.interest.toLowerCase()}? ${recommended.name}. ${profile.recommendationReason} It is the tier I would recommend to a friend.`,
    cards: [
      treatmentRecommendationCard(ctx),
      card({
        eyebrow: 'Quick Comparison',
        title: 'How the tiers stack up',
        bullets: [
          'Essential = facials, peels, dermaplaning.',
          'Premium = neurotoxins, microneedling, best value.',
          'Luxury = fillers, advanced injectables, custom packages.',
        ],
        tone: 'green',
      }),
    ],
    quickReplies: [
      quickReply('Compare Essential vs Premium'),
      quickReply('What comes with Premium?'),
      quickReply('What should I expect at my consultation?'),
    ],
  };
}

function buildCompareMessage(): ChatMessage {
  return {
    role: 'assistant',
    content: 'Here is how to think about it - Essential is great for skin maintenance, Premium is where most clients land because you get neurotoxins and microneedling, and Luxury is for anyone who wants fillers and custom packages. Most clients who come in for a consultation end up going Premium once they see the value.',
    cards: [
      serviceTierCard(MEMBERSHIP_TIERS[0], 'slate', 'Skin care foundations. Facials, peels, dermaplaning.'),
      serviceTierCard(MEMBERSHIP_TIERS[1], 'gold', 'Most popular. Neurotoxins and microneedling.'),
      serviceTierCard(MEMBERSHIP_TIERS[2], 'green', 'Full suite. Fillers, injectables, and custom packages.'),
    ],
    quickReplies: [
      quickReply('Which tier fits my goals?'),
      quickReply('What comes with Premium?'),
      quickReply('How much do lip fillers cost?'),
    ],
  };
}

function buildEssentialMessage(): ChatMessage {
  return {
    role: 'assistant',
    content: 'Essential starts at $150/session and is perfect for maintaining healthy, glowing skin. You get access to dermaplaning, chemical peels, and our signature facials. If you are new to med spa treatments, it is a wonderful place to start.',
    cards: [
      serviceTierCard(
        MEMBERSHIP_TIERS[0],
        'slate',
        'Skin care foundations at an accessible price point.',
      ),
      card({
        eyebrow: 'Upgrade Anytime',
        title: 'What stays in Premium',
        bullets: [
          'Botox and Dysport neurotoxins',
          'Microneedling with PRP',
          'Personalized treatment plans',
        ],
        tone: 'gold',
      }),
    ],
    quickReplies: [
      quickReply('Compare Essential vs Premium'),
      quickReply('What comes with Premium?'),
      quickReply('Which tier fits my goals?'),
    ],
  };
}

function buildPremiumMessage(): ChatMessage {
  return {
    role: 'assistant',
    content: 'Premium starts at $250/session and is honestly where the NakedMD experience shines. Neurotoxins like Botox and Dysport, microneedling, plus everything in Essential. It is the tier most clients wish they had started with because the results are so visible.',
    cards: [
      serviceTierCard(
        MEMBERSHIP_TIERS[1],
        'gold',
        'Most popular tier. Neurotoxins and microneedling included.',
      ),
      card({
        eyebrow: 'Why Clients Love It',
        title: 'What makes Premium the sweet spot',
        bullets: [
          'Botox and Dysport for wrinkle reduction',
          'Microneedling for skin rejuvenation',
          'All Essential services included',
          'Personalized treatment plan with your provider',
        ],
        tone: 'green',
      }),
    ],
    quickReplies: [
      quickReply('How is Luxury different?'),
      quickReply('Which tier fits my goals?'),
      quickReply('Can I walk in for a consultation?'),
    ],
  };
}

function buildLuxuryMessage(): ChatMessage {
  return {
    role: 'assistant',
    content: 'Luxury starts at $450/session and is our most comprehensive tier - lip fillers, advanced injectables, custom treatment packages, and priority scheduling. It is for clients who want a complete aesthetic transformation with a dedicated provider.',
    cards: [
      serviceTierCard(
        MEMBERSHIP_TIERS[2],
        'green',
        'The full package with fillers, injectables, and priority care.',
      ),
      card({
        eyebrow: 'Who Chooses Luxury',
        title: 'Luxury clients typically want...',
        bullets: [
          'Lip and dermal fillers',
          'Comprehensive anti-aging plans',
          'Custom treatment packages',
          'Priority scheduling and VIP service',
        ],
        tone: 'slate',
      }),
    ],
    quickReplies: [
      quickReply('Which tier fits my goals?'),
      quickReply('Can I try a consultation first?'),
      quickReply('What should I expect at my first visit?'),
    ],
  };
}

function buildHandoffMessage(ctx: LeadContext): ChatMessage {
  const location = getLocation(ctx.location);

  return {
    role: 'assistant',
    content: `On it - the team at ${location.name} already has your info and they will be reaching out. While you wait, I can help you understand your treatment options so you walk into that consultation already knowing what to ask.`,
    cards: [
      card({
        eyebrow: 'Talk To Them About',
        title: 'Questions worth asking',
        bullets: [
          'Which treatments are right for my goals?',
          'How many sessions should I expect?',
          'What is the downtime for my recommended treatment?',
        ],
        tone: 'gold',
      }),
      locationCard(ctx.location),
    ],
    quickReplies: [
      quickReply('Which tier fits my goals?'),
      quickReply('What should I expect at my consultation?'),
      quickReply('What are your hours?'),
    ],
  };
}

function buildUnsupportedMessage(ctx: LeadContext): ChatMessage {
  return {
    role: 'assistant',
    content: 'That one is out of my lane - billing, cancellations, and account details need the actual studio team so nothing gets lost in translation. But I am great with treatment options, pricing, consultations, hours, and figuring out which services fit your goals. Want to try one of those?',
    cards: [
      locationCard(ctx.location),
      card({
        eyebrow: 'Where I Can Help',
        title: 'My expertise',
        bullets: [
          'Treatment recommendations and pricing',
          'Consultation prep and what to expect',
          'Service comparisons for your goals',
          'Hours, locations, and studio info',
        ],
        tone: 'green',
      }),
    ],
    quickReplies: [
      quickReply('Which tier fits my goals?'),
      quickReply('What treatments do you recommend?'),
      quickReply('Can I walk in for a consultation?'),
    ],
  };
}

function buildThanksMessage(): ChatMessage {
  return {
    role: 'assistant',
    content: 'Anytime. I am still here if anything else comes up - whether it is comparing treatments, understanding pricing, or just figuring out the best time to come in.',
    quickReplies: [
      quickReply('What treatments do you recommend?'),
      quickReply('Which tier fits my goals?'),
      quickReply('What are your hours?'),
    ],
  };
}

function buildFallbackMessage(ctx: LeadContext): ChatMessage {
  return {
    role: 'assistant',
    content: 'I might have missed that one, but here is what I am great at - helping you choose the right treatment, understanding our pricing tiers, preparing for your first visit, and making sure you know exactly what to expect. What sounds useful?',
    cards: [offerCard(ctx)],
    quickReplies: [
      quickReply('Which tier fits my goals?'),
      quickReply('What should I expect at my consultation?'),
      quickReply('What treatments do you recommend?'),
    ],
  };
}

// ---------------------------------------------------------------------------
// Intent detection
// ---------------------------------------------------------------------------

function detectIntent(text: string): Intent {
  const normalized = normalize(text);

  if (!normalized) return 'fallback';
  if (includesAny(normalized, ['thanks', 'thank you', 'appreciate it'])) return 'thanks';
  if (
    includesAny(normalized, [
      'billing',
      'cancel',
      'cancellation',
      'freeze',
      'refund',
      'charged',
      'payment',
    ])
  ) {
    return 'unsupported';
  }
  if (
    includesAny(normalized, [
      'talk to someone',
      'speak to someone',
      'call me',
      'human',
      'front desk',
      'team call',
      'rep',
    ])
  ) {
    return 'handoff';
  }
  if (
    includesAny(normalized, [
      'compare',
      'difference',
      'essential vs premium',
      'premium vs',
      'which is better',
    ])
  ) {
    return 'compare';
  }
  if (
    includesAny(normalized, [
      'recommend',
      'best tier',
      'fit my goal',
      'what should i choose',
      'best for me',
    ])
  ) {
    return 'recommendation';
  }
  if (includesAny(normalized, ['luxury', 'filler', 'lip filler', 'dermal filler'])) {
    return 'luxury';
  }
  if (includesAny(normalized, ['injectable', 'botox', 'dysport', 'neurotoxin', 'wrinkle'])) {
    return 'injectables';
  }
  if (includesAny(normalized, ['premium tier', 'premium service', 'what comes with premium'])) {
    return 'premium';
  }
  if (
    includesAny(normalized, [
      'essential tier',
      'essential service',
      'budget',
      'affordable',
      'cheapest',
    ])
  ) {
    return 'essential';
  }
  if (includesAny(normalized, ['price', 'cost', 'pricing', 'how much'])) {
    return 'pricing';
  }
  if (
    includesAny(normalized, [
      'offer',
      'special',
      'complimentary',
      'new client',
      'vip',
      'deal',
      'discount',
    ])
  ) {
    return 'offer';
  }
  if (
    includesAny(normalized, ['hour', 'open', 'close', 'weekend', 'today', 'tonight', 'schedule'])
  ) {
    return 'hours';
  }
  if (includesAny(normalized, ['consultation', 'consult', 'walk in', 'walk-in', 'book'])) {
    return 'consultation';
  }
  if (
    includesAny(normalized, [
      'first visit',
      'first time',
      'what should i expect',
      'what do i bring',
      'when i arrive',
    ])
  ) {
    return 'first-visit';
  }
  if (
    includesAny(normalized, [
      'where',
      'address',
      'located',
      'location',
      'newport',
      'beverly',
      'scottsdale',
      'parking',
    ])
  ) {
    return 'location';
  }
  if (
    includesAny(normalized, [
      'treatment',
      'service',
      'facial',
      'peel',
      'dermaplaning',
      'microneedling',
      'what do you offer',
    ])
  ) {
    return 'treatments';
  }
  if (
    includesAny(normalized, [
      'skin',
      'acne',
      'scar',
      'rejuvenation',
      'anti-aging',
      'anti aging',
      'glow',
      'contouring',
    ])
  ) {
    return 'services';
  }
  if (includesAny(normalized, ['hello', 'hi', 'hey'])) return 'greeting';

  return 'fallback';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function createWelcomeMessage(ctx: LeadContext): ChatMessage {
  const location = getLocation(ctx.location);
  const profile = getGoalProfile(ctx.interest);

  return {
    role: 'assistant',
    content: `Hey ${ctx.firstName}! Your ${getOfferLabel(ctx.offerType)} for ${location.name} is confirmed. While the team gets your consultation ready, I am here to help you understand which treatments are right for ${ctx.interest.toLowerCase()}, what to expect at your visit, and how to make the most of your time with us.`,
    cards: [
      offerCard(ctx),
      card({
        eyebrow: 'Start With This',
        title: profile.treatments[0],
        description: profile.headline,
        bullets: profile.starterPlan.slice(0, 3),
        tone: 'gold',
      }),
    ],
    quickReplies: [
      quickReply('Which tier fits my goals?'),
      quickReply('What should I expect at my consultation?'),
      quickReply('What treatments do you recommend?'),
    ],
  };
}

export interface ConciergeResult {
  message: ChatMessage;
  intent: Intent;
}

export function buildConciergeReply(messages: ChatMessage[], ctx: LeadContext): ConciergeResult {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const intent = detectIntent(lastUserMessage?.content ?? '');

  let message: ChatMessage;
  switch (intent) {
    case 'greeting':
      message = createWelcomeMessage(ctx);
      break;
    case 'pricing':
      message = buildPricingMessage(ctx);
      break;
    case 'compare':
      message = buildCompareMessage();
      break;
    case 'recommendation':
      message = buildRecommendationMessage(ctx);
      break;
    case 'essential':
      message = buildEssentialMessage();
      break;
    case 'premium':
      message = buildPremiumMessage();
      break;
    case 'luxury':
      message = buildLuxuryMessage();
      break;
    case 'services':
      message = buildServicesMessage(ctx);
      break;
    case 'hours':
      message = buildHoursMessage(ctx);
      break;
    case 'treatments':
      message = buildTreatmentsMessage();
      break;
    case 'injectables':
      message = buildInjectablesMessage();
      break;
    case 'offer':
      message = buildOfferMessage(ctx);
      break;
    case 'first-visit':
      message = buildFirstVisitMessage(ctx);
      break;
    case 'consultation':
      message = buildConsultationMessage(ctx);
      break;
    case 'location':
      message = buildLocationMessage(ctx);
      break;
    case 'handoff':
      message = buildHandoffMessage(ctx);
      break;
    case 'unsupported':
      message = buildUnsupportedMessage(ctx);
      break;
    case 'thanks':
      message = buildThanksMessage();
      break;
    default:
      message = buildFallbackMessage(ctx);
      break;
  }

  return { message, intent };
}
