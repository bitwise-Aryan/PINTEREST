// import User from "../models/user.model.js";
// import Follow from "../models/follow.model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// export const registerUser = async (req, res) => {
//   const { username, displayName, email, password } = req.body;

//   if (!username || !email || !password) {
//     return res.status(400).json({ message: "All fields are required!" });
//   }
//   const newHashedPassword = await bcrypt.hash(password, 10);
//   const user = await User.create({
//     username,
//     displayName,
//     email,
//     hashedPassword: newHashedPassword,
//   });
//   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//   });
//   const { hashedPassword, ...detailsWithoutPassword } = user.toObject();
//   res.status(201).json(detailsWithoutPassword);
// };
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "All fields are required!" });
//   }
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(401).json({ message: "Invalid email or password" });
//   }
//   const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);
//   if (!isPasswordCorrect) {
//     return res.status(401).json({ message: "Invalid email or password" });
//   }
//   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//   });

//   const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

//   res.status(200).json(detailsWithoutPassword);
// };

// export const logoutUser = async (req, res) => {
//   res.clearCookie("token");

//   res.status(200).json({ message: "Logout successful" });
// };

// export const getUser = async (req, res) => {
//   const { username } = req.params;

//   const user = await User.findOne({ username });

//   const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

//   const followerCount = await Follow.countDocuments({ following: user._id });
//   const followingCount = await Follow.countDocuments({ follower: user._id });

//   const token = req.cookies.token;

//   if (!token) {
//     res.status(200).json({
//       ...detailsWithoutPassword,
//       followerCount,
//       followingCount,
//       isFollowing: false,
//     });
//   } else {
//     jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
//       if (!err) {
//         const isExists = await Follow.exists({
//           follower: payload.userId,
//           following: user._id,
//         });

//         res.status(200).json({
//           ...detailsWithoutPassword,
//           followerCount,
//           followingCount,
//           isFollowing: isExists ? true : false,
//         });
//       }
//     });
//   }
// };

// export const followUser = async (req, res) => {
//   const { username } = req.params;

//   const user = await User.findOne({ username });

//   const isFollowing = await Follow.exists({
//     follower: req.userId,
//     following: user._id,
//   });

//   if (isFollowing) {
//     await Follow.deleteOne({ follower: req.userId, following: user._id });
//   } else {
//     await Follow.create({ follower: req.userId, following: user._id });
//   }

//   res.status(200).json({ message: "Successful" });
// };



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

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// Utility function to generate email content
function generateEmailTemplate(verificationCode) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Verification Code</h2>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
}

console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN);


// Utility function to send the verification code via email or phone
async function sendVerificationCode(
  verificationMethod,
  verificationCode,
  name,
  email,
  phone,
  res,
  next
) {
  try {
    if (verificationMethod === "email") {
      const message = generateEmailTemplate(verificationCode);
      await sendEmail({ email, subject: "Your Verification Code", message });
      res.status(200).json({
        success: true,
        message: `Verification email successfully sent to ${email}`,
      });
    } else if (verificationMethod === "phone") {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split("")
        .join(" ");

      await client.calls.create({
        twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      res.status(200).json({
        success: true,
        message: `OTP sent.`,
      });
    } else {
      return next(new ErrorHandler("Invalid verification method.", 500));
    }
  } catch (error) {
    console.error("VERIFICATION CODE SENDING ERROR:", error);
    return next(new ErrorHandler("Verification code failed to send. Check server logs for details.", 500));
  }
}




// // 1. REGISTER USER
// export const registerUser = catchAsyncError(async (req, res, next) => {
//   const { username, displayName, email, password, phone, verificationMethod } = req.body;

//   if (!username || !displayName || !email || !password || !phone || !verificationMethod) {
//     return next(new ErrorHandler("All fields (including phone and verification method) are required!", 400));
//   }

//   // Check for existing *verified* users
//   const existingVerifiedUser = await User.findOne({
//     $or: [
//       { email, accountVerified: true },
//       { phone, accountVerified: true },
//     ],
//   });

//   if (existingVerifiedUser) {
//     return next(new ErrorHandler("Email or Phone is already used by a verified account.", 400));
//   }

//   // Find or Create User
//   let user = await User.findOne({ email });

//   if (user) {
//     // Update existing unverified document
//     user.username = username;
//     user.displayName = displayName;
//     user.password = password; 
//     user.phone = phone;
//   } else {
//     // Create a new user (password is hashed in the pre('save') hook)
//     user = new User({
//       username,
//       displayName,
//       email,
//       password,
//       phone,
//       accountVerified: false,
//     });
//   }

//   const verificationCode = user.generateVerificationCode(); // Assumed method on User model
//   await user.save();

//   await sendVerificationCode(verificationMethod, verificationCode, displayName, email, phone, res, next);
// });
function validatePhoneNumber(phone) {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}
export const registerUser = catchAsyncError(async (req, res, next) => {
  const { username, displayName, email, password, phone, verificationMethod } = req.body;

  // Validate all required fields
  if (!username || !displayName || !email || !password || !phone || !verificationMethod) {
    return next(new ErrorHandler("All fields (including phone and verification method) are required!", 400));
  }

  // Phone number format validation (for Indian mobile numbers)
  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number.", 400));
  }

  // Limit registration attempts for unverified phone or email (max 3)
  const registrationAttemptsByUser = await User.find({
    $or: [
      { phone, accountVerified: false },
      { email, accountVerified: false },
    ],
  });

  if (registrationAttemptsByUser.length > 3) {
    return next(
      new ErrorHandler(
        "You have exceeded the maximum number of attempts (3). Please try again after 30 minutes.",
        400
      )
    );
  }

  // Check for existing *verified* users
  const existingVerifiedUser = await User.findOne({
    $or: [
      { email, accountVerified: true },
      { phone, accountVerified: true },
    ],
  });

  if (existingVerifiedUser) {
    return next(new ErrorHandler("Email or Phone is already used by a verified account.", 400));
  }

  // Find or Create User
  let user = await User.findOne({ email });

  if (user) {
    // Update existing unverified document
    user.username = username;
    user.displayName = displayName;
    user.password = password;
    user.phone = phone;
  } else {
    user = new User({
      username,
      displayName,
      email,
      password,
      phone,
      accountVerified: false,
    });
  }

  const verificationCode = user.generateVerificationCode(); // Assumed method on User model
  await user.save();

  await sendVerificationCode(verificationMethod, verificationCode, displayName, email, phone, res, next);
});


// 2. VERIFY OTP
export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp, phone } = req.body;

  // Find the most recent unverified user matching email or phone
  const user = await User.findOne({
    $or: [
      { email, accountVerified: false },
      { phone, accountVerified: false },
    ],
  }).sort({ createdAt: -1 });

  if (!user) {
    return next(new ErrorHandler("User not found or already verified.", 404));
  }

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP.", 400));
  }

  const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
  if (Date.now() > verificationCodeExpire) {
    return next(new ErrorHandler("OTP Expired, Kindly retry registration.", 400));
  }

  // Verification successful
  user.accountVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save({ validateModifiedOnly: true });

  sendToken(user, 200, "Account Verified and Logged in.", res);
});


// 3. LOGIN USER
export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required.", 400));
  }
  
  const user = await User.findOne({ email, accountVerified: true }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password or account not verified.", 400));
  }
  
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password or account not verified.", 400));
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



export const followUser = catchAsyncError(async (req, res, next) => {
    
    // Safety check: The primary failure point if isAuthenticated failed.
    if (!req.user || !req.user._id) {
        // This should not be reached if auth.js works, but prevents crash.
        return next(new ErrorHandler("Authentication required.", 401));
    }

    const { username } = req.params;

    // Find the user to follow, ensuring they are verified
    const userToFollow = await User.findOne({ username, accountVerified: true });

    if (!userToFollow) {
        return next(new ErrorHandler("User not found or unverified", 404));
    }

    // Prevent following yourself
    if (userToFollow._id.toString() === req.user._id.toString()) {
        return next(new ErrorHandler("You cannot follow yourself.", 400));
    }
    
    const followerId = req.user._id; // This is now guaranteed to exist

    const isFollowing = await Follow.exists({
        follower: followerId,
        following: userToFollow._id,
    });

    if (isFollowing) {
        await Follow.deleteOne({ follower: followerId, following: userToFollow._id });
        res.status(200).json({ 
            success: true,
            message: "Unfollowed successfully",
            isFollowing: false 
        });
    } else {
        await Follow.create({ follower: followerId, following: userToFollow._id });
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
  const htmlMessage = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #4CAF50; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.displayName || user.username},</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          
          <div style="text-align: center;">
            <a href="${resetPasswordUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4CAF50;">${resetPasswordUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 10 minutes</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you access the link above</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated email, please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text fallback
  const plainTextMessage = `
Password Reset Request

Hello ${user.displayName || user.username},

We received a request to reset your password. Click the link below to reset it:

${resetPasswordUrl}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email. Your password won't change until you access the link above.

---
This is an automated email, please do not reply.
  `;

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