'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChallengeType, ChallengeLevel, getRandomTopic } from '@amalia/shared'
import { ConfigurationSelector } from './ConfigurationSelector'
import { TopicSelector } from './TopicSelector'
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

interface ConfigurationPanelProps {
  onStart: () => void
}

export function ConfigurationPanel({ onStart }: ConfigurationPanelProps) {
  const {
    configuration,
    setType,
    setLevel,
    setCategory,
    setTopic,
    toggleSubtopic,
  } = useConfigurationChallenge()
  const [isRandom, setIsRandom] = useState(false)
  const t = useTranslations('Challenge')

  const handleTopicChange = (topic: string) => {
    setIsRandom(false)
    setTopic(topic)
  }

  const handleStart = () => {
    if (isRandom) {
      const randomTopic = getRandomTopic()
      setCategory(randomTopic.category)
      setTopic(randomTopic.id)
    }
    onStart()
  }

  const canStart = isRandom || configuration.topic

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

      {/* Topic selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsRandom(!isRandom)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all font-mono flex items-center gap-2 ${
              isRandom
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            🎲 {t('random')}
          </button>
        </div>

        {!isRandom && (
          <TopicSelector
            category={configuration.category}
            topic={configuration.topic}
            subtopics={configuration.subtopics}
            onCategoryChange={setCategory}
            onTopicChange={handleTopicChange}
            onSubtopicToggle={toggleSubtopic}
          />
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full py-3 rounded-lg bg-cyan-500 text-zinc-950 text-sm font-semibold hover:bg-cyan-400 transition-colors mt-6 glow-cyan disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('generate')}
      </button>
    </div>
  )
}