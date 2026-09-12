/**
 * Banorte Design Tokens
 * Identidad visual oficial + utilidades de diseño para la app A2UI.
 */

export const Colors = {
  // ── Banorte Brand ──
  primary: '#EB0029',
  primaryDark: '#C20022',
  primaryLight: '#FF1A43',

  // ── Neutrals ──
  black: '#1A1A1A',
  charcoal: '#2D2D2D',
  darkGray: '#4A4A4A',
  gray: '#8E8E93',
  lightGray: '#C7C7CC',
  silver: '#E5E5EA',
  background: '#F4F6F9',
  white: '#FFFFFF',

  // ── Semantic ──
  success: '#00875A',
  successLight: '#E6F4ED',
  warning: '#F5A623',
  warningLight: '#FFF8E7',
  danger: '#FF3B3B',
  dangerLight: '#FFEBEB',
  info: '#007AFF',
  infoLight: '#E5F1FF',

  // ── Card Gradients ──
  cardGradientStart: '#EB0029',
  cardGradientMid: '#8B0016',
  cardGradientEnd: '#1A1A1A',

  // ── Overlays ──
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',
  glassBg: 'rgba(255, 255, 255, 0.08)',
  glassStroke: 'rgba(255, 255, 255, 0.15)',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  section: 48,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#EB0029',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  successGlow: {
    shadowColor: '#00875A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
} as const;

export const AnimationConfig = {
  /** Default spring config for card entrances */
  springEntry: {
    damping: 18,
    stiffness: 120,
    mass: 1,
  },
  /** Quick spring for button taps */
  springTap: {
    damping: 15,
    stiffness: 300,
    mass: 0.6,
  },
  /** Slow spring for smooth transitions */
  springSmooth: {
    damping: 22,
    stiffness: 80,
    mass: 1.2,
  },
  /** Duration for fade animations (ms) */
  fadeDuration: 300,
  /** Duration for slide animations (ms) */
  slideDuration: 400,
  /** Pulse loop interval (ms) */
  pulseDuration: 1200,
} as const;

/** Convenience theme object */
const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animation: AnimationConfig,
} as const;

export type Theme = typeof theme;
export default theme;
