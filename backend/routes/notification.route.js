import express from "express";
import { isAuthenticated } from "../middlewares/auth.js"; // Your auth middleware
import {
  getNotifications,
  markNotificationsAsRead, // <-- This is the function you need
  getUnreadCount,
} from "../controllers/notification.controller.js";

const router = express.Router();

// GET /notifications
router.route("/").get(isAuthenticated, getNotifications);

// GET /notifications/unread-count
router.route("/unread-count").get(isAuthenticated, getUnreadCount);

// PUT /notifications/mark-read <-- This route handles the 404 error
router.route("/mark-read").put(isAuthenticated, markNotificationsAsRead);

export default router;
