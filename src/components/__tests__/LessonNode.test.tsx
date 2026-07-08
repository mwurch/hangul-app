import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LessonNode } from '../LessonNode';
import type { Lesson } from '../../data/lessons';
import {
  describeLessonForAccessibility,
  type LessonStatus,
} from '../../utils/lessonProgress';

const TEST_LESSON: Lesson = {
  id: 2,
  title: 'Basics',
  koreanTitle: '기본',
  chars: ['ㄷ', 'ㄹ', 'ㅁ', 'ㅜ', 'ㅡ'],
};

const COMPLETE_STATUS: LessonStatus = { kind: 'complete' };
const UNLOCKED_STATUS: LessonStatus = { kind: 'unlocked', correctChars: 3 };
const LOCKED_STATUS: LessonStatus = { kind: 'locked' };

const ALL_STATUSES: readonly LessonStatus[] = [
  COMPLETE_STATUS,
  UNLOCKED_STATUS,
  LOCKED_STATUS,
];

const CONNECTOR_TEST_ID = 'lesson-node-connector';

describe('LessonNode', () => {
  const defaultProps = {
    lesson: TEST_LESSON,
    status: UNLOCKED_STATUS,
    isCurrent: false,
    showConnector: false,
    onPress: jest.fn(),
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a check mark when the lesson is complete', () => {
    // Arrange & Act
    const { getByText } = render(
      <LessonNode {...defaultProps} status={COMPLETE_STATUS} />,
    );

    // Assert
    expect(getByText('✓')).toBeTruthy();
  });

  it('renders the correct-count fraction when the lesson is unlocked', () => {
    // Arrange & Act
    const { getByText } = render(
      <LessonNode {...defaultProps} status={UNLOCKED_STATUS} />,
    );

    // Assert
    expect(getByText('3/5')).toBeTruthy();
  });

  it('renders a lock when the lesson is locked', () => {
    // Arrange & Act
    const { getByText } = render(
      <LessonNode {...defaultProps} status={LOCKED_STATUS} />,
    );

    // Assert
    expect(getByText('🔒', { includeHiddenElements: true })).toBeTruthy();
  });

  it.each(ALL_STATUSES.map((status) => [status.kind, status] as const))(
    'has an accessibility label matching describeLessonForAccessibility when %s',
    (_kind, status) => {
      // Arrange
      const expectedLabel = describeLessonForAccessibility(TEST_LESSON, status);

      // Act
      const { getByLabelText } = render(
        <LessonNode {...defaultProps} status={status} />,
      );

      // Assert
      expect(getByLabelText(expectedLabel)).toBeTruthy();
    },
  );

  it('has disabled accessibility state when locked', () => {
    // Arrange
    const label = describeLessonForAccessibility(TEST_LESSON, LOCKED_STATUS);

    // Act
    const { getByLabelText } = render(
      <LessonNode {...defaultProps} status={LOCKED_STATUS} />,
    );

    // Assert
    expect(getByLabelText(label).props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it.each([
    ['complete', COMPLETE_STATUS],
    ['unlocked', UNLOCKED_STATUS],
  ] as const)(
    'does not have disabled accessibility state when %s',
    (_kind, status) => {
      // Arrange
      const label = describeLessonForAccessibility(TEST_LESSON, status);

      // Act
      const { getByLabelText } = render(
        <LessonNode {...defaultProps} status={status} />,
      );

      // Assert
      expect(getByLabelText(label).props.accessibilityState).toEqual({
        disabled: false,
      });
    },
  );

  it.each(ALL_STATUSES.map((status) => [status.kind, status] as const))(
    'calls onPress with the lesson when tapped while %s',
    (_kind, status) => {
      // Arrange
      const onPress = jest.fn();
      const label = describeLessonForAccessibility(TEST_LESSON, status);
      const { getByLabelText } = render(
        <LessonNode {...defaultProps} status={status} onPress={onPress} />,
      );

      // Act
      fireEvent.press(getByLabelText(label));

      // Assert
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(TEST_LESSON);
    },
  );

  it('renders the connector when showConnector is true', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <LessonNode {...defaultProps} showConnector={true} />,
    );

    // Assert
    expect(getByTestId(CONNECTOR_TEST_ID)).toBeTruthy();
  });

  it('hides the connector when showConnector is false', () => {
    // Arrange & Act
    const { queryByTestId } = render(
      <LessonNode {...defaultProps} showConnector={false} />,
    );

    // Assert
    expect(queryByTestId(CONNECTOR_TEST_ID)).toBeNull();
  });
});
