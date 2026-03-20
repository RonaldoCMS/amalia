'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChallengeType, ChallengeLevel, ChallengeLanguage } from '@amalia/shared'
import { ConfigurationSelector } from './ConfigurationSelector'
import { useConfigurationChallenge } from '../../hooks/useConfigurationChallenge'

const typeOptions = [
  { label: '{ } Fill', value: ChallengeType.Fill },
  { label: '?! Quiz', value: ChallengeType.Quiz },
  { label: '>< Bug', value: ChallengeType.Bug },
  { label: 'fn Write', value: ChallengeType.Write },
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
  { label: 'Dart', value: ChallengeLanguage.Dart },
  { label: 'Flutter', value: ChallengeLanguage.Flutter },
  { label: 'Java', value: ChallengeLanguage.Java },
  { label: 'Go', value: ChallengeLanguage.Go },
  { label: 'Rust', value: ChallengeLanguage.Rust },
  { label: 'C++', value: ChallengeLanguage.Cpp },
  { label: 'C#', value: ChallengeLanguage.CSharp },
  { label: 'PHP', value: ChallengeLanguage.PHP },
  { label: 'Ruby', value: ChallengeLanguage.Ruby },
  { label: 'Swift', value: ChallengeLanguage.Swift },
  { label: 'Kotlin', value: ChallengeLanguage.Kotlin },
]

interface ConfigurationPanelProps {
  onStart: (langOverride?: ChallengeLanguage) => void
}

export function ConfigurationPanel({ onStart }: ConfigurationPanelProps) {
  const { configuration, setType, setLevel, setLanguage } = useConfigurationChallenge()
  const [isRandomLang, setIsRandomLang] = useState(false)
  const t = useTranslations('Challenge')

  const handleLangChange = (lang: ChallengeLanguage) => {
    setIsRandomLang(false)
    setLanguage(lang)
  }

  const handleStart = () => {
    if (isRandomLang) {
      const langs = Object.values(ChallengeLanguage)
      const picked = langs[Math.floor(Math.random() * langs.length)]
      onStart(picked)
    } else {
      onStart()
    }
  }

  return (
    <div>
      <ConfigurationSelector
        label={t('exerciseType')}
        options={typeOptions}
        selected={configuration.type}
        onChange={setType}
      />
      <ConfigurationSelector
        label={t('level')}
        options={levelOptions}
        selected={configuration.level}
        onChange={setLevel}
      />

      {/* Language + Random */}
      <div className="mb-6">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 font-mono">{t('language')}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsRandomLang(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all font-mono ${
              isRandomLang
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {t('random')}
          </button>
          {languageOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleLangChange(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all font-mono ${
                !isRandomLang && configuration.language === opt.value
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        className="w-full py-3 rounded-lg bg-cyan-500 text-zinc-950 text-sm font-semibold hover:bg-cyan-400 transition-colors mt-6 glow-cyan"
      >
        {t('generate')}
      </button>
    </div>
  )
}