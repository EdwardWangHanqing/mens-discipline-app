export type GraceBudget = {
  dateKey: string;
  remaining: number;
  activeUntil: number | null;
};

export function createGraceBudget(dateKey: string): GraceBudget {
  return { dateKey, remaining: 3, activeUntil: null };
}

export function consumeGrace(budget: GraceBudget, now: number, durationMs = 5 * 60 * 1000): GraceBudget {
  if (budget.remaining <= 0 || (budget.activeUntil !== null && budget.activeUntil > now)) return budget;
  return {
    ...budget,
    remaining: budget.remaining - 1,
    activeUntil: now + durationMs,
  };
}

export function expireGrace(budget: GraceBudget, now: number): GraceBudget {
  if (budget.activeUntil === null || budget.activeUntil > now) return budget;
  return { ...budget, activeUntil: null };
}

export function calculateCurrentMomentum(completedDates: string[], now: Date) {
  const completed = new Set(completedDates);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!completed.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (completed.has(localDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
