# Codex — UI/UX Audit for Vi Operate Crunch Fitness

## Your Role

You are a senior product designer and frontend engineer reviewing this codebase for visual polish, UX quality, and brand consistency. Your job is to find every rough edge, inconsistency, and missed opportunity — then fix them. You are not reviewing backend logic or API correctness. You are reviewing **what the user sees and touches**.

## Brand Reference

The `/assets` folder contains screenshots and images from crunch.com and the Colorado Springs location pages. These are the gold standard. Everything in this app should feel like it belongs on that website.

**Brand tokens:**
- Primary: `#FF9247` (orange)
- Dark bg (dashboard): `#0A0A0F`
- Light bg (public): `#FFFFFF`
- Typography: Inter / system-ui, clean and modern
- Personality: Energetic, fun, judgment-free, approachable. NOT corporate, NOT clinical.
- Taglines: "No Judgments" / "No Judgments. Just results."

## Audit Checklist

Run the app locally (`npm run dev` in `/frontend`). Walk through every page and component. For each item below, evaluate, screenshot if needed, and fix any issues you find.

### 1. Lead Form (`/join`)

- [ ] Does this page feel like it belongs on crunch.com? Compare side-by-side with the assets.
- [ ] Is the hero section compelling? Does it create urgency/excitement to sign up?
- [ ] Are the benefit chips visually balanced and scannable?
- [ ] Does the form feel lightweight or heavy? Reduce visual weight if it feels like a wall of fields.
- [ ] Phone number field: does it auto-format as you type (not just on blur)?
- [ ] Select dropdowns: are they styled consistently or using ugly browser defaults?
- [ ] CTA button: is it big enough, orange enough, and does hover/active feel satisfying?
- [ ] Pricing teaser cards below the form: do they create desire? Are tiers visually differentiated?
- [ ] Is there a clear visual hierarchy? Eye should go: headline → benefit chips → form → CTA → pricing
- [ ] Loading state on submit: is there a spinner or disabled state? Does it feel responsive?
- [ ] Error states: are validation messages red, inline, and helpful (not generic)?
- [ ] Mobile responsive: does it stack cleanly on 375px width? No horizontal scroll?
- [ ] Micro-interactions: any hover effects on cards, focus rings on inputs, transitions on state changes?

### 2. Web Chat (Post-Submit on `/join`)

- [ ] Transition from form to chat: is it smooth or jarring? Should be an animated swap.
- [ ] Does the personalized greeting appear immediately and feel warm?
- [ ] "Call incoming..." badge: is it animated (pulse/glow)? Does it grab attention without being obnoxious?
- [ ] Agent bubbles vs user bubbles: clearly differentiated? Orange for user, gray for agent?
- [ ] Is the "Vi" avatar/icon present and recognizable?
- [ ] Typing indicator: is there one while waiting for Gemini response?
- [ ] Message entry: is the input sticky at the bottom? Does Enter send?
- [ ] Long messages: do they wrap correctly? No overflow or text clipping?
- [ ] Scrolling: does the chat auto-scroll to newest message?
- [ ] Empty state: what does the chat look like before the first exchange?
- [ ] Mobile: does the chat take full viewport height? Is the input accessible above the keyboard?

### 3. Dashboard Login (`/`)

- [ ] Is the password page clean and minimal? Just a centered input + button?
- [ ] Does it match the dark dashboard theme (not the white public theme)?
- [ ] Wrong password: is there a subtle shake/error state?
- [ ] Does pressing Enter submit the password?

### 4. GM Dashboard (`/dashboard`)

- [ ] First impression: does the dashboard feel like a premium analytics tool?
- [ ] Dark theme: is it consistently dark? No white flashes, no mismatched backgrounds?
- [ ] KPI cards: are the numbers large and scannable? Are labels secondary?
- [ ] Period filters (Today/Week/All): do they feel clickable? Is the active state obvious?
- [ ] Call log table:
  - Row hover state?
  - Outcome badges: are they color-coded and readable? (green for conversions, yellow for nurture, red for declined/tech-issue)
  - Is the table scrollable on overflow without breaking layout?
  - Pagination: does it exist? Is it functional?
- [ ] Call detail view:
  - Transcript: is it readable? Agent vs caller clearly differentiated?
  - Summary: is it visually separate from the transcript?
  - Outcome + sentiment: displayed prominently?
  - Back button: obvious and functional?
- [ ] Location breakdown: South vs North — visually comparable side-by-side?
- [ ] Outcome distribution chart: is it readable? Are colors meaningful (not random)?
- [ ] Conversion funnel: does it visually communicate drop-off?
- [ ] Sidebar nav: is the active section highlighted? Smooth transitions between views?
- [ ] Empty states: what happens if there are no calls for a filter? Is there a helpful message?
- [ ] Loading states: do charts/tables show skeletons or spinners while data loads?

### 5. Cross-Cutting Concerns

- [ ] **Favicon**: is it the Crunch "C" or a generic Next.js icon?
- [ ] **Page titles**: do they say "Crunch Fitness — [Page Name]" in the browser tab?
- [ ] **Fonts loading**: any FOUT (flash of unstyled text) on first load?
- [ ] **Color consistency**: is `#FF9247` used everywhere it should be? No competing oranges?
- [ ] **Spacing system**: is there a consistent spacing scale (4px/8px/16px/24px/32px)? No random values?
- [ ] **Border radius**: consistent across cards, buttons, inputs? (suggest 8px for cards, 6px for inputs, full-round for badges)
- [ ] **Shadows**: used sparingly and consistently? Not a mix of shadow styles?
- [ ] **Transitions**: all interactive elements should have `transition-all duration-150` or similar. No instant state changes.
- [ ] **Focus states**: tab through the form — are focus rings visible and styled (orange ring, not browser default blue)?
- [ ] **Scrollbars**: on dashboard, are scrollbars styled or hidden? Browser default scrollbars look terrible on dark themes.
- [ ] **Text contrast**: all text passes WCAG AA contrast (especially on dark backgrounds)?
- [ ] **Image optimization**: are any assets unoptimized PNGs that should be SVGs or WebP?

### 6. Animations & Polish

- [ ] Page transitions: any route changes should feel smooth (fade, slide, or instant — not a white flash)
- [ ] Number animations: KPI numbers should count up on load (not just appear)
- [ ] Chart animations: charts should animate in (not pop)
- [ ] Skeleton loaders: anywhere data loads async should show a skeleton, not a blank space
- [ ] Toast notifications: if there are success/error toasts, are they styled consistently?
- [ ] Scroll behavior: `scroll-behavior: smooth` on html?

### 7. Mobile Responsiveness

Test at these breakpoints: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1024px (iPad landscape), 1440px (desktop)

- [ ] `/join` form stacks to single column on mobile
- [ ] Pricing cards stack to single column on mobile
- [ ] Chat is full-screen on mobile
- [ ] Dashboard: is it mobile-accessible at all? At minimum, should not break. Ideally, sidebar collapses to hamburger.
- [ ] Tables scroll horizontally on mobile without breaking layout
- [ ] Touch targets: all buttons/links are at least 44px hit area on mobile

## How to Work

1. Start the dev server and open the app
2. Walk through each section above systematically
3. For each issue found: fix it immediately in the code
4. After all fixes, do a final pass through every page at desktop and mobile widths
5. Commit with a message describing the UI/UX improvements made

**Priority order if you have to triage:** Lead form polish → Dashboard readability → Chat UX → Mobile → Animations

## What "Done" Looks Like

Someone visits `/join` and thinks "this is a real Crunch Fitness page." A gym manager opens `/dashboard` and thinks "this is a legit analytics tool." Nothing feels like a dev prototype. Every interaction feels intentional.
