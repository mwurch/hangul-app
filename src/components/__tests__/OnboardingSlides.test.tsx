jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () =>
  // The library's jest mock uses a default export; unwrap it so named
  // imports like useSafeAreaInsets resolve.
  require('react-native-safe-area-context/jest/mock').default,
);

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingSlides } from '../OnboardingSlides';
import { useSettingsStore } from '../../store/settings.store';

const PAGE_WIDTH = 390;
const SLIDE_COUNT = 3;

interface ScrollEventPayload {
  readonly nativeEvent: {
    readonly contentOffset: { readonly x: number; readonly y: number };
    readonly layoutMeasurement: { readonly width: number; readonly height: number };
    readonly contentSize: { readonly width: number; readonly height: number };
  };
}

function buildMomentumScrollEndEvent(
  offsetX: number,
  pageWidth: number,
): ScrollEventPayload {
  return {
    nativeEvent: {
      contentOffset: { x: offsetX, y: 0 },
      layoutMeasurement: { width: pageWidth, height: 800 },
      contentSize: { width: PAGE_WIDTH * SLIDE_COUNT, height: 800 },
    },
  };
}

describe('OnboardingSlides', () => {
  beforeEach(() => {
    useSettingsStore.setState({ hasCompletedOnboarding: false });
  });

  it('renders all 3 slide titles and the page dots', () => {
    // Arrange & Act
    const { getByText, getByLabelText } = render(<OnboardingSlides />);

    // Assert
    expect(getByText('배우기 / Learn')).toBeTruthy();
    expect(getByText('조합 / Build')).toBeTruthy();
    expect(getByText('퀴즈 / Quiz')).toBeTruthy();
    expect(getByLabelText('Slide 1 of 3')).toBeTruthy();
  });

  it('shows the skip button initially and completes onboarding when pressed', () => {
    // Arrange
    const { getByTestId } = render(<OnboardingSlides />);

    // Act
    fireEvent.press(getByTestId('onboarding-skip-button'));

    // Assert
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('marks the last slide after momentum scroll to the final page (skip hidden, CTA visible)', () => {
    // Arrange
    const { getByTestId, queryByTestId, getByLabelText } = render(
      <OnboardingSlides />,
    );

    // Act
    fireEvent(
      getByTestId('onboarding-scroll'),
      'momentumScrollEnd',
      buildMomentumScrollEndEvent(2 * PAGE_WIDTH, PAGE_WIDTH),
    );

    // Assert
    expect(queryByTestId('onboarding-skip-button')).toBeNull();
    expect(getByTestId('onboarding-start-button')).toBeTruthy();
    expect(getByLabelText('Slide 3 of 3')).toBeTruthy();
  });

  it('ignores a momentum scroll event with zero page width', () => {
    // Arrange
    const { getByTestId, getByLabelText } = render(<OnboardingSlides />);

    // Act
    fireEvent(
      getByTestId('onboarding-scroll'),
      'momentumScrollEnd',
      buildMomentumScrollEndEvent(2 * PAGE_WIDTH, 0),
    );

    // Assert — index unchanged, skip still visible, no crash
    expect(getByLabelText('Slide 1 of 3')).toBeTruthy();
    expect(getByTestId('onboarding-skip-button')).toBeTruthy();
  });

  it('clamps an overscrolled offset to the last slide index', () => {
    // Arrange
    const { getByTestId, getByLabelText } = render(<OnboardingSlides />);

    // Act — offset far beyond the last page
    fireEvent(
      getByTestId('onboarding-scroll'),
      'momentumScrollEnd',
      buildMomentumScrollEndEvent(10 * PAGE_WIDTH, PAGE_WIDTH),
    );

    // Assert
    expect(getByLabelText('Slide 3 of 3')).toBeTruthy();
  });

  it('completes onboarding when the final CTA is pressed', () => {
    // Arrange
    const { getByTestId } = render(<OnboardingSlides />);

    // Act
    fireEvent.press(getByTestId('onboarding-start-button'));

    // Assert
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
  });
});
