import { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/theme/colors';
import { SlotBox } from '../../src/components/SlotBox';
import { JamoKeyboard } from '../../src/components/JamoKeyboard';
import { useSyllableBuilder, type BuilderSlot } from '../../src/hooks/useSyllableBuilder';
import { useProgressStore } from '../../src/store/progress.store';
import { getUnlockedChars } from '../../src/utils/lessonProgress';
import { hapticCompose } from '../../src/utils/haptics';

const SLOT_LABELS: Readonly<Record<BuilderSlot, string>> = {
  initial: '초성',
  vowel: '중성',
  final: '종성',
} as const;

const RESULT_GLYPH_SIZE = 72;

export default function BuildScreen(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const { state, setSlot, clearSlot, focusSlot, reset, availableChars } = useSyllableBuilder();
  const progress = useProgressStore((s) => s.progress);
  const previousSyllableRef = useRef<string | null>(state.composedSyllable);

  const unlockedChars = useMemo(() => getUnlockedChars(progress), [progress]);
  const unlockedAvailableChars = useMemo(
    () => availableChars.filter((c) => unlockedChars.has(c)),
    [availableChars, unlockedChars],
  );

  useEffect(() => {
    const previousSyllable = previousSyllableRef.current;
    previousSyllableRef.current = state.composedSyllable;
    if (state.composedSyllable !== null && state.composedSyllable !== previousSyllable) {
      hapticCompose();
    }
  }, [state.composedSyllable]);

  const handleSelect = (char: string): void => {
    setSlot(state.activeSlot, char);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground,
          paddingTop: insets.top,
        },
      ]}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
        ]}
        accessibilityRole="header"
      >
        음절 조합
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
      >
        Syllable Builder
      </Text>

      {/* Syllable Slots */}
      <View style={styles.slotsRow}>
        <SlotBox
          label={SLOT_LABELS.initial}
          value={state.initial}
          isFocused={state.activeSlot === 'initial'}
          onPress={() => focusSlot('initial')}
          onClear={() => clearSlot('initial')}
        />
        <Text
          style={styles.plusSign}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          +
        </Text>
        <SlotBox
          label={SLOT_LABELS.vowel}
          value={state.vowel}
          isFocused={state.activeSlot === 'vowel'}
          onPress={() => focusSlot('vowel')}
          onClear={() => clearSlot('vowel')}
        />
        <Text
          style={styles.plusSign}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          +
        </Text>
        <SlotBox
          label={SLOT_LABELS.final}
          value={state.final}
          isFocused={state.activeSlot === 'final'}
          isOptional
          onPress={() => focusSlot('final')}
          onClear={() => clearSlot('final')}
        />
      </View>

      {/* Composed Result */}
      <View
        style={[
          styles.resultContainer,
          {
            backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightSurface,
            borderColor: state.composedSyllable !== null
              ? COLORS.teal
              : isDark ? COLORS.darkBorder : COLORS.lightBorder,
          },
        ]}
      >
        {state.composedSyllable !== null ? (
          <Text
            style={[
              styles.resultGlyph,
              { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
            ]}
            accessibilityLabel={`Composed syllable: ${state.composedSyllable}`}
            accessibilityLiveRegion="polite"
          >
            {state.composedSyllable}
          </Text>
        ) : (
          <Text
            style={[
              styles.resultPlaceholder,
              { color: COLORS.mutedText },
            ]}
          >
            결과
          </Text>
        )}
      </View>

      {/* Reset Button */}
      <Pressable
        onPress={reset}
        style={({ pressed }) => [
          styles.resetButton,
          {
            backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightSurface,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Reset syllable builder"
      >
        <Text
          style={[
            styles.resetText,
            { color: isDark ? COLORS.darkText : COLORS.lightText },
          ]}
        >
          다시하기
        </Text>
      </Pressable>

      {/* Jamo Keyboard */}
      <JamoKeyboard
        characters={unlockedAvailableChars}
        onSelect={handleSelect}
        activeSlotLabel={SLOT_LABELS[state.activeSlot]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 4,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  plusSign: {
    fontSize: 24,
    color: COLORS.mutedText,
    fontWeight: '300',
  },
  resultContainer: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultGlyph: {
    fontSize: RESULT_GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    lineHeight: RESULT_GLYPH_SIZE + 12,
  },
  resultPlaceholder: {
    fontSize: 16,
    fontFamily: 'NotoSansKR-Regular',
  },
  resetButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  resetText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '500',
  },
});
