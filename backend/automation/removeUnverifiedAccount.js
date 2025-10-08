import cron from "node-cron";
// FIX: Changed from named import (e.g., {User}) to default import
import User from "../models/user.model.js"; 

// This task runs every 30 minutes to clean up unverified user accounts
export const removeUnverifiedAccounts = () => {
  // Cron schedule: "*/30 * * * *" means "at every 30th minute"
  cron.schedule("*/30 * * * *", async () => {
    try {
      console.log("Running scheduled task: Removing old unverified accounts...");
      
      // Calculate the timestamp for 30 minutes ago
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      // Delete users who are NOT verified AND were created more than 30 minutes ago
      const result = await User.deleteMany({
        accountVerified: false,
        createdAt: { $lt: thirtyMinutesAgo }, 
      });

      console.log(`Scheduled task completed. Deleted ${result.deletedCount} unverified accounts.`);
      
    } catch (error) {
      console.error("Error during removeUnverifiedAccounts scheduled task:", error.message);
    }
  });
};
