"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const initCronJobs = () => {
    // Run every hour to cleanup expired reset password tokens
    node_cron_1.default.schedule("0 * * * *", async () => {
        try {
            console.log("Running cron job: Cleaning up expired reset password tokens...");
            const result = await User_1.default.updateMany({
                resetPasswordExpire: { $lt: new Date() }
            }, {
                $set: {
                    resetPasswordToken: undefined,
                    resetPasswordExpire: undefined
                }
            });
            console.log(`Cron job completed: ${result.modifiedCount} expired tokens cleared.`);
        }
        catch (error) {
            console.error("Cron job failed: Expired token cleanup error:", error);
        }
    });
    console.log("Scheduled Cron Job: Expired token cleanup every 1 hour.");
};
exports.default = initCronJobs;
