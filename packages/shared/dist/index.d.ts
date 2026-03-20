export declare enum ChallengeType {
    Fill = "fill",
    Quiz = "quiz",
    Bug = "bug",
    Write = "write"
}
export declare enum ChallengeLevel {
    Beginner = "beginner",
    Intermediate = "intermediate",
    Hard = "hard"
}
export declare enum ChallengeCategory {
    Programming = "programming",
    Database = "database",
    DevOps = "devops",
    Security = "security",
    Tools = "tools"
}
export interface SubtopicDefinition {
    id: string;
    label: string;
}
export interface TopicDefinition {
    id: string;
    label: string;
    category: ChallengeCategory;
    subtopics?: SubtopicDefinition[];
}
export declare const TOPICS: TopicDefinition[];
export declare function getTopicsByCategory(category: ChallengeCategory): TopicDefinition[];
export declare function getTopicById(id: string): TopicDefinition | undefined;
export declare function getRandomTopic(): TopicDefinition;
export declare function getRandomSubtopics(topicId: string, maxCount?: number): SubtopicDefinition[];
export declare enum ChallengeLanguage {
    TypeScript = "TypeScript",
    JavaScript = "JavaScript",
    Python = "Python",
    Dart = "Dart",
    Flutter = "Flutter",
    Java = "Java",
    Go = "Go",
    Rust = "Rust",
    Cpp = "C++",
    CSharp = "C#",
    PHP = "PHP",
    Ruby = "Ruby",
    Swift = "Swift",
    Kotlin = "Kotlin",
    C = "C"
}
export declare enum NotificationType {
    NewMatch = "new_match",
    NewMessage = "new_message",
    DuelChallenge = "duel_challenge",
    FriendRequest = "friend_request",
    FriendAccepted = "friend_accepted",
    NewPostLike = "new_post_like",
    NewComment = "new_comment",
    JobOffer = "job_offer"
}
export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    referenceId: string | null;
    read: boolean;
    createdAt: string;
}
export interface UnreadCountResponse {
    count: number;
}
export declare enum DevLanguage {
    TypeScript = "TypeScript",
    JavaScript = "JavaScript",
    Python = "Python",
    Java = "Java",
    Go = "Go",
    Rust = "Rust",
    Cpp = "C++",
    PHP = "PHP",
    Ruby = "Ruby",
    Swift = "Swift",
    Kotlin = "Kotlin",
    Dart = "Dart",
    CSharp = "C#",
    Scala = "Scala"
}
export declare enum JobType {
    FullStack = "FullStack",
    Frontend = "Frontend",
    Backend = "Backend",
    DevOps = "DevOps",
    Mobile = "Mobile",
    DataScience = "DataScience",
    Security = "Security",
    QA = "QA",
    SRE = "SRE",
    Student = "Student",
    Other = "Other"
}
export declare enum WorkStyle {
    Remote = "Remote",
    Office = "Office",
    Hybrid = "Hybrid"
}
export declare enum DevGoal {
    Learn = "Learn",
    Network = "Network",
    Collaborate = "Collaborate",
    Mentor = "Mentor",
    GetMentored = "GetMentored",
    FindJob = "FindJob",
    Freelance = "Freelance",
    OpenSource = "OpenSource",
    StartupIdea = "StartupIdea"
}
export declare enum Availability {
    FullTime = "FullTime",
    PartTime = "PartTime",
    FreelanceOnly = "FreelanceOnly",
    OpenSource = "OpenSource",
    NotAvailable = "NotAvailable"
}
export declare const EXPERIENCE_LEVELS: readonly ["0", "1-2", "3-5", "6-10", "10+"];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export interface OnboardingRequest {
    email?: string;
    languages: string[];
    yearsOfExperience: ExperienceLevel;
    jobType: JobType;
    goals: string[];
    workStyle: WorkStyle;
    availability: Availability;
    bio?: string;
    githubUrl?: string;
}
export interface OnboardingResponse {
    completed: boolean;
    email: string | null;
    languages: string[];
    yearsOfExperience: string | null;
    jobType: string | null;
    goals: string[];
    workStyle: string | null;
    availability: string | null;
    bio: string | null;
    githubUrl: string | null;
}
export interface MatchSuggestion {
    userId: string;
    username: string;
    profilePhotoUrl: string | null;
    compatibilityScore: number;
    jobType: string | null;
    yearsOfExperience: string | null;
    languages: string[];
    goals: string[];
    workStyle: string | null;
    bio: string | null;
    githubUrl: string | null;
}
export interface MatchItem {
    matchId: string;
    userId: string;
    username: string;
    profilePhotoUrl: string | null;
    compatibilityScore: number;
    matchedAt: string;
}
export interface LikeResponse {
    matched: boolean;
    matchId?: string;
}
export interface ChatMessageItem {
    id: string;
    senderId: string;
    content: string;
    imageUrl?: string | null;
    replyToId?: string | null;
    isSystemMessage?: boolean;
    duelInviteId?: string | null;
    createdAt: string;
    read: boolean;
}
export interface SendMessageRequest {
    content?: string;
    replyToId?: string | null;
}
export interface UpdateEmailRequest {
    email: string;
}
export interface GenerateChallengeRequest {
    type: ChallengeType;
    level: ChallengeLevel;
    topic: string;
    subtopics?: string[];
    language?: ChallengeLanguage;
}
export interface EvaluateChallengeRequest {
    challenge: ChallengeResponse;
    type: ChallengeType;
    level: ChallengeLevel;
    topic: string;
    subtopics?: string[];
    userAnswer: string;
    language?: ChallengeLanguage;
}
export interface ChallengeResponse {
    id?: string;
    title: string;
    description: string;
    code: string;
    options: string[];
    answer: string;
}
export interface EvaluationResponse {
    correct: boolean;
    feedback: string;
    score: number;
}
export interface UserStats {
    totalScore: number;
    correctCount: number;
    wrongCount: number;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
}
export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
export interface UserProfile {
    id: string;
    username: string;
    email: string | null;
    profilePhotoUrl: string | null;
    createdAt: string;
    onboardingCompleted: boolean;
    preferredLanguage: string | null;
}
export interface ChallengeHistoryItem {
    id: string;
    correct: boolean | null;
    score: number | null;
    createdAt: string;
    challenge: {
        id: string;
        title: string;
        description: string;
        type: ChallengeType;
        level: ChallengeLevel;
        language: ChallengeLanguage;
    };
}
export declare enum DuelStatus {
    Waiting = "waiting",
    Active = "active",
    Completed = "completed",
    Cancelled = "cancelled"
}
export interface DuelPlayerInfo {
    id: string;
    username: string;
    profilePhotoUrl: string | null;
    totalScore: number;
}
export interface DuelCurrentRound {
    roundNumber: number;
    type: ChallengeType;
    level: ChallengeLevel;
    challenge: {
        title: string;
        description: string;
        code: string;
        options: string[];
    };
    myAnswer: string | null;
    opponentAnswered: boolean;
    secondsLeft: number;
    totalSeconds: number;
}
export interface DuelRoundResult {
    roundNumber: number;
    type: ChallengeType;
    level: ChallengeLevel;
    myCorrect: boolean;
    opponentCorrect: boolean;
    myScore: number;
    opponentScore: number;
    correctAnswer: string;
}
export interface DuelStateResponse {
    id: string;
    status: DuelStatus;
    language: string;
    me: DuelPlayerInfo;
    opponent: DuelPlayerInfo | null;
    currentRoundNumber: number;
    totalRounds: number;
    winnerId: string | null;
    isSuddenDeath: boolean;
    currentRound: DuelCurrentRound | null;
    history: DuelRoundResult[];
    createdAt: string;
}
export interface DuelQueueResponse {
    status: 'waiting' | 'matched' | 'none';
    duelId?: string;
    banUntil?: string;
}
export interface DuelInviteStatusResponse {
    status: 'waiting' | 'active' | 'completed' | 'cancelled';
    challengerId: string;
    challengerUsername: string;
    invitedUserId: string | null;
    invitedUsername: string | null;
    user1Score: number;
    user2Score: number;
    winnerId: string | null;
    winnerUsername: string | null;
    createdAt: string;
}
export interface DuelAnswerRequest {
    answer: string;
}
export interface DuelAnswerResponse {
    correct: boolean;
    score: number;
}
export interface DuelLeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    profilePhotoUrl: string | null;
    wins: number;
    losses: number;
    draws: number;
    totalDuels: number;
    winRate: number;
    totalScore: number;
}
export interface DuelLanguageQueueCount {
    language: string;
    count: number;
}
export interface DuelJoinQueueRequest {
    language: string;
}
export interface PostItem {
    id: string;
    authorId: string;
    authorUsername: string;
    authorProfilePhotoUrl: string | null;
    content: string;
    imageUrl: string | null;
    likesCount: number;
    commentsCount: number;
    likedByMe: boolean;
    createdAt: string;
}
export interface CreatePostRequest {
    content: string;
}
export interface CommentItem {
    id: string;
    authorId: string;
    authorUsername: string;
    authorProfilePhotoUrl: string | null;
    content: string;
    createdAt: string;
}
export interface CreateCommentRequest {
    content: string;
}
export interface FeedResponse {
    posts: PostItem[];
    total: number;
    page: number;
    limit: number;
}
export declare enum FriendshipStatus {
    Pending = "pending",
    Accepted = "accepted",
    Rejected = "rejected",
    Blocked = "blocked"
}
export interface FriendshipItem {
    id: string;
    status: FriendshipStatus;
    userId: string;
    username: string;
    profilePhotoUrl: string | null;
    createdAt: string;
}
export interface FriendshipStatusResponse {
    status: FriendshipStatus | null;
    friendshipId: string | null;
    direction: 'sent' | 'received' | null;
}
export interface PublicUserProfile {
    id: string;
    username: string;
    profilePhotoUrl: string | null;
    bio: string | null;
    languages: string[];
    goals: string[];
    jobType: string | null;
    yearsOfExperience: string | null;
    workStyle: string | null;
    githubUrl: string | null;
    challengeStats: UserStats;
    duelStats: {
        totalDuels: number;
        wins: number;
        losses: number;
        winRate: number;
    };
    createdAt: string;
}
export interface UserSearchResult {
    id: string;
    username: string;
    profilePhotoUrl: string | null;
    bio: string | null;
}
export interface CvMessage {
    role: 'amalia' | 'user';
    content: string;
}
export interface CvSkill {
    name: string;
    verified: boolean;
    level: string;
}
export interface CvProject {
    name: string;
    description: string;
    technologies: string[];
}
export interface CvExperience {
    title: string;
    company: string;
    period: string;
    description: string;
}
export interface CvData {
    name: string;
    title: string;
    bio: string;
    email: string | null;
    githubUrl: string | null;
    education: string | null;
    softSkills: string[];
    skills: CvSkill[];
    projects: CvProject[];
    experience: CvExperience[];
}
export interface CvAmaliaStats {
    challengesCompleted: number;
    accuracy: number;
    totalScore: number;
    topLanguages: string[];
    badges: string[];
}
export type CvStatus = 'interviewing' | 'generating' | 'ready' | 'error';
export interface CvSession {
    id: string;
    username: string;
    status: CvStatus;
    messages: CvMessage[];
    cvData: CvData | null;
    amaliaStats: CvAmaliaStats | null;
    isPublic: boolean;
    createdAt: string;
}
export interface CvSendMessageRequest {
    content: string;
}
export interface CvSendMessageResponse {
    message: CvMessage;
    isDone: boolean;
}
export interface PublicCvItem {
    id: string;
    username: string;
    title: string;
    bio: string;
    topSkills: string[];
    amaliaStats: CvAmaliaStats;
    createdAt: string;
}
export declare enum ContractType {
    Permanent = "permanent",
    FixedTerm = "fixed_term",
    Freelance = "freelance",
    Internship = "internship"
}
export declare enum WorkMode {
    Remote = "remote",
    Hybrid = "hybrid",
    Onsite = "onsite"
}
export declare enum JobOfferStatus {
    Active = "active",
    Expired = "expired",
    Closed = "closed"
}
export declare enum JobApplicationStatus {
    Sent = "sent",
    Viewed = "viewed",
    Replied = "replied",
    Ignored = "ignored"
}
export interface JobHardSkillReq {
    name: string;
    minLevel: string;
}
export interface CreateJobOfferRequest {
    title: string;
    description: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    contractType: ContractType;
    workMode: WorkMode;
    location?: string | null;
    yearsRequired: number;
    sector: string;
    hardSkills: JobHardSkillReq[];
    softSkills: string[];
    expiresAt: string;
}
export interface JobOfferItem {
    id: string;
    authorId: string;
    authorUsername: string;
    title: string;
    description: string;
    salaryMin: number | null;
    salaryMax: number | null;
    contractType: ContractType;
    workMode: WorkMode;
    location: string | null;
    sector: string;
    status: JobOfferStatus;
    applicationsCount: number;
    createdAt: string;
}
export interface JobOfferDetail {
    id: string;
    authorId: string;
    authorUsername: string;
    authorProfilePhotoUrl: string | null;
    title: string;
    description: string;
    salaryMin: number | null;
    salaryMax: number | null;
    contractType: ContractType;
    workMode: WorkMode;
    location: string | null;
    yearsRequired: number;
    sector: string;
    hardSkills: JobHardSkillReq[];
    softSkills: string[];
    status: JobOfferStatus;
    applicationsCount: number;
    expiresAt: string;
    createdAt: string;
}
export interface JobCandidateItem {
    developerId: string;
    username: string;
    profilePhotoUrl: string | null;
    matchPercentage: number;
    yearsOfExperience: number;
    matchedSkills: {
        name: string;
        level: string;
        verified: boolean;
    }[];
    missingSkills: string[];
    verifiedSkills: string[];
    declaredSkills: string[];
    challengesCompleted: number;
    accuracy: number;
    totalScore: number;
    cvTitle: string;
    cvBio: string;
}
export interface JobApplicationItem {
    id: string;
    offerId: string;
    offerTitle: string;
    salaryMin: number | null;
    salaryMax: number | null;
    contractType: ContractType;
    workMode: WorkMode;
    location: string | null;
    sector: string;
    recruiterUsername: string;
    recruiterProfilePhotoUrl: string | null;
    matchPercentage: number;
    status: JobApplicationStatus;
    createdAt: string;
}
export interface JobMessageItem {
    id: string;
    applicationId: string;
    senderId: string;
    senderUsername: string;
    senderPhoto: string | null;
    content: string;
    isOfferPreview: boolean;
    read: boolean;
    createdAt: string;
}
export interface SendJobMessageRequest {
    content: string;
}
export interface SendOfferToDevsRequest {
    developerIds: string[];
}
