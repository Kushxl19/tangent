// routes/messageRoutes.js  — MERGED (AI reply + edit/delete/bulk/reply-to)
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Message from "../models/Message.js";

// ── Existing AI utils ─────────────────────────────────────────────────────────
import { generateAIReply, checkRateLimit, buildHistoryFromMessages } from "../utils/aiReply.js";
import { AI_USER_ID, randomDelay } from "../config/ai.js";

// ── New feature controllers ───────────────────────────────────────────────────
import {
  editMessage,
  deleteMessage,
  bulkDeleteMessages,
  markMessagesRead,
} from "../controllers/messageController.js";

const router = express.Router();

/* ─────────────────────────────────────────────────────────────────────────────
   GET ALL MESSAGES WITH A FRIEND
   Feature 2: strict E2E — only sender OR receiver can read the thread.
   Also excludes messages deleted-for-everyone or deleted-for-me.
───────────────────────────────────────────────────────────────────────────── */
router.get("/:friendId", protect, async (req, res) => {
  try {
    const userId   = req.user._id;
    const friendId = req.params.friendId;

    const messages = await Message.find({
      $or: [
        { sender: userId,   receiver: friendId },
        { sender: friendId, receiver: userId   },
      ],
      isDeletedForEveryone: { $ne: true },   // hide globally deleted messages
      deletedFor: { $ne: userId },           // hide messages deleted "for me"
    })
      .populate("sender",  "name profilePic presetAvatar email")
      .populate("receiver","name profilePic presetAvatar email")
      .populate({
        path: "replyTo",
        select: "content sender createdAt",
        populate: { path: "sender", select: "name" },
      })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("GET messages error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   SEND MESSAGE
   Feature 4: supports optional `replyTo` field.
   AI auto-reply preserved exactly as before.
───────────────────────────────────────────────────────────────────────────── */
router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, content, replyTo } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const msg = await Message.create({
      sender:   req.user._id,
      receiver: receiverId,
      content,
      read:     false,
      replyTo:  replyTo || null,   // Feature 4
    });

    // Populate replyTo so the client gets full preview data
    const populated = await Message.findById(msg._id)
      .populate("sender",  "name profilePic presetAvatar email")
      .populate("receiver","name profilePic presetAvatar email")
      .populate({
        path: "replyTo",
        select: "content sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    // ── AI AUTO-REPLY (only when chatting with ai_user) ──────────────────────
    if (receiverId === AI_USER_ID) {
      // Return the user's message immediately so UI doesn't hang
      res.status(201).json(populated);

      try {
        const userId = req.user._id.toString();

        if (checkRateLimit(`msg_${userId}`)) {
          const recentMessages = await Message.find({
            $or: [
              { sender: userId,     receiver: AI_USER_ID },
              { sender: AI_USER_ID, receiver: userId     },
            ],
          })
            .sort({ createdAt: -1 })
            .limit(12)
            .lean();

          const history = buildHistoryFromMessages(
            recentMessages.reverse(),
            AI_USER_ID
          );

          await randomDelay();

          const replyText = await generateAIReply(content, history);

          const aiMsg = await Message.create({
            sender:   AI_USER_ID,
            receiver: userId,
            content:  replyText,
            read:     false,
          });

          // ── Real-time delivery via req.io ─────────────────────────────────
          // Add this one line to server.js BEFORE route registrations:
          //   app.use((req, _, next) => { req.io = io; next(); });
          if (req.io) {
            const aiMsgPopulated = await Message.findById(aiMsg._id)
              .populate("sender", "name profilePic presetAvatar email");
            req.io.to(userId).emit("message received", aiMsgPopulated);

            // Feature 6: real-time notification for AI reply
            req.io.to(userId).emit("newNotification", {
              type:      "message",
              from:      AI_USER_ID,
              fromName:  "AI Assistant",
              preview:   replyText.slice(0, 60),
              messageId: aiMsg._id,
              at:        aiMsg.createdAt,
            });
          }
        }
      } catch (aiErr) {
        console.error("[AI] Reply generation failed:", aiErr.message);
        // Non-critical — user message was already saved & returned
      }

      return; // response already sent above
    }
    // ── END AI AUTO-REPLY ────────────────────────────────────────────────────

    res.status(201).json(populated);
  } catch (err) {
    console.error("SEND message error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   MARK MESSAGES AS READ
───────────────────────────────────────────────────────────────────────────── */
router.put("/read/:friendId", protect, markMessagesRead);

/* ─────────────────────────────────────────────────────────────────────────────
   EDIT A MESSAGE  (Feature 3)
   PUT /api/messages/edit/:id
   Body: { content: string }
───────────────────────────────────────────────────────────────────────────── */
router.put("/edit/:id", protect, editMessage);

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE A MESSAGE  (Feature 3)
   DELETE /api/messages/:id
   Body: { mode: "me" | "everyone" }
───────────────────────────────────────────────────────────────────────────── */
router.delete("/:id", protect, deleteMessage);

/* ─────────────────────────────────────────────────────────────────────────────
   BULK DELETE  (Feature 5)
   POST /api/messages/bulk-delete
   Body: { messageIds: string[], mode: "me" | "everyone" }
───────────────────────────────────────────────────────────────────────────── */
router.post("/bulk-delete", protect, bulkDeleteMessages);

export default router;