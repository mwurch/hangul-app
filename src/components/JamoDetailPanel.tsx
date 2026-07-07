import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { COLORS } from '../theme/colors';
import type { Jamo } from '../data/jamo';
import { useAudio } from '../hooks/useAudio';
import { AudioButton } from './AudioButton';

interface JamoDetailPanelProps {
  readonly jamo: Jamo | null;
  readonly onClose: () => void;
}

/** Resolved per-scheme colors for the bottom sheet (spec 03). */
interface SheetTheme {
  readonly sheetBg: string;
  readonly text: string;
  readonly muted: string;
  readonly accent: string;
  readonly handle: string;
  readonly outline: string;
  readonly divider: string;
  readonly chipBg: string;
  readonly cardBg: string;
}

const GLYPH_SIZE = 104;
const GLYPH_LINE_HEIGHT = 120;
const BACKDROP_COLOR = 'rgba(0, 0, 0, 0.55)';
const PRESSED_OPACITY = 0.6;

/** Rendered close target is ~34pt; extend the touch target to >= 44pt. */
const CLOSE_HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;

function buildTheme(isDark: boolean): SheetTheme {
  return {
    sheetBg: isDark ? COLORS.darkSurface : COLORS.lightBackground,
    text: isDark ? COLORS.darkText : COLORS.lightText,
    muted: isDark ? COLORS.darkMutedText : COLORS.mutedText,
    accent: isDark ? COLORS.darkBlue : COLORS.primaryBlue,
    handle: isDark ? COLORS.darkBorderStrong : COLORS.borderStrong,
    outline: isDark ? COLORS.darkBorderStrong : COLORS.borderStrong,
    divider: isDark ? COLORS.darkBorder : COLORS.lightBorder,
    chipBg: isDark ? COLORS.darkChipBlueBg : COLORS.chipBlueBg,
    cardBg: isDark ? COLORS.darkSurfaceDeep : COLORS.lightSurface,
  };
}

interface SheetHeaderProps {
  readonly jamo: Jamo;
  readonly theme: SheetTheme;
  readonly onClose: () => void;
}

function SheetHeader({ jamo, theme, onClose }: SheetHeaderProps): React.JSX.Element {
  const typeLabel = jamo.type === 'consonant' ? '자음 · Consonant' : '모음 · Vowel';

  return (
    <>
      <View style={[styles.dragHandle, { backgroundColor: theme.handle }]} />

      <Pressable
        onPress={onClose}
        style={styles.closeButton}
        hitSlop={CLOSE_HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Text style={[styles.closeText, { color: theme.muted }]}>✕</Text>
      </Pressable>

      <Text style={[styles.glyph, { color: theme.text }]}>{jamo.char}</Text>

      <View style={styles.nameRow}>
        <Text style={[styles.koreanName, { color: theme.text }]}>
          {jamo.koreanName}
        </Text>
        <Text style={[styles.romanization, { color: theme.muted }]}>
          {jamo.romanization}
        </Text>
      </View>

      <View style={[styles.typeChip, { backgroundColor: theme.chipBg }]}>
        <Text style={[styles.typeChipText, { color: theme.accent }]}>
          {typeLabel}
        </Text>
      </View>
    </>
  );
}

interface LetterAudioButtonProps {
  readonly theme: SheetTheme;
  readonly isPlaying: boolean;
  readonly koreanName: string;
  readonly onPress: () => void;
}

function LetterAudioButton({
  theme,
  isPlaying,
  koreanName,
  onPress,
}: LetterAudioButtonProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={isPlaying}
      accessibilityRole="button"
      accessibilityLabel={`Play ${koreanName} pronunciation`}
      accessibilityState={{ disabled: isPlaying }}
      style={({ pressed }) => [
        styles.letterAudioButton,
        { borderColor: theme.outline, opacity: pressed ? PRESSED_OPACITY : 1 },
      ]}
    >
      <Text style={[styles.letterAudioIcon, { color: theme.accent }]}>
        {isPlaying ? '◼' : '🔊'}
      </Text>
      <Text style={[styles.letterAudioLabel, { color: theme.accent }]}>
        글자 듣기
      </Text>
    </Pressable>
  );
}

interface ExampleSectionProps {
  readonly jamo: Jamo;
  readonly theme: SheetTheme;
  readonly isPlaying: boolean;
  readonly onPlayExample: () => void;
}

function ExampleSection({
  jamo,
  theme,
  isPlaying,
  onPlayExample,
}: ExampleSectionProps): React.JSX.Element {
  return (
    <>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
        <Text style={[styles.dividerLabel, { color: theme.muted }]}>예시 단어</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
      </View>

      <View style={[styles.exampleCard, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.exampleWord, { color: theme.text }]}>
          {jamo.exampleWord.korean}
        </Text>
        <View style={styles.exampleTextColumn}>
          <Text style={[styles.exampleRomanization, { color: theme.text }]}>
            {jamo.romanization}
          </Text>
          <Text style={[styles.exampleEnglish, { color: theme.muted }]}>
            {jamo.exampleWord.english}
          </Text>
        </View>
        <AudioButton
          onPress={onPlayExample}
          isPlaying={isPlaying}
          label={`Play ${jamo.exampleWord.korean} pronunciation`}
        />
      </View>
    </>
  );
}

export function JamoDetailPanel({ jamo, onClose }: JamoDetailPanelProps): React.JSX.Element | null {
  const isDark = useColorScheme() === 'dark';
  const { playSound, isPlaying } = useAudio();

  if (jamo === null) {
    return null;
  }

  const theme = buildTheme(isDark);

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} accessible={false}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.sheetBg }]}
          onPress={() => {}}
          accessible={false}
        >
          <SheetHeader jamo={jamo} theme={theme} onClose={onClose} />
          <LetterAudioButton
            theme={theme}
            isPlaying={isPlaying}
            koreanName={jamo.koreanName}
            onPress={() => playSound(jamo.audioFile)}
          />
          <ExampleSection
            jamo={jamo}
            theme={theme}
            isPlaying={isPlaying}
            onPlayExample={() => playSound(jamo.exampleWord.audioFile)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: BACKDROP_COLOR,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 14,
    paddingHorizontal: 28,
    paddingBottom: 32,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  glyph: {
    fontSize: GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '500',
    lineHeight: GLYPH_LINE_HEIGHT,
    marginTop: 26,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  koreanName: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'NotoSansKR-Regular',
  },
  romanization: {
    fontSize: 16,
    marginLeft: 10,
  },
  typeChip: {
    marginTop: 14,
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 20,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'NotoSansKR-Regular',
  },
  letterAudioButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 52,
    borderRadius: 15,
    borderWidth: 1.5,
    marginTop: 22,
  },
  letterAudioIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  letterAudioLabel: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'NotoSansKR-Regular',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 10,
    fontFamily: 'NotoSansKR-Regular',
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  exampleWord: {
    fontSize: 38,
    fontWeight: '500',
    fontFamily: 'NotoSansKR-Regular',
  },
  exampleTextColumn: {
    flex: 1,
    marginLeft: 14,
  },
  exampleRomanization: {
    fontSize: 14,
    fontWeight: '700',
  },
  exampleEnglish: {
    fontSize: 13,
    marginTop: 2,
  },
});
