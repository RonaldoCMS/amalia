'use client'

import {
  ChallengeCategory,
  TOPICS,
  getTopicsByCategory,
  getTopicById,
  TopicDefinition,
} from '@amalia/shared'
import { CategoryIcon, TopicIcon } from './TopicIcons'

const CATEGORY_META: Record<ChallengeCategory, { label: string }> = {
  [ChallengeCategory.Programming]: { label: 'Programming' },
  [ChallengeCategory.Database]: { label: 'Database' },
  [ChallengeCategory.DevOps]: { label: 'DevOps' },
  [ChallengeCategory.Security]: { label: 'Security' },
  [ChallengeCategory.Tools]: { label: 'Tools' },
}

interface TopicSelectorProps {
  category: ChallengeCategory
  topic: string
  subtopics: string[]
  onCategoryChange: (cat: ChallengeCategory) => void
  onTopicChange: (topic: string) => void
  onSubtopicToggle: (subtopic: string) => void
}

export function TopicSelector({
  category,
  topic,
  subtopics,
  onCategoryChange,
  onTopicChange,
  onSubtopicToggle,
}: TopicSelectorProps) {
  const categoryTopics = getTopicsByCategory(category)
  const selectedTopic = topic ? getTopicById(topic) : null

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 font-mono">
          Categoria
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.values(ChallengeCategory).map(cat => {
            const meta = CATEGORY_META[cat]
            const isSelected = category === cat
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all font-mono flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <CategoryIcon category={cat} size="sm" />
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Topic grid */}
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 font-mono">
          Topic
        </p>
        <div className="flex flex-wrap gap-2">
          {categoryTopics.map(t => {
            const isSelected = topic === t.id
            return (
              <button
                key={t.id}
                onClick={() => onTopicChange(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all font-mono flex items-center gap-2 ${
                  isSelected
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <TopicIcon id={t.id} size="sm" />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Subtopics (if any) */}
      {selectedTopic?.subtopics && selectedTopic.subtopics.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 font-mono">
            Framework & Tools <span className="text-zinc-600">(opzionale, multi-select)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTopic.subtopics.map(sub => {
              const isSelected = subtopics.includes(sub.id)
              return (
                <button
                  key={sub.id}
                  onClick={() => onSubtopicToggle(sub.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all font-mono ${
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {sub.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
