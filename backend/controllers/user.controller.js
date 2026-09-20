



import dotenv from 'dotenv';
dotenv.config();


import User from "../models/user.model.js";
// ...rest of your imports and code


// import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import crypto from "crypto";
import Pin from "../models/pin.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js"; 
import Notification from "../models/notification.model.js";
import Chat from "../models/chat.model.js";
import { sendEmail } from "../utils/sendEmail.js";
// import Pin from "../models/pin.model.js"; // You'll need to import the Pin model
import mongoose from "mongoose";
// MOCK/PLACEHOLDER for ErrorHandler (From your error.js)
const ErrorHandler = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
};
// MOCK/PLACEHOLDER for catchAsyncError (From your catchAsyncError.js)
const catchAsyncError = (theFunc) => (req, res, next) => {
  Promise.resolve(theFunc(req, res, next)).catch(next);
};

// MOCK/PLACEHOLDER for sendToken utility (Modified to use 'id' in JWT payload)
const sendToken = (user, statusCode, message, res) => {
  // Use 'id' for consistency with isAuthenticated middleware
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); 

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Destructure sensitive fields that should not be returned to the client
  const { password, verificationCode, verificationCodeExpire, resetPasswordToken, resetPasswordExpire, ...detailsWithoutSecrets } = user.toObject();

  res.status(statusCode).json({
    success: true,
    message,
    user: detailsWithoutSecrets,
  });
};

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID.trim(),
      process.env.TWILIO_AUTH_TOKEN.trim()
    );
  } catch (err) {
    console.warn("Twilio client initialization skipped:", err.message);
  }
}

// Utility function to generate appealing, professional HTML email for PIXEL OTP verification
function generateEmailTemplate(verificationCode, name = "there") {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PIXEL - Verification Code</title>
        <style>
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #1a1d26; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4); overflow: hidden;">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #e60023 0%, #b8001b 100%); padding: 32px 24px;">
                                <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 800; letter-spacing: 2px;">PIXEL</h1>
                                <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.88); font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">CREATED BY TEAM TECHSTACK</p>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 36px 32px; color: #e2e8f0; font-size: 15px; line-height: 1.6; text-align: center;">
                                <h2 style="margin-top: 0; margin-bottom: 8px; color: #ffffff; font-size: 20px; font-weight: 700;">Account Verification</h2>
                                <p style="margin-top: 0; margin-bottom: 24px; color: #94a3b8; font-size: 14px;">Hello <strong style="color: #ffffff;">${name}</strong>, use the 5-digit verification code below to complete your registration on PIXEL.</p>
                                
                                <!-- OTP Box -->
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding: 20px; background: rgba(230, 0, 35, 0.08); border-radius: 12px; border: 2px dashed #e60023;">
                                            <span style="font-size: 38px; color: #ff334b; font-weight: 800; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 12px;">
                                                ${verificationCode}
                                            </span>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Expiry & Security Notice -->
                                <div style="margin-top: 24px; padding: 12px 16px; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                    <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
                                        ⏳ <strong>Valid for 10 minutes.</strong> Never share this code with anyone.
                                    </p>
                                </div>
                                <p style="margin-top: 16px; margin-bottom: 0; font-size: 12px; color: #64748b;">
                                    If you did not attempt to sign up for PIXEL, please disregard this email.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 24px 32px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); background-color: #141720;">
                                <p style="margin: 0 0 8px 0; color: #94a3b8;">
                                    Need assistance? Contact us at: <a href="mailto:teckstackpixel@gmail.com" style="color: #ff334b; text-decoration: none; font-weight: 600;">teckstackpixel@gmail.com</a>
                                </p>
                                <p style="margin: 0; font-size: 11px;">
                                    &copy; ${new Date().getFullYear()} PIXEL. Created with ❤️ by Team Techstack. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

// Utility function to send the verification code via email
async function sendVerificationCode(
  verificationCode,
  name,
  email,
  res,
  next
) {
  try {
    const message = generateEmailTemplate(verificationCode, name);
    let emailSent = false;
    try {
      await sendEmail({
        email,
        subject: `${verificationCode} is your PIXEL verification code`,
        message,
      });
      emailSent = true;
    } catch (mailErr) {
      console.error("⚠️ SMTP/Email delivery blocked (Render free tier restricts SMTP ports 25, 465, 587):", mailErr.message);
    }

    // Always log the code to server console so it can be retrieved from Render logs anytime
    console.log(`\n==============================================`);
    console.log(`🔑 [PIXEL VERIFICATION CODE] for ${email}: ${verificationCode}`);
    console.log(`==============================================\n`);

    return res.status(200).json({
      success: true,
      message: emailSent
        ? `Verification code sent to ${email}`
        : `Verification code generated for ${email}! (Render free tier blocks SMTP)`,
      email,
      verificationCode: verificationCode, // Enables seamless instant verification on Render free tier
    });
  } catch (error) {
    console.error("VERIFICATION CODE ERROR:", error);
    return next(new ErrorHandler(`Error processing registration: ${error.message}`, 500));
  }
}

// 1. REGISTER USER (EMAIL VERIFICATION)
export const registerUser = catchAsyncError(async (req, res, next) => {
  let { username, displayName, email, password, phone } = req.body;

  // Validate required fields
  if (!username || !displayName || !email || !password) {
    return next(new ErrorHandler("Username, Name, Email, and Password are required!", 400));
  }

  username = username.trim();
  email = email.toLowerCase().trim();
  displayName = displayName.trim();

  if (password.length < 6) {
    return next(new ErrorHandler("Password must be at least 6 characters long.", 400));
  }

  // Check for existing verified users by email
  const existingVerifiedEmail = await User.findOne({
    email,
    accountVerified: true,
  });

  if (existingVerifiedEmail) {
    return next(new ErrorHandler("Email is already registered by a verified account. Please log in.", 400));
  }

  // Check for existing verified users by username
  const existingVerifiedUsername = await User.findOne({
    username,
    accountVerified: true,
  });

  if (existingVerifiedUsername) {
    return next(new ErrorHandler("Username is already taken. Please choose another.", 400));
  }

  // Find or Create User
  let user = await User.findOne({ email });

  if (user) {
    // If username changed, check if new username is used by someone else
    if (user.username !== username) {
      const usernameInUse = await User.findOne({ username, _id: { $ne: user._id } });
      if (usernameInUse) {
        return next(new ErrorHandler("Username is already taken. Please choose another.", 400));
      }
    }

    // Update existing unverified document
    user.username = username;
    user.displayName = displayName;
    user.password = password;
    if (phone) user.phone = String(phone).trim();
    user.accountVerified = false;
  } else {
    // Check if username is used by another unverified user
    const usernameInUse = await User.findOne({ username });
    if (usernameInUse) {
      return next(new ErrorHandler("Username is already taken. Please choose another.", 400));
    }

    user = new User({
      username,
      displayName,
      email,
      password,
      phone: phone ? String(phone).trim() : undefined,
      accountVerified: false,
    });
  }

  const verificationCode = user.generateVerificationCode();
  await user.save();

  await sendVerificationCode(verificationCode, displayName, email, res, next);
});

// 2. VERIFY OTP
export const verifyOTP = catchAsyncError(async (req, res, next) => {
  let { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required.", 400));
  }

  email = email.toLowerCase().trim();
  const enteredOtp = String(otp).trim();

  // Find the unverified user matching email
  const user = await User.findOne({
    email,
    accountVerified: false,
  }).sort({ createdAt: -1 });

  if (!user) {
    // Check if already verified
    const verifiedUser = await User.findOne({ email, accountVerified: true });
    if (verifiedUser) {
      return sendToken(verifiedUser, 200, "Account already verified. Logged in.", res);
    }
    return next(new ErrorHandler("User not found or registration expired. Please register again.", 404));
  }

  if (String(user.verificationCode).trim() !== enteredOtp) {
    return next(new ErrorHandler("Invalid OTP code. Please check and try again.", 400));
  }

  const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
  if (Date.now() > verificationCodeExpire) {
    return next(new ErrorHandler("OTP expired. Please request a new OTP.", 400));
  }

  // Verification successful
  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save({ validateModifiedOnly: true });

  sendToken(user, 200, "Account verified and logged in successfully!", res);
});

// 2b. RESEND OTP
export const resendOTP = catchAsyncError(async (req, res, next) => {
  let { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required.", 400));
  }

  email = email.toLowerCase().trim();

  const user = await User.findOne({ email, accountVerified: false });
  if (!user) {
    const verifiedUser = await User.findOne({ email, accountVerified: true });
    if (verifiedUser) {
      return next(new ErrorHandler("Account is already verified. Please log in.", 400));
    }
    return next(new ErrorHandler("No pending registration found for this email. Please sign up.", 404));
  }

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateModifiedOnly: true });

  await sendVerificationCode(verificationCode, user.displayName || user.username, email, res, next);
});

// 3. LOGIN USER
export const loginUser = catchAsyncError(async (req, res, next) => {
  let { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }

  email = email.toLowerCase().trim();
  
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }

  if (!user.accountVerified) {
    return res.status(403).json({
      success: false,
      accountVerified: false,
      email: user.email,
      message: "Your account is not verified yet. Please verify your email before logging in.",
    });
  }
  
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  
  sendToken(user, 200, "User logged in successfully.", res);
});

// 4. LOGOUT USER
export const logoutUser = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ 
    success: true,
    message: "Logout successful" 
  });
};


// 5. GET USER PROFILE (FIXED VERSION)
export const getUser = async (req, res) => {
  const { username } = req.params;

  console.log('GET USER REQUEST:', { username, hasAuthUser: !!req.user });

  let user = req.user; 
  
  // Look up user by username parameter
  if (!user && username && username !== 'undefined') { 
    user = await User.findOne({ username });
    console.log('User lookup result:', { 
      found: !!user, 
      verified: user?.accountVerified 
    });

    // Check verification status for public profile lookup

    const bypassVerification = req.query.dev === 'true' && process.env.NODE_ENV !== 'production';
    
    if (user && !user.accountVerified && !bypassVerification) {
      console.error(`Profile access denied: ${username} is not verified`);
      return res.status(403).json({ 
        success: false,
        message: "This account has not been verified yet." 
      });
    }
  }

  if (!user) {
    console.error(`GET USER FAILED: username=${username}, user not found`);
    return res.status(404).json({ 
      success: false,
      message: "User not found" 
    });
  }

  // Remove sensitive fields
  const { password, verificationCode, verificationCodeExpire, 
          resetPasswordToken, resetPasswordExpire, ...detailsWithoutSecrets } = user.toObject();

  // Get follower/following counts
  const followerCount = await Follow.countDocuments({ following: user._id });
  const followingCount = await Follow.countDocuments({ follower: user._id });

  // Check if the authenticated user is following this profile
  let isFollowing = false;
  if (req.user && req.user._id.toString() !== user._id.toString()) { 
    isFollowing = await Follow.exists({
      follower: req.user._id,
      following: user._id,
    });
  }

  res.status(200).json({
    success: true,
    ...detailsWithoutSecrets,
    followerCount,
    followingCount,
    isFollowing: !!isFollowing,
  });
};


// 6. GET CURRENT AUTHENTICATED USER
export const getMe = catchAsyncError(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("Not authenticated", 401));
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Remove sensitive fields
  const { password, verificationCode, verificationCodeExpire, 
          resetPasswordToken, resetPasswordExpire, ...detailsWithoutSecrets } = user.toObject();

  res.status(200).json({
    success: true,
    user: detailsWithoutSecrets,
  });
});



// export const followUser = catchAsyncError(async (req, res, next) => {
    
//     // Safety check: The primary failure point if isAuthenticated failed.
//     if (!req.user || !req.user._id) {
//         // This should not be reached if auth.js works, but prevents crash.
//         return next(new ErrorHandler("Authentication required.", 401));
//     }

//     const { username } = req.params;

//     // Find the user to follow, ensuring they are verified
//     const userToFollow = await User.findOne({ username, accountVerified: true });

//     if (!userToFollow) {
//         return next(new ErrorHandler("User not found or unverified", 404));
//     }

//     // Prevent following yourself
//     if (userToFollow._id.toString() === req.user._id.toString()) {
//         return next(new ErrorHandler("You cannot follow yourself.", 400));
//     }
    
//     const followerId = req.user._id; // This is now guaranteed to exist

//     const isFollowing = await Follow.exists({
//         follower: followerId,
//         following: userToFollow._id,
//     });

//     if (isFollowing) {
//         await Follow.deleteOne({ follower: followerId, following: userToFollow._id });
//         res.status(200).json({ 
//             success: true,
//             message: "Unfollowed successfully",
//             isFollowing: false 
//         });
//     } else {
//         await Follow.create({ follower: followerId, following: userToFollow._id });
//         res.status(200).json({ 
//             success: true,
//             message: "Followed successfully",
//             isFollowing: true 
//         });
//     }
// });


export const followUser = catchAsyncError(async (req, res, next) => {
    
    if (!req.user || !req.user._id) {
        return next(new ErrorHandler("Authentication required.", 401));
    }

    const { username } = req.params;
    const followerId = req.user._id;

    // 1. Find the user to follow
    const userToFollow = await User.findOne({ username, accountVerified: true });

    if (!userToFollow) {
        return next(new ErrorHandler("User not found or unverified", 404));
    }

    if (userToFollow._id.toString() === followerId.toString()) {
        return next(new ErrorHandler("You cannot follow yourself.", 400));
    }
    
    const followingId = userToFollow._id;

    const isFollowing = await Follow.exists({
        follower: followerId,
        following: followingId,
    });

    if (isFollowing) {
        // --- UNFOLLOW LOGIC ---
        await Follow.deleteOne({ follower: followerId, following: followingId });
        
        // Delete the corresponding follow notification
        await Notification.deleteOne({
            recipient: followingId,
            sender: followerId,
            type: "follow",
        });

        res.status(200).json({ 
            success: true,
            message: "Unfollowed successfully",
            isFollowing: false 
        });
    } else {
        // --- FOLLOW LOGIC ---
        await Follow.create({ follower: followerId, following: followingId });
        
        // Create a new follow notification
        await Notification.create({
            recipient: followingId,
            sender: followerId,
            type: "follow",
            // Pin is undefined for a follow action
        });

        res.status(200).json({ 
            success: true,
            message: "Followed successfully",
            isFollowing: true 
        });
    }
});
// 8. FORGOT PASSWORD (IMPROVED VERSION)
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required.", 400));
  }

  const user = await User.findOne({
    email,
    accountVerified: true,
  });

  // Security: Always return success even if user not found
  // This prevents email enumeration attacks
  if (!user) {
    console.log(`Password reset requested for non-existent email: ${email}`);
    return res.status(200).json({
      success: true,
      message: "If an account exists, a password reset email has been sent.",
    });
  }

  const resetToken = user.generateResetPasswordToken(); // Assumed method on User model
  await user.save({ validateBeforeSave: false });

  // CRITICAL: Use CLIENT_URL environment variable
  const resetPasswordUrl = `${process.env.CLIENT_URL}/password/reset/${resetToken}`;

  // Improved HTML email template
 // Improved HTML email template for better design and deliverability
const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PIXEL - Password Reset Request</title>
        <style>
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; padding: 40px 10px;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1a1d26; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4); overflow: hidden;">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #e60023 0%, #b8001b 100%); padding: 32px 24px;">
                                <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 800; letter-spacing: 2px;">PIXEL</h1>
                                <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.88); font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">CREATED BY TEAM TECHSTACK</p>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 36px 32px; color: #e2e8f0; font-size: 15px; line-height: 1.6;">
                                <h2 style="margin-top: 0; margin-bottom: 12px; color: #ffffff; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
                                <p style="margin-top: 0; margin-bottom: 20px; color: #94a3b8; font-size: 14px;">
                                    Hello <strong style="color: #ffffff;">${user.displayName || user.username}</strong>, we received a request to reset the password for your PIXEL account.
                                </p>
                                
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center" style="padding: 16px 0 24px 0;">
                                            <a href="${resetPasswordUrl}" target="_blank" style="background: linear-gradient(135deg, #e60023 0%, #ad081b 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 16px rgba(230, 0, 35, 0.4);">
                                                Reset Your Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin-top: 10px; font-size: 13px; color: #94a3b8;">If the button above does not work, copy and paste this link into your browser:</p>
                                <p style="word-break: break-all; font-size: 12px; color: #ff334b; background: rgba(230, 0, 35, 0.08); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(230, 0, 35, 0.2);">${resetPasswordUrl}</p>
                                
                                <div style="background: rgba(255, 255, 255, 0.03); padding: 16px; border-left: 4px solid #f59e0b; margin: 24px 0 0 0; border-radius: 8px;">
                                    <strong style="color: #fbbf24; font-size: 13px;">⚠️ Security Notice:</strong>
                                    <ul style="padding-left: 18px; margin: 6px 0 0 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                                        <li>This link will expire in <strong>10 minutes</strong>.</li>
                                        <li>If you did not request this, you can safely ignore this email. Your password will remain unchanged.</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 24px 32px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); background-color: #141720;">
                                <p style="margin: 0 0 8px 0; color: #94a3b8;">
                                    Need help? Reach us at: <a href="mailto:teckstackpixel@gmail.com" style="color: #ff334b; text-decoration: none; font-weight: 600;">teckstackpixel@gmail.com</a>
                                </p>
                                <p style="margin: 0; font-size: 11px;">
                                    &copy; ${new Date().getFullYear()} PIXEL. Created with ❤️ by Team Techstack. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
`;

// Plain text fallback
const plainTextMessage = `
Password Reset Request

Hello ${user.displayName || user.username},

We received a request to reset your password. To ensure the security of your account, please use the secure link below to proceed:

${resetPasswordUrl}

Important Security Notice:
- This link will expire in 10 minutes.
- If you didn't request this, please ignore this email. Your password won't change until you access the link above.

---
This email was sent by the TechStack Team as an automated notification. Please do not reply.
`;

  // Plain text fallback
  


  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - Action Required",
      message: htmlMessage, // HTML version
      // If your sendEmail utility supports plain text, add:
      // text: plainTextMessage
    });

    console.log(`Password reset email sent successfully to: ${user.email}`);

    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${user.email} successfully.`,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    
    // Clean up the token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(
      new ErrorHandler(
        "Failed to send password reset email. Please try again later.",
        500
      )
    );
  }
});


// 9. RESET PASSWORD
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password & confirm password do not match.", 400)
    );
  }

  user.password = req.body.password; 
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Password Reset Successfully.", res);
});



export const getUserDashboard = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username, accountVerified: true }).lean();
  if (!user) return res.status(404).json({ success: false, message: "User not found or not verified" });

  const pins = await Pin.find({ user: user._id }).select("_id");
  const pinIds = pins.map(p => p._id);

  // If likes are documents in separate collection
  const likesCount = await Like.countDocuments({ pin: { $in: pinIds } });

  // Comments
  const commentsCount = await Comment.countDocuments({ pin: { $in: pinIds } });

  res.status(200).json({
    success: true,
    data: {
      postsCount: pinIds.length,
      likesCount,
      commentsCount
    }
  });
};


export const getPinStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        // 1. Get user's pins to find their IDs
        const userPins = await Pin.find({ user: userId }).select('_id');
        const pinIds = userPins.map(p => p._id);

        // 2. Run all three aggregations in parallel for speed
        const [pinData, likeData, commentData] = await Promise.all([
            // Aggregation for Pins created
            Pin.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId), createdAt: { $gte: last7Days } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
            ]),
            // Aggregation for Likes received on user's pins
            Like.aggregate([
                { $match: { pin: { $in: pinIds }, createdAt: { $gte: last7Days } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
            ]),
            // Aggregation for Comments received on user's pins
            Comment.aggregate([
                { $match: { pin: { $in: pinIds }, createdAt: { $gte: last7Days } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
            ])
        ]);

        // 3. Combine the results into a single structure
        const combinedStats = {};
        const processData = (data, key) => {
            data.forEach(item => {
                const date = item._id;
                if (!combinedStats[date]) {
                    combinedStats[date] = { date, pins: 0, likes: 0, comments: 0 };
                }
                combinedStats[date][key] = item.count;
            });
        };

        processData(pinData, 'pins');
        processData(likeData, 'likes');
        processData(commentData, 'comments');
        
        // Convert to array and sort by date
        const finalData = Object.values(combinedStats).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(finalData);

    } catch (error) {
        console.error("Error fetching combined pin stats:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 12. GET AVAILABLE CHAT PARTNERS
// @desc    Fetch all registered users sorted by most recent chat, with last message preview
// @route   GET /users/available-partners
// @access  Private
export const getAvailableChatPartners = catchAsyncError(async (req, res, next) => {
    const currentUserId = req.user._id;

    // Fetch all chats involving current user
    const userChats = await Chat.find({
        participants: currentUserId
    }).select('participants lastMessage lastMessageAt messages');

    // Create a lookup map for partnerId -> chat info
    const chatMap = new Map();
    userChats.forEach(chat => {
        const partnerId = chat.participants.find(p => !p.equals(currentUserId));
        if (partnerId) {
            let unreadCount = 0;
            let lastMsg = chat.lastMessage;
            let lastMsgAt = chat.lastMessageAt;
            let lastMsgSeen = false;

            if (Array.isArray(chat.messages) && chat.messages.length > 0) {
                const latest = chat.messages[chat.messages.length - 1];
                lastMsg = latest.text || (latest.imageUrl ? "📷 Photo" : (latest.pin ? "📌 Pin" : "Sent an attachment"));
                lastMsgAt = latest.createdAt;
                lastMsgSeen = latest.seen;

                chat.messages.forEach(m => {
                    if (m.sender.equals(partnerId) && !m.seen) {
                        unreadCount++;
                    }
                });
            }

            chatMap.set(partnerId.toString(), {
                chatId: chat._id,
                lastMessage: lastMsg || "",
                lastMessageAt: lastMsgAt || null,
                lastMessageSeen: lastMsgSeen,
                unreadCount,
            });
        }
    });

    // Fetch all users except the current one
    const users = await User.find({ 
        _id: { $ne: currentUserId },
        accountVerified: true 
    }).select('username displayName img _id');

    // Attach chat info to each user
    const enrichedUsers = users.map(user => {
        const u = user.toObject();
        const chatInfo = chatMap.get(user._id.toString());
        return {
            ...u,
            chatId: chatInfo?.chatId || null,
            lastMessage: chatInfo?.lastMessage || "",
            lastMessageAt: chatInfo?.lastMessageAt || null,
            lastMessageSeen: chatInfo?.lastMessageSeen || false,
            unreadCount: chatInfo?.unreadCount || 0,
            hasChat: !!chatInfo?.lastMessageAt,
        };
    });

    // Sort: Users with recent chats come first (ordered by lastMessageAt descending),
    // followed by other users alphabetically
    enrichedUsers.sort((a, b) => {
        if (a.lastMessageAt && b.lastMessageAt) {
            return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
        }
        if (a.lastMessageAt && !b.lastMessageAt) return -1;
        if (!a.lastMessageAt && b.lastMessageAt) return 1;
        return (a.displayName || a.username).localeCompare(b.displayName || b.username);
    });

    res.status(200).json({
        success: true,
        users: enrichedUsers,
    });
});