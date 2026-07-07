import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';

interface AudioButtonProps {
  readonly onPress: () => void;
  readonly isPlaying: boolean;
  readonly size?: 'small' | 'large';
  readonly label?: string;
}

const ICON_SIZE = {
  small: 16,
  large: 20,
} as const;

/** Spec 03: the filled circular audio button is 44pt in the example card. */
const BUTTON_SIZE = {
  small: 36,
  large: 44,
} as const;

/** Minimum touch target per accessibility guidelines. */
const MIN_TOUCH_TARGET = 44;

const PRESSED_OPACITY = 0.6;

export function AudioButton({
  onPress,
  isPlaying,
  size = 'large',
  label = 'Play pronunciation',
}: AudioButtonProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  // Filled accent circle: primaryBlue with white icon in light mode,
  // dark-mode blue with deep-background icon in dark mode (spec 03).
  const backgroundColor = isDark ? COLORS.darkBlue : COLORS.primaryBlue;
  const iconColor = isDark ? COLORS.darkBackground : COLORS.lightBackground;
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
          backgroundColor,
          opacity: pressed ? PRESSED_OPACITY : 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});
