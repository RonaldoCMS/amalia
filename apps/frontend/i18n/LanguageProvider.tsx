'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  STORAGE_KEY,
  countryToLocale,
  isValidLocale,
} from './config'

import it from '../messages/it.json'
import en from '../messages/en.json'
import de from '../messages/de.json'
import fr from '../messages/fr.json'
import es from '../messages/es.json'
import pt from '../messages/pt.json'
import ru from '../messages/ru.json'

const allMessages: Record<SupportedLocale, Record<string, unknown>> = {
  it: it as Record<string, unknown>,
  en: en as Record<string, unknown>,
  de: de as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  es: es as Record<string, unknown>,
  pt: pt as Record<string, unknown>,
  ru: ru as Record<string, unknown>,
}

interface LanguageContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
}

const LanguageContext = createContext<LanguageContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && isValidLocale(stored)) return stored
  return DEFAULT_LOCALE
}

async function detectLocaleByIP(): Promise<SupportedLocale> {
  try {
    const res = await fetch('http://ip-api.com/json/?fields=countryCode', { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return DEFAULT_LOCALE
    const data = await res.json()
    if (data.countryCode) return countryToLocale(data.countryCode)
  } catch {
    // ignore — fall back to default
  }
  return DEFAULT_LOCALE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(getInitialLocale)

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale

    // Sync to backend if authenticated
    const token = localStorage.getItem('token')
    if (token) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
      fetch(`${backendUrl}/user/language`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ language: newLocale }),
      }).catch(() => {})
    }
  }, [])

  // IP detection on first visit (no stored locale)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      detectLocaleByIP().then(detected => {
        setLocale(detected)
      })
    }
  }, [setLocale])

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Load preferredLanguage from backend profile after auth
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
    fetch(`${backendUrl}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(profile => {
        if (profile?.preferredLanguage && isValidLocale(profile.preferredLanguage)) {
          setLocaleState(profile.preferredLanguage as SupportedLocale)
          localStorage.setItem(STORAGE_KEY, profile.preferredLanguage)
          document.documentElement.lang = profile.preferredLanguage
        }
      })
      .catch(() => {})
  }, [])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return (
    <LanguageContext.Provider value={value}>
      <NextIntlClientProvider key={locale} locale={locale} messages={allMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  )
}
