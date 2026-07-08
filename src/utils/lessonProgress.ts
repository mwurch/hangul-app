import { LESSONS } from '../data/lessons';
import type { Lesson } from '../data/lessons';
import type { JamoProgress } from '../store/progress.store';

/** A jamo counts toward lesson completion once answered correctly this many times. */
export const LESSON_COMPLETE_THRESHOLD = 1;

type ProgressMap = Readonly<Record<string, JamoProgress>>;

/**
 * A lesson is complete when every one of its chars has a progress entry
 * with correctCount >= LESSON_COMPLETE_THRESHOLD.
 */
export function isLessonComplete(
  lesson: Lesson,
  progress: ProgressMap,
): boolean {
  return lesson.chars.every((char) => {
    const entry = progress[char];
    return (
      entry !== undefined && entry.correctCount >= LESSON_COMPLETE_THRESHOLD
    );
  });
}

/**
 * Returns the ids of unlocked lessons. Lesson 1 is always unlocked;
 * lesson n is unlocked iff all lessons 1..n-1 are complete, so a gap
 * blocks every lesson after it.
 */
export function getUnlockedLessonIds(progress: ProgressMap): readonly number[] {
  const unlockedIds: number[] = [];
  for (const lesson of LESSONS) {
    unlockedIds.push(lesson.id);
    if (!isLessonComplete(lesson, progress)) {
      break;
    }
  }
  return unlockedIds;
}

/** Union of the chars of all unlocked lessons. */
export function getUnlockedChars(progress: ProgressMap): ReadonlySet<string> {
  const unlockedIds = new Set(getUnlockedLessonIds(progress));
  const chars = LESSONS.filter((lesson) => unlockedIds.has(lesson.id)).flatMap(
    (lesson) => [...lesson.chars],
  );
  return new Set(chars);
}

/** Returns the lesson containing the given char, or undefined if none does. */
export function getLessonForChar(char: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.chars.includes(char));
}

/**
 * Returns the first unlocked-but-incomplete lesson; if every lesson is
 * complete, returns the last lesson.
 */
export function getCurrentLesson(progress: ProgressMap): Lesson {
  const firstIncomplete = LESSONS.find(
    (lesson) => !isLessonComplete(lesson, progress),
  );
  return firstIncomplete ?? (LESSONS[LESSONS.length - 1] as Lesson);
}

/** Per-lesson display state derived from progress. */
export type LessonStatus =
  | { readonly kind: 'complete' }
  | { readonly kind: 'unlocked'; readonly correctChars: number }
  | { readonly kind: 'locked' };

export interface LessonWithStatus {
  readonly lesson: Lesson;
  readonly status: LessonStatus;
}

/** Number of lesson chars answered correctly at least LESSON_COMPLETE_THRESHOLD times. */
export function countCorrectChars(
  lesson: Lesson,
  progress: ProgressMap,
): number {
  return lesson.chars.filter((char) => {
    const entry = progress[char];
    return (
      entry !== undefined && entry.correctCount >= LESSON_COMPLETE_THRESHOLD
    );
  }).length;
}

function deriveLessonStatus(
  lesson: Lesson,
  unlockedIds: ReadonlySet<number>,
  progress: ProgressMap,
): LessonStatus {
  if (isLessonComplete(lesson, progress)) {
    return { kind: 'complete' };
  }
  if (unlockedIds.has(lesson.id)) {
    return {
      kind: 'unlocked',
      correctChars: countCorrectChars(lesson, progress),
    };
  }
  return { kind: 'locked' };
}

/** All lessons in curriculum order, each paired with its derived status. */
export function getLessonStatuses(
  progress: ProgressMap,
): readonly LessonWithStatus[] {
  const unlockedIds = new Set(getUnlockedLessonIds(progress));
  return LESSONS.map((lesson) => ({
    lesson,
    status: deriveLessonStatus(lesson, unlockedIds, progress),
  }));
}

/** Screen-reader label for a lesson row, covering all three status kinds. */
export function describeLessonForAccessibility(
  lesson: Lesson,
  status: LessonStatus,
): string {
  const base = `Lesson ${lesson.id}, ${lesson.koreanTitle}`;
  if (status.kind === 'complete') {
    return `${base}, completed`;
  }
  if (status.kind === 'unlocked') {
    return `${base}, ${status.correctChars} of ${lesson.chars.length} correct`;
  }
  return `${base}, locked`;
}
