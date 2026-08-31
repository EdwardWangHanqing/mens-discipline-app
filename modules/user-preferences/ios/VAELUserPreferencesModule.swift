import ExpoModulesCore
import UIKit
import UserNotifications

private let dailyRevealIdentifier = "vael.notification.daily-reveal"
private let beforeLockIdentifier = "vael.notification.before-lock"

public class VAELUserPreferencesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VAELUserPreferences")

    AsyncFunction("getNotificationAuthorizationStatus") { () async -> String in
      let settings = await UNUserNotificationCenter.current().notificationSettings()
      return Self.authorizationStatusString(settings.authorizationStatus)
    }

    AsyncFunction("requestNotificationAuthorization") { () async throws -> String in
      _ = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound])
      let settings = await UNUserNotificationCenter.current().notificationSettings()
      return Self.authorizationStatusString(settings.authorizationStatus)
    }

    AsyncFunction("syncNotificationSchedules") {
      (dailyReveal: Bool, beforeLock: Bool, lockHour: Int, lockMinute: Int) async throws -> Void in
      let center = UNUserNotificationCenter.current()
      center.removePendingNotificationRequests(withIdentifiers: [dailyRevealIdentifier, beforeLockIdentifier])

      let settings = await center.notificationSettings()
      guard Self.canSchedule(settings.authorizationStatus) else { return }

      if dailyReveal {
        let content = UNMutableNotificationContent()
        content.title = "Today’s movement is ready"
        content.body = "Open VAEL when you’re ready to reveal it."
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(
          dateMatching: DateComponents(hour: 6, minute: 0),
          repeats: true
        )
        try await center.add(UNNotificationRequest(
          identifier: dailyRevealIdentifier,
          content: content,
          trigger: trigger
        ))
      }

      if beforeLock {
        let totalMinutes = ((lockHour * 60 + lockMinute - 30) % (24 * 60) + (24 * 60)) % (24 * 60)
        let reminderHour = totalMinutes / 60
        let reminderMinute = totalMinutes % 60
        let content = UNMutableNotificationContent()
        content.title = "Lock time is approaching"
        content.body = "Your daily routine window closes in 30 minutes."
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(
          dateMatching: DateComponents(hour: reminderHour, minute: reminderMinute),
          repeats: true
        )
        try await center.add(UNNotificationRequest(
          identifier: beforeLockIdentifier,
          content: content,
          trigger: trigger
        ))
      }
    }

    AsyncFunction("sendMilestoneNotification") { (title: String, body: String) async throws -> Void in
      let center = UNUserNotificationCenter.current()
      let settings = await center.notificationSettings()
      guard Self.canSchedule(settings.authorizationStatus) else { return }

      let content = UNMutableNotificationContent()
      content.title = title
      content.body = body
      content.sound = .default
      let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
      try await center.add(UNNotificationRequest(
        identifier: "vael.notification.milestone.\(UUID().uuidString)",
        content: content,
        trigger: trigger
      ))
    }

    Function("performHaptic") { (kind: String) in
      DispatchQueue.main.async {
        switch kind {
        case "success":
          UINotificationFeedbackGenerator().notificationOccurred(.success)
        case "selection":
          UISelectionFeedbackGenerator().selectionChanged()
        default:
          UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        }
      }
    }
  }

  private static func canSchedule(_ status: UNAuthorizationStatus) -> Bool {
    status == .authorized || status == .provisional || status == .ephemeral
  }

  private static func authorizationStatusString(_ status: UNAuthorizationStatus) -> String {
    switch status {
    case .notDetermined:
      return "notDetermined"
    case .denied:
      return "denied"
    case .authorized:
      return "authorized"
    case .provisional:
      return "provisional"
    case .ephemeral:
      return "ephemeral"
    @unknown default:
      return "unknown"
    }
  }
}
