# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-23 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Developer/mens-discipline-app`

**Active branch:** `chore/phase-05-precision-graphite-figma` (Figma visual-system checkpoint)

**Phase 03.10 integration checkpoint:** `main` at `c398be46ecae5dd9e97c89f2922cb1cb3a73f898`

**Accepted main checkpoint:** `main` at `9a0d9ffcd6887bb64525a0b8933f7edf3efd0c58`

**Phase 03.11 merged checkpoint:** `main` at `5b8cca697b601aff9a7d31759f6ec0309f2d7756`

**Phase 03 closure documentation checkpoint:** `main` at `273e1a52dbaed0cf1f68b9b8b46297dc5eb8a063`

**Primary Phase 03 status:** Closed / Passed

**Phase 04 status:** Closed / Passed

**Phase 05 status:** In progress — first Figma visual-system checkpoint created; awaiting Owner visual approval

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
- typically 15–20 reps/set, exact target defined per movement later;
- exactly 20 seconds rest between sets;
- movement-specific cadence/tempo defined with each movement and Coach asset;
- no universal repetition count, cadence, or total session duration.

Do not invent final movement targets, cadence values, Coach design/assets,
audio/haptics, or visual progress animation during the next architecture task.

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
exactly one full free daily routine: one movement, five sets, movement-specific
reps/cadence, and four 20-second rests. Earned progress/history remains visible
after completion, including in the signed-out limited Home state. New training
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

The active Phase 05 visual-system file is:

- `Men's Discipline — Precision Graphite`
- https://www.figma.com/design/4MSAwi2syAr6Hc2P0XEd55

It preserves earlier exploration by starting a new file and organizes the
active direction as `00 Cover`, `01 Foundations`, `02 Components`, and
`03 Screens`. It contains local Precision Graphite color/geometry variables,
SF Pro text styles, core component families, and canonical Home, Train Tab,
immersive Guided Session, guided Rest, and locked Locks states. The Home design
contains the mandatory monthly calendar; immersive Train intentionally hides
bottom navigation; Locks uses the locked `3 × 5-minute` non-stackable Grace
semantics. It contains no Camera/Vision UI or invented performance metrics.

The Fidelity v2 correction pass keeps the original four screens as explicitly
named Archive frames and adds a separate active comparison set. Fidelity v2
makes Home vertically scrollable with a fixed three-item navigation bar,
connects its `5 / 7` weekly ring and seven-cell Weekly Consistency module to
the same real weekly denominator, uses centered 32 × 32 Calendar Day variants,
and moves the calendar/lifetime metrics below the first viewport. Train now
uses an intentional Coach / Media Stage placeholder rather than provisional
human art, plus five-segment set progress and a 20-second Rest state. Locks now
uses the stronger Accountability Lock hierarchy, four selected-app rows and
the clear `3 remaining / Use 5 min` Grace treatment. The v2 state remains
awaiting Owner visual approval before Phase 06 expansion.

The active Home-only Fidelity v4 pass is the current preferred Home reference.
It preserves v3 as an archive and aligns Home to the Owner-provided full-page
Precision Graphite reference: restrained greeting header with visual/profile
anchors; one Momentum card with `12 DAYS IN A ROW`, meaningful `5 / 7` weekly
ring and integrated seven-cell Weekly Consistency; a structured Tonight's
Routine card with `1 / 5 / 18` metrics and a fixed 20-second-rest strip; a
vertically scrollable monthly consistency calendar; factual Lifetime Progress;
and Home / Train / Locks navigation. The actual Owner-provided kneeling coach
PNG is now uploaded to Figma and used as the left-side image beside `Kneeling
Drive`, replacing the v3 placeholder. It does not add an invented duration,
performance score, Camera/Vision behavior, or fourth tab. Owner visual approval
is still needed before broad Phase 06 expansion.

The active Train-only Fidelity v4 pass is the current preferred Train-tab
reference. It preserves all earlier Train variants and translates the
Owner-provided reference into the Train preparation view: Current Movement,
Kneeling Drive focus copy, five-segment `SET 3 OF 5` progress, an 8-rep / 20
second-rest detail card, concise coaching instruction, Start Set action, and
the Train-selected bottom navigation. The Owner-provided kneeling coach PNG is
now used as the central Coach Media slot. This is explicitly a replaceable
media container for a later approved GIF or video; no GIF/video behavior,
camera feature, or new training mechanic was introduced.

Home now also has a component-backed Unrevealed state. The existing locked
baseline `Scrollable Home content - Locked` remains unchanged as the approved
Revealed visual source. `Home / Unrevealed / Active Momentum` is a direct
duplicate with identical 394 × 1324 scroll dimensions and all non-Routine
layers preserved; its only replacement is a `Routine/Card` instance with
`State=Unrevealed`. `Routine/Card` is now a two-variant component set:
`State=Revealed` preserves the approved Kneeling Drive appearance, while
`State=Unrevealed` uses the Owner-provided restrained dark Coach image, `Your
movement is ready.`, a `COMPLETE BEFORE 9:00 PM` accountability cue, and
`REVEAL`. It adds no reveal gamification, new color language, Camera/Vision
behavior, or product mechanic.

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
