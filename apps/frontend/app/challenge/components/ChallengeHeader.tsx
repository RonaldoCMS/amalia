'use client'

import { ChallengeLevel, ChallengeType, ChallengeLanguage } from '@amalia/shared'

interface ChallengeHeaderProps {
  title: string
  description: string
  type: ChallengeType
  level: ChallengeLevel
  language: ChallengeLanguage
}

const levelColors: Record<ChallengeLevel, string> = {
  [ChallengeLevel.Beginner]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  [ChallengeLevel.Intermediate]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  [ChallengeLevel.Hard]: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export function ChallengeHeader({ title, description, type, level, language }: ChallengeHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
          {language}
        </span>
        <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${levelColors[level]}`}>
          {level}
        </span>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-violet-400/20 bg-violet-400/10 text-violet-400">
          {type}
        </span>
      </div>
      <h2 className="text-base font-semibold text-zinc-100 mb-2 flex items-center gap-2">
        <span className="text-cyan-400 font-mono">{'>'}</span>
        {title}
      </h2>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}