import { AgentPersona, LocationInfo, MembershipTier, OutcomeType } from './types';

export const LOCATIONS: Record<string, LocationInfo> = {
  'newport-beach': {
    id: 'newport-beach',
    name: 'NakedMD Newport Beach',
    address: '369 San Miguel Dr Suite 230, Newport Beach, CA 92660',
    hours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    staffedHours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    phone: '+19495551001',
  },
  'beverly-hills': {
    id: 'beverly-hills',
    name: 'NakedMD Beverly Hills',
    address: '9735 Wilshire Blvd Suite 320, Beverly Hills, CA 90212',
    hours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    staffedHours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    phone: '+13105551002',
  },
  'scottsdale': {
    id: 'scottsdale',
    name: 'NakedMD Scottsdale',
    address: '7014 E Camelback Rd Suite 1420, Scottsdale, AZ 85251',
    hours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    staffedHours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    phone: '+14805551003',
  },
};

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'essential',
    name: 'Essential',
    price: 'Starting at $150/session',
    features: [
      'Dermaplaning',
      'Chemical Peels',
      'Facials',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'Starting at $250/session',
    features: [
      'Neurotoxins (Botox/Dysport)',
      'Microneedling',
      'All Essential services',
      'Personalized treatment plan',
    ],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    price: 'Starting at $450/session',
    features: [
      'Lip Fillers',
      'Advanced Injectables',
      'Custom treatment packages',
      'Priority scheduling',
      'Complimentary skincare consultation',
    ],
  },
];

export const OFFER_TYPES = [
  { value: 'complimentary-consult', label: 'Complimentary Consultation' },
  { value: 'new-client-offer', label: 'New Client Special ($50 off)' },
  { value: 'vip-experience', label: 'VIP Experience' },
] as const;

export const INTERESTS = [
  'Lip Enhancement',
  'Wrinkle Reduction',
  'Skin Rejuvenation',
  'Anti-Aging',
  'Acne & Scarring',
  'Body Contouring',
  'General Consultation',
] as const;

export const LOCATION_OPTIONS = [
  { value: 'newport-beach', label: 'NakedMD Newport Beach' },
  { value: 'beverly-hills', label: 'NakedMD Beverly Hills' },
  { value: 'scottsdale', label: 'NakedMD Scottsdale' },
] as const;

export const OUTCOME_LABELS: Record<OutcomeType, string> = {
  'consultation-booked': 'Consultation Booked',
  'treatment-sold': 'Treatment Sold',
  'package-sold': 'Package Sold',
  'referral-generated': 'Referral Generated',
  'appointment-scheduled': 'Appointment Scheduled',
  'callback-requested': 'Callback Requested',
  'info-sent': 'Info Sent',
  'info-provided': 'Info Provided',
  'nurture': 'Nurture',
  'no-answer': 'No Answer',
  'voicemail': 'Voicemail',
  'declined': 'Declined',
  'tech-issue': 'Tech Issue',
  'win-back-success': 'Win-Back Success',
};

export const OUTCOME_COLORS: Record<OutcomeType, string> = {
  'consultation-booked': '#22c55e',
  'treatment-sold': '#16a34a',
  'package-sold': '#34d399',
  'referral-generated': '#86efac',
  'appointment-scheduled': '#4ade80',
  'callback-requested': '#f59e0b',
  'info-sent': '#fb923c',
  'info-provided': '#fbbf24',
  'nurture': '#eab308',
  'no-answer': '#94a3b8',
  'voicemail': '#a1a1aa',
  'declined': '#ef4444',
  'tech-issue': '#f97316',
  'win-back-success': '#10b981',
};

export const BRAND = {
  gold: '#C5A572',
  goldDark: '#B8944A',
  buttonDark: '#A6833F',
  goldSoft: '#F5EDE0',
  bgPublic: '#FFFFFF',
  bgDashboard: '#0A0A0F',
  bgDashboardElevated: '#12121F',
  purpleDeep: '#180021',
  purpleMid: '#35124A',
  sand: '#F5F1EA',
  textPublic: '#111827',
  textDashboard: '#F0F0F5',
  chatAgentBg: '#F3F4F6',
  chatUserBg: '#C5A572',
} as const;

export const DEFAULT_PERSONA: AgentPersona = {
  name: 'Vi',
  language: 'en',
  warmth: 60,
  humor: 30,
  energy: 50,
  formality: 40,
  greeting: '',
  signoff: '',
  useEmoji: false,
  style: 'conversational',
};

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
] as const;

export const WS_BACKEND_URL = process.env.NEXT_PUBLIC_WS_BACKEND_URL || 'http://localhost:8080';
