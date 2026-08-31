# Design QA — Round 05

**Date:** 2026-08-30
**Viewport:** iPhone 17e Simulator, 369 × 800 logical pixels, 3× device density
**Target state:** New-user onboarding, step 2 of 5 (`onboarding-step-1`)
**Final result:** passed

## Source and implementation evidence

- Source visual: `/Users/hanqingwang/Desktop/Male APP/APP/设计GPT/Onboarding/Onboarding 2.png` (941 × 1672).
- Supplied coach: `/Users/hanqingwang/Desktop/Male APP/APP/设计GPT/Onboarding/Onboarding教练.png`.
- Supplied icons: the three `ChatGPT Image 2026年8月30日 ...` PNG files in `/Users/hanqingwang/Downloads/`.
- Current-run Foundation captures: iPhone 17e and iPhone 17 Pro Simulator, captured during this QA run.
- Current-run Home first-ever capture: iPhone 17e Simulator, captured during this QA run.
- Focused comparison evidence: the same full-screen capture, because the target occupies the full viewport and includes typography, icon rows, coach placement, CTA, and progress state.
- The reference and final implementation were opened together in the same visual-comparison input before acceptance.

## Iteration history

1. Captured the pre-change simulator state at `00-foundation-before.png`; the existing card layout, small coach, and SF Symbols did not match the supplied composition.
2. `01-foundation-iteration-1.jpg`: installed the supplied icon art and rebuilt the page structure; coach remained too small/low and icon canvases showed square edges.
3. `02-foundation-iteration-2.jpg`: center-cropped the icon assets and enlarged the coach; composition moved substantially closer to the reference.
4. `03-foundation-final.jpg` and `04-foundation-final.jpg`: corrected coach overlap, typography scale, row widths, icon size, and wrapping.
5. `05-foundation-final.jpg`: raised the CTA/dots and preserved the coach-behind-button relationship from the source. Accepted.
6. Round 05 replaces the fixed coach frame with width-derived scale and small-screen placement, advances the feature stack into the central visual field, and reserves the Foundation CTA/dots from the device home-indicator area.
7. Round 05 also makes Home compact only when the available phone width/height requires it, while deriving the navigation and Home scroll insets from the real bottom safe-area inset. The first-ever `Reveal` is fully visible and tappable above the tab bar on 369 × 800.

## Fidelity checks

1. **Copy and hierarchy** — Passed. Eyebrow, three-line headline, yellow emphasis, support copy, row labels, and row descriptions match the source wording and hierarchy.
2. **Supplied assets** — Passed. The existing supplied coach is retained; all three supplied anatomy icons are used in the intended order.
3. **Layout** — Passed. Coach, rows, CTA, and progress indicator reproduce the source composition within the narrower iPhone 17e viewport; the coach now occupies the right/middle field without a fixed pixel frame and remains behind the CTA.
4. **Interaction** — Passed. Continue advances to the existing next onboarding state. The real five-step progress model remains truthful rather than displaying the seven decorative dots shown in the concept image.
5. **Regression** — Passed. Other onboarding screens and their back navigation were not redesigned; TypeScript and lint pass.

## Whole-app audit evidence

Current-run screenshots are stored in `/Users/hanqingwang/Desktop/VAEL-audit-2026-08-30/full-app/` and cover onboarding, required account/paywall, Home, Train (overview/countdown/active/pause/rest), Locks, Profile, History, Milestones, Membership, Settings, Notifications, Introduction, and Privacy.

### Confirmed findings outside the requested edit scope

- **Release blocker:** authentication and password reset are presentation-only adapters and always return integration errors.
- **Release blocker:** App Store purchase and restore are not connected; required access can only be exercised with debug entitlement controls.
- **Release blocker:** Privacy/Terms/Support content explicitly identifies itself as preview material and requires final public policy/contact information.
- **Resolved:** the 369 × 800 first-ever Home `Reveal` had been partially covered because the Home card used its roomy desktop-sized vertical rhythm while the bottom navigation ignored the device bottom inset. Home now derives both scroll reserve and tab-bar inset from `useSafeAreaInsets`, and uses a constrained-width density only on small phones. The first-ever `Reveal` and revealed `Begin` states were both captured fully visible and tappable above the tab bar during this QA run.
- **High maintenance:** Expo Doctor reports 12 SDK patch mismatches. `npm audit --omit=dev` reports 16 transitive findings (5 high, 11 moderate), primarily in Metro/image parsing and Expo tooling.
- **Development-only / no app-code fix required:** Dev Client recorded `InspectorPackagerConnection` WebSocket `Code=57` (`Socket is not connected`) followed by `Couldn't connect to packager, will silently retry`. It is the Dev Client inspector's connection to Metro, not an application warning: fresh Debug builds loaded the bundle and exposed no JS/LogBox warning, then the inspector later retried this transport connection. Release does not include the inspector connection. No dependency update or application-code suppression is appropriate; restart Metro/the Dev Client if the stale inspector connection returns.

No additional production UI or logic was changed for these findings in this round.
