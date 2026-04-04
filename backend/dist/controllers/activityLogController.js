"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivitiesController = void 0;
const activityLogService_1 = require("../services/activityLogService");
const getActivitiesController = async (req, res) => {
    try {
        const activities = await (0, activityLogService_1.getRecentActivities)(100);
        res.json({ success: true, activities });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getActivitiesController = getActivitiesController;
