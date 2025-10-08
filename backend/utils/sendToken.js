import jwt from "jsonwebtoken";

// NOTE: We assume process.env.JWT_SECRET and process.env.COOKIE_EXPIRE are defined.
export const sendToken = (user, statusCode, message, res) => {
    // Generate token using the standard jwt library with 'id' payload for isAuthenticated consistency
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); 
    
    // Convert COOKIE_EXPIRE from days (or hours, depending on your setting) to milliseconds
    const cookieExpireDuration = process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000;

    res
        .status(statusCode)
        .cookie("token", token, {
            expires: new Date(Date.now() + cookieExpireDuration),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
        .json({
            success: true,
            user,
            message,
            token,
        });
};
