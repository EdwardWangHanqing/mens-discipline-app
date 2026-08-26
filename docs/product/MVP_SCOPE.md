# Men's Discipline App — MVP Scope v1.0

**Status:** Locked

**Phase:** 02 — MVP Scope

**Purpose:** Authoritative MVP requirements for implementation

---

# 1. Source of Truth

This document contains the final locked decisions from Phase 02 — MVP Scope.

If this document conflicts with:

- `MASTER_PRODUCT_PLAN.md`
- earlier product discussions
- old examples
- previous technical assumptions

this document takes precedence.

Do not change locked MVP decisions without explicit approval from the project owner.

If a technical limitation requires changing a locked product decision:

1. Explain the technical limitation clearly.
2. Explain which locked decision is affected.
3. Propose possible alternatives.
4. Get explicit approval before changing the product behavior.

Do not silently redesign the product.

---

# 2. Product Definition

The product is:

**Men's Performance + Accountability**

It is not primarily:

- a general fitness app;
- a traditional Screen Time app;
- a Kegel-only app;
- a habit tracker;
- a medical treatment app.

The core experience combines:

1. short private men's performance training;
2. accountability through entertainment app restrictions;
3. momentum and positive reinforcement.

Core product principles:

- Private
- Calm
- Masculine
- Disciplined
- Premium
- Intentional

Core copy direction:

- **Train what most men ignore.**
- **Built to keep you honest.**
- **No routine. No scroll.**
- **You showed up.**

---

# 3. Platform Strategy

## MVP

**iOS first.**

Android is not part of the first implementation.

However, architecture should avoid unnecessary iOS-only coupling when business logic can remain platform independent.

Platform-specific functionality may use native implementations.

Expected platform-specific areas include:

- App Lock / Screen Time
- iOS extensions
- Apple-specific authentication

Camera / pose detection is not part of the MVP. A platform pose adapter remains
only a possible post-MVP R&D concern.

Shared business logic should remain reusable where practical.

---

# 4. Daily Training Structure

## One Movement Per Day

Each day trains exactly:

**1 movement**

The user does not perform several different movements in the same daily routine.

---

## Movement Library

The MVP movement library contains:

**10 movements**

A seven-day cycle contains seven unique movements sampled from the full pool.

Within one cycle:

**a movement must not repeat after it has been completed.**

---

## Daily Card Draw

Home contains a daily movement card draw.

At the beginning of a cycle, seven unique movements are randomly sampled from
the ten-movement pool and ordered for the cycle.

Each day:

1. Home reveals the movement already assigned to the current cycle day.
2. That movement becomes today's movement.
3. The result is persisted and cannot reroll after relaunching the app.
4. The next daily session advances to the next unique movement in the cycle.
5. After day seven, a new random seven-movement cycle is sampled from the full
   ten-movement pool.

Therefore:

**Random within the cycle, but no repeats within the cycle.**

---

# 5. Sets, Repetitions and Rest

The daily movement is performed for exactly:

**5 sets**

Each set contains exactly:

**12, 15, 16, or 20 guided repetitions, depending on the movement**

Rest between sets is exactly:

**20 seconds**

Repetitions and cadence are both movement-specific and are locked by DEC-025.
Do not assign one universal repetition target, cadence, or total duration.

---

# 6. Movement Demonstration

Training is demonstrated by a:

**Minimal Male Coach**

The coach should communicate movement clearly without feeling like a traditional gym instructor.

The visual direction remains:

**WHOOP × Apple Fitness × Arc'teryx × premium men's skincare**

The intended result is not to copy these brands.

The intended qualities are:

- restrained;
- premium;
- private;
- masculine;
- calm;
- clear.

---

# 7. Replace Movement

The user must have the ability to:

**Replace Movement**

for the current daily movement.

This is different from skipping the entire day.

Detailed replacement rules and UX may be refined later.

Do not remove this capability from the MVP without explicit approval.

---

# 8. Guided Cadence Training

Camera / Apple Vision repetition counting is not an MVP user feature, release
requirement, or completion path.

The MVP training sequence is:

Movement demonstration

→ countdown

→ guided repetitions

→ set completion

→ 20-second rest

→ next set

→ routine completion

→ accountability satisfied / unlock.

The app guides the user through the shared 20-rep target and movement-specific
tempo. MVP does
not attempt to cryptographically or visually prove every repetition was
performed. Do not replace Camera/Vision with manual tapping,
hardware-volume-button counting, or another counting workaround.

Set transitions, the rest timer, and routine completion must be clear and
reliable. Cadence values, Coach assets,
audio behavior, and final visual progress treatment remain later decisions.

---

# 9. Camera Privacy and Future R&D Boundary

The MVP does not request camera permission, capture training video, or use pose
landmarks for completion. Persist only the minimum training/accountability data
required by the product, such as movement, configured repetition target, session
completion, and session date.

If Camera/Vision is explicitly revisited after MVP, raw frames must remain on
device and must not be stored or uploaded by default. That future work requires a
new permission, privacy, release, and usability review.

---

# 10. Entertainment App Selection

During onboarding, the user chooses which entertainment apps they want the product to restrict.

The product must not automatically decide which apps are distracting.

The user controls the selection.

Examples may include:

- TikTok
- Instagram
- Reddit
- X
- YouTube
- games
- other entertainment apps

---

# 11. Daily Lock Time

The user sets a:

**daily recurring Lock Time**

The selected entertainment apps should become restricted according to this daily accountability schedule when today's required training has not been completed.

The Lock Time repeats daily.

The MVP should not require the user to manually recreate the schedule every day.

---

# 12. Proactive Completion

The user is allowed to complete today's routine before the scheduled Lock Time.

If today's routine is completed before the Lock Time:

**the selected apps should not become locked later that day.**

The app should provide restrained positive reinforcement for proactive completion.

The emotional direction should be:

- disciplined;
- calm;
- satisfying;

not loud or game-like.

---

# 13. Grace Extensions

The MVP includes:

**3 grace extensions per day**

Each grace extension lasts:

**5 minutes**

These exist as a limited escape mechanism rather than unlimited bypass.

Detailed UX and exact friction may be refined later.

The core limit remains:

**3 × 5 minutes per day.**

---

# 14. Skip Today

The MVP includes:

**Skip Today**

This is an emergency escape mechanism.

Skip Today should contain moderate friction so that it is available when genuinely needed but does not become the default behavior.

When the user uses Skip Today:

**the day does not count toward the user's streak.**

Detailed friction UX will be designed later.

Do not remove the escape mechanism or make it frictionless without an explicit product decision.

---

# 15. Completion and Unlock

The core accountability relationship remains:

Training completion

→ accountability requirement satisfied

→ selected entertainment apps become available.

If the routine was already completed before Lock Time:

the apps should remain available for that day.

Completion feedback should remain restrained.

Key completion copy direction:

**You showed up.**

---

# 16. Momentum / Progress

Momentum is a core MVP feature, not a post-MVP extra.

The MVP includes:

### Current Streak

Current consecutive qualifying completion days.

### Longest Streak

The user's historical longest streak.

### Total Sessions

Total completed training sessions.

This should not disappear when a streak breaks.

### Calendar

A visual record of completed and missed days.

### Milestones

Simple progress milestones based on consistency / completed sessions.

The presentation should remain premium and restrained rather than game-like.

---

# 17. Home

The Home experience is centered around:

1. Momentum
2. Calendar / consistency context
3. Today's Card Draw

Today's movement should feel like the primary actionable item.

Home should not turn into a general fitness dashboard full of:

- calories;
- heart rate;
- gym statistics;
- unrelated fitness metrics.

---

# 18. Navigation

Final Phase 04 primary navigation:

- **Home**
- **Train**
- **Locks**

Home contains Today, Momentum, and accumulated progress. Train contains
training preparation and the guided session. Locks contains accountability
configuration, current lock state, Grace, and Skip. Profile / Settings is
entered from Home's upper-right entry.

This structure is locked by the Phase 04 closure decision and must not be
replaced by an older navigation model during Phase 05 visual work.

---

# 19. First Free Experience

The user's first complete routine should be available as:

**exactly one full free daily routine**

The first routine is production-shaped: exactly one movement, exactly five
sets, movement-specific guided repetitions and cadence, exactly four 20-second rests, and
Set 5 → completion. It is not a shortened tutorial workout.

The user should be able to understand the core product value before being required to start a subscription trial.

This first experience should demonstrate the core loop as much as practical.

---

# 20. Trial

After the first complete free routine and account creation/sign-in, the
monetization flow uses:

**3-Day Free Trial**

Do not silently change this to:

- 7 days;
- 14 days;
- another trial duration.

The three-day trial was selected intentionally. A user may decline account
creation and return to a limited Home state, but cannot start Trial / Subscription
until signed in.

---

# 21. Subscription Structure

The locked MVP subscription options are:

- Monthly
- Annual

Reference pricing is USD $9.99/month and USD $39.99/year. Annual is the default
recommended selection. The 3-Month plan is removed.

RevenueCat is planned for subscription entitlement management.

RevenueCat integration belongs to the later monetization implementation phase rather than the initial technical proof of concept.

---

# 22. Account Flow

Account creation must NOT be forced as the first thing the user sees when opening the app.

The user should first be able to experience the product.

After the first complete routine, the user should be encouraged to:

**save progress**

through account creation / sign-in.

The user may continue viewing locally earned Momentum, Calendar/history, Total
Sessions, Cycles Completed, Longest Streak, and the finalized Day 1 outcome
without an account. New daily training and Trial/Subscription require an
account; do not repeatedly force the account screen on app open.

---

# 23. MVP Sign-In Priority

Preferred MVP authentication options:

1. Continue with Apple
2. Continue with Google
3. Continue with Email

Phone OTP is:

**not a first-priority MVP authentication method.**

Do not add Phone OTP simply for feature completeness.

---

# 24. Account Data and Cross-Device Restore

After the user signs in, important product state must be capable of being restored across devices.

This includes at minimum:

- training history;
- Current Streak;
- Longest Streak;
- Total Sessions;
- Calendar progress;
- current movement cycle progress;
- completed cards within the current cycle;
- other account-linked settings required for continuity.

A user should not permanently lose important progress simply because they reinstall the app or move to another device after signing in.

The exact backend provider is not yet locked.

---

# 25. Release-Critical MVP Requirements

The following items are release requirements when the corresponding functionality exists in the MVP.

They do not change the locked product loop.

They are implemented and validated in the relevant later account and monetization phases. They are not part of the Phase 03 technical-feasibility exit scope.

## Restore Purchases

Because the MVP uses auto-renewable subscriptions, the released app must provide a clear and functional:

**Restore Purchases**

path.

Subscription access must be recoverable after reinstall and on another device where the user's valid App Store purchase can be restored.

Detailed RevenueCat / StoreKit implementation belongs to the monetization phase.

Restore Purchases re-checks and restores an existing valid App Store purchase
entitlement after reinstall, device change, or entitlement reconciliation. It
does not restart an expired subscription or undo a cancellation. A cancelled
auto-renewing subscription remains entitled until its paid-through expiration.

No active training entitlement means no active accountability lock. Closing the
paywall does not grant ongoing free daily training.

## In-App Account Deletion

If the MVP allows users to create an account, the released app must also provide a clear in-app method to:

**Delete Account**

and initiate deletion/anonymization of associated account data according to the final privacy/data-retention design.

If Sign in with Apple is implemented, account deletion must include the required Apple authorization/token cleanup where applicable.

These are release-compliance requirements and must not be removed merely to simplify implementation.


---

# 26. Brand and UI Direction

The existing brand direction remains:

- Private
- Calm
- Masculine
- Disciplined
- Premium
- Intentional

Visual design inspiration remains:

**WHOOP × Apple Fitness × Arc'teryx × premium men's skincare**

This describes the intended design qualities.

It does not authorize copying another company's visual assets or interface.

---

# 27. MVP Explicitly Does Not Include

Unless a later explicit decision changes this, MVP does not include:

- Android release;
- camera / Apple Vision repetition counting or pose verification;
- manual-tap, hardware-button, or similar proof/counting workarounds;
- detailed form correction;
- detailed movement scoring;
- cloud video analysis;
- saving user training videos by default;
- friends system;
- leaderboard;
- community;
- XP / coins;
- large gamification systems;
- nutrition tracking;
- general gym workout features;
- Phone OTP as a primary authentication method;
- 7-day trial.

---

# 28. Important Details Still To Be Finalized

The following are not permission for Codex to invent answers.

They are intentionally pending later decisions or technical validation:

- exact cadence/tempo for each movement;
- detailed Skip Today friction;
- detailed Grace Extension UX;
- detailed Replace Movement behavior;
- final animation assets;
- exact milestone thresholds / names where not already finalized;
- final subscription pricing;
- final authentication / backend provider;
- final database architecture;
- exact Home visual layout;
- final navigation structure;
- exact implementation of cross-device sync;
- final audio/haptic behavior;
- final visual progress animation/treatment.

When one of these details becomes necessary:

**ask or follow the appropriate future project phase rather than inventing product behavior.**

---

# 29. Superseded Earlier Examples

The following earlier examples must NOT be treated as current MVP requirements.

## Multiple Movements Per Day

Older planning examples described routines containing multiple movements in one day.

This has been superseded.

Current MVP:

**1 movement per day.**

---

## Older Movement Library Size

Older planning discussed approximately five core movements plus a candidate movement.

This has been superseded.

Current MVP:

**10 movements, with seven unique movements sampled per cycle.**

---

## Older Routine Duration Examples

Older examples such as a generic:

**4–7 minute / 3-movement routine**

are not implementation requirements.

The current structure is defined by:

- one movement per day;
- exactly five sets;
- movement-specific guided reps and cadence from DEC-025;
- exactly 20 seconds rest between sets.

Exact duration will depend on the movement.

---

## Older Simplified Lock Model

Older planning described the accountability system mainly as:

complete today's routine → unlock.

The principle remains valid, but the MVP behavior is now more specific and includes:

- a recurring daily Lock Time;
- proactive completion before Lock Time;
- three daily 5-minute Grace Extensions;
- Skip Today;
- Replace Movement.

Implementation must follow the newer Phase 02 behavior.

---

# 30. MVP Product Loop

The current MVP loop is:

User selects distracting apps

→

User establishes recurring Lock Time

→

Home draws today's movement from remaining cycle cards

→

User may complete proactively before Lock Time

OR

selected apps become restricted at Lock Time

→

User performs today's single movement

→

views the movement demonstration and countdown

→

completes five guided sets using that movement's repetition target and cadence

→

rests 20 seconds between sets

→

routine completes

→

selected apps become available for the day

→

Momentum / streak / session / calendar / cycle progress update

→

completed movement card leaves the current cycle

→

next day draws from remaining cards

→

after the seventh daily session, a new seven-movement sample is drawn from the
ten-movement library.

---

# 31. MVP Implementation Principle

When implementing this scope:

**Do not optimize the product by silently changing the product.**

Technical feasibility work should answer:

> Can the locked product behavior be implemented reliably?

If the answer to a specific requirement appears to be no:

document the technical constraint first and discuss the product tradeoff before changing scope.
