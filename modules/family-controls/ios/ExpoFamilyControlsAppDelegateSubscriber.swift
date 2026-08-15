import ExpoModulesCore
import UIKit

public final class ExpoFamilyControlsAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  @MainActor
  public func subscriberDidRegister() {
    FamilyControlsAuthorizationTimeline.shared.recordAppState(
      "initializing",
      at: Date().timeIntervalSince1970 * 1_000
    )
  }

  public func applicationDidBecomeActive(_ application: UIApplication) {
    FamilyControlsAuthorizationTimeline.shared.recordAppState(
      "active",
      at: Date().timeIntervalSince1970 * 1_000
    )
  }

  public func applicationWillResignActive(_ application: UIApplication) {
    FamilyControlsAuthorizationTimeline.shared.recordAppState(
      "inactive",
      at: Date().timeIntervalSince1970 * 1_000
    )
  }

  public func applicationDidEnterBackground(_ application: UIApplication) {
    FamilyControlsAuthorizationTimeline.shared.recordAppState(
      "background",
      at: Date().timeIntervalSince1970 * 1_000
    )
  }
}
