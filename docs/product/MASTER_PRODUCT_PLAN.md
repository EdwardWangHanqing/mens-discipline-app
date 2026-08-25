# Men's Discipline App — Master Product Plan v1.0

**Document Role:** Strategic product context

**Implementation Authority:** `MVP_SCOPE.md`

---

# 1. Document Priority

This document describes the long-term product direction, positioning, principles, and architecture.

For MVP implementation details, always read:

`MVP_SCOPE.md`

If this document conflicts with `MVP_SCOPE.md`, the latest Phase 02 MVP Scope takes precedence.

Older examples in this document must not override newer locked decisions.

Do not silently redesign the product.

---

# 2. Product Definition

The product is:

**A private men's performance training app built around consistency and accountability.**

It is not primarily:

- a general fitness app;
- a Screen Time utility;
- a Kegel-only tutorial;
- a medical treatment product;
- an adult entertainment product;
- a generic habit tracker.

The system combines three layers:

1. **Performance Training**
2. **Accountability Lock**
3. **Momentum / Positive Reinforcement**

The user is not paying simply for access to exercise videos.

The product value is:

**Consistency + Accountability + Experience**

---

# 3. Core Product Loop

The high-level product loop is:

Discover

→

Understand the accountability mechanism

→

Choose distracting apps

→

Receive today's training

→

Perform the training

→

Follow movement-specific guided repetitions, sets, and rests

→

Complete the accountability requirement

→

Entertainment apps remain available or become available

→

Progress and Momentum are recorded

→

Return the next day.

Detailed daily behavior is defined in `MVP_SCOPE.md`.

---

# 4. Brand Positioning

Core brand qualities:

- Private
- Calm
- Masculine
- Disciplined
- Premium
- Intentional

The product should feel mature and restrained.

It should not feel:

- childish;
- aggressively gamified;
- sexually explicit;
- clinical;
- like a bodybuilding app;
- like a generic productivity blocker.

---

# 5. Core Copy Direction

Key brand copy currently retained:

**Train what most men ignore.**

**Built to keep you honest.**

**No routine. No scroll.**

**Performance starts with consistency.**

**You showed up.**

Marketing should rely on:

- curiosity;
- discipline;
- confidence;
- consistency;
- privacy.

Avoid explicit medical or sexual-performance guarantees.

---

# 6. Target User

Initial target audience:

English-speaking men approximately 18–35.

Typical behavior:

- spends time on TikTok, Instagram, Reddit, YouTube, X, games, or similar entertainment;
- is interested in self-improvement;
- understands that consistency matters;
- often delays training despite knowing what to do;
- responds to accountability and visible progress.

The product should reduce the gap between:

**knowing**

and

**actually doing.**

---

# 7. Accountability System

App restriction is a core product mechanism, not the entire product.

The user chooses which entertainment apps they want restricted.

The product should not automatically decide what is distracting.

The purpose of the restriction system is to create an immediate relationship between:

**showing up for training**

and

**access to entertainment.**

Detailed Lock Time, Grace Extension, Skip Today, and proactive-completion behavior is defined in `MVP_SCOPE.md`.

---

# 8. Training System

Training focuses on men's performance-oriented lower-body / hip / pelvic movement patterns.

The product should not expand into a generic gym program simply for content volume.

The MVP training structure, movement library size, sets, repetitions, rest, card-cycle behavior, and replacement behavior are defined in `MVP_SCOPE.md`.

Do not use older multi-movement routine examples as current requirements.

---

# 9. Minimal Male Coach

The product uses a:

**Minimal Male Coach**

rather than traditional real-person instructional workout videos.

Desired qualities:

- lean / athletic;
- not excessively muscular;
- mature;
- anonymous;
- visually restrained;
- easy to understand;
- premium.

Face detail should be minimal.

Possible material direction:

- warm graphite;
- stone;
- matte ceramic.

Motion should feel:

- slow;
- stable;
- controlled;
- intentional.

The coach exists to demonstrate movement clearly.

---

# 10. Visual Direction

Design inspiration:

**WHOOP × Apple Fitness × Arc'teryx × premium men's skincare**

This means combining qualities rather than copying brand interfaces.

Desired qualities:

### WHOOP

Data discipline and restraint.

### Apple Fitness

Clarity and controlled motion.

### Arc'teryx

Masculine restraint and functional precision.

### Premium Men's Skincare

Privacy, refinement, calmness, and subtle sensuality.

Final product should develop its own distinct design system.

---

# 11. Color Direction

Initial strategic color direction:

### Background

Warm graphite rather than pure black.

### Surfaces

Charcoal / warm dark surfaces.

### Primary Text

Warm off-white rather than pure white.

### Secondary Text

Warm grey.

### Accent

Muted sage is the primary candidate.

Warm bronze / amber may be used carefully for:

- Momentum;
- completion;
- milestones.

Avoid:

- bright neon colors;
- excessive gradients;
- loud gaming effects;
- luxury-gold clichés.

Exact colors will be finalized during Visual System development.

---

# 12. Progress and Momentum

Progress is framed as:

**Momentum**

rather than generic statistics.

Core concepts include:

- Current Streak
- Longest Streak
- Total Sessions
- Calendar
- Milestones

The emotional purpose is to help the user build identity around consistency.

The system should avoid punishing the user psychologically when a streak breaks.

Total Sessions and historical progress remain important even after a missed day.

Detailed MVP requirements are defined in `MVP_SCOPE.md`.

---

# 13. Completion Experience

Routine completion should provide restrained positive reinforcement.

Potential elements include:

- subtle haptic feedback;
- completion transition;
- minimal sound;
- coach returning to a resting posture;
- Momentum update;
- app-unlock feedback.

Key completion copy:

**You showed up.**

The completion experience should feel satisfying without becoming game-like.

---

# 14. Guided Cadence Training

The MVP uses a low-friction guided session rather than camera-assisted movement
verification. The Coach demonstrates the movement, the app counts down, guides
the shared 20-rep target and movement-specific tempo across five sets, provides 20-second
rests, then records routine completion for accountability.

MVP does not claim to prove every repetition. It must not replace Vision with a
manual-tap, hardware-button, or similar counting workaround. Exact movement
targets, cadence, Coach assets, audio/haptics, and visual progress treatment are
defined in later content/design work.

---

# 15. Camera Privacy

The MVP does not request camera permission or process training video. Privacy
remains a major product differentiator. If camera-assisted R&D resumes after
MVP, raw frames should remain on device and should not be uploaded or stored by
default.

---

# 16. Post-MVP Pose Architecture Reference

Phase 03.9 demonstrated an architecture that could be revisited after MVP. Any
future implementation should separate:

### Platform pose adapter

from:

### Movement / rep engine.

Example:

iOS Vision

→ normalized body landmarks

→ shared movement logic

and later:

Android pose technology

→ normalized body landmarks

→ shared movement logic.

This keeps future Android development possible without unnecessarily rewriting
all movement logic. It is not an MVP implementation requirement.

---

# 17. Platform Strategy

Primary platform:

**iOS First**

Android follows after iOS MVP validation.

Cross-platform logic should remain reusable where practical.

Platform-specific functionality is expected for:

- App Lock;
- native permissions;
- native extensions.

A pose detection adapter is only a post-MVP possibility.

---

# 18. iOS Screen Time Architecture

The iOS accountability system is expected to involve Apple's Screen Time technologies, including areas such as:

- Family Controls;
- Managed Settings;
- Device Activity;
- relevant Screen Time extensions.

App Lock is one of the largest technical risks in the project.

Therefore:

**technical validation must happen before full visual implementation.**

Exact architecture will be validated during Phase 03 Technical Feasibility.

---

# 19. Application Architecture Direction

Planned direction:

### React Native / Expo

For most:

- screens;
- navigation;
- account UI;
- progress UI;
- routine UI;
- business logic;
- cross-platform features.

### Native iOS / Swift

Where required for:

- Family Controls;
- Managed Settings;
- Device Activity;
- Screen Time extensions;
- other Apple-specific capabilities.

Apple Vision remains a post-MVP R&D option, not part of the MVP runtime.

The final technical boundary will be determined during feasibility testing.

---

# 20. Account Strategy

Account creation should not block the user's first product experience.

The product should allow the user to understand the value first.

After the first full free routine, the user can be encouraged to save progress.
The user may decline and retain locally earned progress/history in a limited
signed-out Home state, but must create/sign in to an account before starting
Trial or Subscription. Account options are Continue with Apple, Continue with
Google, and Continue with Email.

Authentication direction includes:

- Continue with Apple;
- Continue with Google;
- Continue with Email.

Phone OTP is not a current first-priority MVP method.

Important progress must eventually support authenticated restore across devices.

Detailed requirements are defined in `MVP_SCOPE.md`.

---

# 21. Monetization

The product uses a subscription model.

Locked Phase 04 direction:

- first full routine experience free;
- then 3-Day Free Trial;
- Monthly at USD $9.99/month;
- Annual at USD $39.99/year, default recommended.

The 3-Month plan is removed. The paywall may be closed; closing it does not
grant ongoing free training. Restore Purchases, Terms, Privacy, clear trial and
renewal disclosure, account deletion, and subscription utility behavior are
release requirements. No active training entitlement means no active
accountability lock.

RevenueCat is planned for subscription entitlement management.

Exact pricing remains a later decision.

Subscription implementation should be transparent about:

- trial duration;
- renewal;
- price;
- cancellation.

---

# 22. App Store Review Strategy

App review considerations should influence the product throughout development rather than only immediately before submission.

Avoid positioning the product as:

- ED treatment;
- testosterone treatment;
- guaranteed sexual-performance improvement;
- explicit sexual entertainment.

Preferred positioning centers around:

- men's wellness;
- performance;
- control;
- consistency;
- private training.

Exercise presentation and marketing imagery should remain non-explicit.

App Store compliance must be treated as an operational requirement, not merely a launch-week task.

Important operational release requirements are tracked separately in:

- `docs/release/IOS_LAUNCH_READINESS.md`
- `docs/release/APP_REVIEW_RISK_REGISTER.md`
- `docs/business/BUSINESS_APPLE_ACCOUNT_PLAN.md`

These files must not redefine locked product scope.

---

# 23. Android Strategy

Android is a later phase.

Current architecture should avoid unnecessary obstacles to a future port.

Platform-independent areas should include where practical:

- exercise definitions;
- user profile;
- progress;
- Momentum;
- subscription logic;
- backend;
- analytics;
- design system.

Platform-specific areas are expected to include:

- App Lock;

If explicitly resumed after MVP, pose detection would also be platform-specific.

Android App Lock implementation must be evaluated separately for Google Play policy compliance.

---

# 24. Audio Direction

Audio should remain restrained.

Background music direction:

- dark ambient;
- restrained pulse;
- premium masculine tone;
- subtle sensual energy;
- focus and control rather than high-energy workout EDM.

Possible UI sounds:

- Ready
- Rep
- Halfway
- Final Rep
- Completion
- Unlock

Avoid noisy repetitive sound feedback.

Final commercial music licensing must be verified before release.

---

# 25. Marketing Direction

Inside the app:

**Virtual Minimal Male Coach**

Outside the app:

real people may be used for UGC and advertising.

Potential creator categories:

- men's self-improvement;
- men's wellness;
- confidence;
- productivity;
- dopamine-control content;
- lifestyle;
- mobility.

Marketing should favor:

**curiosity + masculinity + mystery**

rather than explicit sexual advertising.

---

# 26. Analytics Direction

Important future analytics areas include:

### Acquisition

Where users came from.

### Onboarding

Where users drop off.

### Activation

Whether the first complete routine is finished.

### Monetization

Trial and subscription conversion.

### Retention

Day 1 / Day 3 / Day 7 / Day 14 / Day 30.

### Training Behavior

- routine completion;
- abandonment;
- guided cadence / training-flow comprehension problems;
- time to completion.

Analytics implementation belongs to a later project phase.

---

# 27. Development Philosophy

Do not jump randomly between product areas.

The project progresses by explicit stages.

High-risk technical prototypes come before full visual polish.

The core technical prototype must eventually validate:

App Selection

→

Lock

→

Guided Training

→

Complete

→

Unlock.

Only after the core mechanism is technically credible should the product move deeply into full visual implementation.

---

# 28. Project Phases

Current high-level roadmap:

00 — Foundation

01 — Product Positioning

02 — MVP Scope

03 — Technical Feasibility

04 — UX Architecture (Closed / Passed)

05 — Visual System / Figma Design System (Next)

06 — Full UI Design

07 — Core App Build

08 — Screen Time System

09 — Guided Training Engine

10 — Coach Assets

11 — Audio

12 — Progress & Rewards

13 — Monetization

14 — Analytics & Privacy

15 — Beta Testing

16 — App Store Launch

17 — Post-launch

18 — Android

Some phases may overlap where appropriate.

For the MVP training workstream, Phase 07/09 should build the data-driven guided
training engine, demonstration/countdown flow, five-set state machine, 20-second
rests, and the shared 20-rep target plus movement-specific cadence specifications. Phase 10 supplies
the approved movement/Coach assets, Phase 11 defines the final audio/haptic
system, and Phase 12 defines the visual progress/completion treatment. Do not
redirect this roadmap toward productionizing Camera/Vision across seven
movements.

The numbered phases remain the primary product/development sequence, but release readiness is no longer deferred to Phase 16.

The following cross-phase workstreams run in parallel when relevant:

1. **Apple capability readiness**
   - Developer Program membership
   - Bundle IDs / native targets
   - Family Controls development and Distribution entitlements
   - signing / capability requirements

2. **Business and commerce readiness**
   - company formation
   - D-U-N-S
   - Individual → Organization conversion
   - Paid Apps Agreement
   - tax / banking
   - App Store Small Business Program
   - RevenueCat production readiness

3. **Privacy and legal readiness**
   - data inventory
   - permissions
   - App Privacy labels
   - Privacy Manifest / Required Reason APIs
   - third-party SDK review
   - Privacy Policy
   - Terms / EULA
   - support contact
   - account deletion
   - export compliance
   - territory-specific requirements where applicable

4. **Reviewability**
   - reviewer test path
   - Review Notes
   - demo credentials where required
   - subscription Sandbox/TestFlight testing
   - metadata / screenshots / age rating
   - no placeholders or inaccessible paid functionality

---

# 29. Current Phase

Current active phase:

**03 — Technical Feasibility**

Primary questions:

1. Can the Apple accountability / App Lock mechanism work reliably?
2. Can native iOS functionality integrate cleanly with the chosen React Native / Expo architecture?
3. Can the complete Lock → guided training → Complete → Unlock loop run on a real iPhone?

Phase 03.9 answered a separate question: Apple Vision pose counting is
technically possible, but its framing/calibration UX is not acceptable as a
mandatory MVP path.

Visual polish is secondary during this phase.

---

# 30. Cross-Phase Release Readiness

A feature is not considered fully release-ready merely because it works locally.

For any material feature, the project should know and test as applicable:

1. technical behavior;
2. Apple capability / entitlement requirements;
3. permission and privacy impact;
4. commerce / subscription impact;
5. reviewer testability;
6. failure and recovery behavior.

At the end of every future phase, perform a **Release Impact Check**:

1. Did this phase add or change an Apple entitlement or capability?
2. Did it add or change a permission, data type, SDK, or external service?
3. Did it add or change account, login, deletion, or data-retention behavior?
4. Did it add or change subscription, paywall, trial, restore, or paid value?
5. Did it affect App Store metadata, age rating, legal copy, screenshots, or reviewer instructions?

If the answer to any item is yes, update the release checklist and/or risk register during the same phase rather than postponing the issue until launch.

### Built-in Apple capability packaging note

Apple review rules should be interpreted carefully and in context.

Guideline 4.10 explicitly names Screen Time APIs. Camera is no longer part of the
MVP release package. Existing approved paid apps suggest that Screen Time can be
integrated into paid products in practice, but Apple provides no explicit safe
harbor for this product's specific implementation or monetization structure.

This therefore remains a P1 App Review and packaging risk. The final paywall, metadata, value proposition, and Review Notes must be reviewed before submission and should describe the complete Men's Discipline training/accountability experience without claiming that this packaging guarantees approval.

Do not change the locked subscription model solely because a paid feature uses
Screen Time APIs.

If App Review raises a concrete concern, address the specific review issue and record any resulting product decision explicitly.

---

# 31. Product Governance Rule

This document provides strategic context.

`MVP_SCOPE.md` defines the current MVP implementation scope.

`CURRENT_PHASE.md` defines what should be worked on now.

`DECISIONS.md` records important accepted decisions and their reasoning.

`AGENTS.md` defines how coding agents must work inside the repository.

When requirements conflict:

1. latest explicitly approved decision;
2. `MVP_SCOPE.md`;
3. `MASTER_PRODUCT_PLAN.md`;
4. older brainstorming.

Do not revive superseded examples.
