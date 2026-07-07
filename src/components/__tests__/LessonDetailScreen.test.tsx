jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockUseLocalSearchParams = jest.fn();

jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    useRouter: () => ({ navigate: jest.fn(), push: jest.fn() }),
    Redirect: ({ href }: { readonly href: string }) => (
      <Text testID="redirect">{href}</Text>
    ),
    Stack: { Screen: () => null },
  };
});

// Stub that makes panel visibility observable without pulling in audio playback.
jest.mock('../JamoDetailPanel', () => {
  const { Text } = require('react-native');
  return {
    JamoDetailPanel: ({ jamo }: { readonly jamo: { readonly char: string } | null }) =>
      jamo === null ? null : <Text testID="detail-panel-open">{jamo.char}</Text>,
  };
});

// The lesson cards play audio via useAudio; native playback is irrelevant here.
const mockPlaySound = jest.fn();
jest.mock('../../hooks/useAudio', () => ({
  useAudio: () => ({ playSound: mockPlaySound, isPlaying: false }),
}));

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import LessonDetailScreen from '../../../app/lesson/[id]';
import { useProgressStore } from '../../store/progress.store';
import { DEFAULT_JAMO_PROGRESS } from '../../data/jamo';
import { LESSONS } from '../../data/lessons';

const LESSON_ONE = LESSONS[0]!;

function completeLessonOneProgress(): void {
  const progress = Object.fromEntries(
    LESSON_ONE.chars.map((char) => [
      char,
      { ...DEFAULT_JAMO_PROGRESS, char, seenCount: 1, correctCount: 1 },
    ]),
  );
  useProgressStore.setState({ progress });
}

describe('LessonDetailScreen route guards', () => {
  beforeEach(() => {
    useProgressStore.setState({ progress: {}, streak: 0, lastStudyDate: 0 });
    mockUseLocalSearchParams.mockReset();
    mockPlaySound.mockClear();
  });

  test('audio button plays sound without opening the detail panel', () => {
    // Arrange — lesson 1's first char is ㄱ (기역)
    mockUseLocalSearchParams.mockReturnValue({ id: '1' });
    const { getByLabelText, queryByTestId } = render(<LessonDetailScreen />);

    // Act — press the nested audio button inside the card
    fireEvent.press(getByLabelText('Play pronunciation of 기역'));

    // Assert — sound played, but the card press did not fire
    expect(mockPlaySound).toHaveBeenCalledTimes(1);
    expect(queryByTestId('detail-panel-open')).toBeNull();
  });

  test('renders lesson 1 characters for a valid unlocked id', () => {
    // Arrange
    mockUseLocalSearchParams.mockReturnValue({ id: '1' });

    // Act
    const { getByText, queryByTestId } = render(<LessonDetailScreen />);

    // Assert
    expect(queryByTestId('redirect')).toBeNull();
    LESSON_ONE.chars.forEach((char) => {
      expect(getByText(char)).toBeTruthy();
    });
  });

  test('redirects home for a non-numeric id', () => {
    // Arrange
    mockUseLocalSearchParams.mockReturnValue({ id: 'abc' });

    // Act
    const { getByTestId } = render(<LessonDetailScreen />);

    // Assert
    expect(getByTestId('redirect').props.children).toBe('/');
  });

  test('redirects home for an out-of-range id', () => {
    // Arrange
    mockUseLocalSearchParams.mockReturnValue({ id: '99' });

    // Act
    const { getByTestId } = render(<LessonDetailScreen />);

    // Assert
    expect(getByTestId('redirect').props.children).toBe('/');
  });

  test('redirects home when the lesson is still locked', () => {
    // Arrange — empty progress: only lesson 1 is unlocked
    mockUseLocalSearchParams.mockReturnValue({ id: '2' });

    // Act
    const { getByTestId } = render(<LessonDetailScreen />);

    // Assert
    expect(getByTestId('redirect').props.children).toBe('/');
  });

  test('renders lesson 2 once lesson 1 is complete', () => {
    // Arrange
    completeLessonOneProgress();
    mockUseLocalSearchParams.mockReturnValue({ id: '2' });

    // Act
    const { queryByTestId, getByText } = render(<LessonDetailScreen />);

    // Assert
    expect(queryByTestId('redirect')).toBeNull();
    expect(getByText(LESSONS[1]!.chars[0]!)).toBeTruthy();
  });

  test('quiz CTA carries the honest all-unlocked accessibility label', () => {
    // Arrange
    mockUseLocalSearchParams.mockReturnValue({ id: '1' });

    // Act
    const { getByLabelText } = render(<LessonDetailScreen />);

    // Assert
    expect(
      getByLabelText('Practice all unlocked characters in quiz'),
    ).toBeTruthy();
  });
});
