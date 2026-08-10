# AGENTS.md

# Men's Discipline App — Agent Instructions

## 1. Project principles

This is an iOS-first mobile application built with React Native / Expo plus native iOS functionality where required.

Before making product, UX, architecture, or scope decisions, read the relevant project documents under `docs/`.

Do not silently change locked product decisions, add new product features, or broaden MVP scope.

Current technical priorities are:
- App Lock / Screen Time feasibility
- On-device motion tracking feasibility
- Reliable React Native ↔ native iOS integration

Privacy is a core requirement:
- Do not upload camera video unless explicitly approved.
- Do not persist camera recordings by default.
- Prefer on-device pose / motion processing.
- Store only the minimum derived training data required by the product.

Do not perform unrelated refactoring while implementing a scoped task.

---

## 2. Communication

Explain important technical decisions in clear Chinese.

Assume the project owner is learning software development and Git.

Before significant changes, briefly explain:
- what will change;
- why;
- which files or systems are affected;
- any meaningful risks.

Do not hide errors or claim that something works unless it has actually been verified.

---

## 3. Startup Git safety check

Before editing files for a new task:

1. Run:

   `git status --short --branch`

2. Report:
   - current branch;
   - whether the working tree is clean;
   - any modified, staged, or untracked files.

3. If previous uncommitted changes exist:
   - do not overwrite them;
   - do not discard them;
   - do not automatically stash them;
   - explain what the files appear to contain;
   - keep unrelated work separate.

---

## 4. Branch policy

`main` represents the latest stable and verified version.

After the initial project bootstrap, do not implement normal features directly on `main`.

Use one branch for one logical unit of work.

Preferred branch prefixes:

- `feature/...` — product functionality
- `fix/...` — bug fixes
- `spike/...` — technical feasibility experiments
- `refactor/...` — deliberate refactoring
- `chore/...` — setup, tooling, documentation, maintenance

Examples:

- `spike/family-controls`
- `spike/vision-pose`
- `feature/app-selection`
- `fix/rep-counter`

Do not create a new branch for every tiny edit inside the same logical task.

---

## 5. Commit policy

Create commits at stable, understandable checkpoints.

Commit messages must clearly describe the purpose of the change.

Before committing:

1. Run `git status --short`.
2. Review the changed/staged file list.
3. Check that unrelated files are not included.
4. Review the relevant diff.
5. Run applicable validation/tests.
6. Show the proposed commit scope before committing.

Do not combine unrelated features into one commit.

Do not amend, rewrite, or rebase already-pushed history without explicit approval.

After an important stable commit, push it to the configured GitHub remote.

---

## 6. Main branch integration

Do not merge a feature/spike/fix branch into `main` until:

- the intended task is complete;
- applicable validation passes;
- the diff has been reviewed;
- no unrelated files are included;
- the project owner has accepted the stable checkpoint.

Important milestones may receive a Git tag such as `v0.1.0`.

---

## 7. Dangerous operations

Never perform the following without explicit user approval:

- `git reset --hard`
- `git clean`
- force push
- deleting branches containing work
- deleting project files in bulk
- discarding uncommitted changes
- overwriting configuration
- regenerating native project files when it could destroy manual native changes
- deleting or replacing lockfiles without a reason
- destructive database operations
- changing signing credentials, bundle identifiers, entitlements, or production configuration

When a change breaks the project, compare against the last known-good commit before making broad additional changes.

Prefer diagnosis and narrow fixes over large speculative rewrites.

---

## 8. Dependencies and configuration

Do not add, remove, or upgrade major dependencies without explaining:

- why the dependency is needed;
- what functionality it provides;
- whether it contains native code;
- whether it affects iOS/Android builds;
- whether it introduces configuration or migration work.

Do not commit secrets, private keys, certificates, credentials, tokens, or `.env` values.

Keep appropriate secret files in `.gitignore`.

Do not modify Apple signing, entitlements, EAS configuration, native targets, Podfiles, or platform configuration casually.

---

## 9. Verification

A task is not complete merely because code was written.

Before declaring completion, run the relevant available checks, such as:

- TypeScript checks
- lint
- unit/integration tests
- Expo Doctor
- development build
- platform-specific validation

Only report checks that were actually executed.

If a check could not be run, state that clearly.

---

## 10. Completion report

At the end of every meaningful coding task, report:

**Branch**
Current Git branch.

**Commit**
Latest relevant commit hash and message, if committed.

**Git status**
Whether the working tree is clean.

**Files changed**
Relevant changed files only.

**What changed**
Short functional summary.

**Verification**
Exactly which tests/checks/builds were run and their results.

**Preview / Build**
Expo, development-build, TestFlight, or other preview information when one actually exists.

Do not invent an HTML preview link for a native mobile feature.

**Rollback**
Give the safest specific way to return to the previous known-good version.

**Remaining risks**
Mention unresolved technical risks or unverified behavior.
