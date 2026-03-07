// ---------------------------------------------------------------------------
// seed-data.ts – Realistic demo calls for the NakedMD dashboard
// ---------------------------------------------------------------------------

import type {
  CallRecord,
  Lead,
  TranscriptEntry,
  OutcomeType,
  Location,
  OfferType,
  LeadSource,
  CallDirection,
} from './types/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function callId(n: number): string {
  const hex = n.toString(16).padStart(4, '0');
  return `c0000000-0000-4000-8000-00000000${hex}`;
}

function leadId(n: number): string {
  const hex = n.toString(16).padStart(4, '0');
  return `lead0000-0000-4000-8000-00000000${hex}`;
}

function callSid(n: number): string {
  return `CA${n.toString().padStart(32, '0')}`;
}

function ago(days: number, hours: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function tx(
  pairs: Array<['agent' | 'caller', string]>,
  startOffset = 0,
): TranscriptEntry[] {
  return pairs.map(([speaker, text], i) => ({
    speaker,
    text,
    timestamp: startOffset + i * 4,
  }));
}

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

const firstNames = [
  'Olivia','Sophia','Isabella','Ava','Mia','Emma','Charlotte','Amelia',
  'Harper','Ella','Jessica','Lauren','Brittany','Samantha','Nicole',
  'Ashley','Madison','Taylor','Kayla','Victoria','Natalie','Grace',
  'Chloe','Zoe','Lily','Hannah','Aria','Riley','Layla','Scarlett',
];

const lastNames = [
  'Kim','Chen','Nguyen','Park','Lee','Zhang','Martinez','Garcia',
  'Johnson','Williams','Brown','Davis','Wilson','Anderson','Thomas',
  'Moore','Taylor','White','Harris','Robinson','Clark','Lewis',
  'Walker','Hall','Young','Allen','King','Wright','Scott','Green',
];

function phone(idx: number): string {
  const raw = ((idx + 1) * 7919 + 1234567) % 10000000;
  return `+1949${raw.toString().padStart(7, '0')}`;
}

function email(first: string, last: string): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`;
}

// ---------------------------------------------------------------------------
// Interests (med spa)
// ---------------------------------------------------------------------------
const interests = [
  'lip enhancement','wrinkle reduction','skin rejuvenation','anti-aging',
  'microneedling','botox','lip fillers','dermaplaning','chemical peel',
  'acne scarring','body contouring','skincare consultation','facial treatments',
];

// ---------------------------------------------------------------------------
// Call definitions
// ---------------------------------------------------------------------------

interface CallDef {
  idx: number;
  first: string;
  last: string;
  location: Location;
  outcome: OutcomeType;
  direction: CallDirection;
  offerType: OfferType;
  interest: string;
  source: LeadSource;
  daysAgo: number;
  hoursAgo: number;
  duration: number;
  sentiment: number;
  confidence: number;
  summary: string;
  keyMoments: string[];
  objections: string[];
  nextAction: string;
  transcript: Array<['agent' | 'caller', string]>;
  smsFollowUpSent: boolean;
  smsTemplate: string | null;
}

const defs: CallDef[] = [];

// ===== CONSULTATION-BOOKED (8) =====

defs.push({
  idx: 0, first: 'Olivia', last: 'Kim', location: 'newport-beach',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'lip fillers', source: 'web-form', daysAgo: 0, hoursAgo: 2,
  duration: 285, sentiment: 92, confidence: 0.96,
  summary: 'Olivia expressed strong interest in lip fillers at the Newport Beach location. She asked about the process, pricing, and downtime. A complimentary consultation was booked for Thursday afternoon.',
  keyMoments: ['Asked about lip filler brands used', 'Interested in natural-looking results', 'Consultation booked for Thursday 2pm'],
  objections: ['Concerned about looking overdone'],
  nextAction: 'Consultation confirmed for Thursday 2pm at Newport Beach',
  transcript: [
    ['agent', 'Hi Olivia, this is Vi calling from NakedMD. How are you today?'],
    ['caller', 'Hi! I\'m good, thanks for reaching out.'],
    ['agent', 'Of course! I saw you submitted a form about lip fillers — that\'s one of our most popular treatments. What kind of look are you going for?'],
    ['caller', 'I just want a subtle enhancement. I\'m worried about looking overdone.'],
    ['agent', 'That\'s actually what we specialize in — natural-looking results. Our injectors are trained in the "you, but better" approach. We use premium fillers like Juvederm and Restylane, and everything starts with a free consultation where your provider creates a personalized plan.'],
    ['caller', 'That sounds great. How much does it usually cost?'],
    ['agent', 'Lip fillers typically range from $450 to $850 per syringe depending on the product and amount needed. Most clients start with one syringe for a subtle enhancement. Your provider will recommend exactly what you need during the consultation.'],
    ['caller', 'And how long does the actual treatment take?'],
    ['agent', 'Only about 30 to 45 minutes. Most clients go right back to their normal activities — maybe just a little swelling for a day or two. Would you like to come in for a complimentary consultation?'],
    ['caller', 'Yes, I\'d love that!'],
    ['agent', 'Wonderful! How does Thursday afternoon work for you?'],
    ['caller', 'Thursday at 2pm would be perfect.'],
    ['agent', 'You\'re all set for Thursday at 2pm at our Newport Beach location — 369 San Miguel Drive, Suite 230. I\'ll text you the details. We\'re so excited to meet you!'],
    ['caller', 'Thank you so much!'],
    ['agent', 'You\'re welcome, Olivia! See you Thursday!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 1, first: 'Sophia', last: 'Chen', location: 'beverly-hills',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'botox', source: 'web-form', daysAgo: 0, hoursAgo: 4,
  duration: 198, sentiment: 85, confidence: 0.93,
  summary: 'Sophia inquired about Botox for forehead lines. She was pleased to learn about the new client $50 discount and booked a consultation for next Monday.',
  keyMoments: ['Excited about $50 off new client offer', 'Asked about Botox vs Dysport', 'Consultation booked for Monday 11am'],
  objections: ['Wanted to compare with another provider'],
  nextAction: 'Consultation confirmed for Monday 11am at Beverly Hills',
  transcript: [
    ['agent', 'Hi Sophia, this is Vi from NakedMD Beverly Hills. How are you today?'],
    ['caller', 'Good! I\'ve been looking into getting Botox for my forehead lines.'],
    ['agent', 'You\'ve come to the right place! Our Beverly Hills team has some of the most experienced injectors in the area. Have you had neurotoxins before?'],
    ['caller', 'No, this would be my first time. I\'m a little nervous actually.'],
    ['agent', 'That\'s completely normal! The consultation is totally pressure-free — your provider will look at the areas you\'re concerned about and explain exactly what they\'d recommend. And as a new client, you\'ll get $50 off your first treatment.'],
    ['caller', 'Oh that\'s a nice perk. How quickly would I see results?'],
    ['agent', 'Most clients start seeing results within 3 to 5 days, with full results in about two weeks. It\'s very quick — the treatment itself only takes about 15 to 30 minutes.'],
    ['caller', 'That sounds great. Can I book a consultation?'],
    ['agent', 'Absolutely! How does Monday morning work?'],
    ['caller', 'Monday at 11am would work.'],
    ['agent', 'Perfect! You\'re booked for Monday at 11am at our Beverly Hills location. I\'ll send you a text with all the details.'],
    ['caller', 'Thank you, Vi!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 2, first: 'Isabella', last: 'Nguyen', location: 'scottsdale',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'vip-experience',
  interest: 'skin rejuvenation', source: 'web-form', daysAgo: 1, hoursAgo: 1,
  duration: 342, sentiment: 90, confidence: 0.94,
  summary: 'Isabella was interested in comprehensive skin rejuvenation. She was excited about the VIP experience with a complimentary dermaplaning session and booked for this Friday.',
  keyMoments: ['VIP experience appealed to her', 'Interested in microneedling + dermaplaning combo', 'Booked for Friday 3pm'],
  objections: [],
  nextAction: 'VIP consultation confirmed for Friday 3pm at Scottsdale',
  transcript: [
    ['agent', 'Hi Isabella, this is Vi from NakedMD Scottsdale. How are you doing today?'],
    ['caller', 'Great, thanks! I\'m really excited about looking into some skin treatments.'],
    ['agent', 'I love the enthusiasm! I see you selected our VIP Experience — that\'s a wonderful way to start. You\'ll get a complimentary consultation plus a dermaplaning or mini facial so you can experience our standard of care firsthand.'],
    ['caller', 'That\'s amazing. I\'ve been wanting to try microneedling too. Is that something I could do on the same visit?'],
    ['agent', 'Your provider can absolutely discuss microneedling during the consultation and even schedule it right after if you\'d like. Many clients love the microneedling and dermaplaning combo.'],
    ['caller', 'Perfect. What does microneedling run?'],
    ['agent', 'Microneedling typically ranges from $350 to $600 per session, depending on the treatment area. Most clients do a series of 3 sessions for the best results. Your provider will create a personalized plan.'],
    ['caller', 'Sounds good. Can I come in Friday afternoon?'],
    ['agent', 'Of course! How does 3pm work?'],
    ['caller', 'That\'s perfect!'],
    ['agent', 'Wonderful! You\'re all set for Friday at 3pm at our Scottsdale location — 7014 East Camelback Road, Suite 1420. I\'ll text you everything you need to know!'],
    ['caller', 'Thank you so much, Vi!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 3, first: 'Ava', last: 'Park', location: 'newport-beach',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'anti-aging', source: 'web-form', daysAgo: 1, hoursAgo: 5,
  duration: 267, sentiment: 87, confidence: 0.91,
  summary: 'Ava is interested in anti-aging treatments for early prevention. She booked a consultation to discuss a comprehensive plan combining neurotoxins and skincare.',
  keyMoments: ['Interested in preventative Botox', 'Asked about skincare regimen', 'Consultation booked for Wednesday'],
  objections: ['Wasn\'t sure if she was "old enough" for treatments'],
  nextAction: 'Consultation confirmed for Wednesday 4pm at Newport Beach',
  transcript: [
    ['agent', 'Hi Ava, this is Vi from NakedMD Newport Beach. Thanks for reaching out!'],
    ['caller', 'Hi! I\'m honestly not sure if I even need anything yet — I\'m only 28. But I keep hearing about preventative treatments.'],
    ['agent', 'You\'re actually at the perfect age to start! Preventative treatments like baby Botox can help keep fine lines from forming in the first place. A lot of our clients in their late 20s come in for exactly this.'],
    ['caller', 'Oh good, I was worried I\'d seem silly coming in.'],
    ['agent', 'Not at all — it\'s actually really smart. During your free consultation, your provider will assess your skin and recommend what makes sense for where you are now. There\'s absolutely no obligation.'],
    ['caller', 'That sounds perfect. I\'d like to book one.'],
    ['agent', 'How does Wednesday afternoon work?'],
    ['caller', 'Wednesday at 4pm would be great.'],
    ['agent', 'You\'re all set! Wednesday at 4pm at Newport Beach. I\'ll text you the details.'],
    ['caller', 'Thank you!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 4, first: 'Mia', last: 'Lee', location: 'beverly-hills',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'lip enhancement', source: 'web-form', daysAgo: 2, hoursAgo: 1,
  duration: 225, sentiment: 83, confidence: 0.89,
  summary: 'Mia wants lip filler but wanted to understand the difference between products. Consultation booked after learning about the personalized approach.',
  keyMoments: ['Compared Juvederm vs Restylane', 'Appreciated $50 new client offer', 'Booked Tuesday consultation'],
  objections: ['Price concern - resolved with new client discount'],
  nextAction: 'Consultation Tuesday 10am at Beverly Hills',
  transcript: [
    ['agent', 'Hi Mia, this is Vi from NakedMD. I see you\'re interested in lip enhancement — great choice!'],
    ['caller', 'Yes! I\'ve been researching and I\'m not sure which filler is better — Juvederm or Restylane?'],
    ['agent', 'That\'s such a good question. Both are excellent — it really comes down to the look you want and your lip anatomy. Your provider will recommend the best option during your free consultation.'],
    ['caller', 'Makes sense. How much am I looking at?'],
    ['agent', 'Lip fillers range from $450 to $850 per syringe. And as a new client, you\'ll get $50 off your first treatment, which is a nice bonus.'],
    ['caller', 'Oh nice. Let me book a consultation then.'],
    ['agent', 'How does Tuesday morning work? Say 10am?'],
    ['caller', 'That works!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 5, first: 'Emma', last: 'Zhang', location: 'scottsdale',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'microneedling', source: 'web-form', daysAgo: 2, hoursAgo: 3,
  duration: 195, sentiment: 86, confidence: 0.92,
  summary: 'Emma wants microneedling for acne scarring. Booked a consultation after learning about the treatment process and expected results.',
  keyMoments: ['Acne scarring is primary concern', 'Interested in treatment series', 'Booked consultation'],
  objections: [],
  nextAction: 'Consultation this week at Scottsdale',
  transcript: [
    ['agent', 'Hi Emma, this is Vi from NakedMD Scottsdale! I see you\'re interested in microneedling.'],
    ['caller', 'Yes, I have some acne scarring I\'d really like to improve.'],
    ['agent', 'Microneedling is one of the best treatments for acne scarring — it stimulates your skin\'s natural collagen production. Most clients see significant improvement after a series of 3 sessions.'],
    ['caller', 'How far apart are the sessions?'],
    ['agent', 'Typically 4 to 6 weeks apart. Your provider will create a customized plan during your free consultation.'],
    ['caller', 'That sounds great. Let\'s book it!'],
    ['agent', 'Wonderful! I\'ll get you set up this week. I\'ll text you the details!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 6, first: 'Charlotte', last: 'Martinez', location: 'newport-beach',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'vip-experience',
  interest: 'facial treatments', source: 'web-form', daysAgo: 3, hoursAgo: 2,
  duration: 310, sentiment: 94, confidence: 0.97,
  summary: 'Charlotte is looking for a full skincare overhaul. Very excited about the VIP experience. Booked for this weekend.',
  keyMoments: ['Wants complete skincare plan', 'Thrilled about complimentary dermaplaning', 'Saturday appointment booked'],
  objections: [],
  nextAction: 'VIP consultation Saturday 11am at Newport Beach',
  transcript: [
    ['agent', 'Hi Charlotte, this is Vi from NakedMD. I see you selected our VIP Experience — you\'re going to love it!'],
    ['caller', 'I\'m so excited! I really want to get my skin in the best shape possible.'],
    ['agent', 'That\'s exactly what we\'re here for. With the VIP Experience, you\'ll get a full consultation plus a complimentary dermaplaning treatment so you can see the NakedMD difference.'],
    ['caller', 'Amazing! I\'ve never had dermaplaning before. Is it safe for sensitive skin?'],
    ['agent', 'Great question — yes, dermaplaning is very gentle. Your provider will check your skin first and make sure it\'s right for you. Most clients are amazed at how smooth their skin feels immediately after.'],
    ['caller', 'Can I come in Saturday?'],
    ['agent', 'Of course! How about 11am?'],
    ['caller', 'Perfect!'],
    ['agent', 'You\'re all set for Saturday at 11am at our Newport Beach location. I\'ll send you all the details!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 7, first: 'Amelia', last: 'Garcia', location: 'beverly-hills',
  outcome: 'consultation-booked', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'wrinkle reduction', source: 'web-form', daysAgo: 0, hoursAgo: 6,
  duration: 240, sentiment: 81, confidence: 0.88,
  summary: 'Amelia wants to address crow\'s feet and forehead lines. She appreciated the provider expertise explanation and booked a consultation.',
  keyMoments: ['Concerned about crow\'s feet', 'Asked about provider qualifications', 'Booked consultation'],
  objections: ['Wanted to know provider credentials'],
  nextAction: 'Consultation next week at Beverly Hills',
  transcript: [
    ['agent', 'Hi Amelia, this is Vi from NakedMD Beverly Hills!'],
    ['caller', 'Hi! I\'m calling about wrinkle reduction — mainly around my eyes and forehead.'],
    ['agent', 'Those are two of our most common treatment areas. Neurotoxins like Botox work beautifully for crow\'s feet and forehead lines. How long have they been bothering you?'],
    ['caller', 'A couple years now. I want someone who really knows what they\'re doing though.'],
    ['agent', 'Absolutely. Our injectors have years of specialized training and perform these treatments every single day. During your free consultation, you\'ll meet your provider and they\'ll explain exactly what they recommend for your concerns.'],
    ['caller', 'That\'s reassuring. Let\'s book it.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

// ===== TREATMENT-SOLD (5) =====

defs.push({
  idx: 8, first: 'Harper', last: 'Johnson', location: 'newport-beach',
  outcome: 'treatment-sold', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'lip fillers', source: 'web-form', daysAgo: 3, hoursAgo: 4,
  duration: 380, sentiment: 95, confidence: 0.97,
  summary: 'Harper had done extensive research and was ready to book lip fillers. She scheduled her treatment for next week and was excited about the $50 new client discount.',
  keyMoments: ['Already researched extensively', 'Chose Juvederm', 'Treatment booked for next Wednesday'],
  objections: [],
  nextAction: 'Lip filler treatment Wednesday at Newport Beach',
  transcript: [
    ['agent', 'Hi Harper, this is Vi from NakedMD!'],
    ['caller', 'Hi! I\'ve been doing a ton of research and I\'m ready to get lip fillers. I want Juvederm Ultra.'],
    ['agent', 'You\'ve done your homework! Juvederm Ultra is an excellent choice. Have you had fillers before?'],
    ['caller', 'No, but I know exactly what I want — just a subtle plump, nothing crazy.'],
    ['agent', 'Perfect. Our providers are specialists in that natural look. Would you like to come in for a consultation first, or are you ready to book the treatment directly?'],
    ['caller', 'I\'m ready to just book it. When can I come in?'],
    ['agent', 'How about next Wednesday? And as a new client, you\'ll get $50 off.'],
    ['caller', 'Wednesday works! Sign me up.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'welcome',
});

defs.push({
  idx: 9, first: 'Ella', last: 'Williams', location: 'beverly-hills',
  outcome: 'treatment-sold', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'botox', source: 'web-form', daysAgo: 4, hoursAgo: 2,
  duration: 290, sentiment: 88, confidence: 0.93,
  summary: 'Ella came in for a consultation and booked Botox treatment on the same day. Very satisfied with the provider consultation experience.',
  keyMoments: ['Consultation converted to treatment same day', 'Provider recommended 20 units', 'Treatment booked same week'],
  objections: [],
  nextAction: 'Botox treatment this week at Beverly Hills',
  transcript: [
    ['agent', 'Hi Ella, this is Vi from NakedMD! Calling about your complimentary consultation request.'],
    ['caller', 'Yes! I\'ve been getting Botox at another place but I want to try NakedMD.'],
    ['agent', 'We\'d love to have you! Since you already know what you like, we can do a quick consultation and potentially treat on the same visit if you\'d like.'],
    ['caller', 'That would be ideal. When can I come in?'],
    ['agent', 'We have availability this Thursday. Would morning or afternoon work better?'],
    ['caller', 'Morning please. And yes, I\'d love to just do the treatment right after.'],
    ['agent', 'Perfect! Thursday morning it is. I\'ll make sure we schedule enough time for both.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'welcome',
});

defs.push({
  idx: 10, first: 'Jessica', last: 'Brown', location: 'scottsdale',
  outcome: 'treatment-sold', direction: 'outbound', offerType: 'vip-experience',
  interest: 'dermaplaning', source: 'web-form', daysAgo: 5, hoursAgo: 1,
  duration: 265, sentiment: 91, confidence: 0.95,
  summary: 'Jessica came for VIP experience and loved the dermaplaning so much she booked a full microneedling series on the spot.',
  keyMoments: ['VIP dermaplaning was a gateway', 'Upgraded to microneedling package', 'Booked 3-session series'],
  objections: [],
  nextAction: 'Microneedling series starting next week at Scottsdale',
  transcript: [
    ['agent', 'Hi Jessica, this is Vi from NakedMD Scottsdale!'],
    ['caller', 'Hi! I just had my VIP experience and oh my god, my skin has never felt this good.'],
    ['agent', 'That makes us so happy to hear! Dermaplaning is just the beginning — imagine how your skin would look after a microneedling series!'],
    ['caller', 'Tell me more about the series. I\'m sold on NakedMD now.'],
    ['agent', 'A microneedling series is 3 sessions, spaced 4-6 weeks apart. It stimulates deep collagen production for long-lasting results. Your skin will keep improving for months.'],
    ['caller', 'Let\'s do it. Book me for the series!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'welcome',
});

defs.push({
  idx: 11, first: 'Lauren', last: 'Davis', location: 'newport-beach',
  outcome: 'treatment-sold', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'chemical peel', source: 'web-form', daysAgo: 1, hoursAgo: 7,
  duration: 210, sentiment: 84, confidence: 0.90,
  summary: 'Lauren booked a chemical peel treatment after learning about the different peel strengths and recovery process.',
  keyMoments: ['Chose medium-depth peel', 'Used $50 new client discount', 'Booked for Friday'],
  objections: ['Worried about peeling and downtime'],
  nextAction: 'Chemical peel treatment Friday at Newport Beach',
  transcript: [
    ['agent', 'Hi Lauren, this is Vi from NakedMD!'],
    ['caller', 'Hi! I\'m interested in a chemical peel but nervous about the downtime.'],
    ['agent', 'That\'s a great concern to bring up. We offer different peel strengths — a light peel has minimal downtime, maybe a day of slight redness. Your provider will recommend the right level for your goals.'],
    ['caller', 'Okay, that\'s not bad at all. Can I book one?'],
    ['agent', 'Absolutely! And don\'t forget your $50 new client discount. How does Friday work?'],
    ['caller', 'Friday is perfect!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'welcome',
});

defs.push({
  idx: 12, first: 'Brittany', last: 'Wilson', location: 'beverly-hills',
  outcome: 'treatment-sold', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'lip enhancement', source: 'web-form', daysAgo: 6, hoursAgo: 3,
  duration: 340, sentiment: 93, confidence: 0.96,
  summary: 'Brittany wanted a lip flip (Botox in the upper lip) and booked treatment after detailed explanation of the technique.',
  keyMoments: ['Knew about lip flip technique', 'Provider expertise impressed her', 'Booked same week'],
  objections: [],
  nextAction: 'Lip flip treatment this week at Beverly Hills',
  transcript: [
    ['agent', 'Hi Brittany, this is Vi from NakedMD Beverly Hills!'],
    ['caller', 'Hey! I\'m interested in a lip flip — not filler, but the Botox lip flip. Do you guys do that?'],
    ['agent', 'We absolutely do! The lip flip is a great option for a subtle enhancement. Just a few units of Botox along the upper lip to create a beautiful, natural-looking result.'],
    ['caller', 'Exactly what I want. How much is it?'],
    ['agent', 'A lip flip is typically around $150 to $250 depending on the units needed. It\'s one of our quickest treatments — in and out in about 15 minutes.'],
    ['caller', 'Amazing. When can I come in?'],
    ['agent', 'How does this Thursday work?'],
    ['caller', 'Book it!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'welcome',
});

// ===== APPOINTMENT-SCHEDULED (3) =====

defs.push({
  idx: 13, first: 'Samantha', last: 'Anderson', location: 'scottsdale',
  outcome: 'appointment-scheduled', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'anti-aging', source: 'web-form', daysAgo: 2, hoursAgo: 5,
  duration: 190, sentiment: 79, confidence: 0.87,
  summary: 'Samantha wants to discuss a comprehensive anti-aging plan. Scheduled a consultation to explore multiple treatment options.',
  keyMoments: ['Interested in combination treatments', 'Wants long-term skincare plan', 'Appointment set for next week'],
  objections: ['Concerned about combining multiple treatments'],
  nextAction: 'Comprehensive consultation next week at Scottsdale',
  transcript: [
    ['agent', 'Hi Samantha, this is Vi from NakedMD Scottsdale!'],
    ['caller', 'Hi! I want to talk to someone about a full anti-aging plan. I\'m not sure where to start.'],
    ['agent', 'That\'s exactly what our consultations are designed for! Your provider will assess your skin, discuss your goals, and create a phased plan — maybe starting with neurotoxins and building from there.'],
    ['caller', 'That sounds perfect. I just don\'t want to do too much at once.'],
    ['agent', 'Absolutely — we always recommend a gradual approach. Let\'s get you scheduled!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 14, first: 'Nicole', last: 'Thomas', location: 'newport-beach',
  outcome: 'appointment-scheduled', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'skincare consultation', source: 'web-form', daysAgo: 3, hoursAgo: 6,
  duration: 175, sentiment: 82, confidence: 0.85,
  summary: 'Nicole wants a professional skincare assessment. Scheduled for next week.',
  keyMoments: ['Currently using drugstore products', 'Wants medical-grade skincare advice', 'Appointment booked'],
  objections: [],
  nextAction: 'Skincare consultation next week at Newport Beach',
  transcript: [
    ['agent', 'Hi Nicole, this is Vi from NakedMD!'],
    ['caller', 'Hi! I feel like I need a professional to look at my skin and tell me what I should actually be using.'],
    ['agent', 'That\'s such a smart approach. Our providers can analyze your skin type and concerns, then recommend medical-grade products and treatments that will make a real difference. Way more effective than guessing at the drugstore.'],
    ['caller', 'Yes! That\'s exactly what I need. Can I come in next week?'],
    ['agent', 'Absolutely! I\'ll get you scheduled. Plus, you\'ll get $50 off any treatment you decide to do.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'new_client_info',
});

defs.push({
  idx: 15, first: 'Ashley', last: 'Moore', location: 'beverly-hills',
  outcome: 'appointment-scheduled', direction: 'outbound', offerType: 'vip-experience',
  interest: 'body contouring', source: 'web-form', daysAgo: 4, hoursAgo: 1,
  duration: 220, sentiment: 78, confidence: 0.84,
  summary: 'Ashley is interested in body contouring options. Scheduled VIP experience to explore treatments.',
  keyMoments: ['Asked about non-surgical body contouring', 'Interested in multiple sessions', 'VIP appointment booked'],
  objections: ['Wanted realistic expectations about results'],
  nextAction: 'VIP consultation at Beverly Hills',
  transcript: [
    ['agent', 'Hi Ashley, this is Vi from NakedMD Beverly Hills!'],
    ['caller', 'Hi! I\'m interested in body contouring — something non-surgical.'],
    ['agent', 'Great! We have several non-surgical options. During your VIP experience, your provider will evaluate your goals and recommend the best approach. Plus you\'ll get a complimentary treatment to experience our care firsthand.'],
    ['caller', 'That sounds wonderful. I want to be realistic about what to expect though.'],
    ['agent', 'Absolutely — our providers are very transparent about expected results. No overselling, just honest recommendations. Let\'s get you booked!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

// ===== NURTURE (3) =====

defs.push({
  idx: 16, first: 'Madison', last: 'Taylor', location: 'newport-beach',
  outcome: 'nurture', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'lip fillers', source: 'web-form', daysAgo: 1, hoursAgo: 3,
  duration: 165, sentiment: 65, confidence: 0.82,
  summary: 'Madison is interested but wants to think about it. Agreed to receive info via text.',
  keyMoments: ['Interested but hesitant', 'Wants to discuss with partner first', 'Opted in for text info'],
  objections: ['Wants to discuss with partner', 'Not ready to commit today'],
  nextAction: 'Follow up in 1 week with special offer',
  transcript: [
    ['agent', 'Hi Madison, this is Vi from NakedMD!'],
    ['caller', 'Hi! I submitted a form about lip fillers but I\'m still on the fence.'],
    ['agent', 'No pressure at all! What questions do you have? I\'m happy to help with whatever you\'re thinking about.'],
    ['caller', 'I guess I just need to talk to my husband about it first.'],
    ['agent', 'Completely understand! Would you like me to text you all the details so you have everything to discuss together?'],
    ['caller', 'Yes, that would be great actually.'],
    ['agent', 'Done! Take your time, and when you\'re ready, we\'re here for you.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'general_followup',
});

defs.push({
  idx: 17, first: 'Taylor', last: 'White', location: 'scottsdale',
  outcome: 'nurture', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'botox', source: 'web-form', daysAgo: 5, hoursAgo: 2,
  duration: 140, sentiment: 60, confidence: 0.78,
  summary: 'Taylor is comparing NakedMD with another provider. Sent pricing info to help with decision.',
  keyMoments: ['Currently seeing another injector', 'Comparing pricing', 'Interested but not committed'],
  objections: ['Already has a provider', 'Comparing prices'],
  nextAction: 'Follow up in 2 weeks',
  transcript: [
    ['agent', 'Hi Taylor, this is Vi from NakedMD Scottsdale!'],
    ['caller', 'Hi, I\'m actually already getting Botox somewhere else but I saw your ad and wanted to compare.'],
    ['agent', 'Of course! We\'re always happy to chat. What made you curious about NakedMD?'],
    ['caller', 'Honestly, I feel like I\'m paying too much. What do you charge per unit?'],
    ['agent', 'Our neurotoxin pricing is $12 to $15 per unit. And new clients get $50 off their first treatment.'],
    ['caller', 'That\'s competitive. Let me think about it.'],
    ['agent', 'Take your time! I\'ll text you the info so you have it when you\'re ready.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'pricing_summary',
});

defs.push({
  idx: 18, first: 'Kayla', last: 'Harris', location: 'beverly-hills',
  outcome: 'nurture', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'skin rejuvenation', source: 'web-form', daysAgo: 2, hoursAgo: 8,
  duration: 130, sentiment: 62, confidence: 0.75,
  summary: 'Kayla is interested but wants to do more research first. Opted in for follow-up text.',
  keyMoments: ['First time considering med spa treatments', 'Wants to research more', 'Open to follow-up'],
  objections: ['Never had any treatments before', 'Wants more time to research'],
  nextAction: 'Follow up in 1 week with educational content',
  transcript: [
    ['agent', 'Hi Kayla, this is Vi from NakedMD Beverly Hills!'],
    ['caller', 'Hi! I submitted a form but honestly I\'m just starting to look into all this. I don\'t know much about med spa treatments.'],
    ['agent', 'That\'s totally fine! Everyone starts somewhere. Would you like me to send you some info about our most popular treatments so you can browse at your own pace?'],
    ['caller', 'Yes please, that would be really helpful.'],
    ['agent', 'I\'ll text you a summary right now. And whenever you have questions or feel ready, we\'re here!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'general_followup',
});

// ===== OTHER OUTCOMES =====

defs.push({
  idx: 19, first: 'Victoria', last: 'Clark', location: 'newport-beach',
  outcome: 'info-provided', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'microneedling', source: 'web-form', daysAgo: 4, hoursAgo: 3,
  duration: 180, sentiment: 72, confidence: 0.83,
  summary: 'Victoria had many questions about microneedling. All questions answered, she\'ll call back when ready.',
  keyMoments: ['Detailed questions about procedure', 'Asked about recovery timeline', 'Will call back'],
  objections: ['Recovery timing didn\'t work with upcoming event'],
  nextAction: 'Client will call back after event in 3 weeks',
  transcript: [
    ['agent', 'Hi Victoria, this is Vi from NakedMD!'],
    ['caller', 'Hi! I have a bunch of questions about microneedling before I commit.'],
    ['agent', 'I\'m happy to answer everything! What would you like to know?'],
    ['caller', 'How long is the recovery? I have an event in two weeks.'],
    ['agent', 'You\'ll have redness for about 24-48 hours, and your skin will be sensitive for about a week. For an event in two weeks, I\'d recommend waiting until after.'],
    ['caller', 'That\'s what I was thinking. I\'ll call back after my event.'],
    ['agent', 'That makes sense! We\'ll be here whenever you\'re ready.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'pricing_summary',
});

defs.push({
  idx: 20, first: 'Natalie', last: 'Lewis', location: 'scottsdale',
  outcome: 'declined', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'botox', source: 'web-form', daysAgo: 3, hoursAgo: 5,
  duration: 95, sentiment: 45, confidence: 0.88,
  summary: 'Natalie decided against treatment after learning more. Respectfully closed the conversation.',
  keyMoments: ['Changed mind about treatments', 'Politely declined'],
  objections: ['Decided against cosmetic treatments'],
  nextAction: 'No follow-up needed',
  transcript: [
    ['agent', 'Hi Natalie, this is Vi from NakedMD!'],
    ['caller', 'Hi — actually, I submitted that form kind of impulsively. I don\'t think I\'m ready for Botox.'],
    ['agent', 'No pressure at all! These decisions are completely personal. If you ever change your mind, we\'re here.'],
    ['caller', 'Thanks for being so understanding.'],
    ['agent', 'Of course! Take care, Natalie.'],
  ],
  smsFollowUpSent: false, smsTemplate: null,
});

defs.push({
  idx: 21, first: 'Grace', last: 'Robinson', location: 'beverly-hills',
  outcome: 'no-answer', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'lip fillers', source: 'web-form', daysAgo: 0, hoursAgo: 1,
  duration: 0, sentiment: 50, confidence: 1.0,
  summary: 'Call went unanswered.',
  keyMoments: [], objections: [],
  nextAction: 'Retry call in 2 hours',
  transcript: [],
  smsFollowUpSent: false, smsTemplate: null,
});

defs.push({
  idx: 22, first: 'Chloe', last: 'Walker', location: 'newport-beach',
  outcome: 'voicemail', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'anti-aging', source: 'web-form', daysAgo: 1, hoursAgo: 4,
  duration: 32, sentiment: 50, confidence: 1.0,
  summary: 'Went to voicemail. Follow-up text sent.',
  keyMoments: [], objections: [],
  nextAction: 'Retry call tomorrow',
  transcript: [
    ['agent', 'Hi Chloe, this is Vi from NakedMD calling about your consultation request. I\'d love to help you get booked — please call us back or reply to the text I\'m sending. Talk soon!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'general_followup',
});

defs.push({
  idx: 23, first: 'Zoe', last: 'Hall', location: 'scottsdale',
  outcome: 'callback-requested', direction: 'outbound', offerType: 'complimentary-consult',
  interest: 'wrinkle reduction', source: 'web-form', daysAgo: 0, hoursAgo: 3,
  duration: 65, sentiment: 70, confidence: 0.90,
  summary: 'Zoe answered but was in a meeting. Requested callback this evening.',
  keyMoments: ['Requested callback at 6pm'],
  objections: [],
  nextAction: 'Callback today at 6pm',
  transcript: [
    ['agent', 'Hi Zoe, this is Vi from NakedMD!'],
    ['caller', 'Hey! I\'m actually in a meeting right now. Can you call me back around 6?'],
    ['agent', 'Of course! I\'ll call you back at 6pm. Talk to you then!'],
    ['caller', 'Thanks!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'general_followup',
});

defs.push({
  idx: 24, first: 'Lily', last: 'Young', location: 'newport-beach',
  outcome: 'referral-generated', direction: 'outbound', offerType: 'vip-experience',
  interest: 'lip fillers', source: 'web-form', daysAgo: 2, hoursAgo: 2,
  duration: 250, sentiment: 96, confidence: 0.95,
  summary: 'Lily booked her consultation and also wants to bring her sister. Referred a friend as well.',
  keyMoments: ['Booked own consultation', 'Sister wants to come too', 'Referred a friend from work'],
  objections: [],
  nextAction: 'Two referral consultations to schedule',
  transcript: [
    ['agent', 'Hi Lily, this is Vi from NakedMD!'],
    ['caller', 'Hey! So I want to book, but also — can my sister come with me? She wants lip fillers too!'],
    ['agent', 'We\'d love that! We can book you both back-to-back so you can do it together.'],
    ['caller', 'Amazing! Oh and my friend from work asked me to ask about Botox too. Can she get the new client offer?'],
    ['agent', 'Absolutely! All three of you would get the new client special. I\'ll set everything up.'],
    ['caller', 'You guys are the best!'],
  ],
  smsFollowUpSent: true, smsTemplate: 'consultation_confirmation',
});

defs.push({
  idx: 25, first: 'Hannah', last: 'Allen', location: 'beverly-hills',
  outcome: 'win-back-success', direction: 'outbound', offerType: 'new-client-offer',
  interest: 'botox', source: 'web-form', daysAgo: 5, hoursAgo: 6,
  duration: 275, sentiment: 82, confidence: 0.91,
  summary: 'Hannah used to go to NakedMD but switched providers. Lured back with new client offer and improved service offerings.',
  keyMoments: ['Former client returning', 'Left due to scheduling issues', 'Impressed by new location hours'],
  objections: ['Had scheduling difficulties before'],
  nextAction: 'Welcome back consultation booked',
  transcript: [
    ['agent', 'Hi Hannah, this is Vi from NakedMD Beverly Hills!'],
    ['caller', 'Hi! I actually used to go to NakedMD a couple years ago but switched because the scheduling was hard.'],
    ['agent', 'I totally understand that frustration. We\'ve actually expanded our hours — we\'re now open Monday through Friday 9am to 7pm and Saturdays 9am to 5pm. Much more flexibility!'],
    ['caller', 'Oh that\'s so much better. I really did love the results I got there.'],
    ['agent', 'We\'d love to welcome you back! And you\'d qualify for our new client offer — $50 off your first treatment.'],
    ['caller', 'Let\'s do it! Book me in.'],
  ],
  smsFollowUpSent: true, smsTemplate: 'new_client_info',
});

// ---------------------------------------------------------------------------
// Build exports
// ---------------------------------------------------------------------------

function buildLead(def: CallDef): Lead {
  const f = def.first;
  const l = def.last;
  return {
    id: leadId(def.idx),
    firstName: f,
    lastName: l,
    phone: phone(def.idx),
    email: email(f, l),
    offerType: def.offerType,
    interest: def.interest,
    location: def.location,
    status: def.outcome === 'no-answer' ? 'no-answer' : 'followed-up',
    source: def.source,
    createdAt: ago(def.daysAgo, def.hoursAgo + 1),
    callAttempts: 1,
    lastCallAttempt: ago(def.daysAgo, def.hoursAgo),
    callId: callId(def.idx),
  };
}

function buildCall(def: CallDef): CallRecord {
  const started = ago(def.daysAgo, def.hoursAgo);
  const connected = def.outcome === 'no-answer' ? null : started;
  const endMs = new Date(started).getTime() + def.duration * 1000;
  const ended = def.duration > 0 ? new Date(endMs).toISOString() : null;

  return {
    id: callId(def.idx),
    leadId: leadId(def.idx),
    callSid: callSid(def.idx),
    direction: def.direction,
    location: def.location,
    status: def.outcome === 'no-answer' ? 'no-answer' : 'completed',
    duration: def.duration,
    startedAt: started,
    connectedAt: connected,
    endedAt: ended,
    outcome: def.outcome,
    outcomeConfidence: def.confidence,
    sentiment: def.sentiment,
    summary: def.summary,
    keyMoments: def.keyMoments,
    objections: def.objections,
    nextAction: def.nextAction,
    transcript: tx(def.transcript),
    smsFollowUpSent: def.smsFollowUpSent,
    smsFollowUpTemplate: def.smsTemplate,
    smsFollowUpSentAt: def.smsFollowUpSent ? ago(def.daysAgo, def.hoursAgo - 0.1) : null,
  };
}

export const seedLeads: Lead[] = defs.map(buildLead);
export const seedCalls: CallRecord[] = defs.map(buildCall);
