# Men's Discipline App — Project Handoff

**Last updated:** 2026-08-15 (America/Vancouver)

**Repository:** `/Users/hanqingwang/Developer/mens-discipline-app`

**Active closure branch:** `spike/vision-kneeling-drive`

**Branch base:** `spike/device-activity-schedule` at `3333f79`

**Accepted main base:** `main` at `02bef80b8af4209470fbf8b5dd54a1fe984a15ae`

## Purpose and Authority

This is the continuity summary for the next task. It does not replace the
authoritative product, decision, technical, or release documents.

When documents conflict, follow:

1. `AGENTS.md`;
2. latest accepted decision in `docs/DECISIONS.md`;
3. `docs/product/MVP_SCOPE.md`;
4. `docs/product/MASTER_PRODUCT_PLAN.md`.

Always start with `git status --short --branch` and preserve existing work. Do not
merge a checkpoint into `main` without explicit owner acceptance.

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

The branch tip intentionally removes the live-camera route, purpose string,
capture view, and movement counter from the MVP runtime. The earlier accepted
offline/local Vision foundation remains in the repository as post-MVP R&D
reference. See `docs/technical/POSE_MOTION_FEASIBILITY_PLAN.md`.

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
- Main-app Family Controls Distribution is Assigned.
- The monitor extension's separate Distribution entitlement remains required
  before TestFlight/App Store.
- Denied/revoked, Release/TestFlight without Metro, reboot, midnight,
  timezone/DST, and multi-version reliability remain open.

No Family Controls capability, entitlement, App Group, Bundle ID, selected-app
privacy boundary, or existing reliability conclusion changed in Phase 03.9.

## Current Phase and Next Safe Task

Phase 03 remains active; Phase 03.9 is closed.

Next logical sub-phase: **03.10 — Guided Routine → Accountability Unlock
Integration**.

Build the smallest data-driven training state machine and diagnostic flow that:

1. accepts one representative movement specification without locking all seven
   movement values;
2. runs demonstration/countdown, five guided sets, and 20-second rests;
3. records routine completion;
4. updates today's shared accountability state;
5. proves completion → unlock/suppress shield on a real iPhone.

The roadmap after that should focus on movement-specific specifications and
cadence, Coach assets, set/rest interaction, audio/haptics, and visual progress.
It should not productionize Vision across seven movements.

## Release / Privacy State

- Camera permission and production Vision behavior are not MVP release
  requirements.
- The current MVP source does not declare `NSCameraUsageDescription`.
- Seven-movement Camera testing and Camera reviewer instructions have been
  removed from release gates.
- Historical spike privacy evidence is retained: raw frames were not recorded,
  persisted, uploaded, or bridged to JavaScript.
- Family Controls entitlement, privacy, reliability, App Review, and reviewer
  testability requirements remain unchanged.

## Safe Comparison and Rollback Points

- Accepted main base: `02bef80b8af4209470fbf8b5dd54a1fe984a15ae`.
- Phase 03.8 branch base: `3333f79`.
- Live Vision prototype checkpoint: `463e4f2`.
- To undo the final Phase 03.9 closure after review, create a normal revert commit;
  do not reset, clean, rewrite history, or force-push.

## New-Task Startup Instruction

> Open `/Users/hanqingwang/Developer/mens-discipline-app` on
> `spike/vision-kneeling-drive`. Run `git status --short --branch`, then read
> `AGENTS.md`, `docs/PROJECT_HANDOFF.md`, `docs/CURRENT_PHASE.md`,
> `docs/product/MVP_SCOPE.md`, `docs/DECISIONS.md`, and the release documents.
> Follow DEC-021: MVP uses guided cadence training, not Camera/Vision counting.
> Preserve the Vision spike in Git history and do not expose its diagnostic in
> MVP. Do not merge `main` without explicit owner acceptance.
