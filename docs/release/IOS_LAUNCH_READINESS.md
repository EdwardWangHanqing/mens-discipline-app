# Men's Discipline App — iOS Launch Readiness Checklist

**Status:** Operational source of truth for iOS release readiness

**Last verified against Apple rules:** 2026-08-11

**Priority:** latest explicitly accepted decision / `docs/DECISIONS.md` > `docs/product/MVP_SCOPE.md` > `docs/product/MASTER_PRODUCT_PLAN.md` > this operational checklist.

> This file does not redefine product scope. It turns the locked MVP into a concrete path from prototype to TestFlight and App Store submission.

## 0. Locked product assumptions this checklist must not override

- iOS first; Android later, with cross-platform architecture reserved.
- First value experience does **not** force login.
- First complete routine is experienced before the user is asked to save progress / create an account.
- Account direction: Apple + Google + Email; Phone OTP is not an MVP priority.
- 3-day free trial is locked; subscription plans are Monthly / 3-Month / Annual.
- Daily training structure from final Phase 02 remains authoritative: exactly 1 movement/day, 7-movement cycle without repetition, ~5 sets, ~15–20 reps/set, ~20s rest; exact reps are movement-specific later.
- Camera is for basic verification + rep counting, not strict form scoring/correction; video should remain on-device and should not be stored/uploaded unless a later decision explicitly changes this.

---

# 1. P0 Go / No-Go gates — must happen before full UI polish

## 1.1 Family Controls technical feasibility
- [ ] Enroll in Apple Developer Program early enough to test Family Controls on a real iPhone.
- [ ] Build the smallest possible App Selection → Shield/Lock → Unlock prototype.
- [ ] Verify user-selected apps can be shielded and restored reliably.
- [ ] Verify authorization denied/revoked behavior.
- [ ] Verify behavior after app relaunch and device reboot.
- [ ] Verify daily schedule behavior across time-zone changes and daylight-saving transitions.
- [ ] Test on the current shipping iOS release before considering the technical risk closed.

## 1.2 Family Controls distribution entitlement
- [ ] Create explicit App IDs for the main app and every Screen Time extension actually used.
- [ ] Request Family Controls **Distribution** entitlement for the main app.
- [ ] Submit the same entitlement request separately for every applicable Screen Time extension (Device Activity Monitor / Report / Shield Action / Shield Configuration).
- [ ] Confirm Assigned status and required distribution methods before TestFlight/App Store submission.
- [ ] Keep entitlement request explanation consistent with App Store positioning: accountability / focus / wellness, not covert surveillance.

## 1.3 Monetization-policy review — Guideline 4.10 (P1 review watch item, not a technical blocker)
Apple Guideline 4.10 explicitly names the camera and Screen Time APIs in its restriction on monetizing built-in hardware, operating-system capabilities, and Apple services or technologies.

Existing approved paid apps that integrate these capabilities suggest that camera and Screen Time APIs can be part of a paid product in practice. However, Apple does not provide an explicit safe harbor for this product's specific implementation or monetization structure. Guideline 4.10 therefore remains a P1 App Review and packaging risk.

Before finalizing App Store copy and paywall packaging:
- [ ] Describe paid value as the complete proprietary training/accountability product: programming, routine system, verification/counting logic, progress/momentum, coaching/content, history, personalization, etc.
- [ ] Do not market the purchase as a fee simply to “access the iPhone camera,” “access Screen Time,” or another Apple-provided capability.
- [ ] Review the final paywall, metadata, value proposition, and Review Notes specifically for Guideline 4.10 risk before submission.
- [ ] Explain how Screen Time and camera usage integrate with the app's proprietary functionality without claiming that this packaging guarantees approval.
- [ ] Do **not** change the locked subscription model or force a free basic-lock/camera tier solely because of Guideline 4.10.
- [ ] If App Review specifically raises 4.10, address the concrete concern and record any resulting product change explicitly.

## 1.4 Camera / rep-counting validation gates

### Phase 03 offline foundation
- [x] Define a movement-agnostic derived pose contract with explicit per-joint availability and confidence.
- [x] Establish an Apple Vision adapter that accepts local files and returns typed complete/partial/no-pose/error outcomes.
- [x] Confirm the offline foundation adds no camera permission, live capture, networking, raw-image return, or image/video persistence.
- [ ] Validate normalized pose output and partial-body observations from representative human input on a physical iPhone.

### Phase 03 Technical Feasibility exit
- [ ] Validate at least **one representative MVP movement** on a real iPhone.
- [ ] Prove camera/pose detection → movement state → rep count → completion can work reliably enough to justify continued development.
- [ ] Verify the representative movement does not require perfect full-body alignment when a smaller movement-specific joint set is sufficient.
- [ ] Verify temporary tracking loss preserves valid rep progress and does not reset the set.
- [ ] Verify repeated tracking failure can enter assisted completion and cannot leave an honest user unable to complete or unlock.
- [ ] Confirm no raw training video is stored or uploaded in MVP.

### Phase 09 Motion Tracking / before Beta
- [ ] Validate **all 7 final MVP movements** individually on a real iPhone.
- [ ] Define and meet a minimum acceptable recognition/counting threshold for each movement.
- [ ] Document movements or camera conditions that remain problematic.

### Before public release
- [ ] Test all 7 movements under reasonable real-world failure conditions, including camera distance, partial-body visibility, lighting, interruption, and denied/revoked camera permission.
- [ ] Test assisted-completion entry, recovery, completion, unlock, and progress behavior for every movement where automatic tracking can fail.

---

# 2. Apple Developer + business readiness track

This track runs in parallel with development; it must not block coding.

## 2.1 Developer account transition
- [ ] Start development using an Individual Apple Developer membership if company setup is still pending.
- [ ] Incorporate the company before commercial release if the company should appear as seller.
- [ ] Obtain D-U-N-S for the legal entity.
- [ ] Prepare company-domain email and a public functional company website.
- [ ] Request Individual → Organization membership conversion before public App Store launch.
- [ ] Avoid creating a second unrelated Developer account unless there is a clear reason; prefer converting the existing membership.

## 2.2 Paid business setup — after organization conversion is stable
- [ ] Accept the Paid Apps Agreement.
- [ ] Submit required Canadian tax information, including GST/HST information required by Apple for Canada-based developers.
- [ ] Add the company bank account using details that match the bank's records.
- [ ] Apply to the App Store Small Business Program after the Paid Apps Agreement is active and organization details are stable.
- [ ] Do not wait until launch day to apply to the Small Business Program; allow time for the reduced commission to become effective.

## 2.3 EU territory decision
- [ ] Decide MVP storefronts (e.g., Canada / U.S. / other English-speaking markets / EU).
- [ ] If distributing in the EU, complete DSA trader-status assessment and verification.
- [ ] Review what business address / phone / email Apple will display publicly for EU trader compliance before enabling EU storefronts.

---

# 3. Account architecture and deletion

## 3.1 Login timing
- [ ] Preserve Phase 02 decision: first routine/value experience without forced login.
- [ ] Ask the user to save progress only after the first complete routine.
- [ ] Document exactly which features require an account (cloud sync, progress recovery, cross-device history, subscription restoration linkage, etc.).

## 3.2 Login methods
- [ ] Implement Sign in with Apple.
- [ ] If Google Sign-In is offered for the primary account, keep an Apple-compliant equivalent privacy-preserving login option.
- [ ] Email authentication must have abuse/rate-limit handling.
- [ ] Phone OTP remains out of MVP unless explicitly re-approved.

## 3.3 Account deletion
- [ ] In-app account deletion is easy to find.
- [ ] Delete or anonymize server-side personal data according to the published retention policy.
- [ ] If Sign in with Apple is used, implement Apple token revocation as part of account deletion when applicable.
- [ ] Define what happens to local routine history after account deletion.
- [ ] Define whether legally required financial records are retained separately from the user profile.

## 3.4 Review access
- [ ] Provide a working demo/reviewer account if any important feature requires login.
- [ ] Make sure reviewer credentials do not expire during review.
- [ ] If a paid state is needed for review, ensure Apple can test the subscription in sandbox/TestFlight or provide the appropriate review path.

---

# 4. Subscription / RevenueCat release checklist

## 4.1 App Store Connect products
- [ ] One subscription group for the MVP plans unless a later monetization decision requires otherwise.
- [ ] Monthly product created.
- [ ] 3-Month product created.
- [ ] Annual product created.
- [ ] 3-day free trial configured as the intended introductory offer.
- [ ] Product IDs follow a permanent naming convention and match App Store Connect / RevenueCat / code exactly.
- [ ] Product display names, descriptions, review screenshots, pricing and availability are complete.
- [ ] First subscription is submitted with the first app version as required.

## 4.2 RevenueCat
- [ ] Products imported/mapped correctly.
- [ ] Entitlement naming is stable and simple.
- [ ] Offering contains the intended Monthly / 3-Month / Annual packages.
- [ ] App Store Connect API credentials/secrets stored securely and never committed to Git.
- [ ] Server notifications / subscription-status integration configured as needed.
- [ ] Production and sandbox configuration are clearly separated.

## 4.3 Paywall compliance
- [ ] Full amount actually billed is the most prominent price (especially Annual).
- [ ] Any “per week / per month equivalent” is visually subordinate.
- [ ] 3-day free-trial duration is explicit.
- [ ] Post-trial price and billing period are explicit.
- [ ] Auto-renewal language is clear.
- [ ] Cancellation route is clear.
- [ ] Subscription title and duration are shown.
- [ ] Privacy Policy link works.
- [ ] Terms of Use / EULA link works.
- [ ] Restore Purchases exists and is easy to find.
- [ ] Existing subscriber sign-in / restore path works.
- [ ] App Store description clearly indicates which showcased functionality requires subscription when relevant.

## 4.4 Subscription state testing
Test in local StoreKit **and** real Sandbox/TestFlight.
- [ ] Eligible free-trial purchase.
- [ ] Non-eligible trial user.
- [ ] Monthly purchase.
- [ ] 3-Month purchase.
- [ ] Annual purchase.
- [ ] Restore purchase.
- [ ] Cancelled but still active until expiration.
- [ ] Expired.
- [ ] Billing retry / billing issue.
- [ ] Grace-period behavior if enabled.
- [ ] Upgrade / downgrade / crossgrade behavior if enabled later.
- [ ] App reinstall and restore.
- [ ] Account sign-out / sign-in and entitlement recovery.

---

# 5. Privacy, permissions, data map and SDK governance

## 5.1 Create a data inventory before App Privacy labels
Maintain a simple table for every data type:
- Data element
- Collected? yes/no
- Stored on device / server
- Linked to identity? yes/no
- Used for tracking? yes/no
- Purpose
- Retention period
- Shared third party / SDK
- Deletion behavior

At minimum audit: account identifiers, email, routine history, streak/momentum, selected-app tokens, camera frames/pose landmarks, analytics events, subscription identifiers, crash diagnostics.

## 5.2 Privacy Policy
- [ ] Explains what is collected and what is not collected.
- [ ] Explicitly explains camera processing and whether raw video is stored/uploaded.
- [ ] Explains selected-app / Screen Time data at an appropriate level without implying access Apple does not grant.
- [ ] Lists analytics / subscription processors actually used.
- [ ] Explains account/data deletion.
- [ ] Contact information is current.

## 5.3 App Store privacy metadata
- [ ] App Privacy labels match actual app + all third-party SDK behavior.
- [ ] Re-audit labels every time a new SDK is added.
- [ ] Avoid ATT/tracking entirely unless a real business need is approved; if tracking is introduced, implement ATT and update policy/labels.

## 5.4 Privacy manifest / required-reason APIs
- [ ] Include a valid `PrivacyInfo.xcprivacy` where required.
- [ ] Audit Required Reason API use in first-party and third-party code.
- [ ] Use only Apple-approved reasons that match actual use.
- [ ] Confirm required third-party SDK privacy manifests/signatures are valid before each release.
- [ ] Generate/review Xcode privacy report before submission.

## 5.5 Permission strings
Each permission must have a specific user-facing reason and a denial path.
- [ ] Camera.
- [ ] Family Controls / Screen Time authorization flow.
- [ ] Notifications, only if MVP genuinely uses them.
- [ ] Any additional permission added later requires review of policy, privacy labels and UI explanation.

## 5.6 Health / wellness positioning
- [ ] Do not make diagnosis, treatment, guaranteed sexual-performance, testosterone, ED, erection-strength, or medical-effect claims without evidence/regulatory basis.
- [ ] Preserve positioning as performance / wellness / consistency.
- [ ] Do not add HealthKit merely to make the product look more advanced; only add it for a concrete MVP need.

---

# 6. Legal, website and support

- [ ] Public company/app website.
- [ ] App landing page.
- [ ] Privacy Policy page.
- [ ] Terms of Use / EULA page or documented decision to use Apple's Standard EULA.
- [ ] Support page with working contact email.
- [ ] Business/domain email monitored during review and after launch.
- [ ] Founder/company IP ownership is documented.
- [ ] Maintain an asset-license ledger for fonts, icons, illustrations, AI-generated coach assets, music/Suno, sound effects and stock assets.
- [ ] No third-party trademarks, screenshots or copyrighted materials without permission.

---

# 7. App Store Connect metadata and compliance

- [ ] App name.
- [ ] Subtitle.
- [ ] Description.
- [ ] Keywords.
- [ ] Category.
- [ ] Support URL.
- [ ] Privacy Policy URL.
- [ ] Terms/EULA metadata.
- [ ] Copyright / legal entity.
- [ ] Age-rating questionnaire completed conservatively based on actual mature/suggestive/wellness content.
- [ ] Store screenshots use real implemented screens and do not imply unimplemented features.
- [ ] Screenshots and copy avoid explicit sexual imagery and unsupported medical claims.
- [ ] If app is intentionally iPhone-only, ensure device-family configuration actually matches; do not accidentally ship iPad support.
- [ ] If iPad support is enabled, design/test iPad properly and provide valid screenshots.
- [ ] Decide distribution storefronts deliberately instead of enabling every territory by default.
- [ ] Complete DSA trader status even if EU is not in the first launch, as App Store Connect may request declaration.

---

# 8. Export compliance

- [ ] Determine whether app/SDKs use encryption beyond exempt platform-provided encryption.
- [ ] Set `ITSAppUsesNonExemptEncryption` correctly.
- [ ] Complete App Store Connect export-compliance questions/documentation if required.
- [ ] Re-check when adding networking/security SDKs.

---

# 9. Release test matrix

## Core product
- [ ] Fresh install.
- [ ] Onboarding skip/back/interrupt paths.
- [ ] First routine works without account.
- [ ] Save-progress/account prompt after first routine.
- [ ] App selection works.
- [ ] Lock activates at intended time.
- [ ] Completing before lock time prevents that day's lock according to Phase 02 rules.
- [ ] Grace behavior works exactly as Phase 02 specifies.
- [ ] Skip Today behavior works exactly as Phase 02 specifies and streak behavior is correct.
- [ ] Completion unlocks selected apps.
- [ ] Routine deck/cycle does not repeat movement before cycle reset.
- [ ] Set/rest logic works.
- [ ] Camera counts expected reps and handles failure states.
- [ ] Temporary pose-tracking loss preserves completed reps and does not reset the current set.
- [ ] Unrecoverable tracking failure offers assisted completion and still allows the daily requirement to complete and selected apps to unlock.

## System edge cases
- [ ] Permission denied.
- [ ] Permission revoked in iOS Settings.
- [ ] Device reboot.
- [ ] App killed from memory.
- [ ] Background/foreground transition.
- [ ] Time-zone change.
- [ ] Daylight-saving transition.
- [ ] Date crosses midnight during a routine.
- [ ] Weak/no network for account/subscription-dependent flows.
- [ ] Latest supported iOS release.
- [ ] Minimum supported iOS release before launch decision.

## Account / purchase
- [ ] Sign up / sign in / sign out.
- [ ] Account deletion.
- [ ] Sign in with Apple deletion/token-revocation path.
- [ ] All subscription states in Section 4.4.

## Quality
- [ ] No crashes.
- [ ] No placeholder text/images/buttons.
- [ ] Every link works.
- [ ] Empty/loading/error states.
- [ ] Dynamic Type / long text does not break critical screens.
- [ ] Accessibility basics: labels, contrast, tappable targets.
- [ ] Fixed dark visual system behaves correctly if the product intentionally does not follow system light mode.

---

# 10. App Review package

- [ ] Family Controls distribution entitlement Assigned for app + required extensions.
- [ ] Review Notes explain the exact core loop: selected apps → scheduled accountability lock → routine → on-device verification → unlock.
- [ ] Explain that camera analysis is local and raw video is not uploaded/stored in MVP.
- [ ] Explain subscription value and avoid wording that suggests charging for Screen Time API/camera capability itself.
- [ ] Give exact reviewer steps for Family Controls authorization and app selection.
- [ ] Provide demo account credentials if any reviewable feature needs login.
- [ ] Confirm sandbox subscriptions load and purchase successfully.
- [ ] If a feature/environment is difficult to reproduce, prepare a short demo video for App Review if requested/appropriate.
- [ ] App Review contact information is monitored.
- [ ] All new features are described specifically in Notes for Review.

---

# 11. Launch gate

Do not submit because “development is finished.” Submit only when all five gates are green:

**Gate A — Core loop:** Lock → Train → Verify → Complete → Unlock works on a real iPhone.

**Gate B — Apple capability:** Family Controls distribution entitlement is ready for every relevant target.

**Gate C — Commerce:** Organization/account, Paid Apps Agreement, tax/bank, RevenueCat, subscriptions, Small Business Program and sandbox path are ready.

**Gate D — Privacy/compliance:** Privacy policy, data map, labels, manifest, SDK audit, age rating, export compliance and legal links are complete.

**Gate E — Reviewability:** Reviewer can reproduce the product and paid flow without guessing.

---

# 12. Post-launch

- [ ] Monitor crashes / critical technical failures.
- [ ] Monitor Family Controls reliability by iOS version.
- [ ] Track first-routine completion, trial starts, trial→paid, D1/D3/D7 retention and lock-related churn.
- [ ] Track subscription errors separately from product churn.
- [ ] Respond to support requests and App Store reviews.
- [ ] Keep privacy labels and SDK inventory synchronized with every release.
- [ ] Re-check App Review Guidelines before every major release because Apple policies are living documents.
