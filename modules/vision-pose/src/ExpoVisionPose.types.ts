export const POSE_JOINT_NAMES = [
  'nose',
  'leftEye',
  'rightEye',
  'leftEar',
  'rightEar',
  'neck',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'root',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
] as const;

export type PoseJointName = (typeof POSE_JOINT_NAMES)[number];

export type PoseImageOrientation = 'up' | 'down' | 'left' | 'right';

export type PoseJointObservation = {
  name: PoseJointName;
  x: number | null;
  y: number | null;
  confidence: number;
  available: boolean;
  position3D?: PoseJointPosition3D | null;
};

export type PoseJointPosition3D = {
  x: number;
  y: number;
  z: number;
  coordinateSpace: 'modelRelativeToRoot';
};

export type PoseFrame = {
  source: 'localImage' | 'liveCamera';
  timestampMs: number;
  orientation: PoseImageOrientation;
  isMirrored: boolean;
  coordinateOrigin: 'bottomLeft';
  overallConfidence: number;
  availableJointCount: number;
  hasThreeDimensionalPose?: boolean;
  threeDimensionalHeightEstimation?: 'reference' | 'measured' | null;
  joints: PoseJointObservation[];
};

export type CameraPermissionStatus =
  | 'authorized'
  | 'denied'
  | 'restricted'
  | 'notDetermined'
  | 'unknown';

export type CameraPermissionResult = {
  status: CameraPermissionStatus;
};

export type VisionPoseCameraPosition = 'front' | 'back';

export type VisionPoseCameraState = {
  status:
    | 'stopped'
    | 'starting'
    | 'running'
    | 'permissionRequired'
    | 'failed';
  permissionStatus: CameraPermissionStatus;
  cameraPosition: VisionPoseCameraPosition;
  message: string | null;
};

export type LivePoseFrameEvent = {
  result: PoseDetectionResult;
  sequenceNumber: number;
  processingDurationMs: number;
};

export type PoseInputErrorCode =
  | 'invalidUri'
  | 'nonLocalUri'
  | 'fileNotFound'
  | 'unreadableFile'
  | 'unsupportedFormat'
  | 'unsupportedOrientation';

export type PoseDetectionResult =
  | {
      status: 'poseAvailable' | 'partialPoseAvailable';
      frame: PoseFrame;
      errorCode: null;
      message: null;
    }
  | {
      status: 'noPose';
      frame: null;
      errorCode: null;
      message: null;
    }
  | {
      status: 'invalidInput';
      frame: null;
      errorCode: PoseInputErrorCode;
      message: string;
    }
  | {
      status: 'processingFailed';
      frame: null;
      errorCode: 'visionError';
      message: string;
    };
