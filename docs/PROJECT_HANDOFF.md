# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-26 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Desktop/mens-discipline-app`

**Active branch:** `feature/simulator-ready-ui`

**Phase 03.10 integration checkpoint:** `main` at `c398be46ecae5dd9e97c89f2922cb1cb3a73f898`

**Accepted main checkpoint:** `main` at `9a0d9ffcd6887bb64525a0b8933f7edf3efd0c58`

**Phase 03.11 merged checkpoint:** `main` at `5b8cca697b601aff9a7d31759f6ec0309f2d7756`

**Phase 03 closure documentation checkpoint:** `main` at `273e1a52dbaed0cf1f68b9b8b46297dc5eb8a063`

**Primary Phase 03 status:** Closed / Passed

**Phase 04 status:** Closed / Passed

**Current phase:** Phase 05 — Visual System / Full UI Closure (Active)

**Owner-approved outcome:** continue from repair of the existing UI through
missing-state design, implementation, Simulator screenshot QA, correction,
re-test, commit/push, and owner-ready end-to-end handoff.

## Purpose and Authority

This is the continuity summary for the next task. It does not replace the
authoritative product, decision, technical, or release documents.

When documents conflict, follow:

1. `AGENTS.md`;
2. latest accepted decision in `docs/DECISIONS.md`;
3. `docs/product/MVP_SCOPE.md`;
4. `docs/product/MASTER_PRODUCT_PLAN.md`;
5. latest Owner decisions in the current project memory update.

For UX, visual-design, Figma, or UI-implementation work, also read the detailed
Phase 04 contract:
`docs/product/PHASE_04_UX_DESIGN_HANDOFF.md`.

Always start with `git status --short --branch` and preserve existing work. Phase
03.11 has owner approval and is now fast-forward integrated into `main`.

## Latest Accepted Product Pivot

DEC-021 is authoritative.

Phase 03.9 demonstrated technical Camera/Apple Vision pose-counting capability
for Kneeling Drive, but rejected it as a mandatory MVP experience because:

- movement-critical joints leave frame during normal movement;
- partial-body framing is too brittle;
- landscape side view materially outperforms portrait;
- front/near-front is unreliable;
- calibration/framing adds too much daily friction.

Final conclusion:

**Technical capability demonstrated; mandatory MVP UX feasibility rejected due
to framing/tracking friction.**

Camera/Vision is no longer an MVP user feature, mandatory completion path,
release gate, or reviewer flow. Do not replace it with manual taps,
hardware-volume-button counting, or another workaround. The app guides the
session and does not claim to prove every repetition.

## Locked Guided Training Structure

The MVP path is:

Movement demonstration → countdown → guided repetitions → set completion →
20-second rest → next set → routine completion → accountability satisfied/unlock.

- exactly one movement per day;
- exactly five sets;
- movement-specific guided reps and cadence from DEC-025;
- exactly 20 seconds rest between sets;
- movement-specific cadence/tempo defined with each movement and Coach asset;
- ten movements in the library and seven unique movements in each persisted
  random cycle.

Movement targets, cadence, and progress behavior are now defined by DEC-025 and
the 2026-08-25 owner implementation package. Coach media and audio/haptics remain
replaceable future assets.

## Phase 03.9 Source and Closure

The full live-camera prototype is retained in Git checkpoint:

- `463e4f2` — `spike: prototype Kneeling Drive Vision counting`.

It contains the AVFoundation preview, Apple Vision 2D/optional 3D pose bridge,
adaptive pure-TypeScript Kneeling Drive counter, six deterministic tests,
permission recovery UI, and diagnostic recorder. Native/full builds, signed
physical-device installation, and live use were completed.

The branch tip removes all active Camera/Vision runtime code, including the
live-camera route, purpose string, capture view, movement counter, and offline
adapter module. Both the offline foundation (`8a6f737`) and full prototype
(`463e4f2`) remain recoverable in Git history as post-MVP R&D references. See
`docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`.

Final cleanup removes the remaining autolinked `modules/vision-pose` runtime.
Fresh Expo config/autolinking shows no Camera/Vision module or permission, while
the Family Controls module, Device Activity Monitor target, and shared App Group
remain present; a clean CNG iOS Simulator build passes.

## Family Controls Accepted Baseline

- Real-device Family Controls authorization is approved and the cold-launch
  stabilization path passed five consecutive launches.
- FamilyActivityPicker selection/editing, opaque persistence, empty state, and
  manual shielding/removal passed on the physical iPhone.
- The Device Activity Monitor extension uses Bundle ID
  `com.temperline.mensdiscipline.deviceactivitymonitor` and App Group
  `group.com.temperline.mensdiscipline`.
- A one-off scheduled callback applied a saved-category shield with the host
  inactive when incomplete, and skipped shielding when completed.
- Schedule replacement and Reset/Cancel recovery left no diagnostic shield.
- Family Controls (Distribution) is `Assigned` in the Apple Developer portal for
  both the main app and monitor extension.
- Phase 03.11 passed revoke/denied/re-approval recovery while preserving the
  opaque saved selection and removing schedules/shields in the denied state.
- A signed Release configuration build cold-launched directly on Clover while
  Metro was fully stopped. It used development provisioning, so this is not an
  actual TestFlight result.
- Force-quit Incomplete applied the scheduled shield, force-quit Completed
  skipped it, and force-quit plus reboot Incomplete applied it. Selection,
  accountability and callback evidence persisted.
- Midnight, timezone/DST, multi-iOS, distribution archive/profile and actual
  TestFlight reliability remain open as Beta / Release gates.

No Family Controls capability, entitlement, App Group, Bundle ID, selected-app
privacy boundary, or existing reliability conclusion changed in Phase 03.10.

## Phase 04 Closure and Next Safe Task

The permanent design/implementation UX source of truth is
`docs/product/PHASE_04_UX_DESIGN_HANDOFF.md`. It consolidates the accepted
Phase 04 behavior for Phase 05 Visual System, Phase 06 Full UI Design, and
later implementation. Read it before visual work; visual expression may change,
but UX behavior is locked.

Phase 04 UX Architecture is **closed / passed** as of 2026-08-22. The final
structure is **Home | Train | Locks**: Home is Today/Momentum/progress, Train
is training preparation and the guided session, and Locks is accountability
configuration/current lock state/Grace/Skip. Profile / Settings is reached from
Home's upper-right entry.

The first complete product experience requires no account. Onboarding includes
exactly one full free daily routine: one movement, five sets,
movement-specific reps/cadence, and four 20-second rests. Earned
progress/history remains visible after completion, including in the signed-out
limited Home state. New training
requires an active entitlement. Account creation/sign-in is required before
starting Trial/Subscription, using Apple, Google, or Email.

The locked monetization reference is Monthly USD $9.99 and Annual USD $39.99
(Annual default/recommended); 3-Month is removed. The 3-Day Free Trial remains.
The paywall may be closed, must expose Restore Purchases / Terms / Privacy and
clear trial/renewal disclosure, and does not grant ongoing free training when
closed. Restore Purchases re-checks a valid existing App Store entitlement; it
does not restart an expired subscription or undo cancellation. An entitlement
that is still paid-through remains active after auto-renew cancellation.

The accountability safety rule is: **No active training entitlement → No active
accountability lock.** Account deletion, subscription utility behavior, and
restore semantics remain release requirements.

Primary Phase 03 Technical Feasibility is **closed / passed**. Phase 03.10 is
merged into `main` at `c398be46ecae5dd9e97c89f2922cb1cb3a73f898`; Phase 03.11 is
merged at `5b8cca697b601aff9a7d31759f6ec0309f2d7756`.

Phase 03.10 introduced the smallest data-driven guided routine engine and proved
the full accountability boundary:

1. demonstration → countdown → five guided sets;
2. exactly four 20-second rests and no rest after set five;
3. valid final state → `completeRoutineToday()`;
4. idempotent current-date App Group completion write;
5. removal of manual, daily and diagnostic named shield stores;
6. same-day Device Activity suppression through the existing
   `completedToday` read.

The representative 5 reps / 1-second cadence is architecture-test data only.
Final movement specifications, Coach, audio/haptics and production visual design
remain deferred.

Real-device acceptance passed on Clover (iOS 26.6) on 2026-08-20:

- Locked → full routine → shared Completed → shield removed → selected app
  accessible.
- Reset/incomplete → full routine before one-off schedule → monitor callback
  `intervalDidStart / skippedCompletedToday` → shield remained removed → selected
  app accessible.

Unfinished sessions are reset when the app leaves the foreground and never grant
completion. This is a conservative recovery baseline, not a final UX decision.
Technical details are in
`docs/technical/GUIDED_ROUTINE_ACCOUNTABILITY_INTEGRATION.md`.

Phase 03.11 added denied-only native safety reconciliation and has
owner-confirmed physical-device acceptance for Release/no-Metro,
revoke/deny/recovery, force-quit Incomplete, force-quit Completed and reboot. Its
evidence is recorded in
`docs/technical/FAMILY_CONTROLS_RELIABILITY_RELEASE_BASELINE.md`.

The next project phase is ready for Phase 05 Visual System / Figma Design System
work. This documentation sync does not implement the visual system or product
code.

## Release / Privacy State

- Camera permission and production Vision behavior are not MVP release
  requirements.
- The current MVP source does not declare `NSCameraUsageDescription`.
- Seven-movement Camera testing and Camera reviewer instructions have been
  removed from release gates.
- Historical spike privacy evidence is retained: raw frames were not recorded,
  persisted, uploaded, or bridged to JavaScript.
- Family Controls authorization safety changed only for a definitive denied
  state: known schedules and shields are cleared while the opaque selection is
  retained. No new data, permission, SDK, capability or App Review behavior was
  introduced.
- Monitor extension Family Controls (Distribution) is Assigned, but the actual
  distribution archive/profile and TestFlight path remain release gates.
- The first launch remains on the current Individual membership. Incorporation
  and Organization conversion are deferred and are not launch or Phase 03
  blockers.

Primary Phase 03 closure does not mean App Store release readiness is complete.
The remaining Beta / Release gates are:

- actual distribution archive/profile validation;
- actual TestFlight installation and no-Metro cold launch;
- midnight/date-boundary, timezone and DST behavior;
- supported/multiple iOS-version coverage;
- picker Cancel/interactive-dismiss and corrupt scheduled-selection negative
  paths;
- production Lock Time / Grace / Skip / Replace behavior; and
- final session recovery UX.

## Safe Comparison and Rollback Points

- Phase 03.9 accepted main baseline: `3d58052cb504de37fb7b4be87206aa2118b66530`.
- Phase 03.10 merged main checkpoint:
  `c398be46ecae5dd9e97c89f2922cb1cb3a73f898`.
- Phase 03.11 branch base:
  `c398be46ecae5dd9e97c89f2922cb1cb3a73f898`.
- Phase 03.11 branch remains intact at
  `5b8cca697b601aff9a7d31759f6ec0309f2d7756`.
- Phase 03.8 branch base: `3333f79`.
- Live Vision prototype checkpoint: `463e4f2`.
- To undo an accepted checkpoint after review, create a normal revert commit; do
  not reset, clean, rewrite history, or force-push.

## New-Task Startup Instruction

> Open `/Users/hanqingwang/Developer/mens-discipline-app` on `main`. Run
> `git status --short --branch`, then read
> `AGENTS.md`, `docs/PROJECT_HANDOFF.md`, `docs/CURRENT_PHASE.md`,
> `docs/product/MVP_SCOPE.md`, `docs/DECISIONS.md`, and the release documents.
> Follow DEC-021 and DEC-022. Primary Phase 03 Technical Feasibility is closed /
> passed; preserve the guided routine → shared accountability → unlock boundary
> and denied-state safety behavior. Do not treat company incorporation/
> Organization conversion as a first-launch blocker. Phase 04 UX Architecture
> is closed / passed. The next phase is Phase 05 Visual System / Figma Design
> System; do not restore superseded UX behavior during visual work.

## Latest Simulator UI Checkpoint — 2026-08-24

Owner Revision 02 is implemented on `feature/simulator-ready-ui`. The handed-off
Simulator install launches at the first onboarding screen with local user
progress reset to zero. After onboarding, Home opens in the First-Ever /
Unrevealed state; subsequent progress and setup persist locally across launches.

The checkpoint includes dynamic device-local calendar behavior, exact Lock Time
display, a native iOS wheel picker, zero-based progress accumulation, smoother
screen changes, the Owner black-flower concealed asset, and the redesigned
Locks / Grace / Skip experience. Selected Screen Time activities are rendered
inside a native SwiftUI view using Apple's opaque tokens, so names and icons can
appear without exposing private token contents to React Native.

Verification completed with TypeScript, Expo lint, guided-routine tests, a full
iOS Simulator build/run, runtime UI inspection, and source-vs-implementation
visual comparison. See `design-qa.md`.

### Owner Revision 03

The branch now closes the audited state inconsistencies around new-user
progress, Grace expiry/counting, destructive Skip confirmation, completed and
skipped Home/Train outcomes, bounded native selected-activity rows, editable
Lock Time, daily rollover, and interaction motion. Routine completion now writes
the native shared completion boundary as soon as set five reaches its valid
final state; the later Continue action only advances the account flow.

Grace uses the existing native shield bridge without adding a dependency,
permission, capability, or new data collection. Supplied bitmap assets are
local app resources; Coach media remains explicitly replaceable. Round 03
evidence is in `docs/ui-audit/round-03/`.

## VAEL Owner Revision Checkpoint — 2026-08-25

DEC-025 is implemented on `feature/simulator-ready-ui`: customer-facing VAEL
branding and native icon/splash configuration, the specified cold-launch mark
transition, all ten movement definitions, persisted seven-unique-movement
cycles, movement-specific reps/cadence, continuous Set/Guided Reps/Rest motion,
the supplied Train and Rest icon treatments, onboarding visual completion, and
the complete authentication UI/integration boundary.

Simulator QA passed on iPhone 17 Pro and iPhone 17e with iOS 26.5, including a
mid-set and mid-Rest inspection. Compact-height Train preview now keeps its
actions above the bottom navigation, and the Rest ring remains inside the safe
right boundary. Automated verification includes Expo lint, TypeScript, and 15
passing logic/state-machine tests. Real Apple/Google/email provider credentials
and backend remain an honest release boundary rather than a simulated success.

## Development Design QA Preview — 2026-08-25

The existing React Native implementation now has a development-only Web Design
QA route at `/design-qa`. It reuses the production screens, design tokens,
movement definitions and session presentation while injecting deterministic
preview state through an optional `MainExperience` boundary. It does not add a
parallel HTML prototype or change the production route.

The preview includes direct Home, Train, Locks, all Onboarding steps, Profile,
Settings, History, Milestones, Notifications, lock configuration, Paywall and
account entries. Controls cover phase, set, reps, Rest time, frozen/live motion,
completion, unlock, Grace, Skip and reset states. Family Controls and Device
Activity actions remain native on iOS; their Web equivalents only mutate local
preview state and are labeled as mocks.

Run `npm run qa:web` and open `http://localhost:8081/design-qa`. Detailed usage
and architecture boundaries are recorded in
`docs/ui-audit/DESIGN_QA_PREVIEW.md`.

## Kneeling Drive Coach Media and Rest Transition — 2026-08-25

The owner-supplied Kneeling Drive 2.0 still is resampled without crop to an
app-ready 4:5 asset and is assigned only to `kneeling-drive`. It is used by the
revealed Home card and Train overview, and remains as the first-frame fallback
through the preparation countdown.

The supplied Coach MP4 is stored in the application as a video-only derivative:
the original source has one audio track and the shipped asset has zero. The
native `expo-video` player also sets `muted = true` and `volume = 0`, uses no
native controls or Picture in Picture, loops the Coach video while the set is
active, and keeps the system audio mixing mode automatic. The player does not
claim the system audio route, run in the background, or publish a now-playing
notification.

The owner later replaced the Coach-stage timer layout. In both Active and Rest,
the same 20-second ring now sits beside the repetition readout in the session
metrics card. It remains continuously decreasing through Rest, while the
Active display stays at the full 20-second rest value. Rest still hides the
Coach and the locked five-set/four-rest state machine remains unchanged,
including no Rest after Set 5.

Expo lint, TypeScript validation, audio-track inspection, and a fresh iPhone
17e Simulator build passed. Runtime visual QA covered Home/ready asset, active
Coach video, central Rest at Set 1 completion, and Coach reappearance at Set 2.

## Train Completion Transition and Celebration Media — 2026-08-25

The final guided repetition now enters a short, restrained `finishing` state
before accountability completion and the full Complete Today screen. It fades
from the active session into the supplied celebration Coach video, then settles
into the existing completion content; no set, rest, completion, or unlock rule
changes. The persisted completed Train summary uses that same celebration video
for every movement, while the skipped summary remains unchanged.

`completion-celebration-muted.mp4` is the application-local, video-only
derivative of the owner-supplied Completed MP4 (source: one video + one audio
track; shipped derivative: one video + zero audio tracks). The shared native
player configuration also uses `muted = true` and `volume = 0`, no native
controls/PiP, automatic audio mixing, no background playback, and no
now-playing notification.

The newest owner visual direction supersedes the previous lower-right/central
timer morph. All session timers sit beside the repetition count inside the
metrics card, so the ring remains fully visible on compact iPhone widths. The
instruction row now uses the supplied lightning treatment at its leading edge;
Rest remains Coach-free and continues to decrease automatically.

## 4:3 Coach Media and Home Transition Polish — 2026-08-26

The owner-supplied 4:3 Kneeling Drive Training and Complete 2.0 videos replace
the previous portrait Coach and celebration assets. Both application resources
are video-only derivatives (one video track, zero audio tracks), while the
native players retain `muted = true` and `volume = 0` as a second safeguard.
The Train Coach, active session, completion transition, and Complete Today
stages now use 4:3 containers with `contentFit="contain"`; no part of the Coach
is stretched or cropped.

Home's weekly-completion checkmark is now an overlay beneath the weekday letter,
so completing a day does not lift its letter above its peers. Profile and
settings subscreens now animate over a continuously mounted deep-canvas Home
scene: they enter from the right and reveal that already-present scene when
exiting left. Main tab and scene containers also have explicit canvas-colored
backgrounds, eliminating the transient white frame seen during interactions.

Expo lint, TypeScript, all 15 routine/state tests, a fresh iPhone 17e Simulator
build/run, Home completion visual QA, Profile → Home return QA, and Complete
Today 4:3 media QA passed. The only build note remains the pre-existing Hermes
run-script dependency-analysis warning.

## Train Layout Fidelity Correction — 2026-08-26

The owner approved a targeted correction to the actual iPhone React Native
screens, not the Web QA surface. Kneeling Drive now uses a 4:3 Home preview;
the Train overview presents the fixed 20-second rest duration without an active
countdown ring; Active restores the separate Guided Reps, progress, and Coach
cue hierarchy; and Rest centers its countdown, completion readout, cue, and
bottom Pause control without overlapping content. The five-set, movement-paced
repetition, 20-second Rest, pause/resume, and completion rules are unchanged.

Expo lint, TypeScript, all 15 routine/state tests, and fresh iPhone 17e
Simulator checks of Home, Train overview, Active, and Rest passed. The only
build note remains the pre-existing Hermes run-script dependency-analysis
warning.
