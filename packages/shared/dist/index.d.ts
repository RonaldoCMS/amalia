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
export declare enum ChallengeLanguage {
    TypeScript = "TypeScript",
    JavaScript = "JavaScript",
    Python = "Python"
}
export interface GenerateChallengeRequest {
    type: ChallengeType;
    level: ChallengeLevel;
    language: ChallengeLanguage;
}
export interface EvaluateChallengeRequest {
    challenge: ChallengeResponse;
    type: ChallengeType;
    level: ChallengeLevel;
    language: ChallengeLanguage;
    userAnswer: string;
}
export interface ChallengeResponse {
    title: string;
    description: string;
    code: string;
    options: string[];
    answer: string;
}
export interface EvaluationResponse {
    correct: boolean;
    feedback: string;
}
export interface RegisterRequest {
    username: string;
    password: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
}
