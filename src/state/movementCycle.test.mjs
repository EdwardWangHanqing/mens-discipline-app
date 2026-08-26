import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MOVEMENTS_PER_CYCLE,
  canReplaceTodayMovement,
  createMovementCycle,
  movementForCycle,
  normalizeMovementCycle,
  replaceTodayMovement,
} from './movementCycle.ts';

function seeded(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

test('creates a random seven-movement cycle with no duplicates', () => {
  const cycle = createMovementCycle('2026-08-25', seeded([0.12, 0.91, 0.37, 0.55]));
  assert.equal(cycle.movementIds.length, MOVEMENTS_PER_CYCLE);
  assert.equal(new Set(cycle.movementIds).size, MOVEMENTS_PER_CYCLE);
  assert.equal(cycle.dateKey, '2026-08-25');
});

test('keeps the same movement for the same date across app restores', () => {
  const cycle = createMovementCycle('2026-08-25', () => 0.5);
  const restored = normalizeMovementCycle(cycle, '2026-08-25', () => 0.1);
  assert.deepEqual(restored, cycle);
  assert.equal(movementForCycle(restored).id, movementForCycle(cycle).id);
});

test('advances once per new daily session and starts a fresh randomized cycle after day seven', () => {
  let cycle = createMovementCycle('2026-08-01', () => 0.2);
  const seen = new Set([movementForCycle(cycle).id]);
  for (let day = 2; day <= 7; day += 1) {
    cycle = normalizeMovementCycle(cycle, `2026-08-0${day}`, () => 0.2);
    seen.add(movementForCycle(cycle).id);
  }
  assert.equal(seen.size, 7);
  const next = normalizeMovementCycle(cycle, '2026-08-08', () => 0.8);
  assert.equal(next.cycleNumber, 2);
  assert.equal(next.dayIndex, 0);
});

test('replace is limited to once per day and preserves cycle uniqueness', () => {
  const cycle = createMovementCycle('2026-08-25', () => 0.2);
  const replaced = replaceTodayMovement(cycle, () => 0.8);
  assert.notEqual(movementForCycle(replaced).id, movementForCycle(cycle).id);
  assert.equal(new Set(replaced.movementIds).size, MOVEMENTS_PER_CYCLE);
  assert.equal(canReplaceTodayMovement(replaced), false);
  assert.deepEqual(replaceTodayMovement(replaced, () => 0.1), replaced);
});
