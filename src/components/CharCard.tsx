import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';
import type { Jamo } from '../data/jamo';

interface CharCardProps {
  readonly jamo: Jamo;
  readonly hasProgress: boolean;
  readonly onPress: (jamo: Jamo) => void;
  readonly isLocked?: boolean;
}

const GLYPH_SIZE = 32;
const CARD_SIZE = 80;
const LOCKED_CONTENT_OPACITY = 0.35;

export function CharCard({
  jamo,
  hasProgress,
  onPress,
  isLocked = false,
}: CharCardProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable
      onPress={() => onPress(jamo)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightBackground,
          borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
          opacity: pressed ? 0.7 : 1,
        },
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
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
          isLocked && styles.lockedContent,
        ]}
      >
        {jamo.char}
      </Text>
      <Text
        style={[
          styles.romanization,
          { color: isDark ? COLORS.mutedText : COLORS.lightText },
          isLocked && styles.lockedContent,
        ]}
      >
        {jamo.romanization}
      </Text>
      {isLocked ? (
        <Text style={styles.lockIndicator} accessibilityElementsHidden>
          🔒
        </Text>
      ) : (
        hasProgress && <View style={styles.progressDot} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
  },
  glyph: {
    fontSize: GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    lineHeight: GLYPH_SIZE + 8,
  },
  romanization: {
    fontSize: 11,
    marginTop: 2,
  },
  progressDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.teal,
  },
  lockedContent: {
    opacity: LOCKED_CONTENT_OPACITY,
  },
  lockIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
  },
});
