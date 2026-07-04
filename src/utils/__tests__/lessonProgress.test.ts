import {
  getCurrentLesson,
  getLessonForChar,
  getUnlockedChars,
  getUnlockedLessonIds,
  isLessonComplete,
} from '../lessonProgress';
import { LESSONS } from '../../data/lessons';
import type { Lesson } from '../../data/lessons';
import type { JamoProgress } from '../../store/progress.store';

// --- Test helpers ---

const LESSON_1 = LESSONS[0] as Lesson;
const LESSON_2 = LESSONS[1] as Lesson;
const LESSON_3 = LESSONS[2] as Lesson;
const LAST_LESSON = LESSONS[LESSONS.length - 1] as Lesson;

function makeProgress(
  char: string,
  overrides: Partial<Omit<JamoProgress, 'char'>> = {},
): JamoProgress {
  return {
    char,
    seenCount: 0,
    correctCount: 0,
    lastSeen: 0,
    nextReview: 0,
    interval: 0,
    easeFactor: 2.5,
    ...overrides,
  };
}

function progressForChars(
  chars: readonly string[],
  correctCount: number,
): Record<string, JamoProgress> {
  return Object.fromEntries(
    chars.map((char) => [char, makeProgress(char, { correctCount })]),
  );
}

function completedLessons(
  lessons: readonly Lesson[],
): Record<string, JamoProgress> {
  const chars = lessons.flatMap((lesson) => [...lesson.chars]);
  return progressForChars(chars, 1);
}

// --- isLessonComplete ---

describe('isLessonComplete', () => {
  test('returns false for empty progress', () => {
    // Arrange
    const progress: Record<string, JamoProgress> = {};

    // Act
    const complete = isLessonComplete(LESSON_1, progress);

    // Assert
    expect(complete).toBe(false);
  });

  test('returns true when every lesson char has correctCount >= 1', () => {
    // Arrange
    const progress = progressForChars(LESSON_1.chars, 1);

    // Act
    const complete = isLessonComplete(LESSON_1, progress);

    // Assert
    expect(complete).toBe(true);
  });

  test('entries with correctCount 0 (seen but never correct) do not complete', () => {
    // Arrange
    const progress = progressForChars(LESSON_1.chars, 0);

    // Act
    const complete = isLessonComplete(LESSON_1, progress);

    // Assert
    expect(complete).toBe(false);
  });

  test('partial lesson (4 of 5 chars correct) stays incomplete', () => {
    // Arrange
    const fourChars = LESSON_1.chars.slice(0, 4);
    const progress = progressForChars(fourChars, 1);

    // Act
    const complete = isLessonComplete(LESSON_1, progress);

    // Assert
    expect(complete).toBe(false);
  });
});

// --- getUnlockedLessonIds ---

describe('getUnlockedLessonIds', () => {
  test('empty progress unlocks only lesson 1', () => {
    // Arrange
    const progress: Record<string, JamoProgress> = {};

    // Act
    const unlockedIds = getUnlockedLessonIds(progress);

    // Assert
    expect(unlockedIds).toEqual([1]);
  });

  test('completing lesson 1 unlocks lessons 1 and 2', () => {
    // Arrange
    const progress = completedLessons([LESSON_1]);

    // Act
    const unlockedIds = getUnlockedLessonIds(progress);

    // Assert
    expect(unlockedIds).toEqual([1, 2]);
  });

  test('completing lessons 1 and 2 unlocks lesson 3', () => {
    // Arrange
    const progress = completedLessons([LESSON_1, LESSON_2]);

    // Act
    const unlockedIds = getUnlockedLessonIds(progress);

    // Assert
    expect(unlockedIds).toEqual([1, 2, 3]);
  });

  test('a gap blocks everything after it (lesson 2 complete but 1 is not)', () => {
    // Arrange
    const progress = completedLessons([LESSON_2]);

    // Act
    const unlockedIds = getUnlockedLessonIds(progress);

    // Assert
    expect(unlockedIds).toEqual([1]);
  });

  test('all lessons complete unlocks every lesson id', () => {
    // Arrange
    const progress = completedLessons(LESSONS);

    // Act
    const unlockedIds = getUnlockedLessonIds(progress);

    // Assert
    expect(unlockedIds).toEqual(LESSONS.map((lesson) => lesson.id));
  });
});

// --- getUnlockedChars ---

describe('getUnlockedChars', () => {
  test("empty progress exposes only lesson 1's chars", () => {
    // Arrange
    const progress: Record<string, JamoProgress> = {};

    // Act
    const unlockedChars = getUnlockedChars(progress);

    // Assert
    expect(unlockedChars.size).toBe(LESSON_1.chars.length);
    LESSON_1.chars.forEach((char) => {
      expect(unlockedChars.has(char)).toBe(true);
    });
  });

  test('completing lesson 1 exposes chars of lessons 1 and 2', () => {
    // Arrange
    const progress = completedLessons([LESSON_1]);
    const expectedChars = [...LESSON_1.chars, ...LESSON_2.chars];

    // Act
    const unlockedChars = getUnlockedChars(progress);

    // Assert
    expect(unlockedChars.size).toBe(expectedChars.length);
    expectedChars.forEach((char) => {
      expect(unlockedChars.has(char)).toBe(true);
    });
  });

  test('locked lesson chars are not included', () => {
    // Arrange
    const progress: Record<string, JamoProgress> = {};
    const lockedChar = LESSON_3.chars[0] as string;

    // Act
    const unlockedChars = getUnlockedChars(progress);

    // Assert
    expect(unlockedChars.has(lockedChar)).toBe(false);
  });
});

// --- getLessonForChar ---

describe('getLessonForChar', () => {
  test('returns the lesson containing a known char', () => {
    // Arrange
    const knownChar = LESSON_2.chars[0] as string;

    // Act
    const lesson = getLessonForChar(knownChar);

    // Assert
    expect(lesson).toBe(LESSON_2);
  });

  test('returns undefined for an unknown char', () => {
    // Act
    const lesson = getLessonForChar('ㅉ');

    // Assert
    expect(lesson).toBeUndefined();
  });
});

// --- getCurrentLesson ---

describe('getCurrentLesson', () => {
  test('empty progress puts the learner on lesson 1', () => {
    // Arrange
    const progress: Record<string, JamoProgress> = {};

    // Act
    const current = getCurrentLesson(progress);

    // Assert
    expect(current).toBe(LESSON_1);
  });

  test('completing lesson 1 moves the learner to lesson 2', () => {
    // Arrange
    const progress = completedLessons([LESSON_1]);

    // Act
    const current = getCurrentLesson(progress);

    // Assert
    expect(current).toBe(LESSON_2);
  });

  test('all lessons complete returns the last lesson', () => {
    // Arrange
    const progress = completedLessons(LESSONS);

    // Act
    const current = getCurrentLesson(progress);

    // Assert
    expect(current).toBe(LAST_LESSON);
  });
});

// --- Purity ---

describe('purity', () => {
  test('functions do not mutate frozen inputs', () => {
    // Arrange
    const frozenEntries = Object.fromEntries(
      LESSON_1.chars.map((char) => [
        char,
        Object.freeze(makeProgress(char, { correctCount: 1 })),
      ]),
    );
    const progress = Object.freeze(frozenEntries) as Readonly<
      Record<string, JamoProgress>
    >;
    const progressSnapshot = JSON.parse(JSON.stringify(progress));

    // Act
    isLessonComplete(LESSON_1, progress);
    getUnlockedLessonIds(progress);
    getUnlockedChars(progress);
    getLessonForChar(LESSON_1.chars[0] as string);
    getCurrentLesson(progress);

    // Assert
    expect(progress).toEqual(progressSnapshot);
  });
});
