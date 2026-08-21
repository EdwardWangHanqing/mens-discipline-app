import assert from 'node:assert/strict';
import test from 'node:test';

import {
  GUIDED_ROUTINE_SET_COUNT,
  INTER_SET_REST_DURATION_MS,
  advanceRoutine,
  createInitialRoutineState,
  interruptRoutine,
  markAccountabilitySucceeded,
  representativeMovementSpecification,
  startRoutine,
} from './guidedRoutineEngine.ts';

const spec = representativeMovementSpecification;

function enterFirstSet(
  state = startRoutine(createInitialRoutineState(), spec),
  movementSpecification = spec
) {
  return advanceRoutine(
    state,
    movementSpecification,
    movementSpecification.demonstrationDurationMs +
      movementSpecification.countdownDurationMs
  );
}

test('runs demonstration then countdown before the first guided set', () => {
  let state = startRoutine(createInitialRoutineState(), spec);
  assert.equal(state.phase, 'demonstration');
  state = advanceRoutine(state, spec, spec.demonstrationDurationMs);
  assert.equal(state.phase, 'countdown');
  state = advanceRoutine(state, spec, spec.countdownDurationMs);
  assert.equal(state.phase, 'guidedSet');
  assert.equal(state.setNumber, 1);
});

test('uses movement-specific repetitions and cadence', () => {
  const alternate = {
    ...spec,
    id: 'alternate-test-movement',
    repsPerSet: 3,
    cadence: { repDurationMs: 750 },
  };
  let state = enterFirstSet(
    startRoutine(createInitialRoutineState(), alternate),
    alternate
  );
  state = advanceRoutine(state, alternate, 1_500);
  assert.equal(state.repetitionsCompleted, 2);
  state = advanceRoutine(state, alternate, 750);
  assert.equal(state.phase, 'rest');
});

test('requires exactly five sets and inserts exactly four 20-second rests', () => {
  let state = enterFirstSet();
  let restCount = 0;

  for (let setNumber = 1; setNumber <= GUIDED_ROUTINE_SET_COUNT; setNumber += 1) {
    assert.equal(state.phase, 'guidedSet');
    assert.equal(state.setNumber, setNumber);
    state = advanceRoutine(
      state,
      spec,
      spec.repsPerSet * spec.cadence.repDurationMs
    );
    if (setNumber < GUIDED_ROUTINE_SET_COUNT) {
      assert.equal(state.phase, 'rest');
      restCount += 1;
      state = advanceRoutine(state, spec, INTER_SET_REST_DURATION_MS - 1);
      assert.equal(state.phase, 'rest');
      state = advanceRoutine(state, spec, 1);
    }
  }

  assert.equal(restCount, 4);
  assert.equal(state.phase, 'awaitingAccountability');
});

test('does not create a rest after set five or complete prematurely', () => {
  let state = enterFirstSet();
  const fourSetDuration =
    4 * spec.repsPerSet * spec.cadence.repDurationMs +
    4 * INTER_SET_REST_DURATION_MS;
  state = advanceRoutine(state, spec, fourSetDuration);
  assert.equal(state.phase, 'guidedSet');
  assert.equal(state.setNumber, 5);

  const beforeFinalRep =
    spec.repsPerSet * spec.cadence.repDurationMs - 1;
  state = advanceRoutine(state, spec, beforeFinalRep);
  assert.equal(state.phase, 'guidedSet');
  state = advanceRoutine(state, spec, 1);
  assert.equal(state.phase, 'awaitingAccountability');
});

test('background interruption resets progress without granting completion', () => {
  let state = enterFirstSet();
  state = advanceRoutine(state, spec, spec.cadence.repDurationMs * 2);
  state = interruptRoutine(state);
  assert.equal(state.phase, 'idle');
  assert.equal(state.interruptionReason, 'appBackgrounded');
  assert.equal(markAccountabilitySucceeded(state), state);
});

test('completion acknowledgement is final-state-only and duplicate-safe', () => {
  const guided = enterFirstSet();
  assert.equal(markAccountabilitySucceeded(guided), guided);

  const totalTimedDuration =
    GUIDED_ROUTINE_SET_COUNT *
      spec.repsPerSet *
      spec.cadence.repDurationMs +
    (GUIDED_ROUTINE_SET_COUNT - 1) * INTER_SET_REST_DURATION_MS;
  const awaiting = advanceRoutine(guided, spec, totalTimedDuration);
  const completed = markAccountabilitySucceeded(awaiting);
  assert.equal(completed.phase, 'completed');
  assert.equal(markAccountabilitySucceeded(completed), completed);
});
