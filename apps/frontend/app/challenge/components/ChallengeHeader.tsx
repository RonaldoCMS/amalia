'use client'

import { ChallengeLevel, ChallengeType, ChallengeLanguage } from '@amelia/shared'

interface ChallengeHeaderProps {
  title: string
  description: string
  type: ChallengeType
  level: ChallengeLevel
  language: ChallengeLanguage
}

export function ChallengeHeader({ title, description, type, level, language }: ChallengeHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-3">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">{language}</span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800">{level}</span>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">{type}</span>
      </div>
      <h1 className="text-xl font-medium text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}