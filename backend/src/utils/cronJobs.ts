import cron from "node-cron";
import User from "../models/User";

const initCronJobs = () => {
    // Run every hour to cleanup expired reset password tokens
    cron.schedule("0 * * * *", async () => {
        try {
            console.log("Running cron job: Cleaning up expired reset password tokens...");
            
            const result = await User.updateMany(
                { 
                    resetPasswordExpire: { $lt: new Date() } 
                },
                { 
                    $set: { 
                        resetPasswordToken: undefined, 
                        resetPasswordExpire: undefined 
                    } 
                }
            );
            
            console.log(`Cron job completed: ${result.modifiedCount} expired tokens cleared.`);
        } catch (error) {
            console.error("Cron job failed: Expired token cleanup error:", error);
        }
    });

    console.log("Scheduled Cron Job: Expired token cleanup every 1 hour.");
};

export default initCronJobs;
