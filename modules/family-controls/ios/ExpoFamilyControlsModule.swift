import Combine
import ExpoModulesCore
import FamilyControls
import Foundation
import ManagedSettings
import UIKit

private let authorizationStatusChangedEvent = "onAuthorizationStatusChanged"

final class FamilyControlsAuthorizationTimeline {
  static let shared = FamilyControlsAuthorizationTimeline()

  private let lock = NSLock()
  private var sequence = 0
  private var moduleInitializedAtMs: Double?
  private var appBecameActiveAtMs: Double?
  private var appState = "unknown"
  private var firstNotDeterminedAtMs: Double?
  private var firstResolvedAtMs: Double?

  private init() {}

  func recordModuleInitialized(at timestampMs: Double) {
    lock.locked {
      moduleInitializedAtMs = timestampMs
    }
  }

  func recordAppState(_ state: String, at timestampMs: Double) {
    lock.locked {
      appState = state
      if state == "active" {
        appBecameActiveAtMs = timestampMs
      }
    }
  }

  func makeSample(
    status: AuthorizationStatus,
    source: String,
    observedAtMs: Double,
    applicationState: String
  ) -> [String: Any?] {
    lock.locked {
      sequence += 1
      appState = applicationState

      if status == .notDetermined, firstNotDeterminedAtMs == nil {
        firstNotDeterminedAtMs = observedAtMs
      } else if status != .notDetermined, firstResolvedAtMs == nil {
        firstResolvedAtMs = observedAtMs
      }

      let stabilizationDurationMs: Double?
      if let firstNotDeterminedAtMs, let firstResolvedAtMs {
        stabilizationDurationMs = firstResolvedAtMs - firstNotDeterminedAtMs
      } else {
        stabilizationDurationMs = nil
      }

      return [
        "status": authorizationStatusString(status),
        "source": source,
        "sequence": sequence,
        "observedAtMs": observedAtMs,
        "moduleInitializedAtMs": moduleInitializedAtMs,
        "appBecameActiveAtMs": appBecameActiveAtMs,
        "applicationState": appState,
        "firstNotDeterminedAtMs": firstNotDeterminedAtMs,
        "firstResolvedAtMs": firstResolvedAtMs,
        "stabilizationDurationMs": stabilizationDurationMs,
      ]
    }
  }
}

private func authorizationStatusString(_ status: AuthorizationStatus) -> String {
  switch status {
  case .notDetermined:
    return "notDetermined"
  case .denied:
    return "denied"
  case .approved:
    return "approved"
  case .approvedWithDataAccess:
    return "approvedWithDataAccess"
  @unknown default:
    return "unknown"
  }
}

private extension NSLock {
  func locked<Result>(_ operation: () -> Result) -> Result {
    lock()
    defer { unlock() }
    return operation()
  }
}

public class ExpoFamilyControlsModule: Module {
  private var authorizationStatusCancellable: AnyCancellable?
  private let selectionStore = FamilyControlsSelectionStore()
  private let shieldStore = FamilyControlsShieldStore()
  private var activityPickerPresentation: FamilyActivityPickerPresentation?

  public func definition() -> ModuleDefinition {
    Name("ExpoFamilyControls")

    Events(authorizationStatusChangedEvent)

    OnCreate {
      let timestampMs = Self.currentTimestampMs()
      FamilyControlsAuthorizationTimeline.shared.recordModuleInitialized(
        at: timestampMs
      )
      self.startAuthorizationStatusObservation()
    }

    OnStartObserving(authorizationStatusChangedEvent) {
      self.emitCurrentAuthorizationStatus(source: "listenerAttached")
    }

    OnAppBecomesActive {
      let timestampMs = Self.currentTimestampMs()
      FamilyControlsAuthorizationTimeline.shared.recordAppState(
        "active",
        at: timestampMs
      )
      self.emitCurrentAuthorizationStatus(source: "moduleAppBecameActive")
    }

    OnAppEntersBackground {
      FamilyControlsAuthorizationTimeline.shared.recordAppState(
        "background",
        at: Self.currentTimestampMs()
      )
    }

    OnDestroy {
      self.authorizationStatusCancellable?.cancel()
      self.authorizationStatusCancellable = nil
      DispatchQueue.main.async { [weak self] in
        self?.activityPickerPresentation?.dismissBecauseModuleWasDestroyed()
        self?.activityPickerPresentation = nil
      }
    }

    Function("getAuthorizationStatus") {
      if Thread.isMainThread {
        return authorizationStatusString(
          AuthorizationCenter.shared.authorizationStatus
        )
      }

      return DispatchQueue.main.sync {
        authorizationStatusString(
          AuthorizationCenter.shared.authorizationStatus
        )
      }
    }

    Function("getAuthorizationStatusDiagnostic") {
      if Thread.isMainThread {
        return self.makeAuthorizationStatusSample(source: "directRead")
      }

      return DispatchQueue.main.sync {
        self.makeAuthorizationStatusSample(source: "directRead")
      }
    }

    AsyncFunction("requestAuthorization") { () async throws -> [String: Any?] in
      try await requestAuthorizationOnMainActor()
      return await MainActor.run {
        self.makeAuthorizationStatusSample(source: "requestCompleted")
      }
    }

    AsyncFunction("getSelectionSummary") { (promise: Promise) in
      promise.resolve(self.selectionStore.load().summary)
    }
    .runOnQueue(.main)

    AsyncFunction("presentActivityPicker") { (promise: Promise) in
      guard self.activityPickerPresentation == nil else {
        promise.reject(
          "ERR_FAMILY_ACTIVITY_PICKER_IN_PROGRESS",
          "A Family Activity picker is already open."
        )
        return
      }

      guard Self.isAuthorizationUsable(
        AuthorizationCenter.shared.authorizationStatus
      ) else {
        promise.reject(
          "ERR_FAMILY_CONTROLS_AUTHORIZATION_REQUIRED",
          "Family Controls authorization must be approved before choosing apps."
        )
        return
      }

      guard let presentingViewController =
        self.appContext?.utilities?.currentViewController()
      else {
        promise.reject(
          "ERR_FAMILY_ACTIVITY_PICKER_NO_VIEW_CONTROLLER",
          "The Family Activity picker could not find a view controller to present from."
        )
        return
      }

      let initialSelection = self.selectionStore.load().selection ??
        FamilyActivitySelection()
      let presentation = MainActor.assumeIsolated {
        FamilyActivityPickerPresentation(
          initialSelection: initialSelection,
          promise: promise,
          selectionStore: self.selectionStore,
          onFinished: { [weak self] in
            self?.activityPickerPresentation = nil
          }
        )
      }
      self.activityPickerPresentation = presentation
      MainActor.assumeIsolated {
        presentation.present(from: presentingViewController)
      }
    }
    .runOnQueue(.main)

    AsyncFunction("getShieldState") { (promise: Promise) in
      promise.resolve(self.shieldStore.state())
    }
    .runOnQueue(.main)

    AsyncFunction("applyShield") { (promise: Promise) in
      guard Self.isAuthorizationUsable(
        AuthorizationCenter.shared.authorizationStatus
      ) else {
        promise.reject(
          "ERR_FAMILY_CONTROLS_AUTHORIZATION_REQUIRED",
          "Family Controls authorization must be approved before applying a shield."
        )
        return
      }

      let storedSelection = self.selectionStore.load()
      guard let selection = storedSelection.selection else {
        let message = storedSelection.storageStatus == "corrupt"
          ? "The stored selection is unreadable. Choose apps again before applying a shield."
          : "Choose at least one app, category, or web domain before applying a shield."
        promise.reject("ERR_FAMILY_ACTIVITY_SELECTION_REQUIRED", message)
        return
      }

      guard !selection.applicationTokens.isEmpty ||
        !selection.categoryTokens.isEmpty ||
        !selection.webDomainTokens.isEmpty
      else {
        promise.reject(
          "ERR_FAMILY_ACTIVITY_SELECTION_EMPTY",
          "The saved selection is empty. Choose at least one item before applying a shield."
        )
        return
      }

      promise.resolve(self.shieldStore.apply(selection))
    }
    .runOnQueue(.main)

    AsyncFunction("removeShield") { (promise: Promise) in
      promise.resolve(self.shieldStore.remove())
    }
    .runOnQueue(.main)
  }

  @MainActor
  private func requestAuthorizationOnMainActor() async throws {
    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
  }

  private func startAuthorizationStatusObservation() {
    DispatchQueue.main.async { [weak self] in
      guard let self, self.authorizationStatusCancellable == nil else {
        return
      }

      self.authorizationStatusCancellable = AuthorizationCenter.shared
        .$authorizationStatus
        .receive(on: DispatchQueue.main)
        .sink { [weak self] status in
          self?.emitAuthorizationStatus(status, source: "publisher")
        }
    }
  }

  private func emitCurrentAuthorizationStatus(source: String) {
    DispatchQueue.main.async { [weak self] in
      guard let self else {
        return
      }
      self.emitAuthorizationStatus(
        AuthorizationCenter.shared.authorizationStatus,
        source: source
      )
    }
  }

  private func emitAuthorizationStatus(
    _ status: AuthorizationStatus,
    source: String
  ) {
    let sample = makeAuthorizationStatusSample(status: status, source: source)
    sendEvent(authorizationStatusChangedEvent, sample)
  }

  private func makeAuthorizationStatusSample(
    status: AuthorizationStatus? = nil,
    source: String
  ) -> [String: Any?] {
    let currentStatus = status ?? AuthorizationCenter.shared.authorizationStatus
    let sample = FamilyControlsAuthorizationTimeline.shared.makeSample(
      status: currentStatus,
      source: source,
      observedAtMs: Self.currentTimestampMs(),
      applicationState: Self.applicationStateString()
    )
    logAuthorizationStatusSample(sample)
    return sample
  }

  private func logAuthorizationStatusSample(_ sample: [String: Any?]) {
    let sequence = sample["sequence"] as? Int ?? -1
    let source = sample["source"] as? String ?? "unknown"
    let status = sample["status"] as? String ?? "unknown"
    let observedAtMs = sample["observedAtMs"] as? Double ?? -1
    let applicationState = sample["applicationState"] as? String ?? "unknown"
    let stabilizationDurationMs = sample["stabilizationDurationMs"] as? Double
    let stabilizationDurationText = stabilizationDurationMs.map {
      String($0)
    } ?? "pending"

    print(
      "[FamilyControlsDiagnostic] sequence=\(sequence) source=\(source) " +
        "status=\(status) observedAtMs=\(observedAtMs) " +
        "appState=\(applicationState) " +
        "stabilizationDurationMs=\(stabilizationDurationText)"
    )
  }

  private static func currentTimestampMs() -> Double {
    Date().timeIntervalSince1970 * 1_000
  }

  private static func applicationStateString() -> String {
    switch UIApplication.shared.applicationState {
    case .active:
      return "active"
    case .inactive:
      return "inactive"
    case .background:
      return "background"
    @unknown default:
      return "unknown"
    }
  }

  private static func isAuthorizationUsable(
    _ status: AuthorizationStatus
  ) -> Bool {
    if status == .approved {
      return true
    }
    if #available(iOS 26.4, *), status == .approvedWithDataAccess {
      return true
    }
    return false
  }
}
