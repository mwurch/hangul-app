import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { type Jamo, ALL_JAMO } from '../../src/data/jamo';
import { type Lesson, LESSONS } from '../../src/data/lessons';
import { useProgressStore } from '../../src/store/progress.store';
import { useAudio } from '../../src/hooks/useAudio';
import {
  countCorrectChars,
  getUnlockedLessonIds,
  isLessonComplete,
} from '../../src/utils/lessonProgress';
import { JamoDetailPanel } from '../../src/components/JamoDetailPanel';

const KOREAN_FONT = 'NotoSansKR-Regular';
const SCREEN_PADDING = 20;
const TITLE_SIZE = 27;
const STATUS_TEXT_SIZE = 14;
const GRID_GAP = 13;
const GRID_COLUMNS = 2;
const CARD_RADIUS = 20;
const CARD_GLYPH_SIZE = 42;
const CARD_NAME_SIZE = 13;
const CARD_ROMANIZATION_SIZE = 12;
const AUDIO_BUTTON_SIZE = 32;
const AUDIO_ICON_SIZE = 14;
const CTA_HEIGHT = 56;
const CTA_RADIUS = 16;
const CTA_KOREAN_SIZE = 16;
const CTA_ENGLISH_SIZE = 14;
const CTA_ENGLISH_OPACITY = 0.65;

/**
 * Parses the `[id]` route param into a lesson. Returns undefined when the
 * param is missing, not a plain integer, or matches no LESSONS entry.
 */
function findLessonByIdParam(idParam: string | undefined): Lesson | undefined {
  if (idParam === undefined || !/^\d+$/.test(idParam)) {
    return undefined;
  }
  const id = Number.parseInt(idParam, 10);
  return LESSONS.find((lesson) => lesson.id === id);
}

/** Looks up the full Jamo objects for a lesson's characters, in lesson order. */
function getLessonJamo(lesson: Lesson): readonly Jamo[] {
  return lesson.chars
    .map((char) => ALL_JAMO.find((jamo) => jamo.char === char))
    .filter((jamo): jamo is Jamo => jamo !== undefined);
}

interface LessonCharCardProps {
  readonly jamo: Jamo;
  readonly width: number;
  readonly isDark: boolean;
  readonly onPress: (jamo: Jamo) => void;
  readonly onPlayAudio: (audioFile: string) => void;
}

/** Rich lesson card: glyph, Korean name, romanization, and audio button. */
function LessonCharCard({
  jamo,
  width,
  isDark,
  onPress,
  onPlayAudio,
}: LessonCharCardProps): React.JSX.Element {
  const textColor = isDark ? COLORS.darkText : COLORS.lightText;
  return (
    <Pressable
      onPress={() => onPress(jamo)}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightSurface,
          borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${jamo.koreanName}, romanized ${jamo.romanization}`}
    >
      <Text style={[styles.cardGlyph, { color: textColor }]}>{jamo.char}</Text>
      <Text style={[styles.cardName, { color: textColor }]}>
        {jamo.koreanName}
      </Text>
      <Text
        style={[
          styles.cardRomanization,
          { color: isDark ? COLORS.darkMutedText : COLORS.mutedText },
        ]}
      >
        {jamo.romanization}
      </Text>
      <Pressable
        onPress={() => onPlayAudio(jamo.audioFile)}
        style={({ pressed }) => [
          styles.audioButton,
          {
            backgroundColor: isDark ? COLORS.darkChipBlueBg : COLORS.chipBlueBg,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Play pronunciation of ${jamo.koreanName}`}
      >
        <Text
          style={[
            styles.audioIcon,
            { color: isDark ? COLORS.darkBlue : COLORS.primaryBlue },
          ]}
        >
          🔊
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function LessonDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  const progress = useProgressStore((s) => s.progress);
  const { playSound } = useAudio();

  const [selectedJamo, setSelectedJamo] = useState<Jamo | null>(null);

  const lesson = useMemo(() => findLessonByIdParam(id), [id]);
  const unlockedLessonIds = useMemo(
    () => getUnlockedLessonIds(progress),
    [progress],
  );
  const lessonJamo = useMemo(
    () => (lesson === undefined ? [] : getLessonJamo(lesson)),
    [lesson],
  );

  const handleCardPress = useCallback((jamo: Jamo) => {
    setSelectedJamo(jamo);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedJamo(null);
  }, []);

  const handlePracticePress = useCallback(() => {
    router.navigate('/quiz');
  }, [router]);

  // Invalid deep link (bad id) or locked lesson — back to the Study tab.
  if (lesson === undefined || !unlockedLessonIds.includes(lesson.id)) {
    return <Redirect href="/" />;
  }

  const isComplete = isLessonComplete(lesson, progress);
  const correctCount = countCorrectChars(lesson, progress);
  const cardWidth =
    (windowWidth - 2 * SCREEN_PADDING - (GRID_COLUMNS - 1) * GRID_GAP) /
    GRID_COLUMNS;
  const completeAccent = isDark ? COLORS.darkTeal : COLORS.teal;
  const progressAccent = isDark ? COLORS.darkBlue : COLORS.primaryBlue;
  const statusAccentColor = isComplete ? completeAccent : progressAccent;
  const statusText = isComplete
    ? '✓ 완료'
    : `${correctCount} / ${lesson.chars.length} 정답`;
  const ctaTextColor = isDark ? COLORS.darkBackground : COLORS.lightBackground;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground },
      ]}
    >
      <Stack.Screen options={{ title: `Lesson ${lesson.id}` }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            { color: isDark ? COLORS.darkText : COLORS.lightText },
          ]}
        >
          {lesson.koreanTitle}
        </Text>

        <Text
          style={styles.statusLine}
          accessibilityLabel={
            isComplete
              ? `Lesson ${lesson.id} completed`
              : `${correctCount} of ${lesson.chars.length} characters correct`
          }
        >
          <Text style={[styles.statusCount, { color: statusAccentColor }]}>
            {statusText}
          </Text>
          <Text
            style={[
              styles.statusSuffix,
              { color: isDark ? COLORS.darkMutedText : COLORS.mutedText },
            ]}
          >
            {` · ${lesson.chars.length}자`}
          </Text>
        </Text>

        <View style={styles.grid}>
          {lessonJamo.map((jamo) => (
            <LessonCharCard
              key={jamo.char}
              jamo={jamo}
              width={cardWidth}
              isDark={isDark}
              onPress={handleCardPress}
              onPlayAudio={playSound}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: isDark ? COLORS.darkBorder : COLORS.lightBorder },
        ]}
      >
        <Pressable
          onPress={handlePracticePress}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: progressAccent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Practice all unlocked characters in quiz"
        >
          <Text style={[styles.ctaKorean, { color: ctaTextColor }]}>
            퀴즈로 연습하기
          </Text>
          <Text style={[styles.ctaEnglish, { color: ctaTextColor }]}>
            {' Practice'}
          </Text>
        </Pressable>
      </View>

      <JamoDetailPanel jamo={selectedJamo} onClose={handleCloseDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: TITLE_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '900',
    lineHeight: TITLE_SIZE + 10,
  },
  statusLine: {
    marginTop: 4,
  },
  statusCount: {
    fontSize: STATUS_TEXT_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
    lineHeight: STATUS_TEXT_SIZE + 8,
  },
  statusSuffix: {
    fontSize: STATUS_TEXT_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: STATUS_TEXT_SIZE + 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginTop: 16,
  },
  card: {
    alignItems: 'center',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  cardGlyph: {
    fontSize: CARD_GLYPH_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '500',
    lineHeight: CARD_GLYPH_SIZE + 12,
  },
  cardName: {
    fontSize: CARD_NAME_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
    lineHeight: CARD_NAME_SIZE + 6,
    marginTop: 2,
  },
  cardRomanization: {
    fontSize: CARD_ROMANIZATION_SIZE,
    marginTop: 1,
  },
  audioButton: {
    width: AUDIO_BUTTON_SIZE,
    height: AUDIO_BUTTON_SIZE,
    borderRadius: AUDIO_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  audioIcon: {
    fontSize: AUDIO_ICON_SIZE,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  ctaButton: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: CTA_HEIGHT,
    borderRadius: CTA_RADIUS,
  },
  ctaKorean: {
    fontSize: CTA_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
    lineHeight: CTA_KOREAN_SIZE + 8,
  },
  ctaEnglish: {
    fontSize: CTA_ENGLISH_SIZE,
    opacity: CTA_ENGLISH_OPACITY,
  },
});
