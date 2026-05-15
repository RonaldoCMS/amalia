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

// ── Topic System ─────────────────────────────────────────────────────────

export enum ChallengeCategory {
  Programming = 'programming',
  Database = 'database',
  DevOps = 'devops',
  Security = 'security',
  Tools = 'tools',
}

export interface SubtopicDefinition {
  id: string
  label: string
}

export interface TopicDefinition {
  id: string
  label: string
  category: ChallengeCategory
  subtopics?: SubtopicDefinition[]
}

export const TOPICS: TopicDefinition[] = [
  // ─── Programming ───────────────────────────────────────────────────────
  {
    id: 'typescript',
    label: 'TypeScript',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'nestjs', label: 'NestJS' },
      { id: 'prisma', label: 'Prisma' },
      { id: 'react', label: 'React' },
      { id: 'nextjs', label: 'Next.js' },
      { id: 'express', label: 'Express' },
      { id: 'typeorm', label: 'TypeORM' },
    ],
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'react', label: 'React' },
      { id: 'vue', label: 'Vue' },
      { id: 'nodejs', label: 'Node.js' },
      { id: 'express', label: 'Express' },
      { id: 'angular', label: 'Angular' },
    ],
  },
  {
    id: 'python',
    label: 'Python',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'django', label: 'Django' },
      { id: 'fastapi', label: 'FastAPI' },
      { id: 'flask', label: 'Flask' },
      { id: 'pandas', label: 'Pandas' },
      { id: 'numpy', label: 'NumPy' },
      { id: 'pytorch', label: 'PyTorch' },
    ],
  },
  {
    id: 'java',
    label: 'Java',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'spring', label: 'Spring Boot' },
      { id: 'hibernate', label: 'Hibernate' },
      { id: 'maven', label: 'Maven' },
    ],
  },
  {
    id: 'csharp',
    label: 'C#',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'dotnet', label: '.NET' },
      { id: 'aspnet', label: 'ASP.NET' },
      { id: 'unity', label: 'Unity' },
      { id: 'ef', label: 'Entity Framework' },
    ],
  },
  {
    id: 'go',
    label: 'Go',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'gin', label: 'Gin' },
      { id: 'fiber', label: 'Fiber' },
    ],
  },
  {
    id: 'rust',
    label: 'Rust',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'actix', label: 'Actix' },
      { id: 'tokio', label: 'Tokio' },
    ],
  },
  {
    id: 'cpp',
    label: 'C++',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'stl', label: 'STL' },
      { id: 'qt', label: 'Qt' },
    ],
  },
  {
    id: 'c',
    label: 'C',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'pointers', label: 'Pointers' },
      { id: 'memory', label: 'Memory Management' },
    ],
  },
  {
    id: 'php',
    label: 'PHP',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'laravel', label: 'Laravel' },
      { id: 'symfony', label: 'Symfony' },
    ],
  },
  {
    id: 'ruby',
    label: 'Ruby',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'rails', label: 'Rails' },
      { id: 'sinatra', label: 'Sinatra' },
    ],
  },
  {
    id: 'swift',
    label: 'Swift',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'swiftui', label: 'SwiftUI' },
      { id: 'uikit', label: 'UIKit' },
    ],
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'android', label: 'Android' },
      { id: 'ktor', label: 'Ktor' },
      { id: 'compose', label: 'Compose' },
    ],
  },
  {
    id: 'dart',
    label: 'Dart',
    category: ChallengeCategory.Programming,
    subtopics: [
      { id: 'flutter', label: 'Flutter' },
    ],
  },

  // ─── Database ──────────────────────────────────────────────────────────
  {
    id: 'sql',
    label: 'SQL',
    category: ChallengeCategory.Database,
    subtopics: [
      { id: 'joins', label: 'Joins & Relations' },
      { id: 'subqueries', label: 'Subqueries' },
      { id: 'optimization', label: 'Query Optimization' },
      { id: 'indexes', label: 'Indexes' },
    ],
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL',
    category: ChallengeCategory.Database,
    subtopics: [
      { id: 'jsonb', label: 'JSONB' },
      { id: 'extensions', label: 'Extensions' },
      { id: 'plpgsql', label: 'PL/pgSQL' },
    ],
  },
  {
    id: 'mysql',
    label: 'MySQL',
    category: ChallengeCategory.Database,
  },
  {
    id: 'mongodb',
    label: 'MongoDB',
    category: ChallengeCategory.Database,
    subtopics: [
      { id: 'aggregation', label: 'Aggregation' },
      { id: 'mongoose', label: 'Mongoose' },
    ],
  },
  {
    id: 'redis',
    label: 'Redis',
    category: ChallengeCategory.Database,
  },

  // ─── DevOps ────────────────────────────────────────────────────────────
  {
    id: 'docker',
    label: 'Docker',
    category: ChallengeCategory.DevOps,
    subtopics: [
      { id: 'compose', label: 'Docker Compose' },
      { id: 'networking', label: 'Networking' },
    ],
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    category: ChallengeCategory.DevOps,
    subtopics: [
      { id: 'deployments', label: 'Deployments' },
      { id: 'services', label: 'Services' },
      { id: 'helm', label: 'Helm' },
    ],
  },
  {
    id: 'cicd',
    label: 'CI/CD',
    category: ChallengeCategory.DevOps,
    subtopics: [
      { id: 'github-actions', label: 'GitHub Actions' },
      { id: 'gitlab-ci', label: 'GitLab CI' },
      { id: 'jenkins', label: 'Jenkins' },
    ],
  },
  {
    id: 'terraform',
    label: 'Terraform',
    category: ChallengeCategory.DevOps,
  },
  {
    id: 'aws',
    label: 'AWS',
    category: ChallengeCategory.DevOps,
    subtopics: [
      { id: 'ec2', label: 'EC2' },
      { id: 's3', label: 'S3' },
      { id: 'lambda', label: 'Lambda' },
      { id: 'rds', label: 'RDS' },
    ],
  },

  // ─── Security ──────────────────────────────────────────────────────────
  {
    id: 'web-security',
    label: 'Web Security',
    category: ChallengeCategory.Security,
    subtopics: [
      { id: 'xss', label: 'XSS' },
      { id: 'csrf', label: 'CSRF' },
      { id: 'sql-injection', label: 'SQL Injection' },
      { id: 'owasp', label: 'OWASP Top 10' },
    ],
  },
  {
    id: 'cryptography',
    label: 'Cryptography',
    category: ChallengeCategory.Security,
    subtopics: [
      { id: 'hashing', label: 'Hashing' },
      { id: 'encryption', label: 'Encryption' },
      { id: 'jwt', label: 'JWT' },
    ],
  },
  {
    id: 'network-security',
    label: 'Network Security',
    category: ChallengeCategory.Security,
  },

  // ─── Tools ─────────────────────────────────────────────────────────────
  {
    id: 'git',
    label: 'Git',
    category: ChallengeCategory.Tools,
    subtopics: [
      { id: 'branching', label: 'Branching' },
      { id: 'merging', label: 'Merging & Rebasing' },
      { id: 'workflows', label: 'Workflows' },
    ],
  },
  {
    id: 'linux',
    label: 'Linux/Shell',
    category: ChallengeCategory.Tools,
    subtopics: [
      { id: 'bash', label: 'Bash' },
      { id: 'permissions', label: 'Permissions' },
      { id: 'networking', label: 'Networking' },
    ],
  },
  {
    id: 'regex',
    label: 'Regex',
    category: ChallengeCategory.Tools,
  },
]

// Helper functions
export function getTopicsByCategory(category: ChallengeCategory): TopicDefinition[] {
  return TOPICS.filter(t => t.category === category)
}

export function getTopicById(id: string): TopicDefinition | undefined {
  return TOPICS.find(t => t.id === id)
}

export function getRandomTopic(): TopicDefinition {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)]
}

export function getRandomSubtopics(topicId: string, maxCount = 2): SubtopicDefinition[] {
  const topic = getTopicById(topicId)
  if (!topic?.subtopics || topic.subtopics.length === 0) return []
  const shuffled = [...topic.subtopics].sort(() => Math.random() - 0.5)
  const count = Math.min(Math.floor(Math.random() * (maxCount + 1)), shuffled.length)
  return shuffled.slice(0, count)
}

// Legacy enum for backward compatibility (DB migration deferred)
export enum ChallengeLanguage {
  TypeScript = 'TypeScript',
  JavaScript = 'JavaScript',
  Python = 'Python',
  Dart = 'Dart',
  Flutter = 'Flutter',
  Java = 'Java',
  Go = 'Go',
  Rust = 'Rust',
  Cpp = 'C++',
  CSharp = 'C#',
  PHP = 'PHP',
  Ruby = 'Ruby',
  Swift = 'Swift',
  Kotlin = 'Kotlin',
  C = 'C',
}

// ── Notifiche ────────────────────────────────────────────────────────────

export enum NotificationType {
  NewMatch = 'new_match',
  NewMessage = 'new_message',
  DuelChallenge = 'duel_challenge',
  FriendRequest = 'friend_request',
  FriendAccepted = 'friend_accepted',
  NewPostLike = 'new_post_like',
  NewComment = 'new_comment',
  JobOffer = 'job_offer',
  // Moderation
  ReportSubmitted = 'report_submitted',
  ReportResolved = 'report_resolved',
  UserBanned = 'user_banned',
  UserUnbanned = 'user_unbanned',
  UserMuted = 'user_muted',
  UserUnmuted = 'user_unmuted',
  PostDeletedByMod = 'post_deleted_by_mod',
  CommentDeletedByMod = 'comment_deleted_by_mod',
  MessageDeletedByMod = 'message_deleted_by_mod',
  RoleAssigned = 'role_assigned',
  RoleRemoved = 'role_removed',
  PermissionGranted = 'permission_granted',
  PermissionRevoked = 'permission_revoked',
}

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string
  referenceId: string | null
  read: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

// ── Onboarding ──────────────────────────────────────────────────────────

export enum DevLanguage {
  TypeScript = 'TypeScript',
  JavaScript = 'JavaScript',
  Python = 'Python',
  Java = 'Java',
  Go = 'Go',
  Rust = 'Rust',
  Cpp = 'C++',
  PHP = 'PHP',
  Ruby = 'Ruby',
  Swift = 'Swift',
  Kotlin = 'Kotlin',
  Dart = 'Dart',
  CSharp = 'C#',
  Scala = 'Scala',
}

export enum JobType {
  FullStack = 'FullStack',
  Frontend = 'Frontend',
  Backend = 'Backend',
  DevOps = 'DevOps',
  Mobile = 'Mobile',
  DataScience = 'DataScience',
  Security = 'Security',
  QA = 'QA',
  SRE = 'SRE',
  Student = 'Student',
  Other = 'Other',
}

export enum WorkStyle {
  Remote = 'Remote',
  Office = 'Office',
  Hybrid = 'Hybrid',
}

export enum DevGoal {
  Learn = 'Learn',
  Network = 'Network',
  Collaborate = 'Collaborate',
  Mentor = 'Mentor',
  GetMentored = 'GetMentored',
  FindJob = 'FindJob',
  Freelance = 'Freelance',
  OpenSource = 'OpenSource',
  StartupIdea = 'StartupIdea',
}

export enum Availability {
  FullTime = 'FullTime',
  PartTime = 'PartTime',
  FreelanceOnly = 'FreelanceOnly',
  OpenSource = 'OpenSource',
  NotAvailable = 'NotAvailable',
}

export const EXPERIENCE_LEVELS = ['0', '1-2', '3-5', '6-10', '10+'] as const
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]

export interface OnboardingRequest {
  email?: string
  languages: string[]
  yearsOfExperience: ExperienceLevel
  jobType: JobType
  goals: string[]
  workStyle: WorkStyle
  availability: Availability
  bio?: string
  githubUrl?: string
}

export interface OnboardingResponse {
  completed: boolean
  email: string | null
  languages: string[]
  yearsOfExperience: string | null
  jobType: string | null
  goals: string[]
  workStyle: string | null
  availability: string | null
  bio: string | null
  githubUrl: string | null
}

// ── Match ────────────────────────────────────────────────────────────────

export interface MatchSuggestion {
  userId: string
  username: string
  profilePhotoUrl: string | null
  compatibilityScore: number
  jobType: string | null
  yearsOfExperience: string | null
  languages: string[]
  goals: string[]
  workStyle: string | null
  bio: string | null
  githubUrl: string | null
}

export interface MatchItem {
  matchId: string
  userId: string
  username: string
  profilePhotoUrl: string | null
  compatibilityScore: number
  matchedAt: string
}

export interface LikeResponse {
  matched: boolean
  matchId?: string
}

// ── Chat ─────────────────────────────────────────────────────────────────

export interface ChatMessageItem {
  id: string
  senderId: string
  content: string
  imageUrl?: string | null
  replyToId?: string | null
  isSystemMessage?: boolean
  duelInviteId?: string | null
  createdAt: string
  read: boolean
}

export interface SendMessageRequest {
  content?: string
  replyToId?: string | null
}

export interface UpdateEmailRequest {
  email: string
}

// frontend → backend
export interface GenerateChallengeRequest {
  type: ChallengeType
  level: ChallengeLevel
  topic: string           // e.g. 'typescript', 'sql', 'git'
  subtopics?: string[]    // e.g. ['nestjs', 'prisma']
  // Legacy field for DB compatibility
  language?: ChallengeLanguage
}

export interface EvaluateChallengeRequest {
  challenge: ChallengeResponse
  type: ChallengeType
  level: ChallengeLevel
  topic: string
  subtopics?: string[]
  userAnswer: string
  // Legacy
  language?: ChallengeLanguage
}

// backend → frontend
export interface ChallengeResponse {
  id?: string
  title: string
  description: string
  code: string
  options: string[]
  answer: string
}

export interface EvaluationResponse {
  correct: boolean
  feedback: string
  score: number
}

export interface UserStats {
  totalScore: number
  correctCount: number
  wrongCount: number
}

// Auth
export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserProfile {
  id: string
  username: string
  email: string | null
  profilePhotoUrl: string | null
  role: UserRole
  createdAt: string
  onboardingCompleted: boolean
  preferredLanguage: string | null
}

export interface ChallengeHistoryItem {
  id: string
  correct: boolean | null
  score: number | null
  createdAt: string
  challenge: {
    id: string
    title: string
    description: string
    type: ChallengeType
    level: ChallengeLevel
    language: ChallengeLanguage
  }
}

// ── Duel ─────────────────────────────────────────────────────────────────

export enum DuelStatus {
  Waiting = 'waiting',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface DuelPlayerInfo {
  id: string
  username: string
  profilePhotoUrl: string | null
  totalScore: number
}

export interface DuelCurrentRound {
  roundNumber: number
  type: ChallengeType
  level: ChallengeLevel
  challenge: { title: string; description: string; code: string; options: string[] }
  myAnswer: string | null
  opponentAnswered: boolean
  secondsLeft: number
  totalSeconds: number
}

export interface DuelRoundResult {
  roundNumber: number
  type: ChallengeType
  level: ChallengeLevel
  myCorrect: boolean
  opponentCorrect: boolean
  myScore: number
  opponentScore: number
  correctAnswer: string
}

export interface DuelStateResponse {
  id: string
  status: DuelStatus
  language: string
  me: DuelPlayerInfo
  opponent: DuelPlayerInfo | null
  currentRoundNumber: number
  totalRounds: number
  winnerId: string | null
  isSuddenDeath: boolean
  currentRound: DuelCurrentRound | null
  history: DuelRoundResult[]
  createdAt: string
}

export interface DuelQueueResponse {
  status: 'waiting' | 'matched' | 'none'
  duelId?: string
  banUntil?: string
}

export interface DuelInviteStatusResponse {
  status: 'waiting' | 'active' | 'completed' | 'cancelled'
  challengerId: string
  challengerUsername: string
  invitedUserId: string | null
  invitedUsername: string | null
  user1Score: number
  user2Score: number
  winnerId: string | null
  winnerUsername: string | null
  createdAt: string
}

export interface DuelAnswerRequest {
  answer: string
}

export interface DuelAnswerResponse {
  correct: boolean
  score: number
}

export interface DuelLeaderboardEntry {
  rank: number
  userId: string
  username: string
  profilePhotoUrl: string | null
  wins: number
  losses: number
  draws: number
  totalDuels: number
  winRate: number
  totalScore: number
}

export interface DuelLanguageQueueCount {
  language: string
  count: number
}

export interface DuelJoinQueueRequest {
  language: string
}

// ── Feed (Post) ──────────────────────────────────────────────────────────

export interface PostItem {
  id: string
  authorId: string
  authorUsername: string
  authorProfilePhotoUrl: string | null
  authorRole: UserRole
  content: string
  imageUrl: string | null
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  createdAt: string
}

export interface CreatePostRequest {
  content: string
}

export interface CommentItem {
  id: string
  authorId: string
  authorUsername: string
  authorProfilePhotoUrl: string | null
  authorRole: UserRole
  content: string
  createdAt: string
}

export interface CreateCommentRequest {
  content: string
}

export interface FeedResponse {
  posts: PostItem[]
  total: number
  page: number
  limit: number
}

// ── Friendship ───────────────────────────────────────────────────────────

export enum FriendshipStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Blocked = 'blocked',
}

export interface FriendshipItem {
  id: string
  status: FriendshipStatus
  userId: string
  username: string
  profilePhotoUrl: string | null
  createdAt: string
}

export interface FriendshipStatusResponse {
  status: FriendshipStatus | null
  friendshipId: string | null
  direction: 'sent' | 'received' | null
}

// ── Public Profile & Search ──────────────────────────────────────────────

export interface PublicUserProfile {
  id: string
  username: string
  profilePhotoUrl: string | null
  role: UserRole
  bio: string | null
  languages: string[]
  goals: string[]
  jobType: string | null
  yearsOfExperience: string | null
  workStyle: string | null
  githubUrl: string | null
  challengeStats: UserStats
  duelStats: {
    totalDuels: number
    wins: number
    losses: number
    winRate: number
  }
  createdAt: string
}

export interface UserSearchResult {
  id: string
  username: string
  profilePhotoUrl: string | null
  bio: string | null
}

// ── myCV ─────────────────────────────────────────────────────────────────

export interface CvMessage {
  role: 'amalia' | 'user'
  content: string
}

export interface CvSkill {
  name: string
  verified: boolean
  level: string
}

export interface CvProject {
  name: string
  description: string
  technologies: string[]
}

export interface CvExperience {
  title: string
  company: string
  period: string
  description: string
}

export interface CvData {
  name: string
  title: string
  bio: string
  email: string | null
  githubUrl: string | null
  education: string | null
  softSkills: string[]
  skills: CvSkill[]
  projects: CvProject[]
  experience: CvExperience[]
}

export interface CvAmaliaStats {
  challengesCompleted: number
  accuracy: number
  totalScore: number
  topLanguages: string[]
  badges: string[]
}

export type CvStatus = 'interviewing' | 'generating' | 'ready' | 'error'

export interface CvSession {
  id: string
  username: string
  status: CvStatus
  messages: CvMessage[]
  cvData: CvData | null
  amaliaStats: CvAmaliaStats | null
  isPublic: boolean
  createdAt: string
}

export interface CvSendMessageRequest {
  content: string
}

export interface CvSendMessageResponse {
  message: CvMessage
  isDone: boolean
}

export interface PublicCvItem {
  id: string
  username: string
  title: string
  bio: string
  topSkills: string[]
  amaliaStats: CvAmaliaStats
  createdAt: string
}

// ── Job Board ────────────────────────────────────────────────────────────

export enum ContractType {
  Permanent = 'permanent',
  FixedTerm = 'fixed_term',
  Freelance = 'freelance',
  Internship = 'internship',
}

export enum WorkMode {
  Remote = 'remote',
  Hybrid = 'hybrid',
  Onsite = 'onsite',
}

export enum JobOfferStatus {
  Active = 'active',
  Expired = 'expired',
  Closed = 'closed',
}

export enum JobApplicationStatus {
  Sent = 'sent',
  Viewed = 'viewed',
  Replied = 'replied',
  Ignored = 'ignored',
}

export interface JobHardSkillReq {
  name: string
  minLevel: string
}

export interface CreateJobOfferRequest {
  title: string
  description: string
  salaryMin?: number | null
  salaryMax?: number | null
  contractType: ContractType
  workMode: WorkMode
  location?: string | null
  yearsRequired: number
  sector: string
  hardSkills: JobHardSkillReq[]
  softSkills: string[]
  expiresAt: string
}

export interface JobOfferItem {
  id: string
  authorId: string
  authorUsername: string
  title: string
  description: string
  salaryMin: number | null
  salaryMax: number | null
  contractType: ContractType
  workMode: WorkMode
  location: string | null
  sector: string
  status: JobOfferStatus
  applicationsCount: number
  createdAt: string
}

export interface JobOfferDetail {
  id: string
  authorId: string
  authorUsername: string
  authorProfilePhotoUrl: string | null
  title: string
  description: string
  salaryMin: number | null
  salaryMax: number | null
  contractType: ContractType
  workMode: WorkMode
  location: string | null
  yearsRequired: number
  sector: string
  hardSkills: JobHardSkillReq[]
  softSkills: string[]
  status: JobOfferStatus
  applicationsCount: number
  expiresAt: string
  createdAt: string
}

export interface JobCandidateItem {
  developerId: string
  username: string
  profilePhotoUrl: string | null
  matchPercentage: number
  yearsOfExperience: number
  matchedSkills: { name: string; level: string; verified: boolean }[]
  missingSkills: string[]
  verifiedSkills: string[]
  declaredSkills: string[]
  challengesCompleted: number
  accuracy: number
  totalScore: number
  cvTitle: string
  cvBio: string
}

export interface JobApplicationItem {
  id: string
  offerId: string
  offerTitle: string
  salaryMin: number | null
  salaryMax: number | null
  contractType: ContractType
  workMode: WorkMode
  location: string | null
  sector: string
  recruiterUsername: string
  recruiterProfilePhotoUrl: string | null
  matchPercentage: number
  status: JobApplicationStatus
  createdAt: string
}

export interface JobMessageItem {
  id: string
  applicationId: string
  senderId: string
  senderUsername: string
  senderPhoto: string | null
  content: string
  isOfferPreview: boolean
  read: boolean
  createdAt: string
}

export interface SendJobMessageRequest {
  content: string
}

export interface SendOfferToDevsRequest {
  developerIds: string[]
}

// ── Roles & Permissions ──────────────────────────────────────────────────

export enum UserRole {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
  Founder = 'founder',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.User]: 0,
  [UserRole.Moderator]: 1,
  [UserRole.Admin]: 2,
  [UserRole.Founder]: 3,
}

export enum PermissionKey {
  ManageReports = 'manage_reports',
  BanUsers = 'ban_users',
  MuteUsers = 'mute_users',
  DeletePosts = 'delete_posts',
  ManageChat = 'manage_chat',
  ManageUsers = 'manage_users',
  ManageJobs = 'manage_jobs',
  AssignModerator = 'assign_moderator',
  AssignAdmin = 'assign_admin',
  ViewStats = 'view_stats',
  ViewAdvancedStats = 'view_advanced_stats',
  ManagePermissions = 'manage_permissions',
  ManageChallenges = 'manage_challenges',
}

export enum PermissionCategory {
  Moderation = 'moderation',
  Admin = 'admin',
  Founder = 'founder',
}

export interface PermissionItem {
  id: string
  key: PermissionKey
  description: string
  category: PermissionCategory
}

export interface UserPermissionItem {
  id: string
  permission: PermissionItem
  grantedBy: { id: string; username: string } | null
  grantedAt: string
}

// ── Reports ──────────────────────────────────────────────────────────────

export enum ReportTargetType {
  Post = 'post',
  Comment = 'comment',
  ChatMessage = 'chat_message',
  UserProfile = 'user_profile',
  JobOffer = 'job_offer',
}

export enum ReportReason {
  Spam = 'spam',
  Harassment = 'harassment',
  HateSpeech = 'hate_speech',
  InappropriateContent = 'inappropriate_content',
  Impersonation = 'impersonation',
  Other = 'other',
}

export enum ReportStatus {
  Pending = 'pending',
  Reviewing = 'reviewing',
  Resolved = 'resolved',
  Dismissed = 'dismissed',
}

export interface CreateReportRequest {
  targetType: ReportTargetType
  targetId: string
  reportedUserId?: string
  reason: ReportReason
  description?: string
}

export interface ReportItem {
  id: string
  reporter: { id: string; username: string; profilePhotoUrl: string | null }
  reportedUser: { id: string; username: string; profilePhotoUrl: string | null } | null
  targetType: ReportTargetType
  targetId: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  resolvedBy: { id: string; username: string } | null
  resolution: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface ReportListResponse {
  reports: ReportItem[]
  total: number
  page: number
  limit: number
}

// ── Moderation ───────────────────────────────────────────────────────────

export enum ModerationAction {
  Ban = 'ban',
  Unban = 'unban',
  Mute = 'mute',
  Unmute = 'unmute',
  DeletePost = 'delete_post',
  DeleteComment = 'delete_comment',
  DeleteMessage = 'delete_message',
  DeleteJob = 'delete_job',
  ResolveReport = 'resolve_report',
  DismissReport = 'dismiss_report',
  AssignRole = 'assign_role',
  RemoveRole = 'remove_role',
  GrantPermission = 'grant_permission',
  RevokePermission = 'revoke_permission',
}

export interface BanUserRequest {
  reason: string
  durationHours?: number | null // null = permanent
  banChat?: boolean
  banChallenge?: boolean
  banDuel?: boolean
}

export interface MuteUserRequest {
  durationHours?: number | null // null = permanent
  muteChat?: boolean
  muteGlobal?: boolean
}

export interface AssignRoleRequest {
  role: UserRole
}

export interface GrantPermissionRequest {
  permissionKey: PermissionKey
}

export interface ResolveReportRequest {
  resolution: string
}

export interface ModerationLogItem {
  id: string
  moderator: { id: string; username: string }
  targetUser: { id: string; username: string } | null
  action: ModerationAction
  details: Record<string, unknown> | null
  createdAt: string
}

export interface ModerationLogListResponse {
  logs: ModerationLogItem[]
  total: number
  page: number
  limit: number
}

// ── Admin ────────────────────────────────────────────────────────────────

export interface AdminUserItem {
  id: string
  username: string
  email: string | null
  profilePhotoUrl: string | null
  role: UserRole
  bannedUntil: string | null
  isMuted: boolean
  createdAt: string
}

export interface AdminUserListResponse {
  users: AdminUserItem[]
  total: number
  page: number
  limit: number
}

export interface AdminUserDetail extends AdminUserItem {
  banReason: string | null
  mutedUntil: string | null
  chatBanUntil: string | null
  challengeBanUntil: string | null
  duelBanUntil: string | null
  permissions: UserPermissionItem[]
}

export interface PlatformStats {
  totalUsers: number
  totalPosts: number
  totalDuels: number
  totalChallenges: number
  totalJobs: number
  totalReports: number
  pendingReports: number
  activeBans: number
  activeModerators: number
  activeAdmins: number
}

export interface TrendPoint {
  date: string
  count: number
}

export interface PlatformTrends {
  newUsers: TrendPoint[]
  newPosts: TrendPoint[]
  newReports: TrendPoint[]
  newDuels: TrendPoint[]
}

// ── Ban Info (returned to banned users) ──────────────────────────────────

export interface BanInfo {
  banned: boolean
  bannedUntil: string | null
  banReason: string | null
  permanent: boolean
}