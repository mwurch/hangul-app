import {
  composeSyllable,
  decomposeSyllable,
  isHangulSyllable,
  INITIAL_CONSONANTS,
  MEDIAL_VOWELS,
  FINAL_CONSONANTS,
} from '../hangul';

describe('hangul syllable composition', () => {
  describe('composeSyllable', () => {
    it('produces 한 (U+D55C) from ㅎ + ㅏ + ㄴ — canonical red-line test', () => {
      // Arrange
      const initial = 'ㅎ';
      const vowel = 'ㅏ';
      const final = 'ㄴ';

      // Act
      const result = composeSyllable(initial, vowel, final);

      // Assert
      expect(result).toBe('한');
      expect(result.charCodeAt(0)).toBe(0xd55c);
    });

    it('composes 가 without a final consonant', () => {
      // Arrange & Act
      const result = composeSyllable('ㄱ', 'ㅏ');

      // Assert
      expect(result).toBe('가');
    });

    it('composes 날 with ㄴ + ㅏ + ㄹ', () => {
      // Arrange & Act
      const result = composeSyllable('ㄴ', 'ㅏ', 'ㄹ');

      // Assert
      expect(result).toBe('날');
    });

    it('composes 아 with ㅇ + ㅏ (silent initial)', () => {
      // Arrange & Act
      const result = composeSyllable('ㅇ', 'ㅏ');

      // Assert
      expect(result).toBe('아');
    });

    it('composes 글 with ㄱ + ㅡ + ㄹ', () => {
      // Arrange & Act
      const result = composeSyllable('ㄱ', 'ㅡ', 'ㄹ');

      // Assert
      expect(result).toBe('글');
    });

    it('treats empty string final the same as no final', () => {
      // Arrange & Act
      const withEmpty = composeSyllable('ㄱ', 'ㅏ', '');
      const withUndefined = composeSyllable('ㄱ', 'ㅏ');

      // Assert
      expect(withEmpty).toBe(withUndefined);
      expect(withEmpty).toBe('가');
    });
  });

  describe('composeSyllable error cases', () => {
    it('throws for an invalid initial consonant', () => {
      // Arrange & Act & Assert
      expect(() => composeSyllable('a', 'ㅏ')).toThrow(
        'Invalid initial consonant: "a"',
      );
    });

    it('throws for an invalid medial vowel', () => {
      // Arrange & Act & Assert
      expect(() => composeSyllable('ㄱ', 'x')).toThrow(
        'Invalid medial vowel: "x"',
      );
    });

    it('throws for an invalid final consonant', () => {
      // Arrange & Act & Assert
      expect(() => composeSyllable('ㄱ', 'ㅏ', 'z')).toThrow(
        'Invalid final consonant: "z"',
      );
    });
  });

  describe('decomposeSyllable', () => {
    it('decomposes 한 into ㅎ + ㅏ + ㄴ', () => {
      // Arrange & Act
      const result = decomposeSyllable('한');

      // Assert
      expect(result).toEqual({
        initial: 'ㅎ',
        vowel: 'ㅏ',
        final: 'ㄴ',
      });
    });

    it('decomposes 가 into ㄱ + ㅏ with empty final', () => {
      // Arrange & Act
      const result = decomposeSyllable('가');

      // Assert
      expect(result).toEqual({
        initial: 'ㄱ',
        vowel: 'ㅏ',
        final: '',
      });
    });

    it('decomposes 글 into ㄱ + ㅡ + ㄹ', () => {
      // Arrange & Act
      const result = decomposeSyllable('글');

      // Assert
      expect(result).toEqual({
        initial: 'ㄱ',
        vowel: 'ㅡ',
        final: 'ㄹ',
      });
    });
  });

  describe('decomposeSyllable error cases', () => {
    it('throws for a Latin character', () => {
      // Arrange & Act & Assert
      expect(() => decomposeSyllable('A')).toThrow(
        'Invalid Hangul syllable: "A"',
      );
    });

    it('throws for an individual jamo character', () => {
      // Arrange & Act & Assert
      expect(() => decomposeSyllable('ㅎ')).toThrow(
        'Invalid Hangul syllable: "ㅎ"',
      );
    });

    it('throws for a multi-character string', () => {
      // Arrange & Act & Assert
      expect(() => decomposeSyllable('한글')).toThrow(
        'Invalid Hangul syllable',
      );
    });
  });

  describe('roundtrip compose/decompose', () => {
    it('roundtrips 한 correctly', () => {
      // Arrange
      const original = { initial: 'ㅎ', vowel: 'ㅏ', final: 'ㄴ' } as const;

      // Act
      const composed = composeSyllable(
        original.initial,
        original.vowel,
        original.final,
      );
      const decomposed = decomposeSyllable(composed);

      // Assert
      expect(decomposed).toEqual(original);
    });

    it('roundtrips 가 correctly (no final)', () => {
      // Arrange
      const initial = 'ㄱ';
      const vowel = 'ㅏ';

      // Act
      const composed = composeSyllable(initial, vowel);
      const decomposed = decomposeSyllable(composed);

      // Assert
      expect(decomposed.initial).toBe(initial);
      expect(decomposed.vowel).toBe(vowel);
      expect(decomposed.final).toBe('');
    });

    it('roundtrips every basic initial + first vowel combination', () => {
      // Arrange
      const vowel = 'ㅏ';

      for (const initial of INITIAL_CONSONANTS) {
        // Act
        const composed = composeSyllable(initial, vowel);
        const decomposed = decomposeSyllable(composed);

        // Assert
        expect(decomposed.initial).toBe(initial);
        expect(decomposed.vowel).toBe(vowel);
      }
    });
  });

  describe('isHangulSyllable', () => {
    it('returns true for 한', () => {
      expect(isHangulSyllable('한')).toBe(true);
    });

    it('returns true for 가 (first syllable)', () => {
      expect(isHangulSyllable('가')).toBe(true);
    });

    it('returns true for 힣 (last syllable)', () => {
      expect(isHangulSyllable('힣')).toBe(true);
    });

    it('returns false for Latin character A', () => {
      expect(isHangulSyllable('A')).toBe(false);
    });

    it('returns false for individual jamo ㅎ', () => {
      expect(isHangulSyllable('ㅎ')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isHangulSyllable('')).toBe(false);
    });

    it('returns false for multi-character string', () => {
      expect(isHangulSyllable('한글')).toBe(false);
    });
  });

  describe('constant arrays', () => {
    it('has exactly 19 initial consonants', () => {
      expect(INITIAL_CONSONANTS).toHaveLength(19);
    });

    it('has exactly 21 medial vowels', () => {
      expect(MEDIAL_VOWELS).toHaveLength(21);
    });

    it('has exactly 28 final consonants (including empty)', () => {
      expect(FINAL_CONSONANTS).toHaveLength(28);
    });

    it('starts final consonants with an empty string', () => {
      expect(FINAL_CONSONANTS[0]).toBe('');
    });
  });
});
