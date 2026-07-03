import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';

interface SlotBoxProps {
  readonly label: string;
  readonly value: string | null;
  readonly isFocused: boolean;
  readonly isOptional?: boolean;
  readonly onPress: () => void;
  readonly onClear: () => void;
}

const SLOT_SIZE = 80;
const GLYPH_SIZE = 40;
const BORDER_RADIUS = 12;
const BORDER_WIDTH = 2;

function buildAccessibilityLabel(label: string, value: string | null): string {
  if (value === null) {
    return `${label} slot, empty`;
  }
  return `${label} slot, filled with ${value}, tap to clear`;
}

export function SlotBox({
  label,
  value,
  isFocused,
  isOptional = false,
  onPress,
  onClear,
}: SlotBoxProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const isFilled = value !== null;

  const handlePress = (): void => {
    if (isFilled) {
      onClear();
    } else {
      onPress();
    }
  };

  const borderColor = isFilled
    ? COLORS.teal
    : isFocused
      ? COLORS.primaryBlue
      : isDark
        ? COLORS.darkBorder
        : COLORS.lightBorder;

  const borderStyle = isFilled ? 'solid' : 'dashed';

  const backgroundColor = isDark ? COLORS.darkSurface : COLORS.lightBackground;

  return (
    <Pressable
      onPress={handlePress}
      testID="slot-box"
      accessibilityRole="button"
      accessibilityLabel={buildAccessibilityLabel(label, value)}
      style={({ pressed }) => [
        styles.slot,
        {
          borderColor,
          borderStyle,
          backgroundColor,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {isFilled ? (
        <Text
          style={[
            styles.glyph,
            { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
          ]}
        >
          {value}
        </Text>
      ) : (
        <View style={styles.emptyContent}>
          <Text
            style={[
              styles.label,
              {
                color: isFocused
                  ? COLORS.primaryBlue
                  : COLORS.mutedText,
              },
            ]}
          >
            {label}
          </Text>
          {isOptional && (
            <Text style={styles.optionalHint}>(선택)</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    lineHeight: GLYPH_SIZE + 8,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
  },
  optionalHint: {
    fontSize: 10,
    color: COLORS.mutedText,
    marginTop: 2,
  },
});
