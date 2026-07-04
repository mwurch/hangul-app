import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/theme/colors';
import { ALL_JAMO } from '../../src/data/jamo';
import { QuizCard } from '../../src/components/QuizCard';
import { QuizSummary } from '../../src/components/QuizSummary';
import { useQuizStore, type QuizQuestion } from '../../src/store/quiz.store';
import { useProgressStore } from '../../src/store/progress.store';
import {
  QUIZ_LENGTH,
  generateQuizQuestions,
} from '../../src/utils/quizGenerator';
import { hapticCorrect, hapticWrong } from '../../src/utils/haptics';

/** How long the green/red answer feedback stays visible before advancing. */
const FEEDBACK_DELAY_MS = 900;

const KOREAN_FONT = 'NotoSansKR-Regular';
const TITLE_TEXT_SIZE = 40;
const SUBTITLE_TEXT_SIZE = 15;
const START_KOREAN_SIZE = 28;
const START_ENGLISH_SIZE = 13;

/**
 * The prompt shown on the card: the glyph for charToRoman questions,
 * the romanization of the jamo for romanToChar questions.
 */
function getPromptForQuestion(question: QuizQuestion): string {
  if (question.type === 'charToRoman') {
    return question.char;
  }
  const jamo = ALL_JAMO.find((entry) => entry.char === question.char);
  return jamo?.romanization ?? question.char;
}

interface StartViewProps {
  readonly isDark: boolean;
  readonly onStart: () => void;
}

function StartView({ isDark, onStart }: StartViewProps): React.JSX.Element {
  return (
    <View style={styles.startContainer}>
      <Text
        style={[
          styles.title,
          { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
        ]}
        accessibilityRole="header"
      >
        퀴즈
      </Text>
      <Text style={[styles.subtitle, { color: COLORS.mutedText }]}>
        {`${QUIZ_LENGTH} questions · multiple choice`}
      </Text>
      <Pressable
        testID="quiz-start-button"
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Start quiz with ${QUIZ_LENGTH} questions`}
      >
        <Text style={styles.startKorean}>시작하기</Text>
        <Text style={styles.startEnglish}>Start</Text>
      </Pressable>
    </View>
  );
}

export default function QuizScreen(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const questions = useQuizStore((state) => state.questions);
  const currentIndex = useQuizStore((state) => state.currentIndex);
  const isComplete = useQuizStore((state) => state.isComplete);
  const score = useQuizStore((state) => state.score);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const answerQuestion = useQuizStore((state) => state.answerQuestion);
  const nextQuestion = useQuizStore((state) => state.nextQuestion);
  const resetQuiz = useQuizStore((state) => state.resetQuiz);
  const updateProgress = useProgressStore((state) => state.updateProgress);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handleStart = useCallback((): void => {
    setSelectedAnswer(null);
    startQuiz(generateQuizQuestions(ALL_JAMO, QUIZ_LENGTH));
  }, [startQuiz]);

  const handleDone = useCallback((): void => {
    setSelectedAnswer(null);
    resetQuiz();
  }, [resetQuiz]);

  const currentQuestion = questions[currentIndex];

  const handleSelect = useCallback(
    (answer: string): void => {
      if (selectedAnswer !== null || currentQuestion === undefined) {
        return;
      }
      setSelectedAnswer(answer);
      answerQuestion(answer);
      const isCorrect = answer === currentQuestion.correctAnswer;
      updateProgress(currentQuestion.char, isCorrect);
      if (isCorrect) {
        hapticCorrect();
      } else {
        hapticWrong();
      }
      AccessibilityInfo.announceForAccessibility(
        isCorrect
          ? 'Correct'
          : `Incorrect. The correct answer is ${currentQuestion.correctAnswer}`,
      );
      feedbackTimerRef.current = setTimeout(() => {
        feedbackTimerRef.current = null;
        setSelectedAnswer(null);
        nextQuestion();
      }, FEEDBACK_DELAY_MS);
    },
    [selectedAnswer, currentQuestion, answerQuestion, updateProgress, nextQuestion],
  );
  const isShowingFeedback = selectedAnswer !== null;
  const isSummaryVisible = isComplete && !isShowingFeedback;
  const isQuestionVisible = !isSummaryVisible && currentQuestion !== undefined;

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
      {isQuestionVisible ? (
        <QuizCard
          question={currentQuestion}
          prompt={getPromptForQuestion(currentQuestion)}
          selectedAnswer={selectedAnswer}
          onSelect={handleSelect}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
        />
      ) : isSummaryVisible ? (
        <QuizSummary
          score={score}
          totalQuestions={questions.length}
          onRetry={handleStart}
          onDone={handleDone}
        />
      ) : (
        <StartView isDark={isDark} onStart={handleStart} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  startContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: TITLE_TEXT_SIZE,
    fontFamily: KOREAN_FONT,
    fontWeight: '700',
    lineHeight: TITLE_TEXT_SIZE + 14,
  },
  subtitle: {
    fontSize: SUBTITLE_TEXT_SIZE,
    marginTop: 8,
  },
  startButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 40,
  },
  startKorean: {
    fontSize: START_KOREAN_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: START_KOREAN_SIZE + 10,
    color: COLORS.lightBackground,
  },
  startEnglish: {
    fontSize: START_ENGLISH_SIZE,
    color: COLORS.lightBackground,
    marginTop: 2,
  },
});
