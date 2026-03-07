import { LocationInfo } from '../types/index.js';

export const LOCATIONS: Record<string, LocationInfo> = {
  'newport-beach': {
    id: 'newport-beach',
    name: 'NakedMD Newport Beach',
    address: '369 San Miguel Dr, Suite 230, Newport Beach, CA 92660',
    hours: 'Mon-Fri 9am-7pm, Sat 9am-5pm, Sun Closed',
    staffedHours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    phone: process.env.TWILIO_PHONE_NUMBER || '+19495551001',
  },
  'beverly-hills': {
    id: 'beverly-hills',
    name: 'NakedMD Beverly Hills',
    address: '9735 Wilshire Blvd, Suite 320, Beverly Hills, CA 90212',
    hours: 'Mon-Fri 9am-7pm, Sat 9am-5pm, Sun Closed',
    staffedHours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    phone: process.env.TWILIO_PHONE_NUMBER || '+13105551001',
  },
  'scottsdale': {
    id: 'scottsdale',
    name: 'NakedMD Scottsdale',
    address: '7014 E Camelback Rd, Suite 1420, Scottsdale, AZ 85251',
    hours: 'Mon-Fri 9am-7pm, Sat 9am-5pm, Sun Closed',
    staffedHours: 'Mon-Fri 9am-7pm, Sat 9am-5pm',
    phone: process.env.TWILIO_PHONE_NUMBER || '+14805551001',
  },
};

export const SERVICES = [
  {
    name: 'Lip Fillers',
    description: 'Natural-looking lip enhancement using premium hyaluronic acid fillers',
    priceRange: '$450-$850 per syringe',
    duration: '30-45 minutes',
  },
  {
    name: 'Neurotoxins (Botox/Dysport)',
    description: 'Smooth fine lines and wrinkles with precision neurotoxin injections',
    priceRange: '$12-$15 per unit',
    duration: '15-30 minutes',
  },
  {
    name: 'Microneedling',
    description: 'Stimulate collagen production for smoother, firmer skin',
    priceRange: '$350-$600 per session',
    duration: '45-60 minutes',
  },
  {
    name: 'Dermaplaning',
    description: 'Gentle exfoliation for instantly smoother, brighter skin',
    priceRange: '$175-$250 per session',
    duration: '30-45 minutes',
  },
  {
    name: 'Chemical Peels',
    description: 'Medical-grade peels for improved texture, tone, and clarity',
    priceRange: '$200-$500 per session',
    duration: '30-45 minutes',
  },
  {
    name: 'Skincare Treatments',
    description: 'Customized facials and skin rejuvenation therapies',
    priceRange: '$150-$400 per session',
    duration: '45-75 minutes',
  },
];

export const SERVICE_CATEGORIES = [
  'Lip Fillers', 'Neurotoxins', 'Microneedling', 'Dermaplaning',
  'Chemical Peels', 'Facials', 'Skin Rejuvenation', 'Anti-Aging',
  'Body Contouring', 'Laser Treatments',
];

export const NEW_CLIENT_OFFERS = {
  'complimentary-consult': {
    name: 'Complimentary Consultation',
    description: 'Free consultation with one of our expert providers to discuss your aesthetic goals and create a personalized treatment plan.',
  },
  'new-client-offer': {
    name: 'New Client Special',
    description: '$50 off your first treatment when you book during your consultation. Applies to any service.',
  },
  'vip-experience': {
    name: 'VIP Experience',
    description: 'Complimentary consultation plus a complimentary dermaplaning or mini facial to experience our luxury standard of care.',
  },
};
