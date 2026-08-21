# Project Decision Log

This file records important product and technical decisions so they are not repeatedly reopened without a clear reason.

---

## DEC-001 — iOS First

**Status:** Accepted

The MVP will be developed for iOS first.

Android will be considered after the iOS MVP has been validated.

### Reason

The App Lock mechanism is one of the highest technical risks in the product.

The first version should validate one platform before introducing Android-specific complexity.

---

## DEC-002 — App Lock Is a Core Product Mechanism

**Status:** Accepted

The core accountability loop is:

Selected entertainment apps remain restricted until today's required routine is completed.

### Principle

**No routine. No scroll.**

MVP should keep the rule understandable rather than introduce many lock modes.

---

## DEC-003 — Camera Processing Should Be On Device

**Status:** Accepted for post-MVP R&D; superseded as an MVP requirement by DEC-021

Camera footage should not be uploaded to a server for routine rep counting.

Camera footage should not be stored by default.

The preferred architecture is:

Camera

→ On-device pose detection

→ Body landmarks

→ Rep engine

→ Derived completion data only

### Reason

Privacy is a core product requirement.

Cloud generative AI is unnecessary for basic movement verification.

The MVP does not request camera access or depend on Camera / Apple Vision. This
decision remains the privacy boundary if camera-assisted training is revisited
after MVP.

---

## DEC-004 — Verify, Don't Judge

**Status:** Accepted for post-MVP Camera/Vision R&D; superseded as an MVP path by DEC-021

Motion tracking should determine:

- whether a person is present;
- whether the general expected movement is occurring;
- how many repetitions were completed.

MVP should NOT provide:

- detailed form scores;
- centimeter-level corrections;
- aggressive form criticism;
- detailed biomechanical coaching.

### Principle

**Verify, don't judge.**

---

## DEC-005 — Main Branch Must Remain Stable

**Status:** Accepted

`main` represents the latest known stable version.

Normal feature development should happen on separate branches.

Examples:

- `spike/family-controls`
- `spike/vision-pose`
- `feature/app-selection`
- `fix/rep-counter`

A branch should represent one logical unit of work rather than every tiny edit.

---

## DEC-006 — High-Risk Technology Before Full UI

**Status:** Accepted

Do not spend significant time building polished production UI before validating:

1. Family Controls / App Lock
2. React Native ↔ native iOS integration
3. Lock → guided routine → unlock integration

### Reason

A beautiful interface has little value if the core technical mechanism cannot be shipped reliably.

---

## DEC-007 — React Native + Native iOS Where Required

**Status:** Accepted in principle; exact implementation to be validated in Phase 03.

React Native / Expo should handle the majority of cross-platform application UI and business logic.

Native iOS code may be used where required for:

- Family Controls
- Managed Settings
- Device Activity
- Screen Time extensions
- post-MVP Apple Vision R&D, if explicitly approved
- other iOS-specific capabilities

Final architecture will be locked after feasibility testing.

---

## DEC-008 — MVP Avoids Unnecessary Scope Expansion

**Status:** Accepted

The MVP will not add unrelated functionality simply because it is technically possible.

Examples currently outside MVP include:

- friends
- leaderboard
- community
- XP / coins
- large exercise library
- nutrition
- detailed form correction
- cloud video analysis

Product scope changes require an explicit product decision rather than silent implementation.

---

## DEC-009 — Latest Decisions Override Earlier Planning Documents

**Status:** Accepted

When project documents or previous planning discussions conflict, the latest explicitly accepted decision takes precedence.

Decision priority:

1. Latest explicitly accepted project decision
2. Final decisions from Phase 02 — MVP Scope
3. Phase 01 — Master Product Plan
4. Earlier brainstorming and examples

Examples shown in older planning documents must not be treated as implementation requirements when they have been superseded.

In particular, routine structure, movement count, sets, repetitions, difficulty, lock behavior, trial flow, and similar MVP details must follow the final Phase 02 decisions.

DEC-021 updates the current daily training structure to:

- exactly 1 movement per day;
- that daily movement is performed for exactly 5 sets;
- typically 15–20 repetitions per set;
- exactly 20 seconds rest between sets;
- exact repetition targets and cadence are determined later on a
  movement-by-movement basis;
- no universal total session duration.

Do not silently revive superseded requirements.

---

## DEC-010 — Apple Developer Membership May Start as Individual

**Status:** Superseded by DEC-022

Technical development may begin under an **Individual Apple Developer Program** membership if company formation is still in progress.

If the intended App Store seller is the future company, the preferred path is to convert the same membership to an **Organization** before public commercial App Store launch.

Company formation, D-U-N-S, tax, banking, and other commercial setup should run in parallel and must not unnecessarily block Phase 03 technical feasibility work.

### Reason

Family Controls and other Apple-specific technical validation should begin early, while commercial legal-entity setup can proceed separately.

---

## DEC-011 — Commercial Apple Setup Follows Organization Conversion

**Status:** Superseded for the first launch by DEC-022

Unless there is a specific development need to do otherwise, the preferred commercial sequencing is:

Organization conversion

→ Paid Apps Agreement

→ required tax information

→ company banking

→ App Store Small Business Program

→ paid public launch.

Do not create duplicate commercial setup under a temporary individual legal identity merely for speed.

### Reason

The intended company should own the commercial seller relationship and receive App Store proceeds.

---

## DEC-012 — App Store Release Readiness Is Cross-Phase Work

**Status:** Proposed — Pending Owner Approval

App Store readiness is not deferred until Phase 16.

Whenever a phase introduces or changes any of the following:

- Apple capability / entitlement;
- native target or extension;
- permission;
- SDK or external service;
- collected/stored/shared data;
- account/login/deletion behavior;
- subscription/paywall/trial behavior;
- App Store metadata or reviewer flow;

the relevant release checklist and risk register must be reviewed and updated during the same phase.

### Principle

A feature is not release-ready merely because it works locally.

---

## DEC-013 — Account Creation Requires In-App Account Deletion for Release

**Status:** Proposed — Pending Owner Approval

The Phase 02 decision remains:

the user's first full product experience should not be blocked by forced account creation.

If the released MVP supports account creation, it must also support a clear in-app **Delete Account** flow.

If Sign in with Apple is used, required authorization/token revocation must be handled during deletion where applicable.

This is a release requirement and does not authorize changing the Phase 02 login timing.

---

## DEC-014 — Restore Purchases Is an MVP Release Requirement

**Status:** Proposed — Pending Owner Approval

Because the MVP uses auto-renewable subscriptions, the released app must provide a clear and functional **Restore Purchases** path.

Local StoreKit success alone is not sufficient evidence that subscription implementation is release-ready.

Before App Store submission, the purchase / entitlement flow must be validated through real Sandbox/TestFlight scenarios including restoration and relevant expired/reinstall recovery paths.

---

## DEC-015 — SDK Changes Trigger Privacy and Release Review

**Status:** Proposed — Pending Owner Approval

Adding or changing a third-party SDK is not treated as only a coding dependency change.

Before shipping an SDK change, review as applicable:

- data collected / shared;
- permission impact;
- App Privacy labels;
- `PrivacyInfo.xcprivacy`;
- Required Reason APIs;
- third-party privacy manifest/signature requirements;
- secrets / credentials;
- Terms / Privacy Policy impact.

Codex must not silently add analytics, attribution, authentication, advertising, crash-reporting, or similar SDKs without explaining these impacts.

---

## DEC-016 — Guideline 4.10 Does Not By Itself Change the Locked Subscription Model

**Status:** Proposed — Pending Owner Approval

Apple Guideline 4.10 explicitly names the camera and Screen Time APIs in its restriction on monetizing built-in hardware, operating-system capabilities, and Apple services or technologies.

Existing approved paid apps integrating these capabilities suggest that they can be part of a paid product in practice. Apple does not provide an explicit safe harbor for the Men's Discipline implementation or monetization structure, so this remains an App Review and packaging risk.

Do not redesign the locked 3-day-trial + subscription model or create a free Screen Time/camera tier solely on the basis of Guideline 4.10.

Before submission, review the final paywall, metadata, value proposition, and Review Notes specifically for this risk. Do not state or imply that presenting the subscription as a complete proprietary experience guarantees approval.

If App Review raises a concrete concern, address the specific review issue and record any resulting product decision explicitly.

---

## DEC-017 — Reviewer Testability Is a Release Gate

**Status:** Proposed — Pending Owner Approval

Before App Store submission:

- important paid functionality must be reachable and testable;
- Family Controls setup must be reproducible;
- Review Notes must explain non-obvious setup and the core flow;
- demo credentials must be supplied if required;
- subscription purchase/restore behavior must work in the review environment.

A feature that the reviewer cannot reasonably reach or reproduce is not considered release-ready.

---

## DEC-018 — Working Company, Brand, Namespace, and Bundle Identity

**Status:** Accepted

The current project identity is:

- umbrella company / working company name: **Temperline Labs**;
- consumer-facing umbrella brand: **TEMPERLINE**;
- developer namespace: `temperline`;
- iOS main-app Bundle ID: `com.temperline.mensdiscipline`.

**Men's Discipline** remains a working product and display name. It may change during later branding work without changing the accepted developer namespace or Bundle ID.

Temperline Labs is the selected working umbrella/company name. This decision does not state or imply that a legal entity named **Temperline Labs Inc.** has already been incorporated. Formal name clearance, registration, incorporation, and related business actions remain part of the separate business-readiness track.

### Reason

A stable developer namespace and Bundle ID are required for Apple identifiers, native targets, capabilities, and technical validation, while the consumer-facing product name can remain flexible until later branding work.

---

## DEC-019 — Expo CNG Is the Working Native-Project Strategy

**Status:** Accepted in principle; Family Controls and App Extension requirements must be validated during Phase 03.

For the current architecture, use Expo Continuous Native Generation (CNG) as the working native-project strategy.

- `/ios` and `/android` remain generated and ignored.
- Reproducible native configuration should be expressed through Expo app configuration, config plugins, and native modules rather than relying on untracked manual edits inside generated native directories.
- Manual changes inside generated `/ios` or `/android` directories are not a durable source of truth and may be overwritten when native projects are regenerated.
- The architecture must be technically validated against the upcoming Family Controls, Screen Time, and App Extension requirements before it is treated as irreversible.

### Reason

CNG keeps the official application baseline reproducible while native iOS feasibility is still being established. Family Controls may require native targets or extension configuration that changes the final React Native ↔ native iOS boundary, so the current strategy remains subject to evidence from the Phase 03 technical spike.

---

## DEC-020 — Tolerant Automatic Rep Counting With Non-Blocking Assisted Completion

**Status:** Superseded for MVP by DEC-021; retained as Phase 03.9 historical context

At the time it was accepted, this decision made tolerant automatic repetition
counting the proposed normal path and required a non-blocking assisted-completion
fallback. It specified movement-specific minimum joints, smoothing, preserved
counts through short tracking loss, calm framing guidance, and recovery that
could not trap an honest user in the locked state.

Phase 03.9 subsequently demonstrated why this mitigation was insufficient for
the daily MVP experience: framing and calibration themselves remained too
brittle. DEC-021 supersedes the complete Camera/automatic-counting/assisted-
completion path for MVP. The old rules remain relevant only if Camera/Vision R&D
is explicitly reopened after MVP.

### Reason

The original reason was that a false negative has unusually high cost when
training completion controls access to selected apps. The accepted pivot removes
that false-negative source from MVP rather than adding another proof workaround.

### Principle

**Verify when possible. Recover when necessary. Never let tracking failure become a lockout.**

---

## DEC-021 — MVP Uses Guided Cadence Training, Not Camera Verification

**Status:** Accepted

Phase 03.9 demonstrated that on-device AVFoundation + Apple Vision can produce
derived pose observations and count a representative Kneeling Drive pattern.
The mandatory MVP user experience was rejected because normal movement causes
critical joints to leave frame, partial-body framing remains brittle, landscape
side view performs materially better than portrait, front/near-front is
unreliable, and calibration/framing adds too much daily friction.

Camera / Apple Vision repetition counting is therefore not an MVP user feature,
release requirement, or completion path. The MVP must not replace it with manual
tapping, hardware-volume-button counting, or another counting workaround.

The accepted MVP training path is:

Movement demonstration

→ countdown

→ guided repetitions

→ set completion

→ 20-second rest

→ next set

→ routine completion

→ accountability satisfied / selected apps unlocked.

The daily structure is locked as:

- exactly one movement per day;
- exactly five sets;
- typically 15–20 repetitions per set, with the exact target defined separately
  for each movement;
- exactly 20 seconds of rest between sets;
- movement-specific cadence/tempo defined with each movement and Coach asset;
- no universal repetition target, cadence, or total session duration across all
  seven movements.

The app guides the session but does not attempt to cryptographically or visually
prove every repetition. Camera/Vision may be reconsidered only as an explicit
post-MVP R&D initiative. The Phase 03.9 source and findings remain in Git history
and technical documentation; no unfinished Camera beta may be exposed in MVP.

### Reason

Technical capability alone did not meet the daily usability and reliability bar
for an accountability product. Guided cadence preserves the intended training
structure and low-friction daily habit while avoiding false negatives and camera
setup overhead.

---

## DEC-022 — First Launch Uses the Current Individual Membership

**Status:** Accepted owner override

The first public launch remains under the current Apple Developer Individual
membership. Company incorporation and Individual → Organization conversion are
deferred. Neither is a Phase 03 exit criterion nor a first-launch blocker.

DEC-010 and DEC-011 remain historical context for a possible future company
transition, but their pre-launch Organization preference and sequencing no
longer govern the first launch. Do not reopen the company/Organization decision
during technical phases unless the owner explicitly changes this decision or an
external Apple requirement creates a concrete blocker.

### Reason

The owner chose to keep the verified current Apple account path for the first
launch and defer legal-entity conversion rather than make it a dependency of
MVP engineering and release readiness.
