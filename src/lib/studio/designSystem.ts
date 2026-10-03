import type { BrandKit, SectionStyles } from './types';
import type { StandardThemeJson } from './brandExtractor';

export const COLOR_DEFAULTS = {
  primary: '#173A45', secondary: '#244F5B', accent: '#B98536', background: '#FAF9F6',
  surface: '#FFFFFF', textPrimary: '#172A31', textMuted: '#53656D', hairline: '#DCE3E3',
};
export type ColorRole = keyof typeof COLOR_DEFAULTS;
export interface WebsiteDesignSystem {
  version: 1;
  colors: Record<ColorRole, string>;
  typography: { headingFont: string; bodyFont: string; headingWeight: string; scaleRatio: number };
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  spacing: number[];
  logoUrl: string;
  sourceUrl?: string;
  evidence: Record<string, string>;
}

export function safeAssetUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 4096) return '';
  if (/^\/(?!\/)[a-zA-Z0-9/_% .?=&+-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    const host = url.hostname.toLowerCase();
    if (host.includes(':') || /^\d+\./.test(host) || host === 'localhost' || /\.(local|internal)$/.test(host)) return '';
    return url.href;
  } catch { return ''; }
}
export function safeFont(value: unknown, fallback = 'Arial'): string {
  return typeof value === 'string' && /^[\w -]{1,70}$/.test(value.trim()) ? value.trim() : fallback;
}
function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : fallback;
}
export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

/** One semantic contract for reviewed kits and extracted CSS. Missing values remain proposals. */
export function createDesignSystem(kit: Partial<BrandKit> = {}, theme?: StandardThemeJson, sourceUrl?: string): WebsiteDesignSystem {
  const themeRoles = { primary: 'primary', secondary: 'primary', accent: 'accent', background: 'bg', surface: 'surface', textPrimary: 'text', textMuted: 'muted', hairline: 'border' } as const;
  const colors = Object.fromEntries(Object.entries(COLOR_DEFAULTS).map(([role, fallback]) => {
    const key = role as ColorRole;
    return [role, color(kit.colors?.[key]?.value ?? theme?.color?.[themeRoles[key]], fallback)];
  })) as Record<ColorRole, string>;
  return {
    version: 1, colors,
    typography: {
      headingFont: safeFont(kit.typography?.headingFont ?? theme?.font?.heading, 'Georgia'),
      bodyFont: safeFont(kit.typography?.bodyFont ?? theme?.font?.body),
      headingWeight: /^[1-9]00$/.test(kit.typography?.headingWeight || '') ? kit.typography!.headingWeight : '600',
      scaleRatio: Math.min(1.5, Math.max(1.1, Number(kit.typography?.scaleRatio) || 1.25)),
    },
    radius: ['none', 'sm', 'md', 'lg', 'full'].includes(kit.componentRules?.radius || '') ? kit.componentRules!.radius : theme?.radius?.md ? theme.radius.md <= 4 ? 'sm' : theme.radius.md <= 8 ? 'md' : 'lg' : 'lg',
    spacing: Array.isArray(theme?.space) && theme.space.some(v => Number.isFinite(v) && v > 0) ? [...new Set(theme.space.filter(v => Number.isFinite(v) && v > 0 && v <= 160))].sort((a, b) => a - b).slice(0, 12) : [4, 8, 12, 16, 24, 32, 48, 64, 96],
    logoUrl: safeAssetUrl(kit.logos?.primary?.url ?? theme?.logo?.primary),
    ...(safeAssetUrl(sourceUrl) ? { sourceUrl: safeAssetUrl(sourceUrl) } : {}),
    evidence: theme ? Object.fromEntries(Object.entries(themeRoles).map(([role, themeRole]) => [role, theme.sources?.[`color.${themeRole}`] || `Inferred ${role} candidate; agency review required`])) : Object.fromEntries(Object.entries(kit.colors || {}).map(([role, token]) => [role, token.evidence || 'Agency design proposal'])),
  };
}
export function normalizeDesignSystem(candidate: WebsiteDesignSystem): WebsiteDesignSystem {
  const kit: Partial<BrandKit> = {
    colors: Object.fromEntries(Object.keys(COLOR_DEFAULTS).map(role => [role, { value: candidate.colors?.[role as ColorRole] }])) as BrandKit['colors'],
    typography: { ...candidate.typography, status: 'approved' },
    logos: { primary: { url: candidate.logoUrl, status: 'approved' } },
    componentRules: { radius: candidate.radius, buttonStyle: 'solid', shadows: 'subtle', imageryDirection: 'Reviewed client imagery' },
  };
  const system = createDesignSystem(kit, { space: candidate.spacing } as StandardThemeJson, candidate.sourceUrl);
  system.evidence = Object.fromEntries(Object.entries(candidate.evidence || {}).filter(([key, value]) => key.length < 100 && typeof value === 'string' && value.length < 2000));
  return system;
}
export function designSystemIssues(system: WebsiteDesignSystem): string[] {
  const { colors: c } = system;
  const issues: string[] = [];
  for (const [label, foreground, background] of [
    ['Body text on canvas', c.textPrimary, c.background], ['Body text on surface', c.textPrimary, c.surface],
    ['Muted text on canvas', c.textMuted, c.background], ['Muted text on surface', c.textMuted, c.surface],
  ]) if (contrastRatio(foreground, background) < 4.5) issues.push(`${label} needs at least 4.5:1 contrast.`);
  return issues;
}
export function sectionDesignStyles(system: WebsiteDesignSystem, surface = false): SectionStyles {
  const c = system.colors;
  return {
    backgroundColor: surface ? c.surface : c.background, textColor: c.textPrimary, headingColor: c.textPrimary,
    accentColor: contrastRatio(c.accent, surface ? c.surface : c.background) >= 4.5 ? c.accent : contrastRatio(c.primary, surface ? c.surface : c.background) >= 4.5 ? c.primary : c.textPrimary,
    borderColor: c.hairline, theme: contrastRatio('#FFFFFF', c.background) > contrastRatio('#000000', c.background) ? 'dark' : 'light',
    backgroundType: 'solid', paddingY: system.spacing.at(-1)! >= 96 ? 'py-24' : system.spacing.at(-1)! >= 64 ? 'py-16' : 'py-12', borderRadius: system.radius, containerWidth: 'wide',
    fontFamily: /georgia|times|serif|playfair/i.test(system.typography.headingFont) ? 'serif' : 'sans',
    headingFont: system.typography.headingFont, bodyFont: system.typography.bodyFont, headingWeight: system.typography.headingWeight,
    headingScale: system.typography.scaleRatio >= 1.4 ? 'hero' : system.typography.scaleRatio <= 1.15 ? 'compact' : 'normal', letterSpacing: 'tight',
  };
}
export function designSystemCss(system: WebsiteDesignSystem): string {
  const colors = Object.entries(system.colors).map(([key, value]) => `  --color-${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${value};`);
  const radius = { none: 0, sm: 4, md: 8, lg: 16, full: 9999 }[system.radius];
  return `:root {\n${colors.join('\n')}\n  --font-heading: "${safeFont(system.typography.headingFont)}", serif;\n  --font-body: "${safeFont(system.typography.bodyFont)}", sans-serif;\n  --radius-component: ${radius}px;\n  --font-heading-weight: ${system.typography.headingWeight};\n  --type-scale-ratio: ${system.typography.scaleRatio};\n${system.spacing.map((v, i) => `  --space-${i + 1}: ${v}px;`).join('\n')}\n}\n`;
}
