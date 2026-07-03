jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useProgressStore } from '../progress.store';

const MS_PER_DAY = 86_400_000;
const MIN_EASE_FACTOR = 1.3;
const SECOND_INTERVAL = 6;
const DAY_ONE = MS_PER_DAY * 100;
const TEST_CHAR = 'ㅎ';

describe('progress store SM-2 scheduling', () => {
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(DAY_ONE);
    useProgressStore.getState().resetProgress();
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  test('sets interval to 1 after the first correct answer', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();

    // Act
    updateProgress(TEST_CHAR, true);

    // Assert
    const progress = useProgressStore.getState().progress[TEST_CHAR];
    expect(progress?.interval).toBe(1);
    expect(progress?.nextReview).toBe(DAY_ONE + MS_PER_DAY);
  });

  test('sets interval to 6 after the second consecutive correct answer', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    updateProgress(TEST_CHAR, true);

    // Act
    updateProgress(TEST_CHAR, true);

    // Assert
    const progress = useProgressStore.getState().progress[TEST_CHAR];
    expect(progress?.interval).toBe(SECOND_INTERVAL);
  });

  test('multiplies interval by ease factor after the third consecutive correct answer', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    updateProgress(TEST_CHAR, true);
    updateProgress(TEST_CHAR, true);

    // Act
    updateProgress(TEST_CHAR, true);

    // Assert
    const progress = useProgressStore.getState().progress[TEST_CHAR];
    expect(progress?.interval).toBe(
      Math.round(SECOND_INTERVAL * (progress?.easeFactor ?? 0)),
    );
  });

  test('resets interval to 1 after a wrong answer', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    updateProgress(TEST_CHAR, true);
    updateProgress(TEST_CHAR, true);

    // Act
    updateProgress(TEST_CHAR, false);

    // Assert
    const progress = useProgressStore.getState().progress[TEST_CHAR];
    expect(progress?.interval).toBe(1);
  });

  test('does not increase correctCount on a wrong answer', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    updateProgress(TEST_CHAR, true);

    // Act
    updateProgress(TEST_CHAR, false);

    // Assert
    const progress = useProgressStore.getState().progress[TEST_CHAR];
    expect(progress?.correctCount).toBe(1);
    expect(progress?.seenCount).toBe(2);
  });

  test('never drops easeFactor below 1.3 after repeated wrong answers', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    const WRONG_ANSWER_COUNT = 10;

    // Act
    Array.from({ length: WRONG_ANSWER_COUNT }).forEach(() => {
      updateProgress(TEST_CHAR, false);
    });

    // Assert
    const progress = useProgressStore.getState().progress[TEST_CHAR];
    expect(progress?.easeFactor).toBeGreaterThanOrEqual(MIN_EASE_FACTOR);
  });
});

describe('progress store streak tracking', () => {
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(DAY_ONE);
    useProgressStore.getState().resetProgress();
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  test('starts streak at 1 on the first study day', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();

    // Act
    updateProgress(TEST_CHAR, true);

    // Assert
    expect(useProgressStore.getState().streak).toBe(1);
  });

  test('increments streak on consecutive study days', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    updateProgress(TEST_CHAR, true);

    // Act
    dateNowSpy.mockReturnValue(DAY_ONE + MS_PER_DAY);
    updateProgress(TEST_CHAR, true);

    // Assert
    expect(useProgressStore.getState().streak).toBe(2);
  });

  test('keeps streak unchanged for multiple answers on the same day', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    updateProgress(TEST_CHAR, true);

    // Act
    updateProgress(TEST_CHAR, false);

    // Assert
    expect(useProgressStore.getState().streak).toBe(1);
  });

  test('resets streak to 1 after a skipped day', () => {
    // Arrange
    const { updateProgress } = useProgressStore.getState();
    updateProgress(TEST_CHAR, true);

    // Act
    dateNowSpy.mockReturnValue(DAY_ONE + 2 * MS_PER_DAY);
    updateProgress(TEST_CHAR, true);

    // Assert
    expect(useProgressStore.getState().streak).toBe(1);
  });
});
