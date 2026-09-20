import express from "express";
import {
  getUser,
  registerUser,
  loginUser,
  logoutUser,
  followUser,
  verifyOTP,
  resendOTP,
  getActiveOTP,
  forgotPassword,
  resetPassword,
  getUserDashboard,
  getPinStats,
  getAvailableChatPartners,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.js"; 

const router = express.Router();

// 1. Register
router.post("/auth/register", registerUser);           

// 2. OTP Verification
router.post("/auth/verify-otp", verifyOTP);           
router.post("/auth/resend-otp", resendOTP);           
router.get("/auth/get-otp/:email", getActiveOTP);           

// 3. Login & Logout
router.post("/auth/login", loginUser);                
router.post("/auth/logout", logoutUser);              

// 4. Password Recovery
router.post("/auth/password/forgot", forgotPassword);   
router.put("/auth/password/reset/:token", resetPassword); 

// 5. User Profile & Actions
router.get("/available-partners", isAuthenticated, getAvailableChatPartners);
router.get("/stats", isAuthenticated, getPinStats);
router.get("/:username/dashboard", getUserDashboard);
router.get("/:username", getUser); 
router.post("/follow/:username", isAuthenticated, followUser); 

export default router;