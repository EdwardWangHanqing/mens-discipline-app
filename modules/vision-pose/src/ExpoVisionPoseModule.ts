import type {
  CameraPermissionResult,
  PoseDetectionResult,
  PoseImageOrientation,
} from './ExpoVisionPose.types';

const unsupportedPlatformMessage =
  'Apple Vision pose detection is only available in the iOS app.';

export default {
  getCameraPermissionStatus(): CameraPermissionResult {
    return { status: 'unknown' };
  },

  async requestCameraPermission(): Promise<CameraPermissionResult> {
    return { status: 'unknown' };
  },

  async detectPoseFromImageFile(
    _imageUri: string,
    _orientation: PoseImageOrientation = 'up',
    _isMirrored = false
  ): Promise<PoseDetectionResult> {
    throw new Error(unsupportedPlatformMessage);
  },
};
