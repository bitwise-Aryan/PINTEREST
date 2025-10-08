// // import express from "express";
// // import {
// //   getPostComments,
// //   addComment,
// // } from "../controllers/comment.controller.js";
// // import { verifyToken } from "../middlewares/verifyToken.js";

// // const router = express.Router();

// // router.get("/:postId", getPostComments);
// // router.post("/", verifyToken, addComment);

// // export default router;


// import express from "express";
// import {
//   getPostComments,
//   addComment,
// } from "../controllers/comment.controller.js";
// // FIX: Import the new, standardized middleware
// import { isAuthenticated } from "../middlewares/auth.js"; 

// const router = express.Router();

// // Public route: Anyone can view comments on a post
// router.get("/:postId", getPostComments);

// // Protected route: Only authenticated users can add a comment
// router.post("/", isAuthenticated, addComment);

// export default router;

import express from "express";
import { getPostComments, addComment } from "../controllers/comment.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:postId", getPostComments); // Public access
router.post("/", isAuthenticated, addComment); // Protected access

export default router;
