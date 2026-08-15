import ExpoModulesCore
import FamilyControls
import Foundation
import SwiftUI
import UIKit

final class FamilyControlsSelectionStore {
  private let sharedStateStore: FamilyControlsSharedStateStore

  init(sharedStateStore: FamilyControlsSharedStateStore = .init()) {
    self.sharedStateStore = sharedStateStore
  }

  func load() -> FamilyControlsStoredSelection {
    sharedStateStore.loadSelection()
  }

  func save(
    _ selection: FamilyActivitySelection
  ) throws -> FamilyControlsStoredSelection {
    let storedSelection = try sharedStateStore.saveSelection(selection)
    if storedSelection.isEmpty {
      _ = FamilyControlsShieldStore().remove()
    }
    return storedSelection
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
