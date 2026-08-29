# VAEL Project Memory Update — 2026-08-28

**Status:** Authoritative Owner Override Addendum

This addendum supersedes Project Memory v1.7 and every earlier onboarding,
first-free, optional-account, closable-paywall, and Monthly-trial example where
they conflict with the decisions below.

## First-run flow

**Brand / Onboarding → Required Account Creation or Sign In → Required Paywall
→ Active Entitlement → Home → Reveal Today's Movement → Training**

- The first free routine is removed.
- Signed-out users cannot enter Home or Training.
- Signed-in users without entitlement route to the required Paywall.
- The Paywall cannot be closed, swiped back, or bypassed through stale route
  restoration.
- Existing users may use Brand → Sign In and do not repeat onboarding.

## Subscription

- Monthly: **USD $9.99/month**, no free trial, charged through the normal App
  Store purchase flow.
- Annual: **USD $39.99/year**, default / Best Value, Annual-only **3-Day Free
  Trial**, then $39.99/year.
- The 3-Month plan remains removed.

## State separation

Auth state (`signedOut`, `signedIn`) is independent from entitlement state
(`none`, `monthlyActive`, `annualTrial`, `annualActive`, `expired`). Signing in
does not imply paid access.

No valid training access means no active accountability schedule or shield.
Family Controls authorization and opaque device selection remain device-local
and are not implied by account restore.

## Current integration boundary

Real Apple/Google/email authentication and StoreKit/RevenueCat purchasing are
not yet connected. The application must expose honest production-shaped UI and
adapter boundaries, loading/error states, and a deterministic Debug-only
developer control surface. Debug overrides must never create real purchases,
change real entitlement, or appear in Release builds.
