'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ChallengeType, ChallengeLevel, ChallengeLanguage } from '@amalia/shared'

interface ChallengeConfiguration {
  type: ChallengeType
  level: ChallengeLevel
  language: ChallengeLanguage
}

interface ChallengeConfigurationContextType {
  configuration: ChallengeConfiguration
  setType: (type: ChallengeType) => void
  setLevel: (level: ChallengeLevel) => void
  setLanguage: (language: ChallengeLanguage) => void
}

const ChallengeConfigurationContext = createContext<ChallengeConfigurationContextType | null>(null)

export function ChallengeConfigurationProvider({ children }: { children: ReactNode }) {
  const [configuration, setConfiguration] = useState<ChallengeConfiguration>({
    type: ChallengeType.Quiz,
    level: ChallengeLevel.Beginner,
    language: ChallengeLanguage.TypeScript,
  })

  const setType = (type: ChallengeType) =>
    setConfiguration(prev => ({ ...prev, type }))

  const setLevel = (level: ChallengeLevel) =>
    setConfiguration(prev => ({ ...prev, level }))

  const setLanguage = (language: ChallengeLanguage) =>
    setConfiguration(prev => ({ ...prev, language }))

  return (
    <ChallengeConfigurationContext.Provider value={{ configuration, setType, setLevel, setLanguage }}>
      {children}
    </ChallengeConfigurationContext.Provider>
  )
}

export function useChallengeConfiguration() {
  const context = useContext(ChallengeConfigurationContext)
  if (!context) throw new Error('useChallengeConfiguration must be used within ChallengeConfigurationProvider')
  return context
}