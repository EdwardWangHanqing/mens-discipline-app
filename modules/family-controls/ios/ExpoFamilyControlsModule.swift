import ExpoModulesCore
import FamilyControls
import Foundation

public class ExpoFamilyControlsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoFamilyControls")

    Function("getAuthorizationStatus") {
      if Thread.isMainThread {
        return authorizationStatusString()
      }

      return DispatchQueue.main.sync {
        authorizationStatusString()
      }
    }

    AsyncFunction("requestAuthorization") { () async throws in
      try await requestAuthorizationOnMainActor()
    }
  }

  @MainActor
  private func requestAuthorizationOnMainActor() async throws {
    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
  }

  private func authorizationStatusString() -> String {
    switch AuthorizationCenter.shared.authorizationStatus {
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
}
