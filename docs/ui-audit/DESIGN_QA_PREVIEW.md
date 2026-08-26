# VAEL Development Design QA Preview

## Purpose

`/design-qa` is a development-only visual and interaction QA surface. It uses
the existing React Native screens, components, design tokens, movement data and
session presentation. It is not a second product implementation and is not a
production Web platform.

Design authority remains:

1. latest explicit Owner direction;
2. the accepted running implementation;
3. shared design tokens and components;
4. screenshots and visual references;
5. older Figma frames.

## Run

```sh
npm install
npm run qa:web
```

Open `http://localhost:8081/design-qa`. If Expo selects another port, use that
port and keep the `/design-qa` path.

The route is guarded by `__DEV__`. A non-development build redirects it to the
normal app entry.

## Direct State Catalog

- Home: First-Ever / Unrevealed, Revealed / Active, Complete, Skipped, and
  Grace / Recoverable.
- Train: Ready / Overview, Active / Set 1, Rest / Between Sets, Active / Mid
  Session, Active / Final Set, and Complete.
- Locks: Locked, Grace Active, Skipped, and Unlocked.
- Onboarding: brand entry plus every numbered onboarding screen.
- Other: Profile, Settings, History, Milestones, Notifications, Lock
  Preferences, Manage Apps, Lock Schedule, Paywall, Sign In, and Sign Up.

## Controls

- phase: Ready, Active, Rest, or Complete;
- current set: 1–5;
- reps: 0–20, including single-step changes;
- Rest countdown: 20, 10, 5, or 0 seconds;
- motion: frozen for pixel inspection or live for timing review;
- actions: routine complete, unlock, Grace, Skip, session reset, and complete
  preview-state reset.

Changing a control remounts the previewed screen with deterministic inputs, so
the selected state is immediately inspectable without replaying the product
flow.

## Native Capability Boundary

On Web, routine completion and unlock only update local preview state. Account
submission also returns an explicit QA mock error and never claims that a
provider or backend succeeded.

On iOS, the normal app route continues to use the existing Family Controls,
Device Activity, App Group completion, restriction and authentication
integration boundaries. The optional preview-state input is not passed by the
production app.

## QA Workflow

Use Web Preview for fast spacing, typography, alignment, icon, overflow,
progress, countdown, transition and state checks. Confirm final changes in iOS
Simulator or on device for safe areas, native pickers, haptics, Family Controls,
Device Activity and other platform-only behavior.
