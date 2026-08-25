# Design QA — Round 03

**Date:** 2026-08-24

**Viewport:** iPhone 17 Pro Simulator
**Final result:** passed

## Evidence reviewed

- Owner references: Locks, Grace, Skip, skipped Home/Train, completed Home/Train, and supplied lock/action assets.
- Current-run pre-fix capture: `docs/ui-audit/round-03/pre-fix/locks-current.png`.
- Current-run accepted captures: `docs/ui-audit/round-03/post-fix/`.
- Reference and implementation captures were inspected in paired visual-comparison inputs at the same product state.

## Audit steps

1. **New-user truth** — Passed. Home, Profile, History, Milestones, weekly consistency, calendar, momentum, and lifetime progress now begin at zero without fake achievements.
2. **Skip outcome consistency** — Passed. Home, Train, Locks, calendar, and momentum use the same skipped state; no completion deadline remains after Skip.
3. **Completion outcome consistency** — Passed. Completion is recorded at the valid final set, Home and Train show the completed state, and the supplied unlock asset is used.
4. **Grace lifecycle** — Passed. Three daily uses, five-minute persisted timer, native shield removal, automatic shield restoration, and visible remaining-use count are implemented.
5. **Destructive confirmation** — Passed. Skip requires a continuous two-second hold, uses a left-to-right progress fill, cancels on early release, and produces tactile feedback on completion.
6. **Locks fidelity** — Passed. Supplied shield, lock-ring, hourglass, and Skip assets are used. Selected native app/category labels are shown in a bounded list with overflow summary.
7. **Lock schedule** — Passed. The row opens a native iPhone-style time wheel and saves the new schedule to app state and the Screen Time schedule bridge when available.
8. **Motion** — Passed. Tabs, Profile/subscreens, Reveal state, sheets, and calendar month transitions animate; calendar supports horizontal swipe.
9. **Visual hierarchy and accessibility** — Passed. Primary actions remain visible, destructive intent is explicit, touch targets have accessibility labels, and state colors retain the graphite/yellow system.
10. **Regression** — Passed. TypeScript, lint, state/routine tests, native Simulator build, launch, and screenshot review completed successfully.

## Accepted screenshots

- `home-current-state.png` — skipped Home
- `train-skipped.png` — skipped Train
- `train-completed.png` — completed Train
- `locks-compact.png` — bounded selected-app list and supplied icon assets
- `grace-three.png` — first Grace confirmation showing three uses
- `grace-active.png` — active Grace countdown and two remaining uses
- `grace-ended.png` — lock and actions restored after Grace expiry
- `lock-time-edit.png` — editable native time wheel
- `profile-zero.png` and `history-empty.png` — truthful new-user progress

## Residual boundary

Coach imagery remains a replaceable media placeholder by Owner decision. Future per-movement Coach animation and audio replacement does not require a layout redesign.
