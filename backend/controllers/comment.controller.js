
import Pin from "../models/pin.model.js"; 

import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ pin: postId })
      .populate("user", "username img displayName")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Could not fetch comments" });
  }
};

// export const addComment = async (req, res) => {
//   console.log('createComment: req.user =', req.user);
//   console.log('createComment: req.body =', req.body);

//   const { description, pin } = req.body;

//   // Use the authenticated user's _id from req.user
//   const userId = req.user._id;

//   // Create the comment
//   const comment = await Comment.create({
//     description,
//     pin,
//     user: userId, // ✅ now required field is set
//   });

//   // Optional: populate user fields for response
//   await comment.populate('user', 'displayName username img');

//   res.status(201).json(comment);
// };

export const addComment = async (req, res) => {
    console.log('createComment: req.user =', req.user);
    console.log('createComment: req.body =', req.body);

    const { description, pin } = req.body;
    const userId = req.user._id;

    // 1. Create the comment
    const comment = await Comment.create({
        description,
        pin,
        user: userId,
    });

    // Optional: populate user fields for response
    await comment.populate('user', 'displayName username img');

    // 2. FIND PIN OWNER and CREATE NOTIFICATION (FIXED LOGIC)
    try {
        // This line caused the error when Pin was not defined
        const targetPin = await Pin.findById(pin).select("user"); 

        if (targetPin && targetPin.user.toString() !== userId.toString()) {
            await Notification.create({
                recipient: targetPin.user, // Pin owner
                sender: userId, // Commenter
                type: "comment",
                pin: pin,
                content: description.substring(0, 50), // Truncate content for notification
            });
        }
    } catch (error) {
        // This error handling will now catch the error if Pin or Notification model calls fail, 
        // but it will no longer be a ReferenceError for Pin.
        console.error("Error creating comment notification:", error);
    }

    res.status(201).json(comment);
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    // FIX: Get the user ID from `req.user` which is set by the new middleware
    const userId = req.user._id.toString(); 

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error in deleteComment:", error); 
    res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
};