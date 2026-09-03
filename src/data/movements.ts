import {
  GUIDED_ROUTINE_SET_COUNT,
  REST_SECONDS,
} from '../training/guidedRoutineEngine';
import { movementDefinitions, type MovementDefinition } from './movementLibrary';

export { GUIDED_ROUTINE_SET_COUNT as DAILY_SET_COUNT, REST_SECONDS };

export type Movement = MovementDefinition & {
  coachImage: number;
  coachVideo?: number;
  coachAnimationAsset?: string;
  audioAsset?: string;
};

const canonicalCoach = require('../../assets/images/coach-kneeling-drive.png');
const kneelingDriveReady = require('../../assets/images/kneeling-drive-ready.png');
const kneelingDriveCoachVideo = require('../../assets/videos/kneeling-drive-coach-muted.mp4');
const butterflyOpenReady = require('../../assets/images/butterfly-open-ready.png');
const butterflyOpenCoachVideo = require('../../assets/videos/butterfly-open-coach-muted.mp4');
const bridgeExtensionReady = require('../../assets/images/bridge-extension-ready.png');
const bridgeExtensionCoachVideo = require('../../assets/videos/bridge-extension-coach-muted.mp4');
const reverseBridgeReady = require('../../assets/images/reverse-bridge-ready.png');
const reverseBridgeCoachVideo = require('../../assets/videos/reverse-bridge-coach-muted.mp4');

// Production movement quantities are sourced from the Owner's
// "Movement Pool and Reveal Update". Coach media remains replaceable.
export const movements: Movement[] = movementDefinitions.map((definition) => ({
  ...definition,
  coachImage: definition.id === 'kneeling-drive'
    ? kneelingDriveReady
    : definition.id === 'butterfly-open'
      ? butterflyOpenReady
      : definition.id === 'bridge-extension'
        ? bridgeExtensionReady
        : definition.id === 'reverse-bridge'
          ? reverseBridgeReady
          : canonicalCoach,
  coachVideo: definition.id === 'kneeling-drive'
    ? kneelingDriveCoachVideo
    : definition.id === 'butterfly-open'
      ? butterflyOpenCoachVideo
      : definition.id === 'bridge-extension'
        ? bridgeExtensionCoachVideo
        : definition.id === 'reverse-bridge'
          ? reverseBridgeCoachVideo
          : undefined,
}));

export function movementById(id: string | undefined): Movement {
  return movements.find((candidate) => candidate.id === id) ?? movements[0];
}

export function totalMovementReps(movementValue: Movement) {
  return GUIDED_ROUTINE_SET_COUNT * movementValue.repsPerSet;
}
