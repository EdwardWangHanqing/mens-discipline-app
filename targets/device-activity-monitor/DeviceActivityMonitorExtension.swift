import DeviceActivity
import Foundation

final class DeviceActivityMonitorExtension: DeviceActivityMonitor {
  private let sharedStateStore = FamilyControlsSharedStateStore(
    legacyDefaults: nil,
    allowLegacySelectionFallback: false
  )

  override func intervalDidStart(for activity: DeviceActivityName) {
    super.intervalDidStart(for: activity)

    guard FamilyControlsSharedConfiguration.isScheduledLockActivity(activity)
    else {
      return
    }

    let shieldStore = FamilyControlsShieldStore(activity: activity)

    guard sharedStateStore.isAvailable else {
      _ = shieldStore.remove()
      print(
        "[ScheduledLockMonitor] intervalDidStart activity=\(activity.rawValue) outcome=sharedStorageUnavailable"
      )
      return
    }

    let accountability = sharedStateStore.accountabilityState()
    let storedSelection = sharedStateStore.loadSelection()
    let counts = selectionCounts(storedSelection)
    let outcome: String

    if accountability.completedToday {
      _ = shieldStore.remove()
      outcome = "skippedCompletedToday"
    } else if storedSelection.storageStatus == "corrupt" {
      _ = shieldStore.remove()
      outcome = "skippedCorruptSelection"
    } else if storedSelection.selection == nil || storedSelection.isEmpty {
      _ = shieldStore.remove()
      outcome = "skippedNoSelection"
    } else if let selection = storedSelection.selection {
      _ = shieldStore.apply(selection)
      outcome = "appliedShield"
    } else {
      _ = shieldStore.remove()
      outcome = "skippedNoSelection"
    }

    record(
      activity: activity,
      callback: "intervalDidStart",
      outcome: outcome,
      completedToday: accountability.completedToday,
      counts: counts
    )
  }

  override func intervalDidEnd(for activity: DeviceActivityName) {
    super.intervalDidEnd(for: activity)

    guard FamilyControlsSharedConfiguration.isScheduledLockActivity(activity)
    else {
      return
    }

    let shieldStore = FamilyControlsShieldStore(activity: activity)

    let storedSelection = sharedStateStore.loadSelection()
    let accountability = sharedStateStore.accountabilityState()
    let counts = selectionCounts(storedSelection)
    _ = shieldStore.remove()
    record(
      activity: activity,
      callback: "intervalDidEnd",
      outcome: "removedShieldAtIntervalEnd",
      completedToday: accountability.completedToday,
      counts: counts
    )
  }

  private func selectionCounts(
    _ storedSelection: FamilyControlsStoredSelection
  ) -> (applications: Int, categories: Int, webDomains: Int) {
    (
      applications: storedSelection.selection?.applicationTokens.count ?? 0,
      categories: storedSelection.selection?.categoryTokens.count ?? 0,
      webDomains: storedSelection.selection?.webDomainTokens.count ?? 0
    )
  }

  private func record(
    activity: DeviceActivityName,
    callback: String,
    outcome: String,
    completedToday: Bool,
    counts: (applications: Int, categories: Int, webDomains: Int)
  ) {
    let occurredAtMs = Date().timeIntervalSince1970 * 1_000
    sharedStateStore.recordCallback(
      FamilyControlsMonitorCallbackRecord(
        activityName: activity.rawValue,
        callback: callback,
        outcome: outcome,
        occurredAtMs: occurredAtMs,
        completedToday: completedToday,
        applicationCount: counts.applications,
        categoryCount: counts.categories,
        webDomainCount: counts.webDomains
      )
    )
    print(
      "[ScheduledLockMonitor] callback=\(callback) activity=\(activity.rawValue) "
        + "outcome=\(outcome) completedToday=\(completedToday) "
        + "applications=\(counts.applications) categories=\(counts.categories) "
        + "webDomains=\(counts.webDomains) occurredAtMs=\(occurredAtMs)"
    )
  }
}
