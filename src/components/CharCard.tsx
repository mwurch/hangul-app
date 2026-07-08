import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';
import type { Jamo } from '../data/jamo';

interface CharCardProps {
  readonly jamo: Jamo;
  readonly hasProgress: boolean;
  readonly onPress: (jamo: Jamo) => void;
  readonly isLocked?: boolean;
}

const CARD_RADIUS = 15;
const GLYPH_SIZE = 29;
const ROMANIZATION_SIZE = 10.5;
const LOCK_ICON_SIZE = 10;

export function CharCard({
  jamo,
  hasProgress,
  onPress,
  isLocked = false,
}: CharCardProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  const cardTheme = isLocked
    ? {
        backgroundColor: isDark ? COLORS.darkBackground : COLORS.lockedBg,
        borderColor: isDark ? COLORS.darkBorder : COLORS.lockedBorder,
        borderStyle: 'dashed' as const,
      }
    : {
        backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightSurface,
        borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
        borderStyle: 'solid' as const,
      };
  const lockedTextColor = isDark ? COLORS.darkLockedText : COLORS.lockedText;
  const glyphColor = isLocked
    ? lockedTextColor
    : isDark
      ? COLORS.darkText
      : COLORS.lightText;
  const romanizationColor = isLocked
    ? lockedTextColor
    : isDark
      ? COLORS.darkMutedText
      : COLORS.mutedText;

  return (
    <Pressable
      onPress={() => onPress(jamo)}
      style={({ pressed }) => [
        styles.card,
        cardTheme,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityState={isLocked ? { disabled: true } : undefined}
      accessibilityLabel={
        isLocked
          ? `${jamo.koreanName}, locked`
          : `${jamo.koreanName}, romanized ${jamo.romanization}${hasProgress ? ', studied' : ''}`
      }
    >
      <Text
        style={[
          styles.glyph,
          isLocked ? styles.lockedGlyph : styles.unlockedGlyph,
          { color: glyphColor },
        ]}
      >
        {jamo.char}
      </Text>
      <Text style={[styles.romanization, { color: romanizationColor }]}>
        {jamo.romanization}
      </Text>
      {isLocked ? (
        <Text
          style={[styles.lockIndicator, { color: lockedTextColor }]}
          accessibilityElementsHidden
        >
          🔒
        </Text>
      ) : (
        hasProgress && (
          <View
            style={[
              styles.progressDot,
              { backgroundColor: isDark ? COLORS.darkTeal : COLORS.teal },
            ]}
          />
        )
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    lineHeight: GLYPH_SIZE + 8,
  },
  unlockedGlyph: {
    fontWeight: '500',
  },
  lockedGlyph: {
    fontWeight: '400',
  },
  romanization: {
    fontSize: ROMANIZATION_SIZE,
    marginTop: 2,
  },
  progressDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lockIndicator: {
    position: 'absolute',
    top: 5,
    right: 6,
    fontSize: LOCK_ICON_SIZE,
  },
});
