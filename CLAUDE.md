# CLAUDE.md — 한글 Learning App

> Read this file before writing any code. It is the authoritative source of truth for every AI agent working on this project.

---

## What this app is

A focused, beautiful mobile app that teaches complete beginners the Korean Hangul alphabet — from individual letters (자모) through syllable construction. Sold as a one-time 2.99€ purchase on the App Store and Google Play. No subscription. No ads. No grammar. One thing, done extremely well.

---

## Red lines — never cross these

- **No grammar, no vocabulary lists, no full sentences.** The app teaches reading, not speaking.
- **No subscription model and no in-app purchases.** One-time paid download only.
- **No ads. Ever.**
- **Never break the syllable composition formula.** The canonical test: `ㅎ (initial 18) + ㅏ (vowel 0) + ㄴ (final 4)` must produce `한` (`0xD55C`). Run the unit test in `hangul.ts` before any merge that touches syllable logic.
- **Never load Noto Sans KR from a CDN at runtime.** The font must be bundled with the app.
- **Never send user data to a server.** Progress is local only (AsyncStorage / MMKV).

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React Native (Expo) |
| Language | TypeScript throughout |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Storage | AsyncStorage (progress), MMKV (perf-sensitive) |
| Audio | expo-audio (bundled MP3s, no streaming) |
| Animations | React Native Reanimated 3 + Moti |
| Typography | Noto Sans KR (bundled) |
| Testing | Jest + React Native Testing Library |
| CI/CD | EAS Build |

---

## Folder structure

```
app/
  (tabs)/
    _layout.tsx      # Tab bar configuration (4 tabs)
    index.tsx        # 자모 study grid (Study tab)
    build.tsx        # Syllable builder (placeholder)
    quiz.tsx         # Quiz mode (placeholder)
    progress.tsx     # Progress overview (placeholder)
  _layout.tsx        # Root layout: font loading, SafeAreaProvider

src/
  data/             # jamo.ts (types + data), lessons.ts (5-lesson curriculum), audioRegistry.ts (static require map)
  store/            # progress.store.ts (SM-2 SRS), quiz.store.ts
  hooks/            # useAudio.ts (playback), useSyllableBuilder.ts (build tab state)
  components/       # CharCard, FilterTabs, JamoDetailPanel, AudioButton, SlotBox, JamoKeyboard
  theme/            # colors.ts (design system palette)
  utils/            # hangul.ts  ← syllable composition math

assets/
  audio/            # 48 MP3s: 24 자모 + 24 example words (placeholders until real recordings)
  fonts/            # NotoSansKR-Regular.ttf (bundled)
```

---

## Core data types

Always check `src/data/jamo.ts` before writing any component. These types are the source of truth.

```ts
interface Jamo {
  char: string;           // e.g. 'ㅈ'
  type: 'consonant' | 'vowel';
  romanization: string;   // e.g. 'j'
  koreanName: string;     // e.g. '지읒'
  audioFile: string;      // e.g. 'jieut.mp3'
  exampleWord: {
    korean: string;       // e.g. '자동차'
    english: string;      // e.g. 'car'
    audioFile: string;
  };
  mouthShape?: string;
}

interface JamoProgress {
  char: string;
  seenCount: number;
  correctCount: number;
  lastSeen: number;       // Unix timestamp
  nextReview: number;     // Unix timestamp (SRS)
  interval: number;       // SRS interval in days
  easeFactor: number;     // default 2.5
}
```

---

## Hangul syllable composition formula

```
codepoint = 0xAC00 + (initial_index × 21 + vowel_index) × 28 + final_index
```

- `initial_index` — position in the 19-value initial consonant array
- `vowel_index` — position in the 21-value vowel array
- `final_index` — 0 for no final consonant, 1–27 for valid 받침

**Canonical test:** `ㅎ(18) + ㅏ(0) + ㄴ(4)` → `0xAC00 + (18×21 + 0)×28 + 4` = `0xD55C` = `한` ✓

This test must pass before any merge touching `hangul.ts`.

---

## Learning content scope

### In scope (v1)
- **Module 1 — Consonants (자음):** 14 characters: ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ
- **Module 2 — Vowels (모음):** 10 characters: ㅡ ㅣ ㅐ ㅔ ㅕ ㅗ ㅛ ㅜ ㅟ ㅏ
- **Module 3 — Syllable blocks:** Interactive composition (초성 + 중성 + optional 받침)
- **Module 4 — Reading practice:** Short common words using only taught 자모

### Out of scope (v1) — do not add
- Grammar or sentence structure
- Vocabulary beyond per-character example words
- Listening comprehension or speaking
- Compound vowels (이중모음) — deferred to v1.1
- Double consonants (쌍자음) — deferred to v1.1

---

## Design system

- **Palette:** Deep blue `#1A3F7A` (primary actions), teal `#0F6E56` (success/progress). Two accent colours only.
- **Typography:** Noto Sans KR for all Korean glyphs. System sans-serif for UI labels.
- **Glyph sizing:** Never below 28pt in study mode. 72pt on quiz cards.
- **Layout:** Mobile-first. Every decision is made for a 390px wide screen held in one hand.
- **Dark mode:** Fully system-aware.
- **Aesthetic:** Clean and minimal. White/light backgrounds. No decorative elements.

### Components

| Component | Status | Purpose |
|---|---|---|
| `CharCard` | ✅ | Tap target: glyph + romanization + optional progress dot. Used in Study grid. |
| `FilterTabs` | ✅ | Three-tab filter bar (전체 / 자음 / 모음) for the Study grid. |
| `JamoDetailPanel` | ✅ | Modal detail view: large glyph, Korean name, romanization, type, example word, audio buttons. |
| `AudioButton` | ✅ | Speaker icon triggering native audio playback via `useAudio` hook. |
| `SlotBox` | ✅ | Dashed-border slot that animates to solid when filled. Used in Syllable Builder. |
| `JamoKeyboard` | ✅ | Mini keyboard grid of tappable jamo characters for the Syllable Builder. |
| `QuizCard` | ✅ | Full-screen card: large glyph + 4-button choice grid. Animates on answer. |
| `QuizSummary` | ✅ | End-of-quiz score view: score, percentage, tiered encouragement, retry/done actions. |
| `ProgressRing` | ✅ | Circular indicator: learned / total for a module. SVG ring via react-native-svg. |
| `OnboardingSlides` | ✅ | First-launch 3-slide intro (learn/build/quiz) with skip and start actions; gated by persisted settings store. |

---

## Audio

- All audio is **bundled** (not streamed). The app must work fully offline.
- 24 base 자모 clips (~0.5s each) + 24 example word clips (~1.5s each) = 48 files total.
- Format: MP3 128kbps. Target bundle size: under 4MB total.
- Playback via `expo-audio` through `useAudio` hook → `AudioButton` component.
- Asset lookup uses `src/data/audioRegistry.ts` — a static `require()` map keyed by the `audioFile` field in `jamo.ts`. Metro requires static paths; dynamic `require()` won't work.
- **Audio is not optional.** Phase 3 (audio) is complete (placeholder MP3s); real recordings needed before ship.
- **Current state:** 48 silent placeholder MP3s (68 bytes each). Replace with real Korean pronunciation recordings before shipping. Filenames must match `jamo.ts` exactly.
- **API note:** Uses the new `expo-audio` API (`createAudioPlayer`, `AudioSource`), not the deprecated `expo-av`.

---

## Lesson progression

The 24 자모 are split into 5 lessons (`src/data/lessons.ts`) of ~5 characters, each mixing consonants and vowels so the syllable builder works from lesson 1. A lesson completes when every one of its characters has been answered correctly **at least once** in a quiz; the next lesson then unlocks. Unlock state is **derived** from the progress store (`src/utils/lessonProgress.ts`) — never persisted separately. Locked characters appear dimmed with a lock in the Study grid (glyph visible as a syllabus preview — intentional; romanization hidden), are excluded from the Build keyboard and the Quiz pool, and the Progress tab lists per-lesson status. **Invariant:** every lesson must keep ≥4 distinct romanizations and ≥4 glyphs, or the quiz generator throws — enforced by `lessons.test.ts`; lesson 5 sits exactly at the minimum.

## SRS (Spaced Repetition)

Uses the **SM-2 algorithm**. After each quiz answer, update `interval` and `easeFactor` on the character's `JamoProgress` record. Characters answered wrong surface more frequently. The Progress tab shows a review queue for characters where `nextReview` timestamp has passed.

---

## Progress persistence rules

- Progress must survive the app being closed mid-session.
- AsyncStorage writes happen synchronously on quiz completion — not deferred.
- Never send progress data to any server.

---

## Development phases

| Phase | Goal |
|---|---|
| 0 | Web prototype — **DONE** |
| 1 | Expo setup, TypeScript config, navigation skeleton, jamo data, AsyncStorage store — **DONE** |
| 2 | Study tab: CharCard, consonant/vowel grid, detail panel, filter tabs — **DONE** |
| 3 | Audio: recordings bundled, expo-av integration, AudioButton — **DONE** (placeholder MP3s; real recordings needed before ship) |
| 4 | Build tab: SlotBuilder, mini 자모 keyboard, composition formula, live result — **DONE** |
| 5 | Quiz tab: QuizCard, 20-question flow, feedback animation, score summary — **DONE** (SM-2 wiring deferred to Phase 6; feedback animation uses built-in RN Animated, not Reanimated) |
| 6 | Progress & SRS: Progress tab UI, streak, SM-2 wired to quiz, review queue — **DONE** (learned = 3+ correct answers; SM-2 store updates persist to AsyncStorage on every quiz answer) |
| 7 | Polish: onboarding, haptics, dark mode, accessibility audit, performance — **DONE** (on-device performance validation still pending: cold-start and bundle-size targets need physical devices) |
| 8 | Ship: store assets, EAS Build, App Review submission, 2.99€ pricing |

---

## Handoff checklist (run before starting any phase)

1. Re-read this file.
2. Check `src/data/jamo.ts` types before writing any component.
3. Run the Hangul composition unit test before any merge touching `hangul.ts`.
4. Test on both iOS Simulator and Android Emulator before marking a phase done.
5. Commit message format: `[Phase N] Short description of what changed`

---

## Quality bar

| Metric | Target |
|---|---|
| Crash rate | < 0.5% of sessions |
| App download size | < 30MB |
| Cold start (mid-range Android) | < 1.5s |
| Accessibility | VoiceOver + TalkBack usable in Study and Quiz modes |

---

## Guiding principles

- **Simple beats complete.** If a feature makes the app more complex without clearly helping a beginner read Hangul faster, cut it.
- **Mobile-first.** 390px wide, one hand.
- **Audio is not optional.** An app teaching pronunciation without audio is broken.
- **Progress must persist.** Closing the app mid-session loses nothing.
- **The syllable builder is the hero feature.** It creates the 'aha' moment. Keep it prominent and joyful.

---

*한글 Learning App — CLAUDE.md — generated from Product Plan v1.0 (June 2026)*
