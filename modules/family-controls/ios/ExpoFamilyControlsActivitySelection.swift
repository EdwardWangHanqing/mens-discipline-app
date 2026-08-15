import ExpoModulesCore
import FamilyControls
import Foundation
import ManagedSettings
import SwiftUI
import UIKit

private let selectionDataKey =
  "com.temperline.mensdiscipline.family-controls.diagnostic-selection"
private let selectionPersistedAtKey =
  "com.temperline.mensdiscipline.family-controls.diagnostic-selection-persisted-at"

struct FamilyControlsStoredSelection {
  let selection: FamilyActivitySelection?
  let storageStatus: String
  let persistedAtMs: Double?
  let errorMessage: String?

  var summary: [String: Any?] {
    let applicationCount = selection?.applicationTokens.count ?? 0
    let categoryCount = selection?.categoryTokens.count ?? 0
    let webDomainCount = selection?.webDomainTokens.count ?? 0
    let hasStoredSelection = selection != nil
    let isEmpty = applicationCount == 0 && categoryCount == 0 && webDomainCount == 0

    return [
      "storageStatus": storageStatus,
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

final class FamilyControlsSelectionStore {
  private let userDefaults: UserDefaults

  init(userDefaults: UserDefaults = .standard) {
    self.userDefaults = userDefaults
  }

  func load() -> FamilyControlsStoredSelection {
    guard let data = userDefaults.data(forKey: selectionDataKey) else {
      return FamilyControlsStoredSelection(
        selection: nil,
        storageStatus: "none",
        persistedAtMs: nil,
        errorMessage: nil
      )
    }

    let persistedAtMs = userDefaults.object(forKey: selectionPersistedAtKey)
      as? Double

    do {
      let selection = try JSONDecoder().decode(
        FamilyActivitySelection.self,
        from: data
      )
      return FamilyControlsStoredSelection(
        selection: selection,
        storageStatus: "available",
        persistedAtMs: persistedAtMs,
        errorMessage: nil
      )
    } catch {
      let errorMessage = "Stored selection could not be decoded. " +
        "Choose apps again to replace it."
      print(
        "[FamilyControlsSelection] restore failed: " +
          error.localizedDescription
      )
      return FamilyControlsStoredSelection(
        selection: nil,
        storageStatus: "corrupt",
        persistedAtMs: persistedAtMs,
        errorMessage: errorMessage
      )
    }
  }

  func save(
    _ selection: FamilyActivitySelection
  ) throws -> FamilyControlsStoredSelection {
    let encodedSelection = try JSONEncoder().encode(selection)
    let persistedAtMs = Date().timeIntervalSince1970 * 1_000
    userDefaults.set(encodedSelection, forKey: selectionDataKey)
    userDefaults.set(persistedAtMs, forKey: selectionPersistedAtKey)

    return FamilyControlsStoredSelection(
      selection: selection,
      storageStatus: "available",
      persistedAtMs: persistedAtMs,
      errorMessage: nil
    )
  }
}

@MainActor
private final class FamilyActivityPickerActions: ObservableObject {
  var onSave: ((FamilyActivitySelection) -> Void)?
  var onCancel: (() -> Void)?
}

@MainActor
private struct FamilyActivityPickerSheet: View {
  @State private var selection: FamilyActivitySelection
  private let actions: FamilyActivityPickerActions

  init(
    initialSelection: FamilyActivitySelection,
    actions: FamilyActivityPickerActions
  ) {
    _selection = State(initialValue: initialSelection)
    self.actions = actions
  }

  var body: some View {
    NavigationStack {
      FamilyActivityPicker(
        headerText: "Choose only the apps and categories you want to restrict.",
        footerText: "Your choices stay private and are stored only as Apple's opaque tokens.",
        selection: $selection
      )
      .navigationTitle("Choose Apps")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Cancel") {
            actions.onCancel?()
          }
        }
        ToolbarItem(placement: .confirmationAction) {
          Button("Done") {
            actions.onSave?(selection)
          }
        }
      }
    }
  }
}

@MainActor
final class FamilyActivityPickerPresentation:
  NSObject,
  UIAdaptivePresentationControllerDelegate
{
  private let actions: FamilyActivityPickerActions
  private let hostingController: UIHostingController<FamilyActivityPickerSheet>
  private let promise: Promise
  private let selectionStore: FamilyControlsSelectionStore
  private let onFinished: () -> Void
  private var isSettled = false

  init(
    initialSelection: FamilyActivitySelection,
    promise: Promise,
    selectionStore: FamilyControlsSelectionStore,
    onFinished: @escaping () -> Void
  ) {
    let actions = FamilyActivityPickerActions()
    self.actions = actions
    self.hostingController = UIHostingController(
      rootView: FamilyActivityPickerSheet(
        initialSelection: initialSelection,
        actions: actions
      )
    )
    self.promise = promise
    self.selectionStore = selectionStore
    self.onFinished = onFinished
    super.init()

    actions.onSave = { [weak self] selection in
      self?.saveAndDismiss(selection)
    }
    actions.onCancel = { [weak self] in
      self?.cancelAndDismiss()
    }
  }

  func present(from presentingViewController: UIViewController) {
    hostingController.modalPresentationStyle = .pageSheet
    hostingController.presentationController?.delegate = self

    if let sheetPresentationController = hostingController.sheetPresentationController {
      sheetPresentationController.prefersGrabberVisible = true
    }

    presentingViewController.present(hostingController, animated: true)
  }

  func presentationControllerDidDismiss(
    _ presentationController: UIPresentationController
  ) {
    settleCancelled()
  }

  func dismissBecauseModuleWasDestroyed() {
    guard !isSettled else {
      return
    }
    isSettled = true
    hostingController.dismiss(animated: false)
    promise.reject(
      "ERR_FAMILY_ACTIVITY_PICKER_INTERRUPTED",
      "The Family Activity picker was interrupted because the native module was destroyed."
    )
    onFinished()
  }

  private func saveAndDismiss(_ selection: FamilyActivitySelection) {
    guard !isSettled else {
      return
    }

    do {
      let storedSelection = try selectionStore.save(selection)
      isSettled = true
      hostingController.dismiss(animated: true) { [promise, onFinished] in
        promise.resolve([
          "outcome": "saved",
          "selection": storedSelection.summary,
        ])
        onFinished()
      }
    } catch {
      isSettled = true
      hostingController.dismiss(animated: true) { [promise, onFinished] in
        promise.reject(
          "ERR_FAMILY_ACTIVITY_SELECTION_PERSISTENCE",
          "The selected apps could not be saved: \(error.localizedDescription)"
        )
        onFinished()
      }
    }
  }

  private func cancelAndDismiss() {
    guard !isSettled else {
      return
    }
    isSettled = true
    hostingController.dismiss(animated: true) { [weak self] in
      self?.resolveCancelledResult()
    }
  }

  private func settleCancelled() {
    guard !isSettled else {
      return
    }
    isSettled = true
    resolveCancelledResult()
  }

  private func resolveCancelledResult() {
    promise.resolve([
      "outcome": "cancelled",
      "selection": selectionStore.load().summary,
    ])
    onFinished()
  }
}

final class FamilyControlsShieldStore {
  private let store = ManagedSettingsStore(
    named: ManagedSettingsStore.Name(
      "com.temperline.mensdiscipline.diagnostic-shield"
    )
  )

  func apply(_ selection: FamilyActivitySelection) -> [String: Any?] {
    store.shield.applications = selection.applicationTokens.isEmpty
      ? nil
      : selection.applicationTokens
    store.shield.webDomains = selection.webDomainTokens.isEmpty
      ? nil
      : selection.webDomainTokens

    if selection.categoryTokens.isEmpty {
      store.shield.applicationCategories = nil
      store.shield.webDomainCategories = nil
    } else {
      store.shield.applicationCategories = .specific(selection.categoryTokens)
      store.shield.webDomainCategories = .specific(selection.categoryTokens)
    }

    return state()
  }

  func remove() -> [String: Any?] {
    store.clearAllSettings()
    return state()
  }

  func state() -> [String: Any?] {
    let applicationCount = store.shield.applications?.count ?? 0
    let webDomainCount = store.shield.webDomains?.count ?? 0
    let applicationCategoryState = categoryPolicyState(
      store.shield.applicationCategories
    )
    let webDomainCategoryState = categoryPolicyState(
      store.shield.webDomainCategories
    )
    let categoryCount = max(
      applicationCategoryState.count,
      webDomainCategoryState.count
    )
    let usesAllCategories = applicationCategoryState.usesAllCategories ||
      webDomainCategoryState.usesAllCategories
    let isApplied = applicationCount > 0 ||
      webDomainCount > 0 ||
      categoryCount > 0 ||
      usesAllCategories

    return [
      "isApplied": isApplied,
      "applicationCount": applicationCount,
      "categoryCount": categoryCount,
      "webDomainCount": webDomainCount,
      "usesAllCategories": usesAllCategories,
      "source": "namedManagedSettingsStore",
    ]
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
