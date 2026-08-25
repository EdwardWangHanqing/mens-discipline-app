export {
  GUIDED_ROUTINE_SET_COUNT as DAILY_SET_COUNT,
  REPS_PER_SET,
  REST_SECONDS,
  TOTAL_DAILY_REPS,
} from '../training/guidedRoutineEngine';

export type Movement = {
  id: string;
  displayName: string;
  focus: string;
  instruction: string;
  coachImage: number;
  coachAnimationAsset?: string;
  audioAsset?: string;
};

const canonicalCoach = require('../../assets/images/coach-kneeling-drive.png');

// The first movement is the approved canonical visual example. The remaining
// entries preserve the seven-card data architecture until final names/media are
// supplied; no screen or training quantity is duplicated per movement.
export const movements: Movement[] = [
  {
    id: 'kneeling-drive',
    displayName: 'Kneeling Drive',
    focus: 'Glutes · hips · pelvic control',
    instruction: 'Control the drive. Squeeze and hold.',
    coachImage: canonicalCoach,
  },
  ...Array.from({ length: 6 }, (_, index) => ({
    id: `movement-${index + 2}`,
    displayName: `Movement ${String(index + 2).padStart(2, '0')}`,
    focus: 'Guided control · lower-body strength',
    instruction: 'Stay controlled. Follow the coach.',
    coachImage: canonicalCoach,
  })),
];

export const todayMovement = movements[0];
