# Current Project Phase

## Project

Men's Discipline App

## Current Phase

**03 — Technical Feasibility**

## Completed Sub-phase

**03.1 — Project Bootstrap**

**Status:** Complete

## Current Sub-phase

**03.2 — Apple / iOS Prerequisites**

## Current Objective

Prepare and validate the Apple and iOS prerequisites required before Family Controls implementation begins.

Immediate work:

1. Apple Developer Program status
2. App identifier / Bundle ID strategy
3. Family Controls entitlement prerequisites
4. iOS native development / build requirements

## Phase 03 Primary Goal

Prove that the core product loop is technically feasible:

App Selection

→ App Lock

→ Begin Routine

→ Camera / Pose Tracking

→ Rep Completion

→ Routine Complete

→ Unlock Selected Apps

## Technical Risks To Validate First

### 1. iOS App Lock

Validate:

- Family Controls authorization
- App selection
- Managed Settings shielding
- Locking selected apps
- Unlocking selected apps
- Required Screen Time extensions
- Distribution entitlement requirements

### 2. Camera / Motion Tracking

Validate:

- Camera access
- On-device human pose detection
- Body landmark normalization
- Simple movement state detection
- Rep counting
- Reliable basic completion verification

Core principle:

**Verify, don't judge.**

The system should verify general movement completion and count repetitions.

It should NOT provide detailed form scoring or detailed corrective coaching in the MVP.

## Current Platform Priority

**iOS first.**

Android architecture should remain possible later, but Android implementation is not part of Phase 03.

## Do Not Start Yet

Do not begin:

- Full production UI
- Full Figma implementation
- Production coach animations
- Final audio system
- RevenueCat integration
- Subscription paywall implementation
- Analytics implementation
- Android implementation
- Social features
- Leaderboards
- Large exercise library

## Exit Criteria For Phase 03

Phase 03 is complete only when we have enough evidence that the following flow can work on a real iPhone:

1. User selects distracting apps
2. Selected apps can be restricted
3. User begins a routine
4. Camera can detect the user
5. At least one representative movement can be counted reliably
6. Routine completion can trigger app unlock

The prototype may be visually rough.

Technical feasibility matters more than visual polish in this phase.
