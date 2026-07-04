import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CharCard } from '../CharCard';
import type { Jamo } from '../../data/jamo';

const TEST_JAMO: Jamo = {
  char: 'ㄱ',
  type: 'consonant',
  romanization: 'g/k',
  koreanName: '기역',
  audioFile: 'giyeok.mp3',
  exampleWord: {
    korean: '가방',
    english: 'bag',
    audioFile: 'gabang.mp3',
  },
};

describe('CharCard', () => {
  const defaultProps = {
    jamo: TEST_JAMO,
    hasProgress: false,
    onPress: jest.fn(),
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has accessibility label with romanization when unlocked', () => {
    // Arrange & Act
    const { getByLabelText } = render(<CharCard {...defaultProps} />);

    // Assert
    expect(getByLabelText('기역, romanized g/k')).toBeTruthy();
  });

  it('does not show lock indicator when unlocked', () => {
    // Arrange & Act
    const { queryByText } = render(<CharCard {...defaultProps} />);

    // Assert
    expect(queryByText('🔒', { includeHiddenElements: true })).toBeNull();
  });

  it('shows lock indicator when locked', () => {
    // Arrange & Act
    const { getByText } = render(
      <CharCard {...defaultProps} isLocked={true} />,
    );

    // Assert
    expect(getByText('🔒', { includeHiddenElements: true })).toBeTruthy();
  });

  it('has locked accessibility label without romanization when locked', () => {
    // Arrange & Act
    const { getByLabelText } = render(
      <CharCard {...defaultProps} isLocked={true} />,
    );

    // Assert
    const card = getByLabelText('기역, locked');
    expect(card).toBeTruthy();
    expect(card.props.accessibilityLabel).not.toContain('g/k');
  });

  it('has disabled accessibility state when locked', () => {
    // Arrange & Act
    const { getByLabelText } = render(
      <CharCard {...defaultProps} isLocked={true} />,
    );

    // Assert
    expect(getByLabelText('기역, locked').props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  it('calls onPress when tapped while unlocked', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <CharCard {...defaultProps} onPress={onPress} />,
    );

    // Act
    fireEvent.press(getByLabelText('기역, romanized g/k'));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(TEST_JAMO);
  });

  it('calls onPress when tapped while locked', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <CharCard {...defaultProps} isLocked={true} onPress={onPress} />,
    );

    // Act
    fireEvent.press(getByLabelText('기역, locked'));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(TEST_JAMO);
  });
});
