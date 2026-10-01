import type { SectionStyles } from './types';

export function getFontFamilyClass(fontFamily?: SectionStyles['fontFamily'], defaultFont: string = 'font-sans'): string {
  if (!fontFamily) return defaultFont;
  switch (fontFamily) {
    case 'serif':
      return 'font-serif';
    case 'mono':
      return 'font-mono';
    case 'sans':
    default:
      return 'font-sans';
  }
}

export function getHeadingScaleClass(scale?: SectionStyles['headingScale'], defaultClass: string = 'text-4xl sm:text-5xl md:text-6xl'): string {
  if (!scale) return defaultClass;
  switch (scale) {
    case 'compact':
      return 'text-3xl sm:text-4xl md:text-5xl';
    case 'hero':
      return 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl';
    case 'ultra':
      return 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl';
    case 'normal':
    default:
      return 'text-4xl sm:text-5xl md:text-6xl';
  }
}

export function getTrackingClass(tracking?: SectionStyles['letterSpacing'], defaultClass: string = 'tracking-tight'): string {
  if (!tracking) return defaultClass;
  switch (tracking) {
    case 'tighter':
      return 'tracking-tighter';
    case 'tight':
      return 'tracking-tight';
    case 'normal':
      return 'tracking-normal';
    case 'wide':
      return 'tracking-wide';
    case 'expanded':
      return 'tracking-widest';
    default:
      return defaultClass;
  }
}

export function getAlignmentClasses(alignment?: SectionStyles['alignment'], defaultAlign: 'left' | 'center' = 'left') {
  const align = alignment || defaultAlign;
  switch (align) {
    case 'center':
      return {
        text: 'text-center',
        container: 'mx-auto items-center text-center',
        buttons: 'justify-center',
        isCenter: true
      };
    case 'split':
      return {
        text: 'text-left',
        container: 'items-start text-left',
        buttons: 'justify-between',
        isCenter: false
      };
    case 'left':
    default:
      return {
        text: 'text-left',
        container: 'items-start text-left',
        buttons: 'justify-start',
        isCenter: false
      };
  }
}

export function getContainerWidthClass(containerWidth?: SectionStyles['containerWidth'], defaultWidth: string = 'max-w-7xl'): string {
  if (!containerWidth) return defaultWidth;
  switch (containerWidth) {
    case 'compact':
      return 'max-w-4xl';
    case 'standard':
      return 'max-w-6xl';
    case 'wide':
      return 'max-w-7xl';
    case 'full':
      return 'w-full max-w-none';
    default:
      return defaultWidth;
  }
}

export function getBorderRadiusClass(radius?: SectionStyles['borderRadius'], defaultRadius: string = 'rounded-xl'): string {
  if (!radius) return defaultRadius;
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-sm';
    case 'md':
      return 'rounded-md';
    case 'lg':
      return 'rounded-lg';
    case 'xl':
      return 'rounded-xl';
    case '2xl':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-full';
    default:
      return defaultRadius;
  }
}

export function getGlowEffectStyles(glow?: SectionStyles['glowEffect']): React.CSSProperties {
  if (!glow || glow === 'none') return {};
  switch (glow) {
    case 'blue':
      return {
        boxShadow: '0 0 70px -15px rgba(56, 189, 248, 0.35)',
      };
    case 'gold':
      return {
        boxShadow: '0 0 70px -15px rgba(245, 158, 11, 0.35)',
      };
    case 'emerald':
      return {
        boxShadow: '0 0 70px -15px rgba(16, 185, 129, 0.35)',
      };
    case 'purple':
      return {
        boxShadow: '0 0 70px -15px rgba(168, 85, 247, 0.35)',
      };
    case 'rose':
      return {
        boxShadow: '0 0 70px -15px rgba(244, 63, 94, 0.35)',
      };
    default:
      return {};
  }
}
