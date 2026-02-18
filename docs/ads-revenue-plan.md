# Ads Revenue Plan

## Objective

Create a sustainable revenue stream with ad placements that do not damage trust
or core finance workflows.

## Constraints

- Preserve user trust on financial pages.
- Keep authenticated dashboards focused on productivity.
- Respect privacy and consent requirements (GDPR/CCPA).
- Maintain performance and Core Web Vitals.

## Phase 1: Monetization Foundation (Week 1)

- Implement analytics baseline:
  - Ad impressions
  - Viewability
  - CTR
  - Revenue per 1,000 sessions
- Add consent banner with ad personalization controls.
- Add ad-safe layout slots on public pages only:
  - Landing page mid-content slot
  - Blog/resources sidebar slot
  - Footer slot
- Add feature flags for each ad slot.

## Phase 2: Launch Initial Ads (Week 2)

- Start with Google AdSense Auto Ads disabled.
- Manually place responsive ad units in pre-defined slots.
- Enforce placement rules:
  - No ads in forms or critical CTAs
  - No ad overlays or popups
  - No ads inside authenticated finance workflows
- Add empty-state fallbacks to avoid layout shift.

## Phase 3: Optimize Revenue (Weeks 3-4)

- Run A/B tests for:
  - Slot position
  - Slot density
  - Ad format (display vs native)
- Monitor performance guardrails:
  - LCP under 2.5s
  - CLS under 0.1
  - No ad script blocking initial interaction
- Add RPM dashboard by page type and device class.

## Phase 4: Expand Monetization Mix (Month 2+)

- Add affiliate placements for relevant products:
  - Budgeting tools
  - Tax and bookkeeping services
  - Credit optimization tools
- Add sponsorship packages for newsletter and resource pages.
- Introduce premium ad-free subscription tier for power users.

## Placement Strategy

- Public pages: allow ads with strict spacing and max 2 units per viewport.
- Authenticated pages: default to no ads.
- Optional future experiment:
  - One lightweight sponsored module in non-critical dashboard areas.
  - Must be dismissible and frequency-capped.

## Technical Implementation Checklist

- Add reusable `AdSlot` component with:
  - Slot id
  - Breakpoint-aware sizing
  - Loading skeleton
  - Error fallback
- Add script loader with lazy load and route-level gating.
- Add server-side switch for ad-disabled users.
- Add content policy checks to prevent financial advice conflicts.

## Compliance and Trust

- Add transparent ad disclosure labels.
- Maintain updated privacy policy and cookie policy.
- Exclude sensitive user-financial data from ad targeting payloads.
- Keep clear separation between recommendations and sponsored content.

## Success Metrics

- Primary:
  - Monthly ad revenue
  - RPM
  - Fill rate
- Quality:
  - Bounce rate
  - Session duration
  - Conversion impact on signups
  - Accessibility and performance regressions
