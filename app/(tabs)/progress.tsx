import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/theme/colors';
import { ProgressRing } from '../../src/components/ProgressRing';
import { CONSONANTS, VOWELS, ALL_JAMO, type Jamo } from '../../src/data/jamo';
import type { Lesson } from '../../src/data/lessons';
import { useProgressStore } from '../../src/store/progress.store';
import { countLearned, getReviewQueue } from '../../src/utils/progressStats';
import {
  describeLessonForAccessibility,
  getLessonStatuses,
} from '../../src/utils/lessonProgress';
import type {
  LessonStatus,
  LessonWithStatus,
} from '../../src/utils/lessonProgress';

const MAX_VISIBLE_REVIEW_ROWS = 10;
const REVIEW_GLYPH_SIZE = 28;
const LESSON_CHARS_GLYPH_SIZE = 16;
const LESSON_CHAR_SEPARATOR = ' ';
const STREAK_UNIT = '일';
const CONSONANT_CHARS: readonly string[] = CONSONANTS.map((jamo) => jamo.char);
const VOWEL_CHARS: readonly string[] = VOWELS.map((jamo) => jamo.char);

interface StreakCardProps {
  readonly streak: number;
  readonly isDark: boolean;
}

function StreakCard({ streak, isDark }: StreakCardProps): React.JSX.Element {
  const hasStreak = streak > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightBackground,
          borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
        },
      ]}
      accessible
      accessibilityLabel={
        hasStreak
          ? `Study streak: ${streak} days`
          : 'No study streak yet. Take a quiz to start one.'
      }
    >
      <View style={styles.streakRow}>
        <Text style={styles.streakFlame} accessibilityElementsHidden>
          🔥
        </Text>
        <View style={styles.streakTextColumn}>
          <Text
            style={[
              styles.streakTitle,
              { color: isDark ? COLORS.darkText : COLORS.lightText },
            ]}
          >
            연속 학습
          </Text>
          {hasStreak ? (
            <Text style={[styles.streakCount, { color: COLORS.teal }]}>
              {`${streak}${STREAK_UNIT}`}
            </Text>
          ) : (
            <Text style={[styles.streakEmpty, { color: COLORS.mutedText }]}>
              퀴즈를 풀고 연속 학습을 시작해 보세요!
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

interface ReviewRowProps {
  readonly jamo: Jamo;
  readonly isDark: boolean;
}

function ReviewRow({ jamo, isDark }: ReviewRowProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.reviewRow,
        { borderBottomColor: isDark ? COLORS.darkBorder : COLORS.lightBorder },
      ]}
      accessible
      accessibilityLabel={`Review ${jamo.koreanName}, ${jamo.romanization}`}
    >
      <Text
        style={[
          styles.reviewGlyph,
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
        ]}
      >
        {jamo.char}
      </Text>
      <View style={styles.reviewTextColumn}>
        <Text
          style={[
            styles.reviewName,
            { color: isDark ? COLORS.darkText : COLORS.lightText },
          ]}
        >
          {jamo.koreanName}
        </Text>
        <Text style={[styles.reviewRomanization, { color: COLORS.mutedText }]}>
          {jamo.romanization}
        </Text>
      </View>
    </View>
  );
}

interface ReviewQueueSectionProps {
  readonly queue: readonly Jamo[];
  readonly isDark: boolean;
}

function ReviewQueueSection({ queue, isDark }: ReviewQueueSectionProps): React.JSX.Element {
  const visibleQueue = queue.slice(0, MAX_VISIBLE_REVIEW_ROWS);
  const hiddenCount = queue.length - visibleQueue.length;

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
        accessibilityRole="header"
      >
        복습 대기열
      </Text>
      <Text style={[styles.sectionSubtitle, { color: COLORS.mutedText }]}>
        Review queue
      </Text>
      {queue.length === 0 ? (
        <Text
          style={[styles.emptyQueueText, { color: COLORS.mutedText }]}
          accessibilityLabel="Nothing to review right now"
        >
          지금은 복습할 것이 없어요 🎉
        </Text>
      ) : (
        <View>
          {visibleQueue.map((jamo) => (
            <ReviewRow key={jamo.char} jamo={jamo} isDark={isDark} />
          ))}
          {hiddenCount > 0 && (
            <Text style={[styles.moreText, { color: COLORS.mutedText }]}>
              {`+${hiddenCount} more`}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

interface LessonStatusBadgeProps {
  readonly status: LessonStatus;
  readonly total: number;
  readonly isDark: boolean;
}

function LessonStatusBadge({ status, total, isDark }: LessonStatusBadgeProps): React.JSX.Element {
  if (status.kind === 'complete') {
    return <Text style={[styles.lessonStatus, { color: COLORS.teal }]}>✓ 완료</Text>;
  }
  if (status.kind === 'unlocked') {
    return (
      <Text
        style={[
          styles.lessonStatus,
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
        ]}
      >
        {`${status.correctChars}/${total}`}
      </Text>
    );
  }
  return <Text style={[styles.lessonStatus, { color: COLORS.mutedText }]}>🔒</Text>;
}

interface LessonRowProps {
  readonly lesson: Lesson;
  readonly status: LessonStatus;
  readonly isDark: boolean;
}

function LessonRow({ lesson, status, isDark }: LessonRowProps): React.JSX.Element {
  const isLocked = status.kind === 'locked';
  const activeColor = isDark ? COLORS.darkText : COLORS.lightText;
  const labelColor = isLocked ? COLORS.mutedText : activeColor;

  return (
    <View
      style={[
        styles.lessonRow,
        { borderBottomColor: isDark ? COLORS.darkBorder : COLORS.lightBorder },
      ]}
      accessible
      accessibilityLabel={describeLessonForAccessibility(lesson, status)}
    >
      <View style={styles.lessonTextColumn}>
        <Text style={[styles.lessonLabel, { color: labelColor }]}>
          {`Lesson ${lesson.id} · ${lesson.koreanTitle}`}
        </Text>
        <Text style={[styles.lessonChars, { color: labelColor }]}>
          {lesson.chars.join(LESSON_CHAR_SEPARATOR)}
        </Text>
      </View>
      <LessonStatusBadge status={status} total={lesson.chars.length} isDark={isDark} />
    </View>
  );
}

interface LessonsSectionProps {
  readonly lessons: readonly LessonWithStatus[];
  readonly isDark: boolean;
}

function LessonsSection({ lessons, isDark }: LessonsSectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
        accessibilityRole="header"
      >
        레슨
      </Text>
      <Text style={[styles.sectionSubtitle, { color: COLORS.mutedText }]}>
        Lessons
      </Text>
      {lessons.map(({ lesson, status }) => (
        <LessonRow key={lesson.id} lesson={lesson} status={status} isDark={isDark} />
      ))}
    </View>
  );
}

export default function ProgressScreen(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const progress = useProgressStore((state) => state.progress);
  const streak = useProgressStore((state) => state.streak);

  // Refreshed on tab focus so newly due items appear even when no
  // progress change has re-rendered the screen in the meantime.
  const [reviewTimestamp, setReviewTimestamp] = useState<number>(() => Date.now());

  useFocusEffect(
    useCallback(() => {
      setReviewTimestamp(Date.now());
    }, []),
  );

  const consonantsLearned = countLearned(progress, CONSONANT_CHARS);
  const vowelsLearned = countLearned(progress, VOWEL_CHARS);
  const reviewQueue = useMemo(
    () => getReviewQueue(progress, ALL_JAMO, reviewTimestamp),
    [progress, reviewTimestamp],
  );
  const lessonStatuses = useMemo(() => getLessonStatuses(progress), [progress]);

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
        진행
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
      >
        Progress
      </Text>

      <StreakCard streak={streak} isDark={isDark} />

      <LessonsSection lessons={lessonStatuses} isDark={isDark} />

      <View style={styles.ringsRow}>
        <ProgressRing
          learned={consonantsLearned}
          total={CONSONANTS.length}
          label="자음"
        />
        <ProgressRing
          learned={vowelsLearned}
          total={VOWELS.length}
          label="모음"
        />
      </View>

      <ReviewQueueSection queue={reviewQueue} isDark={isDark} />
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
    marginBottom: 24,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakFlame: {
    fontSize: 32,
  },
  streakTextColumn: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '500',
  },
  streakCount: {
    fontSize: 24,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '700',
    marginTop: 2,
  },
  streakEmpty: {
    fontSize: 13,
    fontFamily: 'NotoSansKR-Regular',
    marginTop: 2,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 28,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: 2,
  },
  emptyQueueText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    textAlign: 'center',
    paddingVertical: 24,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reviewGlyph: {
    fontSize: REVIEW_GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    width: 44,
    textAlign: 'center',
  },
  reviewTextColumn: {
    flex: 1,
  },
  reviewName: {
    fontSize: 15,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '500',
  },
  reviewRomanization: {
    fontSize: 13,
    marginTop: 1,
  },
  moreText: {
    fontSize: 13,
    textAlign: 'center',
    paddingTop: 10,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lessonTextColumn: {
    flex: 1,
  },
  lessonLabel: {
    fontSize: 15,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '500',
  },
  lessonChars: {
    fontSize: LESSON_CHARS_GLYPH_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    marginTop: 2,
  },
  lessonStatus: {
    fontSize: 15,
    fontFamily: 'NotoSansKR-Regular',
    fontWeight: '700',
  },
});
