// backend/routes/aiRoutes.js
import express from "express";
import { aiChat, aiAutoReply } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js"; // ← adjust path if yours differs

const router = express.Router();

// POST /api/ai/chat       — global floating chatbot
router.post("/chat", protect, aiChat);

// POST /api/ai/auto-reply — auto-reply in Chat.jsx
router.post("/auto-reply", protect, aiAutoReply);

export default router;