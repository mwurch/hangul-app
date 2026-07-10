import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../src/theme/colors';
import { ALL_JAMO } from '../../src/data/jamo';
import { type Lesson, LESSONS } from '../../src/data/lessons';
import { QuizCard } from '../../src/components/QuizCard';
import { QuizSummary } from '../../src/components/QuizSummary';
import { useQuizStore, type QuizQuestion } from '../../src/store/quiz.store';
import { useProgressStore } from '../../src/store/progress.store';
import {
  getUnlockedChars,
  getUnlockedLessonIds,
} from '../../src/utils/lessonProgress';
import {
  LESSON_QUIZ_LENGTH,
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

/**
 * Resolves the optional `lesson` route param into a lesson-scoped quiz.
 * Returns undefined (global quiz over all unlocked chars) when the param
 * is missing, malformed, or names a lesson that is not unlocked yet.
 */
function resolveScopedLesson(
  lessonParam: string | undefined,
  unlockedLessonIds: readonly number[],
): Lesson | undefined {
  if (lessonParam === undefined || !/^\d+$/.test(lessonParam)) {
    return undefined;
  }
  const id = Number.parseInt(lessonParam, 10);
  if (!unlockedLessonIds.includes(id)) {
    return undefined;
  }
  return LESSONS.find((lesson) => lesson.id === id);
}

interface StartViewProps {
  readonly isDark: boolean;
  readonly scopeLabel: string;
  readonly poolSize: number;
  readonly questionCount: number;
  readonly onStart: () => void;
}

function StartView({
  isDark,
  scopeLabel,
  poolSize,
  questionCount,
  onStart,
}: StartViewProps): React.JSX.Element {
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
        {`${scopeLabel} · ${poolSize} characters · ${questionCount} questions`}
      </Text>
      <Pressable
        testID="quiz-start-button"
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Start quiz with ${questionCount} questions`}
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
  const { lesson: lessonParam } = useLocalSearchParams<{ lesson?: string }>();
  const router = useRouter();

  const questions = useQuizStore((state) => state.questions);
  const currentIndex = useQuizStore((state) => state.currentIndex);
  const isComplete = useQuizStore((state) => state.isComplete);
  const score = useQuizStore((state) => state.score);
  const startQuiz = useQuizStore((state) => state.startQuiz);
  const answerQuestion = useQuizStore((state) => state.answerQuestion);
  const nextQuestion = useQuizStore((state) => state.nextQuestion);
  const resetQuiz = useQuizStore((state) => state.resetQuiz);
  const updateProgress = useProgressStore((state) => state.updateProgress);
  const progress = useProgressStore((state) => state.progress);

  const unlockedChars = useMemo(() => getUnlockedChars(progress), [progress]);
  const unlockedLessonIds = useMemo(
    () => getUnlockedLessonIds(progress),
    [progress],
  );
  const scopedLesson = useMemo(
    () => resolveScopedLesson(lessonParam, unlockedLessonIds),
    [lessonParam, unlockedLessonIds],
  );
  const quizPool = useMemo(() => {
    if (scopedLesson !== undefined) {
      return ALL_JAMO.filter((j) => scopedLesson.chars.includes(j.char));
    }
    return ALL_JAMO.filter((j) => unlockedChars.has(j.char));
  }, [scopedLesson, unlockedChars]);
  const quizLength =
    scopedLesson === undefined ? QUIZ_LENGTH : LESSON_QUIZ_LENGTH;
  const scopeLabel =
    scopedLesson === undefined ? 'All unlocked' : `Lesson ${scopedLesson.id}`;

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Arriving from a lesson's practice CTA discards any half-finished global
  // quiz so the start screen reflects the requested lesson scope.
  const scopedLessonId = scopedLesson?.id;
  useEffect(() => {
    if (scopedLessonId !== undefined) {
      setSelectedAnswer(null);
      resetQuiz();
    }
  }, [scopedLessonId, resetQuiz]);

  const handleStart = useCallback((): void => {
    setSelectedAnswer(null);
    startQuiz(generateQuizQuestions(quizPool, quizLength));
  }, [startQuiz, quizPool, quizLength]);

  const handleDone = useCallback((): void => {
    setSelectedAnswer(null);
    resetQuiz();
    if (scopedLessonId !== undefined) {
      // Drop the lesson scope so the tab returns to the global quiz next time.
      router.setParams({ lesson: '' });
    }
  }, [resetQuiz, scopedLessonId, router]);

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
        <StartView
          isDark={isDark}
          scopeLabel={scopeLabel}
          poolSize={quizPool.length}
          questionCount={quizLength}
          onStart={handleStart}
        />
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
