import { NativeModule, requireNativeModule } from 'expo';

import type {
  CameraPermissionResult,
  PoseDetectionResult,
  PoseImageOrientation,
} from './ExpoVisionPose.types';

declare class ExpoVisionPoseModule extends NativeModule {
  getCameraPermissionStatus(): CameraPermissionResult;
  requestCameraPermission(): Promise<CameraPermissionResult>;
  detectPoseFromImageFile(
    imageUri: string,
    orientation: PoseImageOrientation,
    isMirrored: boolean
  ): Promise<PoseDetectionResult>;
}

const nativeModule = requireNativeModule<ExpoVisionPoseModule>('ExpoVisionPose');

export default {
  getCameraPermissionStatus(): CameraPermissionResult {
    return nativeModule.getCameraPermissionStatus();
  },

  requestCameraPermission(): Promise<CameraPermissionResult> {
    return nativeModule.requestCameraPermission();
  },

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
