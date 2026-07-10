jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
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

const mockUseLocalSearchParams = jest.fn();
const mockSetParams = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({
    navigate: jest.fn(),
    push: jest.fn(),
    setParams: mockSetParams,
  }),
}));

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import QuizScreen from '../../../app/(tabs)/quiz';
import { useProgressStore } from '../../store/progress.store';
import { useQuizStore } from '../../store/quiz.store';
import { DEFAULT_JAMO_PROGRESS } from '../../data/jamo';
import { LESSONS } from '../../data/lessons';
import { LESSON_QUIZ_LENGTH, QUIZ_LENGTH } from '../../utils/quizGenerator';

const LESSON_ONE = LESSONS[0]!;
const LESSON_TWO = LESSONS[1]!;

function completeLessonOneProgress(): void {
  const progress = Object.fromEntries(
    LESSON_ONE.chars.map((char) => [
      char,
      { ...DEFAULT_JAMO_PROGRESS, char, seenCount: 1, correctCount: 1 },
    ]),
  );
  useProgressStore.setState({ progress });
}

describe('QuizScreen scope', () => {
  beforeEach(() => {
    useProgressStore.setState({ progress: {}, streak: 0, lastStudyDate: 0 });
    useQuizStore.getState().resetQuiz();
    mockUseLocalSearchParams.mockReset();
    mockUseLocalSearchParams.mockReturnValue({});
    mockSetParams.mockClear();
  });

  test('shows the all-unlocked subtitle when no lesson param is given', () => {
    // Arrange — empty progress: only lesson 1's 5 chars are unlocked
    mockUseLocalSearchParams.mockReturnValue({});

    // Act
    const { getByText } = render(<QuizScreen />);

    // Assert
    expect(
      getByText(`All unlocked · 5 characters · ${QUIZ_LENGTH} questions`),
    ).toBeTruthy();
  });

  test('shows the lesson-scoped subtitle for an unlocked lesson param', () => {
    // Arrange
    mockUseLocalSearchParams.mockReturnValue({ lesson: '1' });

    // Act
    const { getByText } = render(<QuizScreen />);

    // Assert
    expect(
      getByText(`Lesson 1 · 5 characters · ${LESSON_QUIZ_LENGTH} questions`),
    ).toBeTruthy();
  });

  test('falls back to the full pool when the lesson param is locked', () => {
    // Arrange — empty progress: lesson 2 is still locked
    mockUseLocalSearchParams.mockReturnValue({ lesson: '2' });

    // Act
    const { getByText } = render(<QuizScreen />);

    // Assert
    expect(
      getByText(`All unlocked · 5 characters · ${QUIZ_LENGTH} questions`),
    ).toBeTruthy();
  });

  test('falls back to the full pool for a malformed lesson param', () => {
    // Arrange
    mockUseLocalSearchParams.mockReturnValue({ lesson: 'abc' });

    // Act
    const { getByText } = render(<QuizScreen />);

    // Assert
    expect(
      getByText(`All unlocked · 5 characters · ${QUIZ_LENGTH} questions`),
    ).toBeTruthy();
  });

  test('scoped quiz draws questions only from the lesson characters', () => {
    // Arrange — lesson 1 complete unlocks lesson 2 (10 chars total unlocked)
    completeLessonOneProgress();
    mockUseLocalSearchParams.mockReturnValue({ lesson: '2' });
    const { getByTestId } = render(<QuizScreen />);

    // Act
    fireEvent.press(getByTestId('quiz-start-button'));

    // Assert — every question comes from lesson 2, not the wider pool
    const { questions } = useQuizStore.getState();
    expect(questions).toHaveLength(LESSON_QUIZ_LENGTH);
    questions.forEach((question) => {
      expect(LESSON_TWO.chars).toContain(question.char);
    });
  });

  test('global quiz draws from every unlocked character', () => {
    // Arrange — lessons 1 and 2 unlocked, no lesson param
    completeLessonOneProgress();
    mockUseLocalSearchParams.mockReturnValue({});
    const { getByTestId } = render(<QuizScreen />);

    // Act
    fireEvent.press(getByTestId('quiz-start-button'));

    // Assert — 20 questions over 10 chars: both lessons must appear
    const { questions } = useQuizStore.getState();
    expect(questions).toHaveLength(QUIZ_LENGTH);
    const unlocked = [...LESSON_ONE.chars, ...LESSON_TWO.chars];
    questions.forEach((question) => {
      expect(unlocked).toContain(question.char);
    });
    const lessonTwoAsked = questions.some((question) =>
      LESSON_TWO.chars.includes(question.char),
    );
    expect(lessonTwoAsked).toBe(true);
  });
});
