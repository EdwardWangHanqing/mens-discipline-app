import { NativeModule, requireNativeModule } from 'expo';

import type {
  PoseDetectionResult,
  PoseImageOrientation,
} from './ExpoVisionPose.types';

declare class ExpoVisionPoseModule extends NativeModule {
  detectPoseFromImageFile(
    imageUri: string,
    orientation: PoseImageOrientation,
    isMirrored: boolean
  ): Promise<PoseDetectionResult>;
}

const nativeModule = requireNativeModule<ExpoVisionPoseModule>('ExpoVisionPose');

export default {
  detectPoseFromImageFile(
    imageUri: string,
    orientation: PoseImageOrientation = 'up',
    isMirrored = false
  ): Promise<PoseDetectionResult> {
    return nativeModule.detectPoseFromImageFile(
      imageUri,
      orientation,
      isMirrored
    );
  },
};
