import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SlotBox } from '../SlotBox';

describe('SlotBox', () => {
  const defaultProps = {
    label: '초성',
    value: null,
    isFocused: false,
    onPress: jest.fn(),
    onClear: jest.fn(),
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label when empty', () => {
    // Arrange & Act
    const { getByText } = render(<SlotBox {...defaultProps} />);

    // Assert
    expect(getByText('초성')).toBeTruthy();
  });

  it('renders jamo character when filled', () => {
    // Arrange & Act
    const { getByText, queryByText } = render(
      <SlotBox {...defaultProps} value="ㅎ" />,
    );

    // Assert
    expect(getByText('ㅎ')).toBeTruthy();
    expect(queryByText('초성')).toBeNull();
  });

  it('shows focused style when isFocused is true', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <SlotBox {...defaultProps} isFocused={true} />,
    );

    // Assert
    const container = getByTestId('slot-box');
    const containerStyle = container.props.style;
    const flatStyle = Array.isArray(containerStyle)
      ? Object.assign({}, ...containerStyle.flat(Infinity).filter(Boolean))
      : containerStyle;
    expect(flatStyle.borderColor).toBe('#1A3F7A');
  });

  it('calls onPress when tapped', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SlotBox {...defaultProps} onPress={onPress} />,
    );

    // Act
    fireEvent.press(getByTestId('slot-box'));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when tapped while filled', () => {
    // Arrange
    const onClear = jest.fn();
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SlotBox
        {...defaultProps}
        value="ㅎ"
        onPress={onPress}
        onClear={onClear}
      />,
    );

    // Act
    fireEvent.press(getByTestId('slot-box'));

    // Assert
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows optional hint for optional slot', () => {
    // Arrange & Act
    const { getByText } = render(
      <SlotBox {...defaultProps} label="종성" isOptional={true} />,
    );

    // Assert
    expect(getByText('(선택)')).toBeTruthy();
  });

  it('does not show optional hint when not optional', () => {
    // Arrange & Act
    const { queryByText } = render(<SlotBox {...defaultProps} />);

    // Assert
    expect(queryByText('(선택)')).toBeNull();
  });

  it('does not show optional hint when filled', () => {
    // Arrange & Act
    const { queryByText } = render(
      <SlotBox {...defaultProps} value="ㄴ" isOptional={true} />,
    );

    // Assert
    expect(queryByText('(선택)')).toBeNull();
  });

  it('shows filled slot with teal border', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <SlotBox {...defaultProps} value="ㅎ" />,
    );

    // Assert
    const container = getByTestId('slot-box');
    const containerStyle = container.props.style;
    const flatStyle = Array.isArray(containerStyle)
      ? Object.assign({}, ...containerStyle.flat(Infinity).filter(Boolean))
      : containerStyle;
    expect(flatStyle.borderColor).toBe('#0F6E56');
  });

  it('has correct accessibility label when empty', () => {
    // Arrange & Act
    const { getByLabelText } = render(<SlotBox {...defaultProps} />);

    // Assert
    expect(getByLabelText('초성 slot, empty')).toBeTruthy();
  });

  it('has correct accessibility label when filled', () => {
    // Arrange & Act
    const { getByLabelText } = render(
      <SlotBox {...defaultProps} value="ㅎ" />,
    );

    // Assert
    expect(getByLabelText('초성 slot, filled with ㅎ, tap to clear')).toBeTruthy();
  });
});
