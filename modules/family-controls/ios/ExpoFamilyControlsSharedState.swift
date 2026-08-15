import DeviceActivity
import FamilyControls
import Foundation
import ManagedSettings

enum FamilyControlsSharedConfiguration {
  static let appGroupIdentifier = "group.com.temperline.mensdiscipline"
  static let mainApplicationBundleIdentifier = "com.temperline.mensdiscipline"
  static let monitorExtensionBundleIdentifier =
    "com.temperline.mensdiscipline.deviceactivitymonitor"

  static let dailyLockActivity = DeviceActivityName(
    "com.temperline.mensdiscipline.lock-time.daily"
  )
  static let diagnosticLockActivity = DeviceActivityName(
    "com.temperline.mensdiscipline.lock-time.diagnostic"
  )

  static let selectionDataKey =
    "com.temperline.mensdiscipline.family-controls.diagnostic-selection"
  static let selectionPersistedAtKey =
    "com.temperline.mensdiscipline.family-controls.diagnostic-selection-persisted-at"
  static let accountabilityCompletedDateKey =
    "com.temperline.mensdiscipline.lock-time.accountability-completed-date"
  static let accountabilityUpdatedAtKey =
    "com.temperline.mensdiscipline.lock-time.accountability-updated-at"
  static let lastCallbackKey =
    "com.temperline.mensdiscipline.lock-time.last-callback"
  static let lastScheduleConfiguredAtKey =
    "com.temperline.mensdiscipline.lock-time.last-schedule-configured-at"

  static let manualShieldStoreName = ManagedSettingsStore.Name(
    "com.temperline.mensdiscipline.diagnostic-shield"
  )
  static let dailyShieldStoreName = ManagedSettingsStore.Name(
    "com.temperline.mensdiscipline.lock-time.daily-shield"
  )
  static let diagnosticShieldStoreName = ManagedSettingsStore.Name(
    "com.temperline.mensdiscipline.lock-time.diagnostic-shield"
  )

  static var allShieldStoreNames: [ManagedSettingsStore.Name] {
    [manualShieldStoreName, dailyShieldStoreName, diagnosticShieldStoreName]
  }

  static func shieldStoreName(
    for activity: DeviceActivityName
  ) -> ManagedSettingsStore.Name? {
    switch activity {
    case dailyLockActivity:
      return dailyShieldStoreName
    case diagnosticLockActivity:
      return diagnosticShieldStoreName
    default:
      return nil
    }
  }

  static func isScheduledLockActivity(_ activity: DeviceActivityName) -> Bool {
    activity == dailyLockActivity || activity == diagnosticLockActivity
  }
}

struct FamilyControlsStoredSelection {
  let selection: FamilyActivitySelection?
  let storageStatus: String
  let storageScope: String
  let sharedStorageAvailable: Bool
  let persistedAtMs: Double?
  let errorMessage: String?

  var isEmpty: Bool {
    guard let selection else {
      return true
    }

    return selection.applicationTokens.isEmpty && selection.categoryTokens.isEmpty
      && selection.webDomainTokens.isEmpty
  }

  var summary: [String: Any?] {
    let applicationCount = selection?.applicationTokens.count ?? 0
    let categoryCount = selection?.categoryTokens.count ?? 0
    let webDomainCount = selection?.webDomainTokens.count ?? 0
    let hasStoredSelection = selection != nil

    return [
      "storageStatus": storageStatus,
      "storageScope": storageScope,
      "sharedStorageAvailable": sharedStorageAvailable,
      "hasStoredSelection": hasStoredSelection,
      "hasSelection": hasStoredSelection && !isEmpty,
      "isEmpty": isEmpty,
      "applicationCount": applicationCount,
      "categoryCount": categoryCount,
      "webDomainCount": webDomainCount,
      "persistedAtMs": persistedAtMs,
      "errorMessage": errorMessage,
    ]
  }
}

struct FamilyControlsAccountabilityState {
  let dateKey: String
  let completedToday: Bool
  let completedDateKey: String?
  let updatedAtMs: Double?

  var summary: [String: Any?] {
    [
      "dateKey": dateKey,
      "completedToday": completedToday,
      "completedDateKey": completedDateKey,
      "updatedAtMs": updatedAtMs,
      "source": "diagnosticAppGroupState",
    ]
  }
}

struct FamilyControlsMonitorCallbackRecord: Codable {
  let activityName: String
  let callback: String
  let outcome: String
  let occurredAtMs: Double
  let completedToday: Bool
  let applicationCount: Int
  let categoryCount: Int
  let webDomainCount: Int

  var summary: [String: Any?] {
    [
      "activityName": activityName,
      "callback": callback,
      "outcome": outcome,
      "occurredAtMs": occurredAtMs,
      "completedToday": completedToday,
      "applicationCount": applicationCount,
      "categoryCount": categoryCount,
      "webDomainCount": webDomainCount,
    ]
  }
}

enum FamilyControlsSharedStorageError: LocalizedError {
  case unavailable

  var errorDescription: String? {
    switch self {
    case .unavailable:
      return
        "The shared App Group container is unavailable. Confirm that the main app and Device Activity Monitor extension both use group.com.temperline.mensdiscipline."
    }
  }
}

final class FamilyControlsSharedStateStore {
  private let calendar: Calendar
  private let legacyDefaults: UserDefaults?
  private let sharedDefaults: UserDefaults?

  init(
    calendar: Calendar = .current,
    legacyDefaults: UserDefaults? = .standard,
    allowLegacySelectionFallback: Bool = true
  ) {
    self.calendar = calendar
    self.legacyDefaults = allowLegacySelectionFallback ? legacyDefaults : nil

    if FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier:
        FamilyControlsSharedConfiguration.appGroupIdentifier
    ) != nil {
      self.sharedDefaults = UserDefaults(
        suiteName: FamilyControlsSharedConfiguration.appGroupIdentifier
      )
    } else {
      self.sharedDefaults = nil
    }

    migrateLegacySelectionIfNeeded()
  }

  var isAvailable: Bool {
    sharedDefaults != nil
  }

  func loadSelection() -> FamilyControlsStoredSelection {
    let defaults: UserDefaults
    let storageScope: String

    if let sharedDefaults {
      defaults = sharedDefaults
      storageScope = "appGroup"
    } else if let legacyDefaults {
      defaults = legacyDefaults
      storageScope = "legacyApp"
    } else {
      return FamilyControlsStoredSelection(
        selection: nil,
        storageStatus: "none",
        storageScope: "unavailable",
        sharedStorageAvailable: false,
        persistedAtMs: nil,
        errorMessage: FamilyControlsSharedStorageError.unavailable.errorDescription
      )
    }

    guard
      let data = defaults.data(
        forKey: FamilyControlsSharedConfiguration.selectionDataKey
      )
    else {
      return FamilyControlsStoredSelection(
        selection: nil,
        storageStatus: "none",
        storageScope: storageScope,
        sharedStorageAvailable: isAvailable,
        persistedAtMs: nil,
        errorMessage: nil
      )
    }

    let persistedAtMs =
      defaults.object(
        forKey: FamilyControlsSharedConfiguration.selectionPersistedAtKey
      ) as? Double

    do {
      let selection = try JSONDecoder().decode(
        FamilyActivitySelection.self,
        from: data
      )
      return FamilyControlsStoredSelection(
        selection: selection,
        storageStatus: "available",
        storageScope: storageScope,
        sharedStorageAvailable: isAvailable,
        persistedAtMs: persistedAtMs,
        errorMessage: nil
      )
    } catch {
      let errorMessage = "Stored selection could not be decoded. Choose apps again to replace it."
      print(
        "[FamilyControlsSelection] restore failed scope=\(storageScope): "
          + error.localizedDescription
      )
      return FamilyControlsStoredSelection(
        selection: nil,
        storageStatus: "corrupt",
        storageScope: storageScope,
        sharedStorageAvailable: isAvailable,
        persistedAtMs: persistedAtMs,
        errorMessage: errorMessage
      )
    }
  }

  func saveSelection(
    _ selection: FamilyActivitySelection
  ) throws -> FamilyControlsStoredSelection {
    guard let sharedDefaults else {
      throw FamilyControlsSharedStorageError.unavailable
    }

    let encodedSelection = try JSONEncoder().encode(selection)
    let persistedAtMs = Self.currentTimestampMs()
    sharedDefaults.set(
      encodedSelection,
      forKey: FamilyControlsSharedConfiguration.selectionDataKey
    )
    sharedDefaults.set(
      persistedAtMs,
      forKey: FamilyControlsSharedConfiguration.selectionPersistedAtKey
    )

    legacyDefaults?.removeObject(
      forKey: FamilyControlsSharedConfiguration.selectionDataKey
    )
    legacyDefaults?.removeObject(
      forKey: FamilyControlsSharedConfiguration.selectionPersistedAtKey
    )

    return FamilyControlsStoredSelection(
      selection: selection,
      storageStatus: "available",
      storageScope: "appGroup",
      sharedStorageAvailable: true,
      persistedAtMs: persistedAtMs,
      errorMessage: nil
    )
  }

  func accountabilityState(at date: Date = Date()) -> FamilyControlsAccountabilityState {
    let dateKey = makeDateKey(date)
    let completedDateKey = sharedDefaults?.string(
      forKey: FamilyControlsSharedConfiguration.accountabilityCompletedDateKey
    )
    let updatedAtMs =
      sharedDefaults?.object(
        forKey: FamilyControlsSharedConfiguration.accountabilityUpdatedAtKey
      ) as? Double

    return FamilyControlsAccountabilityState(
      dateKey: dateKey,
      completedToday: completedDateKey == dateKey,
      completedDateKey: completedDateKey,
      updatedAtMs: updatedAtMs
    )
  }

  @discardableResult
  func setAccountabilityCompletedToday(
    _ completed: Bool,
    at date: Date = Date()
  ) throws -> FamilyControlsAccountabilityState {
    guard let sharedDefaults else {
      throw FamilyControlsSharedStorageError.unavailable
    }

    if completed {
      sharedDefaults.set(
        makeDateKey(date),
        forKey: FamilyControlsSharedConfiguration.accountabilityCompletedDateKey
      )
    } else {
      sharedDefaults.removeObject(
        forKey: FamilyControlsSharedConfiguration.accountabilityCompletedDateKey
      )
    }
    sharedDefaults.set(
      Self.currentTimestampMs(),
      forKey: FamilyControlsSharedConfiguration.accountabilityUpdatedAtKey
    )
    return accountabilityState(at: date)
  }

  func recordCallback(_ record: FamilyControlsMonitorCallbackRecord) {
    guard let sharedDefaults else {
      return
    }

    do {
      sharedDefaults.set(
        try JSONEncoder().encode(record),
        forKey: FamilyControlsSharedConfiguration.lastCallbackKey
      )
    } catch {
      print(
        "[ScheduledLockMonitor] callback record encode failed: " + error.localizedDescription
      )
    }
  }

  func lastCallback() -> FamilyControlsMonitorCallbackRecord? {
    guard
      let data = sharedDefaults?.data(
        forKey: FamilyControlsSharedConfiguration.lastCallbackKey
      )
    else {
      return nil
    }

    do {
      return try JSONDecoder().decode(
        FamilyControlsMonitorCallbackRecord.self,
        from: data
      )
    } catch {
      print(
        "[ScheduledLockMonitor] callback record decode failed: " + error.localizedDescription
      )
      return nil
    }
  }

  func clearLastCallback() {
    sharedDefaults?.removeObject(
      forKey: FamilyControlsSharedConfiguration.lastCallbackKey
    )
  }

  func clearScheduleConfigurationRecord() {
    sharedDefaults?.removeObject(
      forKey: FamilyControlsSharedConfiguration.lastScheduleConfiguredAtKey
    )
  }

  func recordScheduleConfigured() {
    sharedDefaults?.set(
      Self.currentTimestampMs(),
      forKey: FamilyControlsSharedConfiguration.lastScheduleConfiguredAtKey
    )
  }

  var lastScheduleConfiguredAtMs: Double? {
    sharedDefaults?.object(
      forKey: FamilyControlsSharedConfiguration.lastScheduleConfiguredAtKey
    ) as? Double
  }

  private func migrateLegacySelectionIfNeeded() {
    guard
      let sharedDefaults,
      let legacyDefaults,
      sharedDefaults.data(
        forKey: FamilyControlsSharedConfiguration.selectionDataKey
      ) == nil,
      let legacyData = legacyDefaults.data(
        forKey: FamilyControlsSharedConfiguration.selectionDataKey
      )
    else {
      return
    }

    sharedDefaults.set(
      legacyData,
      forKey: FamilyControlsSharedConfiguration.selectionDataKey
    )
    if let persistedAtMs = legacyDefaults.object(
      forKey: FamilyControlsSharedConfiguration.selectionPersistedAtKey
    ) as? Double {
      sharedDefaults.set(
        persistedAtMs,
        forKey: FamilyControlsSharedConfiguration.selectionPersistedAtKey
      )
    }

    guard
      sharedDefaults.data(
        forKey: FamilyControlsSharedConfiguration.selectionDataKey
      ) == legacyData
    else {
      print("[FamilyControlsSelection] App Group migration verification failed")
      return
    }

    legacyDefaults.removeObject(
      forKey: FamilyControlsSharedConfiguration.selectionDataKey
    )
    legacyDefaults.removeObject(
      forKey: FamilyControlsSharedConfiguration.selectionPersistedAtKey
    )
    print("[FamilyControlsSelection] migrated opaque selection to App Group storage")
  }

  private func makeDateKey(_ date: Date) -> String {
    let components = calendar.dateComponents([.year, .month, .day], from: date)
    let year = components.year ?? 0
    let month = components.month ?? 0
    let day = components.day ?? 0
    return String(format: "%04d-%02d-%02d", year, month, day)
  }

  private static func currentTimestampMs() -> Double {
    Date().timeIntervalSince1970 * 1_000
  }
}

final class FamilyControlsShieldStore {
  private let writableStore: ManagedSettingsStore
  private let observedStores: [ManagedSettingsStore]

  init(activity: DeviceActivityName? = nil) {
    if let activity,
      let storeName = FamilyControlsSharedConfiguration.shieldStoreName(
        for: activity
      )
    {
      let activityStore = ManagedSettingsStore(named: storeName)
      self.writableStore = activityStore
      self.observedStores = [activityStore]
    } else {
      self.writableStore = ManagedSettingsStore(
        named: FamilyControlsSharedConfiguration.manualShieldStoreName
      )
      self.observedStores =
        FamilyControlsSharedConfiguration.allShieldStoreNames.map {
          ManagedSettingsStore(named: $0)
        }
    }
  }

  func apply(_ selection: FamilyActivitySelection) -> [String: Any?] {
    writableStore.shield.applications =
      selection.applicationTokens.isEmpty
      ? nil
      : selection.applicationTokens
    writableStore.shield.webDomains =
      selection.webDomainTokens.isEmpty
      ? nil
      : selection.webDomainTokens

    if selection.categoryTokens.isEmpty {
      writableStore.shield.applicationCategories = nil
      writableStore.shield.webDomainCategories = nil
    } else {
      writableStore.shield.applicationCategories = .specific(
        selection.categoryTokens
      )
      writableStore.shield.webDomainCategories = .specific(
        selection.categoryTokens
      )
    }

    return state()
  }

  func remove() -> [String: Any?] {
    for store in observedStores {
      store.clearAllSettings()
    }
    return state()
  }

  func state() -> [String: Any?] {
    let storeStates = observedStores.map(shieldState)
    let applicationCount = storeStates.map(\.applicationCount).max() ?? 0
    let categoryCount = storeStates.map(\.categoryCount).max() ?? 0
    let webDomainCount = storeStates.map(\.webDomainCount).max() ?? 0
    let usesAllCategories = storeStates.contains {
      $0.usesAllCategories
    }
    let isApplied =
      applicationCount > 0 || webDomainCount > 0 || categoryCount > 0 || usesAllCategories

    return [
      "isApplied": isApplied,
      "applicationCount": applicationCount,
      "categoryCount": categoryCount,
      "webDomainCount": webDomainCount,
      "usesAllCategories": usesAllCategories,
      "source": "namedManagedSettingsStore",
    ]
  }

  private func shieldState(
    for store: ManagedSettingsStore
  ) -> (
    applicationCount: Int,
    categoryCount: Int,
    webDomainCount: Int,
    usesAllCategories: Bool
  ) {
    let applicationCategoryState = categoryPolicyState(
      store.shield.applicationCategories
    )
    let webDomainCategoryState = categoryPolicyState(
      store.shield.webDomainCategories
    )

    return (
      applicationCount: store.shield.applications?.count ?? 0,
      categoryCount: max(
        applicationCategoryState.count,
        webDomainCategoryState.count
      ),
      webDomainCount: store.shield.webDomains?.count ?? 0,
      usesAllCategories: applicationCategoryState.usesAllCategories
        || webDomainCategoryState.usesAllCategories
    )
  }

  private func categoryPolicyState<Activity>(
    _ policy: ShieldSettings.ActivityCategoryPolicy<Activity>?
  ) -> (count: Int, usesAllCategories: Bool) {
    guard let policy else {
      return (0, false)
    }

    switch policy {
    case .none:
      return (0, false)
    case .specific(let tokens, except: _):
      return (tokens.count, false)
    case .all:
      return (0, true)
    @unknown default:
      return (0, true)
    }
  }
}
