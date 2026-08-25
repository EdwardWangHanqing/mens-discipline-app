import { requireNativeView } from 'expo';
import { Host } from '@expo/ui/swift-ui';
import type { ViewProps } from 'react-native';

type NativeSelectedActivitiesViewProps = ViewProps & {
  available: boolean;
  revision: number;
};

const NativeSelectedActivitiesView =
  requireNativeView<NativeSelectedActivitiesViewProps>(
    'ExpoFamilyControls',
    'SelectedActivitiesView'
  );

export function SelectedActivitiesView(props: NativeSelectedActivitiesViewProps) {
  const { style, ...nativeProps } = props;
  return (
    <Host style={style} matchContents={{ vertical: true }} ignoreSafeArea="all">
      <NativeSelectedActivitiesView {...nativeProps} />
    </Host>
  );
}
