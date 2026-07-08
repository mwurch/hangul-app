import { renderHook, act } from '@testing-library/react-native';
import { useSyllableBuilder } from '../useSyllableBuilder';
import { INITIAL_CONSONANTS, MEDIAL_VOWELS, FINAL_CONSONANTS } from '../../utils/hangul';
import { CONSONANTS, VOWELS } from '../../data/jamo';

describe('useSyllableBuilder', () => {
  describe('initial state', () => {
    it('starts with all slots null and activeSlot set to initial', () => {
      // Arrange & Act
      const { result } = renderHook(() => useSyllableBuilder());

      // Assert
      expect(result.current.state).toEqual({
        initial: null,
        vowel: null,
        final: null,
        activeSlot: 'initial',
        composedSyllable: null,
      });
    });
  });

  describe('setSlot', () => {
    it('stores value in initial slot and advances to vowel', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });

      // Assert
      expect(result.current.state.initial).toBe('ㅎ');
      expect(result.current.state.activeSlot).toBe('vowel');
    });

    it('stores value in vowel slot and advances to final', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });

      // Assert
      expect(result.current.state.vowel).toBe('ㅏ');
      expect(result.current.state.activeSlot).toBe('final');
    });

    it('stores value in final slot and stays on final', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });
      act(() => {
        result.current.setSlot('final', 'ㄴ');
      });

      // Assert
      expect(result.current.state.final).toBe('ㄴ');
      expect(result.current.state.activeSlot).toBe('final');
    });

    it('does not mutate previous state object', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      const stateBefore = result.current.state;

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });

      // Assert
      expect(result.current.state).not.toBe(stateBefore);
      expect(stateBefore.initial).toBeNull();
    });
  });

  describe('composedSyllable', () => {
    it('is null when only initial is set', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });

      // Assert
      expect(result.current.state.composedSyllable).toBeNull();
    });

    it('computes 하 when initial=ㅎ and vowel=ㅏ', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });

      // Assert
      expect(result.current.state.composedSyllable).toBe('하');
    });

    it('computes 한 when all three slots are filled — canonical test', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });
      act(() => {
        result.current.setSlot('final', 'ㄴ');
      });

      // Assert
      expect(result.current.state.composedSyllable).toBe('한');
      expect(result.current.state.composedSyllable!.charCodeAt(0)).toBe(0xd55c);
    });

    it('is null when only vowel is set without initial', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());

      // Act
      act(() => {
        result.current.focusSlot('vowel');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });

      // Assert
      expect(result.current.state.composedSyllable).toBeNull();
    });

    it('updates when a slot value changes', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });
      expect(result.current.state.composedSyllable).toBe('하');

      // Act — change initial from ㅎ to ㄱ
      act(() => {
        result.current.setSlot('initial', 'ㄱ');
      });

      // Assert
      expect(result.current.state.composedSyllable).toBe('가');
    });
  });

  describe('clearSlot', () => {
    it('clears the initial slot and focuses it', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });

      // Act
      act(() => {
        result.current.clearSlot('initial');
      });

      // Assert
      expect(result.current.state.initial).toBeNull();
      expect(result.current.state.activeSlot).toBe('initial');
    });

    it('clears the vowel slot and focuses it', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });

      // Act
      act(() => {
        result.current.clearSlot('vowel');
      });

      // Assert
      expect(result.current.state.vowel).toBeNull();
      expect(result.current.state.activeSlot).toBe('vowel');
    });

    it('clears the final slot and focuses it', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });
      act(() => {
        result.current.setSlot('final', 'ㄴ');
      });

      // Act
      act(() => {
        result.current.clearSlot('final');
      });

      // Assert
      expect(result.current.state.final).toBeNull();
      expect(result.current.state.activeSlot).toBe('final');
    });

    it('recomputes composedSyllable after clearing final', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });
      act(() => {
        result.current.setSlot('final', 'ㄴ');
      });
      expect(result.current.state.composedSyllable).toBe('한');

      // Act
      act(() => {
        result.current.clearSlot('final');
      });

      // Assert
      expect(result.current.state.composedSyllable).toBe('하');
    });

    it('sets composedSyllable to null after clearing initial', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });
      expect(result.current.state.composedSyllable).toBe('하');

      // Act
      act(() => {
        result.current.clearSlot('initial');
      });

      // Assert
      expect(result.current.state.composedSyllable).toBeNull();
    });
  });

  describe('focusSlot', () => {
    it('changes activeSlot without modifying slot values', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });

      // Act
      act(() => {
        result.current.focusSlot('initial');
      });

      // Assert
      expect(result.current.state.activeSlot).toBe('initial');
      expect(result.current.state.initial).toBe('ㅎ');
    });
  });

  describe('reset', () => {
    it('clears all slots and focuses initial', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });
      act(() => {
        result.current.setSlot('final', 'ㄴ');
      });

      // Act
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.state).toEqual({
        initial: null,
        vowel: null,
        final: null,
        activeSlot: 'initial',
        composedSyllable: null,
      });
    });
  });

  describe('availableChars', () => {
    it('returns valid initial consonants when activeSlot is initial', () => {
      // Arrange & Act
      const { result } = renderHook(() => useSyllableBuilder());
      const jamoConsonantChars = CONSONANTS.map((j) => j.char);
      const expectedChars = jamoConsonantChars.filter((c) =>
        (INITIAL_CONSONANTS as readonly string[]).includes(c),
      );

      // Assert
      expect(result.current.state.activeSlot).toBe('initial');
      expect(result.current.availableChars).toEqual(expectedChars);
      expect(result.current.availableChars.length).toBe(19);
    });

    it('returns valid vowels when activeSlot is vowel', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      const jamoVowelChars = VOWELS.map((j) => j.char);
      const expectedChars = jamoVowelChars.filter((c) =>
        (MEDIAL_VOWELS as readonly string[]).includes(c),
      );

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });

      // Assert
      expect(result.current.state.activeSlot).toBe('vowel');
      expect(result.current.availableChars).toEqual(expectedChars);
      expect(result.current.availableChars.length).toBe(21);
    });

    it('returns valid final consonants when activeSlot is final', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      const validFinals = (FINAL_CONSONANTS as readonly string[]).filter(
        (c) => c !== '',
      );

      // Act
      act(() => {
        result.current.setSlot('initial', 'ㅎ');
      });
      act(() => {
        result.current.setSlot('vowel', 'ㅏ');
      });

      // Assert
      expect(result.current.state.activeSlot).toBe('final');
      expect(result.current.availableChars).toEqual(validFinals);
      expect(result.current.availableChars.length).toBe(27);
    });

    it('updates when activeSlot changes via focusSlot', () => {
      // Arrange
      const { result } = renderHook(() => useSyllableBuilder());
      const initialChars = result.current.availableChars;

      // Act
      act(() => {
        result.current.focusSlot('vowel');
      });

      // Assert
      expect(result.current.availableChars).not.toEqual(initialChars);
    });
  });

  describe('function reference stability', () => {
    it('returns stable function references across renders', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useSyllableBuilder());
      const { setSlot, clearSlot, focusSlot, reset } = result.current;

      // Act
      rerender({});

      // Assert
      expect(result.current.setSlot).toBe(setSlot);
      expect(result.current.clearSlot).toBe(clearSlot);
      expect(result.current.focusSlot).toBe(focusSlot);
      expect(result.current.reset).toBe(reset);
    });
  });
});
