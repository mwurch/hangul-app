/**
 * Lesson curriculum for the lesson-progression feature.
 *
 * The eight lessons exactly partition ALL_JAMO (40 characters, no overlaps).
 * Each lesson has at least 4 characters with 4 distinct romanizations so the
 * quiz generator's 4-option validation holds even when only lesson 1 is
 * unlocked. Verified by src/data/__tests__/lessons.test.ts.
 */

export interface Lesson {
  readonly id: number;
  readonly title: string;
  readonly koreanTitle: string;
  readonly chars: readonly string[];
}

export const LESSONS: readonly Lesson[] = [
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
] as const;
