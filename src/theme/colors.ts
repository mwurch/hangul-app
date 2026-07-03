// Design system palette — CLAUDE.md §Design system
// Primary: Deep blue #1A3F7A (actions). Teal: #0F6E56 (success/progress).

export const COLORS = {
  // Brand
  primaryBlue: '#1A3F7A',
  teal: '#0F6E56',

  // Surfaces
  lightBackground: '#FFFFFF',
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',

  // Text
  lightText: '#333333',
  darkText: '#E0E0E0',
  mutedText: '#999999',

  // Borders
  lightBorder: '#E0E0E0',
  darkBorder: '#333333',

  // Feedback
  correctGreen: '#0F6E56',
  wrongRed: '#D32F2F',
} as const;

export type ColorKey = keyof typeof COLORS;
