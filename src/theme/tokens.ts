// Locked brand palette (constitution): dark teal, soft cream, burnt orange.
export const colors = {
  paper: '#faf4e8',
  paperSunk: '#f1e7d3',
  card: '#ffffff',
  ink: '#0b3b3a',
  inkSoft: '#1d6b68',
  inkFaint: '#a2795a', // metadata captions ONLY (~3:1 on cream) — never body/placeholder
  line: '#eaddc4',
  stamp: '#c8562a',
  stampDeep: '#ab4620',
  // Locked brand hex (design doc §1.2) — luminous teal, not cyan. Owner
  // 2026-07-06: restored after an earlier overcorrection removed it entirely;
  // teal is the app's everyday voice, burnt orange is reserved for identity.
  glowTeal: '#37d6c4',
  glowHot: '#ff6a3d',
  success: '#2f8f6b',
  warning: '#c8892a',
  danger: '#b5432a',
  info: '#1d6b68',
} as const;

// Shadows/recessed surfaces carry a teal-biased tint (anti-generic guardrail §2.5) —
// never a flat warm shadow, so the cream never reads as generic SaaS-cream.
export const tint = {
  shadow: 'rgba(11,59,58,0.14)',
  shadowSoft: 'rgba(11,59,58,0.08)',
} as const;

// Text colors that clear WCAG body contrast on cream. inkFaint is deliberately excluded.
export const bodyLegalOnCream = [colors.ink, colors.inkSoft] as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;

// Color ROLES (FR-008/009/010): teal is the app's everyday voice (primary CTAs,
// active nav, active chrome); burnt orange is reserved for identity ("you",
// HOST, self-face ring) — the two accents balance each other, never one alone.
export const role = {
  action: colors.glowTeal, // primary CTAs, active nav, active chrome
  actionDeep: colors.inkSoft, // pressed/deep teal state
  identity: colors.stamp, // "you", HOST stamp, self-face ring — orange, nothing else
  identityDeep: colors.stampDeep,
  activeNav: colors.glowTeal,
  inactiveNav: colors.inkFaint,
} as const;
