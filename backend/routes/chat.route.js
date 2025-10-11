import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { initiateChat, sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:partnerUsername/init", isAuthenticated, initiateChat);
router.post("/:chatId/message", isAuthenticated, sendMessage);

export default router;
