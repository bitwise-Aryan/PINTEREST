// import { Schema } from "mongoose";
// import mongoose from "mongoose";

// const userSchema = new Schema(
//   {
//     displayName: {
//       type: String,
//       required: true,
//     },
//     username: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     img: {
//       type: String,
      
//     },
//     hashedPassword: {
//       type: String,
//       required: true,
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User",userSchema)



import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, 
    },
    email: {
      type: String,
      required: true,
      unique: true, 
    },
    img: {
      type: String,
    },
    // Renamed from hashedPassword to password and set select: false for security
    password: {
      type: String,
      required: true,
      select: false, 
    },
    // Fields for OTP Verification
    phone: String,
    accountVerified: { type: Boolean, default: false },
    verificationCode: Number,
    verificationCodeExpire: Date,
    // Fields for Reset Password
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Mongoose Pre-Save Hook: Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance Method: Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  // This requires the password to be explicitly selected in the query (e.g., in loginUser)
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance Method: Generate a 5-digit verification code and set its expiry
userSchema.methods.generateVerificationCode = function () {
  // Generates a random 5-digit number (10000 to 99999)
  const verificationCode = Math.floor(10000 + Math.random() * 90000);

  this.verificationCode = verificationCode;
  // Code expires in 10 minutes
  this.verificationCodeExpire = Date.now() + 10 * 60 * 1000;

  return verificationCode;
};

// Instance Method: Generate a Reset Password Token
userSchema.methods.generateResetPasswordToken = function () {
  // 1. Generate a raw token (what is sent to the user)
  const resetToken = crypto.randomBytes(20).toString("hex");

  // 2. Hash the raw token (what is stored in the DB for comparison)
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expires in 15 minutes
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  // Return the *un-hashed* token to be sent in the email
  return resetToken;
};


export default mongoose.model("User", userSchema);
