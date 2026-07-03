import {
  LEARNED_THRESHOLD,
  countLearned,
  getReviewQueue,
} from '../progressStats';
import type { Jamo } from '../../data/jamo';
import type { JamoProgress } from '../../store/progress.store';

// --- Test helpers ---

const NOW = 1_750_000_000_000;
const ONE_DAY_MS = 86_400_000;

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

function makeJamo(char: string): Jamo {
  return {
    char,
    type: 'consonant',
    romanization: `r-${char}`,
    koreanName: `name-${char}`,
    audioFile: `${char}.mp3`,
    exampleWord: {
      korean: char,
      english: `word-${char}`,
      audioFile: `${char}-word.mp3`,
    },
  };
}

// --- LEARNED_THRESHOLD ---

describe('LEARNED_THRESHOLD', () => {
  test('is 3 correct answers', () => {
    expect(LEARNED_THRESHOLD).toBe(3);
  });
});

// --- countLearned ---

describe('countLearned', () => {
  test('returns 0 for empty progress', () => {
    // Arrange
    const progress: Record<string, JamoProgress> = {};

    // Act
    const learned = countLearned(progress, ['ㄱ', 'ㄴ', 'ㄷ']);

    // Assert
    expect(learned).toBe(0);
  });

  test('returns 0 for empty chars list', () => {
    // Arrange
    const progress = { ㄱ: makeProgress('ㄱ', { correctCount: 5 }) };

    // Act
    const learned = countLearned(progress, []);

    // Assert
    expect(learned).toBe(0);
  });

  test('excludes a jamo with correctCount below the threshold (2)', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { correctCount: LEARNED_THRESHOLD - 1 }),
    };

    // Act
    const learned = countLearned(progress, ['ㄱ']);

    // Assert
    expect(learned).toBe(0);
  });

  test('includes a jamo with correctCount exactly at the threshold (3)', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { correctCount: LEARNED_THRESHOLD }),
    };

    // Act
    const learned = countLearned(progress, ['ㄱ']);

    // Assert
    expect(learned).toBe(1);
  });

  test('counts only chars in the given list, ignoring other progress entries', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { correctCount: 4 }),
      ㄴ: makeProgress('ㄴ', { correctCount: 10 }),
      ㅏ: makeProgress('ㅏ', { correctCount: 7 }),
    };

    // Act
    const learned = countLearned(progress, ['ㄱ', 'ㄴ', 'ㄷ']);

    // Assert
    expect(learned).toBe(2);
  });

  test('ignores chars with no progress entry', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { correctCount: 3 }),
    };

    // Act
    const learned = countLearned(progress, ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ']);

    // Assert
    expect(learned).toBe(1);
  });

  test('does not mutate its inputs', () => {
    // Arrange
    const entry = makeProgress('ㄱ', { correctCount: 3 });
    const progress = Object.freeze({ ㄱ: Object.freeze(entry) });
    const chars = Object.freeze(['ㄱ', 'ㄴ']) as readonly string[];
    const progressSnapshot = JSON.parse(JSON.stringify(progress));
    const charsSnapshot = [...chars];

    // Act
    countLearned(progress, chars);

    // Assert
    expect(progress).toEqual(progressSnapshot);
    expect(chars).toEqual(charsSnapshot);
  });
});

// --- getReviewQueue ---

describe('getReviewQueue', () => {
  test('returns empty array for empty progress', () => {
    // Arrange
    const progress: Record<string, JamoProgress> = {};
    const allJamo = [makeJamo('ㄱ'), makeJamo('ㄴ')];

    // Act
    const queue = getReviewQueue(progress, allJamo, NOW);

    // Assert
    expect(queue).toEqual([]);
  });

  test('excludes jamo whose nextReview is in the future', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { nextReview: NOW + ONE_DAY_MS }),
    };
    const allJamo = [makeJamo('ㄱ')];

    // Act
    const queue = getReviewQueue(progress, allJamo, NOW);

    // Assert
    expect(queue).toEqual([]);
  });

  test('includes jamo whose nextReview is exactly now', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { nextReview: NOW }),
    };
    const allJamo = [makeJamo('ㄱ')];

    // Act
    const queue = getReviewQueue(progress, allJamo, NOW);

    // Assert
    expect(queue.map((jamo) => jamo.char)).toEqual(['ㄱ']);
  });

  test('excludes jamo without a progress entry', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { nextReview: NOW - ONE_DAY_MS }),
    };
    const allJamo = [makeJamo('ㄱ'), makeJamo('ㄴ')];

    // Act
    const queue = getReviewQueue(progress, allJamo, NOW);

    // Assert
    expect(queue.map((jamo) => jamo.char)).toEqual(['ㄱ']);
  });

  test('sorts due jamo by nextReview ascending (most overdue first)', () => {
    // Arrange
    const progress = {
      ㄱ: makeProgress('ㄱ', { nextReview: NOW - ONE_DAY_MS }),
      ㄴ: makeProgress('ㄴ', { nextReview: NOW - 3 * ONE_DAY_MS }),
      ㄷ: makeProgress('ㄷ', { nextReview: NOW - 2 * ONE_DAY_MS }),
    };
    const allJamo = [makeJamo('ㄱ'), makeJamo('ㄴ'), makeJamo('ㄷ')];

    // Act
    const queue = getReviewQueue(progress, allJamo, NOW);

    // Assert
    expect(queue.map((jamo) => jamo.char)).toEqual(['ㄴ', 'ㄷ', 'ㄱ']);
  });

  test('returns full Jamo objects from the provided list', () => {
    // Arrange
    const jamo = makeJamo('ㄱ');
    const progress = {
      ㄱ: makeProgress('ㄱ', { nextReview: NOW - ONE_DAY_MS }),
    };

    // Act
    const queue = getReviewQueue(progress, [jamo], NOW);

    // Assert
    expect(queue[0]).toBe(jamo);
  });

  test('does not mutate its inputs', () => {
    // Arrange
    const progress = Object.freeze({
      ㄱ: Object.freeze(makeProgress('ㄱ', { nextReview: NOW - ONE_DAY_MS })),
      ㄴ: Object.freeze(makeProgress('ㄴ', { nextReview: NOW - 2 * ONE_DAY_MS })),
    });
    const allJamo = Object.freeze([makeJamo('ㄱ'), makeJamo('ㄴ')]) as readonly Jamo[];
    const jamoOrderSnapshot = allJamo.map((jamo) => jamo.char);
    const progressSnapshot = JSON.parse(JSON.stringify(progress));

    // Act
    getReviewQueue(progress, allJamo, NOW);

    // Assert
    expect(progress).toEqual(progressSnapshot);
    expect(allJamo.map((jamo) => jamo.char)).toEqual(jamoOrderSnapshot);
  });
});
