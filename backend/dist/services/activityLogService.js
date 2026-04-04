"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivitiesByUser = exports.getRecentActivities = exports.logActivity = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const logActivity = async (data) => {
    return await ActivityLog_1.default.create(data);
};
exports.logActivity = logActivity;
const getRecentActivities = async (limit = 50) => {
    return await ActivityLog_1.default.find()
        .populate('userId', 'name email profilePicture role')
        .sort({ createdAt: -1 })
        .limit(limit);
};
exports.getRecentActivities = getRecentActivities;
const getActivitiesByUser = async (userId) => {
    return await ActivityLog_1.default.find({ userId })
        .sort({ createdAt: -1 });
};
exports.getActivitiesByUser = getActivitiesByUser;
