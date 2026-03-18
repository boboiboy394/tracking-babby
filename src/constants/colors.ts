// Premium color palette - Warm terracotta + sage + gold
export const colors = {
  // Primary: Warm terracotta rose - sophisticated & inviting
  primary: '#E07A5F',
  primaryLight: '#F4A499',
  primaryDark: '#C45B3E',

  // Secondary: Deep sage - nature/baby friendly
  secondary: '#81B29A',
  secondaryLight: '#A8D5BA',
  secondaryDark: '#5F8C72',

  // Accent: Warm gold for highlights
  accent: '#F2CC8F',
  accentLight: '#F7DFB3',
  accentDark: '#D4A85A',

  // Neutrals: Warm charcoal instead of cold gray
  background: '#FAF9F7',      // Warm off-white
  surface: '#FFFFFF',
  surfaceElevated: '#FEFEFE',

  // Text: Deep navy-charcoal
  text: '#3D405B',
  textLight: '#6B6E7B',
  textMuted: '#A9A9B8',

  // Semantic - using color family
  error: '#E07A5F',
  warning: '#F2CC8F',
  success: '#81B29A',
  info: '#7E9CC7',

  // Borders - warmer tones
  border: '#E8E6E3',
  divider: '#F0EFED',

  white: '#FFFFFF',
  black: '#1A1A1A',
  transparent: 'transparent',
};

export type ColorKey = keyof typeof colors;
