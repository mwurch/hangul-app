# 한글 — Learn Hangul

A focused, mobile-first app that teaches complete beginners to **read** the Korean alphabet (한글) — from individual letters (자모) all the way to composing full syllable blocks. Free, offline, no ads, no account.

> One thing, done extremely well: reading Korean. No grammar, no vocabulary drills, no sign-up.

Built with React Native (Expo) + TypeScript.

---

## Highlights

- **All 40 modern 자모** — 19 consonants + 21 vowels — each with audio, romanization, Korean name, and an example word.
- **Syllable builder (the hero feature).** Tap an initial consonant, a vowel, and an optional 받침, and watch a real Korean syllable assemble live — the "aha" moment where `ㅎ + ㅏ + ㄴ = 한` finally clicks.
- **Spaced repetition (SM-2).** Every quiz answer feeds a spaced-repetition scheduler so reviews surface exactly when you're about to forget, with a daily streak.
- **Structured lesson path.** The 40 letters are split into 8 lessons of 5; each lesson unlocks the next once you've answered all of its characters correctly. Unlock state is *derived* from progress, never persisted separately.
- **Fully offline & private.** All audio is bundled; progress lives only on-device (AsyncStorage). Nothing is ever sent to a server.
- **System-aware dark mode**, haptics, and a VoiceOver/TalkBack pass.

## The interesting technical bit: syllable composition

Korean syllables are a single Unicode code point computed from three indices:

```
codepoint = 0xAC00 + (initial_index × 21 + vowel_index) × 28 + final_index
```

The canonical test the whole feature rests on:

```
ㅎ (initial 18) + ㅏ (vowel 0) + ㄴ (final 4)
  → 0xAC00 + (18×21 + 0)×28 + 4
  → 0xD55C
  → 한 ✓
```

This lives in [`src/utils/hangul.ts`](src/utils/hangul.ts) and is guarded by a unit test that must pass before any change to the composition logic.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React Native (Expo) |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Storage | AsyncStorage |
| Audio | expo-audio (bundled MP3s, no streaming) |
| Animation | Reanimated 3 + Moti |
| Typography | Noto Sans KR (bundled) |
| Testing | Jest + React Native Testing Library |
| CI/CD | EAS Build |

## Architecture

```
app/            # Expo Router screens (tabs: lesson path, build, quiz, progress)
src/
  data/         # jamo definitions, 8-lesson curriculum, static audio registry
  store/        # Zustand stores: progress (SM-2 SRS) + quiz
  hooks/        # audio playback, syllable-builder state
  components/   # CharCard, JamoKeyboard, QuizCard, ProgressRing, LessonNode, …
  utils/        # hangul.ts — syllable composition math
  theme/        # design-system palette (no hex literals in components)
assets/         # bundled fonts + audio
```

Design principles the codebase holds to: small focused files, immutable state updates, a two-accent-colour design system, and 자모-level invariants enforced by tests (e.g. every lesson keeps ≥4 distinct glyphs so the quiz generator can always build a round).

## Running locally

```sh
npm install
npx expo start
```

Then open in the Expo Go app, an iOS Simulator, or an Android Emulator.

### Tests

```sh
npm test
```

The suite covers the composition math, SRS scheduling, lesson-unlock derivation, and component behaviour (250+ tests).

## Status

Feature-complete through polish (onboarding, dark mode, haptics, accessibility). Remaining before a store release: real Korean pronunciation recordings (the repo ships silent placeholder MP3s), app icon / splash artwork, and store submission.

## License

[MIT](LICENSE)
