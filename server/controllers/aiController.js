// backend/controllers/aiController.js
import { generateAIReply, checkRateLimit } from "../utils/aiReply.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/chat
// Global floating chatbot — no DB storage, pure conversation.
// ─────────────────────────────────────────────────────────────────────────────
export const aiChat = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Rate limit check
    if (!checkRateLimit(`chat_${userId}`)) {
      return res.status(429).json({
        message: "You're sending messages too fast. Please wait a moment.",
        reply:   "Whoa, slow down! 😅 Give me a second to catch up.",
      });
    }

    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    // Validate history shape (array of {role, content})
    const safeHistory = Array.isArray(history)
      ? history
          .filter((h) => h?.role && h?.content)
          .map((h) => ({ role: h.role, content: String(h.content) }))
      : [];

    const reply = await generateAIReply(message.trim(), safeHistory);
    return res.json({ reply });

  } catch (err) {
    console.error("[AI Chat] Error:", err?.message || err);
    return res.status(500).json({
      message: "AI is temporarily unavailable.",
      reply:   "I'm having a technical hiccup! Please try again in a moment. 🤖",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/auto-reply
// Called by the frontend when auto-reply toggle is ON for a chat.
// Returns the AI reply text — frontend saves & emits it via existing socket.
// ─────────────────────────────────────────────────────────────────────────────
export const aiAutoReply = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    if (!checkRateLimit(`auto_${userId}`)) {
      return res.status(429).json({
        message: "Rate limit exceeded. Slow down!",
      });
    }

    const { userMessage, chatHistory = [] } = req.body;

    if (!userMessage?.trim()) {
      return res.status(400).json({ message: "userMessage is required" });
    }

    const safeHistory = Array.isArray(chatHistory)
      ? chatHistory
          .filter((h) => h?.role && h?.content)
          .map((h) => ({ role: h.role, content: String(h.content) }))
      : [];

    const reply = await generateAIReply(userMessage.trim(), safeHistory);
    return res.json({ reply });

  } catch (err) {
    console.error("[AI Auto-Reply] Error:", err?.message || err);
    return res.status(500).json({
      reply: "AI auto-reply is temporarily unavailable. 🤖",
    });
  }
};