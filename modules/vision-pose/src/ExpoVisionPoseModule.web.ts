import { NativeModule, registerWebModule } from 'expo';

import type {
  CameraPermissionResult,
  PoseDetectionResult,
  PoseImageOrientation,
} from './ExpoVisionPose.types';

class ExpoVisionPoseModule extends NativeModule {
  getCameraPermissionStatus(): CameraPermissionResult {
    return { status: 'unknown' };
  }

  async requestCameraPermission(): Promise<CameraPermissionResult> {
    return { status: 'unknown' };
  }

  async detectPoseFromImageFile(
    _imageUri: string,
    _orientation: PoseImageOrientation = 'up',
    _isMirrored = false
  ): Promise<PoseDetectionResult> {
    throw new Error(
      'Apple Vision pose detection is only available in the iOS app.'
    );
  }
}

export default registerWebModule(ExpoVisionPoseModule, 'ExpoVisionPoseModule');
