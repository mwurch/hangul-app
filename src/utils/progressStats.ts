import type { Jamo } from '../data/jamo';
import type { JamoProgress } from '../store/progress.store';

/** A jamo counts as learned once it has been answered correctly this many times. */
export const LEARNED_THRESHOLD = 3;

/**
 * Counts how many of the given characters are learned
 * (correctCount >= LEARNED_THRESHOLD).
 */
export function countLearned(
  progress: Readonly<Record<string, JamoProgress>>,
  chars: readonly string[],
): number {
  return chars.filter((char) => {
    const entry = progress[char];
    return entry !== undefined && entry.correctCount >= LEARNED_THRESHOLD;
  }).length;
}

/**
 * Returns the jamo due for review at `now`, most overdue first.
 * A jamo is due when it has a progress entry with nextReview <= now.
 * Pure: `now` is injected, inputs are never mutated.
 */
export function getReviewQueue(
  progress: Readonly<Record<string, JamoProgress>>,
  allJamo: readonly Jamo[],
  now: number,
): readonly Jamo[] {
  return allJamo
    .filter((jamo) => {
      const entry = progress[jamo.char];
      return entry !== undefined && entry.nextReview <= now;
    })
    .sort((a, b) => {
      const reviewA = progress[a.char]?.nextReview ?? 0;
      const reviewB = progress[b.char]?.nextReview ?? 0;
      return reviewA - reviewB;
    });
}
