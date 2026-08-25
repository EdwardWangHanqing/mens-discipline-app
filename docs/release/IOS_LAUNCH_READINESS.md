# Men's Discipline App — iOS Launch Readiness Checklist

**Status:** Operational source of truth for iOS release readiness

**Last verified against Apple rules and current device evidence:** 2026-08-22

**Priority:** latest explicitly accepted decision / `docs/DECISIONS.md` > `docs/product/MVP_SCOPE.md` > `docs/product/MASTER_PRODUCT_PLAN.md` > this operational checklist.

> This file does not redefine product scope. It turns the locked MVP into a concrete path from prototype to TestFlight and App Store submission.

## 0. Locked product assumptions this checklist must not override

- iOS first; Android later, with cross-platform architecture reserved.
- First value experience does **not** force login.
- Exactly one full free routine is completed before the user is asked to create/sign in to an account; earned progress/history remains visible if they decline.
- Account creation/sign-in is required before starting Trial / Subscription.
- Account direction: Apple + Google + Email; Phone OTP is not an MVP priority.
- 3-day free trial is locked; subscription plans are Monthly $9.99/month and Annual $39.99/year. Annual is default/recommended; 3-Month is removed.
- Paywall may be closed. Closing it does not grant ongoing free daily training. No active training entitlement means no active accountability lock.
- Daily training structure is exactly 1 movement/day, a 7-movement cycle without repetition, exactly 5 sets, exactly 20 guided reps/set, and exactly 20s rest; cadence is movement-specific.
- MVP uses guided cadence training. Camera/Vision is not an MVP feature, completion path, permission, reviewer flow, or release requirement.

---

# 1. P0 Go / No-Go gates — must happen before full UI polish

## 1.1 Family Controls technical feasibility
- [x] Enroll in Apple Developer Program early enough to test Family Controls on a real iPhone.
- [x] Validate paid Individual-team Automatic Signing, physical-device registration, development provisioning, and the signed main-app Family Controls development entitlement.
- [x] Present the real `.individual` system authorization flow on a physical iPhone and read `approved` after the owner allows access.
- [x] Safely handle the initial `notDetermined` value for the approved cold-launch path by observing Apple's publisher, displaying `checking`, reading after App active, and using bounded retries; five consecutive real-device cold starts automatically resolved to `approved` without manual refresh or another authorization prompt.
- [x] Validate the implemented `FamilyActivityPicker` save, modify, and empty-selection paths plus local opaque-selection persistence on the physical iPhone.
- [ ] Validate picker Cancel / interactive-dismiss behavior on the physical iPhone; the implementation exists but this path was not included in the reported owner evidence.
- [x] Validate the implemented named-store Apply Shield → Remove Shield path on explicitly selected apps, including repeated apply/remove.
- [x] Build and validate the smallest direct App Selection → Shield/Lock → Unlock diagnostic prototype.
- [x] Verify user-selected apps display Apple's `Restricted` screen when shielded and return to normal access after removal.
- [x] Implement the repository-side Device Activity architecture with one embedded Device Activity Monitor extension, App Group shared state, production-shaped recurring schedule, separate one-off diagnostic schedule, incomplete/completed branches, and visible recovery/reset controls.
- [x] Pass CNG, standalone extension/native-module builds, and full unsigned Simulator/generic-iPhoneOS Debug builds; inspect the embedded monitor extension point and host/extension version match.
- [x] Refresh the development-team login in Xcode and produce Xcode-managed development profiles for both targets containing Family Controls and the shared App Group.
- [x] On a physical iPhone, prove one-off schedule → system callback → automatic shield while Incomplete with the main app inactive; no manual Apply Shield tap.
- [x] On a physical iPhone, prove the same callback suppresses shielding while Completed and record the non-sensitive callback outcome.
- [x] Validate same-activity schedule replacement plus Cancel/Reset recovery without a stranded restriction. Empty-selection recovery remains covered by the Phase 03.7 manual path; scheduled empty/corrupt callback branches remain separate negative tests.
- [x] Verify authorization denied/revoked behavior: revoke resolved to `denied`,
      cancelled schedules and removed shields without deleting the saved
      selection; denied re-request stayed unavailable; approval recovery restored
      `approved / approvedWithDataAccess` and retained the selection.
- [x] Verify the saved selection remains available after the Debug development relaunch workflow once Metro connectivity is restored.
- [x] Verify a signed Release configuration build after full app termination and
      direct cold launch with Metro completely stopped; bundled JavaScript loaded
      without `No script URL provided`. This used development provisioning and is
      not an actual TestFlight validation.
- [x] Verify Incomplete and Completed Device Activity outcomes while the main app
      is force-quit, including persisted selection/accountability and
      `appliedShield` / `skippedCompletedToday` callback evidence.
- [x] Verify Family Controls behavior after device reboot: an Incomplete one-off
      schedule applied the shield and persisted authorization, selection and
      accountability across force-quit plus reboot.
- [ ] Verify an actual distribution archive and TestFlight build independently of
      Metro.
- [ ] Verify daily schedule behavior across time-zone changes and daylight-saving transitions.
- [ ] Test on the current shipping iOS release before considering the technical risk closed.

Phase 03.7 Debug-build observation: force-quitting and reopening the installed Debug build while Metro was unavailable displayed `No script URL provided`. Restoring Metro and relaunching restored the React Native UI and persisted selection. Phase 03.11 supersedes the release-bundle concern with a signed Release configuration cold-launch pass while Metro was fully stopped. Actual TestFlight behavior remains untested.

Phase 03.8 development status: the repository defines App Group `group.com.temperline.mensdiscipline` for the host and `com.temperline.mensdiscipline.deviceactivitymonitor` extension. After the team login was restored, Automatic Signing produced valid development profiles for both targets containing Family Controls and the App Group. The signed build installed on the paired iPhone 13. Incomplete produced `intervalDidStart / appliedShield` plus Apple's `Restricted` UI with the host inactive; Completed produced `intervalDidStart / skippedCompletedToday` while the same selected app stayed usable. Replacement and final Cancel left both schedules inactive and no diagnostic shield active. This does not validate the extension's separate Distribution entitlement, Release/TestFlight behavior, force-quit/reboot, midnight, timezone, or DST reliability.

Phase 03.11 reliability status: on Clover (iPhone 13, iOS 26.6), the owner passed
revoke/deny/re-approval recovery, Release/no-Metro cold launch, force-quit
Incomplete and Completed scheduling, and an Incomplete callback after reboot.
The extension Distribution capability now shows `Assigned` in the developer
portal. Midnight, timezone/DST, multi-iOS, distribution archive/profile and
actual TestFlight behavior remain explicit release gates.

## 1.2 Family Controls distribution entitlement
- [x] Preserve the explicit main-app identifier `com.temperline.mensdiscipline`.
- [x] Register/confirm the explicit Device Activity Monitor App ID `com.temperline.mensdiscipline.deviceactivitymonitor`; Automatic Signing produced its valid development profile. This is the only Screen Time extension introduced in Phase 03.8.
- [x] Request Family Controls **Distribution** entitlement for the main-app path.
- [x] Confirm Apple assigned Family Controls (Distribution) to the developer account for the main-app path.
- [x] Submit the separate Family Controls **Distribution** entitlement request for `com.temperline.mensdiscipline.deviceactivitymonitor`. No request is needed for unused Report / Shield Action / Shield Configuration extensions because those targets do not exist.
- [x] Confirm Family Controls (Distribution) is `Assigned` in the Apple Developer portal for `com.temperline.mensdiscipline.deviceactivitymonitor`.
- [ ] Validate the main-app distribution entitlement in the eventual distribution provisioning/archive/TestFlight path before submission.
- [ ] Validate the monitor extension entitlement in the eventual distribution provisioning/archive/TestFlight path before submission.
- [ ] Keep entitlement request explanation consistent with App Store positioning: accountability / focus / wellness, not covert surveillance.

## 1.3 Monetization-policy review — Guideline 4.10 (P1 review watch item, not a technical blocker)
Apple Guideline 4.10 explicitly names Screen Time APIs in its restriction on monetizing built-in operating-system capabilities and Apple services or technologies. Camera is no longer part of the MVP release package.

Existing approved paid apps that integrate Screen Time suggest that it can be part of a paid product in practice. However, Apple does not provide an explicit safe harbor for this product's specific implementation or monetization structure. Guideline 4.10 therefore remains a P1 App Review and packaging risk.

Before finalizing App Store copy and paywall packaging:
- [ ] Describe paid value as the complete proprietary training/accountability product: programming, guided routine system, progress/momentum, coaching/content, history, personalization, etc.
- [ ] Do not market the purchase as a fee simply to “access Screen Time” or another Apple-provided capability.
- [ ] Review the final paywall, metadata, value proposition, and Review Notes specifically for Guideline 4.10 risk before submission.
- [ ] Explain how Screen Time integrates with the app's proprietary functionality without claiming that this packaging guarantees approval.
- [ ] Do **not** change the locked subscription model or force a free basic-lock tier solely because of Guideline 4.10.
- [ ] If App Review specifically raises 4.10, address the concrete concern and record any resulting product change explicitly.

## 1.4 Guided training / completion validation gates

### Phase 03.9 historical finding
- [x] Demonstrate an on-device AVFoundation → Apple Vision → movement-state prototype for Kneeling Drive.
- [x] Record the accepted finding: technical pose/counting capability demonstrated; mandatory MVP UX feasibility rejected because framing/tracking/calibration friction is too high.
- [x] Preserve the implementation as a post-MVP R&D checkpoint while removing its route, camera purpose string, and live runtime from the MVP surface.

These are historical evidence, not Camera production gates. No seven-movement
Camera validation or Camera reviewer flow is required for MVP.

### Phase 03 Technical Feasibility exit
- [x] Prove guided routine completion → shared accountability completion → selected-app unlock/suppression on a real iPhone.
- [x] Verify exactly five sets and 20-second rests without hard-coding one universal repetition target or cadence.
- [x] Verify interruption/background recovery cannot falsely grant completion or
      strand a denied user behind known shields; Phase 03.11 additionally
      preserved correct Incomplete/Completed scheduling across force-quit and
      recovery.

### Guided Training Engine / before Beta
- [x] Lock the repetition target at exactly 20 guided reps per set for every movement.
- [ ] Define cadence/tempo separately for each of the seven movements.
- [ ] Validate demonstration, countdown, set transitions, 20-second rests, routine completion, and recovery for all seven movement specifications.
- [ ] Validate approved Coach assets, audio/haptics, and visual progress behavior after those decisions are made.

---

# 2. Apple Developer + business readiness track

This track runs in parallel with development; it must not block coding.

## 2.1 Developer account path
- [x] Start development using an Individual Apple Developer membership if company setup is still pending.
- [ ] Deferred by DEC-022: incorporate only after a future owner decision; not a
      first-launch blocker.
- [ ] Deferred by DEC-022: obtain D-U-N-S only for a future Organization
      transition; not a first-launch blocker.
- [ ] Prepare the support email and public app website required for first launch;
      a company-domain identity for future Organization verification is deferred.
- [ ] Deferred by DEC-022: request Individual → Organization conversion only
      after a future owner decision; not a first-launch blocker.
- [ ] Avoid creating a second unrelated Developer account unless there is a clear reason; prefer converting the existing membership.

## 2.2 Paid business setup — current Individual account
- [ ] Accept the Paid Apps Agreement.
- [ ] Submit required Canadian tax information, including GST/HST information required by Apple for Canada-based developers.
- [ ] Add banking information that matches the current Individual account holder
      for first-launch commerce setup.
- [ ] Apply to the App Store Small Business Program after the Paid Apps Agreement
      is active and current account details are verified.
- [ ] Do not wait until launch day to apply to the Small Business Program; allow time for the reduced commission to become effective.

## 2.3 EU territory decision
- [ ] Decide MVP storefronts (e.g., Canada / U.S. / other English-speaking markets / EU).
- [ ] If distributing in the EU, complete DSA trader-status assessment and verification.
- [ ] Review what business address / phone / email Apple will display publicly for EU trader compliance before enabling EU storefronts.

---

# 3. Account architecture and deletion

## 3.1 Login timing
- [x] Preserve the Phase 04 decision: the first complete product experience, including exactly one full free routine, works without an account.
- [x] Ask for account creation/sign-in after first routine completion; the user may decline and retain locally earned progress/history in a limited signed-out Home state.
- [x] Require account creation/sign-in before Trial / Subscription; do not repeatedly force the account screen on app open.
- [ ] Document and implement which features require an account (paid training, cloud sync, cross-device history, subscription restoration linkage, etc.).

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
- [ ] Monthly product created at the locked reference price of USD $9.99/month.
- [ ] Annual product created at the locked reference price of USD $39.99/year and configured as the default/recommended option.
- [ ] 3-day free trial configured as the intended introductory offer.
- [ ] Product IDs follow a permanent naming convention and match App Store Connect / RevenueCat / code exactly.
- [ ] Product display names, descriptions, review screenshots, pricing and availability are complete.
- [ ] First subscription is submitted with the first app version as required.

## 4.2 RevenueCat
- [ ] Products imported/mapped correctly.
- [ ] Entitlement naming is stable and simple.
- [ ] Offering contains only the intended Monthly / Annual packages; 3-Month is removed.
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
- [ ] Paywall can be closed; closing it does not grant ongoing free daily training.
- [ ] No active training entitlement results in no active accountability lock.
- [ ] App Store description clearly indicates which showcased functionality requires subscription when relevant.

## 4.4 Subscription state testing
Test in local StoreKit **and** real Sandbox/TestFlight.
- [ ] Eligible free-trial purchase.
- [ ] Non-eligible trial user.
- [ ] Monthly purchase.
- [ ] Annual purchase.
- [ ] Restore purchase.
- [ ] Cancelled but still active until expiration.
- [ ] Expired.
- [ ] Restore does not reactivate a fully expired subscription or undo cancellation.
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

At minimum audit: account identifiers, email, routine history, streak/momentum,
selected-app tokens, guided-training events, analytics events, subscription
identifiers, and crash diagnostics. Camera frames/pose landmarks are not MVP data
types; reassess them only if post-MVP Camera R&D becomes a product feature.

Current Phase 03.7 evidence: `FamilyActivitySelection` is encoded only in local app storage through Apple's `Codable` conformance. JavaScript receives storage state and aggregate token counts only; token contents are not logged, uploaded, reverse-engineered, or exposed through the bridge. Physical-iPhone validation observed 5 application tokens, 1 category token, and 0 web-domain tokens; clearing the picker retained a saved but empty selection with all counts at zero and disabled Apply Shield. Final retention/deletion behavior must still be defined before release.

Historical Phase 03.9 evidence: the feasibility build processed camera frames in
memory and exposed only derived pose/count diagnostics. It did not record,
persist, upload, or bridge raw frames and added no third-party pose SDK. The live
runtime and camera purpose string are absent from the current MVP source.

## 5.2 Privacy Policy
- [ ] Explains what is collected and what is not collected.
- [ ] Does not claim the MVP uses camera processing; explains any future camera behavior only if that feature is explicitly reintroduced.
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
- [x] Camera is not requested by MVP; no Camera purpose string is present.
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
- [ ] Each routine runs exactly five sets with 20-second rests.
- [ ] Per-movement repetition targets and cadence load from movement specifications rather than one universal hard-coded value.
- [ ] Demonstration, countdown, guided repetitions, set completion, rest, next-set, routine-completion, and interruption/recovery paths work.
- [ ] Routine completion updates accountability state and unlocks/suppresses the selected-app shield without Camera proof.

## System edge cases
- [x] Family Controls permission denied.
- [x] Family Controls permission revoked in iOS Settings.
- [x] Device reboot on Clover (iPhone 13, iOS 26.6).
- [x] App killed from memory for Incomplete and Completed schedule paths.
- [x] Background/foreground transition for unfinished guided-routine recovery.
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

- [x] Family Controls distribution entitlement Assigned at the developer-account
      level for the main app and the only introduced Screen Time extension.
- [ ] Validate both entitlements in the distribution
      provisioning/archive/TestFlight path.
- [ ] Review Notes explain the exact core loop: selected apps → scheduled accountability lock → guided routine → completion → unlock.
- [ ] Do not include Camera setup, Camera privacy claims, or pose-counting steps in the MVP reviewer flow.
- [ ] Explain subscription value and avoid wording that suggests charging for Screen Time API capability itself.
- [ ] Give exact reviewer steps for Family Controls authorization and app selection.
- [ ] Provide demo account credentials if any reviewable feature needs login.
- [ ] Confirm sandbox subscriptions load and purchase successfully.
- [ ] If a feature/environment is difficult to reproduce, prepare a short demo video for App Review if requested/appropriate.
- [ ] App Review contact information is monitored.
- [ ] All new features are described specifically in Notes for Review.

---

# 11. Launch gate

Do not submit because “development is finished.” Submit only when all five gates are green:

**Gate A — Core loop:** Lock → guided training → Complete → Unlock works on a real iPhone.

**Gate B — Apple capability:** Family Controls distribution entitlement is ready for every relevant target.

**Gate C — Commerce:** Current Individual account, Paid Apps Agreement,
tax/bank, RevenueCat, subscriptions, Small Business Program and sandbox path are
ready. Organization conversion is deferred by DEC-022 and is not a first-launch
gate.

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
