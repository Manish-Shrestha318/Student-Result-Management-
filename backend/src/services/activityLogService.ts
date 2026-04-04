import ActivityLog, { IActivityLog } from "../models/ActivityLog";

export const logActivity = async (data: any): Promise<IActivityLog> => {
  return await ActivityLog.create(data);
};

export const getRecentActivities = async (limit: number = 50): Promise<any[]> => {
  return await ActivityLog.find()
    .populate('userId', 'name email profilePicture role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const getActivitiesByUser = async (userId: string): Promise<any[]> => {
  return await ActivityLog.find({ userId })
    .sort({ createdAt: -1 });
};
