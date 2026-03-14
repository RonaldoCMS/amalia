'use client'

import { ChallengeType, ChallengeLevel, ChallengeLanguage } from '@amelia/shared'
import { ConfigurationSelector } from './ConfigurationSelector'
import { useConfigurationChallenge } from '../../hooks/useConfigurationChallenge'
import { useRouter } from 'next/navigation'

const typeOptions = [
  { label: 'Completa il codice', value: ChallengeType.Fill },
  { label: 'Risposta multipla', value: ChallengeType.Quiz },
  { label: 'Trova il bug', value: ChallengeType.Bug },
  { label: 'Scrivi la funzione', value: ChallengeType.Write },
]

const levelOptions = [
  { label: 'Beginner', value: ChallengeLevel.Beginner },
  { label: 'Intermediate', value: ChallengeLevel.Intermediate },
  { label: 'Hard', value: ChallengeLevel.Hard },
]

const languageOptions = [
  { label: 'TypeScript', value: ChallengeLanguage.TypeScript },
  { label: 'JavaScript', value: ChallengeLanguage.JavaScript },
  { label: 'Python', value: ChallengeLanguage.Python },
]

export function ConfigurationPanel() {
  const { configuration, setType, setLevel, setLanguage } = useConfigurationChallenge()
  const router = useRouter()

  return (
    <div>
      <ConfigurationSelector
        label="Tipo di esercizio"
        options={typeOptions}
        selected={configuration.type}
        onChange={setType}
      />
      <ConfigurationSelector
        label="Livello"
        options={levelOptions}
        selected={configuration.level}
        onChange={setLevel}
      />
      <ConfigurationSelector
        label="Linguaggio"
        options={languageOptions}
        selected={configuration.language}
        onChange={setLanguage}
      />
      <button
        onClick={() => router.push('/challenge')}
        className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors mt-4"
      >
        Inizia con Amelia →
      </button>
    </div>
  )
}