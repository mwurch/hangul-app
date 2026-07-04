import * as Haptics from 'expo-haptics';

/**
 * Thin fire-and-forget wrapper around expo-haptics so components never
 * import the library directly. Haptics are a nice-to-have: any failure
 * (e.g. unsupported hardware, simulator) is swallowed silently and must
 * never crash or block the UI.
 */
function fireAndForget(haptic: Promise<void>): void {
  haptic.catch(() => undefined);
}

/** Success notification haptic — a quiz answer was correct. */
export function hapticCorrect(): void {
  fireAndForget(
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

/** Error notification haptic — a quiz answer was wrong. */
export function hapticWrong(): void {
  fireAndForget(
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  );
}

/** Light impact haptic — a key tap on the jamo keyboard. */
export function hapticTap(): void {
  fireAndForget(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Medium impact haptic — a full syllable was composed in the builder. */
export function hapticCompose(): void {
  fireAndForget(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}
