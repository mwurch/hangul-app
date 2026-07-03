import { generateQuizQuestions, QUIZ_LENGTH } from '../quizGenerator';
import { ALL_JAMO, CONSONANTS } from '../../data/jamo';
import type { Jamo } from '../../data/jamo';
import type { QuizQuestion } from '../../store/quiz.store';

// --- Test helpers ---

const LCG_MULTIPLIER = 1664525;
const LCG_INCREMENT = 1013904223;
const LCG_MODULUS = 2 ** 32;

/** Deterministic pseudo-random sequence for reproducible tests. */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
    return state / LCG_MODULUS;
  };
}

function makeJamo(char: string, romanization: string): Jamo {
  return {
    char,
    type: 'consonant',
    romanization,
    koreanName: `name-${char}`,
    audioFile: `${char}.mp3`,
    exampleWord: {
      korean: char,
      english: `word-${char}`,
      audioFile: `${char}-word.mp3`,
    },
  };
}

function deepFreezePool(pool: readonly Jamo[]): readonly Jamo[] {
  pool.forEach((jamo) => {
    Object.freeze(jamo.exampleWord);
    Object.freeze(jamo);
  });
  return Object.freeze([...pool]);
}

describe('QUIZ_LENGTH', () => {
  it('is 20', () => {
    expect(QUIZ_LENGTH).toBe(20);
  });
});

describe('generateQuizQuestions', () => {
  describe('question count', () => {
    it('returns exactly the requested number of questions', () => {
      // Arrange
      const random = createSeededRandom(1);

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, QUIZ_LENGTH, random);

      // Assert
      expect(questions).toHaveLength(QUIZ_LENGTH);
    });

    it('returns a single question when count is 1', () => {
      // Arrange
      const random = createSeededRandom(2);

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, 1, random);

      // Assert
      expect(questions).toHaveLength(1);
    });

    it('supports counts larger than the pool size', () => {
      // Arrange
      const random = createSeededRandom(3);
      const largeCount = ALL_JAMO.length * 2 + 5;

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, largeCount, random);

      // Assert
      expect(questions).toHaveLength(largeCount);
    });
  });

  describe('options', () => {
    it('gives every question exactly 4 distinct options', () => {
      // Arrange
      const random = createSeededRandom(4);

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, QUIZ_LENGTH, random);

      // Assert
      questions.forEach((question) => {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
      });
    });

    it('always includes the correct answer among the options', () => {
      // Arrange
      const random = createSeededRandom(5);

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, QUIZ_LENGTH, random);

      // Assert
      questions.forEach((question) => {
        expect(question.options).toContain(question.correctAnswer);
      });
    });

    it('draws charToRoman distractors from pool romanizations and romanToChar distractors from pool glyphs', () => {
      // Arrange
      const random = createSeededRandom(6);
      const romanizations = new Set(ALL_JAMO.map((jamo) => jamo.romanization));
      const glyphs = new Set(ALL_JAMO.map((jamo) => jamo.char));

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, QUIZ_LENGTH, random);

      // Assert
      questions.forEach((question) => {
        const validValues =
          question.type === 'charToRoman' ? romanizations : glyphs;
        question.options.forEach((option) => {
          expect(validValues.has(option)).toBe(true);
        });
      });
    });

    it('dedupes options by string value when romanizations collide across jamo', () => {
      // Arrange — two jamo share the romanization 'g/k'; only 4 distinct
      // romanization values exist, so identity-based selection would collide.
      const collidingPool: readonly Jamo[] = [
        makeJamo('ㄱ', 'g/k'),
        makeJamo('ㅋ', 'g/k'),
        makeJamo('ㄴ', 'n'),
        makeJamo('ㅁ', 'm'),
        makeJamo('ㅅ', 's'),
      ];
      const random = createSeededRandom(7);

      // Act
      const questions = generateQuizQuestions(collidingPool, 30, random);

      // Assert
      questions.forEach((question) => {
        expect(new Set(question.options).size).toBe(4);
      });
    });

    it('places the correct answer at every position over many questions', () => {
      // Arrange
      const random = createSeededRandom(8);
      const manyQuestions = 60;

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, manyQuestions, random);
      const positions = new Set(
        questions.map((question) =>
          question.options.indexOf(question.correctAnswer),
        ),
      );

      // Assert
      expect(positions).toEqual(new Set([0, 1, 2, 3]));
    });
  });

  describe('question types', () => {
    it('produces both charToRoman and romanToChar questions across a quiz', () => {
      // Arrange
      const random = createSeededRandom(9);

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, QUIZ_LENGTH, random);
      const types = new Set(questions.map((question) => question.type));

      // Assert
      expect(types).toEqual(new Set(['charToRoman', 'romanToChar']));
    });

    it('sets char to the glyph and correctAnswer to the matching value for each type', () => {
      // Arrange
      const random = createSeededRandom(10);
      const jamoByChar = new Map(ALL_JAMO.map((jamo) => [jamo.char, jamo]));

      // Act
      const questions = generateQuizQuestions(ALL_JAMO, QUIZ_LENGTH, random);

      // Assert
      questions.forEach((question) => {
        const jamo = jamoByChar.get(question.char);
        expect(jamo).toBeDefined();
        if (jamo === undefined) {
          return;
        }
        const expectedAnswer =
          question.type === 'charToRoman' ? jamo.romanization : jamo.char;
        expect(question.correctAnswer).toBe(expectedAnswer);
      });
    });
  });

  describe('jamo sequencing', () => {
    it('does not repeat a jamo until the pool is exhausted', () => {
      // Arrange
      const random = createSeededRandom(11);

      // Act — count equals pool size, so every jamo must appear exactly once
      const questions = generateQuizQuestions(
        ALL_JAMO,
        ALL_JAMO.length,
        random,
      );
      const chars = questions.map((question) => question.char);

      // Assert
      expect(new Set(chars).size).toBe(ALL_JAMO.length);
    });

    it('never shows the same jamo twice in a row when count exceeds pool size', () => {
      // Arrange
      const smallPool = CONSONANTS.slice(0, 4);
      const random = createSeededRandom(12);
      const longCount = 50;

      // Act
      const questions = generateQuizQuestions(smallPool, longCount, random);

      // Assert
      questions.slice(1).forEach((question: QuizQuestion, index: number) => {
        expect(question.char).not.toBe(questions[index]?.char);
      });
    });
  });

  describe('input validation', () => {
    it('throws a clear error when count is less than 1', () => {
      // Arrange & Act & Assert
      expect(() => generateQuizQuestions(ALL_JAMO, 0)).toThrow(
        /count must be at least 1/,
      );
      expect(() => generateQuizQuestions(ALL_JAMO, -5)).toThrow(
        /count must be at least 1/,
      );
    });

    it('throws when the pool is empty', () => {
      // Arrange & Act & Assert
      expect(() => generateQuizQuestions([], QUIZ_LENGTH)).toThrow(
        /at least 4 distinct/,
      );
    });

    it('throws when the pool has fewer than 4 distinct romanization values', () => {
      // Arrange — 4 glyphs but only 3 distinct romanizations
      const thinPool: readonly Jamo[] = [
        makeJamo('ㄱ', 'g/k'),
        makeJamo('ㅋ', 'g/k'),
        makeJamo('ㄴ', 'n'),
        makeJamo('ㅁ', 'm'),
      ];

      // Act & Assert
      expect(() => generateQuizQuestions(thinPool, QUIZ_LENGTH)).toThrow(
        /at least 4 distinct/,
      );
    });

    it('throws when the pool has fewer than 4 jamo', () => {
      // Arrange
      const tinyPool = CONSONANTS.slice(0, 3);

      // Act & Assert
      expect(() => generateQuizQuestions(tinyPool, QUIZ_LENGTH)).toThrow(
        /at least 4 distinct/,
      );
    });
  });

  describe('purity', () => {
    it('does not mutate the input pool (frozen pool does not throw)', () => {
      // Arrange
      const frozenPool = deepFreezePool(
        CONSONANTS.map((jamo) => ({
          ...jamo,
          exampleWord: { ...jamo.exampleWord },
        })),
      );
      const snapshot = JSON.stringify(frozenPool);
      const random = createSeededRandom(13);

      // Act
      generateQuizQuestions(frozenPool, QUIZ_LENGTH, random);

      // Assert
      expect(JSON.stringify(frozenPool)).toBe(snapshot);
    });
  });

  describe('determinism', () => {
    it('produces identical output for the same injected random sequence', () => {
      // Arrange
      const seed = 14;

      // Act
      const first = generateQuizQuestions(
        ALL_JAMO,
        QUIZ_LENGTH,
        createSeededRandom(seed),
      );
      const second = generateQuizQuestions(
        ALL_JAMO,
        QUIZ_LENGTH,
        createSeededRandom(seed),
      );

      // Assert
      expect(second).toEqual(first);
    });

    it('produces different output for different random sequences', () => {
      // Arrange & Act
      const first = generateQuizQuestions(
        ALL_JAMO,
        QUIZ_LENGTH,
        createSeededRandom(15),
      );
      const second = generateQuizQuestions(
        ALL_JAMO,
        QUIZ_LENGTH,
        createSeededRandom(16),
      );

      // Assert
      expect(second).not.toEqual(first);
    });
  });
});
