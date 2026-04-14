import Mark from "../models/Mark";
import Attendance from "../models/Attendance";
import Student from "../models/Student";
import { Types } from "mongoose";

export class AnalyticsService {

  // Helper: the frontend sends User._id but marks/attendance are stored against Student._id
  // This resolves whichever ID is passed to the correct Student profile _id
  public async resolveStudentProfileId(idFromParam: string): Promise<Types.ObjectId> {
    const oid = new Types.ObjectId(idFromParam);
    // Check if a Student profile exists with this _id directly
    const directMatch = await Student.findById(oid).select('_id');
    if (directMatch) return directMatch._id as Types.ObjectId;
    // Otherwise treat it as a User._id and look up the Student profile
    const byUser = await Student.findOne({ userId: oid }).select('_id');
    if (byUser) return byUser._id as Types.ObjectId;
    throw new Error('Student profile not found for ID: ' + idFromParam);
  }
  // Get student performance summary
  async getStudentPerformanceSummary(studentId: string): Promise<any> {
    const studentObjectId = await this.resolveStudentProfileId(studentId);

    // Get all marks
    const marks = await Mark.find({ studentId: studentObjectId })
      .populate('subjectId')
      .sort({ year: -1, term: -1 });

    // Get attendance
    const attendance = await Attendance.find({ studentId: studentObjectId });

    // Calculate statistics
    const totalSubjects = marks.length;
    const averageMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0) / totalSubjects || 0;
    const passedSubjects = marks.filter(m => m.grade !== 'F').length;
    const failedSubjects = marks.filter(m => m.grade === 'F').length;

    // Attendance stats
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Group by term
    const termPerformance = this.groupMarksByTerm(marks);

    return {
      studentId,
      summary: {
        totalSubjects,
        averageMarks: averageMarks.toFixed(2),
        passedSubjects,
        failedSubjects,
        attendancePercentage: attendancePercentage.toFixed(2) + '%'
      },
      termPerformance,
      recentMarks: marks.slice(0, 5)
    };
  }

  // Get class performance report
  async getClassPerformanceReport(classId: string, term: string, year: number): Promise<any> {
    // Get all students in class
    const Class = require('../models/Class').default;
    const classData = await Class.findById(classId).populate({
      path: 'students',
      populate: { path: 'userId', select: 'name' }
    });

    if (!classData) {
      throw new Error("Class not found");
    }

    const studentIds = classData.students.map((s: any) => s._id);

    // Get marks for all students — do NOT populate('studentId') so it stays as
    // a raw ObjectId enabling reliable string comparison in the loop below
    const marks = await Mark.find({
      studentId: { $in: studentIds },
      term,
      year
    }).populate('subjectId').lean();

    // Group by student
    const studentPerformance: any[] = [];
    const subjectAverages: any = {};

    for (const studentId of studentIds) {
      // Safe comparison: both are plain ObjectId strings after .lean()
      const studentMarks = marks.filter(m => m.studentId.toString() === studentId.toString());

      if (studentMarks.length > 0) {
        const total = studentMarks.reduce((sum, m) => sum + m.marksObtained, 0);
        const average = total / studentMarks.length;

        // Find the student from classData which is already populated
        const student = classData.students.find((s: any) => s._id.toString() === studentId.toString());

        studentPerformance.push({
          studentId,
          studentName: student?.userId?.name || 'Unknown',
          rollNumber: student?.rollNumber || 'N/A',
          average: average.toFixed(2),
          totalMarks: total,
          subjects: studentMarks.length,
          passed: studentMarks.every(m => m.grade !== 'F')
        });

        // Calculate subject averages
        for (const mark of studentMarks) {
          const subjectName = (mark.subjectId as any)?.name || 'Unknown';
          if (!subjectAverages[subjectName]) {
            subjectAverages[subjectName] = { total: 0, count: 0 };
          }
          subjectAverages[subjectName].total += mark.marksObtained;
          subjectAverages[subjectName].count += 1;
        }
      }
    }

    // Calculate final subject averages
    const subjectStats = Object.keys(subjectAverages).map(subject => ({
      subject,
      average: (subjectAverages[subject].total / subjectAverages[subject].count).toFixed(2)
    }));

    // Calculate pass rate
    const passedStudents = studentPerformance.filter(s => s.passed).length;
    const passRate = studentPerformance.length > 0 ? (passedStudents / studentPerformance.length) * 100 : 0;

    // Sort students by average
    studentPerformance.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

    return {
      className: classData.name + ' ' + classData.section,
      term,
      year,
      totalStudents: studentPerformance.length,
      topper: studentPerformance[0] || null,
      averageScore: studentPerformance.length > 0
        ? parseFloat((studentPerformance.reduce((sum, s) => sum + parseFloat(s.average), 0) / studentPerformance.length).toFixed(2))
        : 0,
      passRate,
      studentPerformance,
      subjectAverages: subjectStats
    };
  }

  // Get teacher workload and performance
  async getTeacherPerformance(teacherId: string): Promise<any> {
    const Subject = require('../models/Subject').default;
    const Class = require('../models/Class').default;

    // Get subjects taught by teacher
    const subjects = await Subject.find({ teacherId });

    // Get classes where teacher is class teacher
    const classes = await Class.find({ classTeacher: teacherId });

    return {
      teacherId,
      subjectsTaught: subjects.length,
      subjects: subjects.map(s => s.name),
      classesManaged: classes.map(c => `${c.name} ${c.section}`),
    };
  }

  // Helper: Group marks by term - FIXED HERE
  private groupMarksByTerm(marks: any[]): any[] {
    const termMap = new Map();

    for (const mark of marks) {
      const key = `${mark.term} ${mark.year}`;
      if (!termMap.has(key)) {
        termMap.set(key, {
          term: mark.term,
          year: mark.year,
          totalMarks: 0,
          subjects: []
        });
      }

      const termData = termMap.get(key);
      termData.totalMarks += mark.marksObtained;
      termData.subjects.push({
        subject: (mark.subjectId as any)?.name || 'Unknown',
        marks: mark.marksObtained,
        grade: mark.grade
      });
    }

    return Array.from(termMap.values());
  }

  // Get performance trend - grouped by term
  async getPerformanceTrend(studentId: string): Promise<any> {
    const resolvedId = await this.resolveStudentProfileId(studentId);
    const marks = await Mark.find({ studentId: resolvedId })
      .populate('subjectId')
      .sort({ year: 1, term: 1 });

    // Group marks by term+year
    const termMap = new Map<string, { term: string; year: number; totalObtained: number; totalFull: number }>();

    for (const mark of marks) {
      const key = `${mark.term} ${mark.year}`;
      if (!termMap.has(key)) {
        termMap.set(key, { term: mark.term, year: mark.year, totalObtained: 0, totalFull: 0 });
      }
      const entry = termMap.get(key)!;
      entry.totalObtained += mark.marksObtained;
      entry.totalFull += mark.totalMarks;
    }

    return Array.from(termMap.values()).map(t => ({
      term: `${t.term} ${t.year}`,
      year: t.year,
      percentage: t.totalFull > 0 ? +((t.totalObtained / t.totalFull) * 100).toFixed(2) : 0,
    }));
  }

  // NEW: Compute effective result considering attendance
  // Rule: attendance < 75% → student is NOT ELIGIBLE (detained) for that term's exam
  async getStudentResultWithAttendance(studentId: string): Promise<any> {
    const studentObjectId = await this.resolveStudentProfileId(studentId);

    const marks = await Mark.find({ studentId: studentObjectId }).populate('subjectId').sort({ year: -1, term: -1 });
    const attendance = await Attendance.find({ studentId: studentObjectId });

    const totalDays = attendance.length;
    const presentDays = attendance.filter((a: any) => a.status === 'present' || a.status === 'late').length;
    const attendancePct = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;
    const isEligible = attendancePct >= 75;

    // Group marks by subject
    const subjectSummary = marks.map(m => {
      const rawPct = (m.marksObtained / m.totalMarks) * 100;
      const effectivePct = isEligible ? rawPct : 0;  // Not eligible = 0 effective
      return {
        subject: (m.subjectId as any)?.name ?? 'Unknown',
        term: m.term,
        year: m.year,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        rawPercentage: +rawPct.toFixed(2),
        effectivePercentage: +effectivePct.toFixed(2),
        grade: isEligible ? (m.grade ?? 'N/A') : 'N/E',  // Not Eligible
        eligibilityStatus: isEligible ? 'Eligible' : 'Not Eligible',
      };
    });

    const totalObtained = marks.reduce((s, m) => s + m.marksObtained, 0);
    const totalFull = marks.reduce((s, m) => s + m.totalMarks, 0);
    const rawAvg = totalFull > 0 ? +((totalObtained / totalFull) * 100).toFixed(2) : 0;
    const effectiveAvg = isEligible ? rawAvg : 0;

    return {
      studentId,
      attendancePercentage: +attendancePct.toFixed(2),
      minimumRequiredAttendance: 75,
      isEligible,
      eligibilityMessage: isEligible
        ? `Attendance ${attendancePct.toFixed(1)}% ≥ 75% — eligible to appear in examinations.`
        : `Attendance ${attendancePct.toFixed(1)}% < 75% — student is DETAINED and not eligible to appear in examinations.`,
      rawAveragePercentage: rawAvg,
      effectiveAveragePercentage: effectiveAvg,
      subjects: subjectSummary,
    };
  }
} // end AnalyticsService

/**
 * Simple Topic Analysis Service
 * This analyzes performance by topic/subject
 */
export class TopicAnalysisService {

  private async resolveStudentProfileId(idFromParam: string): Promise<Types.ObjectId> {
    const oid = new Types.ObjectId(idFromParam);
    const directMatch = await Student.findById(oid).select('_id');
    if (directMatch) return directMatch._id as Types.ObjectId;
    const byUser = await Student.findOne({ userId: oid }).select('_id');
    if (byUser) return byUser._id as Types.ObjectId;
    throw new Error('Student profile not found for ID: ' + idFromParam);
  }

  async analyzeTopicPerformance(studentId: string): Promise<any> {
    const resolvedId = await this.resolveStudentProfileId(studentId);
    const marks = await Mark.find({ studentId: resolvedId })
      .populate('subjectId');

    const subjectAnalysis: any = {};

    for (const mark of marks) {
      const subjectName = (mark.subjectId as any)?.name || 'Unknown';
      const percentage = (mark.marksObtained / mark.totalMarks) * 100;

      if (!subjectAnalysis[subjectName]) {
        subjectAnalysis[subjectName] = {
          subject: subjectName,
          scores: [],
          average: 0
        };
      }

      const scoreEntry = {
        examType: mark.examType,
        term: mark.term,
        year: mark.year,
        marks: mark.marksObtained,
        total: mark.totalMarks,
        percentage: percentage.toFixed(2),
        grade: mark.grade,
        topicWise: mark.topicWise // Ensure topicWise is included here
      };

      subjectAnalysis[subjectName].scores.push(scoreEntry);
    }

    // Calculate averages and identify weak/strong subjects
    const results = [];
    let weakest = { subject: '', score: 101 };
    let strongest = { subject: '', score: -1 };

    // New: Topic-level analysis extraction
    const topicBreakdown: any[] = [];

    for (const subject in subjectAnalysis) {
      const data = subjectAnalysis[subject];
      const scores = data.scores.map((s: any) => parseFloat(s.percentage));
      const avg = scores.reduce((sum: number, s: any) => sum + s, 0) / scores.length;
      data.average = avg.toFixed(2);

      // Professional Status Trend Logic
      let statusTrend = 'STABLE';
      if (data.scores.length >= 2) {
        // Map logical terms: 'First Term' (0), 'Mid Term' (1), 'Final' (2)
        const termOrder: any = { 'First Term': 0, 'Mid Term': 1, 'Final': 2 };
        const sorted = [...data.scores].sort((a,b) => (termOrder[a.term] || 0) - (termOrder[b.term] || 0));
        
        const current = parseFloat(sorted[sorted.length-1].percentage);
        const previous = parseFloat(sorted[sorted.length-2].percentage);
        const diff = current - previous;

        if (current >= 90 && diff >= -2) {
          statusTrend = 'MASTERED'; // Consistent high performance
        } else if (diff >= 5) {
          statusTrend = 'IMPROVED'; // Real, significant effort
        } else if (diff <= -5) {
          statusTrend = 'POORER'; // Significant drop needing focus
        } else {
          statusTrend = (current > 75) ? 'CONSISTENT' : 'STABLE';
        }
      } else if (data.scores.length === 1) {
          const score = parseFloat(data.scores[0].percentage);
          statusTrend = score >= 85 ? 'INITIAL_EXCELLENCE' : 'BASELINE';
      }

      if (avg < weakest.score) weakest = { subject, score: avg };
      if (avg > strongest.score) strongest = { subject, score: avg };

      // Collect all topics for this subject
      data.scores.forEach((s: any) => {
        if (s.topicWise) {
          s.topicWise.forEach((tw: any) => {
            topicBreakdown.push({
              subject: data.subject,
              topic: tw.topicName,
              score: tw.marksObtained,
              total: tw.totalMarks,
              percentage: ((tw.marksObtained / tw.totalMarks) * 100).toFixed(2),
              term: s.term,
              year: s.year
            });
          });
        }
      });

      results.push({
        subject: data.subject,
        averageScore: data.average,
        statusTrend,
        performanceLevel: avg >= 80 ? 'EXCELLENT' : avg >= 60 ? 'GOOD' : 'AVERAGE',
        attempts: data.scores.length
      });
    }

    // Identify absolute strongest/weakest based on recent performance
    const sortedResults = [...results].sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));

    return {
      studentId,
      summary: {
        weakestSubject: sortedResults[sortedResults.length - 1]?.subject || 'N/A',
        strongestSubject: sortedResults[0]?.subject || 'N/A',
        totalTopicsAnalyzed: topicBreakdown.length
      },
      subjectWise: results,
      topicBreakdown
    };
  }
}

/**
 * Simple Attendance Impact Service
 * This analyzes how attendance affects performance
 */
export class AttendanceImpactService {

  private async resolveStudentProfileId(idFromParam: string): Promise<Types.ObjectId> {
    const oid = new Types.ObjectId(idFromParam);
    const directMatch = await Student.findById(oid).select('_id');
    if (directMatch) return directMatch._id as Types.ObjectId;
    const byUser = await Student.findOne({ userId: oid }).select('_id');
    if (byUser) return byUser._id as Types.ObjectId;
    throw new Error('Student profile not found for ID: ' + idFromParam);
  }

  async analyzeAttendanceImpact(studentId: string): Promise<any> {
    const studentObjectId = await this.resolveStudentProfileId(studentId);

    // Get attendance by month
    const attendance = await Attendance.aggregate([
      { $match: { studentId: studentObjectId } },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          totalDays: { $sum: 1 }
        }
      }
    ]);

    // Get marks by month (using createdAt as marks don't have month field)
    const marks = await Mark.aggregate([
      { $match: { studentId: studentObjectId } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          avgScore: { $avg: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] } }
        }
      }
    ]);

    // Correlate attendance with performance
    const correlation = [];
    let totalEffect = 0;
    let count = 0;

    for (const att of attendance) {
      const markData = marks.find(m =>
        m._id.year === att._id.year && m._id.month === att._id.month
      );

      const attendanceRate = (att.presentCount / att.totalDays) * 100;

      correlation.push({
        month: this.getMonthName(att._id.month),
        year: att._id.year,
        attendanceRate: attendanceRate.toFixed(2) + '%',
        avgScore: markData?.avgScore?.toFixed(2) || 'No data',
        impact: markData ? this.getImpact(attendanceRate, markData.avgScore) : 'No data'
      });

      if (markData) {
        // Behavioral logic: Does high attendance correlate with high marks?
        const isHighAttendance = attendanceRate >= 80;
        const isHighPerformance = markData.avgScore >= 70;

        if (isHighAttendance && isHighPerformance) totalEffect += 1;
        else if (!isHighAttendance && !isHighPerformance) totalEffect += 1; // Positive correlation (low att = low marks)
        else totalEffect -= 1; // Deviation
        count++;
      }
    }

    return {
      studentId,
      summary: {
        overallImpact: count > 0 ? (totalEffect > 0 ? 'Positive' : 'Negative') : 'Unknown',
        recommendation: this.getRecommendation(correlation)
      },
      monthlyAnalysis: correlation
    };
  }

  private getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  private getImpact(attendanceRate: number, avgScore: number): string {
    if (attendanceRate >= 85 && avgScore >= 70) return 'Excellent - Good attendance leads to good grades';
    if (attendanceRate >= 85 && avgScore < 70) return 'Good attendance but needs academic improvement';
    if (attendanceRate < 75 && avgScore < 50) return 'Low attendance affecting grades';
    if (attendanceRate < 75 && avgScore >= 70) return 'Good grades despite low attendance';
    return 'Moderate impact';
  }

  private getRecommendation(correlation: any[]): string {
    const lowAttendanceMonths = correlation.filter(c =>
      parseFloat(c.attendanceRate) < 75 && c.avgScore !== 'No data'
    ).length;

    if (lowAttendanceMonths > 2) {
      return ' Critical: Improve attendance to boost academic performance';
    } else if (lowAttendanceMonths > 0) {
      return 'Attendance needs improvement for better results';
    } else {
      return ' Good attendance - maintain this habit';
    }
  }
}