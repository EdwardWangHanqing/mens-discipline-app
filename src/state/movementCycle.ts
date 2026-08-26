import { movementDefinitions, type MovementDefinition } from '../data/movementLibrary.ts';

export const MOVEMENTS_PER_CYCLE = 7;

export type MovementCycleState = {
  version: 1;
  cycleNumber: number;
  movementIds: string[];
  dayIndex: number;
  dateKey: string;
  replacedDateKeys: string[];
};

type RandomSource = () => number;

function shuffledMovementIds(random: RandomSource) {
  const ids = movementDefinitions.map((movement) => movement.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }
  return ids;
}

function nextCycle(dateKey: string, cycleNumber: number, random: RandomSource): MovementCycleState {
  return {
    version: 1,
    cycleNumber,
    movementIds: shuffledMovementIds(random).slice(0, MOVEMENTS_PER_CYCLE),
    dayIndex: 0,
    dateKey,
    replacedDateKeys: [],
  };
}

export function createMovementCycle(dateKey: string, random: RandomSource = Math.random) {
  return nextCycle(dateKey, 1, random);
}

export function normalizeMovementCycle(
  saved: MovementCycleState | undefined,
  dateKey: string,
  random: RandomSource = Math.random
): MovementCycleState {
  const validIds = new Set(movementDefinitions.map((movement) => movement.id));
  const valid =
    saved?.version === 1 &&
    saved.movementIds.length === MOVEMENTS_PER_CYCLE &&
    new Set(saved.movementIds).size === MOVEMENTS_PER_CYCLE &&
    saved.movementIds.every((id) => validIds.has(id)) &&
    saved.dayIndex >= 0 &&
    saved.dayIndex < MOVEMENTS_PER_CYCLE;

  if (!valid || !saved) return createMovementCycle(dateKey, random);
  if (saved.dateKey === dateKey) return saved;

  if (saved.dayIndex + 1 >= MOVEMENTS_PER_CYCLE) {
    return nextCycle(dateKey, saved.cycleNumber + 1, random);
  }

  return {
    ...saved,
    dayIndex: saved.dayIndex + 1,
    dateKey,
  };
}

export function movementForCycle(state: MovementCycleState): MovementDefinition {
  const id = state.movementIds[state.dayIndex];
  return movementDefinitions.find((movement) => movement.id === id) ?? movementDefinitions[0];
}

export function replaceTodayMovement(
  state: MovementCycleState,
  random: RandomSource = Math.random
): MovementCycleState {
  if (state.replacedDateKeys.includes(state.dateKey)) return state;

  const cycleIds = new Set(state.movementIds);
  const replacement = shuffledMovementIds(random).find((id) => !cycleIds.has(id));
  if (!replacement) return state;

  const movementIds = [...state.movementIds];
  movementIds[state.dayIndex] = replacement;
  return {
    ...state,
    movementIds,
    replacedDateKeys: [...state.replacedDateKeys, state.dateKey],
  };
}

export function canReplaceTodayMovement(state: MovementCycleState) {
  return !state.replacedDateKeys.includes(state.dateKey);
}
