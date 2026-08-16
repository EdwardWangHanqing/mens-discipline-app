import { requireNativeViewManager } from 'expo-modules-core';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';

import type {
  LivePoseFrameEvent,
  VisionPoseCameraPosition,
  VisionPoseCameraState,
} from './ExpoVisionPose.types';

type NativeVisionPoseCameraViewProps = {
  active: boolean;
  cameraPosition: VisionPoseCameraPosition;
  onCameraState?: (
    event: NativeSyntheticEvent<VisionPoseCameraState>
  ) => void;
  onPoseFrame?: (
    event: NativeSyntheticEvent<LivePoseFrameEvent>
  ) => void;
  style?: StyleProp<ViewStyle>;
};

export type VisionPoseCameraViewProps = {
  active: boolean;
  cameraPosition?: VisionPoseCameraPosition;
  onCameraState?: (state: VisionPoseCameraState) => void;
  onPoseFrame?: (event: LivePoseFrameEvent) => void;
  style?: StyleProp<ViewStyle>;
};

const NativeVisionPoseCameraView =
  requireNativeViewManager<NativeVisionPoseCameraViewProps>(
    'ExpoVisionPose',
    'ExpoVisionPoseCameraView'
  );

export function VisionPoseCameraView({
  active,
  cameraPosition = 'front',
  onCameraState,
  onPoseFrame,
  style,
}: VisionPoseCameraViewProps) {
  return (
    <NativeVisionPoseCameraView
      active={active}
      cameraPosition={cameraPosition}
      onCameraState={(event) => onCameraState?.(event.nativeEvent)}
      onPoseFrame={(event) => onPoseFrame?.(event.nativeEvent)}
      style={style}
    />
  );
}
