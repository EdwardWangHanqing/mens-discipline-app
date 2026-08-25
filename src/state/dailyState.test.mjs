import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateCurrentMomentum,
  consumeGrace,
  createGraceBudget,
  expireGrace,
  greetingForHour,
} from './dailyState.ts';

test('grace starts with three uses and consumes one use per activation', () => {
  const initial = createGraceBudget('2026-08-24');
  const first = consumeGrace(initial, 1_000, 300_000);
  assert.equal(initial.remaining, 3);
  assert.equal(first.remaining, 2);
  assert.equal(first.activeUntil, 301_000);
});

test('grace cannot be consumed twice while active and restores the lock state after expiry', () => {
  const active = consumeGrace(createGraceBudget('2026-08-24'), 1_000, 300_000);
  assert.deepEqual(consumeGrace(active, 2_000), active);
  assert.equal(expireGrace(active, 301_000).activeUntil, null);
});

test('grace cannot fall below zero', () => {
  const exhausted = { dateKey: '2026-08-24', remaining: 0, activeUntil: null };
  assert.deepEqual(consumeGrace(exhausted, 1_000), exhausted);
});

test('momentum uses consecutive local dates and tolerates an incomplete current day', () => {
  assert.equal(calculateCurrentMomentum(['2026-08-21', '2026-08-22', '2026-08-23'], new Date(2026, 7, 24, 12)), 3);
  assert.equal(calculateCurrentMomentum(['2026-08-20', '2026-08-22', '2026-08-23'], new Date(2026, 7, 24, 12)), 2);
  assert.equal(calculateCurrentMomentum([], new Date(2026, 7, 24, 12)), 0);
});

test('greeting follows the locked morning, afternoon, and evening boundaries', () => {
  assert.equal(greetingForHour(4), 'Good evening');
  assert.equal(greetingForHour(5), 'Good morning');
  assert.equal(greetingForHour(11), 'Good morning');
  assert.equal(greetingForHour(12), 'Good afternoon');
  assert.equal(greetingForHour(16), 'Good afternoon');
  assert.equal(greetingForHour(17), 'Good evening');
});
