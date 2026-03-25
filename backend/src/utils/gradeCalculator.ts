export const calculateGrade = (marksObtained: number, totalMarks: number): string => {
  const percentage = (marksObtained / totalMarks) * 100;
  
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
};

export const calculateOverallGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
};

export const calculatePercentage = (obtained: number, total: number): string => {
  return ((obtained / total) * 100).toFixed(2);
};

export const isPassed = (grade: string): boolean => {
  return grade !== 'F';
};