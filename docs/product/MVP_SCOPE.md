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
- Pose detection adapters
- iOS extensions
- Apple-specific authentication

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

**7 movements**

A cycle contains all seven movements.

Within one cycle:

**a movement must not repeat after it has been completed.**

---

## Daily Card Draw

Home contains a daily movement card draw.

At the beginning of a cycle:

7 movement cards are available.

Each day:

1. Home randomly selects one movement from the remaining cards.
2. That movement becomes today's movement.
3. After the user completes it, the card is removed from the current cycle.
4. The next day is drawn only from the remaining cards.
5. After all seven movements are completed, a new cycle begins with all seven cards available again.

Therefore:

**Random within the cycle, but no repeats within the cycle.**

---

# 5. Sets, Repetitions and Rest

The daily movement is performed for approximately:

**5 sets**

Each set contains approximately:

**15–20 repetitions**

Rest between sets is approximately:

**20 seconds**

Exact repetition targets are NOT yet globally locked.

They will be determined later on a movement-by-movement basis.

Do not automatically assign the same repetition target to all seven movements.

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

# 8. Camera and Motion Tracking

Camera-assisted motion tracking is part of the MVP.

Its purpose is to:

- confirm that the user is actually performing the movement;
- count repetitions;
- determine basic completion.

The camera system should NOT become a strict form-correction coach.

Core principle:

**Verify, don't judge.**

---

## Camera Should Do

The system may determine:

- whether a person is visible;
- whether general movement is occurring;
- whether the expected movement pattern is broadly present;
- repetition count;
- movement completion.

---

## Camera Should Not Do

The MVP should not provide:

- detailed form scores;
- precise biomechanical scoring;
- centimeter-level correction;
- aggressive error messages;
- detailed posture coaching;
- competitive performance ratings.

---

# 9. Camera Privacy

Camera processing should remain on device whenever technically practical.

The MVP should NOT normally:

- upload training videos;
- store camera recordings;
- send video to cloud generative AI systems.

Preferred architecture:

Camera

→ On-device pose / motion detection

→ Derived body landmarks

→ Rep counting / completion logic

→ Discard camera frames

Persist only the minimum information required for product functionality.

Example:

- movement completed;
- repetition count;
- session completion;
- session date.

Privacy is a core product requirement.

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

Current MVP bottom navigation direction:

- **Locks**
- **Home**
- **Me**

This navigation structure is currently tentative rather than permanently locked.

It may be refined during UX Architecture if necessary.

Any major restructuring should still be discussed before implementation.

---

# 19. First Free Experience

The user's first complete routine should be available as:

**one full free experience**

The user should be able to understand the core product value before being required to start a subscription trial.

This first experience should demonstrate the core loop as much as practical.

---

# 20. Trial

After the first complete free routine experience, the monetization flow uses:

**3-Day Free Trial**

Do not silently change this to:

- 7 days;
- 14 days;
- another trial duration.

The three-day trial was selected intentionally.

---

# 21. Subscription Structure

The planned MVP subscription options are:

- Monthly
- 3-Month
- Annual

Exact pricing is not locked yet.

RevenueCat is planned for subscription entitlement management.

RevenueCat integration belongs to the later monetization implementation phase rather than the initial technical proof of concept.

---

# 22. Account Flow

Account creation must NOT be forced as the first thing the user sees when opening the app.

The user should first be able to experience the product.

After the first experience, the user should be encouraged to:

**save progress**

through account creation / sign-in.

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

- exact repetition target for each movement;
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
- exact motion-detection thresholds.

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

**7 movements.**

---

## Older Routine Duration Examples

Older examples such as a generic:

**4–7 minute / 3-movement routine**

are not implementation requirements.

The current structure is defined by:

- one movement per day;
- approximately five sets;
- approximately 15–20 reps per set;
- approximately 20 seconds rest between sets.

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

approximately five sets

→

camera verifies movement and counts reps

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

after all seven movements are completed, a new cycle begins.

---

# 31. MVP Implementation Principle

When implementing this scope:

**Do not optimize the product by silently changing the product.**

Technical feasibility work should answer:

> Can the locked product behavior be implemented reliably?

If the answer to a specific requirement appears to be no:

document the technical constraint first and discuss the product tradeoff before changing scope.
