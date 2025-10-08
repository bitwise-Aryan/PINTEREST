// // src/middlewares/auth.js

// import jwt from "jsonwebtoken";
// import { catchAsyncError } from "./catchAsyncError.js";
// import ErrorHandler from "./error.js";
// import User from "../models/user.model.js"; 

// export const isAuthenticated = catchAsyncError(async (req, res, next) => {
//   const { token } = req.cookies;

//   // 1. Check for token presence
//   if (!token) {
//     return next(new ErrorHandler("User is not authenticated. Please log in.", 401)); 
//   }

//   try {
//     // FIX: Using the global secret key name (JWT_SECRET)
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); 

//     // 2. Find User by the 'id' field in the token payload
//     // The user ID is stored in 'id' according to your sendToken utility
//     req.user = await User.findById(decoded.id); 

//     if (!req.user || !req.user.accountVerified) {
//       return next(new ErrorHandler("Authentication failed: User not found or account not verified.", 401));
//     }
    
//     // CRITICAL: Set the legacy req.userId for compatibility with old controllers
//     // However, we will change the controllers instead for a cleaner solution.
    
//     next(); 
//   } catch (error) {
//     return next(new ErrorHandler("Authentication failed: Invalid or expired token.", 401));
//   }
// });

// // REMOVE verifytoken.js entirely, as it conflicts with this new middleware.

// src/middlewares/auth.js (FINAL CORRECT CODE)
import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import User from "../models/user.model.js"; 

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    // 1. Check for token presence
    if (!token) {
        return next(new ErrorHandler("User is not authenticated. Please log in.", 401)); 
    }

    // 2. Verify and decode the token (catchAsyncError handles JWT errors)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    // 3. Find User by ID and attach to request
    req.user = await User.findById(decoded.id); 

    // 4. Final authentication checks
    if (!req.user || !req.user.accountVerified) {
        // If user is not found or unverified, fail authentication
        return next(new ErrorHandler("Authentication failed: User not found or unverified.", 401));
    }
    
    // 5. Success: Proceed
    next(); 
});