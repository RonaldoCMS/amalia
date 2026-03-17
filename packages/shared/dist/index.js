"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuelStatus = exports.EXPERIENCE_LEVELS = exports.Availability = exports.DevGoal = exports.WorkStyle = exports.JobType = exports.DevLanguage = exports.NotificationType = exports.ChallengeLanguage = exports.ChallengeLevel = exports.ChallengeType = void 0;
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
})(ChallengeLanguage || (exports.ChallengeLanguage = ChallengeLanguage = {}));
// ── Notifiche ────────────────────────────────────────────────────────────
var NotificationType;
(function (NotificationType) {
    NotificationType["NewMatch"] = "new_match";
    NotificationType["NewMessage"] = "new_message";
    NotificationType["DuelChallenge"] = "duel_challenge";
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
