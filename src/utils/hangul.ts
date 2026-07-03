const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const INITIAL_COUNT = 19;
const MEDIAL_COUNT = 21;
const FINAL_COUNT = 28;

export const INITIAL_CONSONANTS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

export const MEDIAL_VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ',
  'ㅣ',
] as const;

export const FINAL_CONSONANTS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

function getInitialIndex(char: string): number {
  const index = INITIAL_CONSONANTS.indexOf(
    char as (typeof INITIAL_CONSONANTS)[number],
  );
  if (index === -1) {
    throw new Error(
      `Invalid initial consonant: "${char}". Must be one of: ${INITIAL_CONSONANTS.join(', ')}`,
    );
  }
  return index;
}

function getMedialIndex(char: string): number {
  const index = MEDIAL_VOWELS.indexOf(
    char as (typeof MEDIAL_VOWELS)[number],
  );
  if (index === -1) {
    throw new Error(
      `Invalid medial vowel: "${char}". Must be one of: ${MEDIAL_VOWELS.join(', ')}`,
    );
  }
  return index;
}

function getFinalIndex(char: string): number {
  const index = FINAL_CONSONANTS.indexOf(
    char as (typeof FINAL_CONSONANTS)[number],
  );
  if (index === -1) {
    throw new Error(
      `Invalid final consonant: "${char}". Must be one of: ${FINAL_CONSONANTS.filter(Boolean).join(', ')}`,
    );
  }
  return index;
}

export function isHangulSyllable(char: string): boolean {
  if (char.length !== 1) {
    return false;
  }
  const code = char.charCodeAt(0);
  return code >= HANGUL_BASE && code <= HANGUL_END;
}

export function composeSyllable(
  initial: string,
  vowel: string,
  final?: string,
): string {
  const initialIndex = getInitialIndex(initial);
  const vowelIndex = getMedialIndex(vowel);
  const finalIndex =
    final === undefined || final === '' ? 0 : getFinalIndex(final);

  const codepoint =
    HANGUL_BASE + (initialIndex * MEDIAL_COUNT + vowelIndex) * FINAL_COUNT + finalIndex;

  return String.fromCharCode(codepoint);
}

export interface DecomposedSyllable {
  readonly initial: string;
  readonly vowel: string;
  readonly final: string;
}

export function decomposeSyllable(syllable: string): DecomposedSyllable {
  if (!isHangulSyllable(syllable)) {
    throw new Error(
      `Invalid Hangul syllable: "${syllable}". Character must be a composed Hangul syllable (U+AC00 to U+D7A3).`,
    );
  }

  const code = syllable.charCodeAt(0) - HANGUL_BASE;

  const initialIndex = Math.floor(code / (MEDIAL_COUNT * FINAL_COUNT));
  const medialIndex = Math.floor(
    (code % (MEDIAL_COUNT * FINAL_COUNT)) / FINAL_COUNT,
  );
  const finalIndex = code % FINAL_COUNT;

  return {
    initial: INITIAL_CONSONANTS[initialIndex],
    vowel: MEDIAL_VOWELS[medialIndex],
    final: FINAL_CONSONANTS[finalIndex],
  };
}
