# Onboarding Redesign — Design QA

Date: 2026-08-29

Viewport: iPhone 17e simulator, 369 × 800

Result: **Passed**

## Evidence

- Brand reference/implementation: `comparisons/01-brand-comparison.png`
- Foundation reference/implementation: `comparisons/02-foundation-comparison.png`
- Accountability reference/selected implementation: `comparisons/05-accountability-comparison.png`
- Implementation states: `01-brand-implementation.jpg` through
  `08-paywall-monthly-implementation.jpg`

## Review

- **Brand:** The black/graphite canvas, amber mark, white headline, muted support
  copy, CTA hierarchy and restrained progress language match the supplied visual
  direction. The implementation adds the task-required training-area line.
- **Foundation:** Uses the supplied coach asset with restrained amber hip/core
  emphasis. The smaller device uses a contained product card so the headline,
  three training areas and CTA remain visible without clipping.
- **Daily Rule:** The 1 / 5 / 20-second session structure is the visual hero and
  does not change movement-specific repetitions or the existing five-set logic.
- **Lock Time:** The native iOS time picker is the visual hero and updates the
  existing recurring Lock Time setting.
- **Accountability:** The initial, selected, permission-failure and revoked-access
  states remain one coherent step. Selected count, recovery action and privacy
  copy are visible; the real Family Controls picker remains the source of app
  selection.
- **Account and Paywall:** Required Account has Apple, Google and Email paths with
  loading/error states. Required Paywall has no close/back bypass, Annual is the
  recommended default with the only 3-day trial, and Monthly clearly has no trial.
- **Accessibility/resilience:** Controls use semantic React Native buttons,
  practical tap targets and accessible labels. Page motion respects Reduce
  Motion. The compact 369 × 800 layout was checked for overlap, clipping and CTA
  reachability.

## Runtime checks

- Completed Brand → Foundation → Daily Rule → Lock Time → Accountability →
  Account → Paywall in the simulator.
- Verified real selected-app state (`13 apps selected`) and Change Selection.
- Verified Monthly and Annual plan selection, restore error handling, debug-only
  entitlement routing, persisted active-entitlement launch to Home, and
  Profile/Account back navigation to Home.
- No unresolved P0, P1 or P2 visual findings remain in the reviewed states.
