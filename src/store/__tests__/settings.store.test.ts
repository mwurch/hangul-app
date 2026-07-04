jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useSettingsStore } from '../settings.store';

describe('settings store onboarding flag', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetOnboarding();
  });

  test('starts with hasCompletedOnboarding set to false', () => {
    // Arrange & Act
    const { hasCompletedOnboarding } = useSettingsStore.getState();

    // Assert
    expect(hasCompletedOnboarding).toBe(false);
  });

  test('completeOnboarding sets hasCompletedOnboarding to true', () => {
    // Arrange
    const { completeOnboarding } = useSettingsStore.getState();

    // Act
    completeOnboarding();

    // Assert
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
  });

  test('resetOnboarding sets hasCompletedOnboarding back to false', () => {
    // Arrange
    const { completeOnboarding, resetOnboarding } = useSettingsStore.getState();
    completeOnboarding();

    // Act
    resetOnboarding();

    // Assert
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false);
  });
});
