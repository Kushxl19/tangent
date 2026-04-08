// routes/settingsRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // your existing JWT middleware
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.use(protect); // all settings routes require auth

router.get("/",protect, getSettings);
router.put("/",protect, updateSettings);

export default router;