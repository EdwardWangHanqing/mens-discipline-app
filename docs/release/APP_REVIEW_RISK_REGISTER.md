# Men's Discipline App — App Review & Launch Risk Register

**Last updated:** 2026-08-14

**Purpose:** Make review/compliance risks explicit early instead of discovering them at submission. This register tracks risk; it does not redefine locked MVP behavior.

| ID | Risk | Severity | When to resolve | Mitigation / evidence |
|---|---|---:|---|---|
| R-01 | Family Controls Distribution entitlement not approved for main app or an extension | P0 | Phase 03–08 | Request early; request separately for every required target; track Assigned status; preserve entitlement explanation. |
| R-02 | Guideline 4.10 explicitly names camera and Screen Time APIs; Apple provides no explicit safe harbor for this product's monetization structure | P1 | Monetization + submission | Existing approved paid apps suggest these capabilities can be integrated into paid products in practice, but approval is not guaranteed. Do not change the locked subscription model solely because of 4.10. Review the final paywall, metadata, value proposition, and Review Notes before submission; address any concrete Apple concern and record resulting product changes explicitly. |
| R-03 | Screen Time scheduling/DeviceActivity behavior unreliable on target iOS versions | P0 | Phase 03 + beta | Real-device tests; reboot/timezone/DST tests; version-specific telemetry; graceful failure state. |
| R-04 | App positioned as sexual gratification / explicit sexual content rather than wellness/performance | P0 | Brand, UI, Store listing | Preserve non-explicit performance/wellness positioning; conservative visuals/copy/age rating. |
| R-05 | Unsupported medical/sexual-performance claims trigger heightened review | P0 | Copy + launch | No ED treatment, testosterone, guaranteed erection/sexual-performance claims; document methodology for any measurement claims. |
| R-06 | Subscription lacks ongoing value or reviewer cannot understand value | P0 | Phase 13 | Explain ongoing proprietary training/accountability value; keep IAP model obvious in metadata/review notes. |
| R-07 | Paywall pricing/trial disclosure rejected | P0 | Phase 13–15 | Full billed price most prominent; explicit 3-day trial and post-trial price; renewal/cancel wording; Terms + Privacy + Restore. |
| R-08 | Sandbox/TestFlight purchase fails for reviewer | P0 | Phase 15 | Production-like TestFlight test; product metadata complete; RevenueCat mappings; restore/expired/cancelled paths tested. |
| R-09 | Forced login with insufficient account-based value | P1 | UX architecture | Preserve no-login first routine; only require account for genuine account features. |
| R-10 | Account creation exists but in-app deletion/token revocation missing | P0 | Account implementation | In-app delete; server deletion; Sign in with Apple revocation where applicable. |
| R-11 | App Privacy labels mismatch SDK behavior | P0 | Phase 14–15 | Maintain data map + SDK inventory; re-audit every SDK release. |
| R-12 | Invalid/missing Privacy Manifest or Required Reason API declaration | P0 | Every release | `PrivacyInfo.xcprivacy`; Xcode privacy report; third-party SDK manifest/signature audit. |
| R-13 | Reviewer cannot reproduce Family Controls/camera flow | P0 | Submission | Exact review notes, demo account, clear setup steps, demo video if needed. |
| R-14 | App accidentally ships iPad support without real iPad UX/screenshots | P1 | Build config | Make iPhone-only decision explicit; configure target accordingly, or fully support iPad. |
| R-15 | Broken Privacy/Terms/Support links | P0 | Submission | Automated/manual preflight check; monitored support mailbox. |
| R-16 | Age rating inconsistent with mature/suggestive/wellness content | P1 | App Store metadata | Complete questionnaire conservatively based on real content; no explicit imagery. |
| R-17 | Export-compliance questionnaire/doc missing | P1 | First TestFlight/App Store build | Determine encryption use; configure Info.plist / App Store Connect correctly. |
| R-18 | EU DSA trader details block EU distribution or expose unexpected contact details | P1 | Before EU storefront | Decide territories early; verify business contact details before enabling EU. |
| R-19 | Seller/legal entity not converted before public launch | P1 | Before App Store submission | Individual for development only; Organization conversion before commercial listing. |
| R-20 | Small Business Program not effective at launch | P1 | Before launch | Apply after Organization + Paid Apps Agreement, with lead time; verify status before real paid sales. |
| R-21 | Third-party asset/license issue (music/fonts/icons/AI/UGC) | P1 | Asset finalization | Maintain license ledger and commercial-use evidence; company owns/has license to submitted assets. |
| R-22 | Secrets/API keys committed to Git | P0 | Development | `.gitignore`, environment/secret management, rotate exposed credentials immediately, least-privilege keys. |
| R-23 | Lock schedule breaks around midnight, timezone, DST, app termination or reboot | P0 | Phase 03–15 | Explicit state machine + persistence; system-edge test suite. |
| R-24 | Subscription/account state diverges across reinstall/device/account | P1 | Phase 13–15 | RevenueCat entitlement source of truth + restore path + identity mapping strategy. |
| R-25 | Strict framing or pose false negatives prevent an honest user from completing the routine or unlocking selected apps | P0 | Phase 03 + beta | Movement-specific minimum joints; tolerant state machine; preserve counted reps; calm framing recovery; assisted completion that can satisfy the routine and unlock; real-device tests across room size, crop, lighting, clothing, and interruption. |
| R-26 | Family Controls authorization status is transiently reported as `notDetermined` immediately after cold launch even though persisted authorization is `approved` moments later | P0 | Phase 03 before app selection/lock state relies on authorization | Reproduced twice on a physical iPhone; investigate lifecycle/service timing, observe or retry status safely, and test approved/denied/revoked cold-launch behavior before authorization state drives product decisions. |

## Exit rule
No public App Store submission while any P0 risk is unresolved or lacks a documented mitigation/test result.
