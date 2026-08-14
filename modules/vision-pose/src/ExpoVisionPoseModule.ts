import type {
  PoseDetectionResult,
  PoseImageOrientation,
} from './ExpoVisionPose.types';

const unsupportedPlatformMessage =
  'Apple Vision pose detection is only available in the iOS app.';

export default {
  async detectPoseFromImageFile(
    _imageUri: string,
    _orientation: PoseImageOrientation = 'up',
    _isMirrored = false
  ): Promise<PoseDetectionResult> {
    throw new Error(unsupportedPlatformMessage);
  },
};
