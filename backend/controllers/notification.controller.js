import { catchAsyncError } from "../middlewares/catchAsyncError.js"; // <-- FIX: Added .js extension
import Notification from "../models/notification.model.js"; // <-- FIX: Added .js extension
import User from "../models/user.model.js"; // <-- FIX: Added .js extension
import Pin from "../models/pin.model.js"; // <-- FIX: Added .js extension

// @desc    Get all notifications for the authenticated user
// @route   GET /notifications
// @access  Private
export const getNotifications = catchAsyncError(async (req, res) => {
    const userId = req.user._id;

    try {
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(30)
            // Use the actual imported models for the 'populate' function.
            // This ensures Mongoose doesn't fail to resolve the string reference.
            .populate({
                path: 'sender',
                model: User, // Use the imported User model
                select: 'username displayName img'
            })
            .populate({
                path: 'pin',
                model: Pin, // Use the imported Pin model
                select: 'media title'
            });

        // Log the result here. If this logs an empty array [], the issue is in the DB creation logic.
        // If it logs an array with objects, the issue is on the client side (notifications modal).
        console.log(`[NOTIF CONTROLLER] Fetched ${notifications.length} notifications for user ${userId}`);

        res.status(200).json({ success: true, notifications });
        
    } catch (error) {
        // Log detailed error if population or find fails
        console.error("CRITICAL ERROR FETCHING NOTIFICATIONS:", error);
        res.status(500).json({ message: "Failed to fetch notifications due to server error." });
    }
});

// @desc    Mark all unread notifications as read
// @route   PUT /notifications/mark-read
// @access  Private
export const markNotificationsAsRead = catchAsyncError(async (req, res) => {
    const userId = req.user._id;

    await Notification.updateMany(
        { recipient: userId, isRead: false },
        { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "Notifications marked as read." });
});

// @desc    Get the count of unread notifications
// @route   GET /notifications/unread-count
// @access  Private
export const getUnreadCount = catchAsyncError(async (req, res) => {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({ success: true, count });
});
