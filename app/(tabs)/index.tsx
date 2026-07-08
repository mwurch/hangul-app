import { useCallback, useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { ALL_JAMO } from '../../src/data/jamo';
import { LESSONS, type Lesson } from '../../src/data/lessons';
import { useProgressStore } from '../../src/store/progress.store';
import {
  getCurrentLesson,
  getLessonStatuses,
  getUnlockedChars,
  type LessonStatus,
} from '../../src/utils/lessonProgress';
import { LessonNode } from '../../src/components/LessonNode';

const PRESSED_OPACITY = 0.7;

function showLockedAlert(lesson: Lesson): void {
  const previousLesson = LESSONS.find(
    (candidate) => candidate.id === lesson.id - 1,
  );
  if (previousLesson === undefined) {
    return;
  }
  Alert.alert(
    '🔒 잠김',
    `Lesson ${previousLesson.id} (${previousLesson.koreanTitle})을 완료하면 열려요\nComplete Lesson ${previousLesson.id} to unlock`,
  );
}

export default function StudyScreen(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const progress = useProgressStore((s) => s.progress);

  const lessonStatuses = useMemo(() => getLessonStatuses(progress), [progress]);
  const unlockedChars = useMemo(() => getUnlockedChars(progress), [progress]);
  const currentLesson = useMemo(() => getCurrentLesson(progress), [progress]);

  const handleLessonPress = useCallback(
    (lesson: Lesson, status: LessonStatus) => {
      if (status.kind === 'locked') {
        showLockedAlert(lesson);
        return;
      }
      router.push(`/lesson/${lesson.id}`);
    },
    [],
  );

  const handleAllCharactersPress = useCallback(() => {
    router.push('/all-characters');
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.darkBackground : COLORS.lightBackground,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
            ]}
            accessibilityRole="header"
          >
            자모 학습
          </Text>
          <Pressable
            onPress={handleAllCharactersPress}
            accessibilityRole="button"
            accessibilityLabel="All characters"
            style={({ pressed }) => [
              styles.allCharactersPill,
              {
                borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
                opacity: pressed ? PRESSED_OPACITY : 1,
              },
            ]}
          >
            <Text style={[styles.allCharactersLabel, { color: COLORS.mutedText }]}>
              전체 보기
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: COLORS.mutedText }]}>
          {`Lesson ${currentLesson.id} · ${unlockedChars.size}/${ALL_JAMO.length} unlocked`}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.path}
        showsVerticalScrollIndicator={false}
      >
        {lessonStatuses.map(({ lesson, status }, index) => (
          <LessonNode
            key={lesson.id}
            lesson={lesson}
            status={status}
            isCurrent={
              lesson.id === currentLesson.id && status.kind === 'unlocked'
            }
            showConnector={index > 0}
            onPress={() => handleLessonPress(lesson, status)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'NotoSansKR-Regular',
  },
  allCharactersPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allCharactersLabel: {
    fontSize: 15,
    fontFamily: 'NotoSansKR-Regular',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  path: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
});
