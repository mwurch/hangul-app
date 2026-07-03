import type { Jamo } from '../data/jamo';
import type { QuizQuestion } from '../store/quiz.store';

/** Default number of questions in a full quiz session. */
export const QUIZ_LENGTH = 20;

/** Options shown per question (1 correct answer + 3 distractors). */
const OPTION_COUNT = 4;

/** Minimum distinct option values the pool must provide per question kind. */
const MIN_DISTINCT_OPTION_VALUES = OPTION_COUNT;

/** Probability threshold splitting the two question types evenly. */
const TYPE_SPLIT_THRESHOLD = 0.5;

const MIN_QUESTION_COUNT = 1;

type QuestionType = QuizQuestion['type'];

type RandomFn = () => number;

/** Returns a shuffled copy (Fisher-Yates). Never mutates the input. */
function shuffle<T>(items: readonly T[], random: RandomFn): readonly T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swapped = copy[j] as T;
    copy[j] = copy[i] as T;
    copy[i] = swapped;
  }
  return copy;
}

/** The option value a jamo contributes for a given question kind. */
function optionValue(jamo: Jamo, kind: QuestionType): string {
  return kind === 'charToRoman' ? jamo.romanization : jamo.char;
}

function distinctOptionValues(
  pool: readonly Jamo[],
  kind: QuestionType,
): readonly string[] {
  return [...new Set(pool.map((jamo) => optionValue(jamo, kind)))];
}

function validateInput(pool: readonly Jamo[], count: number): void {
  if (count < MIN_QUESTION_COUNT) {
    throw new Error(
      `count must be at least ${MIN_QUESTION_COUNT}, received ${count}`,
    );
  }

  const kinds: readonly QuestionType[] = ['charToRoman', 'romanToChar'];
  kinds.forEach((kind) => {
    const distinct = distinctOptionValues(pool, kind).length;
    if (distinct < MIN_DISTINCT_OPTION_VALUES) {
      const label = kind === 'charToRoman' ? 'romanizations' : 'characters';
      throw new Error(
        `pool must contain at least ${MIN_DISTINCT_OPTION_VALUES} distinct ` +
          `${label} to build ${OPTION_COUNT} options, found ${distinct}`,
      );
    }
  });
}

/**
 * Moves a leading boundary duplicate out of first position so a reshuffled
 * batch never starts with the jamo that ended the previous batch.
 */
function withoutLeadingDuplicate(
  batch: readonly Jamo[],
  previous: Jamo | undefined,
  random: RandomFn,
): readonly Jamo[] {
  const first = batch[0];
  if (previous === undefined || first === undefined || batch.length < 2) {
    return batch;
  }
  if (first.char !== previous.char) {
    return batch;
  }
  const swapIndex = 1 + Math.floor(random() * (batch.length - 1));
  return batch.map((jamo, index) => {
    if (index === 0) {
      return batch[swapIndex] as Jamo;
    }
    return index === swapIndex ? first : jamo;
  });
}

/**
 * Draws `count` jamo without repeats until the pool is exhausted; when the
 * pool runs out it reshuffles, never placing the same jamo twice in a row.
 */
function buildJamoSequence(
  pool: readonly Jamo[],
  count: number,
  random: RandomFn,
): readonly Jamo[] {
  let sequence: readonly Jamo[] = [];
  while (sequence.length < count) {
    const previous = sequence[sequence.length - 1];
    const shuffled = shuffle(pool, random);
    const batch = withoutLeadingDuplicate(shuffled, previous, random);
    sequence = [...sequence, ...batch];
  }
  return sequence.slice(0, count);
}

/** Picks 3 distractor values distinct from each other and the correct answer. */
function pickDistractors(
  pool: readonly Jamo[],
  correctAnswer: string,
  kind: QuestionType,
  random: RandomFn,
): readonly string[] {
  const candidates = distinctOptionValues(pool, kind).filter(
    (value) => value !== correctAnswer,
  );
  return shuffle(candidates, random).slice(0, OPTION_COUNT - 1);
}

function buildQuestion(
  jamo: Jamo,
  pool: readonly Jamo[],
  random: RandomFn,
): QuizQuestion {
  const type: QuestionType =
    random() < TYPE_SPLIT_THRESHOLD ? 'charToRoman' : 'romanToChar';
  const correctAnswer = optionValue(jamo, type);
  const distractors = pickDistractors(pool, correctAnswer, type, random);
  const options = shuffle([correctAnswer, ...distractors], random);
  return { char: jamo.char, correctAnswer, options, type };
}

/**
 * Generates a quiz of `count` questions from the given jamo pool.
 *
 * Pure: never mutates `pool`. Deterministic when a seeded `random` is given.
 * Throws if `count` < 1 or the pool cannot supply 4 distinct option values.
 */
export function generateQuizQuestions(
  pool: readonly Jamo[],
  count: number,
  random: RandomFn = Math.random,
): readonly QuizQuestion[] {
  validateInput(pool, count);
  const sequence = buildJamoSequence(pool, count, random);
  return sequence.map((jamo) => buildQuestion(jamo, pool, random));
}
