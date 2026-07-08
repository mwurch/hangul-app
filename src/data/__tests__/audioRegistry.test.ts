import { AUDIO_REGISTRY } from '../audioRegistry';
import { ALL_JAMO } from '../jamo';

// --- AUDIO_REGISTRY ---

describe('AUDIO_REGISTRY', () => {
  test('every jamo audioFile resolves to a defined registry entry', () => {
    ALL_JAMO.forEach((jamo) => {
      expect(AUDIO_REGISTRY[jamo.audioFile]).toBeDefined();
    });
  });

  test('every example word audioFile resolves to a defined registry entry', () => {
    ALL_JAMO.forEach((jamo) => {
      expect(AUDIO_REGISTRY[jamo.exampleWord.audioFile]).toBeDefined();
    });
  });

  test('registry has no orphan entries (exactly two files per jamo)', () => {
    // Arrange
    const referencedFiles = new Set(
      ALL_JAMO.flatMap((jamo) => [
        jamo.audioFile,
        jamo.exampleWord.audioFile,
      ]),
    );

    // Act
    const registryKeys = Object.keys(AUDIO_REGISTRY);

    // Assert
    expect(referencedFiles.size).toBe(ALL_JAMO.length * 2);
    expect(registryKeys.sort()).toEqual([...referencedFiles].sort());
  });
});
