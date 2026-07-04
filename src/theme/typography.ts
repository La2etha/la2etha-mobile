// Font family keys map to the @expo-google-fonts named instances loaded in useFonts.
export const fontFamily = {
  display: 'Fraunces_600SemiBold', // soft optical serif — warm display
  body: 'HankenGrotesk_400Regular', // rounded humanist — echoes the logo
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemibold: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
  arabic: 'IBMPlexSansArabic_400Regular',
  mono: 'SpaceMono_400Regular',
} as const;

// Type scale. Pairing is on a real contrast axis (serif display + rounded sans body).
export const type = {
  display: { fontFamily: fontFamily.display, fontSize: 34, letterSpacing: -0.5, lineHeight: 40 },
  h1: { fontFamily: fontFamily.bodyBold, fontSize: 24, letterSpacing: -0.4, lineHeight: 30 },
  h2: { fontFamily: fontFamily.bodySemibold, fontSize: 18, letterSpacing: -0.2, lineHeight: 24 },
  body: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fontFamily.bodyMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.body, fontSize: 12.5, lineHeight: 17 },
  mono: { fontFamily: fontFamily.mono, fontSize: 11.5, letterSpacing: 0.5 },
} as const;
