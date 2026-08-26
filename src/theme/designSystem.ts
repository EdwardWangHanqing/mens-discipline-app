export const colors = {
  brandGraphite: '#0B0B0C',
  canvas: '#0B0B0C',
  surface: '#131416',
  surfaceRaised: '#191A1D',
  surfaceSoft: '#101113',
  accentSurface: '#1C1B16',
  border: '#27282B',
  borderStrong: '#393A3E',
  primary: '#F5F7F8',
  secondary: '#A7B0B8',
  tertiary: '#87919B',
  accent: '#FFC94D',
  accentPressed: '#D7A531',
  accentInk: '#070B0F',
  danger: '#D96672',
  dangerSurface: 'rgba(217, 102, 114, 0.08)',
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
