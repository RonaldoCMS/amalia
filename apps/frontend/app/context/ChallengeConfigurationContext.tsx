'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ChallengeType, ChallengeLevel, ChallengeLanguage, ChallengeCategory, getTopicsByCategory } from '@amalia/shared'

interface ChallengeConfiguration {
  type: ChallengeType
  level: ChallengeLevel
  // New topic system
  category: ChallengeCategory
  topic: string
  subtopics: string[]
  // Legacy (derived for backward compatibility)
  language: ChallengeLanguage
}

interface ChallengeConfigurationContextType {
  configuration: ChallengeConfiguration
  setType: (type: ChallengeType) => void
  setLevel: (level: ChallengeLevel) => void
  setCategory: (category: ChallengeCategory) => void
  setTopic: (topic: string) => void
  setSubtopics: (subtopics: string[]) => void
  toggleSubtopic: (subtopic: string) => void
  // Legacy
  setLanguage: (language: ChallengeLanguage) => void
}

const ChallengeConfigurationContext = createContext<ChallengeConfigurationContextType | null>(null)

// Map topic ID to legacy ChallengeLanguage
function topicToLanguage(topic: string): ChallengeLanguage {
  const mapping: Record<string, ChallengeLanguage> = {
    typescript: ChallengeLanguage.TypeScript,
    javascript: ChallengeLanguage.JavaScript,
    python: ChallengeLanguage.Python,
    java: ChallengeLanguage.Java,
    csharp: ChallengeLanguage.CSharp,
    go: ChallengeLanguage.Go,
    rust: ChallengeLanguage.Rust,
    cpp: ChallengeLanguage.Cpp,
    c: ChallengeLanguage.C,
    php: ChallengeLanguage.PHP,
    ruby: ChallengeLanguage.Ruby,
    swift: ChallengeLanguage.Swift,
    kotlin: ChallengeLanguage.Kotlin,
    dart: ChallengeLanguage.Dart,
  }
  return mapping[topic] ?? ChallengeLanguage.TypeScript
}

export function ChallengeConfigurationProvider({ children }: { children: ReactNode }) {
  const [configuration, setConfiguration] = useState<ChallengeConfiguration>({
    type: ChallengeType.Quiz,
    level: ChallengeLevel.Beginner,
    category: ChallengeCategory.Programming,
    topic: 'typescript',
    subtopics: [],
    language: ChallengeLanguage.TypeScript,
  })

  const setType = (type: ChallengeType) =>
    setConfiguration(prev => ({ ...prev, type }))

  const setLevel = (level: ChallengeLevel) =>
    setConfiguration(prev => ({ ...prev, level }))

  const setCategory = (category: ChallengeCategory) => {
    const topics = getTopicsByCategory(category)
    const firstTopic = topics[0]?.id ?? ''
    setConfiguration(prev => ({
      ...prev,
      category,
      topic: firstTopic,
      subtopics: [],
      language: topicToLanguage(firstTopic),
    }))
  }

  const setTopic = (topic: string) =>
    setConfiguration(prev => ({
      ...prev,
      topic,
      subtopics: [],
      language: topicToLanguage(topic),
    }))

  const setSubtopics = (subtopics: string[]) =>
    setConfiguration(prev => ({ ...prev, subtopics }))

  const toggleSubtopic = (subtopic: string) =>
    setConfiguration(prev => ({
      ...prev,
      subtopics: prev.subtopics.includes(subtopic)
        ? prev.subtopics.filter(s => s !== subtopic)
        : [...prev.subtopics, subtopic],
    }))

  const setLanguage = (language: ChallengeLanguage) =>
    setConfiguration(prev => ({ ...prev, language }))

  return (
    <ChallengeConfigurationContext.Provider
      value={{
        configuration,
        setType,
        setLevel,
        setCategory,
        setTopic,
        setSubtopics,
        toggleSubtopic,
        setLanguage,
      }}
    >
      {children}
    </ChallengeConfigurationContext.Provider>
  )
}

export function useChallengeConfiguration() {
  const context = useContext(ChallengeConfigurationContext)
  if (!context) throw new Error('useChallengeConfiguration must be used within ChallengeConfigurationProvider')
  return context
}