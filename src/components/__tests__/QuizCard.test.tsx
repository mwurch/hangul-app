import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuizCard } from '../QuizCard';
import type { QuizQuestion } from '../../store/quiz.store';

const CORRECT_GREEN = '#0F6E56';
const WRONG_RED = '#D32F2F';

const charToRomanQuestion: QuizQuestion = {
  char: 'ㅎ',
  correctAnswer: 'h',
  options: ['h', 'n', 'm', 'g'],
  type: 'charToRoman',
};

const romanToCharQuestion: QuizQuestion = {
  char: 'ㅎ',
  correctAnswer: 'ㅎ',
  options: ['ㅎ', 'ㄴ', 'ㅁ', 'ㄱ'],
  type: 'romanToChar',
};

function flattenStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
    : (style as Record<string, unknown>);
}

describe('QuizCard', () => {
  const defaultProps = {
    question: charToRomanQuestion,
    prompt: 'ㅎ',
    selectedAnswer: null,
    onSelect: jest.fn(),
    questionNumber: 3,
    totalQuestions: 20,
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the prompt glyph', () => {
    // Arrange & Act
    const { getByTestId } = render(<QuizCard {...defaultProps} />);

    // Assert
    expect(getByTestId('quiz-prompt').props.children).toBe('ㅎ');
  });

  it('renders all 4 answer options', () => {
    // Arrange & Act
    const { getByText } = render(<QuizCard {...defaultProps} />);

    // Assert
    expect(getByText('h')).toBeTruthy();
    expect(getByText('n')).toBeTruthy();
    expect(getByText('m')).toBeTruthy();
    expect(getByText('g')).toBeTruthy();
  });

  it('shows progress label as "N / M"', () => {
    // Arrange & Act
    const { getByText } = render(<QuizCard {...defaultProps} />);

    // Assert
    expect(getByText('3 / 20')).toBeTruthy();
  });

  it('calls onSelect with the tapped option', () => {
    // Arrange
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <QuizCard {...defaultProps} onSelect={onSelect} />,
    );

    // Act
    fireEvent.press(getByTestId('quiz-option-n'));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('n');
  });

  it('does not call onSelect when already answered', () => {
    // Arrange
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <QuizCard {...defaultProps} selectedAnswer="h" onSelect={onSelect} />,
    );

    // Act
    fireEvent.press(getByTestId('quiz-option-n'));

    // Assert
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('disables all option buttons once answered', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizCard {...defaultProps} selectedAnswer="h" />,
    );

    // Assert
    charToRomanQuestion.options.forEach((option) => {
      const button = getByTestId(`quiz-option-${option}`);
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('highlights the selected button green when the answer is correct', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizCard {...defaultProps} selectedAnswer="h" />,
    );

    // Assert
    const selected = getByTestId('quiz-option-h');
    expect(selected.props.accessibilityState.selected).toBe(true);
    expect(flattenStyle(selected.props.style).backgroundColor).toBe(
      CORRECT_GREEN,
    );
  });

  it('highlights the selected button red when the answer is wrong', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizCard {...defaultProps} selectedAnswer="n" />,
    );

    // Assert
    const selected = getByTestId('quiz-option-n');
    expect(selected.props.accessibilityState.selected).toBe(true);
    expect(flattenStyle(selected.props.style).backgroundColor).toBe(WRONG_RED);
  });

  it('highlights the correct button green when a wrong answer was selected', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizCard {...defaultProps} selectedAnswer="n" />,
    );

    // Assert
    const correctButton = getByTestId('quiz-option-h');
    expect(flattenStyle(correctButton.props.style).backgroundColor).toBe(
      CORRECT_GREEN,
    );
  });

  it('does not highlight unrelated options after answering', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizCard {...defaultProps} selectedAnswer="n" />,
    );

    // Assert
    const unrelated = getByTestId('quiz-option-m');
    expect(flattenStyle(unrelated.props.style).backgroundColor).not.toBe(
      CORRECT_GREEN,
    );
    expect(flattenStyle(unrelated.props.style).backgroundColor).not.toBe(
      WRONG_RED,
    );
  });

  it('renders romanization prompt with glyph options for romanToChar questions', () => {
    // Arrange & Act
    const { getByTestId, getByText } = render(
      <QuizCard {...defaultProps} question={romanToCharQuestion} prompt="h" />,
    );

    // Assert
    expect(getByTestId('quiz-prompt').props.children).toBe('h');
    expect(getByText('ㅎ')).toBeTruthy();
    expect(getByText('ㄴ')).toBeTruthy();
    expect(getByText('ㅁ')).toBeTruthy();
    expect(getByText('ㄱ')).toBeTruthy();
  });

  it('has accessible option buttons with role and label', () => {
    // Arrange & Act
    const { getByTestId } = render(<QuizCard {...defaultProps} />);

    // Assert
    const button = getByTestId('quiz-option-h');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Answer option h');
    expect(button.props.accessibilityState.disabled).toBe(false);
    expect(button.props.accessibilityState.selected).toBe(false);
  });
});
