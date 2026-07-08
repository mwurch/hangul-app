import React from 'react';
import { processColor } from 'react-native';
import { render } from '@testing-library/react-native';
import { ProgressRing } from '../ProgressRing';
import { COLORS } from '../../theme/colors';

const DEFAULT_SIZE = 96;

describe('ProgressRing', () => {
  const defaultProps = {
    learned: 9,
    total: 14,
    label: '자음',
  } as const;

  it('renders learned/total text inside the ring', () => {
    // Arrange & Act
    const { getByText } = render(<ProgressRing {...defaultProps} />);

    // Assert
    expect(getByText('9 / 14')).toBeTruthy();
  });

  it('renders the module label below the ring', () => {
    // Arrange & Act
    const { getByText } = render(<ProgressRing {...defaultProps} />);

    // Assert
    expect(getByText('자음')).toBeTruthy();
  });

  it('exposes progressbar accessibility value reflecting props', () => {
    // Arrange & Act
    const { getByTestId } = render(<ProgressRing {...defaultProps} />);

    // Assert
    const ring = getByTestId('progress-ring');
    expect(ring.props.accessibilityRole).toBe('progressbar');
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 14, now: 9 });
  });

  it('has a meaningful accessibility label', () => {
    // Arrange & Act
    const { getByLabelText } = render(<ProgressRing {...defaultProps} />);

    // Assert
    expect(getByLabelText('자음: 9 of 14 learned')).toBeTruthy();
  });

  it('clamps learned to total when learned exceeds total', () => {
    // Arrange & Act
    const { getByTestId, getByText } = render(
      <ProgressRing {...defaultProps} learned={20} />,
    );

    // Assert
    const ring = getByTestId('progress-ring');
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 14, now: 14 });
    expect(getByText('14 / 14')).toBeTruthy();

    // Full progress → dash offset of 0 (arc fully drawn).
    // react-native-svg coerces a 0 offset to null internally, so both
    // values mean "no offset" here.
    const arc = getByTestId('progress-ring-arc');
    expect(arc.props.strokeDashoffset ?? 0).toBe(0);
  });

  it('clamps negative learned to zero', () => {
    // Arrange & Act
    const { getByTestId, getByText } = render(
      <ProgressRing {...defaultProps} learned={-3} />,
    );

    // Assert
    const ring = getByTestId('progress-ring');
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 14, now: 0 });
    expect(getByText('0 / 14')).toBeTruthy();
  });

  it('handles total of zero without NaN', () => {
    // Arrange & Act
    const { getByTestId, getByText } = render(
      <ProgressRing learned={0} total={0} label="자음" />,
    );

    // Assert
    expect(getByText('0 / 0')).toBeTruthy();

    const ring = getByTestId('progress-ring');
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 0, now: 0 });

    // Zero progress → dash offset equals full circumference, and is a finite number
    const arc = getByTestId('progress-ring-arc');
    expect(Number.isFinite(arc.props.strokeDashoffset)).toBe(true);
    expect(arc.props.strokeDashoffset).toBeCloseTo(arc.props.strokeDasharray[0]);
  });

  it('uses the default size when none is given', () => {
    // Arrange & Act
    const { getByTestId } = render(<ProgressRing {...defaultProps} />);

    // Assert
    const svg = getByTestId('progress-ring-svg');
    expect(svg.props.width).toBe(DEFAULT_SIZE);
    expect(svg.props.height).toBe(DEFAULT_SIZE);
  });

  it('honors a custom size', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <ProgressRing {...defaultProps} size={120} />,
    );

    // Assert
    const svg = getByTestId('progress-ring-svg');
    expect(svg.props.width).toBe(120);
    expect(svg.props.height).toBe(120);
  });

  it('defaults the arc color to teal when no color prop is given', () => {
    // Arrange & Act
    const { getByTestId } = render(<ProgressRing {...defaultProps} />);

    // Assert — react-native-svg wraps colors in a processed-color object
    const arc = getByTestId('progress-ring-arc');
    expect(arc.props.stroke.payload).toBe(processColor(COLORS.teal));
  });

  it('applies a custom ring color to the arc', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <ProgressRing {...defaultProps} color={COLORS.primaryBlue} />,
    );

    // Assert — react-native-svg wraps colors in a processed-color object
    const arc = getByTestId('progress-ring-arc');
    expect(arc.props.stroke.payload).toBe(processColor(COLORS.primaryBlue));
  });

  it('draws a partial arc for partial progress', () => {
    // Arrange & Act — 9/14 learned ≈ 64% progress
    const { getByTestId } = render(<ProgressRing {...defaultProps} />);

    // Assert — offset strictly between 0 (full) and circumference (empty)
    const arc = getByTestId('progress-ring-arc');
    const circumference: number = arc.props.strokeDasharray[0];
    expect(arc.props.strokeDashoffset).toBeGreaterThan(0);
    expect(arc.props.strokeDashoffset).toBeLessThan(circumference);
    expect(arc.props.strokeDashoffset).toBeCloseTo(circumference * (1 - 9 / 14));
  });
});
