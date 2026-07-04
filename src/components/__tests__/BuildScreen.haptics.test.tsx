jest.mock('react-native-safe-area-context', () =>
  // The library's jest mock uses a default export; unwrap it so named
  // imports like useSafeAreaInsets resolve.
  require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('../../utils/haptics', () => ({
  hapticCompose: jest.fn(),
  hapticCorrect: jest.fn(),
  hapticWrong: jest.fn(),
  hapticTap: jest.fn(),
}));

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import BuildScreen from '../../../app/(tabs)/build';
import { hapticCompose } from '../../utils/haptics';

const hapticComposeMock = hapticCompose as jest.Mock;

describe('BuildScreen compose haptic', () => {
  beforeEach(() => {
    hapticComposeMock.mockClear();
  });

  test('does not fire on initial mount', () => {
    // Arrange & Act
    render(<BuildScreen />);

    // Assert
    expect(hapticComposeMock).not.toHaveBeenCalled();
  });

  test('fires exactly once when initial and vowel compose a syllable', () => {
    // Arrange
    const { getByLabelText } = render(<BuildScreen />);

    // Act — initial consonant alone must not compose
    fireEvent.press(getByLabelText('ㄱ'));

    // Assert
    expect(hapticComposeMock).not.toHaveBeenCalled();

    // Act — vowel completes the syllable (가)
    fireEvent.press(getByLabelText('ㅏ'));

    // Assert
    expect(hapticComposeMock).toHaveBeenCalledTimes(1);
  });

  test('does not fire when the builder is reset back to empty', () => {
    // Arrange — compose 가 first (one haptic)
    const { getByLabelText } = render(<BuildScreen />);
    fireEvent.press(getByLabelText('ㄱ'));
    fireEvent.press(getByLabelText('ㅏ'));

    // Act
    fireEvent.press(getByLabelText('Reset syllable builder'));

    // Assert — clearing must not add a haptic
    expect(hapticComposeMock).toHaveBeenCalledTimes(1);
  });

  test('fires again when the composition changes to a new syllable', () => {
    // Arrange — compose 가 (first haptic)
    const { getByLabelText } = render(<BuildScreen />);
    fireEvent.press(getByLabelText('ㄱ'));
    fireEvent.press(getByLabelText('ㅏ'));

    // Act — adding a final consonant recomposes to 간
    fireEvent.press(getByLabelText('ㄴ'));

    // Assert
    expect(hapticComposeMock).toHaveBeenCalledTimes(2);
  });
});
