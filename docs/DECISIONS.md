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

**Status:** Accepted

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

---

## DEC-004 — Verify, Don't Judge

**Status:** Accepted

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
2. Camera / pose detection
3. Rep counting
4. Lock → Routine → Unlock integration

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
- Apple Vision integration
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

The final Phase 02 MVP Scope defines the current daily training structure:

- exactly 1 movement per day;
- that daily movement is performed for approximately 5 sets;
- approximately 15–20 repetitions per set;
- approximately 20 seconds rest between sets;
- exact repetition targets will be determined later on a movement-by-movement basis.

Do not silently revive superseded requirements.
