# Current Project Phase

## Project

Men's Discipline App

## Current Phase

**03 — Technical Feasibility**

## Completed Sub-phases

- 03.1 — Project Bootstrap
- 03.2 — Apple / iOS Prerequisites
- 03.3 — Official App Baseline / Expo Project Bootstrap
- 03.6 — Family Controls authorization stabilization
- 03.7 — Family Activity selection and manual shielding proof
- 03.8 — Device Activity scheduled-lock proof
- 03.9 — Camera / Vision / Kneeling Drive feasibility spike
- 03.10 — Guided Routine → Accountability Unlock Integration
- 03.11 — Family Controls Reliability & Release Baseline

## Phase 03.9 Final Result

**Status:** Closed

The real-device Kneeling Drive spike demonstrated technical pose/counting
capability, but mandatory MVP UX feasibility was rejected. Movement-critical
joints leave frame during normal movement, partial-body framing is brittle,
landscape side view performs materially better than portrait, front/near-front
is unreliable, and calibration/framing adds too much daily friction.

Accepted conclusion:

**Technical capability demonstrated; mandatory MVP UX feasibility rejected due
to framing/tracking friction.**

Camera / Apple Vision is no longer an MVP feature, release gate, reviewer path,
or completion path. No active Camera/Vision runtime module or diagnostic is
present in the current MVP source. The full prototype remains in Git checkpoint
`463e4f2` and its findings remain in
`docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`.

## Accepted MVP Training Direction

The MVP uses guided cadence training:

Movement demonstration

→ countdown

→ guided repetitions

→ set completion

→ 20-second rest

→ next set

→ routine completion

→ accountability satisfied / unlock.

Locked structure:

- exactly one movement per day;
- exactly five sets;
- typically 15–20 repetitions per set, with exact targets defined per movement;
- exactly 20 seconds of rest between sets;
- cadence/tempo defined per movement with its Coach asset;
- no universal repetition target, cadence, or total session duration;
- no camera proof, manual-tap counting, hardware-button counting, or substitute
  proof workaround.

The app guides the session; MVP does not attempt to cryptographically or visually
prove every repetition.

## Phase 03.10 Final Result

**Status:** Passed

The first real MVP technical loop now works on a physical iPhone:

guided routine → valid final state → today's shared App Group accountability
state → active shield removal / later scheduled-lock suppression.

- The data-driven TypeScript state machine runs demonstration, countdown, five
  guided sets and exactly four 20-second inter-set rests.
- The fifth set transitions directly to accountability completion with no fifth
  rest or premature completion path.
- One representative 5-rep/1-second-cadence specification proves the interface;
  these values are explicitly non-production and do not decide final content.
- The native `completeRoutineToday()` boundary performs an idempotent,
  local-calendar-date-scoped App Group write and clears every known named shield
  store.
- The existing Device Activity Monitor continues to read the same shared state
  and returns `skippedCompletedToday` for a later same-day schedule.
- Leaving the foreground interrupts an unfinished routine and grants no
  completion. This conservative recovery is a technical baseline, not final UX.

Real-device acceptance passed on Clover (iOS 26.6) on 2026-08-20:

1. Incomplete + shielded → full routine → Completed → shield removed → selected
   app accessible.
2. Reset/incomplete → full routine → schedule fired →
   `intervalDidStart / skippedCompletedToday` → shield remained removed →
   selected app accessible.

See `docs/technical/GUIDED_ROUTINE_ACCOUNTABILITY_INTEGRATION.md`.

## Phase 03.11 Final Result

**Status:** Passed

On Clover (iPhone 13, iOS 26.6), the owner verified a signed Release build with
Metro fully stopped, authorization revoke/deny/re-approval recovery, both
Incomplete and Completed scheduled callbacks while the main app was force-quit,
and an Incomplete scheduled callback after device reboot. Selection and shared
accountability persisted correctly in every applicable path.

The monitor extension App ID
`com.temperline.mensdiscipline.deviceactivitymonitor` now shows Family Controls
(Distribution) as `Assigned` in the Apple Developer portal. An actual
distribution archive/profile and TestFlight build remain unverified.

See
`docs/technical/FAMILY_CONTROLS_RELIABILITY_RELEASE_BASELINE.md`.

## Family Controls Accepted Baseline

- Bundle ID: `com.temperline.mensdiscipline`.
- Expo CNG remains the working native-project strategy.
- Real-device `.individual` authorization is approved; five cold starts resolved
  automatically from `checking` to `approved` without another prompt.
- `FamilyActivityPicker` selection/editing, opaque local persistence, empty state,
  and manual Apply/Remove Shield passed on the physical iPhone.
- The Device Activity Monitor extension is
  `com.temperline.mensdiscipline.deviceactivitymonitor` and shares App Group
  `group.com.temperline.mensdiscipline` with the host.
- Incomplete one-off scheduling produced `intervalDidStart / appliedShield` with
  the host inactive; Completed produced `skippedCompletedToday`; Reset/Cancel
  restored access and left no diagnostic shield active.
- Family Controls (Distribution) is Assigned in the Apple Developer portal for
  both the main app and the monitor extension. Distribution archive/profile and
  TestFlight validation are still required.
- No token contents are logged, reverse-engineered, or exposed to JavaScript.

## Remaining Phase 03 / Release Risks

- Validate an actual distribution archive and TestFlight build; the passed
  no-Metro test used a Release configuration with development provisioning.
- Later reliability testing still includes midnight, timezone/DST, and supported
  iOS versions beyond Clover on iOS 26.6.
- Picker Cancel/interactive-dismiss and corrupt scheduled-selection negative
  paths remain unverified.
- Final production Lock Time, Grace Extension, Skip Today, and Replace Movement UX
  remain unbuilt.

## Do Not Start Yet

Do not invent or finalize in this checkpoint:

- exact repetition/cadence values for all seven movements;
- final Coach design/assets;
- final audio/haptic system;
- final visual progress animation;
- full production UI or Figma implementation;
- RevenueCat/paywall, analytics, Android, social, or leaderboard work.

The first launch remains on the current Apple Developer Individual membership.
Company incorporation and Organization conversion are deferred owner decisions
and are not Phase 03 or first-launch blockers.

## Phase 03 Exit Direction

Phase 03 no longer requires Camera detection or representative rep counting. It
requires enough evidence that:

1. app selection and scheduled restriction work on a real iPhone;
2. selected apps can be reliably unshielded in the intended accountability flow;
3. the main app/monitor extension architecture and Distribution path are known;
4. a guided routine can complete and update accountability state;
5. routine completion triggers/suppresses the selected-app restriction;
6. major system failure states are documented rather than postponed for polish.
