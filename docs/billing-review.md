# Billing Logic Review

Summary of billing flows, edge cases, and fixes applied after review.

## Flows

### New subscription (no existing plan)

1. User chooses Basic or Pro on `/plans` or `/billing`.
2. `POST /api/billing/checkout` with `{ plan: 'BASIC' | 'PRO' }`.
3. If no Stripe customer exists, one is created and stored on the first subscription after checkout.
4. Stripe Checkout Session is created with 7-day trial, `metadata: { userId, plan }`.
5. User completes checkout; Stripe sends `checkout.session.completed`.
6. Webhook retrieves the subscription, upserts `AppSubscription` (by `stripeSubscriptionId`).
7. Entitlements: `getEffectivePlanFromSubscriptions` returns the single active subscription; `currentPlan` and `hasProAccess` drive UI and feature access.

### Upgrade (e.g. Basic → Pro)

1. User already has an active/trialing Basic subscription. Clicks Pro.
2. Checkout allows it (`effectiveSubscription?.plan !== plan`).
3. New Stripe subscription is created (Pro, 7-day trial). User may have two Stripe subscriptions briefly.
4. On `checkout.session.completed`, webhook:
   - Upserts the new Pro subscription.
   - Finds any other **active/trialing** `AppSubscription` for the same `userId` (different `stripeSubscriptionId`).
   - Calls `stripe.subscriptions.cancel(other.stripeSubscriptionId)` for each so the user is not double-billed.
5. Stripe sends `customer.subscription.updated` (or `deleted`) for the old subscription; webhook upserts it with status `CANCELED`.
6. Effective plan is now Pro (single active subscription).

### Downgrade (e.g. Pro → Basic)

- Same as upgrade: new checkout for Basic, webhook upserts new subscription and cancels the previous one. User ends up on Basic. They receive a new 7-day trial for Basic (policy choice; can be changed later to skip trial when switching plans).

### Cancel / manage (Stripe Customer Portal)

1. User clicks “Manage subscription” → `POST /api/billing/portal`.
2. Backend finds an `AppSubscription` for the user with `stripeCustomerId` (any row; same customer for same user).
3. Stripe Billing Portal session is created; user is redirected to Stripe to cancel, update payment, or change plan.
4. Stripe sends `customer.subscription.updated` / `deleted`; webhook upserts so `status` and `cancelAtPeriodEnd` stay in sync. Access is based on `getEffectivePlanFromSubscriptions` (only ACTIVE/TRIALING).

### Superuser

- `getUserEntitlements` treats superuser (DB flag or env `ADMIN_EMAIL` / `SUPERUSER_EMAILS`) as `currentPlan: PRO` and `hasProAccess: true` without using Stripe. Checkout blocks superusers with a 400.

## Status handling

- **ACTIVE / TRIALING:** Count as “active”; user has access to the plan.
- **PAST_DUE:** Stored and shown; **not** treated as active for entitlements. User must fix payment (e.g. via portal) to regain access.
- **CANCELED / UNPAID / INCOMPLETE / incomplete_expired:** No access. Webhook maps `incomplete_expired` to `INCOMPLETE`.

## Edge cases covered

| Case                                           | Handling                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same plan selected again                       | Checkout returns 400: “You are already on the … plan.”                                                                                               |
| Superuser tries checkout                       | Checkout returns 400: “Superuser accounts already include full Pro access.”                                                                          |
| Multiple subscriptions after upgrade/downgrade | On `checkout.session.completed`, other active/trialing subscriptions for that user are canceled in Stripe; webhook keeps DB in sync.                 |
| Portal with no Stripe customer                 | User never completed checkout → no `stripeCustomerId` → 400 “No Stripe customer found for this account.”                                             |
| Webhook: missing `userId` in metadata          | `upsertFromStripeSubscription` returns early; no DB write.                                                                                           |
| Webhook: unknown price id                      | `resolvePlanFromPrice` returns null → no DB write.                                                                                                   |
| Subscription deleted in Stripe                 | `customer.subscription.deleted` (or updated with canceled status) → upsert with status `CANCELED`; effective plan becomes null or next subscription. |

## Configuration

- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_BASIC_MONTHLY`, `STRIPE_PRICE_PRO_MONTHLY`.
- **Billing logic:** `src/lib/billing.ts` (plan definitions, `getEffectivePlanFromSubscriptions`, `isActiveSubscriptionStatus`), `src/lib/user-entitlements.ts` (superuser, `currentPlan`, `hasProAccess`).
- **APIs:** `src/app/api/billing/checkout/route.ts`, `src/app/api/billing/portal/route.ts`, `src/app/api/billing/subscription/route.ts`, `src/app/api/stripe/webhook/route.ts`.

## Optional follow-ups

- **Trial on plan change:** Implemented. Checkout gives a 7-day trial only when `subscriptions.length === 0` (first-time subscriber). Plan changes and resubscribing after cancel get no trial.
- **Proration / schedule change:** Use Stripe’s “update subscription” or portal for downgrades so the change can be scheduled at period end and proration is consistent (optional; current “new subscription + cancel old” is valid).
- **Audit log:** Log subscription and checkout events (e.g. plan, userId, timestamp) for support and compliance.
