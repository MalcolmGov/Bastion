export interface CorporateLocale {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  isDefault?: boolean;
}

export const SUPPORTED_LOCALES: CorporateLocale[] = [
  {
    code: 'en',
    name: 'English (Global)',
    nativeName: 'English',
    flag: '🌐',
    region: 'Johannesburg / London / Perth',
    isDefault: true
  },
  {
    code: 'es',
    name: 'Español (Américas)',
    nativeName: 'Español',
    flag: '🇨🇱',
    region: 'Salares Norte (Chile) & Cerro Corona (Perú)'
  },
  {
    code: 'fr',
    name: 'Français (West Africa)',
    nativeName: 'Français',
    flag: '🇬🇭',
    region: 'Tarkwa & Damang (Ghana)'
  },
  {
    code: 'zu',
    name: 'isiZulu (South Africa)',
    nativeName: 'isiZulu',
    flag: '🇿🇦',
    region: 'South Deep Gold Mine (Gauteng)'
  },
  {
    code: 'af',
    name: 'Afrikaans (South Africa)',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
    region: 'Corporate & Regional Operations'
  }
];

export const DEFAULT_LOCALE = 'en';

export function getLocaleMeta(code: string): CorporateLocale {
  const normalized = code.toLowerCase().split('-')[0];
  return SUPPORTED_LOCALES.find(l => l.code === normalized) || SUPPORTED_LOCALES[0];
}

export function resolveLocalizedText(
  value: string | Record<string, string> | undefined | null,
  locale: string,
  fallbackLocale = DEFAULT_LOCALE
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;

  const targetLang = locale.toLowerCase().split('-')[0];
  if (value[targetLang] && value[targetLang].trim()) {
    return value[targetLang];
  }

  // Fallback to default
  const defaultLang = fallbackLocale.toLowerCase().split('-')[0];
  if (value[defaultLang] && value[defaultLang].trim()) {
    return value[defaultLang];
  }

  // Return any available translation
  const firstAvailable = Object.values(value)[0];
  return firstAvailable || '';
}
