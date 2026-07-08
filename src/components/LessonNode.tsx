import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';
import type { Lesson } from '../data/lessons';
import {
  describeLessonForAccessibility,
  type LessonStatus,
} from '../utils/lessonProgress';

interface LessonNodeProps {
  readonly lesson: Lesson;
  readonly status: LessonStatus;
  readonly isCurrent: boolean;
  readonly showConnector: boolean;
  readonly onPress: (lesson: Lesson) => void;
}

const NODE_SIZE = 76;
const CONNECTOR_WIDTH = 2;
const CONNECTOR_HEIGHT = 24;
const UNLOCKED_BORDER_WIDTH = 3;
const CURRENT_BORDER_WIDTH = 4;
const CHECK_MARK_FONT_SIZE = 34;
const FRACTION_FONT_SIZE = 20;
const LOCK_FONT_SIZE = 24;
const LESSON_LABEL_FONT_SIZE = 12;
const KOREAN_TITLE_FONT_SIZE = 16;
const PRESSED_OPACITY = 0.7;
const LOCKED_CONTENT_OPACITY = 0.5;
const CONNECTOR_TEST_ID = 'lesson-node-connector';

type CircleStyleOverride = {
  readonly backgroundColor: string;
  readonly borderColor?: string;
  readonly borderWidth?: number;
};

function getCircleStyle(
  status: LessonStatus,
  isCurrent: boolean,
  isDark: boolean,
): CircleStyleOverride {
  if (status.kind === 'complete') {
    return { backgroundColor: COLORS.teal };
  }
  if (status.kind === 'unlocked') {
    return {
      backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightBackground,
      borderColor: COLORS.primaryBlue,
      borderWidth: isCurrent ? CURRENT_BORDER_WIDTH : UNLOCKED_BORDER_WIDTH,
    };
  }
  return {
    backgroundColor: isDark ? COLORS.darkSurface : COLORS.lightSurface,
  };
}

function getTitleColor(
  status: LessonStatus,
  isCurrent: boolean,
  isDark: boolean,
): string {
  if (status.kind === 'locked') {
    return COLORS.mutedText;
  }
  if (isCurrent) {
    return isDark ? COLORS.darkText : COLORS.primaryBlue;
  }
  return isDark ? COLORS.darkText : COLORS.lightText;
}

interface CircleContentProps {
  readonly lesson: Lesson;
  readonly status: LessonStatus;
  readonly isDark: boolean;
}

function CircleContent({
  lesson,
  status,
  isDark,
}: CircleContentProps): React.JSX.Element {
  if (status.kind === 'complete') {
    return <Text style={styles.checkMark}>✓</Text>;
  }
  if (status.kind === 'unlocked') {
    return (
      <Text
        style={[
          styles.fraction,
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
        ]}
      >
        {`${status.correctChars}/${lesson.chars.length}`}
      </Text>
    );
  }
  return (
    <Text style={styles.lock} accessibilityElementsHidden>
      🔒
    </Text>
  );
}

export function LessonNode({
  lesson,
  status,
  isCurrent,
  showConnector,
  onPress,
}: LessonNodeProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const isLocked = status.kind === 'locked';
  const connectorColor =
    status.kind === 'complete'
      ? COLORS.teal
      : isDark
        ? COLORS.darkBorder
        : COLORS.lightBorder;
  const titleColor = getTitleColor(status, isCurrent, isDark);

  return (
    <View style={styles.wrapper}>
      {showConnector && (
        <View
          testID={CONNECTOR_TEST_ID}
          style={[styles.connector, { backgroundColor: connectorColor }]}
        />
      )}
      <Pressable
        onPress={() => onPress(lesson)}
        accessibilityRole="button"
        accessibilityLabel={describeLessonForAccessibility(lesson, status)}
        accessibilityState={{ disabled: isLocked }}
        style={({ pressed }) => [
          styles.circle,
          getCircleStyle(status, isCurrent, isDark),
          { opacity: pressed ? PRESSED_OPACITY : 1 },
        ]}
      >
        <CircleContent lesson={lesson} status={status} isDark={isDark} />
      </Pressable>
      <Text style={[styles.lessonLabel, { color: titleColor }]}>
        {`Lesson ${lesson.id}`}
      </Text>
      <Text
        style={[
          styles.koreanTitle,
          { color: titleColor },
          isLocked && styles.lockedTitle,
        ]}
      >
        {lesson.koreanTitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  connector: {
    width: CONNECTOR_WIDTH,
    height: CONNECTOR_HEIGHT,
    marginBottom: 8,
  },
  circle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: CHECK_MARK_FONT_SIZE,
    fontWeight: '700',
    color: COLORS.lightBackground,
  },
  fraction: {
    fontSize: FRACTION_FONT_SIZE,
    fontWeight: '700',
  },
  lock: {
    fontSize: LOCK_FONT_SIZE,
    opacity: LOCKED_CONTENT_OPACITY,
  },
  lessonLabel: {
    fontSize: LESSON_LABEL_FONT_SIZE,
    marginTop: 8,
  },
  koreanTitle: {
    fontSize: KOREAN_TITLE_FONT_SIZE,
    fontFamily: 'NotoSansKR-Regular',
    marginTop: 2,
  },
  lockedTitle: {
    opacity: LOCKED_CONTENT_OPACITY,
  },
});
