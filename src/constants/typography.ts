// Typography system for consistent text styling
import { Platform, TextStyle } from 'react-native';

// Use system fonts - they work best across platforms
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Display - Large hero text
  displayLarge: {
    fontFamily,
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 42,
  } as TextStyle,

  displayMedium: {
    fontFamily,
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 34,
  } as TextStyle,

  // Headlines
  headline: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 28,
  } as TextStyle,

  headlineSmall: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    lineHeight: 24,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  } as TextStyle,

  // Labels
  label: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  labelSmall: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 14,
  } as TextStyle,

  // Button
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 20,
  } as TextStyle,

  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 18,
  } as TextStyle,
};

// Helper to create text style with color
export const createTextStyle = (textStyle: keyof typeof typography, color: string) => ({
  ...typography[textStyle],
  color,
});
