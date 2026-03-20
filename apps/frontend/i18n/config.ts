export const SUPPORTED_LOCALES = ['it', 'en', 'de', 'fr', 'es', 'pt', 'ru'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'it'
export const FALLBACK_LOCALE: SupportedLocale = 'en'

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  it: 'Italiano',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
}

export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  it: '🇮🇹',
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  pt: '🇧🇷',
  ru: '🇷🇺',
}

export const LOCALE_DATE_MAP: Record<SupportedLocale, string> = {
  it: 'it-IT',
  en: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-BR',
  ru: 'ru-RU',
}

export const LOCALE_LANGUAGE_NAMES: Record<SupportedLocale, string> = {
  it: 'italiano',
  en: 'English',
  de: 'Deutsch',
  fr: 'français',
  es: 'español',
  pt: 'português',
  ru: 'русский',
}

const COUNTRY_TO_LOCALE: Record<string, SupportedLocale> = {
  IT: 'it',
  DE: 'de',
  AT: 'de',
  CH: 'de',
  FR: 'fr',
  BE: 'fr',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  BR: 'pt',
  PT: 'pt',
  RU: 'ru',
}

export function countryToLocale(countryCode: string): SupportedLocale {
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? FALLBACK_LOCALE
}

export function isValidLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

export const STORAGE_KEY = 'amalia-lang'
