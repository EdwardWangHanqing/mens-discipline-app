export const GUIDED_ROUTINE_SET_COUNT = 5;
export const REPS_PER_SET = 20;
export const REST_SECONDS = 20;
export const INTER_SET_REST_DURATION_MS = REST_SECONDS * 1_000;
export const TOTAL_DAILY_REPS = GUIDED_ROUTINE_SET_COUNT * REPS_PER_SET;

export type MovementCadence = {
  repDurationMs: number;
};

export type GuidedMovementSpecification = {
  id: string;
  displayName: string;
  cadence: MovementCadence;
  demonstrationDurationMs: number;
  countdownDurationMs: number;
  isRepresentativeOnly: boolean;
};

export type GuidedRoutinePhase =
  | 'idle'
  | 'demonstration'
  | 'countdown'
  | 'guidedSet'
  | 'rest'
  | 'awaitingAccountability'
  | 'completionFailed'
  | 'completed';

export type GuidedRoutineState = {
  phase: GuidedRoutinePhase;
  sessionId: number;
  setNumber: number;
  repetitionsCompleted: number;
  phaseElapsedMs: number;
  completionAttempt: number;
  interruptionReason: 'appBackgrounded' | null;
  completionError: string | null;
};

export const representativeMovementSpecification: GuidedMovementSpecification = {
  id: 'representative-guided-movement',
  displayName: 'Representative guided movement',
  cadence: { repDurationMs: 1_000 },
  demonstrationDurationMs: 3_000,
  countdownDurationMs: 3_000,
  isRepresentativeOnly: true,
};

export function createInitialRoutineState(): GuidedRoutineState {
  return {
    phase: 'idle',
    sessionId: 0,
    setNumber: 0,
    repetitionsCompleted: 0,
    phaseElapsedMs: 0,
    completionAttempt: 0,
    interruptionReason: null,
    completionError: null,
  };
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

export function validateMovementSpecification(
  specification: GuidedMovementSpecification
): void {
  if (!specification.id.trim() || !specification.displayName.trim()) {
    throw new Error('Movement id and display name are required.');
  }
  assertPositiveInteger(
    specification.cadence.repDurationMs,
    'cadence.repDurationMs'
  );
  assertPositiveInteger(
    specification.demonstrationDurationMs,
    'demonstrationDurationMs'
  );
  assertPositiveInteger(
    specification.countdownDurationMs,
    'countdownDurationMs'
  );
}

export function startRoutine(
  previous: GuidedRoutineState,
  specification: GuidedMovementSpecification
): GuidedRoutineState {
  validateMovementSpecification(specification);
  return {
    ...createInitialRoutineState(),
    phase: 'demonstration',
    sessionId: previous.sessionId + 1,
  };
}

export function isTimedRoutinePhase(phase: GuidedRoutinePhase): boolean {
  return (
    phase === 'demonstration' ||
    phase === 'countdown' ||
    phase === 'guidedSet' ||
    phase === 'rest'
  );
}

export function phaseDurationMs(
  state: GuidedRoutineState,
  specification: GuidedMovementSpecification
): number | null {
  switch (state.phase) {
    case 'demonstration':
      return specification.demonstrationDurationMs;
    case 'countdown':
      return specification.countdownDurationMs;
    case 'guidedSet':
      return REPS_PER_SET * specification.cadence.repDurationMs;
    case 'rest':
      return INTER_SET_REST_DURATION_MS;
    default:
      return null;
  }
}

function enterNextPhase(
  state: GuidedRoutineState,
  specification: GuidedMovementSpecification
): GuidedRoutineState {
  switch (state.phase) {
    case 'demonstration':
      return { ...state, phase: 'countdown', phaseElapsedMs: 0 };
    case 'countdown':
      return {
        ...state,
        phase: 'guidedSet',
        setNumber: 1,
        repetitionsCompleted: 0,
        phaseElapsedMs: 0,
      };
    case 'guidedSet':
      if (state.setNumber === GUIDED_ROUTINE_SET_COUNT) {
        return {
          ...state,
          phase: 'awaitingAccountability',
          repetitionsCompleted: REPS_PER_SET,
          phaseElapsedMs: 0,
        };
      }
      return {
        ...state,
        phase: 'rest',
        repetitionsCompleted: REPS_PER_SET,
        phaseElapsedMs: 0,
      };
    case 'rest':
      return {
        ...state,
        phase: 'guidedSet',
        setNumber: state.setNumber + 1,
        repetitionsCompleted: 0,
        phaseElapsedMs: 0,
      };
    default:
      return state;
  }
}

export function advanceRoutine(
  state: GuidedRoutineState,
  specification: GuidedMovementSpecification,
  elapsedMs: number
): GuidedRoutineState {
  if (
    !Number.isFinite(elapsedMs) ||
    elapsedMs <= 0 ||
    !isTimedRoutinePhase(state.phase)
  ) {
    return state;
  }

  let next = state;
  let remainingMs = elapsedMs;

  while (remainingMs > 0 && isTimedRoutinePhase(next.phase)) {
    const durationMs = phaseDurationMs(next, specification);
    if (durationMs === null) {
      break;
    }
    const timeUntilTransition = durationMs - next.phaseElapsedMs;
    const consumedMs = Math.min(remainingMs, timeUntilTransition);
    const phaseElapsedMs = next.phaseElapsedMs + consumedMs;
    next = {
      ...next,
      phaseElapsedMs,
      repetitionsCompleted:
        next.phase === 'guidedSet'
          ? Math.min(
              REPS_PER_SET,
              Math.floor(phaseElapsedMs / specification.cadence.repDurationMs)
            )
          : next.repetitionsCompleted,
    };
    remainingMs -= consumedMs;

    if (next.phaseElapsedMs >= durationMs) {
      next = enterNextPhase(next, specification);
    }
  }

  return next;
}

export function interruptRoutine(state: GuidedRoutineState): GuidedRoutineState {
  if (state.phase === 'idle' || state.phase === 'completed') {
    return state;
  }
  return {
    ...createInitialRoutineState(),
    sessionId: state.sessionId,
    interruptionReason: 'appBackgrounded',
  };
}

export function markAccountabilitySucceeded(
  state: GuidedRoutineState
): GuidedRoutineState {
  if (state.phase !== 'awaitingAccountability') {
    return state;
  }
  return { ...state, phase: 'completed', completionError: null };
}

export function markAccountabilityFailed(
  state: GuidedRoutineState,
  error: string
): GuidedRoutineState {
  if (state.phase !== 'awaitingAccountability') {
    return state;
  }
  return { ...state, phase: 'completionFailed', completionError: error };
}

export function retryAccountability(
  state: GuidedRoutineState
): GuidedRoutineState {
  if (state.phase !== 'completionFailed') {
    return state;
  }
  return {
    ...state,
    phase: 'awaitingAccountability',
    completionAttempt: state.completionAttempt + 1,
    completionError: null,
  };
}

export function remainingPhaseMs(
  state: GuidedRoutineState,
  specification: GuidedMovementSpecification
): number | null {
  const durationMs = phaseDurationMs(state, specification);
  return durationMs === null ? null : Math.max(0, durationMs - state.phaseElapsedMs);
}
