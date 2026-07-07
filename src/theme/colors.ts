// Design system palette — CLAUDE.md §Design system
// Primary: Deep blue #1A3F7A (actions). Teal: #0F6E56 (success/progress).

export const COLORS = {
  // Brand
  primaryBlue: '#1A3F7A',
  teal: '#0F6E56',

  // Surfaces
  lightBackground: '#FFFFFF',
  lightSurface: '#F4F6F9',
  darkBackground: '#0B1220',
  darkSurface: '#131D30',
  darkSurfaceDeep: '#0F1A2C',

  // Text
  lightText: '#16233A',
  darkText: '#EAF0FA',
  mutedText: '#8A96A8',
  darkMutedText: '#7E8AA0',

  // Borders
  lightBorder: '#EDEFF4',
  borderStrong: '#DDE3EC',
  darkBorder: '#212C40',
  darkBorderStrong: '#263453',

  // Tinted backgrounds
  chipBlueBg: '#EDF2FB',
  tealTintBg: '#EEF6F2',
  darkChipBlueBg: '#172641',
  darkTealTintBg: '#12251E',

  // Locked state
  lockedBg: '#FAFBFC',
  lockedBorder: '#E6EAF1',
  lockedText: '#C4CDDA',
  darkLockedText: '#4A5670',

  // Dark-mode accents (never raw primaryBlue/teal on dark surfaces)
  darkBlue: '#5B8AD6',
  darkTeal: '#37A98A',
  darkTrack: '#1A2439',

  // Feedback
  correctGreen: '#0F6E56',
  wrongRed: '#D32F2F',
  darkWrongRed: '#E5675B',
} as const;

export type ColorKey = keyof typeof COLORS;
