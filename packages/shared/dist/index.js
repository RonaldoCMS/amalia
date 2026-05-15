"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationAction = exports.ReportStatus = exports.ReportReason = exports.ReportTargetType = exports.PermissionCategory = exports.PermissionKey = exports.ROLE_HIERARCHY = exports.UserRole = exports.JobApplicationStatus = exports.JobOfferStatus = exports.WorkMode = exports.ContractType = exports.FriendshipStatus = exports.DuelStatus = exports.EXPERIENCE_LEVELS = exports.Availability = exports.DevGoal = exports.WorkStyle = exports.JobType = exports.DevLanguage = exports.NotificationType = exports.ChallengeLanguage = exports.TOPICS = exports.ChallengeCategory = exports.ChallengeLevel = exports.ChallengeType = void 0;
exports.getTopicsByCategory = getTopicsByCategory;
exports.getTopicById = getTopicById;
exports.getRandomTopic = getRandomTopic;
exports.getRandomSubtopics = getRandomSubtopics;
var ChallengeType;
(function (ChallengeType) {
    ChallengeType["Fill"] = "fill";
    ChallengeType["Quiz"] = "quiz";
    ChallengeType["Bug"] = "bug";
    ChallengeType["Write"] = "write";
})(ChallengeType || (exports.ChallengeType = ChallengeType = {}));
var ChallengeLevel;
(function (ChallengeLevel) {
    ChallengeLevel["Beginner"] = "beginner";
    ChallengeLevel["Intermediate"] = "intermediate";
    ChallengeLevel["Hard"] = "hard";
})(ChallengeLevel || (exports.ChallengeLevel = ChallengeLevel = {}));
// ── Topic System ─────────────────────────────────────────────────────────
var ChallengeCategory;
(function (ChallengeCategory) {
    ChallengeCategory["Programming"] = "programming";
    ChallengeCategory["Database"] = "database";
    ChallengeCategory["DevOps"] = "devops";
    ChallengeCategory["Security"] = "security";
    ChallengeCategory["Tools"] = "tools";
})(ChallengeCategory || (exports.ChallengeCategory = ChallengeCategory = {}));
exports.TOPICS = [
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
];
// Helper functions
function getTopicsByCategory(category) {
    return exports.TOPICS.filter(t => t.category === category);
}
function getTopicById(id) {
    return exports.TOPICS.find(t => t.id === id);
}
function getRandomTopic() {
    return exports.TOPICS[Math.floor(Math.random() * exports.TOPICS.length)];
}
function getRandomSubtopics(topicId, maxCount = 2) {
    const topic = getTopicById(topicId);
    if (!topic?.subtopics || topic.subtopics.length === 0)
        return [];
    const shuffled = [...topic.subtopics].sort(() => Math.random() - 0.5);
    const count = Math.min(Math.floor(Math.random() * (maxCount + 1)), shuffled.length);
    return shuffled.slice(0, count);
}
// Legacy enum for backward compatibility (DB migration deferred)
var ChallengeLanguage;
(function (ChallengeLanguage) {
    ChallengeLanguage["TypeScript"] = "TypeScript";
    ChallengeLanguage["JavaScript"] = "JavaScript";
    ChallengeLanguage["Python"] = "Python";
    ChallengeLanguage["Dart"] = "Dart";
    ChallengeLanguage["Flutter"] = "Flutter";
    ChallengeLanguage["Java"] = "Java";
    ChallengeLanguage["Go"] = "Go";
    ChallengeLanguage["Rust"] = "Rust";
    ChallengeLanguage["Cpp"] = "C++";
    ChallengeLanguage["CSharp"] = "C#";
    ChallengeLanguage["PHP"] = "PHP";
    ChallengeLanguage["Ruby"] = "Ruby";
    ChallengeLanguage["Swift"] = "Swift";
    ChallengeLanguage["Kotlin"] = "Kotlin";
    ChallengeLanguage["C"] = "C";
})(ChallengeLanguage || (exports.ChallengeLanguage = ChallengeLanguage = {}));
// ── Notifiche ────────────────────────────────────────────────────────────
var NotificationType;
(function (NotificationType) {
    NotificationType["NewMatch"] = "new_match";
    NotificationType["NewMessage"] = "new_message";
    NotificationType["DuelChallenge"] = "duel_challenge";
    NotificationType["FriendRequest"] = "friend_request";
    NotificationType["FriendAccepted"] = "friend_accepted";
    NotificationType["NewPostLike"] = "new_post_like";
    NotificationType["NewComment"] = "new_comment";
    NotificationType["JobOffer"] = "job_offer";
    // Moderation
    NotificationType["ReportSubmitted"] = "report_submitted";
    NotificationType["ReportResolved"] = "report_resolved";
    NotificationType["UserBanned"] = "user_banned";
    NotificationType["UserUnbanned"] = "user_unbanned";
    NotificationType["UserMuted"] = "user_muted";
    NotificationType["UserUnmuted"] = "user_unmuted";
    NotificationType["PostDeletedByMod"] = "post_deleted_by_mod";
    NotificationType["CommentDeletedByMod"] = "comment_deleted_by_mod";
    NotificationType["MessageDeletedByMod"] = "message_deleted_by_mod";
    NotificationType["RoleAssigned"] = "role_assigned";
    NotificationType["RoleRemoved"] = "role_removed";
    NotificationType["PermissionGranted"] = "permission_granted";
    NotificationType["PermissionRevoked"] = "permission_revoked";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// ── Onboarding ──────────────────────────────────────────────────────────
var DevLanguage;
(function (DevLanguage) {
    DevLanguage["TypeScript"] = "TypeScript";
    DevLanguage["JavaScript"] = "JavaScript";
    DevLanguage["Python"] = "Python";
    DevLanguage["Java"] = "Java";
    DevLanguage["Go"] = "Go";
    DevLanguage["Rust"] = "Rust";
    DevLanguage["Cpp"] = "C++";
    DevLanguage["PHP"] = "PHP";
    DevLanguage["Ruby"] = "Ruby";
    DevLanguage["Swift"] = "Swift";
    DevLanguage["Kotlin"] = "Kotlin";
    DevLanguage["Dart"] = "Dart";
    DevLanguage["CSharp"] = "C#";
    DevLanguage["Scala"] = "Scala";
})(DevLanguage || (exports.DevLanguage = DevLanguage = {}));
var JobType;
(function (JobType) {
    JobType["FullStack"] = "FullStack";
    JobType["Frontend"] = "Frontend";
    JobType["Backend"] = "Backend";
    JobType["DevOps"] = "DevOps";
    JobType["Mobile"] = "Mobile";
    JobType["DataScience"] = "DataScience";
    JobType["Security"] = "Security";
    JobType["QA"] = "QA";
    JobType["SRE"] = "SRE";
    JobType["Student"] = "Student";
    JobType["Other"] = "Other";
})(JobType || (exports.JobType = JobType = {}));
var WorkStyle;
(function (WorkStyle) {
    WorkStyle["Remote"] = "Remote";
    WorkStyle["Office"] = "Office";
    WorkStyle["Hybrid"] = "Hybrid";
})(WorkStyle || (exports.WorkStyle = WorkStyle = {}));
var DevGoal;
(function (DevGoal) {
    DevGoal["Learn"] = "Learn";
    DevGoal["Network"] = "Network";
    DevGoal["Collaborate"] = "Collaborate";
    DevGoal["Mentor"] = "Mentor";
    DevGoal["GetMentored"] = "GetMentored";
    DevGoal["FindJob"] = "FindJob";
    DevGoal["Freelance"] = "Freelance";
    DevGoal["OpenSource"] = "OpenSource";
    DevGoal["StartupIdea"] = "StartupIdea";
})(DevGoal || (exports.DevGoal = DevGoal = {}));
var Availability;
(function (Availability) {
    Availability["FullTime"] = "FullTime";
    Availability["PartTime"] = "PartTime";
    Availability["FreelanceOnly"] = "FreelanceOnly";
    Availability["OpenSource"] = "OpenSource";
    Availability["NotAvailable"] = "NotAvailable";
})(Availability || (exports.Availability = Availability = {}));
exports.EXPERIENCE_LEVELS = ['0', '1-2', '3-5', '6-10', '10+'];
// ── Duel ─────────────────────────────────────────────────────────────────
var DuelStatus;
(function (DuelStatus) {
    DuelStatus["Waiting"] = "waiting";
    DuelStatus["Active"] = "active";
    DuelStatus["Completed"] = "completed";
    DuelStatus["Cancelled"] = "cancelled";
})(DuelStatus || (exports.DuelStatus = DuelStatus = {}));
// ── Friendship ───────────────────────────────────────────────────────────
var FriendshipStatus;
(function (FriendshipStatus) {
    FriendshipStatus["Pending"] = "pending";
    FriendshipStatus["Accepted"] = "accepted";
    FriendshipStatus["Rejected"] = "rejected";
    FriendshipStatus["Blocked"] = "blocked";
})(FriendshipStatus || (exports.FriendshipStatus = FriendshipStatus = {}));
// ── Job Board ────────────────────────────────────────────────────────────
var ContractType;
(function (ContractType) {
    ContractType["Permanent"] = "permanent";
    ContractType["FixedTerm"] = "fixed_term";
    ContractType["Freelance"] = "freelance";
    ContractType["Internship"] = "internship";
})(ContractType || (exports.ContractType = ContractType = {}));
var WorkMode;
(function (WorkMode) {
    WorkMode["Remote"] = "remote";
    WorkMode["Hybrid"] = "hybrid";
    WorkMode["Onsite"] = "onsite";
})(WorkMode || (exports.WorkMode = WorkMode = {}));
var JobOfferStatus;
(function (JobOfferStatus) {
    JobOfferStatus["Active"] = "active";
    JobOfferStatus["Expired"] = "expired";
    JobOfferStatus["Closed"] = "closed";
})(JobOfferStatus || (exports.JobOfferStatus = JobOfferStatus = {}));
var JobApplicationStatus;
(function (JobApplicationStatus) {
    JobApplicationStatus["Sent"] = "sent";
    JobApplicationStatus["Viewed"] = "viewed";
    JobApplicationStatus["Replied"] = "replied";
    JobApplicationStatus["Ignored"] = "ignored";
})(JobApplicationStatus || (exports.JobApplicationStatus = JobApplicationStatus = {}));
// ── Roles & Permissions ──────────────────────────────────────────────────
var UserRole;
(function (UserRole) {
    UserRole["User"] = "user";
    UserRole["Moderator"] = "moderator";
    UserRole["Admin"] = "admin";
    UserRole["Founder"] = "founder";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.ROLE_HIERARCHY = {
    [UserRole.User]: 0,
    [UserRole.Moderator]: 1,
    [UserRole.Admin]: 2,
    [UserRole.Founder]: 3,
};
var PermissionKey;
(function (PermissionKey) {
    PermissionKey["ManageReports"] = "manage_reports";
    PermissionKey["BanUsers"] = "ban_users";
    PermissionKey["MuteUsers"] = "mute_users";
    PermissionKey["DeletePosts"] = "delete_posts";
    PermissionKey["ManageChat"] = "manage_chat";
    PermissionKey["ManageUsers"] = "manage_users";
    PermissionKey["ManageJobs"] = "manage_jobs";
    PermissionKey["AssignModerator"] = "assign_moderator";
    PermissionKey["AssignAdmin"] = "assign_admin";
    PermissionKey["ViewStats"] = "view_stats";
    PermissionKey["ViewAdvancedStats"] = "view_advanced_stats";
    PermissionKey["ManagePermissions"] = "manage_permissions";
    PermissionKey["ManageChallenges"] = "manage_challenges";
})(PermissionKey || (exports.PermissionKey = PermissionKey = {}));
var PermissionCategory;
(function (PermissionCategory) {
    PermissionCategory["Moderation"] = "moderation";
    PermissionCategory["Admin"] = "admin";
    PermissionCategory["Founder"] = "founder";
})(PermissionCategory || (exports.PermissionCategory = PermissionCategory = {}));
// ── Reports ──────────────────────────────────────────────────────────────
var ReportTargetType;
(function (ReportTargetType) {
    ReportTargetType["Post"] = "post";
    ReportTargetType["Comment"] = "comment";
    ReportTargetType["ChatMessage"] = "chat_message";
    ReportTargetType["UserProfile"] = "user_profile";
    ReportTargetType["JobOffer"] = "job_offer";
})(ReportTargetType || (exports.ReportTargetType = ReportTargetType = {}));
var ReportReason;
(function (ReportReason) {
    ReportReason["Spam"] = "spam";
    ReportReason["Harassment"] = "harassment";
    ReportReason["HateSpeech"] = "hate_speech";
    ReportReason["InappropriateContent"] = "inappropriate_content";
    ReportReason["Impersonation"] = "impersonation";
    ReportReason["Other"] = "other";
})(ReportReason || (exports.ReportReason = ReportReason = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["Pending"] = "pending";
    ReportStatus["Reviewing"] = "reviewing";
    ReportStatus["Resolved"] = "resolved";
    ReportStatus["Dismissed"] = "dismissed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
// ── Moderation ───────────────────────────────────────────────────────────
var ModerationAction;
(function (ModerationAction) {
    ModerationAction["Ban"] = "ban";
    ModerationAction["Unban"] = "unban";
    ModerationAction["Mute"] = "mute";
    ModerationAction["Unmute"] = "unmute";
    ModerationAction["DeletePost"] = "delete_post";
    ModerationAction["DeleteComment"] = "delete_comment";
    ModerationAction["DeleteMessage"] = "delete_message";
    ModerationAction["DeleteJob"] = "delete_job";
    ModerationAction["ResolveReport"] = "resolve_report";
    ModerationAction["DismissReport"] = "dismiss_report";
    ModerationAction["AssignRole"] = "assign_role";
    ModerationAction["RemoveRole"] = "remove_role";
    ModerationAction["GrantPermission"] = "grant_permission";
    ModerationAction["RevokePermission"] = "revoke_permission";
})(ModerationAction || (exports.ModerationAction = ModerationAction = {}));
