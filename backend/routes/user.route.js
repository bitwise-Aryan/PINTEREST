import express from "express";

// import {
//   getUser,
//   registerUser,
//   loginUser,
//   logoutUser,
//   followUser
// } from "../controllers/user.controller.js";
// import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// router.get("/test",(req,res)=>{
//     return res.json("hello from user routes")
// });


import {test} from "../controllers/user.controller.js"
router.get("/test",test);

// router.get("/:username", getUser);
// router.post("/auth/register", registerUser);
// router.post("/auth/login", loginUser);
// router.post("/auth/logout", logoutUser);
// router.post("/follow/:username", verifyToken, followUser);

export default router;