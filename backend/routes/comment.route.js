import express from "express";
import {
  getPostComments,
  addComment,
  deleteComment
} from "../controllers/comment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/:postId", getPostComments);
router.post("/", verifyToken, addComment);
// DELETE a comment by its ID (requires authentication)
router.delete("/:commentId", verifyToken, deleteComment);

export default router;