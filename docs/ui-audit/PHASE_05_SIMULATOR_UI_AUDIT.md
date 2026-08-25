# Phase 05 Simulator UI Audit

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
