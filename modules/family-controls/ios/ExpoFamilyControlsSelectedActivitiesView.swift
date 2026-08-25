import ExpoModulesCore
import FamilyControls
import SwiftUI

final class SelectedActivitiesViewProps: ExpoSwiftUI.ViewProps {
  @Field var available = false
  @Field var revision = 0
}

struct SelectedActivitiesView: ExpoSwiftUI.View {
  @ObservedObject var props: SelectedActivitiesViewProps

  var body: some View {
    let storedSelection = FamilyControlsSelectionStore().load()

    Group {
      if let selection = storedSelection.selection, !storedSelection.isEmpty {
        VStack(spacing: 0) {
          ForEach(Array(selection.applicationTokens), id: \.self) { token in
            activityRow(Label(token))
          }
          ForEach(Array(selection.categoryTokens), id: \.self) { token in
            activityRow(Label(token))
          }
          ForEach(Array(selection.webDomainTokens), id: \.self) { token in
            activityRow(Label(token))
          }
        }
      } else {
        EmptyView()
      }
    }
    .background(Color.clear)
  }

  private func activityRow<Content: View>(_ label: Content) -> some View {
    HStack(spacing: 12) {
      label
        .font(.system(size: 15, weight: .semibold))
        .foregroundStyle(Color(red: 0.93, green: 0.95, blue: 0.97))
        .lineLimit(1)
      Spacer(minLength: 8)
      Text(props.available ? "AVAILABLE" : "LOCKED")
        .font(.system(size: 10, weight: .bold))
        .tracking(0.9)
        .foregroundStyle(Color(red: 1.0, green: 0.80, blue: 0.08))
      Image(systemName: props.available ? "lock.open.fill" : "lock.fill")
        .font(.system(size: 12, weight: .semibold))
        .foregroundStyle(Color(red: 1.0, green: 0.80, blue: 0.08))
    }
    .frame(height: 48)
    .padding(.horizontal, 16)
    .overlay(alignment: .bottom) {
      Rectangle()
        .fill(Color.white.opacity(0.07))
        .frame(height: 0.5)
        .padding(.leading, 16)
    }
  }
}
