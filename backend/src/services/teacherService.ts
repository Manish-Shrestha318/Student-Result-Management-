import Teacher from "../models/Teacher";
import Subject from "../models/Subject";

/**
 * Syncs teacher profile data and subject assignments
 */
export const syncTeacherProfile = async (userId: string, data: any) => {
  const updateData: any = {};
  if (data.phoneNumber || data.phone) updateData.phone = data.phoneNumber || data.phone;
  if (data.primarySubject) updateData.specialization = [data.primarySubject];
  
  await Teacher.findOneAndUpdate(
      { userId },
      { $set: updateData }
  );

  // Subject/Class Synchronization
  if (data.assignedSubjectIds && Array.isArray(data.assignedSubjectIds)) {
      // Clear old subject assignments for this teacher
      await Subject.updateMany({ teacherId: userId }, { $unset: { teacherId: "" } });
      // Set new subject assignments
      if (data.assignedSubjectIds.length > 0) {
          await Subject.updateMany({ _id: { $in: data.assignedSubjectIds } }, { $set: { teacherId: userId } });
      }
  }
};
