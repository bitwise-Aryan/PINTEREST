import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { 
  initiateChat, 
  sendMessage, 
  markMessagesAsSeen, 
  toggleReaction 
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:partnerUsername/init", isAuthenticated, initiateChat);
router.post("/:chatId/message", isAuthenticated, sendMessage);
router.post("/:chatId/seen", isAuthenticated, markMessagesAsSeen);
router.post("/:chatId/messages/:messageId/reaction", isAuthenticated, toggleReaction);

export default router;
