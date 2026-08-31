import ExpoModulesCore
import UserNotifications

public final class VAELUserPreferencesAppDelegateSubscriber: ExpoAppDelegateSubscriber, UNUserNotificationCenterDelegate {
  @MainActor
  public func subscriberDidRegister() {
    UNUserNotificationCenter.current().delegate = self
  }

  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .sound])
  }
}
