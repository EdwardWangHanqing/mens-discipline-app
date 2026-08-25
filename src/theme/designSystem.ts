export const colors = {
  canvas: '#05090E',
  surface: '#0E161E',
  surfaceRaised: '#111B24',
  surfaceSoft: '#0A121A',
  border: '#1D2832',
  borderStrong: '#2C3844',
  primary: '#F5F7F8',
  secondary: '#A7B0B8',
  tertiary: '#87919B',
  accent: '#FCCA17',
  accentPressed: '#D5A900',
  accentInk: '#070B0F',
  danger: '#D96672',
  success: '#31D39A',
  scrim: 'rgba(2, 5, 8, 0.82)',
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 18,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const typography = {
  eyebrow: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1.7,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.4,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  display: {
    fontSize: 54,
    lineHeight: 60,
    fontWeight: '700' as const,
  },
} as const;
