import { Request, Response } from "express";
import { getRecentActivities } from "../services/activityLogService";

export const getActivitiesController = async (req: Request, res: Response) => {
  try {
    const activities = await getRecentActivities(100);
    res.json({ success: true, activities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
