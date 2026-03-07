'use client';

import { FormEvent, useState } from 'react';
import { LeadContext, LeadSubmission, OfferType, Location } from '@/app/lib/types';
import { OFFER_TYPES, INTERESTS, LOCATION_OPTIONS, MEMBERSHIP_TIERS } from '@/app/lib/constants';
import { formatPhoneE164, formatPhoneInput, isValidEmail, cn } from '@/app/lib/utils';
import PublicHeader from '@/app/components/PublicHeader';

interface LeadFormProps {
  onSubmit: (context: LeadContext) => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  offerType?: string;
  interest?: string;
  location?: string;
  api?: string;
}

const BENEFITS = ['Expert injectors on staff', 'Medical-grade skincare', 'Complimentary consultations', 'You, but better.'];

const SOCIAL_PROOF = [
  { value: '40+', label: 'NakedMD locations nationwide' },
  { value: '250K+', label: 'Treatments performed annually' },
  { value: '$0', label: 'Complimentary first consultation' },
];

const PHILOSOPHY = [
  {
    title: 'Confidence',
    body: 'We believe everyone deserves to feel their best. Your first visit should feel exciting, not intimidating.',
  },
  {
    title: 'Transparency',
    body: 'No hidden fees, no pressure. Come as you are, explore what works for you, and make decisions at your pace.',
  },
  {
    title: 'Results',
    body: 'Serious aesthetics do not need a serious vibe. Natural results, luxury experience, and treatments people actually look forward to.',
  },
];

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
    </svg>
  );
}

function PillarIcon({ type }: { type: 'spark' | 'community' | 'party' }) {
  if (type === 'community') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM3 20a5 5 0 0110 0M11 20a5 5 0 0110 0" />
      </svg>
    );
  }

  if (type === 'party') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4l16 8-7 2-2 7L4 4zM15 5l4-1M18 10l3 1M12 3l1-2" />
      </svg>
    );
  }

  return <SparkIcon />;
}

export default function LeadForm({ onSubmit }: LeadFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [offerType, setOfferType] = useState('');
  const [interest, setInterest] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';

    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else {
      try {
        formatPhoneE164(phone);
      } catch {
        errs.phone = 'Enter a valid 10-digit US phone number';
      }
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Enter a valid email address';
    }

    if (!offerType) errs.offerType = 'Select an offer type';
    if (!interest) errs.interest = 'Select an interest';
    if (!location) errs.location = 'Choose a preferred location';

    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const formattedPhone = formatPhoneE164(phone);
      const body: LeadSubmission = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: formattedPhone,
        email: email.trim(),
        offerType: offerType as OfferType,
        interest,
        location: location as Location,
      };

      const res = await fetch('/api/lead/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Submission failed (${res.status})`);
      }

      const data = await res.json();
      if (!data.leadId) {
        throw new Error('Invalid server response');
      }

      onSubmit({
        firstName: firstName.trim(),
        offerType,
        location,
        interest,
      });
    } catch (err) {
      setErrors({
        api: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClasses =
    'w-full border border-[#d6d6d6] bg-white px-4 py-3.5 text-base text-[#151515] placeholder:text-[#717171] focus:border-[#4C4C4B]';
  const selectClasses =
    'w-full appearance-none border border-[#d6d6d6] bg-white px-4 py-3.5 pr-11 text-base text-[#151515] focus:border-[#4C4C4B]';
  const errorClasses = 'border-red-400 bg-red-50/60';

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="relative overflow-hidden bg-[#151515] text-white">
        <div className="absolute inset-0 opacity-30 nmd-hero-grid" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
          <div className="grid items-start gap-6 lg:gap-10 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/76">
                <SparkIcon />
                Complimentary consultation + concierge follow-up
              </span>

              <h1 className="mt-6 font-headline text-3xl uppercase leading-[0.9] tracking-[0.02em] sm:text-5xl md:text-6xl lg:text-7xl">
                You, but better.
                <span className="mt-2 block text-[#f4f1ea]">
                  Start with a free NakedMD consultation.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
                Book a complimentary consultation at NakedMD. Vi, your AI concierge,
                keeps the conversation going while our team reaches out.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {BENEFITS.map((benefit) => (
                  <span
                    key={benefit}
                    className="border border-white/14 bg-white/10 px-4 py-2 text-sm font-semibold text-white/92 backdrop-blur"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div id="lead-form" className="relative scroll-mt-24">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="border border-[#e7e7e7] bg-white p-6 text-[#151515] shadow-[0_3px_6px_rgba(0,0,0,0.05)] sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#151515] font-ui">
                      Book Your Consultation
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#151515]">
                      Tell us where to send it
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#717171]">
                      This should take less than a minute. We will text or email the confirmation and
                      Vi will stay available in chat right after submit.
                    </p>
                  </div>
                  <span className="bg-[#f4f1ea] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#151515]">
                    45 sec
                  </span>
                </div>

                <div className="mt-6 bg-[#151515] p-4 text-white">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/56">
                    What you will get
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-white/86 sm:grid-cols-3">
                    <div>Consultation details instantly</div>
                    <div>Treatment info based on your goals</div>
                    <div>Fast follow-up from the local team</div>
                  </div>
                </div>

                {errors.api && (
                  <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.api}
                  </div>
                )}

                <div className="mt-6 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#717171]"
                      >
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          clearError('firstName');
                        }}
                        aria-invalid={Boolean(errors.firstName)}
                        className={cn(inputClasses, errors.firstName && errorClasses)}
                      />
                      <p className="mt-1.5 min-h-5 text-sm text-red-500">{errors.firstName}</p>
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#717171]"
                      >
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          clearError('lastName');
                        }}
                        aria-invalid={Boolean(errors.lastName)}
                        className={cn(inputClasses, errors.lastName && errorClasses)}
                      />
                      <p className="mt-1.5 min-h-5 text-sm text-red-500">{errors.lastName}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#717171]"
                      >
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) => {
                          setPhone(formatPhoneInput(e.target.value));
                          clearError('phone');
                        }}
                        aria-invalid={Boolean(errors.phone)}
                        className={cn(inputClasses, errors.phone && errorClasses)}
                      />
                      <p className="mt-1.5 min-h-5 text-sm text-red-500">{errors.phone}</p>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#717171]"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError('email');
                        }}
                        aria-invalid={Boolean(errors.email)}
                        className={cn(inputClasses, errors.email && errorClasses)}
                      />
                      <p className="mt-1.5 min-h-5 text-sm text-red-500">{errors.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="offerType"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#717171]"
                      >
                        Offer Type
                      </label>
                      <div className="relative">
                        <select
                          id="offerType"
                          value={offerType}
                          onChange={(e) => {
                            setOfferType(e.target.value);
                            clearError('offerType');
                          }}
                          aria-invalid={Boolean(errors.offerType)}
                          className={cn(
                            selectClasses,
                            !offerType && 'text-[#717171]',
                            errors.offerType && errorClasses,
                          )}
                        >
                          <option value="" disabled>
                            Select an offer
                          </option>
                          {OFFER_TYPES.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#717171]">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1.5 min-h-5 text-sm text-red-500">{errors.offerType}</p>
                    </div>

                    <div>
                      <label
                        htmlFor="interest"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#717171]"
                      >
                        Primary Interest
                      </label>
                      <div className="relative">
                        <select
                          id="interest"
                          value={interest}
                          onChange={(e) => {
                            setInterest(e.target.value);
                            clearError('interest');
                          }}
                          aria-invalid={Boolean(errors.interest)}
                          className={cn(
                            selectClasses,
                            !interest && 'text-[#717171]',
                            errors.interest && errorClasses,
                          )}
                        >
                          <option value="" disabled>
                            What are you interested in?
                          </option>
                          {INTERESTS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#717171]">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1.5 min-h-5 text-sm text-red-500">{errors.interest}</p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#717171]"
                    >
                      Preferred Location
                    </label>
                    <div className="relative">
                      <select
                        id="location"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          clearError('location');
                        }}
                        aria-invalid={Boolean(errors.location)}
                        className={cn(
                          selectClasses,
                          !location && 'text-[#717171]',
                          errors.location && errorClasses,
                        )}
                      >
                        <option value="" disabled>
                          Choose your studio
                        </option>
                        {LOCATION_OPTIONS.map((studio) => (
                          <option key={studio.value} value={studio.value}>
                            {studio.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#717171]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-1.5 min-h-5 text-sm text-red-500">{errors.location}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      'mt-2 flex w-full items-center justify-center gap-2 px-5 py-4 text-[15px] font-bold uppercase tracking-[0.04em] text-white font-ui',
                      loading
                        ? 'cursor-not-allowed bg-[#717171]'
                        : 'bg-[#151515] hover:bg-[#2d2d2d] active:translate-y-0',
                    )}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Booking your consultation...
                      </>
                    ) : (
                      <>
                        Book My Free Consultation
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>

                  <p className="text-sm leading-6 text-[#717171]">
                    By submitting, you agree to receive consultation details and a follow-up from the
                    studio team. We only use this to help you get started faster.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1ea] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {SOCIAL_PROOF.map((item) => (
              <div
                key={item.label}
                className="border border-[#E0DEDB] bg-white p-5 animate-fade-up"
              >
                <div className="font-headline text-3xl uppercase tracking-[0.02em] leading-[0.9] text-[#151515]">
                  {item.value}
                </div>
                <div className="mt-2 text-sm leading-6 text-[#8B7D6B]">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              'Board-certified plastic surgeon trained',
              'Reliable results, proven daily nationwide',
              'Consistent quality wherever you go',
            ].map((item) => (
              <div
                key={item}
                className="border border-[#E0DEDB] bg-[#f4f1ea] px-4 py-4 text-center text-sm font-bold uppercase tracking-[0.06em] text-[#151515]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1ea] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-[#151515] px-6 py-7 text-white sm:px-8">
            <div className="grid gap-5 md:grid-cols-4">
              <div>
                <div className="text-3xl font-black">40+</div>
                <p className="mt-2 text-sm text-white/82">NakedMD locations and growing fast.</p>
              </div>
              <div>
                <div className="text-3xl font-black">250K+</div>
                <p className="mt-2 text-sm text-white/82">Treatments performed annually across all studios.</p>
              </div>
              <div>
                <div className="text-3xl font-black">$15.4B</div>
                <p className="mt-2 text-sm text-white/82">U.S. medical aesthetics market and growing.</p>
              </div>
              <div>
                <div className="text-3xl font-black">3x</div>
                <p className="mt-2 text-sm text-white/82">Growth in non-surgical treatments over the past decade.</p>
              </div>
            </div>
          </div>

          <div id="pricing" className="mt-14 scroll-mt-24">
            <div className="mx-auto max-w-2xl text-center">
              <span className="bg-[#f4f1ea] border border-[#e7e7e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#151515]">
                Treatment Tiers
              </span>
              <h3 className="mt-4 font-headline text-4xl uppercase tracking-[0.02em] leading-[0.9] text-[#151515] sm:text-5xl">
                Find the right tier before you even step in the studio
              </h3>
              <p className="mt-3 text-base leading-7 text-[#717171]">
                Your consultation gets the conversation started. Compare tiers so you know exactly
                what to expect on day one.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {MEMBERSHIP_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={cn(
                    'relative overflow-hidden border p-6',
                    tier.id === 'premium'
                      ? 'border-[#151515] bg-white'
                      : tier.id === 'luxury'
                        ? 'border-[#151515] bg-[#151515] text-white'
                        : 'border-[#e7e7e7] bg-white',
                  )}
                >
                  {tier.id === 'premium' && (
                    <div className="absolute right-5 top-5 bg-[#151515] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                      Most Popular
                    </div>
                  )}

                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#151515]">
                    {tier.id === 'luxury' ? (
                      <span className="text-[#f4f1ea]">{tier.name}</span>
                    ) : (
                      tier.name
                    )}
                  </div>
                  <div className={cn('mt-3 text-4xl font-black tracking-tight', tier.id === 'luxury' && 'text-white')}>
                    {tier.price}
                  </div>
                  <p className={cn('mt-2 text-sm leading-6 text-[#717171]', tier.id === 'luxury' && 'text-white/72')}>
                    {tier.id === 'essential' && 'For someone exploring aesthetics for the first time with expert guidance.'}
                    {tier.id === 'premium' && 'The sweet spot for injectables, skincare, and a personalized treatment plan.'}
                    {tier.id === 'luxury' && 'Built for clients who want VIP access, advanced treatments, and concierge support.'}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span
                          className={cn(
                            'mt-0.5 flex h-6 w-6 items-center justify-center',
                            tier.id === 'luxury' ? 'bg-[#f4f1ea]/20 text-[#f4f1ea]' : 'bg-[#f4f1ea] text-[#151515]',
                          )}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className={cn('text-sm leading-6', tier.id === 'luxury' ? 'text-white' : 'text-[#151515]')}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card mt-14 p-6 sm:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="bg-[#f4f1ea] border border-[#e7e7e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#151515]">
                You, but better.
              </span>
              <h3 className="mt-4 font-headline text-4xl uppercase tracking-[0.02em] leading-[0.9] text-[#151515] sm:text-5xl">
                The NakedMD philosophy
              </h3>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {PHILOSOPHY.map((pillar, index) => (
                <div
                  key={pillar.title}
                  className="border border-[#e7e7e7] bg-white p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center bg-[#f4f1ea] text-[#151515]">
                    <PillarIcon type={index === 1 ? 'community' : index === 2 ? 'party' : 'spark'} />
                  </div>
                  <h4 className="mt-5 text-2xl font-black tracking-tight text-[#151515]">
                    {pillar.title}
                  </h4>
                  <p className="mt-3 text-base leading-7 text-[#717171]">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
