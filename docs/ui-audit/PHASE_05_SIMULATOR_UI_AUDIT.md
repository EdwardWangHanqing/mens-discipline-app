# Phase 05 Simulator UI Audit

> **Latest checkpoint — 2026-08-25:** the VAEL owner revision described at the
> end of this document supersedes the historical universal-20-rep and
> seven-movement content statements below. Earlier sections remain as audit
> history for the prior checkpoint.

**Date:** 2026-08-24  
**Branch:** `feature/simulator-ready-ui`  
**Device:** iPhone 17 Pro Simulator, iOS 26.5  
**Visual direction:** Precision Graphite

## Outcome

The diagnostic shell was replaced by an owner-testable MVP UI experience. The
implemented path covers onboarding, daily movement Reveal, Home, Train, Locks,
the complete five-set guided session, completion, account, paywall, profile,
history, milestones, settings, notifications, lock preferences, app selection,
lock schedule, Grace, and Skip states.

The Figma source and code now use the same locked quantity everywhere:

- one daily movement;
- five sets;
- twenty guided reps per set;
- four 20-second rests;
- 100 guided reps per completed routine.

## Visual corrections completed

- Replaced inconsistent spacing, card geometry, borders, radii, typography, and
  accent colors with the Precision Graphite token system.
- Removed obsolete 18-rep production copy and hid every sixth-set segment in
  the existing Figma Screens page.
- Added a stable Coach media container so static art can later be replaced by
  movement animation without redesigning the surrounding UI.
- Standardized functional icons on the iOS SF Symbols outline family. The
  supplied high-gloss raster lock icons were reviewed but intentionally not
  mixed into the restrained system.
- Corrected bottom-navigation semantics and added accessible labels/states to
  core navigation, menu rows, paywall plans, lock controls, confirmation
  surfaces, and account actions.
- Corrected the Rest timer geometry that was too close to the right edge on the
  first Simulator pass.

## Interaction verification

- Reveal exposes the already-selected daily movement and does not reroll it.
- Home and Train read from one movement data source.
- The session runs Countdown → Set 1 → Rest → Set 2 → Rest → Set 3 → Rest →
  Set 4 → Rest → Set 5 → Completion.
- Set 5 has no trailing rest.
- Completion calls the existing Family Controls completion boundary.
- Family Controls authorization and app selection remain connected; Simulator
  fallback behavior prevents dead ends where the system API is unavailable.
- Account, paywall, Profile/Settings, Home/Train/Locks, Grace, and Skip controls
  are navigable in Simulator.

## Evidence

Key screenshots are stored in `docs/ui-audit/evidence/`, including the previous
diagnostic shell, Figma references, onboarding, Home, Train, Locks, completion,
account, and paywall states.

## Deferred asset replacement

The UI closure is not blocked by final content production. Movement 02–07 retain
data slots until the final names, Coach animation files, movement-specific
cadence, and SUNO voice/music assets are supplied. These are content/media swaps,
not new screen implementations.

## Owner Revision 04 — VAEL Movement / Motion / Brand Completion

The customer-facing brand is now VAEL. The Expo/native build contains the
1024×1024 opaque VAEL App Icon, `CFBundleDisplayName` and `CFBundleName` both
resolve to `VAEL`, and the existing bundle/App Group/Family Controls identifiers
remain unchanged. The native warm-graphite splash and cold-launch-only VAEL mark
draw/glow/settle transition were verified as one continuous handoff.

The movement source now contains all ten owner-specified movements with their
movement-specific 12/15/16/20 rep targets and 1.5/2.0/2.5-second cadence. A
persisted random cycle samples seven unique movements from the full pool,
preserves today's reveal across restarts, creates a new random sample after day
seven, and prevents Replace Movement from duplicating the active cycle.

Train and Rest were exercised on iPhone 17 Pro and iPhone 17e Simulators running
iOS 26.5. Guided Reps and the current Set segment use one UI-thread linear motion
timeline; the 20-second Rest ring decreases continuously while its number remains
synchronized. The Rest readout and supplied wind/cloud treatment remain fully
inside the right safe boundary on both sizes. Compact-height Train preview was
corrected so Begin/Resume and Replace Movement are fully visible above the bottom
navigation without altering the established composition.

Motion evidence:

- `docs/ui-audit/vael-cold-launch.mp4`;
- `docs/ui-audit/vael-guided-progress.mp4`;
- `docs/ui-audit/vael-rest-progress.mp4`.

Verification: Expo lint, TypeScript, 15 pure logic/state-machine tests, fresh
CocoaPods/native generation, and Debug build/install/launch succeeded. Xcode
reported only dependency warnings. Apple/Google/Email authentication UI includes
validation, keyboard handling, loading/error states, sign-up/sign-in switching,
and password reset boundaries; real provider/backend credentials remain
explicitly unconfigured and the preview does not claim live authentication.
