import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuizSummary } from '../QuizSummary';

const TEAL = '#0F6E56';

function flattenStyle(style: unknown): Record<string, unknown> {
  return Array.isArray(style)
    ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
    : (style as Record<string, unknown>);
}

describe('QuizSummary', () => {
  const defaultProps = {
    score: 17,
    totalQuestions: 20,
    onRetry: jest.fn(),
    onDone: jest.fn(),
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the score as "17 / 20"', () => {
    // Arrange & Act
    const { getByTestId } = render(<QuizSummary {...defaultProps} />);

    // Assert
    expect(getByTestId('quiz-summary-score').props.children).toBe('17 / 20');
  });

  it('shows the rounded percentage', () => {
    // Arrange & Act
    const { getByTestId } = render(<QuizSummary {...defaultProps} />);

    // Assert
    expect(getByTestId('quiz-summary-percent').props.children).toBe('85%');
  });

  it('shows a teal encouraging message for a good score', () => {
    // Arrange & Act
    const { getByTestId } = render(<QuizSummary {...defaultProps} />);

    // Assert
    const message = getByTestId('quiz-summary-message');
    expect(message.props.children).toBe('잘했어요!');
    expect(flattenStyle(message.props.style).color).toBe(TEAL);
  });

  it('shows the excellent message when score is 90% or above', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizSummary {...defaultProps} score={19} />,
    );

    // Assert
    expect(getByTestId('quiz-summary-message').props.children).toBe(
      '완벽해요!',
    );
  });

  it('shows the fair message between 50% and 69%', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizSummary {...defaultProps} score={12} />,
    );

    // Assert
    expect(getByTestId('quiz-summary-message').props.children).toBe('좋아요!');
  });

  it('shows the keep-practicing message without teal for a low score', () => {
    // Arrange & Act
    const { getByTestId } = render(<QuizSummary {...defaultProps} score={5} />);

    // Assert
    const message = getByTestId('quiz-summary-message');
    expect(message.props.children).toBe('다시 도전해요!');
    expect(flattenStyle(message.props.style).color).not.toBe(TEAL);
  });

  it('renders 0% when totalQuestions is zero', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <QuizSummary {...defaultProps} score={0} totalQuestions={0} />,
    );

    // Assert
    expect(getByTestId('quiz-summary-percent').props.children).toBe('0%');
  });

  it('calls onRetry when the try-again button is pressed', () => {
    // Arrange
    const onRetry = jest.fn();
    const { getByTestId } = render(
      <QuizSummary {...defaultProps} onRetry={onRetry} />,
    );

    // Act
    fireEvent.press(getByTestId('quiz-summary-retry'));

    // Assert
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDone when the done button is pressed', () => {
    // Arrange
    const onDone = jest.fn();
    const { getByTestId } = render(
      <QuizSummary {...defaultProps} onDone={onDone} />,
    );

    // Act
    fireEvent.press(getByTestId('quiz-summary-done'));

    // Assert
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('has accessible buttons and score label', () => {
    // Arrange & Act
    const { getByTestId } = render(<QuizSummary {...defaultProps} />);

    // Assert
    const retry = getByTestId('quiz-summary-retry');
    const done = getByTestId('quiz-summary-done');
    expect(retry.props.accessibilityRole).toBe('button');
    expect(retry.props.accessibilityLabel).toBe('Try again with a new quiz');
    expect(done.props.accessibilityRole).toBe('button');
    expect(done.props.accessibilityLabel).toBe(
      'Finish quiz and return to start',
    );
    expect(getByTestId('quiz-summary-score').props.accessibilityLabel).toBe(
      'Score: 17 out of 20',
    );
  });
});
