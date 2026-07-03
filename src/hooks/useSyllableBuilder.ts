import { useCallback, useMemo, useState } from 'react';
import { composeSyllable, INITIAL_CONSONANTS, MEDIAL_VOWELS, FINAL_CONSONANTS } from '../utils/hangul';
import { CONSONANTS, VOWELS } from '../data/jamo';

export type BuilderSlot = 'initial' | 'vowel' | 'final';

export interface SyllableBuilderState {
  readonly initial: string | null;
  readonly vowel: string | null;
  readonly final: string | null;
  readonly activeSlot: BuilderSlot;
  readonly composedSyllable: string | null;
}

export interface UseSyllableBuilderResult {
  readonly state: SyllableBuilderState;
  readonly setSlot: (slot: BuilderSlot, char: string) => void;
  readonly clearSlot: (slot: BuilderSlot) => void;
  readonly focusSlot: (slot: BuilderSlot) => void;
  readonly reset: () => void;
  readonly availableChars: readonly string[];
}

interface SlotValues {
  readonly initial: string | null;
  readonly vowel: string | null;
  readonly final: string | null;
}

const INITIAL_SLOT_VALUES: SlotValues = {
  initial: null,
  vowel: null,
  final: null,
};

const INITIAL_ACTIVE_SLOT: BuilderSlot = 'initial';

const VALID_INITIAL_CHARS: readonly string[] = CONSONANTS
  .map((j) => j.char)
  .filter((c) => (INITIAL_CONSONANTS as readonly string[]).includes(c));

const VALID_VOWEL_CHARS: readonly string[] = VOWELS
  .map((j) => j.char)
  .filter((c) => (MEDIAL_VOWELS as readonly string[]).includes(c));

const VALID_FINAL_CHARS: readonly string[] = (FINAL_CONSONANTS as readonly string[])
  .filter((c) => c !== '');

function computeComposedSyllable(slots: SlotValues): string | null {
  if (slots.initial === null || slots.vowel === null) {
    return null;
  }
  return composeSyllable(
    slots.initial,
    slots.vowel,
    slots.final ?? undefined,
  );
}

function getNextSlotAfterSet(slot: BuilderSlot): BuilderSlot {
  if (slot === 'initial') return 'vowel';
  if (slot === 'vowel') return 'final';
  return 'final';
}

function getAvailableCharsForSlot(slot: BuilderSlot): readonly string[] {
  if (slot === 'initial') return VALID_INITIAL_CHARS;
  if (slot === 'vowel') return VALID_VOWEL_CHARS;
  return VALID_FINAL_CHARS;
}

export function useSyllableBuilder(): UseSyllableBuilderResult {
  const [slotValues, setSlotValues] = useState<SlotValues>(INITIAL_SLOT_VALUES);
  const [activeSlot, setActiveSlot] = useState<BuilderSlot>(INITIAL_ACTIVE_SLOT);

  const composedSyllable = useMemo(
    () => computeComposedSyllable(slotValues),
    [slotValues],
  );

  const state: SyllableBuilderState = useMemo(
    () => ({
      initial: slotValues.initial,
      vowel: slotValues.vowel,
      final: slotValues.final,
      activeSlot,
      composedSyllable,
    }),
    [slotValues, activeSlot, composedSyllable],
  );

  const availableChars = useMemo(
    () => getAvailableCharsForSlot(activeSlot),
    [activeSlot],
  );

  const setSlot = useCallback((slot: BuilderSlot, char: string): void => {
    setSlotValues((prev) => ({ ...prev, [slot]: char }));
    setActiveSlot(getNextSlotAfterSet(slot));
  }, []);

  const clearSlot = useCallback((slot: BuilderSlot): void => {
    setSlotValues((prev) => ({ ...prev, [slot]: null }));
    setActiveSlot(slot);
  }, []);

  const focusSlot = useCallback((slot: BuilderSlot): void => {
    setActiveSlot(slot);
  }, []);

  const reset = useCallback((): void => {
    setSlotValues(INITIAL_SLOT_VALUES);
    setActiveSlot(INITIAL_ACTIVE_SLOT);
  }, []);

  return {
    state,
    setSlot,
    clearSlot,
    focusSlot,
    reset,
    availableChars,
  };
}
