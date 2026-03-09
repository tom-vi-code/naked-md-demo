import type {
  CallRecord,
  CallSummary,
  CallDetailResponse,
  AnalyticsResponse,
  KPIs,
  LocationStats,
  OutcomeType,
  Location,
  TranscriptEntry,
  CallDirection,
  CallStatus,
  DMChannel,
  DMConversation,
  DMSummary,
  DMMessage,
} from './types';

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) -- keeps data stable across requests
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Name / data pools
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'James', 'Maria', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David',
  'Patricia', 'William', 'Elizabeth', 'Richard', 'Barbara', 'Joseph',
  'Susan', 'Thomas', 'Jessica', 'Christopher', 'Sarah', 'Daniel', 'Karen',
  'Matthew', 'Lisa', 'Anthony', 'Nancy', 'Mark', 'Betty', 'Steven',
  'Margaret', 'Andrew', 'Sandra', 'Joshua', 'Ashley', 'Kevin', 'Dorothy',
  'Brian', 'Kimberly', 'Ryan', 'Emily', 'Tyler', 'Donna', 'Jason',
  'Michelle', 'Brandon', 'Carol', 'Justin', 'Amanda', 'Eric', 'Melissa',
  'Carlos', 'Deborah',
] as const;

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts',
] as const;

const INTERESTS = [
  'Lip Enhancement', 'Wrinkle Reduction', 'Skin Rejuvenation', 'Anti-Aging',
  'Acne & Scarring', 'Body Contouring', 'General Consultation',
] as const;

const OBJECTION_POOL = [
  'Price concern - comparing to other med spas',
  'Wants to research treatments before committing',
  'Concerned about pain or downtime',
  'Not sure which treatment is right for them',
  'Wants to see before/after photos first',
  'Mentioned budget constraints this month',
  'Partner needs to agree before booking',
  'Already seeing another provider',
  'Worried about looking unnatural',
  'Transportation concerns - distance from home',
] as const;

// ---------------------------------------------------------------------------
// Outcome distribution (must total 47)
// ---------------------------------------------------------------------------
const OUTCOME_DISTRIBUTION: { outcome: OutcomeType; count: number }[] = [
  { outcome: 'consultation-booked', count: 8 },
  { outcome: 'package-sold', count: 6 },
  { outcome: 'referral-generated', count: 4 },
  { outcome: 'treatment-sold', count: 2 },
  { outcome: 'info-provided', count: 7 },
  { outcome: 'nurture', count: 6 },
  { outcome: 'callback-requested', count: 3 },
  { outcome: 'info-sent', count: 3 },
  { outcome: 'no-answer', count: 3 },
  { outcome: 'voicemail', count: 2 },
  { outcome: 'declined', count: 1 },
  { outcome: 'tech-issue', count: 1 },
  { outcome: 'appointment-scheduled', count: 1 },
  { outcome: 'win-back-success', count: 0 },
];

const CONVERSION_OUTCOMES: OutcomeType[] = [
  'consultation-booked', 'treatment-sold', 'package-sold',
  'referral-generated', 'appointment-scheduled', 'win-back-success',
];

const NON_CONNECT_OUTCOMES: OutcomeType[] = ['no-answer', 'voicemail', 'tech-issue'];

const LOCATION_LIST: Location[] = ['newport-beach', 'beverly-hills', 'scottsdale'];

// ---------------------------------------------------------------------------
// UUID generator (deterministic)
// ---------------------------------------------------------------------------
function pseudoUUID(): string {
  const hex = () => Math.floor(rng() * 16).toString(16);
  const seg = (n: number) => Array.from({ length: n }, hex).join('');
  return `${seg(8)}-${seg(4)}-4${seg(3)}-${['8', '9', 'a', 'b'][Math.floor(rng() * 4)]}${seg(3)}-${seg(12)}`;
}

// ---------------------------------------------------------------------------
// Transcript generation
// ---------------------------------------------------------------------------
function generateTranscript(
  outcome: OutcomeType,
  firstName: string,
  interest: string,
  location: Location,
): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];
  let ts = 0;

  const add = (speaker: 'agent' | 'caller', text: string) => {
    ts += randInt(3, 8);
    entries.push({ speaker, text, timestamp: ts });
  };

  const locName = location === 'newport-beach' ? 'Newport Beach' : location === 'beverly-hills' ? 'Beverly Hills' : 'Scottsdale';

  // No-connect outcomes get very short transcripts
  if (outcome === 'no-answer') {
    add('agent', `Calling ${firstName}...`);
    ts += 20;
    add('agent', 'No answer after multiple rings. Call ended.');
    return entries;
  }

  if (outcome === 'voicemail') {
    add('agent', `Calling ${firstName}...`);
    ts += 15;
    add('agent', `Hi ${firstName}! This is Vi from NakedMD ${locName}. I saw you were interested in learning more about our treatments! I'd love to tell you about our current specials and help you get started. Give us a call back when you get a chance, or I'll try you again soon. Have a great day!`);
    return entries;
  }

  if (outcome === 'tech-issue') {
    add('agent', `Calling ${firstName}...`);
    add('agent', 'Connection established.');
    add('agent', `Hey ${firstName}! This is Vi from NakedMD. How are you doing today?`);
    add('caller', 'Hello? I can barely hear you...');
    add('agent', "I'm sorry about that! Let me try to adjust. Can you hear me now?");
    add('caller', "No, it's really choppy. I can't understand what you're saying.");
    add('agent', "I apologize for the technical difficulties. Let me call you back on a better line. I'll reach out again shortly!");
    return entries;
  }

  // Standard greeting
  add('agent', `Hey ${firstName}! This is Vi from NakedMD ${locName}. How are you doing today?`);
  add('caller', pick([
    "Hi! I'm doing great, thanks for calling!",
    "Hey, doing well! I was expecting your call.",
    "Oh hi! Yeah, I filled out that form online.",
    "Good, thanks! I've been thinking about trying some treatments.",
  ]));

  add('agent', `Awesome! I saw you were interested in ${interest.toLowerCase()}. That's fantastic! We have some amazing treatment options for that. Have you been to a NakedMD studio before?`);
  add('caller', pick([
    "No, this would be my first time. I've heard great things though!",
    "I drove by the location but haven't been inside yet.",
    "Actually, I used to go to another med spa but I'm looking for something different.",
    "Not yet! A friend recommended you guys.",
  ]));

  // Interest-specific discussion
  if (interest === 'Lip Enhancement' || interest === 'Wrinkle Reduction') {
    add('agent', `Oh you're going to love our ${interest.toLowerCase()} treatments! We offer everything from Botox and Dysport for wrinkle reduction to lip fillers and dermal fillers for volume and definition. All performed by our licensed, experienced providers.`);
    add('caller', "That sounds amazing! How long do the results last?");
    add('agent', 'Great question! Neurotoxins like Botox typically last 3-4 months, and fillers can last 6-12 months depending on the area. We always start with a complimentary consultation to create a personalized plan.');
  } else if (interest === 'Skin Rejuvenation' || interest === 'Anti-Aging') {
    add('agent', `That's great you're interested in ${interest.toLowerCase()}! We have incredible options - from chemical peels and microneedling to advanced facials and LED therapy. Our providers create customized treatment plans based on your unique skin goals.`);
    add('caller', "That sounds exactly what I need. I've never really known where to start.");
    add('agent', 'Totally understandable! That is exactly why we start with a complimentary consultation. Your provider will assess your skin and recommend the perfect treatment path.');
  } else {
    add('agent', `Love that you're interested in ${interest.toLowerCase()}! Our ${locName} studio has everything you need - from signature facials and dermaplaning to advanced treatments like microneedling and chemical peels.`);
    add('caller', 'That sounds really nice. What treatments do you recommend for someone just starting out?');
    add('agent', "For first-timers, I usually recommend starting with a signature facial or dermaplaning to see how your skin responds. From there, your provider can build a customized regimen.");
  }

  // Pricing discussion
  add('agent', 'Let me tell you about our service tiers! Our Essential tier starts at $150/session and includes facials, peels, and dermaplaning. Premium starts at $250/session with neurotoxins and microneedling. And Luxury starts at $450/session with lip fillers, advanced injectables, and custom treatment packages.');
  add('caller', pick([
    'The Premium tier sounds really good. What exactly is included?',
    '$150 for a facial? That sounds reasonable!',
    'What does microneedling involve? That sounds interesting.',
    'How do the lip fillers work with the Luxury tier?',
  ]));

  // Outcome-specific ending
  switch (outcome) {
    case 'consultation-booked':
      add('agent', "I'd love for you to come in for a complimentary consultation! Your provider will assess your skin and create a personalized treatment plan. When would work best for you?");
      add('caller', pick([
        'How about this Saturday morning?',
        'Could I come by tomorrow after work, around 5?',
        "I'm free Wednesday afternoon!",
      ]));
      add('agent', `Perfect! I've got you booked for a consultation at our ${locName} studio. When you arrive, just check in at the front desk and mention your appointment. You are going to love it!`);
      add('caller', "Sounds great! I'm excited to check it out. Thanks, Vi!");
      add('agent', `You're welcome, ${firstName}! We are so excited to meet you. See you soon!`);
      break;

    case 'treatment-sold':
      add('agent', "Would you like to go ahead and book your first treatment? I can get you scheduled right over the phone!");
      add('caller', "You know what, let's do it! I've been putting this off long enough.");
      add('agent', "That's the spirit! I love that energy! Let me get your details and we'll get you all set up. This is going to be an amazing experience for you.");
      add('caller', "I'm ready! Let's go.");
      add('agent', `Amazing! Welcome to the NakedMD family, ${firstName}! You're all set. I'll send you a confirmation with all the details and pre-treatment instructions. You, but better!`);
      add('caller', 'Thank you so much! I can\'t wait!');
      break;

    case 'package-sold':
      add('agent', `How about this - I can set you up with our New Client Special so you can experience the NakedMD difference? $50 off your first treatment, no strings attached.`);
      add('caller', 'Oh that would be amazing! What treatments can I use it on?');
      add('agent', `You can use it on any of our services! I'll send the details to your email along with some information about the treatments we discussed.`);
      add('caller', "Perfect, that sounds great! I'll definitely come in.");
      add('agent', `Awesome! Your offer is all set, ${firstName}. Just mention it at the front desk when you arrive. We cannot wait to see you!`);
      break;

    case 'referral-generated':
      add('agent', "I'd love to get you started with a complimentary consultation so you can see everything we offer. Want me to book that for you?");
      add('caller', "Yes, that would be great! Actually, my friend might want to come too.");
      add('agent', 'That is wonderful! We have a referral program - when you bring a friend, you both receive special perks. I can set up consultations for both of you!');
      add('caller', "Let's do it!");
      add('agent', `Your consultations are booked, ${firstName}! I'll send you both the details. This is going to be fun!`);
      break;

    case 'appointment-scheduled':
      add('agent', "I'd love to schedule a time for you to come in and meet with one of our providers who can walk you through everything in detail. When works best?");
      add('caller', 'How about next Tuesday around 2 PM?');
      add('agent', `Perfect! I've scheduled your appointment for Tuesday at 2 PM at our ${locName} studio. You'll meet with one of our licensed providers who can answer all your questions and help you find the perfect treatment plan.`);
      add('caller', "Great, I'll be there. Thanks for setting that up!");
      break;

    case 'info-provided':
      add('agent', 'Is there anything else you would like to know about our treatments or services?');
      add('caller', pick([
        "I think I have enough info for now. Let me think about it and I'll call back.",
        "That's really helpful. I need to check my schedule and figure out which location works best.",
        'Thanks for all the info! I want to talk to my partner about it first.',
      ]));
      add('agent', `Absolutely, take your time ${firstName}! There is no pressure at all. When you are ready, you can book online or just walk into our ${locName} studio. We are here whenever you need us!`);
      add('caller', 'Thanks so much, Vi! I really appreciate all the info.');
      break;

    case 'nurture':
      add('agent', "I can hear you're not quite ready to commit yet, and that is totally okay! Would it be alright if I checked in with you in a couple of weeks?");
      add('caller', pick([
        "Yeah, that would be fine. I just need a bit more time.",
        "Sure, I'm still interested, just not ready to pull the trigger yet.",
        "That works. I've got some things to figure out first.",
      ]));
      add('agent', `No worries at all, ${firstName}! I'll follow up in a couple of weeks. In the meantime, feel free to reach out if any questions come up. We would love to have you at NakedMD!`);
      break;

    case 'callback-requested':
      add('caller', pick([
        "Actually, I'm kind of in the middle of something right now. Can you call me back later?",
        "Hey, this isn't a great time. Could we do this another day?",
        "I'm interested but I need to run. Can someone call me back this evening?",
      ]));
      add('agent', `Of course, no problem! When would be a better time to reach you?`);
      add('caller', pick([
        'How about tomorrow around noon?',
        'Could you try again after 5 PM today?',
        'This weekend would be better, maybe Saturday morning?',
      ]));
      add('agent', `Got it! I'll make sure we call you back then. Talk to you soon, ${firstName}!`);
      break;

    case 'info-sent':
      add('caller', "This all sounds great but I'm more of a visual person. Could you send me some info I can look over?");
      add('agent', `Absolutely! I'll send over our treatment guide with pricing details, before/after photos, and information about our ${locName} studio to your email. You'll have it in just a few minutes!`);
      add('caller', 'Perfect, thanks! I\'ll look it over and get back to you.');
      add('agent', `Sounds great, ${firstName}! Keep an eye on your inbox. And don't hesitate to reach out with any questions!`);
      break;

    case 'declined':
      add('caller', pick([
        "I appreciate the call but I'm not really interested right now.",
        "Thanks but I've decided to go with a different provider.",
        "I don't think it's for me, but thanks for reaching out.",
      ]));
      add('agent', `I totally understand, ${firstName}. No worries at all! If you ever change your mind, we would love to welcome you. Have a great rest of your day!`);
      add('caller', 'Thanks, you too!');
      break;

    case 'win-back-success':
      add('agent', "We have made some amazing improvements since you were last here! New treatments, expanded services, and our providers are the best in the business. Would you be open to coming back in?");
      add('caller', "You know what, I have been missing the results. Let me come check it out again.");
      add('agent', `That is wonderful to hear! Let me set up a complimentary consultation so you can see everything that is new. Welcome back to the NakedMD family, ${firstName}!`);
      break;
  }

  return entries;
}

function generateSummary(outcome: OutcomeType, firstName: string, interest: string): string {
  const summaries: Record<OutcomeType, string[]> = {
    'consultation-booked': [
      `${firstName} expressed strong interest in ${interest.toLowerCase()} and was excited about our treatments. Consultation scheduled at their preferred time. High likelihood of conversion.`,
      `Engaged conversation about ${interest.toLowerCase()} options. ${firstName} wants to meet with a provider before committing. Consultation booked for later this week.`,
    ],
    'treatment-sold': [
      `${firstName} was ready to commit and booked their first treatment during the call. Very enthusiastic about ${interest.toLowerCase()}. Treatment scheduled immediately.`,
      `Successful conversion! ${firstName} chose a treatment plan after learning about ${interest.toLowerCase()} options. Confirmation to be sent.`,
    ],
    'package-sold': [
      `${firstName} is interested in ${interest.toLowerCase()} and took advantage of our New Client Special. Follow up after their first visit.`,
      `New Client Special redeemed by ${firstName}. They were particularly interested in our ${interest.toLowerCase()} offerings. Good conversion potential.`,
    ],
    'referral-generated': [
      `${firstName} booked a consultation and is bringing a friend. Very interested in ${interest.toLowerCase()} and wants to experience treatments together.`,
      `Referral generated from ${firstName} who is enthusiastic about ${interest.toLowerCase()}. Both consultations scheduled.`,
    ],
    'appointment-scheduled': [
      `${firstName} wants to learn more in person. Appointment scheduled with a provider to discuss ${interest.toLowerCase()} options in detail.`,
    ],
    'callback-requested': [
      `${firstName} was unavailable for a full conversation but expressed interest. Callback scheduled for a more convenient time to discuss ${interest.toLowerCase()}.`,
      `Timing was not right for ${firstName} but they are interested in ${interest.toLowerCase()}. Callback arranged at their preferred time.`,
    ],
    'info-sent': [
      `${firstName} requested additional information about ${interest.toLowerCase()} treatments and pricing. Materials sent to their email for review.`,
      `Sent treatment guide and ${interest.toLowerCase()} details to ${firstName}. They prefer to review information before making a decision.`,
    ],
    'info-provided': [
      `Provided ${firstName} with detailed information about ${interest.toLowerCase()}, pricing, and treatment options. They need time to consider and will follow up.`,
      `${firstName} had many questions about ${interest.toLowerCase()}. Answered all inquiries thoroughly. They want to discuss with family before deciding.`,
    ],
    'nurture': [
      `${firstName} is interested but not ready to commit. Focused on ${interest.toLowerCase()}. Will follow up in 2 weeks to check in.`,
      `${firstName} needs more time before making a decision about ${interest.toLowerCase()}. Added to nurture sequence for periodic follow-up.`,
    ],
    'no-answer': [
      `Unable to reach ${firstName}. No answer after multiple rings. Will retry at a different time.`,
    ],
    'voicemail': [
      `Reached ${firstName}'s voicemail. Left a friendly message about their interest in ${interest.toLowerCase()} and our current specials.`,
    ],
    'declined': [
      `${firstName} politely declined at this time. Not interested in pursuing ${interest.toLowerCase()} with NakedMD currently. Ended call on a positive note.`,
    ],
    'tech-issue': [
      `Call with ${firstName} experienced audio/connection issues. Unable to complete the conversation. Will attempt to reach them again.`,
    ],
    'win-back-success': [
      `Successfully reconnected with former client ${firstName}. They are interested in returning for ${interest.toLowerCase()}. Complimentary consultation arranged.`,
    ],
  };

  const pool = summaries[outcome];
  return pool[Math.floor(rng() * pool.length)];
}

function generateKeyMoments(outcome: OutcomeType, interest: string): string[] {
  const moments: string[] = [];

  if (!NON_CONNECT_OUTCOMES.includes(outcome) && outcome !== 'declined') {
    moments.push(`Discussed ${interest.toLowerCase()} treatments`);
  }

  if (CONVERSION_OUTCOMES.includes(outcome)) {
    moments.push('Shared service tiers and pricing');
    moments.push(`Secured ${outcome.replace(/-/g, ' ')}`);
  } else if (outcome === 'info-provided' || outcome === 'info-sent') {
    moments.push('Detailed pricing breakdown provided');
  } else if (outcome === 'nurture') {
    moments.push('Identified timing as primary barrier');
  } else if (outcome === 'callback-requested') {
    moments.push('Scheduled callback at preferred time');
  }

  if (moments.length === 0) {
    moments.push('Call attempted');
  }

  return moments;
}

function generateObjections(outcome: OutcomeType): string[] {
  if (NON_CONNECT_OUTCOMES.includes(outcome)) return [];
  if (outcome === 'treatment-sold') return [];

  const count = outcome === 'declined' ? 2 : rng() > 0.5 ? 1 : 0;
  const objections: string[] = [];
  for (let i = 0; i < count; i++) {
    const obj = pick(OBJECTION_POOL);
    if (!objections.includes(obj)) objections.push(obj);
  }
  return objections;
}

// ---------------------------------------------------------------------------
// Duration & sentiment helpers
// ---------------------------------------------------------------------------
function durationForOutcome(outcome: OutcomeType): number {
  switch (outcome) {
    case 'no-answer': return randInt(15, 35);
    case 'voicemail': return randInt(30, 60);
    case 'tech-issue': return randInt(30, 90);
    case 'declined': return randInt(60, 150);
    case 'callback-requested': return randInt(45, 120);
    case 'treatment-sold': return randInt(240, 480);
    case 'consultation-booked': return randInt(180, 360);
    case 'package-sold': return randInt(150, 300);
    case 'referral-generated': return randInt(150, 300);
    case 'appointment-scheduled': return randInt(180, 330);
    case 'info-provided': return randInt(120, 300);
    case 'info-sent': return randInt(90, 210);
    case 'nurture': return randInt(120, 240);
    case 'win-back-success': return randInt(180, 360);
    default: return randInt(60, 300);
  }
}

function sentimentForOutcome(outcome: OutcomeType): number | null {
  switch (outcome) {
    case 'treatment-sold': return randInt(85, 95);
    case 'consultation-booked': return randInt(75, 92);
    case 'package-sold': return randInt(70, 88);
    case 'referral-generated': return randInt(72, 90);
    case 'appointment-scheduled': return randInt(70, 85);
    case 'win-back-success': return randInt(75, 90);
    case 'info-provided': return randInt(60, 80);
    case 'info-sent': return randInt(60, 78);
    case 'nurture': return randInt(55, 75);
    case 'callback-requested': return randInt(55, 72);
    case 'declined': return randInt(45, 60);
    case 'no-answer': return null;
    case 'voicemail': return null;
    case 'tech-issue': return randInt(50, 65);
    default: return randInt(55, 80);
  }
}

function confidenceForOutcome(outcome: OutcomeType): number {
  if (NON_CONNECT_OUTCOMES.includes(outcome)) return +(0.92 + rng() * 0.06).toFixed(2);
  return +(0.82 + rng() * 0.16).toFixed(2);
}

// ---------------------------------------------------------------------------
// Generate all 47 calls at module load time
// ---------------------------------------------------------------------------
function buildAllCalls(): CallRecord[] {
  const outcomes: OutcomeType[] = [];
  for (const { outcome, count } of OUTCOME_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      outcomes.push(outcome);
    }
  }

  // Shuffle outcomes for variety
  for (let i = outcomes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
  }

  const now = new Date();
  const calls: CallRecord[] = [];

  for (let i = 0; i < 47; i++) {
    const id = pseudoUUID();
    const leadId = pseudoUUID();
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const phone = `+1949${randInt(200, 999).toString().padStart(3, '0')}${randInt(1000, 9999)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 99)}@${pick(['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'])}`;
    const location: Location = LOCATION_LIST[i % 3];
    const outcome = outcomes[i];
    const interest = pick(INTERESTS);

    const duration = durationForOutcome(outcome);
    const sentiment = sentimentForOutcome(outcome);
    const confidence = confidenceForOutcome(outcome);

    // Spread calls across last 7 days
    const daysAgo = Math.floor((i / 47) * 7);
    const hoursOffset = randInt(8, 20);
    const minutesOffset = randInt(0, 59);
    const startedAt = new Date(now);
    startedAt.setDate(startedAt.getDate() - daysAgo);
    startedAt.setHours(hoursOffset, minutesOffset, randInt(0, 59), 0);

    const isConnected = !NON_CONNECT_OUTCOMES.includes(outcome);
    const connectedAt = isConnected
      ? new Date(startedAt.getTime() + randInt(3, 8) * 1000).toISOString()
      : null;
    const endedAt = new Date(startedAt.getTime() + duration * 1000).toISOString();

    const callSid = `CA${pseudoUUID().replace(/-/g, '').slice(0, 32)}`;

    const transcript = generateTranscript(outcome, firstName, interest, location);
    const summary = generateSummary(outcome, firstName, interest);
    const keyMoments = generateKeyMoments(outcome, interest);
    const objections = generateObjections(outcome);

    const status: CallStatus = outcome === 'no-answer' ? 'no-answer'
      : outcome === 'tech-issue' ? 'failed'
      : 'completed';

    calls.push({
      id,
      leadId,
      callSid,
      direction: 'outbound' as CallDirection,
      location,
      status,
      duration,
      startedAt: startedAt.toISOString(),
      connectedAt,
      endedAt,
      outcome,
      outcomeConfidence: confidence,
      sentiment,
      summary,
      keyMoments,
      objections,
      nextAction: isConnected ? `Follow up regarding ${interest.toLowerCase()}` : 'Retry call attempt',
      transcript,
      smsFollowUpSent: isConnected && rng() > 0.3,
      smsFollowUpTemplate: isConnected ? `${outcome}-followup` : null,
      smsFollowUpSentAt: isConnected ? new Date(startedAt.getTime() + (duration + 120) * 1000).toISOString() : null,
      _contact: { firstName, lastName, phone, email, interest },
    } as CallRecord & { _contact: { firstName: string; lastName: string; phone: string; email: string; interest: string } });
  }

  // Sort by startedAt descending (most recent first)
  calls.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return calls;
}

// The single generated dataset
const ALL_CALLS = buildAllCalls();

// Contact lookup map
const CONTACT_MAP = new Map<string, { firstName: string; lastName: string; phone: string; email: string; interest: string }>();
for (const call of ALL_CALLS) {
  const c = (call as CallRecord & { _contact: { firstName: string; lastName: string; phone: string; email: string; interest: string } })._contact;
  CONTACT_MAP.set(call.id, c);
}

// Call lookup map
const CALL_MAP = new Map<string, CallRecord>();
for (const call of ALL_CALLS) {
  CALL_MAP.set(call.id, call);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getAllCalls(): CallRecord[] {
  return ALL_CALLS;
}

export function getCallById(id: string): CallRecord | undefined {
  return CALL_MAP.get(id);
}

export function getContactForCall(callId: string) {
  return CONTACT_MAP.get(callId);
}

export function getFilteredCalls(filters: {
  location?: string;
  outcome?: string;
  search?: string;
  page?: number;
  limit?: number;
}): { calls: CallSummary[]; total: number; page: number; totalPages: number } {
  const { location, outcome, search, page = 1, limit = 20 } = filters;

  const filtered = ALL_CALLS.filter((call) => {
    if (location) {
      if (call.location !== location) return false;
    }
    if (outcome && call.outcome !== outcome) return false;
    if (search) {
      const q = search.toLowerCase();
      const contact = CONTACT_MAP.get(call.id);
      if (!contact) return false;
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      const phone = contact.phone;
      if (!fullName.includes(q) && !phone.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  const calls: CallSummary[] = paginated.flatMap((call) => {
    const contact = CONTACT_MAP.get(call.id);
    if (!contact) return [];
    return {
      id: call.id,
      contact: { firstName: contact.firstName, lastName: contact.lastName, phone: contact.phone },
      location: call.location,
      outcome: call.outcome,
      duration: call.duration,
      sentiment: call.sentiment,
      startedAt: call.startedAt,
    };
  });

  return { calls, total, page, totalPages };
}

export function getCallDetail(id: string): CallDetailResponse | undefined {
  const call = CALL_MAP.get(id);
  if (!call) return undefined;

  const contact = CONTACT_MAP.get(call.id);
  if (!contact) return undefined;

  return {
    id: call.id,
    leadId: call.leadId,
    contact: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      email: contact.email,
    },
    location: call.location,
    direction: call.direction,
    duration: call.duration,
    outcome: call.outcome,
    outcomeConfidence: call.outcomeConfidence,
    sentiment: call.sentiment,
    summary: call.summary,
    keyMoments: call.keyMoments,
    transcript: call.transcript,
    timestamps: {
      callInitiated: call.startedAt,
      callConnected: call.connectedAt,
      callEnded: call.endedAt,
      summaryGenerated: call.endedAt
        ? new Date(new Date(call.endedAt).getTime() + 5000).toISOString()
        : null,
      smsFollowUpSent: call.smsFollowUpSentAt,
    },
  };
}

export function getAnalytics(period: 'today' | 'week' | 'all' = 'all'): AnalyticsResponse {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  function filterByPeriod(p: 'today' | 'week' | 'all'): CallRecord[] {
    if (p === 'all') return ALL_CALLS;
    const cutoff = p === 'today' ? todayStart : weekStart;
    return ALL_CALLS.filter((c) => new Date(c.startedAt) >= cutoff);
  }

  function computeKPIs(calls: CallRecord[]): KPIs {
    const total = calls.length;
    if (total === 0) {
      return {
        totalCalls: 0,
        connectRate: 0,
        avgDuration: 0,
        consultationsBooked: 0,
        conversionRate: 0,
        escalations: 0,
        avgSentiment: 0,
      };
    }

    const connected = calls.filter((c) => !NON_CONNECT_OUTCOMES.includes(c.outcome!));
    const conversions = calls.filter((c) => CONVERSION_OUTCOMES.includes(c.outcome!));
    const sentiments = calls.map((c) => c.sentiment).filter((s): s is number => s !== null);

    return {
      totalCalls: total,
      connectRate: total > 0 ? +((connected.length / total) * 100).toFixed(1) : 0,
      avgDuration: Math.round(calls.reduce((sum, c) => sum + c.duration, 0) / total),
      consultationsBooked: calls.filter((c) => c.outcome === 'consultation-booked').length,
      conversionRate: connected.length > 0 ? +((conversions.length / connected.length) * 100).toFixed(1) : 0,
      escalations: 0,
      avgSentiment: sentiments.length > 0 ? Math.round(sentiments.reduce((a, b) => a + b, 0) / sentiments.length) : 0,
    };
  }

  const periodCalls = filterByPeriod(period);
  const kpis = computeKPIs(periodCalls);

  // Location breakdown
  const newportCalls = periodCalls.filter((c) => c.location === 'newport-beach');
  const beverlyCalls = periodCalls.filter((c) => c.location === 'beverly-hills');
  const scottsdaleCalls = periodCalls.filter((c) => c.location === 'scottsdale');

  function locationStats(calls: CallRecord[], loc: Location, name: string): LocationStats {
    const connected = calls.filter((c) => !NON_CONNECT_OUTCOMES.includes(c.outcome!));
    const outcomeCounts = new Map<OutcomeType, number>();
    for (const c of calls) {
      if (c.outcome) {
        outcomeCounts.set(c.outcome, (outcomeCounts.get(c.outcome) || 0) + 1);
      }
    }
    const topOutcomes = Array.from(outcomeCounts.entries())
      .map(([outcome, count]) => ({ outcome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      location: loc,
      name,
      totalCalls: calls.length,
      connectRate: calls.length > 0 ? +((connected.length / calls.length) * 100).toFixed(1) : 0,
      topOutcomes,
    };
  }

  // Outcome distribution
  const outcomeDistribution: Record<OutcomeType, number> = {
    'consultation-booked': 0,
    'treatment-sold': 0,
    'package-sold': 0,
    'referral-generated': 0,
    'appointment-scheduled': 0,
    'callback-requested': 0,
    'info-sent': 0,
    'info-provided': 0,
    'nurture': 0,
    'no-answer': 0,
    'voicemail': 0,
    'declined': 0,
    'tech-issue': 0,
    'win-back-success': 0,
  };

  for (const call of periodCalls) {
    if (call.outcome) {
      outcomeDistribution[call.outcome]++;
    }
  }

  // Conversion funnel
  const totalLeads = periodCalls.length;
  const connectedCalls = periodCalls.filter((c) => !NON_CONNECT_OUTCOMES.includes(c.outcome!));
  const engagedCalls = connectedCalls.filter(
    (c) => c.outcome !== 'declined' && c.outcome !== 'callback-requested',
  );
  const convertedCalls = periodCalls.filter((c) => CONVERSION_OUTCOMES.includes(c.outcome!));

  // Daily trend (last 7 days)
  const dailyTrend: Array<{ date: string; calls: number; conversions: number }> = [];
  for (let d = 6; d >= 0; d--) {
    const day = new Date(now);
    day.setDate(day.getDate() - d);
    const dateStr = day.toISOString().split('T')[0];

    const dayCalls = periodCalls.filter((c) => c.startedAt.startsWith(dateStr));
    const dayConversions = dayCalls.filter((c) => CONVERSION_OUTCOMES.includes(c.outcome!));

    dailyTrend.push({
      date: dateStr,
      calls: dayCalls.length,
      conversions: dayConversions.length,
    });
  }

  // Top objections
  const objectionCounts = new Map<string, number>();
  for (const call of periodCalls) {
    if (call.objections) {
      for (const obj of call.objections) {
        objectionCounts.set(obj, (objectionCounts.get(obj) || 0) + 1);
      }
    }
  }
  const totalObjections = Array.from(objectionCounts.values()).reduce((a, b) => a + b, 0);
  const topObjections = Array.from(objectionCounts.entries())
    .map(([objection, count]) => ({
      objection,
      count,
      percentage: totalObjections > 0 ? +((count / totalObjections) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent calls (last 10)
  const recentCalls: CallSummary[] = periodCalls.slice(0, 10).flatMap((call) => {
    const contact = CONTACT_MAP.get(call.id);
    if (!contact) return [];
    return {
      id: call.id,
      contact: { firstName: contact.firstName, lastName: contact.lastName, phone: contact.phone },
      location: call.location,
      outcome: call.outcome,
      duration: call.duration,
      sentiment: call.sentiment,
      startedAt: call.startedAt,
    };
  });

  return {
    kpis,
    locationBreakdown: {
      newportBeach: locationStats(newportCalls, 'newport-beach', 'NakedMD Newport Beach'),
      beverlyHills: locationStats(beverlyCalls, 'beverly-hills', 'NakedMD Beverly Hills'),
      scottsdale: locationStats(scottsdaleCalls, 'scottsdale', 'NakedMD Scottsdale'),
    },
    outcomeDistribution,
    conversionFunnel: {
      leads: totalLeads,
      connected: connectedCalls.length,
      engaged: engagedCalls.length,
      converted: convertedCalls.length,
    },
    dailyTrend,
    topObjections,
    recentCalls,
  };
}

// ---------------------------------------------------------------------------
// Social DM Conversations (Instagram + Facebook)
// ---------------------------------------------------------------------------

const IG_HANDLES = [
  '@jessicam_beauty', '@mikefit_la', '@sarahglow92', '@lovelylucia',
  '@tanya.the.queen', '@np_beach_vibes', '@skincare.sam', '@jennyxo',
  '@desert.rose.az', '@david.smith.bh', '@bh_beauty_hunter', '@scottsdale.sarah',
  '@karenfit', '@ashley.glam', '@beauty.by.nicole', '@tiffany.skincare',
  '@monica.newport', '@rachelglow', '@skingoals_emily', '@medspa.curious',
  '@botox.babe.bh', '@lipqueen_az', '@glow.getter.ca', '@amanda.beauty',
] as const;

const FB_HANDLES = [
  'Jessica Martinez', 'Mike Thompson', 'Sarah Chen', 'Lucia Ramirez',
  'Tanya Williams', 'Nicole Peterson', 'Sam Rivera', 'Jenny Baker',
  'Rose Anderson', 'David Smith', 'Brittany Hall', 'Sarah Johnson',
  'Karen Lee', 'Ashley Green', 'Nicole Torres', 'Tiffany Clark',
  'Monica Nguyen', 'Rachel Adams', 'Emily White', 'Megan Harris',
  'Christine Lopez', 'Diana Scott', 'Laura Mitchell', 'Amanda Carter',
] as const;

const AGENT_DM_OPENERS = [
  (firstName: string, interest: string, locName: string, adType: string) =>
    `Hey ${firstName}! 👋 This is Vi from NakedMD ${locName}. I saw you submitted a form through our ${adType} about ${interest.toLowerCase()} — so exciting! I'd love to tell you about what we can do for you. Do you have a quick sec?`,
  (firstName: string, interest: string, locName: string, adType: string) =>
    `Hi ${firstName}! 💛 Thanks for filling out our ${adType} form! I'm Vi, your personal concierge at NakedMD ${locName}. I noticed you're interested in ${interest.toLowerCase()} — great choice! Can I share some details?`,
  (firstName: string, interest: string, locName: string, adType: string) =>
    `${firstName}! 🙌 Welcome! I'm Vi from NakedMD ${locName}. We got your ${adType} form about ${interest.toLowerCase()} and I wanted to reach out personally. We have some amazing options I think you'll love. Got a minute?`,
  (firstName: string, interest: string, locName: string, adType: string) =>
    `Hey there ${firstName}! This is Vi from NakedMD ${locName} ✨ I saw you clicked through our ${adType} and expressed interest in ${interest.toLowerCase()}. I'd love to help you explore your options — are you free to chat?`,
] as const;

function generateDMConversation(
  channel: DMChannel,
  outcome: OutcomeType,
  firstName: string,
  _lastName: string,
  _handle: string,
  interest: string,
  location: Location,
  startTime: Date,
): DMMessage[] {
  const messages: DMMessage[] = [];
  let ts = new Date(startTime);

  const addMsg = (sender: 'agent' | 'prospect', text: string, minutesLater: number) => {
    ts = new Date(ts.getTime() + minutesLater * 60 * 1000);
    messages.push({ sender, text, timestamp: ts.toISOString() });
  };

  const locName = location === 'newport-beach' ? 'Newport Beach' : location === 'beverly-hills' ? 'Beverly Hills' : 'Scottsdale';
  const adType = channel === 'instagram' ? 'Instagram ad' : 'Facebook ad';

  // Agent opens — outbound after lead form submission
  const opener = AGENT_DM_OPENERS[Math.floor(rng() * AGENT_DM_OPENERS.length)];
  addMsg('agent', opener(firstName, interest, locName, adType), 0);

  if (outcome === 'no-answer') {
    // Prospect never responds to outbound DM
    addMsg('agent', `Hey ${firstName}, just circling back! 😊 We'd love to get you booked for a complimentary consultation at our ${locName} studio. No pressure at all — just reply whenever you're ready! 💛`, randInt(120, 240));
    addMsg('agent', `Hi ${firstName}! One last follow-up — we're running a New Client Special right now ($50 off your first treatment). If you're still interested in ${interest.toLowerCase()}, I'm here to help anytime! ✨`, randInt(360, 720));
    return messages;
  }

  addMsg('prospect', pick([
    'Oh hey! Yeah I filled out that form. I\'ve been wanting to try something for a while!',
    'Hi! Yes I\'m interested! I saw your ad and the results looked amazing',
    'Hey! Yeah I submitted that. I have some questions actually',
    'Hi Vi! Yes I\'d love to learn more. I\'ve been thinking about this for months',
    'Oh wow that was fast! Yes tell me more 😊',
  ]), randInt(3, 45));

  addMsg('agent', `Love that you're taking this step! 🎉 So for ${interest.toLowerCase()}, we have some incredible options at our ${locName} studio. Our treatments start at $150/session for Essential (facials, peels, dermaplaning), $250 for Premium (neurotoxins, microneedling), and $450 for Luxury (fillers, advanced injectables, custom packages). The best way to figure out what's right for you is a complimentary consultation with one of our expert providers. Want me to get you set up?`, randInt(1, 3));

  if (outcome === 'consultation-booked' || outcome === 'appointment-scheduled') {
    addMsg('prospect', pick([
      'Yes! A free consultation sounds perfect. What times do you have?',
      'Definitely! I\'d love to come in and talk to someone in person',
      'That would be great! When can I come by?',
    ]), randInt(3, 20));
    addMsg('agent', `Amazing! 📅 I have openings this week: Tuesday at 2pm, Wednesday at 11am, or Thursday at 4pm. Which works best for your schedule?`, randInt(1, 3));
    addMsg('prospect', pick([
      'Wednesday at 11am works perfectly!',
      'Thursday at 4pm please!',
      'Tuesday at 2pm would be great',
    ]), randInt(5, 30));
    addMsg('agent', `You're booked, ${firstName}! 🎉 Our ${locName} studio is at ${location === 'newport-beach' ? '369 San Miguel Dr Suite 230' : location === 'beverly-hills' ? '9735 Wilshire Blvd Suite 320' : '7014 E Camelback Rd Suite 1420'}. I'll send a confirmation with everything you need. This is going to be so exciting!`, randInt(1, 2));
    addMsg('prospect', 'Thank you so much! Can\'t wait! 😍', randInt(2, 10));
  } else if (outcome === 'treatment-sold' || outcome === 'package-sold') {
    addMsg('prospect', 'I\'m actually ready to just book something! I\'ve done my research. What do you recommend?', randInt(3, 15));
    addMsg('agent', `I love it! 🙌 Since you're interested in ${interest.toLowerCase()}, I'd recommend starting with our ${interest.includes('Lip') || interest.includes('Wrinkle') ? 'Premium or Luxury' : 'Essential or Premium'} tier. AND since you came through our ad, I can set you up with our New Client Special — $50 off your first treatment! Want me to book you in?`, randInt(1, 3));
    addMsg('prospect', 'Yes! Let\'s go! 🙏', randInt(2, 10));
    addMsg('agent', `Done! 🎉 Welcome to the NakedMD family, ${firstName}! I'm sending you a booking link now. You, but better. ✨`, randInt(1, 2));
    addMsg('prospect', 'So excited!! Thank you Vi! 💕', randInt(1, 5));
  } else if (outcome === 'info-provided' || outcome === 'info-sent') {
    addMsg('prospect', pick([
      'That\'s really helpful! I need to think about which tier is right for me',
      'Interesting! Can you send me more details? I want to look it over',
      'Thanks! I need to check my schedule and figure out timing',
    ]), randInt(5, 30));
    addMsg('agent', `Totally! No rush at all 😊 I'll send you our full treatment guide with pricing, before/afters, and all the details. Also check out nakedmd.com for more info. And remember — I'm right here in your DMs whenever you're ready! 💛`, randInt(1, 3));
    addMsg('prospect', 'Perfect, thanks so much! I\'ll review everything 🙌', randInt(2, 15));
  } else if (outcome === 'nurture') {
    addMsg('prospect', pick([
      'Hmm the pricing is a bit more than I expected. Let me think on it',
      'I\'m definitely interested but not quite ready to book yet',
      'I need to save up a little first. Maybe in a couple months?',
    ]), randInt(5, 30));
    addMsg('agent', `Completely understand, ${firstName}! 😊 No pressure at all. We run specials all the time, especially for people who came through our ads. I'll check back in with you in a couple weeks. In the meantime, keep following us for deals! 💛`, randInt(1, 3));
    addMsg('prospect', 'Sounds good, thanks for being so helpful!', randInt(3, 20));
  } else if (outcome === 'referral-generated') {
    addMsg('prospect', 'This sounds amazing! Actually my sister has been wanting to do something too. Can we both come?', randInt(3, 15));
    addMsg('agent', `Even better! 🎉 We have a referral program — when you bring someone, you BOTH get special perks! I'll set up consultations for both of you. Just have her follow @nakedmd and I'll reach out to her too!`, randInt(1, 3));
    addMsg('prospect', 'OMG perfect! She\'s going to be so excited! I\'ll tell her now 😍', randInt(2, 10));
    addMsg('agent', `Can't wait to meet you both! 💛 Sending consultation details your way shortly!`, randInt(1, 2));
  } else if (outcome === 'declined') {
    addMsg('prospect', pick([
      'Thanks for reaching out but I think I\'ll pass for now',
      'I appreciate it but I actually just signed up with another place',
      'I clicked the ad but I\'m not really ready. Sorry!',
    ]), randInt(5, 30));
    addMsg('agent', `No worries at all, ${firstName}! Thanks for letting me know 😊 If you ever change your mind, we're right here. Wishing you the best! 💛`, randInt(1, 3));
  } else if (outcome === 'callback-requested') {
    addMsg('prospect', 'Can someone actually call me? I\'d rather talk through this on the phone', randInt(3, 15));
    addMsg('agent', `Of course! 📞 I'd love to have one of our NakedMD specialists give you a call. What's your number and when's a good time to reach you?`, randInt(1, 3));
    addMsg('prospect', pick([
      'My number is 949-555-1234. After 3pm works best!',
      'Can you call 310-555-5678 tomorrow morning?',
    ]), randInt(2, 10));
    addMsg('agent', `Perfect! We'll give you a ring then. Talk soon, ${firstName}! 😊`, randInt(1, 2));
  } else {
    addMsg('prospect', 'Thanks! Let me think about it and I\'ll get back to you', randInt(5, 30));
    addMsg('agent', `Sounds great, ${firstName}! I'll be here whenever you're ready 💛 Don't forget to check out our page for the latest results and specials!`, randInt(1, 3));
  }

  return messages;
}

function generateDMSummary(channel: DMChannel, outcome: OutcomeType, firstName: string, interest: string): string {
  const platform = channel === 'instagram' ? 'Instagram' : 'Facebook';
  const adType = channel === 'instagram' ? 'Instagram ad' : 'Facebook ad';
  const summaries: Record<string, string[]> = {
    'consultation-booked': [
      `Vi agent reached out to ${firstName} via ${platform} DM after ${adType} lead form submission. Discussed ${interest.toLowerCase()} options and booked complimentary consultation.`,
      `Outbound DM to ${firstName} following ${adType} conversion. Strong engagement — consultation booked within the conversation.`,
    ],
    'treatment-sold': [
      `${firstName} submitted ${adType} lead form for ${interest.toLowerCase()}. Vi agent converted directly in ${platform} DMs — treatment booked with New Client Special applied.`,
    ],
    'package-sold': [
      `Vi outbounded ${firstName} on ${platform} after ${adType} form fill. Sold New Client Special package for ${interest.toLowerCase()} treatments.`,
    ],
    'info-provided': [
      `Vi agent DMed ${firstName} after ${adType} lead form submission. Provided ${interest.toLowerCase()} pricing and treatment details. Prospect reviewing before booking.`,
    ],
    'nurture': [
      `Outbound ${platform} DM to ${firstName} after ${adType} form fill. Interested in ${interest.toLowerCase()} but not ready to commit. Added to nurture sequence.`,
    ],
    'referral-generated': [
      `Vi agent engaged ${firstName} via ${platform} DM after ${adType} lead form. Generated referral — prospect bringing a friend for dual consultation.`,
    ],
    'declined': [
      `Outbound DM to ${firstName} following ${adType} submission. Prospect declined ${interest.toLowerCase()} treatments at this time.`,
    ],
    'no-answer': [
      `Vi agent sent outbound ${platform} DM to ${firstName} after ${adType} form submission. No response after multiple follow-ups. Will retry via voice.`,
    ],
    'callback-requested': [
      `${firstName} submitted ${adType} form. Vi agent reached out via ${platform} DM — prospect prefers phone call. Callback scheduled.`,
    ],
  };
  const pool = summaries[outcome] ?? [`Vi agent outbounded ${firstName} via ${platform} DM after ${adType} lead form submission for ${interest.toLowerCase()}. Outcome: ${outcome.replace(/-/g, ' ')}.`];
  return pool[Math.floor(rng() * pool.length)];
}

const DM_OUTCOME_DISTRIBUTION: { outcome: OutcomeType; count: number }[] = [
  { outcome: 'consultation-booked', count: 5 },
  { outcome: 'treatment-sold', count: 2 },
  { outcome: 'package-sold', count: 3 },
  { outcome: 'info-provided', count: 4 },
  { outcome: 'nurture', count: 3 },
  { outcome: 'referral-generated', count: 2 },
  { outcome: 'callback-requested', count: 2 },
  { outcome: 'declined', count: 1 },
  { outcome: 'no-answer', count: 2 },
];

function buildAllDMs(): DMConversation[] {
  const outcomes: OutcomeType[] = [];
  for (const { outcome, count } of DM_OUTCOME_DISTRIBUTION) {
    for (let i = 0; i < count; i++) outcomes.push(outcome);
  }
  // Shuffle
  for (let i = outcomes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
  }

  const now = new Date();
  const conversations: DMConversation[] = [];

  for (let i = 0; i < outcomes.length; i++) {
    const channel: DMChannel = i % 2 === 0 ? 'instagram' : 'facebook';
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const handle = channel === 'instagram'
      ? pick(IG_HANDLES)
      : pick(FB_HANDLES);
    const location = LOCATION_LIST[i % 3];
    const interest = pick(INTERESTS);
    const outcome = outcomes[i];

    const daysAgo = Math.floor((i / outcomes.length) * 7);
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(randInt(8, 21), randInt(0, 59), randInt(0, 59), 0);

    const messages = generateDMConversation(channel, outcome, firstName, lastName, handle, interest, location, startTime);
    const lastMsg = messages[messages.length - 1];
    const sentiment = sentimentForOutcome(outcome);
    const summary = generateDMSummary(channel, outcome, firstName, interest);
    const keyMoments: string[] = [];
    if (!['no-answer', 'voicemail', 'tech-issue'].includes(outcome)) {
      keyMoments.push(`Discussed ${interest.toLowerCase()} treatments`);
    }
    if (CONVERSION_OUTCOMES.includes(outcome)) {
      keyMoments.push(`Secured ${outcome.replace(/-/g, ' ')}`);
    }

    conversations.push({
      id: pseudoUUID(),
      channel,
      contact: { firstName, lastName, handle },
      location,
      outcome,
      sentiment,
      messageCount: messages.length,
      lastMessageAt: lastMsg.timestamp,
      startedAt: startTime.toISOString(),
      summary,
      keyMoments: keyMoments.length > 0 ? keyMoments : null,
      messages,
    });
  }

  conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  return conversations;
}

const ALL_DMS = buildAllDMs();
const DM_MAP = new Map<string, DMConversation>();
for (const dm of ALL_DMS) DM_MAP.set(dm.id, dm);

export function getFilteredDMs(filters: {
  channel?: DMChannel;
  location?: string;
  outcome?: string;
  search?: string;
  page?: number;
  limit?: number;
}): { conversations: DMSummary[]; total: number; page: number; totalPages: number } {
  const { channel, location, outcome, search, page = 1, limit = 20 } = filters;

  const filtered = ALL_DMS.filter((dm) => {
    if (channel && dm.channel !== channel) return false;
    if (location && dm.location !== location) return false;
    if (outcome && dm.outcome !== outcome) return false;
    if (search) {
      const q = search.toLowerCase();
      const fullName = `${dm.contact.firstName} ${dm.contact.lastName}`.toLowerCase();
      const handle = dm.contact.handle.toLowerCase();
      if (!fullName.includes(q) && !handle.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  const conversations: DMSummary[] = paginated.map((dm) => ({
    id: dm.id,
    channel: dm.channel,
    contact: dm.contact,
    location: dm.location,
    outcome: dm.outcome,
    sentiment: dm.sentiment,
    messageCount: dm.messageCount,
    lastMessageAt: dm.lastMessageAt,
    startedAt: dm.startedAt,
  }));

  return { conversations, total, page, totalPages };
}

export function getDMDetail(id: string): DMConversation | undefined {
  return DM_MAP.get(id);
}
