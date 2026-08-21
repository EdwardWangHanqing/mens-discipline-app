# Family Controls Reliability & Release Baseline

**Phase:** 03.11

**Status:** Real-device acceptance passed on 2026-08-20

**Device:** Clover — iPhone 13, iOS 26.6

## Scope

Phase 03.11 hardens and verifies the existing Family Controls architecture. It
does not add a product feature, change the accountability model, begin Phase 04,
or claim TestFlight/App Store release readiness.

The implementation adds an idempotent authorization-safety reconciliation. When
the native authorization state is definitively `denied`, the app cancels known
Device Activity schedules and removes known shields while preserving the opaque
saved `FamilyActivitySelection`. A transient cold-launch `notDetermined` state
does not trigger cleanup. A failed authorization request is followed by a fresh
native status resolution so the UI reports the real denied or approved state.

No selected-app token contents cross the React Native bridge. No capability,
permission, SDK, Bundle ID, App Group, collected-data category, or subscription
behavior changed.

## Real-device acceptance evidence

All tests below were performed by the owner on Clover on 2026-08-20.

1. **Release / no Metro — PASS.** A signed Release configuration build cold
   launched directly on the device while Metro was completely stopped. The
   bundled JavaScript loaded and `No script URL provided` did not appear.
2. **Authorization revoke / denied / recovery — PASS.** Revoking Family Controls
   authorization was detected as `denied`; the schedule became inactive, the
   shield was removed, and the saved selection remained. Rejecting a new request
   kept the state denied and protected actions unavailable. Approving again
   recovered `approved / approvedWithDataAccess` with the same saved selection.
3. **Force-quit / Incomplete — PASS.** With the main app fully terminated, the
   Device Activity schedule fired and the selected app displayed Apple's
   `Restricted` screen. Reopening preserved the selection and Incomplete
   accountability, with `intervalDidStart / appliedShield` recorded.
4. **Force-quit / Completed — PASS.** With Completed accountability and the main
   app fully terminated, the scheduled callback left the selected app usable.
   Reopening without Metro preserved the selection and completion state, with
   `intervalDidStart / skippedCompletedToday` recorded.
5. **Reboot — PASS.** Starting from Incomplete with a one-off schedule, the owner
   force-quit the app and rebooted the iPhone. After the scheduled time, the
   selected app displayed `Restricted`. Reopening without Metro preserved
   authorization, selection, and Incomplete accountability, with
   `intervalDidStart / appliedShield` recorded.

## Build and entitlement evidence

- Strict TypeScript, Expo lint, deterministic guided-routine tests, and public
  Expo configuration inspection passed.
- Expo Doctor passed 20 of 21 checks. Its only failure was existing SDK 57 patch
  drift across seven Expo packages; no dependency was upgraded in this scoped
  reliability checkpoint.
- Clean Expo CNG generation and CocoaPods installation passed.
- A clean unsigned Release generic-iPhoneOS workspace build passed and contained
  an embedded `main.jsbundle` plus the Device Activity Monitor extension.
- A signed Release configuration build installed and launched on Clover. Its
  development provisioning profiles contained Family Controls and the shared App
  Group for both the host and monitor targets.
- In the Apple Developer portal, the owner confirmed Family Controls
  (Distribution) is `Assigned` for
  `com.temperline.mensdiscipline.deviceactivitymonitor`. The main-app
  Distribution capability was already Assigned.

`Assigned` in the portal proves the capability request status. It does not by
itself prove that a distribution archive, App Store provisioning profile, or
TestFlight build is correctly signed and operational. The on-device Release
build used development provisioning and must not be represented as a TestFlight
validation.

## Remaining release and reliability risks

- timezone changes and daylight-saving transitions;
- midnight/date-boundary behavior;
- supported iOS-version coverage beyond Clover on iOS 26.6;
- distribution archive/profile inspection and actual TestFlight operation;
- picker Cancel/interactive-dismiss and corrupt scheduled-selection negative
  paths;
- final production Lock Time, Grace Extension, Skip Today, Replace Movement, and
  guided-session recovery UX.

These remaining items should stay explicit beta/release gates. They do not erase
the Phase 03.11 feasibility evidence above.
