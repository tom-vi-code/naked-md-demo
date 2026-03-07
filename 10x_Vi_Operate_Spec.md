# 10x Vi Operate: Autonomous Revenue Agent
## From Lead Nurturing Tool to Autonomous Sales Department

### Version 0.1 | March 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The 10x Thesis](#2-the-10x-thesis)
3. [Empirical Validation](#3-empirical-validation)
4. [Workstream 1: Voice Agent Autonomy](#4-workstream-1-voice-agent-autonomy)
5. [Workstream 2: Multi-Touch Campaign Engine](#5-workstream-2-multi-touch-campaign-engine)
6. [Workstream 3: Dashboard as Exception Queue](#6-workstream-3-dashboard-as-exception-queue)
7. [Workstream 4: Payment Integration](#7-workstream-4-payment-integration)
8. [Workstream 5: Proactive Lead Signal Expansion](#8-workstream-5-proactive-lead-signal-expansion)
9. [Integration Plan & Build Sequence](#9-integration-plan--build-sequence)
10. [The One Thing to Build First](#10-the-one-thing-to-build-first)

---

## 1. Executive Summary

**Current system**: A single-touch lead nurturing tool. Lead fills form -> AI calls once -> classifies -> sends one SMS -> GM reads dashboard. **31.9% conversion rate.**

**10x system**: An autonomous revenue agent that owns the entire member lifecycle. Contacts in <30 seconds, runs multi-day multi-channel campaigns, closes deals by sending payment links at peak buying intent, and only surfaces exceptions to the GM.

**Empirical case**: 66% of non-converting calls (21/32) in the seed data had enough buying intent that a payment link at the right moment could have closed them. Projected conversion: **49-51%** -- a 1.6x lift on conversion rate alone, compounding to 10x+ when multiplied by expanded lead capture and autonomous campaign volume.

**Why it's actually 10x**: The current system optimizes the funnel steps -- the 10x version collapses the funnel into one autonomous loop. Industry average speed-to-lead is 47 hours; even this AI takes minutes. A fully autonomous agent that contacts 100% of leads in <30 seconds, runs personalized multi-touch sequences, and can close the deal (gym membership is a commodity sale with published pricing -- the "close" is a Stripe link via SMS) could push conversion from ~10% to 30-40%. That's 3-4x on conversion rate alone. Multiply by handling 5-10x lead volume without added staff, and you get 15-40x revenue per labor dollar.

**Why it looks impossible / why it might not be**: "AI can't close sales" -- but gym membership is arguably the *most* automatable sale in existence: fixed pricing tiers, limited objections (price/time/location), and the close is the prospect clicking a payment link the AI texted them. The current codebase already has voice + chat + SMS + post-call classification. The gap isn't 80% of the system -- it's the last 20%: payment links, state persistence across touches, and campaign orchestration.

**The assumption we'd need to kill**: "A human needs to be in the loop for each sale." The prospect IS the human in the loop -- they approve the sale by clicking the payment link. The AI is just the channel. The GM's job shifts from "run the sales process" to "tune the autonomous system and handle escalations."

---

## 2. The 10x Thesis

### Current Flow (10% improvement territory)

```
Lead fills form
  -> AI calls once
    -> Post-call classification
      -> One SMS follow-up
        -> GM reviews dashboard
          -> Maybe converts (manually, offline)
```

Unit of analysis: "how do we make each step faster?"

### 10x Flow (categorically different)

```
Lead signal arrives (from anywhere)
  -> AI autonomously runs multi-day, multi-channel conversion campaign
    -> Qualifies, prices, negotiates within guardrails
      -> Sends payment link at peak buying intent
        -> Payment collected, member onboarded
          -> No human touched it
```

Unit of analysis: "revenue per lead, fully automated"

### The Math

| Metric | Current | 10x Version | Multiplier |
|--------|---------|-------------|------------|
| Speed to first contact | Minutes | <30 seconds | ~10x |
| Leads contacted | ~60-70% (form fills only) | 100% (multi-signal capture) | 1.5x |
| Touches per lead | 1 call + 1 SMS | 5-10 across voice/SMS/chat over 7-14 days | 5-10x |
| Can close autonomously | No (classification label only) | Yes (Stripe payment link) | Binary unlock |
| GM time per lead | ~5 min reviewing | ~0 (exception-only) | Near-infinite |
| Conversion rate | ~31.9% | ~49-51% projected | 1.6x |
| Revenue per labor dollar | Baseline | 15-40x (volume x conversion x automation) | 15-40x |

---

## 3. Empirical Validation

Analysis of all 47 seed call records in the codebase.

### Dataset Breakdown

- **Total**: 47 calls
- **Converting (15 = 31.9%)**: tour-booked (8), guest-pass-issued (6), trial-activated (4), membership-sold (2), appointment-scheduled (1)
- **Non-Converting (32 = 68.1%)**: info-provided (7), nurture (6), callback-requested (3), info-sent (3), no-answer (3), voicemail (2), declined (1), tech-issue (1)

### Buying Intent in Non-Converting Calls

| Intent Tier | Count | % of Non-Converting | Key Pattern |
|-------------|-------|---------------------|-------------|
| **Strong** (payment link alone could close) | 16 | 50% | Asked pricing, compared tiers, requested callback |
| **Moderate** (payment link + objection removal) | 5 | 16% | Timing barriers (surgery recovery, moving, holidays) |
| **Low/None** (no conversation or explicit rejection) | 11 | 34% | No-answer, voicemail, declined, tech-issue |
| **Total with closure potential** | **21** | **66%** | |

### The Pattern

1. **People asking specific questions = Buying mode**. Tyler asked about couple discounts, trainer qualifications, class format. Rachel asked instructor experience, class levels, schedule. These aren't browsers -- they're evaluators.

2. **People requesting follow-up = Interested but gate-blocked**. Samantha "wants to wait until after holidays" -> needs holiday discount lock-in. Tiffany "settling into new apartment" -> needs welcome promo code. Kyle "in doctor appointment" -> needs online booking option.

3. **People stating objections = Seeking solutions, not dismissal**. Budget concern (Brittany) -> offer payment plan. Crowd concern (Justin) -> offer off-peak trial. Anxiety (Elizabeth) -> offer private session. Time constraint (Kevin) -> offer 15-min lunch option.

### 12 Highest-Confidence "Could Have Closed" Calls

1. Kyle -- "definitely interested," scheduled callback
2. Nathan -- Requested callback (high intent signal)
3. Heather -- Requested callback (high intent signal)
4. Kayla -- Wanted to check schedule, asked operational questions
5. Tyler -- Wanted to discuss with wife (could send link for both)
6. Eric -- Asked for pricing at work (wanted to decide later)
7. Amber -- Requested info, prefers self-review (perfect for link)
8. Rachel -- Comparing yoga options, price-sensitive (free trial would convert)
9. Samantha -- Waiting for after holidays (pre-lock discount would close)
10. Michelle -- Interested but overwhelmed (trial removes risk)
11. Tiffany -- Excited about specific class, just timing (discount code)
12. Brian -- Medical pause, but pre-committed (rate lock-in)

### Financial Impact (from 47-call sample)

- Additional 8-9 conversions from current 15 = +53% conversion uplift
- At average membership value ~$150/year: $1,200-1,350 additional annual revenue per 47 calls
- Scales to **$120k-135k per 1,000 calls**

---

## 4. Workstream 1: Voice Agent Autonomy

### Current Capability

The voice agent has exactly **2 function tools** today:

| Tool | File | Lines | What It Does |
|------|------|-------|-------------|
| `hang_up` | `ws-backend/src/services/deepgram-agent.ts` | 97-111 | Ends the call |
| `send_sms` | `ws-backend/src/services/deepgram-agent.ts` | 112-127 | Sends one of 4 template SMS messages |

The system prompt (`ws-backend/src/prompts/voice-agent-system.ts`, lines 24-77) is explicitly designed to "guide and inform" with the directive: "Never pressure -- guide and inform" (line 37).

**The agent cannot**: process payment, collect membership preference, schedule a tour with a specific time, activate a guest pass with a confirmation code, apply a promo code, verify age, or obtain marketing consent.

### Required New Function Tools

| Function | Difficulty | Purpose | Est. Time |
|----------|-----------|---------|-----------|
| `collect_membership_preference` | Trivial | Record selected tier + billing term | 1-2 hours |
| `activate_guest_pass_confirmed` | Trivial | Generate unique code, SMS delivery | 2-4 hours |
| `generate_confirmation_code` | Trivial | Unique code + expiration for any booking | 1-2 hours |
| `request_marketing_consent` | Trivial | GDPR/CAN-SPAM audit trail | 2-3 hours |
| `schedule_tour` | Moderate | Book specific time at location | 8-16 hours |
| `apply_promo_discount` | Moderate | Validate promo codes, calculate new price | 6-12 hours |
| `send_digital_agreement` | Moderate | Email membership agreement for e-signature | 8-16 hours |
| `send_payment_link` | Hard | Stripe Checkout session + SMS the URL | 16-24 hours |

### System Prompt Overhaul

**Current philosophy**: "Never pressure -- guide and inform"

**New philosophy**: "Qualify and close, with empathy"

Key changes to `ws-backend/src/prompts/voice-agent-system.ts`:

#### Shift 1: From "Offer" to "Assume Close"

Current conversation flow (line 62-67):
```
1. Greet -> 2. Ask questions -> 3. Share info -> 4. Offer pass/tour -> 5. Goodbye
```

New conversation flow:
```
1. Greet -> 2. Qualify intent -> 3. Address objections -> 4. Confirm tier preference
-> 5. Send payment link -> 6. Confirm receipt -> 7. Goodbye with next steps
```

#### Shift 2: Closing Framework

```
CLOSING FRAMEWORK:
- If caller expresses clear buying intent ("I'm ready to join"):
  -> Confirm tier (Base/Peak/Peak Results)
  -> Ask for billing term preference (monthly vs annual)
  -> Send payment link via SMS
  -> Confirm receipt

- If caller has objections (price, commitment, time):
  -> Address objection (promo code, 1-month trial, tour first)
  -> Re-attempt close
  -> Fall back to guest pass if still resistant

- If caller is uninterested:
  -> Respect decision
  -> Offer 7-day guest pass
  -> Send info via SMS
```

#### Shift 3: Compliance Language

```
COMPLIANCE:
- Before payment: "I'm going to send you a secure payment link via text. Does that work?"
- Before recurring charge: "This membership renews monthly at $X unless you cancel. Sound good?"
- Age confirmation: "You're 18 or older, correct?"
- Email confirmation: "We'll send confirmation to [email]. Is that still right?"
```

### Guardrails

```
DISCOUNT AUTHORITY:
- AI can apply: Pre-configured promo codes (e.g., "SPRING2026" = 20% off)
- AI can apply: Loyalty discounts (e.g., 15% for lapsed members)
- AI CANNOT: Override prices without code
- AI CANNOT: Offer ad-hoc discounts
- Max discount: 30% of any tier without manager approval

ESCALATION TRIGGERS:
- Caller requests manager or has a complaint
- Caller mentions custom/corporate pricing needs
- Payment link fails 3x consecutively
- Caller's age unclear or appears under 18
- Caller mentions existing injury requiring liability review
- 3+ "I don't know" responses from agent in one call
```

### Files to Modify

1. `ws-backend/src/prompts/voice-agent-system.ts` -- Entire system prompt rewrite
2. `ws-backend/src/services/deepgram-agent.ts` -- Expand function tools array (lines 96-128)
3. `ws-backend/src/types/index.ts` -- Add payment/compliance fields to CallRecord
4. `ws-backend/src/config/outcomes.ts` -- Add campaign action metadata to outcomes

### New Files

1. `ws-backend/src/config/voice-agent-functions.ts` -- Expanded function registry
2. `ws-backend/src/config/guardrails.ts` -- Discount authority, escalation rules

---

## 5. Workstream 2: Multi-Touch Campaign Engine

### Current Flow (Linear, Terminal)

```
Lead Form -> processLead() -> twilioService.initiateCall() -> groq-classifier
  -> sendFollowUpSMS() -> Lead status = 'followed-up' -> DONE
```

Key limitations:
- In-memory storage only (`Map<string, Lead>` and `Map<string, CallRecord>`)
- Lead has a single `callId` -- no concept of interaction history
- `callAttempts` is incremented but never checked for retry logic
- `LeadStatus` is linear: `new -> calling -> connected -> completed -> classified -> followed-up`
- SMS is fire-once
- No timer, scheduler, or delayed execution mechanism

### New Lead Lifecycle State Machine

```
                     +------------------+
                     |       NEW        |
                     +--------+---------+
                              |
                              v
                     +------------------+
              +----->|   CONTACTING     |<-----+
              |      +--------+---------+      |
              |               |                |
              |      +--------v---------+      |
              |      |    ENGAGED       |      |
              |      +--------+---------+      |
              |               |                |
         +----+----+  +------v------+  +------+------+
         | NURTURING|  | CONVERTED  |  | ESCALATED   |
         +----+----+  | (terminal) |  +------+------+
              |       +------------+         |
              v                              v
         +----------+              +---------+--------+
         | COOLING  |              | CONVERTED or     |
         +----+-----+              | DECLINED         |
              |                    | (terminal)       |
              v                    +------------------+
         +----------+
         | EXHAUSTED|
         | (terminal)|
         +----------+
```

### State Definitions

| State | Description | Exit Transitions |
|-------|-------------|-----------------|
| `new` | Lead just created, not yet contacted | -> `contacting` |
| `contacting` | Active outreach in progress (call ringing, SMS sent) | -> `engaged`, `nurturing`, `escalated` |
| `engaged` | Live conversation (call connected, SMS reply, chat active) | -> `converted`, `nurturing`, `escalated` |
| `nurturing` | Between touches, campaign active | -> `contacting`, `cooling`, `escalated`, `converted` |
| `cooling` | Mandatory wait between campaign waves | -> `nurturing`, `exhausted` |
| `converted` | Terminal. Member, tour booked, or pass activated | None |
| `escalated` | Handed to human staff | -> `converted`, `declined` |
| `declined` | Terminal. Opted out or explicit decline | None |
| `exhausted` | Terminal. Campaign ran full course | None |

### Data Model: Campaign Entity

```typescript
interface Campaign {
  id: string;
  leadId: string;
  template: 'speed-to-lead' | 'nurture' | 'win-back' | 'no-show-recovery';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  currentWave: number;
  maxWaves: number;
  touchpoints: TouchPoint[];
  plannedTouches: PlannedTouch[];
  createdAt: string;
  startedAt: string;
  lastActivityAt: string;
  nextScheduledAt: string | null;
  completedAt: string | null;
  expiresAt: string;                   // Hard TTL
  finalOutcome: OutcomeType | null;
  accumulatedContext: CampaignContext;  // What Vi "remembers" across touches
}

interface CampaignContext {
  objections: string[];
  interests: string[];
  preferredContactTime: string | null;
  preferredChannel: 'voice' | 'sms' | 'chat' | null;
  pricingDiscussed: boolean;
  tourMentioned: boolean;
  guestPassActivated: boolean;
  lastSentiment: number | null;
  sentimentTrend: 'improving' | 'stable' | 'declining' | null;
  callSummaries: string[];
  smsReplies: string[];
}
```

### Data Model: TouchPoint Entity

```typescript
interface TouchPoint {
  id: string;
  campaignId: string;
  leadId: string;
  channel: 'voice' | 'sms' | 'chat';
  direction: 'outbound' | 'inbound';
  wave: number;
  sequenceIndex: number;
  status: 'planned' | 'executing' | 'completed' | 'failed' | 'skipped';
  scheduledAt: string;
  executedAt: string | null;
  completedAt: string | null;
  outcome: OutcomeType | null;
  outcomeConfidence: number | null;
  sentiment: number | null;
  summary: string | null;
  callRecordId: string | null;        // For voice touches
  smsMessageSid: string | null;       // For SMS touches
  wasAnswered: boolean;
  engagementDurationMs: number | null;
  leadInitiated: boolean;
}

interface PlannedTouch {
  channel: 'voice' | 'sms' | 'chat';
  wave: number;
  sequenceIndex: number;
  delayFromPreviousMs: number;
  scheduledAt: string | null;
  condition: TouchCondition | null;
  templateId: string | null;
  skipIfConverted: boolean;
}
```

### Campaign Templates

#### Template: `speed-to-lead` (default for web form leads)

```
Wave 0 -- Immediate (0-30 seconds)
  [0] SMS: intro text with guest pass info (t+0s)
  [1] Voice: outbound call (t+5s, parallel)
  [2] Chat: session initialized on /join page (t+0s)
  First channel to get engagement "wins" and becomes primary.

Wave 1 -- Follow-up (4-24 hours, if not converted)
  [3] SMS: personalized follow-up referencing call context (t+4h)
  [4] Voice: retry if Wave 0 was no-answer (t+6h, business hours only)

Wave 2 -- Nurture (48-72 hours)
  [5] SMS: value-add content (class schedule, pricing) (t+48h)
  [6] Voice: "checking in" call (t+72h, only if sentiment > 40)

Wave 3 -- Last chance (5-7 days)
  [7] SMS: urgency ("guest pass expires in 2 days") (t+5d)
  [8] SMS: payment/signup link (t+6d, only if engagement score > 50)
```

#### Template: `nurture` (post-first-contact non-conversion)

```
Wave 0 -- Re-engagement (24 hours)
  [0] SMS: "We'd love to help you find the right plan" + pricing link

Wave 1 -- Value drip (3 days)
  [1] SMS: Class schedule or success story
  [2] Voice: soft check-in (preferred contact time if known)

Wave 2 -- Offer (7 days)
  [3] SMS: Limited-time offer or extended guest pass

Wave 3 -- Final (14 days)
  [4] SMS: "Door's always open" + guest pass reactivation link
```

#### Template: `no-show-recovery` (tour-booked but didn't show)

```
Wave 0 -- Same day
  [0] SMS: "Missed you today! Want to reschedule?" (t+2h after tour time)
  [1] Voice: quick reschedule call (t+4h)

Wave 1 -- Next day
  [2] SMS: "Your guest pass is still active" + location details

Wave 2 -- 3 days later
  [3] Voice: personal call with offer to extend pass
```

#### Template: `win-back` (lapsed members)

```
Wave 0 -- Outreach
  [0] Voice: "We miss you at Crunch" call
  [1] SMS: rejoin offer (if no-answer)

Wave 1 -- 7 days
  [2] SMS: Highlight new classes/amenities

Wave 2 -- 14 days
  [3] SMS: Final offer with urgency
```

### Concrete Example: Sarah's 7-Day Conversion

**Scenario**: Sarah submits a form. Interested in "Weight Loss", 7-Day Guest Pass, South Academy.

| Day | Touch # | Channel | Action | Result |
|-----|---------|---------|--------|--------|
| Thu 2:15 PM | #1 | SMS | Intro text with guest pass info | Delivered |
| Thu 2:15 PM | #2 | Voice | Vi calls, discusses weight loss, pricing. Sarah says "I need to think about it" | Classification: info-provided, sentiment: 65 |
| Thu 2:16 PM | #3 | SMS | Pricing summary referencing call | Delivered, no reply |
| Thu 6:15 PM | #4 | SMS | Context-aware: "Members with weight loss goals love our HIIT and kickboxing" | Sarah replies: "What time are kickboxing classes?" |
| Thu 7:15 PM | #5 | SMS | AI reply with kickboxing schedule | Sarah: "The 6:30 Wed class sounds good" |
| Thu 7:17 PM | #6 | SMS | "Wednesday 6:30 PM -- you're going to love it!" | Sarah: "Thanks!" |
| Wed 10:00 AM | #7 | SMS | Pre-visit reminder | Delivered |
| Thu 8:00 AM | #8 | SMS | "Hope you loved kickboxing! Ready to make it official? Here's your signup link" | Sarah: "Send me the link" |
| Thu 8:05 AM | #9 | SMS | Payment link (Stripe Checkout) | Membership purchased |
| Thu 8:06 AM | #10 | SMS | Welcome confirmation | Campaign complete |

**Result**: Converted over SMS after initial call. 10 touches, 7 days, zero human involvement.

### Timing Rules

| Rule | Value | Rationale |
|------|-------|-----------|
| First touch after lead creation | < 30 seconds | Speed-to-lead |
| Minimum gap between touches | 4 hours | Prevent spam fatigue |
| Maximum touches per day | 3 | Courtesy |
| Voice call hours | 9am-8pm local | Regulatory |
| SMS allowed hours | 8am-9pm local | TCPA compliance |
| Campaign TTL (speed-to-lead) | 14 days | |
| Campaign TTL (win-back) | 30 days | |
| Cooling period between waves | 24-72 hours | Prevent burnout |
| Max total touches per campaign | 10 | Hard cap |

### Campaign Engine Architecture

3 core backend components:

1. **Campaign Scheduler** (`ws-backend/src/services/campaign-scheduler.ts`): Timer loop (every 30s) scanning for due touches. In-memory for demo, migrates to BullMQ for production.

2. **Touch Executor** (`ws-backend/src/services/touch-executor.ts`): Routes planned touches to correct channel -- voice calls `processLead()`, SMS calls expanded `sms-service.ts`, chat pushes via WebSocket.

3. **Signal Processor** (`ws-backend/src/services/signal-processor.ts`): Listens for engagement signals (call classified, SMS reply received, chat message, opt-out) and feeds them into the decision engine.

### Decision Engine Logic

```
After each touch completes:

  if outcome is CONVERSION:
    -> lead = 'converted', campaign = 'completed', cancel remaining touches

  if outcome is DECLINED or OPT_OUT:
    -> lead = 'declined', campaign = 'completed', cancel remaining touches

  if escalation triggered:
    -> lead = 'escalated', campaign = 'paused', notify staff

  if callback-requested:
    -> update preferredContactTime, schedule voice touch at that time

  if no-answer/voicemail:
    -> if wave 0 and retries remaining: schedule SMS fallback + voice retry
    -> else: advance to next wave

  if engaged but not converted:
    -> update context (sentiment, objections, interests)
    -> schedule next planned touch
    -> lead = 'nurturing'
```

### Changes to Existing Services

| File | Change |
|------|--------|
| `ws-backend/src/services/lead-processor.ts` | Create Campaign instead of immediate call. Campaign scheduler handles execution. |
| `ws-backend/src/routes/twilio-media.ts` | `handleStop()` emits signal to Signal Processor instead of calling `sendFollowUpSMS()` directly |
| `ws-backend/src/services/sms-service.ts` | Add campaign-aware templates, context interpolation, reply tracking, opt-out handling |
| `ws-backend/src/config/outcomes.ts` | Add `isTerminal`, `suggestedNextChannel`, `suggestedDelay`, `campaignAction` fields |
| `ws-backend/src/server.ts` | Add campaign/touchpoint stores, register new routes, start scheduler |

### New Files

| File | Purpose |
|------|---------|
| `ws-backend/src/services/campaign-engine.ts` | Campaign lifecycle: create, advance, complete, cancel |
| `ws-backend/src/services/campaign-scheduler.ts` | Timer loop for due touch dispatch |
| `ws-backend/src/services/touch-executor.ts` | Route touches to channels |
| `ws-backend/src/services/signal-processor.ts` | Engagement signal handling |
| `ws-backend/src/services/decision-engine.ts` | Post-touch decision rules |
| `ws-backend/src/config/campaign-templates.ts` | Template definitions |
| `ws-backend/src/routes/twilio-sms-inbound.ts` | Webhook for SMS replies |
| `ws-backend/src/routes/campaign-api.ts` | REST endpoints for dashboard |
| `ws-backend/src/types/campaign.ts` | Campaign, TouchPoint, PlannedTouch types |

---

## 6. Workstream 3: Dashboard as Exception Queue

### Current Dashboard (What It Shows Today)

The dashboard at `/dashboard` is a passive analytics report with 4 tabs:

**Overview tab** (`frontend/src/app/dashboard/page.tsx`):
- 7 KPI cards: Total Calls, Connect Rate, Avg Duration, Tours Booked, Conversion Rate, Escalations, Avg Sentiment
- Location breakdown: South vs North Academy side-by-side
- Outcome distribution: 15 outcome types in horizontal bars
- Recent calls: 8-row preview table

**Call Log tab** (`frontend/src/app/components/Dashboard/CallLog.tsx`):
- Full paginated table (20/page) with filters
- No prioritization or exception flagging

**Analytics tab**:
- Conversion funnel (4-stage)
- Daily trend chart (calls vs conversions)
- Top objections list

**Orchestrator tab** (`frontend/src/app/components/Dashboard/OrchestratorView.tsx`):
- Multi-channel engagement visualization (currently synthetic/demo data)

**Problem**: This is a REPORTING tool. The GM browses what happened. Nothing is actionable.

### New Dashboard: Management by Exception

The GM sees only what needs human intervention. AI handles 90% autonomously.

#### Primary View: Exception Queue (replaces Overview)

```
EXCEPTION QUEUE

CRITICAL (Red) - Immediate action needed
  "Lead X (high-value corp account) -> AI classified 'declined' (64% conf)
   -> Recommended: Override to 'nurture' + assign to VP Sales"

  "Lead Y -> 3 failed contact attempts over 5 days
   -> Recommended: SMS follow-up or mark no-answer"

  "Lead Z -> Complaint detected (sentiment -45)
   -> Recommended: Escalate to manager, review for refund"

WARNING (Orange) - Monitor or suggest action
  "Lead A in 'nurture' for 7 days, 0 engagement
   -> Recommended: Switch to SMS campaign or close out"

  "Lead B -> Tour-booked but low confidence (48%)
   -> Recommended: Manual follow-up call to confirm"

INFO (Blue) - Informational
  "Price objection up 23% this week
   -> Recommendation: Review pitch or create counter-offer"
```

Each card has action buttons: "Accept Recommendation", "Dismiss", "Review Call", "Schedule Follow-up".

```typescript
interface ExceptionRecord {
  id: string;
  leadId: string;
  leadName: string;
  severityLevel: 'critical' | 'warning' | 'info';
  exceptionType:
    | 'low-confidence-outcome'
    | 'contact-failure'
    | 'complaint-detected'
    | 'stale-nurture'
    | 'high-value-at-risk'
    | 'pattern-shift';
  headline: string;
  detail: string;
  aiRecommendation: string;
  suggestedAction?: {
    action: 'override-outcome' | 'escalate' | 'reassign' | 'sms-follow-up' | 'close-out';
    targetOutcome?: OutcomeType;
  };
  createdAt: string;
  dismissedAt?: string;
  actionTakenAt?: string;
}
```

#### Secondary View: AI Performance Monitor (replaces Analytics)

```
AI PERFORMANCE MONITOR

Autonomous Conversion Rate: 45.2% (up 3.2% from last week)
  Breakdown: 78 autonomous vs 12 escalated

Revenue Attribution:
  Autonomous: $18,450 (78 x avg $236)
  Escalated:  $2,832 (12 x avg $236)
  Escalation rate: 13.3% (down from 18%)

AI Confidence Trend:
  Avg outcome confidence: 71.4% (target: >75%)
  Low confidence (<50%): 8 calls (4.2%) -> these become exceptions

Channel Performance:
  Voice 1st response: avg 8.2s, 58% conversion
  SMS 1st response: avg 18.4s, 52% conversion
  Chat 1st response: avg 12.1s, 44% conversion

Top 3 Problem Areas:
  Schedule objection (12%) -> recommend: publish class schedule
  Corporate inquiry (8%) -> recommend: escalation path
  Price comparison (6%) -> recommend: value proposition update
```

#### Tertiary View: Suggested Actions

```
SUGGESTED ACTIONS FOR TODAY

Batch Re-engagement
  "8 leads in 'info-sent' for 3+ days with no follow-up.
   Recommendation: Send batch SMS with guest pass reminder."

Corporate Account Path
  "3 callers mentioned company fitness programs this week.
   Recommendation: Create 'Corporate Account' outcome, route to VP Sales."

Manual Review Queue
  "5 calls with sentiment < -30.
   Recommendation: Spot-check transcripts for quality or service recovery."

Location Imbalance
  "North Academy: 2.3% conversion vs South Academy: 8.1%.
   Recommendation: Compare top performer calls to troubleshoot."
```

### Component Migration

| Current Component | Status | New Purpose |
|-------------------|--------|-------------|
| KPICards.tsx | Repurpose | Optional widget, 3 metrics only (Conversion Rate, Escalation Rate, Sentiment) |
| CallLog.tsx | Deprecate | Remove from main nav, keep for drill-down from exceptions |
| OutcomeDistribution.tsx | Deprecate | Not actionable |
| ConversionFunnel.tsx | Deprecate | Replace with Autonomous vs Escalated breakdown |
| LocationBreakdown.tsx | Refactor | LocationAnalysis with exception highlighting |
| OrchestratorView.tsx | Enhance | Feed real campaign data instead of synthetic |
| CallDetail.tsx | Keep | Drill-down from exceptions |

### New Components

| Component | Purpose |
|-----------|---------|
| ExceptionQueue.tsx | Collapsible cards by severity, action buttons |
| AIPerformanceMonitor.tsx | Autonomous vs escalated, revenue attribution, confidence |
| SuggestedActions.tsx | Priority-ranked actions, batch operations |
| ConversionBreakdownView.tsx | Stacked bar: autonomous + escalated + lost |
| LocationAnalysis.tsx | Reworked comparison with exception highlighting |

### New API Endpoints

```
GET  /api/exceptions?severity=all|critical|warning&days=7
GET  /api/ai-performance?period=today|week|month
GET  /api/suggested-actions?period=today|week
GET  /api/conversion-breakdown?period=today|week|month
POST /api/exceptions/:id/dismiss
POST /api/exceptions/:id/action
```

### Key Metric Shift

| Old Dashboard (What We Report) | New Dashboard (What We Act On) |
|-------------------------------|-------------------------------|
| Total Calls: 142 | Autonomous Conversions: 78 (86.7%) |
| Connect Rate: 73% | Escalations Required: 12 (13.3%) |
| Conversion Rate: 12.7% | AI Confidence (avg): 71.4% |
| Tours Booked: 18 | Revenue from Autonomous: $18,450 |
| Avg Duration: 3m 22s | Leakage Prevented: 12 leads |
| Escalations: 8 | Exceptions This Week: 3 critical, 7 warning |
| Sentiment: 42/100 | Location Alert: North Academy -20pts |

**GM time**: 30 min browsing -> 5 min acting on exceptions.

---

## 7. Workstream 4: Payment Integration

### Current State

"Membership sold" is a **classification label only**, not a transaction. When Groq classifies a call as `membership-sold`, the system sends a generic "Your membership is active!" SMS -- but nothing actually charged the customer or created an account. There is no payment infrastructure.

### Architecture

```
Voice Call (Deepgram Agent)
    |
    v
[NEW] send_payment_link function call
    |
    v
Stripe Checkout Session Creation
    |
    v
SMS with unique payment link
    |
    v
Customer completes payment in browser
    |
    v
Stripe Webhook -> Backend -> Confirm membership
    |
    v
Send "Welcome, you're activated!" SMS
```

### Stripe Payment Service

New file: `ws-backend/src/services/stripe-service.ts`

```typescript
interface CheckoutSessionParams {
  leadId: string;
  firstName: string;
  email: string;
  phone: string;
  membershipTier: 'base' | 'peak' | 'peak-results';
  location: 'south-academy' | 'north-academy';
}

// Creates a Stripe Checkout Session with:
// - Subscription mode (recurring membership)
// - Correct price ID per tier ($9.99, $24.99, Premium)
// - Lead metadata for webhook correlation
// - 24-hour expiry
// Returns: { sessionId, url, expiresAt }
```

### New Deepgram Function Tool

```typescript
{
  name: 'send_payment_link',
  description: 'Send a Stripe Checkout link via SMS to complete membership purchase.',
  parameters: {
    type: 'object',
    properties: {
      membershipTier: {
        type: 'string',
        description: 'base ($9.99/mo), peak ($24.99/mo), or peak-results (premium)',
      },
    },
    required: ['membershipTier'],
  },
}
```

Handler flow:
1. Agent calls `send_payment_link("peak")`
2. Backend creates Stripe Checkout session
3. SMS sent with checkout URL
4. CallRecord updated: `paymentAttempted: true`, `paymentSessionId`, `paymentLinkSentAt`
5. Agent receives success response, tells caller to check their phone

### Stripe Webhook

New file: `ws-backend/src/routes/stripe-webhook.ts`

On `checkout.session.completed`:
1. Find CallRecord by `paymentSessionId`
2. Update `paymentStatus: 'completed'`, store `stripeCustomerId`, `stripeSubscriptionId`
3. Send confirmation SMS: "Congratulations! Your [tier] membership is now active."

### CallRecord Extensions

```typescript
// Add to existing CallRecord in ws-backend/src/types/index.ts:
paymentAttempted?: boolean;
paymentSessionId?: string;
paymentLinkSent?: boolean;
paymentLinkSentAt?: string;
paymentStatus?: 'pending' | 'completed' | 'failed' | 'expired';
paymentAmount?: number;
membershipTier?: 'base' | 'peak' | 'peak-results';
stripeCustomerId?: string;
stripeSubscriptionId?: string;
```

### Guest Pass Activation

New capability alongside payment:

```typescript
interface GuestPass {
  id: string;
  leadId: string;
  code: string;             // Unique 6-char alphanumeric
  type: '1-day' | '3-day' | '7-day';
  status: 'active' | 'used' | 'expired';
  location: Location;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}
```

New function tool `activate_guest_pass` generates a unique code, SMS delivers it, and a new `/api/guest-pass/verify` endpoint lets front desk staff validate codes.

### Tour Scheduling

New service `ws-backend/src/services/calendar-service.ts` with function tool `schedule_tour` that books the next available 30-min slot and sends SMS confirmation with date/time.

### Security & Compliance

- **PCI**: Stripe Checkout handles all card data. Our backend never touches credit cards.
- **Webhook verification**: Always verify `Stripe-Signature` header
- **Rate limiting**: Max 5 payment link requests per lead per hour
- **Fraud prevention**: Phone verification required, geofencing optional
- **FTC Negative Option Rule**: Agent must state recurring charge terms and get verbal confirmation before sending payment link

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASE=price_base_monthly_usd
STRIPE_PRICE_PEAK=price_peak_monthly_usd
STRIPE_PRICE_PEAK_RESULTS=price_peak_results_monthly_usd
CHECKOUT_SUCCESS_URL=https://crunchfitness.com/payment-success
CHECKOUT_CANCEL_URL=https://crunchfitness.com/payment-canceled
```

### Build Timeline

| Day | Deliverable |
|-----|-------------|
| Day 1 | `send_payment_link` function tool + Stripe session + SMS delivery. Agent can close sales. |
| Day 2 | Stripe webhook + payment confirmation + status tracking in CallRecord. |
| Day 3 | Guest pass activation with unique codes + SMS delivery + verification endpoint. |
| Day 4 | Tour scheduling with calendar service + SMS confirmation. |
| Week 2 | Database persistence, subscription management, retry/idempotency, admin views. |

### New/Modified Files

| Action | File |
|--------|------|
| Create | `ws-backend/src/services/stripe-service.ts` |
| Create | `ws-backend/src/services/calendar-service.ts` |
| Create | `ws-backend/src/routes/stripe-webhook.ts` |
| Create | `ws-backend/src/routes/guest-pass.ts` |
| Modify | `ws-backend/package.json` (add `stripe`) |
| Modify | `ws-backend/src/types/index.ts` (payment + guest pass fields) |
| Modify | `ws-backend/src/services/deepgram-agent.ts` (3 new function tools) |
| Modify | `ws-backend/src/routes/twilio-media.ts` (handle new function calls) |
| Modify | `ws-backend/src/server.ts` (register new routes) |
| Modify | `ws-backend/src/prompts/voice-agent-system.ts` (mention payment closing) |

---

## 8. Workstream 5: Proactive Lead Signal Expansion

### Current State

The only way a lead enters the system is by filling out a 7-field form on `/join`. This is passive -- it only captures people motivated enough to seek out the gym AND complete the form.

Current `LeadSource` type: `'web-form' | 'inbound-call' | 'manual'` -- only `web-form` is wired up.

### Signal Ingestion Architecture

Insert a **Signal Ingestion Layer** between "something happened" and "process this lead":

```typescript
// Expand LeadSource
type LeadSource =
  | 'web-form'           // existing
  | 'inbound-call'       // existing
  | 'manual'             // existing
  | 'behavior-pricing'   // visitor dwelled on pricing page
  | 'behavior-return'    // repeat visitor detected
  | 'form-abandon'       // partial form data captured
  | 'chat-proactive'     // proactive chat engagement
  | 'gbp-review'         // Google Business Profile review
  | 'social-mention'     // social media fitness intent
  | 'referral'           // member referral link
  | 'intent-provider'    // third-party intent data
  | 'partnership'        // corporate/apartment/medical
  | 'seasonal-campaign'; // calendar-triggered

// New signal type
interface LeadSignal {
  signalId: string;
  source: LeadSource;
  confidence: number;          // 0.0 to 1.0
  capturedAt: string;
  // Progressive profile -- all fields optional
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  passType?: PassType;
  interest?: string;
  location?: Location;
  metadata: Record<string, unknown>;
  requiresEnrichment: boolean;
}
```

### Signal Router

New service: `ws-backend/src/services/signal-router.ts`

Responsibilities:
1. **Deduplication**: Multiple signals for same person (by phone, email, or device fingerprint) accumulate on a single lead
2. **Intent scoring**: `intentScore = min(100, sum(signal.confidence * recencyDecay * 20))`
3. **Threshold routing**:
   - Score 30-49 (anonymous): Proactive chat opens on next visit
   - Score 50-69 (contactable): SMS outreach via soft-touch templates
   - Score 70-89 (contactable): Outbound call via campaign engine
   - Score 90+ (full): Full orchestrator -- voice + SMS + chat simultaneously
4. **Progressive profiling**: As anonymous leads interact, their profile fills in
5. **Prompt assembly**: Constructs context for voice/chat/SMS based on signal history

### Tier 1: High Feasibility (demo in 1-2 days)

#### 1A. Pricing Page Dwell Detection

Client-side `IntersectionObserver` + `setTimeout` on the pricing section of `/join`. After 3+ minutes viewing pricing, fires signal to `POST /api/signals/behavior`.

- Data: `deviceFingerprint`, `pageUrl`, `dwellTimeMs`, `scrollDepth`
- No PII -- lead is `anonymous`
- Action: Proactive chat opens with low-pressure greeting:
  > "A lot of people wonder about the difference between Base and Peak -- want me to break that down?"

#### 1B. Abandoned Form Detection

`beforeunload` handler + 30-second inactivity timer in `LeadForm.tsx`. If at least phone OR email is filled, `navigator.sendBeacon('/api/signals/form-abandon', payload)`.

- Data: Partial form fields, `abandonedAt`, `timeOnForm`
- Action: If phone available, SMS: "Looks like you were checking out Crunch but didn't finish. Reply START for your free pass details."
- Confidence: 0.75 (started filling = strong intent)

#### 1C. Return Visitor Detection

`localStorage` visit counter on `/join`. On 3rd visit, signal fires.

- Data: `visitCount`, `firstVisitAt`, `lastVisitAt`, `deviceFingerprint`
- Action: Proactive chat:
  > "Hey! I've noticed you've been checking us out. What's the one thing you'd want to know before trying us?"
- Confidence: 0.7

### Tier 2: Medium Feasibility (week of work)

#### 2A. Google Business Profile Reviews

Scheduled job polls Google My Business API every 30 minutes. Groq classifier analyzes reviews for intent signals (mentions of "looking for a gym", competitor complaints, fitness interests).

- Data: Reviewer name, review text, star rating
- Action: High-intent reviews (score > 0.6) create a lead signal; business responds with Vi-drafted personalized reply
- Challenge: Requires OAuth2 with business owner's Google account

#### 2B. Referral Engine

Members get unique referral links: `crunch.vi.com/join?ref=MEMBER123`. Friend clicks -> referral code captured -> personalized banner on `/join`:
> "Your friend [Name] thinks you'd love Crunch. Here's your free guest pass."

- Confidence: 0.85 (warm referrals convert 3-5x cold leads)
- Voice agent opens with social proof: "Hey! [MemberName] passed along your info -- they're one of our favorite members."

#### 2C. Social Media Monitoring

Webhook receiver for social listening alerts (Instagram/Facebook/X posts geotagged to Colorado Springs with fitness keywords).

- Action: Vi drafts a reply/DM for staff approval; links to `/join?source=social`
- Lower PII availability, higher volume

### Tier 3: Lower Feasibility, Highest 10x Potential

#### 3A. Intent Data Providers

Webhook from providers like Bombora delivering "surging" contacts researching fitness in the Colorado Springs DMA.

- Data: Name, email, company, intent topics, surge score
- Action: Email nurture sequence (no phone typically)
- Cold outreach -- natural opener required, no surveillance vibe

#### 3B. Partnership Signals

Three sub-channels:
- **Corporate wellness**: HR submits employee lists eligible for corporate rates
- **Apartment move-ins**: New residents within 2 miles of either location
- **Medical referrals**: Doctors refer patients to exercise programs (confidence: 0.80)

Each channel gets a tailored first-touch approach.

#### 3C. Seasonal/Behavioral Triggers

Campaign scheduler fires signals on calendar events:
- New Year's (Jan 1-15): Boost confidence scores, reactivate nurture leads from past 90 days
- Post-holiday: Target lapsed members with win-back campaigns
- Local event sponsorship: Import attendee lists as partnership signals

### Voice Agent Prompt Adaptation by Signal Source

The `buildVoiceAgentPrompt()` function gets a new variant that injects signal-aware context:

```
// Abandoned form lead:
"This person started filling out a guest pass form but didn't finish.
Don't make them feel surveilled. Say: 'I saw you were looking into a pass
at Crunch -- wanted to make sure you got everything you needed.'"

// Return visitor:
"This visitor has come 3 times without signing up. Be direct: 'What's
the one thing you'd want to know before trying us out?'"

// Referral:
"Referred by [MemberName] with a [Peak] membership. Open with social proof."

// Medical referral:
"Dr. [Name]'s office mentioned you might be interested in fitness.
We have a really supportive environment..."
```

### New Files

| File | Purpose |
|------|---------|
| `frontend/src/app/api/signals/behavior/route.ts` | Pricing dwell + return visitor signals |
| `frontend/src/app/api/signals/form-abandon/route.ts` | Abandoned form signal |
| `ws-backend/src/services/signal-router.ts` | Dedup, scoring, threshold routing |
| `ws-backend/src/services/gbp-monitor.ts` | Google review monitoring |
| `ws-backend/src/services/social-monitor.ts` | Social media webhook receiver |
| `ws-backend/src/services/campaign-scheduler.ts` | Seasonal trigger scheduler |

---

## 9. Integration Plan & Build Sequence

### Dependencies Between Workstreams

```
WS4 (Payment) -----> WS2 (Campaigns) -- payment link is a touch type
WS2 (Campaigns) ---> WS3 (Dashboard) -- exception queue needs campaign types
WS5 (Signals) -----> WS2 (Campaigns) -- signals create leads that enter campaigns
WS1 (Voice Tools) -> WS2 (Campaigns) -- campaign voice touches use expanded tools
```

### Data Model Resolutions

**Tension**: WS1 extends `CallRecord` with payment fields; WS2 introduces `TouchPoint` as primary interaction record.
**Resolution**: Keep `CallRecord` for voice-specific data (transcript, audio, payment). `TouchPoint` wraps all channels and references `callRecordId` for voice touches.

**Tension**: WS5 introduces `PartialLead` and `LeadSignal`; WS2 extends `Lead` with campaign fields.
**Resolution**: Single `Lead` type with optional fields and `completeness: 'full' | 'contactable' | 'anonymous'`.

### Recommended Build Sequence

```
Week 1:  Payment Integration (WS4) + Trivial Voice Tools (WS1)
         -> Unlocks closing capability

Week 2:  Campaign Data Model (WS2 types) + Lead Signal Types (WS5 types)
         -> Shared foundation for all workstreams

Week 3:  Campaign Engine (WS2 scheduler, executor, templates)
         -> Autonomous multi-touch campaigns running

Week 4:  Dashboard Redesign (WS3) + Tier 1 Lead Signals (WS5)
         -> GM can see exceptions + more leads entering funnel

Week 5:  Voice Agent Prompt Overhaul (WS1 closing framework)
         + Campaign-aware SMS (WS2 two-way SMS, reply tracking)
         -> Full qualify-and-close capability

Week 6:  Integration testing, seed data update, polish
         -> Demo-ready
```

---

## 10. The One Thing to Build First

If you do nothing else: **add `send_payment_link` as a Deepgram function tool.**

It's 1 day of work:
1. `npm install stripe` in ws-backend
2. Create `stripe-service.ts` with `createCheckoutSession()`
3. Add the function tool to the Deepgram agent config
4. Handle the function call in `twilio-media.ts`: create session -> SMS the URL
5. Add Stripe env vars

It requires zero infrastructure changes -- the existing in-memory architecture, Twilio SMS service, and Deepgram function call pattern all support it.

And it directly validates the 10x thesis: the AI can now close sales during live calls. Every other workstream amplifies this core capability.

```
Before: "That's great you're interested! I'll have someone follow up."
After:  "I'm sending you a secure payment link right now. Check your texts."
```

That's the difference between a tool and an agent.
