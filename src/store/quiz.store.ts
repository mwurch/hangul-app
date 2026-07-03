import { create } from 'zustand';

// --- Types ---

export type QuizQuestion = {
  readonly char: string;
  readonly correctAnswer: string;
  readonly options: readonly string[];
  readonly type: 'charToRoman' | 'romanToChar';
};

export interface QuizState {
  readonly questions: readonly QuizQuestion[];
  readonly currentIndex: number;
  readonly answers: readonly (string | null)[];
  readonly isComplete: boolean;
  readonly score: number;
}

export interface QuizActions {
  readonly startQuiz: (questions: readonly QuizQuestion[]) => void;
  readonly answerQuestion: (answer: string) => void;
  readonly nextQuestion: () => void;
  readonly resetQuiz: () => void;
}

type QuizStore = QuizState & QuizActions;

// --- Initial state ---

const initialState: QuizState = {
  questions: [],
  currentIndex: 0,
  answers: [],
  isComplete: false,
  score: 0,
};

// --- Store ---

export const useQuizStore = create<QuizStore>()((set, get) => ({
  ...initialState,

  startQuiz: (questions: readonly QuizQuestion[]): void => {
    const emptyAnswers: readonly (string | null)[] = questions.map(() => null);
    set({
      questions,
      currentIndex: 0,
      answers: emptyAnswers,
      isComplete: false,
      score: 0,
    });
  },

  answerQuestion: (answer: string): void => {
    const state = get();

    if (state.isComplete) {
      return;
    }

    const currentQuestion = state.questions[state.currentIndex];
    if (currentQuestion === undefined) {
      return;
    }

    const isCorrect = answer === currentQuestion.correctAnswer;
    const newScore = isCorrect ? state.score + 1 : state.score;

    const newAnswers = state.answers.map((existing, index) =>
      index === state.currentIndex ? answer : existing,
    );

    const isLastQuestion = state.currentIndex >= state.questions.length - 1;

    set({
      answers: newAnswers,
      score: newScore,
      isComplete: isLastQuestion,
    });
  },

  nextQuestion: (): void => {
    const state = get();

    if (state.isComplete) {
      return;
    }

    const nextIndex = state.currentIndex + 1;
    const isComplete = nextIndex >= state.questions.length;

    set({
      currentIndex: nextIndex,
      isComplete,
    });
  },

  resetQuiz: (): void => {
    set({ ...initialState });
  },
}));
