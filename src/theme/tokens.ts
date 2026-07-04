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
