# Phase 8 — Ship Checklist

Everything needed to take the app from repo to store. Items marked 🧑 need the
account owner; items marked 🤖 are automatable from this repo.

## 1. Blockers before any store build

- [ ] 🧑 **Replace the 48 placeholder MP3s** in `assets/audio/` with real Korean
      pronunciation recordings (24 자모 + 24 example words, MP3 128kbps,
      filenames must match `src/data/jamo.ts` exactly; target < 4MB total).
- [ ] 🧑 Review app icon / adaptive icon / splash icon in `assets/` — currently
      template-generated; replace with final artwork if desired.
- [ ] 🧑 Manual passes (CLAUDE.md handoff checklist): iOS Simulator **and**
      Android Emulator; VoiceOver + TalkBack on Study and Quiz tabs.
- [ ] 🧑 On-device performance validation: cold start < 1.5s on a mid-range
      Android device; final download size < 30MB.

## 2. EAS setup (one-time)

- [ ] 🧑 `npx eas login` (Expo account)
- [ ] 🧑 `npx eas init` — links the project, writes `extra.eas.projectId`
      into app.json
- [ ] 🧑 Apple Developer Program membership (99 USD/yr) and Google Play
      Console account (25 USD one-time)
- 🤖 `eas.json` profiles are already configured: `development` (dev client),
  `preview` (internal / iOS simulator), `production` (auto-incrementing).

## 3. Build & submit

```sh
# Production builds
npx eas build --platform ios --profile production
npx eas build --platform android --profile production

# Submission (after store listings exist)
npx eas submit --platform ios
npx eas submit --platform android
```

- iOS export compliance is pre-answered (`ITSAppUsesNonExemptEncryption: false`).
- Pricing: **2.99 € one-time**, no IAP, no ads (set in App Store Connect /
  Play Console — there is nothing to configure in code).
- Privacy questionnaires: the app collects **no data**, sends **nothing** to
  any server; progress is stored only on-device (AsyncStorage). Answer
  "no data collected" in both stores' privacy sections.

## 4. Store listing draft

**Name:** 한글 — Learn Hangul
**Subtitle (iOS) / Short description (Android):**
Read Korean letters in days, not months.

**Description (EN):**

> Learn to read Korean — and nothing else.
>
> 한글 teaches you the Korean alphabet from zero: all 14 consonants and 10
> vowels, with native-speaker audio for every letter and example word.
>
> • Study: flashcards for every 자모 with pronunciation and mouth-shape hints
> • Build: compose real syllable blocks yourself — the "aha" moment where
>   한 = ㅎ + ㅏ + ㄴ finally clicks
> • Quiz: 20-question rounds with instant feedback
> • Progress: spaced repetition (SM-2) schedules reviews exactly when you
>   need them, with a daily streak
>
> One price. No subscription. No ads. No account. Works fully offline, and
> your progress never leaves your device.

**Keywords (iOS):** korean,hangul,alphabet,learn korean,한글,korean letters,read korean
**Category:** Education

**Screenshots to capture (390×844 + tablet-free):**
1. Study grid (light), 2. Detail panel with audio, 3. Syllable builder mid-
compose, 4. Quiz feedback (correct/green), 5. Progress tab with rings +
streak, 6. Dark-mode study grid.

## 5. After approval

- [ ] 🧑 Merge the release branch to `main` and tag `v1.0.0`.
- [ ] 🧑 Verify the store privacy labels match "no data collected".
