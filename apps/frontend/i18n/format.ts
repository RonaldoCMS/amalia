import { LOCALE_DATE_MAP, SupportedLocale } from './config'

function getDateLocale(locale: SupportedLocale): string {
  return LOCALE_DATE_MAP[locale] ?? 'it-IT'
}

export function formatDate(
  date: string | Date,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(getDateLocale(locale), options)
}

export function formatTime(
  date: string | Date,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(getDateLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

export function formatNumber(
  num: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions,
): string {
  return num.toLocaleString(getDateLocale(locale), options)
}

export function formatDateShort(date: string | Date, locale: SupportedLocale): string {
  return formatDate(date, locale, { day: '2-digit', month: 'short' })
}

export function formatDateFull(date: string | Date, locale: SupportedLocale): string {
  return formatDate(date, locale, { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatMonthYear(date: string | Date, locale: SupportedLocale): string {
  return formatDate(date, locale, { month: 'long', year: 'numeric' })
}
