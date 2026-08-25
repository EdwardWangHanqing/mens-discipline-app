# Current Project Phase

## Project

Men's Discipline App

## Current Phase

**05 — Visual System / Full UI Closure (Active)**

**Owner-approved execution milestone:** repair and complete the existing visual
system and all MVP UI, implement the shared state-driven experience, then repeat
Simulator visual QA until the app is ready for owner end-to-end use.

Phase 04 is closed and passed. The UX architecture is now the source for
visual-system work; Phase 05 must translate the locked behavior into visual
tokens, components, and screens without redesigning product behavior.

Detailed UX source of truth for Phase 05 Visual System, Phase 06 Full UI Design,
and later implementation:
`docs/product/PHASE_04_UX_DESIGN_HANDOFF.md`.

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
- exactly 20 guided repetitions per set for all seven movements;
- exactly 20 seconds of rest between sets;
- cadence/tempo defined per movement with its Coach asset;
- the repetition target is universal; cadence and total duration may remain
  movement-specific;
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

## Phase 03 Closure Record

**Status:** Closed / Passed after owner approval and fast-forward integration on
2026-08-20.

Primary Phase 03 technical feasibility is established on a real iPhone:

- Family Controls authorization and saved opaque app selection;
- manual shielding/unshielding and scheduled shielding;
- Device Activity Monitor operation while the host is inactive or force-quit;
- guided routine → shared accountability → unlock and scheduled-lock
  suppression;
- definitive denied/revoked safety recovery with schedules cancelled, shields
  removed, and selection retained;
- signed Release-configuration cold launch with Metro fully stopped;
- force-quit Incomplete and Completed paths;
- reboot Incomplete scheduled-lock path; and
- Family Controls (Distribution) shown as `Assigned` for both the host app and
  `com.temperline.mensdiscipline.deviceactivitymonitor`.

Closing primary Phase 03 records sufficient technical feasibility to move toward
owner-directed UX Architecture. It does not mean App Store release readiness is
complete.

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

## Remaining Beta / Release Gates

- actual distribution archive/profile validation;
- actual TestFlight installation and no-Metro cold launch;
- midnight/date-boundary behavior;
- timezone changes;
- DST transitions;
- supported/multiple iOS-version coverage;
- picker Cancel/interactive-dismiss;
- corrupt scheduled-selection negative path;
- production Lock Time / Grace / Skip / Replace behavior; and
- final session recovery UX.

## Do Not Start Yet

Do not invent or finalize outside the next approved phase:

- final movement names and movement-specific cadence values for all seven movements;
- final Coach design/assets;
- final audio/haptic system;
- final visual progress animation;
- full production UI implementation;
- RevenueCat/paywall, analytics, Android, social, or leaderboard work.

The first launch remains on the current Apple Developer Individual membership.
Company incorporation and Organization conversion are deferred owner decisions
and are not Phase 03 or first-launch blockers.

## Phase 03 Closure Direction

Phase 03 no longer requires Camera detection or representative rep counting. Its
closure is based on evidence that:

1. app selection and scheduled restriction work on a real iPhone;
2. selected apps can be reliably unshielded in the intended accountability flow;
3. the main app/monitor extension architecture and Distribution path are known;
4. a guided routine can complete and update accountability state;
5. routine completion triggers/suppresses the selected-app restriction;
6. major system failure states are documented and tested within the accepted
   scope.

Phase 04 UX Architecture is closed / passed. Phase 05 Visual System / Figma
Design System is next. Full production UI implementation, movement
specification, production Lock/Grace/Skip/Replace, RevenueCat, auth/backend,
analytics, and other new feature work remain future implementation work.

## Phase 04 Closure Record

The complete design-facing UX contract is maintained in
`docs/product/PHASE_04_UX_DESIGN_HANDOFF.md`. Read it before visual design,
Figma work, or UI implementation. Phase 05 may design the visual expression,
but must preserve the locked UX behavior and state semantics.

**Status:** Closed / Passed on 2026-08-22 per Owner decision.

Passed coverage includes Home, Train, Locks, the core three-tab cross-state QA,
onboarding, first full free routine, post-free signed-out behavior, Profile /
Account / Subscription utility coverage, and the final UX coverage audit.

The final primary navigation is **Home | Train | Locks**. The first complete
product experience does not require an account: the user can complete exactly
one full free daily routine (one movement, five sets, four 20-second rests) and
retain earned progress/history locally. After completion, account creation or
sign-in is required before starting the 3-Day Free Trial or any subscription.

The locked subscription reference is **USD $9.99/month** and **USD
$39.99/year**, with Annual selected by default; the 3-Month plan is removed.
The paywall is closable and includes Restore Purchases, Terms, Privacy, trial
and renewal disclosure. No active training entitlement means no active
accountability lock; closing the paywall does not create ongoing free training.

## Phase 05 Simulator UI — Owner Revision 02 (2026-08-24)

The approved Simulator UI branch now includes the Owner-requested first-ever
Home and Locks revision:

- new-user Home starts at 0 momentum, 0/7 weekly consistency and 0 lifetime;
- calendar uses the device-local month/date, true circular day markers and
  previous/next month navigation;
- completion changes the deadline row to `MOVEMENT COMPLETE` and records the
  current local date once;
- the Home deadline uses the exact onboarding Lock Time;
- onboarding uses the native iOS time wheel rather than preset times;
- Home/onboarding/tab changes use short native-feeling transitions;
- concealed movement media uses the Owner-provided black flower asset; and
- Locks, Grace and Skip follow the supplied visual references, including
  Apple-native privacy-safe selected activity labels and icons.

Visual comparison evidence and the pass record are in `design-qa.md` and
`docs/ui-audit/round-02/`.
