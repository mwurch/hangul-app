import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// --- Types ---

export interface SettingsState {
  readonly hasCompletedOnboarding: boolean;
}

export interface SettingsActions {
  readonly completeOnboarding: () => void;
  readonly resetOnboarding: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

// --- Constants ---

const STORAGE_KEY = 'hangul-settings';

// --- Initial state ---

const initialState: SettingsState = {
  hasCompletedOnboarding: false,
};

// --- Store ---

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,

      completeOnboarding: (): void => {
        set({ hasCompletedOnboarding: true });
      },

      resetOnboarding: (): void => {
        set({ ...initialState });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
