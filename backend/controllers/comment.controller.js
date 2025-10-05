import Comment from "../models/comment.model.js";
// import User from "../models/user.model.js";
export const getPostComments = async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ pin: postId })
    .populate("user", "username img displayName")
    .sort({ createdAt: -1 });
  res.status(200).json(comments);
};

export const addComment = async (req, res) => {
  const { description, pin } = req.body;
  const userId = req.userId;
  const comment = await Comment.create({ description, pin, user: userId });
  res.status(201).json(comment);
};


// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private (only the comment owner)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId; // from verifyToken

    const comment = await Comment.findById(commentId);

    // Check if the comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Check if the user trying to delete is the user who created the comment
    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    // If checks pass, delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
};
