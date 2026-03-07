import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { LeadSubmission, Location, OfferType } from '@/app/lib/types';
import { WS_BACKEND_URL } from '@/app/lib/constants';
import { formatPhoneE164, isValidEmail } from '@/app/lib/utils';

const VALID_LOCATIONS: Location[] = ['newport-beach', 'beverly-hills', 'scottsdale'];
const VALID_OFFER_TYPES: OfferType[] = ['complimentary-consult', 'new-client-offer', 'vip-experience'];

export async function POST(request: NextRequest) {
  let body: LeadSubmission;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  // ---- Validation ----
  const errors: Record<string, string> = {};

  if (!body.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!body.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!body.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else {
    try {
      formatPhoneE164(body.phone);
    } catch {
      errors.phone = 'Invalid US phone number. Please provide a 10-digit number.';
    }
  }

  if (!body.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(body.email)) {
    errors.email = 'Invalid email address';
  }

  if (!body.offerType || !VALID_OFFER_TYPES.includes(body.offerType)) {
    errors.offerType = `Offer type must be one of: ${VALID_OFFER_TYPES.join(', ')}`;
  }

  if (!body.interest?.trim()) {
    errors.interest = 'Interest is required';
  }

  if (!body.location || !VALID_LOCATIONS.includes(body.location)) {
    errors.location = `Location must be one of: ${VALID_LOCATIONS.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: 'Validation failed', details: errors },
      { status: 400 },
    );
  }

  // ---- Normalize ----
  const phoneE164 = formatPhoneE164(body.phone);
  const leadId = uuidv4();

  const leadPayload = {
    leadId,
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    phone: phoneE164,
    email: body.email.trim().toLowerCase(),
    offerType: body.offerType,
    interest: body.interest.trim(),
    location: body.location,
    source: 'web-form' as const,
  };

  // ---- Forward to WS backend (fire-and-forget) ----
  fetch(`${WS_BACKEND_URL}/api/lead/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadPayload),
    signal: AbortSignal.timeout(5000),
  }).catch((err) => {
    console.error('[lead/submit] Backend forwarding failed:', err);
  });

  return NextResponse.json(
    { leadId, status: 'calling' },
    { status: 200 },
  );
}
