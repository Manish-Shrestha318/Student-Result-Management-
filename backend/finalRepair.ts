import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User";
import bcrypt from "bcryptjs";

dotenv.config();

const finalRepair = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI as string);
        
        const adminEmail = "admin@test.com";
        const hashedPassword = await bcrypt.hash("123456", 10);
        
        // This is a direct native Mongo update to be absolutely sure the status field and password field are added.
        const result = await mongoose.connection.collection("users").updateOne(
            { email: adminEmail },
            { 
              $set: { 
                password: hashedPassword,
                status: "active",
                role: "admin",
                name: "System Admin"
              },
              $unset: { googleId: "" } // Extra precaution: ensure it's not ONLY a google account.
            },
            { upsert: true }
        );
        
        console.log("Admin account successfully updated in the DB via direct native update.");
        console.log("Match Count:", result.matchedCount, "Modified Count:", result.modifiedCount, "Upserted Count:", result.upsertedCount);
        process.exit(0);
    } catch (err: any) {
        console.error("Repair failed:", err.message);
        process.exit(1);
    }
};

finalRepair();
