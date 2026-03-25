"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPassed = exports.calculatePercentage = exports.calculateOverallGrade = exports.calculateGrade = void 0;
const calculateGrade = (marksObtained, totalMarks) => {
    const percentage = (marksObtained / totalMarks) * 100;
    if (percentage >= 90)
        return 'A+';
    if (percentage >= 80)
        return 'A';
    if (percentage >= 70)
        return 'B+';
    if (percentage >= 60)
        return 'B';
    if (percentage >= 50)
        return 'C+';
    if (percentage >= 40)
        return 'C';
    return 'F';
};
exports.calculateGrade = calculateGrade;
const calculateOverallGrade = (percentage) => {
    if (percentage >= 90)
        return 'A+';
    if (percentage >= 80)
        return 'A';
    if (percentage >= 70)
        return 'B+';
    if (percentage >= 60)
        return 'B';
    if (percentage >= 50)
        return 'C+';
    if (percentage >= 40)
        return 'C';
    return 'F';
};
exports.calculateOverallGrade = calculateOverallGrade;
const calculatePercentage = (obtained, total) => {
    return ((obtained / total) * 100).toFixed(2);
};
exports.calculatePercentage = calculatePercentage;
const isPassed = (grade) => {
    return grade !== 'F';
};
exports.isPassed = isPassed;
