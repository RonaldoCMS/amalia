import { useState } from 'react'
import { ChallengeType, ChallengeLevel, ChallengeLanguage } from '@amelia/shared'

interface ChallengeConfiguration {
  type: ChallengeType
  level: ChallengeLevel
  language: ChallengeLanguage
}

interface UseConfigurationChallengeReturn {
  configuration: ChallengeConfiguration
  setType: (type: ChallengeType) => void
  setLevel: (level: ChallengeLevel) => void
  setLanguage: (language: ChallengeLanguage) => void
}

export function useConfigurationChallenge(): UseConfigurationChallengeReturn {
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

  return { configuration, setType, setLevel, setLanguage }
}