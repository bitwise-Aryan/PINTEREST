// // import Comment from "../models/comment.model.js";
// // // import User from "../models/user.model.js";
// // export const getPostComments = async (req, res) => {
// //   const { postId } = req.params;
// //   const comments = await Comment.find({ pin: postId })
// //     .populate("user", "username img displayName")
// //     .sort({ createdAt: -1 });
// //   res.status(200).json(comments);
// // };

// // export const addComment = async (req, res) => {
// //   const { description, pin } = req.body;
// //   const userId = req.userId;
// //   const comment = await Comment.create({ description, pin, user: userId });
// //   res.status(201).json(comment);
// // };


// // src/controllers/comment.controller.js

// import Comment from "../models/comment.model.js";
// // import User from "../models/user.model.js";
// import { isAuthenticated } from "../middlewares/auth.js"; // Ensure this is imported in the actual file

// export const getPostComments = async (req, res) => {
//   const { postId } = req.params;
//   const comments = await Comment.find({ pin: postId })
//     .populate("user", "username img displayName")
//     .sort({ createdAt: -1 });
//   res.status(200).json(comments);
// };

// // FIX: Now requires isAuthenticated middleware on its route
// export const addComment = async (req, res) => {
//   const { description, pin } = req.body;
//   
//   if (!req.user || !req.user._id) {
//     return res.status(401).json({ message: "Authentication required to add a comment." });
//   }
//   const authenticatedUserId = req.user._id; // FIX: Use authenticated user's ID
//   
//   const comment = await Comment.create({ description, pin, user: authenticatedUserId });
//   res.status(201).json(comment);
// };


import Comment from "../models/comment.model.js";

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

export const addComment = async (req, res) => {
  try {
    const { description, pin } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required to add a comment." });
    }

    const comment = await Comment.create({ description, pin, user: userId });

    // Optionally fetch updated comment count for frontend update
    const commentsCount = await Comment.countDocuments({ pin });

    res.status(201).json({ comment, commentsCount });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Could not add comment" });
  }
};
