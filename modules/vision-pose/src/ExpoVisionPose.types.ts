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
};

export type PoseFrame = {
  source: 'localImage';
  timestampMs: number;
  orientation: PoseImageOrientation;
  isMirrored: boolean;
  coordinateOrigin: 'bottomLeft';
  overallConfidence: number;
  availableJointCount: number;
  joints: PoseJointObservation[];
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
