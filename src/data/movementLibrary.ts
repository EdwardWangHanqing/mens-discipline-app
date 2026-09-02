import type { GuidedMovementSpecification } from '../training/guidedRoutineEngine.ts';

export type MovementDefinition = GuidedMovementSpecification & {
  focus: string;
  instruction: string;
};

function movement(
  id: string,
  displayName: string,
  repsPerSet: number,
  repDurationMs: number,
  focus: string,
  instruction: string
): MovementDefinition {
  return {
    id,
    displayName,
    repsPerSet,
    cadence: { repDurationMs },
    demonstrationDurationMs: 3_000,
    countdownDurationMs: 3_000,
    isRepresentativeOnly: false,
    focus,
    instruction,
  };
}

export const movementDefinitions: MovementDefinition[] = [
  movement('frog-pump', 'Frog Pump', 20, 1_500, 'Glutes · hips · control', 'Press evenly. Own the squeeze.'),
  movement('kneeling-drive', 'Kneeling Drive', 15, 1_500, 'Glutes · hips · pelvic control', 'Control the drive. Squeeze and hold.'),
  movement('hip-bridge-drive', 'Hip Bridge / Hip Drive', 12, 1_500, 'Glutes · posterior chain · control', 'Lift with control. Lower without rushing.'),
  movement('deep-pulse', 'Deep Pulse', 20, 1_500, 'Hips · range · endurance', 'Stay low. Keep every pulse deliberate.'),
  movement('reverse-bridge', 'Reverse Bridge', 12, 1_500, 'Posterior chain · shoulders · hips', 'Press tall. Keep the line controlled.'),
  movement('diamond-raise', 'Diamond Raise', 12, 1_500, 'Adductors · hips · control', 'Keep the shape. Raise without momentum.'),
  movement('hip-rock', 'Hip Rock', 16, 1_500, 'Hips · mobility · rhythm', 'Move smoothly through the full range.'),
  movement('butterfly-open', 'Butterfly Open', 12, 1_500, 'Inner hips · control · mobility', 'Open slowly. Return with control.'),
  movement('bridge-extension', 'Bridge Extension', 12, 1_500, 'Glutes · hamstrings · extension', 'Reach long. Keep the hips steady.'),
  movement('v-open', 'V-Open', 12, 1_500, 'Core · hips · coordination', 'Open with control. Close without collapsing.'),
];
