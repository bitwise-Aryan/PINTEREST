// import express from "express";
// import {
//   getPins,
//   getPin,
//   createPin,
//   interactionCheck,
//   interact,
// } from "../controllers/pin.controller.js";
// import { verifyToken } from "../middlewares/verifyToken.js";

// const router = express.Router();

// router.get("/", getPins);
// router.get("/:id", getPin);
// router.post("/", verifyToken, createPin);
// router.get("/interaction-check/:id", interactionCheck);
// router.post("/interact/:id",verifyToken, interact);

// export default router;

// src/routes/pin.routes.js

import express from "express";
import {
  getPins,
  getPin,
  createPin,
  interactionCheck,
  interact,
  deletePin,
  getPopularTags,
  getTrendingPins,
  getRelatedTags,
  getSimilarPins
} from "../controllers/pin.controller.js";
// FIX: Replace the old verifyToken with the new isAuthenticated middleware
import { isAuthenticated } from "../middlewares/auth.js"; 

const router = express.Router();

router.get("/tags/popular", getPopularTags);
router.get("/trending", getTrendingPins);
router.get("/related-tags", isAuthenticated, getRelatedTags);
router.get("/", getPins);
router.get("/:id/similar", getSimilarPins);
router.get("/:id", getPin);

// FIX: Protected route using isAuthenticated
router.post("/", isAuthenticated, createPin); 

router.get("/interaction-check/:id", interactionCheck);
router.post("/interact/:id",isAuthenticated, interact);
router.delete("/:id", isAuthenticated, deletePin);

export default router;