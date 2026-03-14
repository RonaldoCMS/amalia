export enum ChallengeType {
  Fill = 'fill',
  Quiz = 'quiz',
  Bug = 'bug',
  Write = 'write',
}

export enum ChallengeLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Hard = 'hard',
}

export enum ChallengeLanguage {
  TypeScript = 'TypeScript',
  JavaScript = 'JavaScript',
  Python = 'Python',
}

// frontend → backend
export interface GenerateChallengeRequest {
  type: ChallengeType
  level: ChallengeLevel
  language: ChallengeLanguage
}

export interface EvaluateChallengeRequest {
  challenge: ChallengeResponse
  type: ChallengeType
  level: ChallengeLevel
  language: ChallengeLanguage
  userAnswer: string
}

// backend → frontend
export interface ChallengeResponse {
  title: string
  description: string
  code: string
  options: string[]
  answer: string
}

export interface EvaluationResponse {
  correct: boolean
  feedback: string
}

// Auth
export interface RegisterRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
}