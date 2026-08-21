# Guided Routine → Accountability Integration

**Phase:** 03.10

**Status:** Real-device acceptance passed on 2026-08-20

## Scope

Phase 03.10 proves one narrow MVP loop. It does not define final movement
content, Coach assets, sound/haptics, production session persistence, or final
recovery UX.

The representative movement uses 5 reps per set at a 1-second cadence only to
exercise a data-driven interface. Those values are not product decisions.

## Training engine

`src/training/guidedRoutineEngine.ts` is a pure deterministic state machine:

demonstration → countdown → guided set → 20-second rest → next set →
awaiting accountability → completed.

The engine enforces five sets, four rests and no rest after set five. Movement
specifications provide reps, cadence, demonstration duration and countdown
duration. Completion acknowledgement is ignored unless the engine has reached
`awaitingAccountability` from the valid final set.

The UI advances the engine only in short foreground time slices. It does not
catch up long timer gaps. When the app leaves the foreground, an unfinished
routine resets to idle with an interruption reason and does not emit completion.
This conservative behavior is intentionally temporary; product recovery UX is
deferred.

## Accountability boundary

The TypeScript bridge calls the native `completeRoutineToday()` operation once
per completion attempt. The native operation:

1. calculates a date key using the device's current calendar;
2. writes the key to the existing shared App Group state;
3. avoids rewriting an already-completed same-day value;
4. clears the manual, daily and diagnostic named `ManagedSettingsStore` shields;
5. returns the shared accountability and observed shield state.

The Device Activity Monitor extension was not replaced. Its existing
`intervalDidStart` callback reads the same App Group date key and removes/skips
the scheduled shield when `completedToday` is true.

No token contents cross the React Native bridge. No capability, permission,
entitlement, SDK, bundle identifier or collected-data category changed.

## Verification evidence

Automated and build verification:

- six deterministic Node tests for sequencing, movement-specific configuration,
  five sets, four 20-second rests, no fifth rest, no premature completion,
  interruption and duplicate-safe final acknowledgement;
- strict TypeScript check;
- Expo lint;
- Expo config/autolinking inspection;
- clean CNG generation;
- complete unsigned iOS Simulator workspace build;
- signed physical-device build and installation on Clover (iOS 26.6).

Real-device path A passed: starting incomplete with a selected app shielded, the
owner completed the full guided routine, observed today's accountability become
Completed, observed the shield removed and opened the selected app.

Real-device path B passed: after Reset, the owner completed the full routine
before scheduling the one-off test. When it fired, the callback showed
`intervalDidStart / skippedCompletedToday`; accountability stayed Completed, the
shield stayed removed and the selected app remained accessible.

## Deferred risks

- final movement list, reps and cadence;
- final interruption/resume UX and production session persistence;
- midnight, timezone/DST and multi-version reliability;
- distribution archive/profile inspection and actual TestFlight operation;
- production Lock Time, Replace, Grace, Skip and progress behavior.

Phase 03.11 subsequently passed denied/revoked recovery, Release configuration
operation without Metro, force-quit Incomplete/Completed paths, and reboot on
Clover. The monitor extension Distribution capability is also Assigned. See
`docs/technical/FAMILY_CONTROLS_RELIABILITY_RELEASE_BASELINE.md`; those results
do not constitute an actual TestFlight validation.
