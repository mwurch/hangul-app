import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';

interface AudioButtonProps {
  readonly onPress: () => void;
  readonly isPlaying: boolean;
  readonly size?: 'small' | 'large';
  readonly label?: string;
}

const ICON_SIZE = {
  small: 20,
  large: 28,
} as const;

const BUTTON_SIZE = {
  small: 36,
  large: 48,
} as const;

/** Minimum touch target per accessibility guidelines. */
const MIN_TOUCH_TARGET = 44;

export function AudioButton({
  onPress,
  isPlaying,
  size = 'large',
  label = 'Play pronunciation',
}: AudioButtonProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  const iconColor = isPlaying
    ? COLORS.teal
    : isDark
      ? COLORS.darkText
      : COLORS.primaryBlue;

  const borderColor = isDark ? COLORS.darkBorder : COLORS.lightBorder;
  const hitSlop = Math.max(0, (MIN_TOUCH_TARGET - BUTTON_SIZE[size]) / 2);

  return (
    <Pressable
      onPress={onPress}
      disabled={isPlaying}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isPlaying }}
      style={({ pressed }) => [
        styles.button,
        {
          width: BUTTON_SIZE[size],
          height: BUTTON_SIZE[size],
          borderRadius: BUTTON_SIZE[size] / 2,
          borderColor,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: ICON_SIZE[size], color: iconColor }]}>
        {isPlaying ? '◼' : '🔊'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});
