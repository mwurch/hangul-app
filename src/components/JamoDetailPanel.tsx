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

const LARGE_GLYPH_SIZE = 72;

export function JamoDetailPanel({ jamo, onClose }: JamoDetailPanelProps): React.JSX.Element | null {
  const isDark = useColorScheme() === 'dark';
  const { playSound, isPlaying } = useAudio();

  if (jamo === null) {
    return null;
  }

  const bgColor = isDark ? COLORS.darkSurface : COLORS.lightBackground;
  const textColor = isDark ? COLORS.darkText : COLORS.lightText;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.panel, { backgroundColor: bgColor }]}
          onPress={() => {}}
        >
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={[styles.closeText, { color: textColor }]}>✕</Text>
          </Pressable>

          <Text
            style={[
              styles.glyph,
              { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
            ]}
          >
            {jamo.char}
          </Text>

          <Text style={[styles.koreanName, { color: textColor }]}>
            {jamo.koreanName}
          </Text>

          <AudioButton
            onPress={() => playSound(jamo.audioFile)}
            isPlaying={isPlaying}
            label={`Play ${jamo.koreanName} pronunciation`}
          />

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: COLORS.mutedText }]}>
              Romanization
            </Text>
            <Text style={[styles.value, { color: textColor }]}>
              {jamo.romanization}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: COLORS.mutedText }]}>
              Type
            </Text>
            <Text style={[styles.value, { color: textColor }]}>
              {jamo.type === 'consonant' ? '자음 (Consonant)' : '모음 (Vowel)'}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.sectionTitle, { color: COLORS.mutedText }]}>
            Example Word
          </Text>
          <View style={styles.exampleRow}>
            <View style={styles.exampleText}>
              <Text style={[styles.exampleKorean, { color: textColor }]}>
                {jamo.exampleWord.korean}
              </Text>
              <Text style={[styles.exampleEnglish, { color: COLORS.mutedText }]}>
                {jamo.exampleWord.english}
              </Text>
            </View>
            <AudioButton
              onPress={() => playSound(jamo.exampleWord.audioFile)}
              isPlaying={isPlaying}
              size="small"
              label={`Play ${jamo.exampleWord.korean} pronunciation`}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
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
    fontSize: LARGE_GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    lineHeight: LARGE_GLYPH_SIZE + 12,
    marginTop: 8,
  },
  koreanName: {
    fontSize: 20,
    fontFamily: 'NotoSansKR-Regular',
    marginTop: 4,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  exampleText: {
    flex: 1,
  },
  exampleKorean: {
    fontSize: 28,
    fontFamily: 'NotoSansKR-Regular',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 14,
  },
});
