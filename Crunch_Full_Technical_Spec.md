# Vi Operate — Crunch Fitness: Full Technical Specification
## Implementation Guide for Claude Code

### Version 1.0 | March 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Infrastructure & Deployment](#3-infrastructure--deployment)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Frontend Application (Next.js 14)](#5-frontend-application-nextjs-14)
6. [WebSocket Backend (Fastify)](#6-websocket-backend-fastify)
7. [AI Voice Agent Pipeline](#7-ai-voice-agent-pipeline)
8. [Web Chat System](#8-web-chat-system)
9. [SMS Follow-Up System](#9-sms-follow-up-system)
10. [GM Dashboard & Analytics](#10-gm-dashboard--analytics)
11. [Lead Management & CRM](#11-lead-management--crm)
12. [Conversation State Machine](#12-conversation-state-machine)
13. [Post-Call Classification System](#13-post-call-classification-system)
14. [API Route Specifications](#14-api-route-specifications)
15. [Data Models](#15-data-models)
16. [Brand & UI Guidelines](#16-brand--ui-guidelines)
17. [Gap Analysis & Build Plan](#17-gap-analysis--build-plan)
18. [Environment Variables](#18-environment-variables)
19. [Success Metrics & Monitoring](#19-success-metrics--monitoring)
20. [Seed Data Requirements](#20-seed-data-requirements)

---

## 1. System Overview

Vi Operate for Crunch Fitness is an AI-powered digital growth engine that handles lead conversion, membership sales, guest pass activation, and member retention across Crunch Fitness's Colorado Springs locations. The system provides three channels:

- **AI Voice Agent** — Outbound/inbound calls via Twilio + Deepgram Voice Agent API
- **Web Chat Concierge** — Gemini-powered real-time chat on the landing page
- **SMS Follow-Ups** — Automated post-call and campaign messaging via Twilio

**Target:** Demo deployment for Crunch Fitness sales team evaluation

**Locations:**
- South Academy — 1801 S Academy Blvd, Colorado Springs, CO
- North Academy — 5620 N Academy Blvd, Colorado Springs, CO

**Brand Identity:** Orange #FF9247, "No Judgments" / "Feel Good, Not Bad"

### 1.1 Six Capability Pillars

| Pillar | Description | Channels |
|--------|-------------|----------|
| **Sell & Convert** | Lead qualification, membership sales, pricing transparency, guest pass issuance | Voice, Chat, SMS |
| **Schedule & Recover** | Tour booking, class scheduling, no-show detection, rebooking | Voice, Chat, SMS |
| **Notify & Follow-Up** | Post-call SMS, appointment reminders, win-back campaigns | SMS |
| **Support & Inform** | Pricing questions, class schedules, location info, hours, amenities | Voice, Chat |
| **Omnichannel** | Unified conversation context across voice, chat, and SMS | All |
| **Who It Serves** | Prospects (leads), current members, lapsed members, gym managers | All |

---

## 2. Architecture Principles

### 2.1 Core Principle: Deterministic Business Rules, Probabilistic Conversation

The system separates two fundamentally different concerns:

- **Conversation Layer (probabilistic):** LLMs generate natural, energetic, judgment-free conversational responses. This layer handles ambiguous utterances, conversational repair, tone management, and context maintenance. Models: GPT-4o-mini (voice), Gemini 2.5 Flash (chat).

- **Business Rules Layer (deterministic):** A rule-based engine evaluates membership tier eligibility, pricing logic, guest pass rules, location routing, and escalation protocols. This layer uses exact matching, validated lookups, and predefined rules. All business decisions are auditable, testable, and predictable.

### 2.2 Channel Architecture

```
                    ┌──────────────────┐
                    │   Lead Form      │
                    │   /join (public)  │
                    └────────┬─────────┘
                             │ POST /api/lead/submit
                    ┌────────▼─────────┐
                    │  Lead Processor   │
                    │  (WS Backend)     │
                    └──┬──────┬──────┬─┘
                       │      │      │
              ┌────────▼┐  ┌──▼───┐  ┌▼────────┐
              │ Twilio   │  │ Web  │  │ Twilio  │
              │ Voice    │  │ Chat │  │ SMS     │
              │ (call)   │  │(live)│  │(follow) │
              └────┬─────┘  └──┬───┘  └─────────┘
                   │           │
         ┌─────────▼┐    ┌────▼──────┐
         │ Deepgram  │    │ Gemini    │
         │ Voice     │    │ 2.5 Flash │
         │ Agent API │    └───────────┘
         └─────┬─────┘
               │ Post-call
         ┌─────▼─────┐
         │ Groq       │
         │ Llama 3.3  │
         │ 70B        │
         │ (classify) │
         └─────┬──────┘
               │
         ┌─────▼─────┐
         │ Dashboard  │
         │ /dashboard │
         └────────────┘
```

---

## 3. Infrastructure & Deployment

### 3.1 Service Map

| Service | Stack | Container | Deployment |
|---------|-------|-----------|------------|
| Frontend | Next.js 14, Tailwind CSS, TypeScript | `crunch-frontend` | CloudFront → ALB → ECS Fargate |
| WS Backend | Fastify, WebSocket, TypeScript | `crunch-ws` | CloudFront → ALB → ECS Fargate |
| Voice STT/TTS/LLM | Deepgram Voice Agent API | External | WebSocket bridge |
| Chat LLM | Google Gemini 2.5 Flash | External | Direct API call from frontend route |
| Post-Call Classification | Groq (Llama 3.3 70B) | External | REST API call from WS backend |
| Telephony | Twilio (Voice + SMS) | External | Outbound calls + Media Streams |

### 3.2 AWS Resources

| Resource | Detail |
|----------|--------|
| ECS Cluster | `ymca-cluster` (shared) |
| ECR Repos | `crunch-ws`, `crunch-frontend` |
| CloudFront (Frontend) | `ddqqgw7on1vri.cloudfront.net` |
| CloudFront (WS) | `dgsgmuc7zb7i2.cloudfront.net` |
| ALB | Routes to ECS tasks |
| Task Definitions | 1 vCPU / 2GB RAM per service |

### 3.3 URLs

| Purpose | URL |
|---------|-----|
| Frontend (Production) | `https://ddqqgw7on1vri.cloudfront.net` |
| WS Backend (Production) | `https://dgsgmuc7zb7i2.cloudfront.net` |
| Frontend (Dev) | `http://localhost:3000` |
| WS Backend (Dev) | `http://localhost:8080` |
| GitHub (Frontend) | `https://github.com/tom-vi-code/crunch-fitness-demo` |
| GitHub (WS Backend) | `https://github.com/tom-vi-code/crunch-fitness-ws` |

### 3.4 Deployment Flow

```bash
# Frontend
docker build -t crunch-frontend .
docker tag crunch-frontend:latest <ECR_URI>/crunch-frontend:latest
docker push <ECR_URI>/crunch-frontend:latest
aws ecs update-service --cluster ymca-cluster --service crunch-frontend --force-new-deployment

# WS Backend
docker build -t crunch-ws .
docker tag crunch-ws:latest <ECR_URI>/crunch-ws:latest
docker push <ECR_URI>/crunch-ws:latest
aws ecs update-service --cluster ymca-cluster --service crunch-ws --force-new-deployment
```

---

## 4. Monorepo Structure

There are **two separate repositories**:

### 4.1 Frontend Repo (`crunch-fitness-demo`)

```
crunch-fitness-demo/
├── src/
│   └── app/
│       ├── page.tsx                          # App entry / router
│       ├── layout.tsx                        # Root layout + metadata
│       ├── globals.css                       # Tailwind + custom styles
│       ├── join/
│       │   └── page.tsx                      # Lead submission form (PUBLIC, no auth)
│       ├── dashboard/
│       │   └── page.tsx                      # GM Dashboard (password-protected)
│       ├── api/
│       │   ├── lead/
│       │   │   └── submit/route.ts           # POST: Submit lead → trigger call
│       │   ├── chat/route.ts                 # POST: Gemini chat completions
│       │   ├── analytics/route.ts            # GET: Dashboard analytics data
│       │   ├── calls/route.ts                # GET: Call log with filters
│       │   └── calls/[id]/route.ts           # GET: Individual call detail
│       ├── components/
│       │   ├── LeadForm.tsx                  # Lead capture form component
│       │   ├── WebChat.tsx                   # Post-submission chat UI
│       │   ├── Dashboard/
│       │   │   ├── KPICards.tsx              # KPI metric cards
│       │   │   ├── CallLog.tsx               # Filterable call list
│       │   │   ├── CallDetail.tsx            # Individual call transcript view
│       │   │   ├── ConversionFunnel.tsx      # Funnel visualization
│       │   │   ├── LocationBreakdown.tsx     # South vs North Academy
│       │   │   └── OutcomeDistribution.tsx   # 14-outcome pie/bar chart
│       │   └── ui/                           # Shared UI primitives
│       └── lib/
│           ├── types.ts                      # Shared TypeScript types
│           ├── constants.ts                  # Pricing, locations, brand constants
│           └── utils.ts                      # Helpers (phone formatting, etc.)
├── public/
│   ├── crunch-logo.svg                       # Crunch "C" logo
│   └── favicon.ico
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── Dockerfile
└── .env.local
```

### 4.2 WS Backend Repo (`crunch-fitness-ws`)

```
crunch-fitness-ws/
├── src/
│   ├── server.ts                             # Fastify entry point
│   ├── routes/
│   │   ├── twilio-voice.ts                   # POST /twilio/voice — TwiML webhook
│   │   ├── twilio-media.ts                   # WS /twilio/media-stream — audio bridge
│   │   ├── twilio-status.ts                  # POST /twilio/status — call status callback
│   │   └── health.ts                         # GET /health
│   ├── services/
│   │   ├── deepgram-agent.ts                 # Deepgram Voice Agent WebSocket client
│   │   ├── call-manager.ts                   # Active call session management
│   │   ├── twilio-service.ts                 # Twilio REST API (initiate calls, send SMS)
│   │   ├── groq-classifier.ts               # Post-call summary + 14-outcome classification
│   │   ├── sms-service.ts                    # SMS template selection + sending
│   │   └── lead-processor.ts                 # Lead intake → call initiation pipeline
│   ├── prompts/
│   │   ├── voice-agent-system.ts             # Voice agent system prompt (Crunch-specific)
│   │   ├── classification-prompt.ts          # Groq classification prompt
│   │   └── sms-templates.ts                  # SMS follow-up templates
│   ├── config/
│   │   ├── crunch-knowledge.ts               # Pricing, classes, locations, hours, amenities
│   │   └── outcomes.ts                       # 14 outcome definitions
│   └── types/
│       └── index.ts                          # Shared types
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env
```

---

## 5. Frontend Application (Next.js 14)

### 5.1 Lead Submission Form (`/join`)

**Route:** `/join` — PUBLIC, no authentication required
**Priority:** P0 | Must be the first thing built

#### Design Specification

- **Background:** White #FFFFFF
- **Accent color:** Orange #FF9247
- **Header:** Crunch "C" logo (orange square, white C) + "Crunch Fitness" + "Powered by Vi Operate"
- **Hero text:** "Start Your Free Trial at Crunch" / "No Judgments. Just results."
- **Benefit chips (horizontal row):** "200+ Classes" | "No Judgments" | "From $9.99/mo" | "Free Guest Passes"

#### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | text | Yes | min 1 char |
| Last Name | text | Yes | min 1 char |
| Phone | tel | Yes | E.164 US format (+1XXXXXXXXXX), auto-format on blur |
| Email | email | Yes | valid email |
| Pass Type | select | Yes | Options: "1-Day Free Trial", "3-Day Guest Pass", "7-Day Guest Pass" |
| Primary Interest | select | Yes | Options: "General Fitness", "Weight Loss", "Group Classes", "Personal Training", "Yoga", "Cycling", "Kickboxing", "Diet Coaching" |
| Location | select | Yes | Options: "Crunch South Academy", "Crunch North Academy" |

#### CTA Button
- Text: "Claim My Free Pass →"
- Style: Solid orange #FF9247, white text, rounded, full-width
- Hover: Darker orange #E07830

#### Pricing Teaser (Below Form)
3-column card grid:

| Tier | Price | Highlights |
|------|-------|------------|
| Base | $9.99/mo | Standard classes, basic amenities |
| Peak | $24.99/mo | All classes, premium amenities, guest privileges |
| Peak Results | Premium | All Peak + personal training, HRM, priority booking |

#### Phone Number Auto-Formatting

```typescript
function formatPhoneE164(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  throw new Error('Invalid US phone number');
}
```

#### On Submit

1. Validate all fields
2. POST to `/api/lead/submit` with form data
3. On success: Transition to Web Chat view (same page, swap components)
4. On error: Show red error banner with message

#### Acceptance Criteria

- [ ] White-themed form matches Crunch.com branding
- [ ] All form fields validate correctly
- [ ] Phone number auto-formats to E.164
- [ ] Submit triggers Twilio outbound call within 30 seconds
- [ ] Transitions to chat view on success
- [ ] Error states display clearly

### 5.2 Post-Submission Web Chat

**Trigger:** Automatic after successful form submission — same `/join` page, swap form for chat
**Priority:** P0

#### AI Configuration

- **Model:** Google Gemini 2.5 Flash
- **Endpoint:** `/api/chat` (Next.js API route)
- **System prompt:** Full Crunch context including pricing, programs, locations, hours, guest pass policies

#### UI Specification

- **Background:** White
- **Agent messages:** Gray-100 bubbles, left-aligned
- **User messages:** Orange #FF9247 bubbles, right-aligned
- **Header:** "Vi" avatar + "Chat with Vi" + animated orange "Call incoming..." badge
- **Input:** Text input + send button at bottom

#### Initial Greeting (Personalized)

Template:
```
Hey {firstName}! 🎉 Welcome to Crunch {locationName}! I see you're interested in a {passType} — great choice!

I'm Vi, your personal Crunch concierge. While our team gives you a call, I can help you with anything — pricing, class schedules, what to expect on your first visit. What would you like to know?
```

#### Chat Capabilities

The agent can answer questions about:
- Membership pricing (Base $9.99, Peak $24.99, Peak Results pricing)
- Class schedules and program details (200+ classes)
- Location amenities and hours for both locations
- Tour availability and what to expect
- Guest pass details and activation process
- Personal training options
- No Judgments philosophy and gym culture

#### "Call Incoming" Indicator

- Animated orange badge in chat header
- Pulses while call is pending
- Text: "📞 Call incoming..."
- Persists until call connects or times out (60 seconds)

#### Auth: Public (no login required)

### 5.3 Dashboard Login

**Route:** `/` (root) — password gate
**Password:** `crunch2026`

Simple password input → on correct password, redirect to `/dashboard`. Store auth in sessionStorage.

### 5.4 GM Dashboard (`/dashboard`)

**Priority:** P1

#### Layout
- Full dark theme (bg: #0a0a0f, text: #f0f0f5)
- Left sidebar with navigation
- Main content area with tabs: Call Log | Configuration | Reporting | Voice Call

#### KPI Cards (Top Row)

| KPI | Calculation | Period Filters |
|-----|-------------|----------------|
| Total Calls | Count of all calls | Today, This Week, All Time |
| Connect Rate | (Connected calls / Total calls) × 100 | Same |
| Avg Duration | Mean call duration in seconds | Same |
| Tours Booked | Count of outcome=tour-booked | Same |
| Conversion Rate | (tour-booked + membership-sold + guest-pass-issued + trial-activated) / connected × 100 | Same |
| Escalations | Count of calls transferred to human | Same |
| Avg Sentiment | Mean sentiment score (0-100) | Same |

#### Location Breakdown Section

Side-by-side comparison:
- South Academy stats vs North Academy stats
- Call volume, connect rate, top outcomes per location

#### Outcome Distribution

Visual chart (pie or bar) showing distribution across all 14 outcomes.

#### Recent Calls Table

| Column | Content |
|--------|---------|
| Contact | Name + phone |
| Location | South/North Academy |
| Outcome | Badge with outcome label |
| Duration | MM:SS format |
| Sentiment | Score badge (color-coded) |
| Date/Time | Relative time |
| Action | "View" link → Call Detail |

Filters: Location, outcome, date range, search text (name/phone).

#### Call Detail View

On clicking a call row:
- Full transcript (alternating caller/agent messages with timestamps)
- AI-generated summary (2-3 sentences)
- Outcome classification with confidence
- Key moments highlighted
- Sentiment score
- Call metadata (duration, timestamps, location, channel)

#### Analytics Section (`/api/analytics`)

- **Conversion Funnel:** Lead → Connected → Engaged → Converted (with drop-off percentages)
- **Daily Trend:** 7-day line chart of call volume and conversions
- **Top Objections:** Ranked list of common objections from call analysis
- **Trainer Demand:** Which personal training requests are most common

---

## 6. WebSocket Backend (Fastify)

### 6.1 Server Configuration

```typescript
// server.ts
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';

const server = Fastify({ logger: true });

await server.register(cors, { origin: '*' });
await server.register(websocket);

// Routes
server.post('/twilio/voice', twilioVoiceHandler);        // TwiML webhook
server.register(twilioMediaHandler);                       // WS /twilio/media-stream
server.post('/twilio/status', twilioStatusHandler);        // Call status callback
server.post('/api/lead/process', leadProcessorHandler);    // Called by frontend
server.get('/health', () => ({ status: 'ok' }));

server.listen({ port: 8080, host: '0.0.0.0' });
```

### 6.2 Call Flow Sequence

```
1. Frontend POST /api/lead/submit
   └→ Frontend POST to WS Backend /api/lead/process (with lead data)
      └→ WS Backend calls Twilio REST API to initiate outbound call
         └→ Twilio calls prospect's phone
         └→ Twilio hits POST /twilio/voice for TwiML
            └→ TwiML returns <Connect><Stream> pointing to /twilio/media-stream
               └→ WebSocket opens: Twilio ↔ WS Backend ↔ Deepgram Voice Agent
                  └→ Real-time audio: Twilio sends mulaw → WS bridges → Deepgram
                  └→ Deepgram streams TTS audio back → WS bridges → Twilio
         └→ Call ends
            └→ Twilio hits POST /twilio/status with final status
            └→ WS Backend sends transcript to Groq for classification
            └→ WS Backend sends SMS follow-up via Twilio
```

### 6.3 TwiML Webhook (`/twilio/voice`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://{WS_BACKEND_URL}/twilio/media-stream">
      <Parameter name="leadId" value="{leadId}" />
      <Parameter name="firstName" value="{firstName}" />
      <Parameter name="lastName" value="{lastName}" />
      <Parameter name="passType" value="{passType}" />
      <Parameter name="interest" value="{interest}" />
      <Parameter name="location" value="{location}" />
      <Parameter name="email" value="{email}" />
    </Stream>
  </Connect>
</Response>
```

### 6.4 Audio Bridge (`/twilio/media-stream`)

The WebSocket handler bridges Twilio Media Streams and Deepgram Voice Agent API:

**Twilio → Deepgram:**
- Receive `media` events from Twilio (base64-encoded mulaw audio, 8kHz, 160-byte frames)
- Decode and forward raw audio to Deepgram Voice Agent WebSocket

**Deepgram → Twilio:**
- Receive TTS audio from Deepgram (mulaw 8kHz)
- Encode to base64 and send as `media` events to Twilio

**Session Management:**
- On `start` event: Create Deepgram session, inject lead context into agent prompt
- On `stop` event: Close Deepgram session, trigger post-call processing
- Track transcript accumulation for post-call classification

---

## 7. AI Voice Agent Pipeline

### 7.1 Deepgram Voice Agent Configuration

| Component | Value |
|-----------|-------|
| Provider | Deepgram Voice Agent API |
| STT Model | Deepgram Nova-3 |
| LLM | GPT-4o-mini (via Deepgram) |
| TTS Voice | Deepgram Aura-2-Thalia |
| Audio Format | mulaw, 8000Hz, 160-byte frames |
| Language | en-US |
| Endpointing | 300ms silence |
| Interruption | Enabled (barge-in) |

### 7.2 Voice Agent System Prompt

```
You are Vi, a friendly and energetic membership concierge for Crunch Fitness in Colorado Springs. You embody the "No Judgments" philosophy — warm, motivating, and never pushy.

CALLER CONTEXT:
- Name: {firstName} {lastName}
- Email: {email}
- Interest: {interest}
- Pass Type: {passType}
- Location: {location}

YOUR PERSONALITY:
- Energetic and positive, like the best front desk person at the gym
- Use the caller's first name naturally
- Be enthusiastic about their fitness goals
- Never pressure — guide and inform
- Keep responses conversational (2-3 sentences max)

PRICING (share openly when asked):
- Base Membership: $9.99/month — standard classes, basic amenities
- Peak Membership: $24.99/month — all classes, premium amenities, guest privileges
- Peak Results: Premium pricing — everything in Peak + personal training credits, HRM rental, priority class booking
- Annual commitment options available with lower monthly rate
- No enrollment fee with guest pass activation (limited time)

GUEST PASS ACTIVATION:
- 1-Day Free Trial: Full gym access for one day, all classes included
- 3-Day Guest Pass: Three consecutive days of full access
- 7-Day Guest Pass: Full week of access, best way to experience Crunch

LOCATIONS:
- South Academy: 1801 S Academy Blvd, Colorado Springs, CO
  Hours: Mon-Fri 5am-11pm, Sat-Sun 7am-9pm
- North Academy: 5620 N Academy Blvd, Colorado Springs, CO
  Hours: Mon-Fri 5am-11pm, Sat-Sun 7am-9pm

AMENITIES: Both locations offer group fitness studios, free weights, cardio equipment, functional training areas, locker rooms, and tanning.

CLASSES: 200+ classes per week including cycling, kickboxing, yoga, HIIT, Zumba, body pump, and more.

CONVERSATION FLOW:
1. Greet warmly, reference their interest and pass type
2. Ask what questions they have / what they're looking for
3. Share relevant info (pricing, classes, amenities)
4. Offer to activate their guest pass and schedule a tour
5. Confirm next steps and say goodbye encouragingly

FUNCTION TOOLS:
- hang_up: Call this when the conversation has naturally concluded
- send_sms: Call this to send the prospect a confirmation text with next steps

RULES:
- If asked about something you don't know, say you'll have the front desk follow up
- Never make up class schedules or specific times — offer to check
- If the caller seems uninterested, respect that and offer to send info via text
- If the caller asks for a manager or has a complaint, acknowledge and offer to transfer
```

### 7.3 Function Tools (Deepgram Agent)

#### `hang_up`
```json
{
  "name": "hang_up",
  "description": "End the phone call gracefully after the conversation has concluded",
  "parameters": { "type": "object", "properties": {} }
}
```
Implementation: Sends a Twilio REST API call to end the call leg.

#### `send_sms`
```json
{
  "name": "send_sms",
  "description": "Send an SMS to the prospect with a confirmation or follow-up message",
  "parameters": {
    "type": "object",
    "properties": {
      "message_type": {
        "type": "string",
        "enum": ["tour_confirmation", "guest_pass_info", "pricing_summary", "general_followup"],
        "description": "Type of SMS to send"
      }
    },
    "required": ["message_type"]
  }
}
```

### 7.4 Inbound Call Handling

For inbound calls (prospects calling the Crunch number):
- Twilio routes to same `/twilio/voice` webhook
- No lead context available — agent uses generic greeting:
  ```
  Hey there! Thanks for calling Crunch Fitness Colorado Springs. I'm Vi, your AI concierge. How can I help you today?
  ```
- Agent collects name, interest, and location during conversation
- Post-call creates a new lead record

---

## 8. Web Chat System

### 8.1 Chat API Route (`/api/chat`)

```typescript
// /api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const { messages, leadContext } = await request.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const chat = model.startChat({
    history: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    systemInstruction: buildCrunchSystemPrompt(leadContext),
  });

  const result = await chat.sendMessage(messages[messages.length - 1].content);
  return Response.json({ response: result.response.text() });
}
```

### 8.2 Chat System Prompt

Same knowledge base as voice agent (pricing, locations, classes, amenities) but adapted for text:
- Can use formatting (bold, lists) in responses
- Can include links to class schedules, virtual tour pages
- Slightly longer responses acceptable (3-5 sentences)
- Same personality: warm, energetic, judgment-free

### 8.3 Chat-to-Voice Handoff

When the voice call connects while the prospect is chatting:
- Chat displays notification: "Your call is connecting! Vi will continue the conversation on the phone."
- Chat remains available but secondary to voice
- Chat context (what was discussed) is NOT passed to voice agent in v1 (future enhancement)

---

## 9. SMS Follow-Up System

### 9.1 Trigger Conditions

SMS is sent automatically after:
1. Voice call ends AND post-call summary is generated
2. Guest pass is activated (confirmation)
3. Tour is booked (reminder)
4. No-show detected (re-engagement) — future
5. Win-back campaign trigger (30/60/90 day lapse) — future

### 9.2 SMS Templates

#### Post-Call: Tour Confirmation
```
Hey {firstName}! 🏋️ Great chatting with you! Your tour at Crunch {location} is all set.

📅 Just walk in during staffed hours and mention your guest pass. Our team will give you the full VIP experience!

Questions? Reply to this text anytime. No Judgments — just results! 💪

- Vi @ Crunch Fitness
```

#### Post-Call: Guest Pass Info
```
Hey {firstName}! 🎉 Your {passType} for Crunch {location} is activated!

📍 {locationAddress}
⏰ {locationHours}

Just bring a valid ID and you're all set. Can't wait to see you!

No Judgments. Just results. 💪

- Vi @ Crunch Fitness
```

#### Post-Call: Pricing Summary
```
Hey {firstName}! Here's the pricing info we talked about:

💰 Base: $9.99/mo — classes + basic amenities
⭐ Peak: $24.99/mo — all classes + premium amenities
🏆 Peak Results: Premium — Peak + PT + priority booking

Your {passType} is active — come check us out at Crunch {location}!

- Vi @ Crunch Fitness
```

#### Post-Call: General Follow-Up
```
Hey {firstName}! Thanks for chatting with us about Crunch Fitness! 🙌

Your {passType} is ready to use at Crunch {location}. Just stop by anytime during staffed hours.

Have questions? Reply here or call us. We can't wait to meet you!

No Judgments. Just results. 💪

- Vi @ Crunch Fitness
```

### 9.3 Twilio SMS Implementation

```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to: string, body: string): Promise<void> {
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}
```

---

## 10. GM Dashboard & Analytics

### 10.1 Analytics API (`/api/analytics`)

Returns aggregated data for the dashboard:

```typescript
interface AnalyticsResponse {
  kpis: {
    totalCalls: number;
    connectRate: number;       // percentage
    avgDuration: number;       // seconds
    toursBooked: number;
    conversionRate: number;    // percentage
    escalations: number;
    avgSentiment: number;      // 0-100
  };
  periodComparison: {
    today: KPIs;
    thisWeek: KPIs;
    allTime: KPIs;
  };
  locationBreakdown: {
    southAcademy: LocationStats;
    northAcademy: LocationStats;
  };
  outcomeDistribution: Record<OutcomeType, number>;
  conversionFunnel: {
    leads: number;
    connected: number;
    engaged: number;  // calls > 60 seconds
    converted: number;
  };
  dailyTrend: Array<{
    date: string;        // YYYY-MM-DD
    calls: number;
    conversions: number;
  }>;
  topObjections: Array<{
    objection: string;
    count: number;
    percentage: number;
  }>;
  recentCalls: CallSummary[];  // Last 10
}
```

### 10.2 Calls API (`/api/calls`)

```typescript
// GET /api/calls?location=south&outcome=tour-booked&search=smith&page=1&limit=20

interface CallsResponse {
  calls: CallSummary[];
  total: number;
  page: number;
  totalPages: number;
}

// GET /api/calls/[id]

interface CallDetailResponse {
  id: string;
  leadId: string;
  contact: { firstName: string; lastName: string; phone: string; email: string };
  location: 'south-academy' | 'north-academy';
  direction: 'outbound' | 'inbound';
  duration: number;          // seconds
  outcome: OutcomeType;
  outcomeConfidence: number; // 0-1
  sentiment: number;         // 0-100
  summary: string;           // AI-generated 2-3 sentences
  keyMoments: string[];      // Notable moments from call
  transcript: TranscriptEntry[];
  timestamps: {
    callInitiated: string;   // ISO
    callConnected: string;
    callEnded: string;
    summaryGenerated: string;
    smsFollowUpSent: string;
  };
}

interface TranscriptEntry {
  speaker: 'agent' | 'caller';
  text: string;
  timestamp: number;  // seconds from call start
}
```

---

## 11. Lead Management & CRM

### 11.1 Lead Lifecycle

```
Form Submit → Lead Created (status: new)
  → Call Initiated (status: calling)
    → Call Connected (status: connected)
      → Call Completed (status: completed)
        → Outcome Classified (status: classified)
          → SMS Sent (status: followed-up)
    → No Answer (status: no-answer)
      → Retry Queue (up to 3 attempts)
```

### 11.2 Lead Data Model

```typescript
interface Lead {
  id: string;                  // UUID
  firstName: string;
  lastName: string;
  phone: string;               // E.164
  email: string;
  passType: '1-day' | '3-day' | '7-day';
  interest: string;
  location: 'south-academy' | 'north-academy';
  status: 'new' | 'calling' | 'connected' | 'completed' | 'classified' | 'followed-up' | 'no-answer';
  source: 'web-form' | 'inbound-call' | 'manual';
  createdAt: string;           // ISO timestamp
  callAttempts: number;
  lastCallAttempt: string | null;
  callId: string | null;       // Links to Call record
}
```

### 11.3 Data Storage (v1: In-Memory + Seed Data)

For the demo deployment, use in-memory storage with seed data. The WS backend maintains:
- `Map<string, Lead>` — Active leads
- `Map<string, Call>` — Call records
- Seed data: 47 demo calls pre-loaded for dashboard demonstration

Future: PostgreSQL or DynamoDB for persistent storage.

---

## 12. Conversation State Machine

### 12.1 Voice Agent States (Conceptual)

The voice agent's conversation follows these logical phases, managed by the LLM's system prompt rather than a hard-coded FSM (unlike the simulator which uses explicit states):

| Phase | Agent Behavior |
|-------|---------------|
| **Greeting** | Personalized welcome, reference pass type + interest |
| **Qualification** | Ask about fitness goals, experience, timeline |
| **Information** | Share pricing, classes, amenities based on questions |
| **Booking** | Offer tour, activate guest pass, suggest visit |
| **Confirmation** | Recap next steps, confirm contact info |
| **Close** | Encouraging goodbye, trigger SMS follow-up |

### 12.2 Escalation Rules (Deterministic)

These rules are enforced in the WS backend, not the LLM:

| Trigger | Action |
|---------|--------|
| Caller says "manager" or "complaint" | Flag for human transfer |
| Call duration > 10 minutes | Soft prompt to wrap up |
| 3 consecutive "I don't know" from agent | Transfer to human |
| Caller requests specific employee | Transfer to front desk |
| System error (Deepgram disconnect) | Apologize, send SMS with callback |

---

## 13. Post-Call Classification System

### 13.1 Groq Classification Pipeline

After each call ends:

1. Collect full transcript from the voice session
2. Send to Groq API (Llama 3.3 70B) with classification prompt
3. Receive: summary, outcome, confidence, sentiment, key moments
4. Store classification with call record
5. Trigger appropriate SMS template

**Target latency:** < 15 seconds from call end to classification complete

### 13.2 Classification Prompt

```
You are a call analyst for Crunch Fitness. Analyze this phone call transcript and provide a structured analysis.

TRANSCRIPT:
{transcript}

LEAD CONTEXT:
- Name: {firstName} {lastName}
- Interest: {interest}
- Pass Type: {passType}
- Location: {location}

Respond in JSON format:
{
  "summary": "2-3 sentence summary of the call",
  "outcome": "one of the 14 outcomes below",
  "outcomeConfidence": 0.0 to 1.0,
  "sentiment": 0 to 100 (0=very negative, 100=very positive),
  "keyMoments": ["array of notable moments from the call"],
  "objections": ["any objections raised by the caller"],
  "nextAction": "recommended follow-up action"
}

OUTCOMES (choose exactly one):
1. tour-booked — Caller committed to visiting the gym for a tour
2. membership-sold — Caller signed up for a membership during the call
3. guest-pass-issued — Guest pass was activated and caller plans to visit
4. trial-activated — Free trial was set up for the caller
5. appointment-scheduled — Specific appointment (PT consult, etc.) was booked
6. callback-requested — Caller asked to be called back at a different time
7. info-sent — Caller requested info to be sent via text/email
8. info-provided — Questions answered, no specific commitment made
9. nurture — Interested but not ready, follow up later
10. no-answer — Call was not answered
11. voicemail — Went to voicemail, message left
12. declined — Caller explicitly declined interest
13. tech-issue — Call had technical problems (audio, drops)
14. win-back-success — Lapsed member re-engaged successfully
```

### 13.3 Outcome-to-SMS Mapping

| Outcome | SMS Template |
|---------|-------------|
| tour-booked | Tour Confirmation |
| guest-pass-issued | Guest Pass Info |
| trial-activated | Guest Pass Info |
| membership-sold | (Custom welcome message) |
| info-provided | Pricing Summary |
| info-sent | Pricing Summary |
| nurture | General Follow-Up |
| callback-requested | General Follow-Up |
| appointment-scheduled | Tour Confirmation (adapted) |
| no-answer | (No SMS for first attempt; after 3rd: General Follow-Up) |
| voicemail | General Follow-Up |
| declined | (No SMS) |
| tech-issue | General Follow-Up with apology |
| win-back-success | Guest Pass Info |

---

## 14. API Route Specifications

### 14.1 Frontend API Routes

#### `POST /api/lead/submit`

**Auth:** Public
**Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string (E.164)",
  "email": "string",
  "passType": "1-day | 3-day | 7-day",
  "interest": "string",
  "location": "south-academy | north-academy"
}
```
**Response:** `{ "leadId": "uuid", "status": "calling" }`
**Side Effect:** POSTs lead data to WS backend to initiate Twilio call

#### `POST /api/chat`

**Auth:** Public
**Body:**
```json
{
  "messages": [{ "role": "user | assistant", "content": "string" }],
  "leadContext": {
    "firstName": "string",
    "passType": "string",
    "location": "string",
    "interest": "string"
  }
}
```
**Response:** `{ "response": "string" }`

#### `GET /api/analytics`

**Auth:** Session (password gate)
**Query:** `?period=today|week|all`
**Response:** `AnalyticsResponse` (see section 10.1)

#### `GET /api/calls`

**Auth:** Session
**Query:** `?location=south|north&outcome=string&search=string&page=number&limit=number`
**Response:** `CallsResponse` (see section 10.2)

#### `GET /api/calls/[id]`

**Auth:** Session
**Response:** `CallDetailResponse` (see section 10.2)

### 14.2 WS Backend Routes

#### `POST /api/lead/process`

Called by frontend after lead submission.
**Body:** Lead data
**Action:** Initiates Twilio outbound call, returns immediately
**Response:** `{ "callSid": "string", "status": "initiating" }`

#### `POST /twilio/voice`

Twilio webhook — returns TwiML to connect Media Stream.

#### `WS /twilio/media-stream`

WebSocket endpoint for Twilio Media Streams ↔ Deepgram bridge.

#### `POST /twilio/status`

Twilio call status callback — triggers post-call processing.

#### `GET /health`

Returns `{ "status": "ok", "uptime": number }`

---

## 15. Data Models

### 15.1 Core Types

```typescript
type OutcomeType =
  | 'tour-booked'
  | 'membership-sold'
  | 'guest-pass-issued'
  | 'trial-activated'
  | 'appointment-scheduled'
  | 'callback-requested'
  | 'info-sent'
  | 'info-provided'
  | 'nurture'
  | 'no-answer'
  | 'voicemail'
  | 'declined'
  | 'tech-issue'
  | 'win-back-success';

type Location = 'south-academy' | 'north-academy';
type PassType = '1-day' | '3-day' | '7-day';
type CallDirection = 'outbound' | 'inbound';
type LeadSource = 'web-form' | 'inbound-call' | 'manual';

interface LocationInfo {
  id: Location;
  name: string;           // "Crunch South Academy"
  address: string;        // "1801 S Academy Blvd, Colorado Springs, CO"
  hours: string;          // "Mon-Fri 5am-11pm, Sat-Sun 7am-9pm"
  phone: string;          // Twilio number for this location
}

interface MembershipTier {
  id: string;
  name: string;           // "Base", "Peak", "Peak Results"
  price: string;          // "$9.99/mo", "$24.99/mo", "Premium"
  features: string[];
}
```

### 15.2 Call Record

```typescript
interface CallRecord {
  id: string;                    // UUID
  leadId: string;
  callSid: string;               // Twilio Call SID
  direction: CallDirection;
  location: Location;
  status: 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed' | 'no-answer';
  duration: number;              // seconds
  startedAt: string;             // ISO
  connectedAt: string | null;
  endedAt: string | null;

  // Post-call analysis (populated after Groq classification)
  outcome: OutcomeType | null;
  outcomeConfidence: number | null;
  sentiment: number | null;
  summary: string | null;
  keyMoments: string[] | null;
  objections: string[] | null;
  nextAction: string | null;

  // Transcript
  transcript: TranscriptEntry[];

  // Follow-up
  smsFollowUpSent: boolean;
  smsFollowUpTemplate: string | null;
  smsFollowUpSentAt: string | null;
}
```

---

## 16. Brand & UI Guidelines

### 16.1 Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `crunch-orange` | #FF9247 | Primary brand, CTAs, accents |
| `crunch-orange-dark` | #FF7A1F | Hover states |
| `crunch-button-dark` | #E07830 | Button pressed |
| `bg-public` | #FFFFFF | Public pages (form, chat) |
| `bg-dashboard` | #0A0A0F | Dashboard background |
| `text-public` | #111827 | Public page text (gray-900) |
| `text-dashboard` | #F0F0F5 | Dashboard text |
| `chat-agent-bg` | #F3F4F6 | Agent message bubbles (gray-100) |
| `chat-user-bg` | #FF9247 | User message bubbles |

### 16.2 Typography

- **Font:** Inter / system-ui
- **Headings:** Inter, bold
- **Body:** Inter, regular, 14-16px
- **Dashboard monospace:** Geist Mono (for metrics)

### 16.3 Logo

- Orange square with white "C" lettermark
- Used in header of all pages
- Paired with "Crunch Fitness" text + "Powered by Vi Operate" subtext

### 16.4 Tone of Voice

- Energetic, motivating, fun
- Judgment-free — never condescending
- Like the best front desk person at the gym
- Uses emoji sparingly in SMS (💪 🏋️ 🎉)
- Never uses fitness jargon without context

### 16.5 Taglines

- Primary: "No Judgments"
- Secondary: "Feel Good, Not Bad"
- CTA context: "No Judgments. Just results."

---

## 17. Gap Analysis & Build Plan

### 17.1 Existing from UFC Backend (Can Reuse)

| Capability | Status | Notes |
|-----------|--------|-------|
| Voice Calling (Twilio ↔ Deepgram bridge) | ✅ Fully Built | Core audio bridge, TwiML, Media Streams |
| Tour Booking conversation flow | ✅ Fully Built | Agent can book tours via voice |
| Post-call Classification (Groq) | ✅ Fully Built | Summary + outcome pipeline |
| Dashboard structure | ✅ Mostly Built | KPIs, call log, call detail view |
| Call Log with filters | ✅ Fully Built | Location, outcome, search, date |
| Twilio integration layer | ✅ Fully Built | REST API, webhooks, status callbacks |

### 17.2 Needs Adaptation (Partial Rebuild)

| Capability | Status | What to Change |
|-----------|--------|---------------|
| Web Chat (Gemini) | 🔄 Partial | Exists but needs Crunch system prompt, pricing data, new UI |
| Lead Submission Form | 🔄 Partial | Form exists but needs Crunch fields (pass type, interest), branding |
| Dashboard Analytics | 🔄 Partial | Funnel exists but needs Crunch-specific metrics, 14 outcomes |
| Voice Agent System Prompt | 🔄 Rewrite | Complete rewrite for Crunch context, pricing, personality |
| Membership Sales Flow | 🔄 Partial | Pricing exists in UFC but different tiers/structure |
| Cross-Channel Handoff | 🔄 Partial | Basic structure exists, needs Crunch-specific flows |
| Human Escalation | 🔄 Partial | Transfer logic exists, needs Crunch escalation rules |

### 17.3 New Build Required

| Capability | Priority | Complexity | Notes |
|-----------|----------|-----------|-------|
| Guest Pass Issuance | P0 | Medium | Pass type selection, activation tracking, confirmation |
| SMS Follow-Up Templates | P0 | Low | 4-5 Crunch-branded templates |
| Pricing Transparency | P0 | Low | Agent shares pricing openly (unlike some clients) |
| Crunch Brand Theme | P0 | Low | Orange #FF9247, white bg, "No Judgments" |
| 14-Outcome Classification | P1 | Medium | Expanded from previous set, new Groq prompt |
| Location Breakdown (2 locations) | P1 | Low | Filter/aggregate by South vs North Academy |
| Seed Data (47 demo calls) | P1 | Medium | Realistic demo data for dashboard |
| No-Show Detection | P2 | High | Tour booking tracking → no-show → re-engagement |
| Win-Back Campaigns | P2 | High | Lapsed member identification + outreach |
| SMS Campaign Automation | P2 | Medium | Scheduled/triggered SMS beyond post-call |

### 17.4 Recommended Build Order

```
Phase 1 (Week 1): Core Demo Flow
├── 1. Lead form (/join) with Crunch branding
├── 2. Voice agent system prompt (Crunch-specific)
├── 3. Post-submission web chat (Gemini + Crunch context)
├── 4. SMS follow-up templates
└── 5. Guest pass activation flow

Phase 2 (Week 2): Dashboard & Analytics
├── 6. GM Dashboard with Crunch branding (dark theme)
├── 7. 14-outcome classification (Groq prompt)
├── 8. Call log with filters
├── 9. Call detail view (transcript + summary)
├── 10. Location breakdown (South vs North)
└── 11. Seed data generation (47 calls)

Phase 3 (Week 3): Polish & Demo Prep
├── 12. Conversion funnel visualization
├── 13. Daily trend charts
├── 14. Objection analysis
├── 15. End-to-end testing (form → call → chat → dashboard)
└── 16. Performance optimization (< 2s dashboard load, < 3s voice latency)

Phase 4 (Future): Advanced Features
├── 17. No-show detection & re-engagement
├── 18. Win-back campaign automation
├── 19. CRM integration
├── 20. Real-time call monitoring
├── 21. A/B testing of voice prompts
└── 22. Multi-language support (Spanish)
```

---

## 18. Environment Variables

### 18.1 Frontend (`.env.local`)

```bash
# WS Backend
NEXT_PUBLIC_WS_BACKEND_URL=https://dgsgmuc7zb7i2.cloudfront.net
WS_BACKEND_INTERNAL_URL=http://crunch-ws:8080  # ECS service discovery

# Gemini (Chat)
GEMINI_API_KEY=your_gemini_api_key

# Dashboard Auth
DASHBOARD_PASSWORD=crunch2026
```

### 18.2 WS Backend (`.env`)

```bash
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX  # Outbound caller ID
TWILIO_WEBHOOK_URL=https://dgsgmuc7zb7i2.cloudfront.net/twilio/voice

# Deepgram
DEEPGRAM_API_KEY=your_deepgram_key

# Groq (Post-Call Classification)
GROQ_API_KEY=your_groq_key

# Server
PORT=8080
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info

# Frontend URL (for CORS)
FRONTEND_URL=https://ddqqgw7on1vri.cloudfront.net
```

---

## 19. Success Metrics & Monitoring

### 19.1 Target KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Form completion rate | > 60% of visitors who start the form | Frontend analytics |
| Chat engagement rate | > 40% of submitted leads use chat | Chat session tracking |
| Call connect rate | > 70% | Twilio call status |
| Tour/guest pass conversion | > 25% of connected calls | Outcome classification |
| Post-call SMS delivery | > 95% | Twilio SMS status |
| Dashboard load time | < 2 seconds | Frontend performance |
| Voice agent first-word latency | < 3 seconds | Deepgram metrics |
| Post-call classification latency | < 15 seconds | Groq response time |

### 19.2 Health Checks

| Service | Endpoint | Expected |
|---------|----------|----------|
| Frontend | `/` | 200 OK |
| WS Backend | `/health` | `{ "status": "ok" }` |
| Twilio | API ping | Account active |
| Deepgram | WebSocket connect | Connection established |
| Gemini | Test completion | Response returned |
| Groq | Test completion | Response returned |

---

## 20. Seed Data Requirements

### 20.1 Demo Call Dataset

Generate 47 realistic demo calls for dashboard demonstration:

**Distribution:**
- 20 calls from South Academy, 27 from North Academy
- Mix of all 14 outcomes (weighted toward positive: ~40% converted, ~30% nurture, ~30% other)
- Call durations: 30 seconds to 8 minutes
- Sentiment scores: 45-95 range
- Dates: Spread across last 7 days

**Each call record includes:**
- Realistic first/last names
- Colorado Springs area phone numbers (719-XXX-XXXX format)
- Email addresses
- Full simulated transcript (10-30 exchanges)
- AI-generated summary
- Outcome classification
- Sentiment score
- Key moments
- Location assignment

**Outcome distribution for 47 calls:**
- tour-booked: 8
- guest-pass-issued: 6
- trial-activated: 4
- membership-sold: 2
- info-provided: 7
- nurture: 6
- callback-requested: 3
- info-sent: 3
- no-answer: 3
- voicemail: 2
- declined: 1
- tech-issue: 1
- appointment-scheduled: 1
- win-back-success: 0

---

## Appendix A: Crunch Fitness Knowledge Base

This data should be embedded in both the voice agent and chat system prompts:

### Membership Tiers

| Tier | Monthly Price | Key Features |
|------|--------------|--------------|
| Base | $9.99 | Standard group fitness classes, basic cardio & strength equipment, locker rooms |
| Peak | $24.99 | All Base features + premium classes, hydromassage, tanning, guest privileges, all-location access |
| Peak Results | Premium (varies) | All Peak features + personal training credits, HRM rental, priority class booking, nutrition coaching |

### Class Categories (200+ weekly)

Cycling, Kickboxing, Yoga, HIIT, Zumba, Body Pump, Pilates, Barre, Boxing, Stretching, Functional Training, Dance, Strength Training, Core, TRX, Rowing

### Amenities (Both Locations)

Group fitness studios, free weights area, cardio floor, functional training zone, stretching area, locker rooms, showers, tanning beds (Peak+), hydromassage (Peak+), personal training area

### Hours (Both Locations)

- Monday-Friday: 5:00 AM - 11:00 PM
- Saturday-Sunday: 7:00 AM - 9:00 PM
- Staffed Hours: Mon-Fri 9am-9pm, Sat 9am-5pm, Sun 10am-5pm

### Guest Pass Rules

- Must present valid photo ID
- Must be 18+ (or accompanied by member parent/guardian)
- One guest pass per person per 6-month period
- Cannot be combined with other offers
- Full gym access during pass duration
- All classes included during pass duration

---

## Appendix B: Middleware & Auth

### Public Routes (No Auth Required)

- `/join` — Lead submission form
- `/api/lead/submit` — Lead submission endpoint
- `/api/chat` — Chat completions
- All Twilio webhooks on WS backend

### Protected Routes (Password Gate)

- `/dashboard` — GM Dashboard
- `/api/analytics` — Analytics data
- `/api/calls` — Call log
- `/api/calls/[id]` — Call detail

Auth implementation: Simple password check against `DASHBOARD_PASSWORD` env var. Store in sessionStorage on client. Middleware checks for valid session on protected routes.

---

## Appendix C: Error Handling

### Frontend Errors

| Error | User-Facing Message | Recovery |
|-------|---------------------|----------|
| Form validation fail | Field-level red text | Fix and resubmit |
| API submit fail | "Something went wrong. Please try again." | Retry button |
| Chat API fail | "Vi is having a moment. Try sending again." | Auto-retry once |
| Dashboard API fail | "Unable to load data. Refreshing..." | Auto-refresh after 5s |

### Voice Agent Errors

| Error | Behavior |
|-------|----------|
| Deepgram WebSocket disconnect | Attempt reconnect once. If fail: apologize on call, end call, send SMS |
| Twilio Media Stream error | Log error, end call gracefully |
| Function tool failure (send_sms) | Log, retry once, continue call |
| Groq classification timeout | Retry once. If fail: mark call as "pending-classification" |

### SMS Errors

| Error | Behavior |
|-------|----------|
| Twilio SMS delivery fail | Retry once after 5 minutes |
| Invalid phone number | Log error, skip SMS |
| Rate limiting | Queue and retry with backoff |
