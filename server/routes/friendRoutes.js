import express from "express";
import {
  getFriends,
  sendRequest,
  removeFriend,       // ✅ now exists in the controller
  acceptRequest,
  rejectRequest,
  getRequests,
} from "../controllers/friendController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFriends);
router.get("/requests", protect, getRequests);

router.post("/request", protect, sendRequest);
router.post("/accept", protect, acceptRequest);
router.post("/reject", protect, rejectRequest);

router.delete("/:id", protect, removeFriend);  // ✅ now actually works

export default router;