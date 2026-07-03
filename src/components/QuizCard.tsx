import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { COLORS } from '../theme/colors';
import type { QuizQuestion } from '../store/quiz.store';

interface QuizCardProps {
  readonly question: QuizQuestion;
  readonly prompt: string;
  readonly selectedAnswer: string | null;
  readonly onSelect: (answer: string) => void;
  readonly questionNumber: number;
  readonly totalQuestions: number;
}

interface OptionButtonProps {
  readonly option: string;
  readonly isGlyph: boolean;
  readonly isAnswered: boolean;
  readonly isSelected: boolean;
  readonly isCorrectOption: boolean;
  readonly isDark: boolean;
  readonly scale: Animated.Value;
  readonly onSelect: (answer: string) => void;
}

const PROMPT_GLYPH_SIZE = 72;
const OPTION_GLYPH_SIZE = 28;
const OPTION_TEXT_SIZE = 24;
const PROGRESS_LABEL_SIZE = 15;
const PULSE_SCALE = 1.08;
const PULSE_DURATION_MS = 120;
const KOREAN_FONT = 'NotoSansKR-Regular';

function getOptionBackground(
  showCorrect: boolean,
  showWrong: boolean,
  isDark: boolean,
): string {
  if (showCorrect) {
    return COLORS.correctGreen;
  }
  if (showWrong) {
    return COLORS.wrongRed;
  }
  return isDark ? COLORS.darkSurface : COLORS.lightBackground;
}

function OptionButton({
  option,
  isGlyph,
  isAnswered,
  isSelected,
  isCorrectOption,
  isDark,
  scale,
  onSelect,
}: OptionButtonProps): React.JSX.Element {
  const showCorrect = isAnswered && isCorrectOption;
  const showWrong = isAnswered && isSelected && !isCorrectOption;
  const isHighlighted = showCorrect || showWrong;

  const backgroundColor = getOptionBackground(showCorrect, showWrong, isDark);
  const textColor = isHighlighted
    ? COLORS.lightBackground
    : isDark
      ? COLORS.darkText
      : COLORS.primaryBlue;

  return (
    <Animated.View
      style={[styles.optionWrapper, isSelected && { transform: [{ scale }] }]}
    >
      <Pressable
        testID={`quiz-option-${option}`}
        onPress={() => onSelect(option)}
        disabled={isAnswered}
        style={({ pressed }) => [
          styles.optionButton,
          {
            backgroundColor,
            borderColor: isDark ? COLORS.darkBorder : COLORS.lightBorder,
            opacity: pressed && !isAnswered ? 0.7 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Answer option ${option}`}
        accessibilityState={{ disabled: isAnswered, selected: isSelected }}
      >
        <Text
          style={[
            styles.optionText,
            isGlyph ? styles.optionGlyph : styles.optionRoman,
            { color: textColor },
          ]}
        >
          {option}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function QuizCard({
  question,
  prompt,
  selectedAnswer,
  onSelect,
  questionNumber,
  totalQuestions,
}: QuizCardProps): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const isAnswered = selectedAnswer !== null;
  const isGlyphPrompt = question.type === 'charToRoman';
  const areOptionsGlyphs = question.type === 'romanToChar';

  useEffect(() => {
    if (selectedAnswer === null) {
      scale.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.timing(scale, {
        toValue: PULSE_SCALE,
        duration: PULSE_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: PULSE_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedAnswer, scale]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.progressLabel,
          { color: isDark ? COLORS.mutedText : COLORS.lightText },
        ]}
        accessibilityLabel={`Question ${questionNumber} of ${totalQuestions}`}
      >
        {`${questionNumber} / ${totalQuestions}`}
      </Text>

      <View style={styles.promptContainer}>
        <Text
          testID="quiz-prompt"
          style={[
            styles.prompt,
            isGlyphPrompt && styles.promptGlyph,
            { color: isDark ? COLORS.darkText : COLORS.primaryBlue },
          ]}
          accessibilityLabel={`Prompt: ${prompt}`}
        >
          {prompt}
        </Text>
      </View>

      <View style={styles.optionsGrid}>
        {question.options.map((option) => (
          <OptionButton
            key={option}
            option={option}
            isGlyph={areOptionsGlyphs}
            isAnswered={isAnswered}
            isSelected={option === selectedAnswer}
            isCorrectOption={option === question.correctAnswer}
            isDark={isDark}
            scale={scale}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressLabel: {
    fontSize: PROGRESS_LABEL_SIZE,
    textAlign: 'center',
  },
  promptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    fontSize: PROMPT_GLYPH_SIZE,
    lineHeight: PROMPT_GLYPH_SIZE + 16,
  },
  promptGlyph: {
    fontFamily: KOREAN_FONT,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  optionButton: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  optionText: {
    textAlign: 'center',
  },
  optionGlyph: {
    fontSize: OPTION_GLYPH_SIZE,
    fontFamily: KOREAN_FONT,
    lineHeight: OPTION_GLYPH_SIZE + 8,
  },
  optionRoman: {
    fontSize: OPTION_TEXT_SIZE,
  },
});
