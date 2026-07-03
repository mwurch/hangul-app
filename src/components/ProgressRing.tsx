import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../theme/colors';

interface ProgressRingProps {
  readonly learned: number;
  readonly total: number;
  readonly label: string;
  readonly size?: number;
}

const DEFAULT_SIZE = 96;
const STROKE_WIDTH = 8;
const START_ANGLE_DEGREES = -90; // progress starts at 12 o'clock
const MIN_PROGRESS = 0;
const MAX_PROGRESS = 1;

function clampLearned(learned: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(Math.max(learned, 0), total);
}

function computeProgress(learned: number, total: number): number {
  if (total <= 0) {
    return MIN_PROGRESS;
  }
  return Math.min(Math.max(learned / total, MIN_PROGRESS), MAX_PROGRESS);
}

export function ProgressRing({
  learned,
  total,
  label,
  size = DEFAULT_SIZE,
}: ProgressRingProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  const center = size / 2;
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeLearned = clampLearned(learned, total);
  const progress = computeProgress(learned, total);
  const strokeDashoffset = circumference * (MAX_PROGRESS - progress);

  const trackColor = isDark ? COLORS.darkBorder : COLORS.lightBorder;
  const textColor = isDark ? COLORS.darkText : COLORS.lightText;

  return (
    <View
      style={styles.container}
      testID="progress-ring"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${safeLearned} of ${total} learned`}
      accessibilityValue={{ min: 0, max: total, now: safeLearned }}
    >
      <View style={{ width: size, height: size }}>
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          testID="progress-ring-svg"
        >
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={COLORS.teal}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={[circumference]}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(${START_ANGLE_DEGREES} ${center} ${center})`}
            testID="progress-ring-arc"
          />
        </Svg>
        <View style={styles.countOverlay} pointerEvents="none">
          <Text style={[styles.countText, { color: textColor }]}>
            {`${safeLearned}/${total}`}
          </Text>
        </View>
      </View>
      <Text style={[styles.label, { color: isDark ? COLORS.mutedText : COLORS.lightText }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  countOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    marginTop: 6,
  },
});
