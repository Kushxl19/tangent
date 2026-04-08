import express from "express";
import { getUsers, getSentRequests } from "../controllers/friendController.js";
import { getMe }                     from "../controllers/authController.js";
import {
  updateMe,
  updatePassword,
  updatePrivacy,
  disableAccount,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── READ ──────────────────────────────────────────────────────────────────────
router.get("/me",            protect, getMe);
router.get("/sent-requests", protect, getSentRequests);
router.get("/",              protect, getUsers);          // must stay last

// ── UPDATE PROFILE (JSON body — no file upload, preset avatars only) ──────────
router.put("/me",          protect, updateMe);

// ── UPDATE PASSWORD ───────────────────────────────────────────────────────────
router.put("/me/password", protect, updatePassword);

// ── PRIVACY SETTINGS ──────────────────────────────────────────────────────────
router.put("/me/privacy",  protect, updatePrivacy);

// ── DISABLE ACCOUNT ───────────────────────────────────────────────────────────
router.put("/me/disable",  protect, disableAccount);

// ── DELETE ACCOUNT ────────────────────────────────────────────────────────────
router.delete("/me",       protect, deleteAccount);

export default router;