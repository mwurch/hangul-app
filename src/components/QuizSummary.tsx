import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { COLORS } from '../theme/colors';

interface QuizSummaryProps {
  readonly score: number;
  readonly totalQuestions: number;
  readonly onRetry: () => void;
  readonly onDone: () => void;
}

interface Encouragement {
  readonly korean: string;
  readonly english: string;
}

const KOREAN_FONT = 'NotoSansKR-Regular';
const SCORE_TEXT_SIZE = 56;
const PERCENT_TEXT_SIZE = 20;
const MESSAGE_KOREAN_SIZE = 28;
const MESSAGE_ENGLISH_SIZE = 15;
const BUTTON_KOREAN_SIZE = 28;
const BUTTON_ENGLISH_SIZE = 13;

const PERCENT_MAX = 100;
const EXCELLENT_PERCENT = 90;
const GOOD_PERCENT = 70;
const FAIR_PERCENT = 50;

function toPercent(score: number, totalQuestions: number): number {
  if (totalQuestions <= 0) {
    return 0;
  }
  return Math.round((score / totalQuestions) * PERCENT_MAX);
}

function getEncouragement(percent: number): Encouragement {
  if (percent >= EXCELLENT_PERCENT) {
    return { korean: '완벽해요!', english: 'Outstanding!' };
  }
  if (percent >= GOOD_PERCENT) {
    return { korean: '잘했어요!', english: 'Great job!' };
  }
  if (percent >= FAIR_PERCENT) {
    return { korean: '좋아요!', english: 'Good effort — keep going!' };
  }
  return { korean: '다시 도전해요!', english: 'Keep practicing!' };
}

export function QuizSummary({
  score,
  totalQuestions,
  onRetry,
  onDone,
}: QuizSummaryProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const percent = toPercent(score, totalQuestions);
  const encouragement = getEncouragement(percent);
  const isGoodScore = percent >= GOOD_PERCENT;

  const baseTextColor = isDark ? COLORS.darkText : COLORS.lightText;
  const messageColor = isGoodScore ? COLORS.teal : baseTextColor;

  return (
    <View style={styles.container}>
      <Text
        testID="quiz-summary-score"
        style={[
          styles.score,
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
        ]}
        accessibilityLabel={`Score: ${score} out of ${totalQuestions}`}
      >
        {`${score} / ${totalQuestions}`}
      </Text>

      <Text
        testID="quiz-summary-percent"
        style={[styles.percent, { color: COLORS.mutedText }]}
        accessibilityLabel={`${percent} percent correct`}
      >
        {`${percent}%`}
      </Text>

      <Text
        testID="quiz-summary-message"
        style={[styles.messageKorean, { color: messageColor }]}
      >
        {encouragement.korean}
      </Text>
      <Text style={[styles.messageEnglish, { color: messageColor }]}>
        {encouragement.english}
      </Text>

      <View style={styles.buttonColumn}>
        <Pressable
          testID="quiz-summary-retry"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            styles.retryButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Try again with a new quiz"
        >
          <Text style={[styles.buttonKorean, styles.retryText]}>다시 하기</Text>
          <Text style={[styles.buttonEnglish, styles.retryText]}>Try again</Text>
        </Pressable>

        <Pressable
          testID="quiz-summary-done"
          onPress={onDone}
          style={({ pressed }) => [
            styles.button,
            styles.doneButton,
            {
              borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Finish quiz and return to start"
        >
          <Text style={[styles.buttonKorean, { color: baseTextColor }]}>
            끝내기
          </Text>
          <Text style={[styles.buttonEnglish, { color: COLORS.mutedText }]}>
            Done
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  score: {
    fontSize: SCORE_TEXT_SIZE,
    fontWeight: '700',
  },
  percent: {
    fontSize: PERCENT_TEXT_SIZE,
    marginTop: 4,
  },
  messageKorean: {
    fontSize: MESSAGE_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: MESSAGE_KOREAN_SIZE + 12,
    marginTop: 24,
  },
  messageEnglish: {
    fontSize: MESSAGE_ENGLISH_SIZE,
    marginTop: 4,
  },
  buttonColumn: {
    alignSelf: 'stretch',
    marginTop: 40,
    gap: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
  },
  retryButton: {
    backgroundColor: COLORS.primaryBlue,
  },
  retryText: {
    color: COLORS.lightBackground,
  },
  doneButton: {
    borderWidth: 1,
  },
  buttonKorean: {
    fontSize: BUTTON_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: BUTTON_KOREAN_SIZE + 10,
  },
  buttonEnglish: {
    fontSize: BUTTON_ENGLISH_SIZE,
    marginTop: 2,
  },
});
