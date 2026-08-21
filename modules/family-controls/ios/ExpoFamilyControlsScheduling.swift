import DeviceActivity
import Foundation

enum FamilyControlsSchedulingError: LocalizedError {
  case invalidDailyLockTime
  case invalidDiagnosticDelay
  case selectionUnavailable(String)
  case emptySelection

  var errorDescription: String? {
    switch self {
    case .invalidDailyLockTime:
      return
        "Choose a daily Lock Time from 00:00 through 23:44 so the monitoring interval meets Apple's 15-minute minimum."
    case .invalidDiagnosticDelay:
      return "The diagnostic event must be scheduled 1 to 10 minutes in the future."
    case .selectionUnavailable(let message):
      return message
    case .emptySelection:
      return "Choose at least one app, category, or web domain before scheduling a lock."
    }
  }
}

final class FamilyControlsScheduleStore {
  private let calendar: Calendar
  private let center: DeviceActivityCenter
  private let selectionStore: FamilyControlsSelectionStore
  private let sharedStateStore: FamilyControlsSharedStateStore
  private let shieldStore: FamilyControlsShieldStore

  init(
    calendar: Calendar = .current,
    center: DeviceActivityCenter = .init(),
    selectionStore: FamilyControlsSelectionStore = .init(),
    sharedStateStore: FamilyControlsSharedStateStore = .init(),
    shieldStore: FamilyControlsShieldStore = .init()
  ) {
    self.calendar = calendar
    self.center = center
    self.selectionStore = selectionStore
    self.sharedStateStore = sharedStateStore
    self.shieldStore = shieldStore
  }

  func state() -> [String: Any?] {
    [
      "sharedStorageAvailable": sharedStateStore.isAvailable,
      "accountability": sharedStateStore.accountabilityState().summary,
      "daily": monitoringState(
        for: FamilyControlsSharedConfiguration.dailyLockActivity,
        kind: "dailyRecurring"
      ),
      "diagnostic": monitoringState(
        for: FamilyControlsSharedConfiguration.diagnosticLockActivity,
        kind: "oneOffDiagnostic"
      ),
      "lastCallback": sharedStateStore.lastCallback()?.summary,
      "lastScheduleConfiguredAtMs":
        sharedStateStore.lastScheduleConfiguredAtMs,
    ]
  }

  func scheduleDaily(hour: Int, minute: Int) throws -> [String: Any?] {
    guard
      (0...23).contains(hour),
      (0...59).contains(minute),
      hour < 23 || minute <= 44
    else {
      throw FamilyControlsSchedulingError.invalidDailyLockTime
    }

    try validateSharedSelection()

    let schedule = DeviceActivitySchedule(
      intervalStart: DateComponents(hour: hour, minute: minute),
      intervalEnd: DateComponents(hour: 23, minute: 59, second: 59),
      repeats: true
    )

    center.stopMonitoring([
      FamilyControlsSharedConfiguration.dailyLockActivity
    ])
    _ = FamilyControlsShieldStore(
      activity: FamilyControlsSharedConfiguration.dailyLockActivity
    ).remove()
    try center.startMonitoring(
      FamilyControlsSharedConfiguration.dailyLockActivity,
      during: schedule
    )
    sharedStateStore.recordScheduleConfigured()
    print(
      "[ScheduledLockDiagnostic] daily schedule registered hour=\(hour) minute=\(minute)"
    )
    return state()
  }

  func scheduleDiagnostic(minutesFromNow: Int) throws -> [String: Any?] {
    guard (1...10).contains(minutesFromNow) else {
      throw FamilyControlsSchedulingError.invalidDiagnosticDelay
    }

    try validateSharedSelection()

    let startDate = Date().addingTimeInterval(
      TimeInterval(minutesFromNow * 60)
    )
    guard
      let endDate = calendar.date(
        byAdding: .minute,
        value: 16,
        to: startDate
      )
    else {
      throw FamilyControlsSchedulingError.invalidDiagnosticDelay
    }

    let components: Set<Calendar.Component> = [
      .era,
      .year,
      .month,
      .day,
      .hour,
      .minute,
      .second,
    ]
    var startComponents = calendar.dateComponents(components, from: startDate)
    var endComponents = calendar.dateComponents(components, from: endDate)
    startComponents.calendar = calendar
    startComponents.timeZone = calendar.timeZone
    endComponents.calendar = calendar
    endComponents.timeZone = calendar.timeZone

    let schedule = DeviceActivitySchedule(
      intervalStart: startComponents,
      intervalEnd: endComponents,
      repeats: false
    )

    center.stopMonitoring([
      FamilyControlsSharedConfiguration.diagnosticLockActivity
    ])
    _ = FamilyControlsShieldStore(
      activity: FamilyControlsSharedConfiguration.diagnosticLockActivity
    ).remove()
    try center.startMonitoring(
      FamilyControlsSharedConfiguration.diagnosticLockActivity,
      during: schedule
    )
    sharedStateStore.recordScheduleConfigured()
    print(
      "[ScheduledLockDiagnostic] one-off schedule registered startMs="
        + String(startDate.timeIntervalSince1970 * 1_000) + " endMs="
        + String(endDate.timeIntervalSince1970 * 1_000)
    )
    return state()
  }

  func setAccountabilityCompletedToday(
    _ completed: Bool
  ) throws -> [String: Any?] {
    try sharedStateStore.setAccountabilityCompletedToday(completed)
    if completed {
      _ = shieldStore.remove()
    }
    print(
      "[ScheduledLockDiagnostic] accountability completedToday=\(completed)"
    )
    return state()
  }

  func completeRoutineToday() throws -> [String: Any?] {
    let previous = sharedStateStore.accountabilityState()
    let accountability = try sharedStateStore.setAccountabilityCompletedToday(
      true
    )
    let shield = shieldStore.remove()
    print(
      "[GuidedRoutine] completedToday=true alreadyCompleted=\(previous.completedToday) shieldRemoved=true"
    )
    return [
      "accountability": accountability.summary,
      "shield": shield,
      "wasAlreadyCompletedToday": previous.completedToday,
    ]
  }

  func cancelSchedulesAndRemoveShield() -> [String: Any?] {
    center.stopMonitoring([
      FamilyControlsSharedConfiguration.dailyLockActivity,
      FamilyControlsSharedConfiguration.diagnosticLockActivity,
    ])
    _ = shieldStore.remove()
    print("[ScheduledLockDiagnostic] schedules cancelled and shield removed")
    return state()
  }

  func resetDiagnostics() throws -> [String: Any?] {
    center.stopMonitoring([
      FamilyControlsSharedConfiguration.dailyLockActivity,
      FamilyControlsSharedConfiguration.diagnosticLockActivity,
    ])
    _ = shieldStore.remove()
    try sharedStateStore.setAccountabilityCompletedToday(false)
    sharedStateStore.clearLastCallback()
    sharedStateStore.clearScheduleConfigurationRecord()
    print("[ScheduledLockDiagnostic] diagnostic state reset")
    return state()
  }

  private func validateSharedSelection() throws {
    guard sharedStateStore.isAvailable else {
      throw FamilyControlsSharedStorageError.unavailable
    }

    let storedSelection = selectionStore.load()
    guard storedSelection.storageStatus != "corrupt" else {
      throw FamilyControlsSchedulingError.selectionUnavailable(
        storedSelection.errorMessage
          ?? "The stored selection is unreadable. Choose apps again before scheduling a lock."
      )
    }
    guard storedSelection.selection != nil else {
      throw FamilyControlsSchedulingError.selectionUnavailable(
        "Choose apps before scheduling a lock."
      )
    }
    guard !storedSelection.isEmpty else {
      throw FamilyControlsSchedulingError.emptySelection
    }
  }

  private func monitoringState(
    for activity: DeviceActivityName,
    kind: String
  ) -> [String: Any?] {
    let isMonitoring = center.activities.contains(activity)
    let schedule = isMonitoring ? center.schedule(for: activity) : nil
    let nextInterval = schedule?.nextInterval

    return [
      "activityName": activity.rawValue,
      "kind": kind,
      "isMonitoring": isMonitoring,
      "repeats": schedule?.repeats ?? false,
      "configuredStartHour": schedule?.intervalStart.hour,
      "configuredStartMinute": schedule?.intervalStart.minute,
      "nextIntervalStartMs": nextInterval.map {
        $0.start.timeIntervalSince1970 * 1_000
      },
      "nextIntervalEndMs": nextInterval.map {
        $0.end.timeIntervalSince1970 * 1_000
      },
    ]
  }
}
