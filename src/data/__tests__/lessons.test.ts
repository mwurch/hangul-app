import { LESSONS } from '../lessons';
import type { Lesson } from '../lessons';
import { ALL_JAMO } from '../jamo';

// --- Constants ---

const EXPECTED_LESSON_COUNT = 8;
const MIN_CHARS_PER_LESSON = 4;
const MIN_DISTINCT_ROMANIZATIONS = 4;
const CONSONANT_AND_VOWEL_LESSON_IDS = [1, 2, 3, 4, 5];
const VOWEL_ONLY_LESSON_IDS = [6, 7];
const CONSONANT_ONLY_LESSON_ID = 8;

// --- Helpers ---

function romanizationFor(char: string): string {
  const jamo = ALL_JAMO.find((entry) => entry.char === char);
  if (jamo === undefined) {
    throw new Error(`Unknown jamo char in lesson data: ${char}`);
  }
  return jamo.romanization;
}

function typeFor(char: string): 'consonant' | 'vowel' {
  const jamo = ALL_JAMO.find((entry) => entry.char === char);
  if (jamo === undefined) {
    throw new Error(`Unknown jamo char in lesson data: ${char}`);
  }
  return jamo.type;
}

// --- LESSONS ---

describe('LESSONS', () => {
  test('has exactly 8 lessons', () => {
    expect(LESSONS).toHaveLength(EXPECTED_LESSON_COUNT);
  });

  test('ids are sequential 1..8', () => {
    // Arrange
    const expectedIds = [1, 2, 3, 4, 5, 6, 7, 8];

    // Act
    const ids = LESSONS.map((lesson: Lesson) => lesson.id);

    // Assert
    expect(ids).toEqual(expectedIds);
  });

  test('every lesson has a non-empty title and koreanTitle', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.title.length).toBeGreaterThan(0);
      expect(lesson.koreanTitle.length).toBeGreaterThan(0);
    });
  });

  test('lesson chars exactly partition ALL_JAMO (union equals the 40 chars)', () => {
    // Arrange
    const allJamoChars = ALL_JAMO.map((jamo) => jamo.char).sort();

    // Act
    const lessonChars = LESSONS.flatMap((lesson) => [...lesson.chars]).sort();

    // Assert
    expect(lessonChars).toEqual(allJamoChars);
  });

  test('no char appears in more than one lesson', () => {
    // Arrange
    const allLessonChars = LESSONS.flatMap((lesson) => [...lesson.chars]);

    // Act
    const uniqueChars = new Set(allLessonChars);

    // Assert
    expect(uniqueChars.size).toBe(allLessonChars.length);
  });

  test('every lesson has at least 4 chars', () => {
    LESSONS.forEach((lesson) => {
      expect(lesson.chars.length).toBeGreaterThanOrEqual(MIN_CHARS_PER_LESSON);
    });
  });

  test('every lesson has at least 4 distinct romanizations (quiz option guarantee)', () => {
    LESSONS.forEach((lesson) => {
      // Act
      const romanizations = new Set(
        lesson.chars.map((char) => romanizationFor(char)),
      );

      // Assert
      expect(romanizations.size).toBeGreaterThanOrEqual(
        MIN_DISTINCT_ROMANIZATIONS,
      );
    });
  });

  test('lessons 1-5 each contain at least one consonant and one vowel', () => {
    CONSONANT_AND_VOWEL_LESSON_IDS.forEach((lessonId) => {
      // Arrange
      const lesson = LESSONS.find((entry) => entry.id === lessonId);
      expect(lesson).toBeDefined();

      // Act
      const types = (lesson as Lesson).chars.map((char) => typeFor(char));

      // Assert
      expect(types).toContain('consonant');
      expect(types).toContain('vowel');
    });
  });

  test('lessons 6 and 7 contain only vowels', () => {
    VOWEL_ONLY_LESSON_IDS.forEach((lessonId) => {
      // Arrange
      const lesson = LESSONS.find((entry) => entry.id === lessonId);
      expect(lesson).toBeDefined();

      // Act
      const types = (lesson as Lesson).chars.map((char) => typeFor(char));

      // Assert
      types.forEach((type) => {
        expect(type).toBe('vowel');
      });
    });
  });

  test('lesson 8 contains only consonants', () => {
    // Arrange
    const lesson = LESSONS.find(
      (entry) => entry.id === CONSONANT_ONLY_LESSON_ID,
    );
    expect(lesson).toBeDefined();

    // Act
    const types = (lesson as Lesson).chars.map((char) => typeFor(char));

    // Assert
    types.forEach((type) => {
      expect(type).toBe('consonant');
    });
  });

  test('matches the exact curriculum', () => {
    // Arrange
    const expectedCurriculum = [
      {
        id: 1,
        title: 'First steps',
        koreanTitle: '첫 걸음',
        chars: ['ㄱ', 'ㄴ', 'ㅏ', 'ㅣ', 'ㅗ'],
      },
      {
        id: 2,
        title: 'Basics',
        koreanTitle: '기본',
        chars: ['ㄷ', 'ㄹ', 'ㅁ', 'ㅜ', 'ㅡ'],
      },
      {
        id: 3,
        title: 'Sounds',
        koreanTitle: '소리',
        chars: ['ㅂ', 'ㅅ', 'ㅇ', 'ㅓ', 'ㅐ'],
      },
      {
        id: 4,
        title: 'Aspirated',
        koreanTitle: '숨소리',
        chars: ['ㅈ', 'ㅊ', 'ㅎ', 'ㅔ', 'ㅕ'],
      },
      {
        id: 5,
        title: 'Strong sounds',
        koreanTitle: '센소리',
        chars: ['ㅋ', 'ㅌ', 'ㅍ', 'ㅑ', 'ㅛ'],
      },
      {
        id: 6,
        title: 'Final vowels',
        koreanTitle: '마지막 모음',
        chars: ['ㅠ', 'ㅟ', 'ㅘ', 'ㅝ', 'ㅢ'],
      },
      {
        id: 7,
        title: 'Compound vowels',
        koreanTitle: '겹모음',
        chars: ['ㅒ', 'ㅖ', 'ㅙ', 'ㅚ', 'ㅞ'],
      },
      {
        id: 8,
        title: 'Tense sounds',
        koreanTitle: '쌍자음',
        chars: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'],
      },
    ];

    // Assert
    expect(LESSONS).toEqual(expectedCurriculum);
  });
});
