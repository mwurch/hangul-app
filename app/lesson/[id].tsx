import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { type Jamo, ALL_JAMO } from '../../src/data/jamo';
import { type Lesson, LESSONS } from '../../src/data/lessons';
import { useProgressStore } from '../../src/store/progress.store';
import {
  countCorrectChars,
  getUnlockedLessonIds,
  isLessonComplete,
} from '../../src/utils/lessonProgress';
import { CharCard } from '../../src/components/CharCard';
import { JamoDetailPanel } from '../../src/components/JamoDetailPanel';

const KOREAN_FONT = 'NotoSansKR-Regular';
const STATUS_TEXT_SIZE = 16;
const CTA_KOREAN_SIZE = 28;
const CTA_ENGLISH_SIZE = 13;

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

export default function LessonDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';
  const getProgress = useProgressStore((s) => s.getProgress);
  const progress = useProgressStore((s) => s.progress);

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
  const statusText = isComplete
    ? '✓ 완료'
    : `${correctCount}/${lesson.chars.length} correct`;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground },
      ]}
    >
      <Stack.Screen
        options={{ title: `Lesson ${lesson.id} · ${lesson.koreanTitle}` }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.statusLine,
            isComplete ? styles.statusComplete : styles.statusInProgress,
          ]}
          accessibilityLabel={
            isComplete
              ? `Lesson ${lesson.id} completed`
              : `${correctCount} of ${lesson.chars.length} characters correct`
          }
        >
          {statusText}
        </Text>

        <View style={styles.grid}>
          {lessonJamo.map((jamo) => (
            <CharCard
              key={jamo.char}
              jamo={jamo}
              hasProgress={getProgress(jamo.char) !== undefined}
              onPress={handleCardPress}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handlePracticePress}
          style={({ pressed }) => [
            styles.ctaButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Practice all unlocked characters in quiz"
        >
          <Text style={styles.ctaKorean}>퀴즈로 연습하기</Text>
          <Text style={styles.ctaEnglish}>Practice in Quiz</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  statusLine: {
    fontSize: STATUS_TEXT_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '600',
    lineHeight: STATUS_TEXT_SIZE + 8,
    textAlign: 'center',
  },
  statusComplete: {
    color: COLORS.teal,
  },
  statusInProgress: {
    color: COLORS.mutedText,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  ctaButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
  },
  ctaKorean: {
    fontSize: CTA_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: CTA_KOREAN_SIZE + 10,
    color: COLORS.lightBackground,
  },
  ctaEnglish: {
    fontSize: CTA_ENGLISH_SIZE,
    color: COLORS.lightBackground,
    marginTop: 2,
  },
});
