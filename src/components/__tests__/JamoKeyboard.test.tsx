import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { JamoKeyboard } from '../JamoKeyboard';
import { CONSONANTS, VOWELS } from '../../data/jamo';

const CONSONANT_CHARS = CONSONANTS.map((j) => j.char);
const VOWEL_CHARS = VOWELS.map((j) => j.char);

describe('JamoKeyboard', () => {
  it('renders all provided characters', () => {
    // Arrange
    const chars = ['ㄱ', 'ㄴ', 'ㄷ'];

    // Act
    const { getByText } = render(
      <JamoKeyboard
        characters={chars}
        onSelect={jest.fn()}
        activeSlotLabel="초성"
      />,
    );

    // Assert
    expect(getByText('ㄱ')).toBeTruthy();
    expect(getByText('ㄴ')).toBeTruthy();
    expect(getByText('ㄷ')).toBeTruthy();
  });

  it('calls onSelect with correct char when key is tapped', () => {
    // Arrange
    const onSelect = jest.fn();
    const { getByText } = render(
      <JamoKeyboard
        characters={['ㅁ', 'ㅂ', 'ㅅ']}
        onSelect={onSelect}
        activeSlotLabel="초성"
      />,
    );

    // Act
    fireEvent.press(getByText('ㅂ'));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('ㅂ');
  });

  it('displays the activeSlotLabel in header', () => {
    // Arrange & Act
    const { getByText } = render(
      <JamoKeyboard
        characters={['ㅏ']}
        onSelect={jest.fn()}
        activeSlotLabel="중성"
      />,
    );

    // Assert
    expect(getByText('중성 선택')).toBeTruthy();
  });

  it('displays 종성 선택 header for final consonant slot', () => {
    // Arrange & Act
    const { getByText } = render(
      <JamoKeyboard
        characters={['ㄱ']}
        onSelect={jest.fn()}
        activeSlotLabel="종성"
      />,
    );

    // Assert
    expect(getByText('종성 선택')).toBeTruthy();
  });

  it('renders correct number of keys for consonants (14)', () => {
    // Arrange & Act
    const { getAllByRole } = render(
      <JamoKeyboard
        characters={CONSONANT_CHARS}
        onSelect={jest.fn()}
        activeSlotLabel="초성"
      />,
    );

    // Assert
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(14);
  });

  it('renders correct number of keys for vowels (10)', () => {
    // Arrange & Act
    const { getAllByRole } = render(
      <JamoKeyboard
        characters={VOWEL_CHARS}
        onSelect={jest.fn()}
        activeSlotLabel="중성"
      />,
    );

    // Assert
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('does not call onSelect for characters not tapped', () => {
    // Arrange
    const onSelect = jest.fn();
    const { getByText } = render(
      <JamoKeyboard
        characters={['ㄱ', 'ㄴ', 'ㄷ']}
        onSelect={onSelect}
        activeSlotLabel="초성"
      />,
    );

    // Act
    fireEvent.press(getByText('ㄱ'));

    // Assert
    expect(onSelect).toHaveBeenCalledWith('ㄱ');
    expect(onSelect).not.toHaveBeenCalledWith('ㄴ');
    expect(onSelect).not.toHaveBeenCalledWith('ㄷ');
  });
});
