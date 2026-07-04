/**
 * Lesson curriculum for the lesson-progression feature.
 *
 * The five lessons exactly partition ALL_JAMO (24 characters, no overlaps).
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
    chars: ['ㅂ', 'ㅅ', 'ㅇ', 'ㅐ', 'ㅔ'],
  },
  {
    id: 4,
    title: 'Aspirated',
    koreanTitle: '숨소리',
    chars: ['ㅈ', 'ㅊ', 'ㅎ', 'ㅕ', 'ㅛ'],
  },
  {
    id: 5,
    title: 'Final',
    koreanTitle: '마지막',
    chars: ['ㅋ', 'ㅌ', 'ㅍ', 'ㅟ'],
  },
] as const;
