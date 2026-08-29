# Men's Discipline App — Phase 04 UX Design Handoff v1.0

> **2026-08-25 owner override:** DEC-025 and the supplied Movement Pool / VAEL
> startup specifications supersede this document wherever it refers to a
> seven-movement library, universal 20-rep sets, the former customer-facing
> name, or an unspecified launch treatment. The navigation and product-flow
> architecture in this handoff remain authoritative.

> **2026-08-28 owner override:** DEC-026 and the current onboarding work package
> supersede this document wherever it permits a first free routine, optional
> account creation, a signed-out limited Home, or a closable Paywall. Current
> first-run order is Onboarding → Required Account → Required Paywall → Active
> Entitlement → Home. Monthly has no trial; Annual alone has a 3-Day Free Trial.

**Date:** 2026-08-22  
**Status:** Authoritative Phase 04 UX handoff for Phase 05 Visual System / Figma Design System  
**Current accepted main checkpoint:** `9a0d9ffcd6887bb64525a0b8933f7edf3efd0c58`

> This document consolidates the final accepted Phase 04 UX architecture into one design-facing source of truth.
>
> It exists so Figma / Codex / future implementation work does not need to reconstruct UX behavior from chat history.
>
> **Phase 05 may explore visual expression. It must not redesign the behavior defined here.**

---

# 0. Authority and Precedence

Use the latest accepted project decisions when sources conflict.

For the UX material consolidated here, precedence is:

1. latest Owner decision;
2. Project Memory Update **v1.7**;
3. v1.6 where not superseded by v1.7;
4. v1.5 where not superseded by v1.6/v1.7;
5. v1.4 where not superseded by later updates;
6. `docs/DECISIONS.md`;
7. `docs/product/MVP_SCOPE.md`;
8. older product examples.

Important supersessions already reflected in this document:

- Phase 04 is **Closed / Passed**.
- Primary navigation is **Home | Train | Locks**.
- Camera / Apple Vision is not part of MVP.
- The first complete product experience requires **no account**.
- After the first full free routine, an account/sign-in is **required before starting Trial / Subscription**.
- Subscription structure is **Monthly USD $9.99** and **Annual USD $39.99** only.
- Annual is default/recommended.
- 3-Month plan is removed.
- No active training entitlement means no active accountability lock.
- All seven movements use exactly **5 sets × 20 guided reps**; older
  movement-specific-rep and `18 reps` examples are superseded by DEC-024.

---

# 1. Product and UX Principles

## 1.1 Product positioning

Men's Discipline is:

> **Men's Performance + Accountability**

It is not primarily:

- a generic fitness dashboard;
- a screen-time utility;
- a habit tracker;
- a Kegel-only app;
- a medical treatment product;
- a gamified XP/coin system.

Brand direction remains:

> **Private · Calm · Masculine · Disciplined · Premium · Intentional**

Core copy direction:

> **Train what most men ignore.**  
> **Built to keep you honest.**  
> **No routine. No scroll.**  
> **You showed up.**

## 1.2 System principle

> **One daily state. Three views of the same truth.**

Home, Train, and Locks must share the same underlying truth for:

- today's movement;
- Reveal state;
- cycle progress;
- session progress;
- Replace quota;
- completion/skipped outcome;
- accountability state;
- Grace state;
- clear/locked state.

No tab may invent its own conflicting state.

## 1.3 Training principle

> **The user follows. The app manages the session.**

The guided session should reduce workout-management burden rather than create it.

## 1.4 Recovery principle

> **Strict about completion, forgiving about interruption.**

Interruptions may pause or preserve checkpoints, but may never silently grant completion.

## 1.5 Copy principle

> **Explain once. Then get out of the way.**

Tone should be calm and concise, not punitive or guilt-driven.

---

# 2. Primary Navigation

Bottom navigation is locked as:

> **Home | Train | Locks**

Responsibilities:

### Home
Today + Momentum + accumulated progress.

### Train
Training preparation + guided session.

### Locks
Accountability configuration + current lock state + Grace / Skip.

### Profile / Settings
Accessed from the **top-right of Home**.

Profile is not a fourth bottom-navigation tab.

---

# 3. Core Training Structure

MVP daily training is locked as:

- exactly **1 movement per day**;
- exactly **5 sets**;
- exactly **20 guided reps per set** for all seven movements;
- cadence/tempo is movement-specific;
- exactly **20 seconds rest between sets**;
- exactly **four rests**;
- Set 5 transitions directly to Completion;
- no fifth rest;
- no Camera / Vision verification;
- no manual-tap counting workaround;
- no hardware-button counting workaround.

Guided flow:

> **Preparation → Countdown → Set 1 → Rest → Set 2 → Rest → Set 3 → Rest → Set 4 → Rest → Set 5 → Completion**

The displayed rep position, e.g. `8 / 20`, represents guided position in the cadence, not verified real-world repetition count.

---

# 4. Seven-Movement Cycle / Daily Reveal

## 4.1 Cycle semantics

The movement library contains 7 movements.

The cycle is:

> **random without repeat until all seven are completed**

Only full routine completion consumes a movement from the current cycle.

Definitions:

- **1 completed session** = one full daily routine, all 5 sets completed.
- **1 completed cycle** = all 7 different movements completed.

Cycle is not a fixed seven-calendar-day program.

Use:

> `4 of 7 completed`

Do not use:

> `Day 4 of 7`

## 4.2 Daily movement selection

Core principle:

> **The system draws. The user reveals.**

The system determines today's movement before the user reveals it.

Reveal only exposes the already-determined movement.

Therefore:

- Home is the primary Reveal entry.
- Train is a valid backup Reveal entry.
- Reveal state is global.
- Revealing in either location reveals the same movement everywhere.
- Normal Reveal does not reroll.
- Replace Movement is the only deliberate movement-change exception.

## 4.3 Cycle rollover

When the final remaining movement is completed:

- the current day remains `7 of 7 completed`;
- a restrained Cycle Complete recognition may occur;
- no second movement is drawn on the same day;
- the next local day begins a new cycle with the full movement pool.

---

# 5. Home — Final UX Architecture

## 5.1 Home purpose

Home is the default landing page.

Home should feel like:

> **What matters today + accumulated proof of consistency.**

Hierarchy:

> **Header → Momentum Hero → Today's Movement → Monthly Calendar → Lifetime Progress → Bottom Navigation**

Do not turn Home into a generic fitness dashboard.

Do not add:

- calories;
- heart rate;
- fake performance scores;
- XP;
- levels;
- screen-time-saved metrics;
- content feed;
- permanent referral promotion;
- permanent Next Milestone progress bars.

---

# 6. Home Header

Greeting uses device local time + nickname.

Accepted greeting set:

- `Good morning, [nickname].`
- `Good afternoon, [nickname].`
- `Good evening, [nickname].`

Accepted time direction:

- Morning: 05:00–11:59
- Afternoon: 12:00–16:59
- Evening: 17:00–04:59

Do not use `Good night`.

Profile / Settings entry is in the top-right.

Nickname is not legal name and is gathered during onboarding.

---

# 7. Momentum Hero

Core principle:

> **Momentum = emotional presentation**  
> **Progress = factual statistics**

## 7.1 First-ever / no completed history

Do not show a giant punitive:

> `0 DAYS OF MOMENTUM`

Use:

> **Momentum starts here.**

Accepted supporting direction:

> `Show up once. Then build from there.`

## 7.2 Active streak

Example:

> **12**  
> **DAYS OF MOMENTUM**

Do not duplicate Longest Streak inside the hero.

## 7.3 Broken streak, today still actionable

Use restart/rebuild framing:

> **Momentum starts again today.**

Supporting direction:

> `One session gets it moving again.`

## 7.4 Skipped today with prior completed history

> **Momentum starts again tomorrow.**

## 7.5 First tracked day skipped with no completed history

Do not write `again`.

Use:

> **Momentum starts tomorrow.**

On the following day, if the user still has no completed routine history:

> **Momentum starts here.**

---

# 8. Home — Today's Movement States

## 8.1 Unrevealed

Visible direction:

> **TODAY'S MOVEMENT**  
> `Your movement is ready.`  
> **Reveal**

Before lock:

> `Complete before [Lock Time]`

When already locked:

> `Complete today's movement to unlock.`

No Apps Selected:

- Home does not need to show a lock deadline.

Family Controls unavailable:

- Home may show lightweight contextual `Locks unavailable`;
- Locks owns the repair experience.

## 8.2 Revealed

Show:

- movement name;
- movement visual / thumbnail / Coach preview;
- `5 sets · 20 reps`;
- `X of 7 completed`;
- **Begin**;
- contextual accountability status.

Home `Begin` goes directly into immersive Train preparation / movement demonstration.

Do not do:

> Home Begin → Train tab → second Start button

## 8.3 Recoverable session

Show:

- `X of 5 sets completed`;
- **Resume**.

## 8.4 Completed

Show:

> **Completed today**  
> **You showed up.**

Begin disappears.

## 8.5 Skipped

Show:

> **Skipped today**

Neutral treatment.

Do not use:

- Failed;
- red X;
- shame copy;
- `You showed up.`

If Skip happens before Reveal, Skip does not automatically Reveal the movement.

---

# 9. Home — Calendar

Calendar is a consistency / achievement visualization, not a punishment attendance sheet.

Core visual meaning:

> **Past = result**  
> **Today = position + current state**  
> **Future = date**

## 9.1 Calendar mechanics

- real calendar;
- real month lengths;
- weekday alignment follows actual month;
- weekday order is locale-aware;
- default current month;
- past months browsable;
- future-month browsing is not required for MVP;
- read-only in MVP.

## 9.2 Past tracked dates

Past tracked dates primarily become result marks instead of continuing to behave like normal future date numbers.

States:

### Completed
Strongest positive result mark.

### Skipped
Neutral and clearly distinct.

### Missed
Restrained, low-emphasis mark.

Do not use:

- red X;
- large failure symbols;
- shame treatment.

## 9.3 Pre-adoption / Not Tracked

Dates before the user started using the product:

> **blank / no state**

Important:

> **Not Tracked ≠ Missed**

## 9.4 Today

Today keeps the date number.

Today receives a subtle current-position indicator.

If today becomes Completed or Skipped:

- show the result state;
- retain a subtle Today indicator.

On the next local day:

- the Today indicator moves;
- yesterday keeps only its historical outcome.

## 9.5 Future

Future dates:

- show real date numbers;
- visually quieter;
- no result state.

## 9.6 Month summary

Calendar may show current viewed-month completion count:

> `18 completed`

## 9.7 Visual freedom for Phase 05

Phase 04 intentionally did not lock:

- exact completed mark;
- skipped mark;
- missed mark;
- Today ring/shape;
- materials;
- colors;
- animation.

Phase 05 may design these freely as long as the semantics above remain intact.

---

# 10. Home — Lifetime Progress

Persistent Home lifetime statistics:

- **Total Sessions**
- **Cycles Completed**
- **Longest Streak**

Do not also add Current Streak here because Momentum already carries that emotional concept.

---

# 11. Milestones

Milestones are not a permanent Home progress bar.

Principle:

> **Milestone = special recognition event**

Preferred conceptual unit:

> completed cycles

rather than duplicating session count again.

Possible future threshold direction existed around:

- 1 Cycle
- 5 Cycles
- 10 Cycles
- 25 Cycles
- 50 Cycles

These exact thresholds and names are **not locked**.

Milestones should:

- become more sparse over time;
- feel premium and restrained;
- not become XP / level systems;
- not create trophy spam.

Some major milestones may later grant real subscription-time value.

Exact economics and reward thresholds are deferred.

Referral is post-MVP / Growth direction and, if later added, belongs under Profile rather than Home.

---

# 12. Train — Final UX Architecture

Train principle:

> **Enter once. Follow the coach. Finish without managing the workout.**

Train has two layers:

1. Train Tab
2. Immersive Guided Session

---

# 13. Train Tab States

## 13.1 Unrevealed

> **TODAY'S MOVEMENT**  
> `Your movement is ready.`  
> **Reveal**

Reveal is shared globally with Home.

## 13.2 Revealed

> **TODAY'S TRAINING**

Show:

- movement;
- Coach preview;
- `5 sets · 20 reps`;
- cycle progress;
- **Begin**;
- **Replace Movement** when quota is available.

## 13.3 Recoverable

Show:

- `X of 5 sets completed`;
- **Resume Session**.

## 13.4 Completed

> **Completed today**  
> **You showed up.**

## 13.5 Skipped

> **Skipped today**

---

# 14. Immersive Guided Session

Bottom navigation is hidden.

## 14.1 Preparation

Show:

- movement;
- `SET X OF 5`;
- large Coach;
- reps;
- automatic start countdown.

If the user already tapped Begin from Home, do not ask them to press another Start button.

## 14.2 Active Set

Show:

- `SET X OF 5`;
- guided position such as `8 / 20`;
- Coach;
- cadence/progress treatment;
- Pause.

Important:

> **8 / 20 is guided position, not verified reps.**

## 14.3 Rest

- exactly 20 seconds;
- automatic transition afterward;
- no Skip Rest;
- no Add Time;
- no Start Early.

---

# 15. Pause / Recovery / End Session

## 15.1 Manual Pause

Pause freezes:

- Coach;
- guided repetition progression;
- rest timer.

Pause never grants completion.

## 15.2 Background / phone interruption

App interruption causes:

> **Auto Pause**

On return:

> **SESSION PAUSED**  
> **Resume**

Do not continue reps or rest timers in the background.

## 15.3 End Session is not Skip Today

End Session:

- preserves completed-set checkpoints;
- today remains incomplete;
- accountability state does not change;
- Home becomes Resume;
- Train becomes Resume;
- user may continue later.

## 15.4 Crash / force-quit recovery

Preserve completed-set checkpoints only.

Example:

- Set 1 complete;
- Set 2 complete;
- Set 3 halfway when app crashes.

Recovery:

- Set 1 and 2 remain complete;
- Set 3 restarts from its beginning;
- full session does not restart;
- Set 3 is not automatically counted complete.

---

# 16. Replace Movement

Daily quota:

> **exactly 1 Replace per day**

## 16.1 Before session starts

Replace:

- original movement remains / returns to current remaining cycle pool;
- system draws a replacement from eligible remaining movements;
- replacement becomes today's movement;
- cycle completed count does not change;
- Replace quota becomes 0.

## 16.2 After session started

Replace remains available if unused.

Using it:

- resets current session progress;
- completed sets for the abandoned movement are cleared;
- original movement returns/remains in pool;
- new movement begins from Set 1;
- consumes the one daily Replace.

After Replace quota is used:

- cannot change movement again that day;
- Pause remains available;
- End Session remains available;
- Skip Today remains available when accountability rules allow it.

## 16.3 Global synchronization

Replace immediately updates:

- Home;
- Train.

Locks accountability state remains unchanged.

The original movement is not consumed.

The replacement is consumed only after full completion.

---

# 17. Completion

Global completion copy:

> **ROUTINE COMPLETE**  
> **You showed up.**

Contextual accountability outcome:

### Completed before Lock Time
> **You're clear for today.**

### Completed while apps are locked
> **Apps unlocked.**

### Completed during Grace
> **You're clear for today.**

Completion may emphasize current Momentum.

It does not need to dump all lifetime statistics into the completion moment.

---

# 18. Completion = Global Finalization

Valid Set 5 completion must atomically finalize today's user-facing state:

- session finalized;
- today = Completed;
- active shield removed / later same-day lock suppressed;
- Grace ends / becomes irrelevant;
- Home = Completed + progress update;
- Train = Routine Complete;
- Locks = Clear for Today;
- movement consumed from current cycle;
- Total Sessions +1;
- Momentum update;
- cycle update.

After finalization, no tab may still show:

- Locked;
- Resume;
- active session;
- Grace active.

---

# 19. Locks — Final UX Architecture

Locks principle:

> **Configure the rule. Understand the current state. Use an escape only when needed.**

Locks is not a third training-start surface.

Do not add Begin / Resume training CTAs as a competing training workflow.

---

# 20. Locks Primary States

## 20.1 Pre-lock / incomplete

> **Lock starts at [Lock Time]**

Behavior:

- selection editable for today;
- Lock Time editable for today;
- Grace hidden;
- Skip secondary.

## 20.2 Locked

> **APPS LOCKED**  
> `Complete today's movement to unlock.`

Show:

- Grace available;
- Skip available;
- configuration edits affect tomorrow.

## 20.3 Grace Active

> **GRACE ACTIVE**  
> `4:32 remaining`

Short copy preferred.

## 20.4 Completed

> **CLEAR FOR TODAY**  
> `Today's movement is complete.`

Grace and Skip hidden.

## 20.5 Skipped

> **SKIPPED TODAY**

## 20.6 No Apps Selected

> **LOCKS INACTIVE**  
> `No apps selected.`  
> **Choose Apps**

Behavior:

- Train remains usable when training entitlement permits;
- Grace hidden;
- Skip hidden.

## 20.7 Family Controls unavailable

> **LOCKS UNAVAILABLE**  
> `Screen Time access is off.`  
> **Enable Access**

Preserve previously saved opaque selection.

---

# 21. Selected Apps / Lock Time Editing Rules

## 21.1 Selected Apps

Before today's lock begins:

> edits apply today

After today's lock begins:

> **changes take effect tomorrow**

Completed or Skipped day:

> changes take effect tomorrow

User must not bypass an already-active commitment by deselecting apps after lock begins.

## 21.2 Lock Time

Before lock begins, changing to a future time:

> applies today

Before lock begins, changing to a time already in the past:

- explicit confirmation required;
- confirming may immediately activate lock if the required capability/config is valid.

After today's lock has already begun:

> changes take effect tomorrow

User must not unlock immediately by moving the current day's Lock Time later.

---

# 22. Today Commitment Snapshot

Once today's lock begins, today requires stable committed configuration.

Conceptually distinguish:

- today's active selection / lock commitment;
- tomorrow/future pending selection;
- today's active Lock Time;
- tomorrow/future pending Lock Time.

Phase 04 does not dictate storage schema.

Implementation must preserve this UX contract.

---

# 23. Grace

Daily allowance:

> **3 × 5-minute Grace extensions**

## 23.1 Availability

Pre-lock:

- Grace may remain hidden.

Locked:

- show remaining count;
- show `Use 5-Minute Grace`.

Confirmation must communicate:

- 5 minutes;
- consumes one Grace;
- remaining count.

Exact supporting copy is visually compressible later.

## 23.2 No stacking

While Grace is active:

- cannot use another Grace;
- cannot add +5 minutes;
- cannot stack to 10 or 15 minutes.

## 23.3 Expiration

If Grace expires and today remains incomplete:

> selected apps re-lock.

If routine completes during Grace:

> Clear for Today.

---

# 24. Skip Today

Skip is an emergency escape mechanism.

## 24.1 Availability

Available:

- pre-lock;
- locked;
- Grace active.

Hidden:

- completed;
- no apps selected;
- already skipped.

## 24.2 Interaction

Locked interaction pattern:

> **Two-step confirmation + Hold to Confirm**

Do not require:

- reason input;
- math problem;
- punitive countdown;
- guilt copy.

The first confirmation must clearly communicate irreversible consequences.

Exact long-form copy may be compressed after real layout testing.

## 24.3 Confirmed Skip consequences

After Skip is confirmed:

- selected apps available for the rest of today;
- today no longer locks;
- Current Momentum streak ends;
- Calendar today = Skipped;
- current movement is **not consumed**;
- movement remains in current cycle pool;
- any partial session ends;
- partial sets do not become a completed session;
- cycle progress does not increment;
- active Grace ends;
- session checkpoint is removed;
- Resume is removed;
- no Undo.

Home / Train / Locks all synchronize to Skipped.

## 24.4 First-ever Skip copy

If the first tracked day is skipped before any routine has ever been completed:

> **Momentum starts tomorrow.**

Do not write `again`.

---

# 25. Cross-State Contracts

## 25.1 Reveal

Reveal from Home or Train:

> global Reveal state update → same movement everywhere.

## 25.2 Begin / Resume

Home Begin:

> immersive Train preparation.

Checkpoint exists:

- Home = Resume;
- Train = Resume Session.

Locks is not a training-entry surface.

## 25.3 Lock Time arrives during active training

- selected apps may enter Locked according to accountability rules;
- Home next render uses locked context;
- Locks = APPS LOCKED;
- Train continues uninterrupted;
- Lock callback does not pause training;
- later valid completion clears the lock.

## 25.4 Grace starts/expires during active training

Grace controls app availability, not the training engine.

When Grace expires during Train:

- selected apps may re-lock;
- Train continues;
- no forced interruption;
- later valid completion clears accountability.

Immersive Train does not need to display Grace countdown.

Locks owns detailed Grace state.

Home may show lightweight contextual state.

## 25.5 Skip = global finalization

Skip:

- ends session;
- removes Resume;
- ends Grace;
- today = Skipped;
- makes selected apps available;
- movement stays in cycle;
- no session increment;
- no cycle increment;
- no Undo.

## 25.6 End Session ≠ finalization

End Session:

- keeps completed-set checkpoints;
- today remains incomplete;
- Home / Train become Resume;
- Locked / Grace / Pre-lock state continues independently;
- Locks is unchanged.

## 25.7 Family Controls authorization unavailable

Authorization capability state is separate from training outcome.

When unavailable:

- Train is not forcibly interrupted;
- training completion may still record;
- Home may lightly show `Locks unavailable`;
- Locks hero prioritizes **LOCKS UNAVAILABLE**.

If today becomes Completed while authorization is unavailable:

- Home / Train = Completed;
- Locks may still prioritize capability failure because future accountability is broken;
- after re-enable/reconciliation, today must resolve to Clear for Today.

If today was already Completed or Skipped before authorization returns:

> finalized daily outcome must be respected.

## 25.8 No Apps Selected

- Locks inactive;
- Home does not need a lock deadline;
- Train remains usable if training access permits;
- routine completion still counts toward Momentum/progress;
- Grace hidden;
- Skip hidden.

## 25.9 Config edits after lock

After today's lock begins:

- app/time edits affect tomorrow;
- today's committed configuration remains stable;
- Home / Locks today state reflects committed configuration, not pending settings.

---

# 26. Historical Day / Midnight Boundary

Accepted:

- Missed becomes historical only after the day boundary;
- an incomplete session must not silently become next-day completion;
- midnight / timezone / DST remain Beta / Release gates.

Still intentionally unresolved:

- exact active foreground session behavior across midnight;
- whether any small completion grace exists;
- exact attribution/expiration rule.

Do not invent:

- 5-minute midnight grace;
- 10-minute midnight grace;
- any other numeric cross-midnight exception.

---

# 27. Onboarding — Final Core Flow

Final flow:

> **Brand**  
> → **Nickname**  
> → **Overlooked Training Aha**  
> → **Goal**  
> → **Barrier**  
> → **Training Structure**  
> → **Daily Deadline / Lock Time**  
> → **Accountability Explanation**  
> → **Screen Time Authorization**  
> → **App Selection**  
> → **Your Daily Setup**  
> → **First Reveal**  
> → **First Full Free Routine**  
> → **Routine Complete / You Showed Up / 1 Day of Momentum**  
> → **Real Clear / Unlock Outcome**  
> → **Account Creation / Sign In**  
> → **Paywall**  
> → **Home**

Core principle:

> **The user does not fill out a fake assessment. The user builds a real commitment.**

Only ask questions that change real experience/framing.

Do not claim questionnaire answers generate an AI-personalized training plan.

---

# 28. Onboarding Screen 01 — Brand Entry

Primary direction:

> **Train what most men ignore.**

Supporting:

> **Short, private training built for men's performance and consistency.**

Primary CTA:

> **Get Started**

Existing-user secondary entry:

> **Sign In**

Do not lead by describing the product as a Screen Time blocker.

---

# 29. Onboarding Screen 02 — Nickname

Direction:

> **First, what should we call you?**

Rules:

- nickname, not legal name;
- may be stored locally before account creation;
- account is not required here;
- nickname supports Home greeting and light onboarding personalization.

---

# 30. Onboarding Screen 03 — Overlooked Training Aha

Accepted direction:

> **Most men train what shows.**  
> Chest. Arms. Abs.  
> **The hips get overlooked.**  
> **That's where we start.**

Supporting direction:

> Guided training built around hip control, lower-body strength, and consistency.

Principles:

- explain hips/lower-body/control early;
- do not frame the product as Kegel-only;
- do not make medical or guaranteed sexual-performance claims;
- follow **Suggest, don't claim**.

---

# 31. Onboarding Mini Assessment

Assessment creates commitment/framing, not a fake prescription.

## 31.1 Goal

Question:

> **What are you here to build?**

Accepted single-select options:

- **Better control**
- **Stronger hips & lower body**
- **More consistency**
- **More confidence**

Interaction:

> single select → tap → next

May affect:

- supporting-copy emphasis;
- Focus shown in Your Daily Setup;
- analytics/future messaging.

Must not alter:

- movement library;
- cycle composition;
- sets;
- reps;
- training prescription.

## 31.2 Barrier

Question:

> **What usually gets in the way?**

Accepted single-select options:

- **I put it off**
- **Apps pull me in**
- **My schedule gets busy**
- **I forget**
- **I want more structure**

Purpose:

- personalize accountability framing;
- make the user acknowledge a consistency barrier.

Must not create a different training architecture.

---

# 32. Training Structure Education

Direction:

> **One movement. Five guided sets.**  
> **We handle the pace. You do the work.**

May lightly show:

- 1 movement;
- 5 sets;
- 20 sec rest.

Do not overload onboarding with:

- four-rest edge detail;
- Set-5/no-rest edge detail;
- Replace;
- Grace;
- Skip;
- cadence mechanics.

---

# 33. Daily Deadline / Lock Time Setup

Question framing:

> **When do you want today's training done by?**

User may begin with a daypart choice or Choose a Time.

Final setup must confirm an exact recurring time using a time picker.

Do not map Morning/Afternoon/Evening to arbitrary production times without Owner approval.

Confirmation meaning:

> **This becomes your daily Lock Time.**

Psychological model:

> **Lock Time = the user's chosen daily commitment deadline.**

Not a punishment time.

## 33.1 Past-time during onboarding

If the selected exact Lock Time has already passed today:

- explicit confirmation required;
- if accountability capability + selected apps + first-free training access are valid, today's lock may activate after confirmation;
- user must still be able to complete the first free routine and clear the lock.

Never silently lock immediately.

---

# 34. Accountability Introduction

After training structure and deadline are understood:

> **Now make it a commitment.**

Mechanism direction:

> If today's training isn't complete by **[Lock Time]**, the apps you choose will wait until you're finished.

Concept:

> Training → chosen deadline → incomplete = selected apps wait → complete = Clear for Today.

Do not explain full Grace / Skip / Replace mechanics here.

---

# 35. Screen Time / Family Controls Permission

Title direction:

> **Connect Screen Time**

Supporting:

> Men's Discipline uses Apple's Screen Time controls to apply the accountability rules you choose.

Privacy direction:

> **You choose which apps are included.**

Do not make overbroad claims such as:

> `100% of your information stays on device`

because later account/progress/subscription data may use server-side systems.

## 35.1 Approved

Continue to App Selection.

## 35.2 Denied / unavailable

Onboarding must not dead-end.

Direction:

> **Screen Time Access Is Off**  
> You can still try today's training. Accountability can be set up later.

Primary:

> **Continue Without Locks**

Repair path may expose Enable Access / Settings later.

Core rule:

> **Locks unavailable ≠ Train unavailable.**

---

# 36. App Selection

Emotional language:

> **Which apps should wait until you've shown up?**

Supporting:

> Choose the apps you want tied to your daily commitment.

System language:

> **Selected Apps**

Avoid:

- Distracting Apps;
- Bad Apps;
- mandatory minimum of 3 apps.

## 36.1 Empty selection

> **No apps selected**

Supporting direction:

> Training still works without accountability. You can set this up anytime in Locks.

Allow:

- Choose Apps;
- Continue Without Locks.

Core rule:

> **No Apps Selected ≠ Train unavailable.**

---

# 37. Your Daily Setup

Do not show fake AI analysis such as:

> `Reviewing your responses...`

A very short transition may say:

> **Building your setup…**

Result page:

# **Your Daily Setup**

Display actual individualized values:

- **FOCUS** — selected goal;
- **DAILY TRAINING** — `1 movement · 5 guided sets`;
- **DONE BY** — exact Lock Time;
- **ACCOUNTABILITY** — selected-app count or inactive state.

Supporting direction:

> **Simple enough to repeat. Structured enough to keep you honest.**

Primary CTA:

> **Reveal Today's Movement**

Reassurance:

> **Your first full session is on us.**

Do not say:

> `Your personalized training plan is ready.`

---

# 38. First Reveal / First Routine

First Reveal follows the normal production state model.

Do not create tutorial-only Reveal behavior.

First movement shows:

- movement;
- Coach preview;
- `5 sets · 20 reps`;
- Begin.

May retain:

> **Your first full session is on us.**

First routine is the full production-shaped routine:

> Preparation → Countdown → Set 1 → Rest → Set 2 → Rest → Set 3 → Rest → Set 4 → Rest → Set 5 → Completion

Do not:

- provide only 1–2 preview sets;
- show Paywall mid-session;
- substitute a shortened tutorial workout.

---

# 39. First-Session Recovery

If the user leaves the first routine:

- preserve normal completed-set checkpoints;
- later return resumes the first session;
- do not replay the full questionnaire;
- do not auto-complete.

Direction:

> **Finish your first session**  
> `X of 5 sets completed`  
> **Resume**

Cross-midnight rules remain deferred as described earlier.

---

# 40. First Completion

The full emotional reward happens before account/paywall.

Sequence direction:

> **ROUTINE COMPLETE**  
> **You showed up.**  
> **1 DAY OF MOMENTUM**

Then show real accountability outcome:

### Was locked at completion
> **Apps unlocked.**

### Completed before lock
> **You're clear for today.**

### No apps selected
Show completion/Momentum only.

Do not pretend apps were unlocked.

### Family Controls unavailable
Record completion/Momentum normally.

Do not claim apps were unlocked.

Critical principle:

> **Do not manufacture a fake onboarding lock to create an unlock moment.**

---

# 41. First-Free Boundary

The first onboarding / first-day activation includes exactly:

> **one full free daily routine**

After it:

- earned progress/history remains visible;
- future new daily training requires active paid entitlement;
- free Day 1 does not become an ongoing free tier.

If the user uses Skip Today during first activation before completing the free routine:

- normal irreversible Skip semantics apply;
- first-free opportunity does not roll forward indefinitely;
- future new training requires Trial / Subscription.

---

# 42. Account Timing — Latest Owner Override

Core rule:

> **The first complete product experience does not require an account.**  
> **Continued paid access does require an account.**

Therefore:

1. First full free routine requires no registration.
2. After first completion, ask user to create an account / sign in.
3. Options:
   - Continue with Apple
   - Continue with Google
   - Continue with Email
4. User may decline and return to limited Home.
5. User cannot start Trial / Subscription until signed in / account-created.
6. Later `Start 3-Day Free Trial`:
   - signed out → Account / Sign In → Paywall
   - signed in → Paywall

Do not repeatedly force account creation every app launch.

---

# 43. Post-Free Signed-Out State

After Day 1 completion without account:

User may still view local earned:

- Momentum;
- Calendar/history;
- Total Sessions;
- Cycles Completed;
- Longest Streak;
- finalized Day 1 outcome.

User cannot:

- access a new daily movement/training session;
- start Trial / Subscription before account creation/sign-in.

Natural path:

> **Start 3-Day Free Trial**  
> → Account / Sign In  
> → Paywall

---

# 44. Subscription Structure

Locked MVP launch reference:

## Monthly
> **USD $9.99 / month**

## Annual — Best Value / Default Recommended
> **USD $39.99 / year**  
> **$3.33 / month equivalent**

Rules:

- Annual selected by default;
- Annual is recommended / Best Value;
- 3-Day Free Trial remains;
- 3-Month plan is removed;
- localized storefront pricing comes later.

---

# 45. Paywall

Paywall appears after:

> first full free routine → account creation/sign-in → Paywall

Headline direction:

> **Keep your momentum going.**

Value hierarchy may use:

### DAILY TRAINING
> One movement. Five guided sets.

### ACCOUNTABILITY
> Tie the apps you choose to your daily commitment.

### MOMENTUM
> Build sessions, cycles, streaks and history.

Trial:

> **3-Day Free Trial**

Annual selected:

> **No payment today**  
> **Start 3-Day Free Trial**  
> `3 days free, then $39.99/year. Cancel anytime.`

Monthly selected:

> `3 days free, then $9.99/month. Cancel anytime.`

Must clearly expose:

- Restore Purchases;
- Terms;
- Privacy;
- trial duration;
- post-trial price;
- billing period;
- auto-renewal/cancellation clarity.

Avoid prioritizing:

> `Try for $0.00`

Current brand direction is restrained/premium.

Paywall may be closed.

Closing it does not grant further free daily training.

Do not force the paywall on every app launch.

Natural later conversion points include:

- Today's Training;
- Train access;
- accountability reactivation.

---

# 46. Restore Purchases — Product Meaning

Restore Purchases means:

> **re-check and restore an existing valid App Store purchase entitlement when the app does not currently recognize it.**

It does not mean:

- restart an expired subscription;
- undo cancellation;
- create a new paid period.

Common cases:

- reinstall;
- new device;
- entitlement reconciliation;
- active paid-through period after auto-renew cancellation.

If auto-renew is cancelled but the paid period has not expired:

> entitlement remains active until expiration.

If fully expired:

> Restore Purchases does not reactivate it.

---

# 47. Account ≠ Subscription

These are separate states.

Do not collapse into a boolean such as:

> `loggedIn = premium`

Account owns:

- identity;
- progress continuity.

App Store / RevenueCat entitlement owns:

- paid training access.

Account is required before Trial/purchase, but:

> **having an account does not imply active subscription entitlement.**

---

# 48. Entitlement ↔ Accountability Safety Contract

This is a critical product safety contract:

> **Active training entitlement → accountability may enforce.**  
> **No active training entitlement → accountability must not enforce.**

Applies to:

- first free routine completed + no Trial;
- Paywall closed;
- Trial expired;
- Subscription definitively expired;
- definitive entitlement loss.

Required behavior when no active training entitlement:

- suspend future accountability schedule;
- reconcile/clear known active shields;
- selected apps remain available;
- saved Selected Apps may remain;
- saved Lock Time may remain;
- earned progress/history remains;
- new training remains behind entitlement.

When entitlement later returns:

- saved configuration may be used to reactivate future accountability.

---

# 49. Post-Free Non-Entitled Home

Home still shows earned:

- Momentum;
- prior outcome;
- Calendar/history;
- Total Sessions;
- Cycles Completed;
- Longest Streak.

Do not erase earned progress.

Do not reveal a new movement first and then surprise-paywall the user.

Direction:

> **Continue your momentum.**  
> **Start 3-Day Free Trial**

Supporting direction may explain that Trial unlocks today's movement and reactivates accountability.

Exact copy remains polishable.

---

# 50. Post-Free Non-Entitled Locks

Do not show active Locked state.

Direction:

> **ACCOUNTABILITY PAUSED**

Supporting:

> Start your trial to activate your daily commitment.

May still display saved:

- Selected Apps;
- Lock Time.

But may not enforce them.

---

# 51. Trial Start After First Completion

If Trial starts after the first free day is already Completed:

- today stays Completed / Clear;
- no second movement that day;
- Trial activation does not lock today again;
- future local days enter normal entitled accountability loop.

Purchase success should not use loud premium celebration.

Direction:

> **You're set.**

Then Home.

---

# 52. Profile / Settings

Profile is lightweight and accessed from Home top-right.

Suggested MVP information architecture:

## ACCOUNT

Signed out:

> **Save Progress / Sign In**

Signed in:

> account identity

Actions:

- Sign Out
- Delete Account

## SUBSCRIPTION

Possible states:

- No active plan
- 3-Day Trial
- Monthly
- Annual

Actions:

- Start 3-Day Free Trial / Subscribe
- Manage Subscription
- Restore Purchases

## PREFERENCES

Minimum:

- Nickname

Do not duplicate Locks configuration here.

## SUPPORT / LEGAL

- Help & Support
- Privacy Policy
- Terms of Use
- About / app version may be included

---

# 53. Existing User Sign In

Brand entry may expose:

> **Sign In**

Existing-user flow:

> Welcome back  
> → Apple / Google / Email  
> → restore account-linked progress  
> → reconcile paid entitlement  
> → Home

Account restore does not imply automatic Family Controls restore.

On a new device, Screen Time authorization and app selection may need setup again.

---

# 54. Sign Out

Signing out:

- is an account action;
- does not cancel App Store subscription;
- must not claim billing cancellation;
- must not become a normal Lock bypass mechanism.

Exact local/account merge/reconciliation behavior is implementation-deferred.

---

# 55. Manage Subscription

Profile should expose:

> **Manage Subscription**

It should route to the appropriate Apple subscription-management experience.

Do not present an internal fake toggle as though it cancels App Store billing.

---

# 56. Delete Account

If account creation exists, in-app:

> **Delete Account**

is required.

Confirmation must distinguish:

> **Delete Account ≠ Cancel App Store Subscription**

Manage Subscription should be accessible near this flow.

Exact server-side deletion/anonymization/retention and Sign in with Apple token cleanup belong to Account/Privacy implementation.

---

# 57. Phase 04 Copy Status

Locked:

- state semantics;
- consequences;
- hierarchy;
- non-punitive tone;
- core copy directions listed in this document.

Still compressible / polishable in real Figma layout:

- Grace confirmation supporting copy;
- Grace active supporting copy;
- Skip consequence explanation;
- pre-lock supporting copy;
- past-time Lock Time warning;
- some Home supporting copy;
- final visual copy density.

Rule:

> **Do not change behavior to make copy shorter. Compress wording, not semantics.**

---

# 58. Phase 05 Creative Freedom

Phase 05 / Figma has meaningful creative freedom **inside the locked UX**.

It may explore and create:

- color system;
- typography;
- spacing;
- radii;
- surfaces/materials;
- icon language;
- abstract symbols;
- Momentum motif;
- 7-part cycle graphic;
- Calendar marks;
- Today indicator;
- Lock/Grace state graphics;
- completion graphics;
- milestone recognition language;
- movement thumbnail treatment;
- Coach visual container;
- visual hierarchy;
- transition/motion direction;
- paywall presentation;
- component styling.

It may use:

- vector shapes;
- Figma components;
- custom abstract marks;
- custom iconography;
- generated image assets where justified.

It must not alter:

- daily-state semantics;
- navigation responsibilities;
- Reveal behavior;
- cycle behavior;
- Replace quota;
- Pause/recovery behavior;
- Grace rules;
- Skip consequences;
- first-free boundary;
- account-before-subscription rule;
- subscription structure;
- entitlement/accountability safety dependency;
- locked training structure, including 5 sets × 20 guided reps.

If a visual solution appears to require changing UX behavior:

> preserve UX and surface the design problem for Owner review.

---

# 59. Visual / Asset Items Intentionally Not Yet Final

Phase 04 intentionally does not finalize:

- exact visual system;
- typography;
- colors;
- spacing;
- radius;
- surface materials;
- icons;
- Calendar mark shapes;
- Today-ring design;
- 7-cycle marker design;
- Coach final material/assets;
- movement-video assets;
- final thumbnail style;
- completion animation;
- cycle-completion animation;
- Grace countdown styling;
- Hold-to-Skip animation/duration;
- time-picker styling;
- final motion timing;
- haptic/audio;
- paywall card styling;
- onboarding transition animation.

These are Phase 05/06/asset-production decisions.

---

# 60. Implementation / Release Items Intentionally Deferred

Do not let Figma/Codex invent implementation behavior for:

- exact account backend;
- anonymous → account merge semantics;
- reinstall / anonymous first-free anti-abuse;
- exact RevenueCat / StoreKit architecture;
- billing transition during active guided session;
- active-session cross-midnight attribution;
- timezone / DST;
- final localized pricing outside current USD reference;
- final server-side account deletion/retention mechanics.

---

# 61. Representative UX Stress-Test States for Phase 05

Before full UI production, the visual system should prove itself against at least these real states.

## Home
- first-ever, unrevealed;
- active Momentum, revealed;
- recoverable session;
- completed;
- skipped;
- post-free non-entitled;
- historical Calendar with Completed/Skipped/Missed/Not Tracked/Future/Today.

## Train
- unrevealed;
- preparation;
- active set;
- rest;
- paused;
- recoverable;
- completed;
- skipped;
- Replace available / used.

## Locks
- pre-lock;
- locked;
- Grace available;
- Grace active;
- completed/Clear for Today;
- skipped;
- no apps selected;
- Screen Time unavailable;
- accountability paused due to no entitlement.

## Monetization / Utility
- Account creation after Day 1;
- signed-out limited Home;
- Annual-selected Paywall;
- Monthly-selected Paywall;
- Profile signed out;
- Profile signed in;
- Manage Subscription;
- Restore Purchases;
- Delete Account confirmation.

---

# 62. Phase 05 Entry Principle

Phase 04 is:

> **CLOSED / PASSED**

Phase 05 should answer:

> **What does this already-defined product look and feel like?**

It should not answer again:

> **What should this product do?**

The expected progression is:

> UX Handoff  
> → Visual DNA  
> → Foundations  
> → Graphic / State Language  
> → Components  
> → Representative Screen Stress Test  
> → Design System Freeze  
> → Full UI Design  
> → Final Coach/video assets + motion polish  
> → implementation

---

# 63. 30-Second Codex / Figma Summary

- Read this file before visual design.
- UX is locked.
- Primary tabs: **Home | Train | Locks**.
- Home = Momentum + Today + Calendar + lifetime progress.
- Train = guided one-movement / five-set / 20-rep-per-set session.
- Locks = accountability config/state + Grace/Skip.
- One daily state is shared everywhere.
- 7 movements, random-without-repeat cycle.
- System draws; user reveals.
- 1 Replace/day.
- 3 × 5-minute Grace/day, no stacking.
- Skip Today = two-step + Hold to Confirm, irreversible, movement not consumed.
- Calendar: past=result, today=position/state, future=date, pre-adoption=blank.
- First full free routine needs no account.
- Account is required before Trial/Subscription.
- Monthly $9.99; Annual $39.99; Annual default.
- No active training entitlement = no active accountability lock.
- Visual design has freedom over style, symbols, icons, marks, components and motion.
- Visual design may not change the UX contract.
