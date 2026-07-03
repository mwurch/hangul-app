import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AudioButton } from '../AudioButton';

describe('AudioButton', () => {
  it('renders speaker icon when not playing', () => {
    // Arrange & Act
    const { getByText } = render(
      <AudioButton onPress={jest.fn()} isPlaying={false} />,
    );

    // Assert
    expect(getByText('🔊')).toBeTruthy();
  });

  it('renders stop icon when playing', () => {
    // Arrange & Act
    const { getByText } = render(
      <AudioButton onPress={jest.fn()} isPlaying={true} />,
    );

    // Assert
    expect(getByText('◼')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByRole } = render(
      <AudioButton onPress={onPress} isPlaying={false} />,
    );

    // Act
    fireEvent.press(getByRole('button'));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled while playing', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByRole } = render(
      <AudioButton onPress={onPress} isPlaying={true} />,
    );

    // Act
    fireEvent.press(getByRole('button'));

    // Assert
    expect(onPress).not.toHaveBeenCalled();
  });

  it('uses custom accessibility label', () => {
    // Arrange & Act
    const { getByLabelText } = render(
      <AudioButton
        onPress={jest.fn()}
        isPlaying={false}
        label="Play 기역 pronunciation"
      />,
    );

    // Assert
    expect(getByLabelText('Play 기역 pronunciation')).toBeTruthy();
  });

  it('uses default accessibility label when none provided', () => {
    // Arrange & Act
    const { getByLabelText } = render(
      <AudioButton onPress={jest.fn()} isPlaying={false} />,
    );

    // Assert
    expect(getByLabelText('Play pronunciation')).toBeTruthy();
  });
});
