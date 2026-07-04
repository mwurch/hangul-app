import * as Haptics from 'expo-haptics';
import {
  hapticCompose,
  hapticCorrect,
  hapticTap,
  hapticWrong,
} from '../haptics';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

const mockNotificationAsync = Haptics.notificationAsync as jest.Mock;
const mockImpactAsync = Haptics.impactAsync as jest.Mock;

/** Lets any pending promise rejections surface before the test ends. */
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('hapticCorrect', () => {
  test('triggers a Success notification haptic', () => {
    // Act
    hapticCorrect();

    // Assert
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockNotificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });
});

describe('hapticWrong', () => {
  test('triggers an Error notification haptic', () => {
    // Act
    hapticWrong();

    // Assert
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockNotificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Error,
    );
  });
});

describe('hapticTap', () => {
  test('triggers a Light impact haptic', () => {
    // Act
    hapticTap();

    // Assert
    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    expect(mockImpactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    );
  });
});

describe('hapticCompose', () => {
  test('triggers a Medium impact haptic', () => {
    // Act
    hapticCompose();

    // Assert
    expect(mockImpactAsync).toHaveBeenCalledTimes(1);
    expect(mockImpactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium,
    );
  });
});

describe('failure handling', () => {
  test('does not throw or leave an unhandled rejection when notificationAsync rejects', async () => {
    // Arrange
    mockNotificationAsync.mockRejectedValueOnce(new Error('no haptic engine'));
    mockNotificationAsync.mockRejectedValueOnce(new Error('no haptic engine'));

    // Act & Assert
    expect(() => hapticCorrect()).not.toThrow();
    expect(() => hapticWrong()).not.toThrow();
    await flushMicrotasks();
  });

  test('does not throw or leave an unhandled rejection when impactAsync rejects', async () => {
    // Arrange
    mockImpactAsync.mockRejectedValueOnce(new Error('no haptic engine'));
    mockImpactAsync.mockRejectedValueOnce(new Error('no haptic engine'));

    // Act & Assert
    expect(() => hapticTap()).not.toThrow();
    expect(() => hapticCompose()).not.toThrow();
    await flushMicrotasks();
  });
});
