import Parent from "../models/Parent";
import Student from "../models/Student";

/**
 * Syncs parent profile data and children associations
 */
export const syncParentProfile = async (userId: string, data: any, userName: string) => {
  const updateData: any = {};
  if (data.phoneNumber || data.phone) updateData.phone = data.phoneNumber || data.phone;
  
  await Parent.findOneAndUpdate(
      { userId },
      { $set: updateData }
  );

  // Sync Children
  if (data.assignedStudentIds && Array.isArray(data.assignedStudentIds)) {
      await Parent.findOneAndUpdate(
          { userId },
          { $set: { children: data.assignedStudentIds } }
      );
      
      // Cascade contact info to the linked students
      if (data.assignedStudentIds.length > 0) {
          await Student.updateMany(
              { _id: { $in: data.assignedStudentIds } },
              { $set: { parentName: userName, parentPhone: data.phoneNumber || data.phone || '' } }
          );
      }
  }
};
