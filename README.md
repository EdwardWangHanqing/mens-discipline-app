# Men's Discipline App

A private men's performance training application built around consistency and accountability.

Core product loop:

**Select distracting apps → Lock → Complete today's routine → Verify completion → Unlock**

## Project Status

Current phase:

**03 — Technical Feasibility**

See:

`docs/CURRENT_PHASE.md`

## Before Working On This Repository

Read:

1. `AGENTS.md`
2. `docs/CURRENT_PHASE.md`
3. `docs/product/MVP_SCOPE.md`
4. `docs/DECISIONS.md`

Use `docs/product/MASTER_PRODUCT_PLAN.md` when broader product context is required.

## Documentation Map

### Product / Scope

- `docs/product/MVP_SCOPE.md` — authoritative locked MVP behavior
- `docs/product/MASTER_PRODUCT_PLAN.md` — strategic product context

### Current Work / Decisions

- `docs/CURRENT_PHASE.md` — what should be worked on now
- `docs/DECISIONS.md` — accepted decisions and clarifications

### iOS Release / App Review

- `docs/release/IOS_LAUNCH_READINESS.md` — operational checklist from prototype through TestFlight / App Store
- `docs/release/APP_REVIEW_RISK_REGISTER.md` — P0/P1 launch and review risks

### Business / Apple Commercial Setup

- `docs/business/BUSINESS_APPLE_ACCOUNT_PLAN.md` — company, Apple Developer legal entity, D-U-N-S, banking, tax, Small Business Program sequencing

## Core Product Principles

- Private
- Calm
- Masculine
- Disciplined
- Premium
- Intentional

Motion tracking principle:

**Verify, don't judge.**

Accountability principle:

**No routine. No scroll.**

## Development Strategy

The project is iOS-first.

High-risk technical functionality must be validated before full production UI development.

Primary Phase 03 risks:

1. Apple Family Controls / Screen Time
2. App restriction and unlock
3. Camera / pose detection
4. Rep counting
5. React Native ↔ native iOS integration

Business setup and release-readiness work run in parallel so they do not become launch-week blockers.

## Technology

Planned direction:

- React Native
- Expo
- TypeScript
- Native iOS / Swift where required
- Apple Family Controls / Screen Time APIs
- On-device pose detection

Exact architecture and versions are intentionally not locked in this README yet.

They will be decided during Phase 03 Technical Feasibility.

## Privacy

Camera video should remain on device whenever possible.

Do not upload or persist training video by default.

## Git

`main` represents the latest stable version.

See `AGENTS.md` for repository safety and workflow rules.
