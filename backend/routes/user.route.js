
import express from "express";
import {
  getUser,
  registerUser,
  loginUser,
  logoutUser,
  followUser,
  verifyOTP,
  forgotPassword,
  resetPassword
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.js"; 
import { getUserDashboard } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/auth/register", registerUser);           

// 2. OTP Verification
router.post("/auth/verify-otp", verifyOTP);           

// ...
router.get("/:username/dashboard", getUserDashboard);

// 3. Login
router.post("/auth/login", loginUser);                

// 4. Logout
router.post("/auth/logout", logoutUser);              



// 1. Forgot Password (Initiates sending of reset link/token)
router.post("/auth/password/forgot", forgotPassword);   

// 2. Reset Password (Uses the token from the email to set a new password)
router.put("/auth/password/reset/:token", resetPassword); 


router.get("/:username", getUser); 

// 2. Follow/Unfollow User (Protected route)
router.post("/follow/:username", isAuthenticated, followUser); 

export default router;