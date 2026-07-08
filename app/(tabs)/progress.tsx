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

const KOREAN_FONT = 'NotoSansKR-Regular';
const MAX_VISIBLE_REVIEW_ROWS = 10;
const REVIEW_GLYPH_TILE_SIZE = 40;
const REVIEW_GLYPH_SIZE = 22;
const STREAK_SUFFIX = '일 연속';
const CONSONANT_CHARS: readonly string[] = CONSONANTS.map((jamo) => jamo.char);
const VOWEL_CHARS: readonly string[] = VOWELS.map((jamo) => jamo.char);

function blueAccent(isDark: boolean): string {
  return isDark ? COLORS.darkBlue : COLORS.primaryBlue;
}

function tealAccent(isDark: boolean): string {
  return isDark ? COLORS.darkTeal : COLORS.teal;
}

function mutedColor(isDark: boolean): string {
  return isDark ? COLORS.darkMutedText : COLORS.mutedText;
}

function surfaceColor(isDark: boolean): string {
  return isDark ? COLORS.darkSurface : COLORS.lightSurface;
}

interface SectionHeaderProps {
  readonly title: string;
  readonly isDark: boolean;
}

function SectionHeader({ title, isDark }: SectionHeaderProps): React.JSX.Element {
  return (
    <Text
      style={[styles.sectionHeader, { color: mutedColor(isDark) }]}
      accessibilityRole="header"
    >
      {title}
    </Text>
  );
}

interface StreakCardProps {
  readonly streak: number;
  readonly isDark: boolean;
}

function StreakCard({ streak, isDark }: StreakCardProps): React.JSX.Element {
  const hasStreak = streak > 0;

  return (
    <View
      style={[
        styles.streakCard,
        { backgroundColor: isDark ? COLORS.darkTealTintBg : COLORS.tealTintBg },
      ]}
      accessible
      accessibilityLabel={
        hasStreak
          ? `Study streak: ${streak} days`
          : 'No study streak yet. Take a quiz to start one.'
      }
    >
      <Text style={styles.streakFlame} accessibilityElementsHidden>
        🔥
      </Text>
      {hasStreak ? (
        <Text style={[styles.streakCount, { color: tealAccent(isDark) }]}>
          {`${streak}${STREAK_SUFFIX}`}
        </Text>
      ) : (
        <Text style={[styles.streakEmpty, { color: mutedColor(isDark) }]}>
          퀴즈를 풀고 연속 학습을 시작해 보세요!
        </Text>
      )}
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
      style={[styles.reviewCard, { backgroundColor: surfaceColor(isDark) }]}
      accessible
      accessibilityLabel={`Review ${jamo.koreanName}, ${jamo.romanization}`}
    >
      <View
        style={[
          styles.reviewGlyphTile,
          {
            backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground,
            borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.reviewGlyph,
            { color: isDark ? COLORS.darkText : COLORS.lightText },
          ]}
        >
          {jamo.char}
        </Text>
      </View>
      <View style={styles.reviewTextColumn}>
        <Text
          style={[
            styles.reviewName,
            { color: isDark ? COLORS.darkText : COLORS.lightText },
          ]}
        >
          {`${jamo.koreanName} · ${jamo.romanization}`}
        </Text>
        <Text style={[styles.reviewDue, { color: mutedColor(isDark) }]}>
          복습 지금
        </Text>
      </View>
      <View
        style={[
          styles.reviewChip,
          { backgroundColor: isDark ? COLORS.darkChipBlueBg : COLORS.chipBlueBg },
        ]}
      >
        <Text style={[styles.reviewChipText, { color: blueAccent(isDark) }]}>
          복습
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
      <SectionHeader title="복습 대기열 · Review" isDark={isDark} />
      {queue.length === 0 ? (
        <Text
          style={[styles.emptyQueueText, { color: mutedColor(isDark) }]}
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
            <Text style={[styles.moreText, { color: mutedColor(isDark) }]}>
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
    return (
      <Text style={[styles.lessonStatus, { color: tealAccent(isDark) }]}>
        ✓ 완료
      </Text>
    );
  }
  if (status.kind === 'unlocked') {
    return (
      <Text style={[styles.lessonStatus, { color: blueAccent(isDark) }]}>
        {`${status.correctChars} / ${total}`}
      </Text>
    );
  }
  return (
    <Text
      style={[
        styles.lessonStatus,
        { color: isDark ? COLORS.darkLockedText : COLORS.lockedText },
      ]}
    >
      잠김
    </Text>
  );
}

interface LessonRowProps {
  readonly lesson: Lesson;
  readonly status: LessonStatus;
  readonly isDark: boolean;
}

function LessonRow({ lesson, status, isDark }: LessonRowProps): React.JSX.Element {
  const isLocked = status.kind === 'locked';
  const activeColor = isDark ? COLORS.darkText : COLORS.lightText;
  const lockedColor = isDark ? COLORS.darkLockedText : COLORS.lockedText;
  const labelColor = isLocked ? lockedColor : activeColor;

  return (
    <View
      style={[
        styles.lessonRow,
        { borderBottomColor: isDark ? COLORS.darkBorder : COLORS.lightBorder },
      ]}
      accessible
      accessibilityLabel={describeLessonForAccessibility(lesson, status)}
    >
      <Text style={[styles.lessonLabel, { color: labelColor }]}>
        {`Lesson ${lesson.id} · ${lesson.koreanTitle}`}
      </Text>
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
      <SectionHeader title="레슨" isDark={isDark} />
      {lessons.map(({ lesson, status }) => (
        <LessonRow key={lesson.id} lesson={lesson} status={status} isDark={isDark} />
      ))}
    </View>
  );
}

interface RingCardsProps {
  readonly consonantsLearned: number;
  readonly vowelsLearned: number;
  readonly isDark: boolean;
}

function RingCards({ consonantsLearned, vowelsLearned, isDark }: RingCardsProps): React.JSX.Element {
  const cardStyle = [styles.ringCard, { backgroundColor: surfaceColor(isDark) }];

  return (
    <View style={styles.ringsRow}>
      <View style={cardStyle}>
        <ProgressRing
          learned={consonantsLearned}
          total={CONSONANTS.length}
          label="자음 · Consonants"
          color={blueAccent(isDark)}
        />
      </View>
      <View style={cardStyle}>
        <ProgressRing
          learned={vowelsLearned}
          total={VOWELS.length}
          label="모음 · Vowels"
          color={tealAccent(isDark)}
        />
      </View>
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
          { color: isDark ? COLORS.darkText : COLORS.lightText },
        ]}
        accessibilityRole="header"
      >
        진행 상황
      </Text>

      <StreakCard streak={streak} isDark={isDark} />

      <RingCards
        consonantsLearned={consonantsLearned}
        vowelsLearned={vowelsLearned}
        isDark={isDark}
      />

      <LessonsSection lessons={lessonStatuses} isDark={isDark} />

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
    fontSize: 24,
    fontFamily: KOREAN_FONT,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 16,
  },
  streakCard: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakFlame: {
    fontSize: 30,
  },
  streakCount: {
    fontSize: 22,
    fontFamily: KOREAN_FONT,
    fontWeight: '900',
  },
  streakEmpty: {
    fontSize: 13,
    fontFamily: KOREAN_FONT,
    flexShrink: 1,
  },
  ringsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  ringCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: KOREAN_FONT,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  emptyQueueText: {
    fontSize: 14,
    fontFamily: KOREAN_FONT,
    textAlign: 'center',
    paddingVertical: 24,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  reviewGlyphTile: {
    width: REVIEW_GLYPH_TILE_SIZE,
    height: REVIEW_GLYPH_TILE_SIZE,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewGlyph: {
    fontSize: REVIEW_GLYPH_SIZE,
    fontFamily: KOREAN_FONT,
  },
  reviewTextColumn: {
    flex: 1,
  },
  reviewName: {
    fontSize: 13,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
  },
  reviewDue: {
    fontSize: 12,
    fontFamily: KOREAN_FONT,
    marginTop: 1,
  },
  reviewChip: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  reviewChipText: {
    fontSize: 12,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
  },
  moreText: {
    fontSize: 13,
    textAlign: 'center',
    paddingTop: 6,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lessonLabel: {
    fontSize: 14,
    fontFamily: KOREAN_FONT,
    fontWeight: '500',
    flexShrink: 1,
  },
  lessonStatus: {
    fontSize: 13,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
  },
});
