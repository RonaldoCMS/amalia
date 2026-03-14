"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeLanguage = exports.ChallengeLevel = exports.ChallengeType = void 0;
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
})(ChallengeLanguage || (exports.ChallengeLanguage = ChallengeLanguage = {}));
