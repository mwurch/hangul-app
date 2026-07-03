import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// --- Types ---

export interface JamoProgress {
  readonly char: string;
  readonly seenCount: number;
  readonly correctCount: number;
  readonly lastSeen: number;
  readonly nextReview: number;
  readonly interval: number;
  readonly easeFactor: number;
}

export interface ProgressState {
  readonly progress: Readonly<Record<string, JamoProgress>>;
  readonly streak: number;
  readonly lastStudyDate: number;
}

export interface ProgressActions {
  readonly getProgress: (char: string) => JamoProgress | undefined;
  readonly updateProgress: (char: string, correct: boolean) => void;
  readonly resetProgress: () => void;
  readonly loadProgress: () => Promise<void>;
}

type ProgressStore = ProgressState & ProgressActions;

// --- Constants ---

const STORAGE_KEY = 'hangul-progress';
const DEFAULT_EASE_FACTOR = 2.5;
const DEFAULT_INTERVAL = 0;
const MIN_EASE_FACTOR = 1.3;
const MS_PER_DAY = 86_400_000;
const INITIAL_INTERVAL = 1;
const SECOND_INTERVAL = 6;
const QUALITY_CORRECT = 5;

// --- SM-2 helpers ---

const calculateEaseFactor = (
  currentEaseFactor: number,
  quality: number,
): number => {
  const newFactor =
    currentEaseFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(MIN_EASE_FACTOR, newFactor);
};

const calculateNextInterval = (
  currentInterval: number,
  easeFactor: number,
): number => {
  if (currentInterval === 0) {
    return INITIAL_INTERVAL;
  }
  if (currentInterval === INITIAL_INTERVAL) {
    return SECOND_INTERVAL;
  }
  return Math.round(currentInterval * easeFactor);
};

// --- Streak helpers ---

const isConsecutiveDay = (lastDate: number, currentDate: number): boolean => {
  const lastDay = Math.floor(lastDate / MS_PER_DAY);
  const currentDay = Math.floor(currentDate / MS_PER_DAY);
  return currentDay - lastDay === 1;
};

const isSameDay = (dateA: number, dateB: number): boolean => {
  const dayA = Math.floor(dateA / MS_PER_DAY);
  const dayB = Math.floor(dateB / MS_PER_DAY);
  return dayA === dayB;
};

const computeStreak = (
  currentStreak: number,
  lastStudyDate: number,
  now: number,
): number => {
  if (lastStudyDate === 0) {
    return 1;
  }
  if (isSameDay(lastStudyDate, now)) {
    return currentStreak;
  }
  if (isConsecutiveDay(lastStudyDate, now)) {
    return currentStreak + 1;
  }
  return 1;
};

// --- Initial state ---

const initialState: ProgressState = {
  progress: {},
  streak: 0,
  lastStudyDate: 0,
};

// --- Store ---

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      getProgress: (char: string): JamoProgress | undefined => {
        return get().progress[char];
      },

      updateProgress: (char: string, correct: boolean): void => {
        const state = get();
        const now = Date.now();
        const existing = state.progress[char];

        const currentProgress: JamoProgress = existing ?? {
          char,
          seenCount: 0,
          correctCount: 0,
          lastSeen: 0,
          nextReview: 0,
          interval: DEFAULT_INTERVAL,
          easeFactor: DEFAULT_EASE_FACTOR,
        };

        const quality = correct ? QUALITY_CORRECT : 1;

        const newEaseFactor = correct
          ? calculateEaseFactor(currentProgress.easeFactor, quality)
          : currentProgress.easeFactor;

        const newInterval = correct
          ? calculateNextInterval(currentProgress.interval, newEaseFactor)
          : INITIAL_INTERVAL;

        const updatedJamo: JamoProgress = {
          char: currentProgress.char,
          seenCount: currentProgress.seenCount + 1,
          correctCount: correct
            ? currentProgress.correctCount + 1
            : currentProgress.correctCount,
          lastSeen: now,
          nextReview: now + newInterval * MS_PER_DAY,
          interval: newInterval,
          easeFactor: newEaseFactor,
        };

        const newStreak = computeStreak(
          state.streak,
          state.lastStudyDate,
          now,
        );

        set({
          progress: { ...state.progress, [char]: updatedJamo },
          streak: newStreak,
          lastStudyDate: now,
        });
      },

      resetProgress: (): void => {
        set({ ...initialState });
      },

      loadProgress: async (): Promise<void> => {
        await useProgressStore.persist.rehydrate();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
