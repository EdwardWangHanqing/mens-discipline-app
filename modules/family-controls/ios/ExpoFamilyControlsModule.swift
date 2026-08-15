import Combine
import ExpoModulesCore
import FamilyControls
import Foundation
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
}
