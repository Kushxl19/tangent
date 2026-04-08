// controllers/messageController.js
// ── FULL REPLACEMENT — adds edit, delete, bulk-delete, reply, strict E2E visibility ──
import Message from "../models/Message.js";

// ─── Helper: verify caller is part of the conversation ───────────────────────
const assertParticipant = (msg, userId) => {
  const sender   = msg.sender?._id?.toString()   ?? msg.sender?.toString();
  const receiver = msg.receiver?._id?.toString() ?? msg.receiver?.toString();
  const uid      = userId.toString();
  return sender === uid || receiver === uid;
};

// ─── GET /api/messages/:friendId ─────────────────────────────────────────────
// Feature 2: strict E2E — only sender OR receiver can read the thread
export const getMessages = async (req, res) => {
  try {
    const userId   = req.user._id;
    const friendId = req.params.friendId;

    const messages = await Message.find({
      $or: [
        { sender: userId,   receiver: friendId },
        { sender: friendId, receiver: userId   },
      ],
      isDeletedForEveryone: false,
      deletedFor: { $ne: userId },  // exclude messages deleted "for me"
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
    console.error("getMessages:", err);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// ─── POST /api/messages ──────────────────────────────────────────────────────
// Supports optional replyTo field
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, replyTo } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }

    const msg = await Message.create({
      sender:   req.user._id,
      receiver: receiverId,
      content:  content.trim(),
      replyTo:  replyTo || null,
    });

    const populated = await Message.findById(msg._id)
      .populate("sender",  "name profilePic presetAvatar email")
      .populate("receiver","name profilePic presetAvatar email")
      .populate({
        path: "replyTo",
        select: "content sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendMessage:", err);
    res.status(500).json({ message: "Server error sending message" });
  }
};

// ─── PUT /api/messages/edit/:id ──────────────────────────────────────────────
// Feature 3: edit — only the original sender can edit
export const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "content is required" });
    }

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed — you are not the sender" });
    }
    if (msg.isDeletedForEveryone) {
      return res.status(400).json({ message: "Cannot edit a deleted message" });
    }

    msg.content  = content.trim();
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    const populated = await Message.findById(msg._id)
      .populate("sender",  "name profilePic presetAvatar email")
      .populate("receiver","name profilePic presetAvatar email")
      .populate({
        path: "replyTo",
        select: "content sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    res.json(populated);
  } catch (err) {
    console.error("editMessage:", err);
    res.status(500).json({ message: "Server error editing message" });
  }
};

// ─── DELETE /api/messages/:id ────────────────────────────────────────────────
// Feature 3: delete for me OR delete for everyone
// Body: { mode: "me" | "everyone" }
export const deleteMessage = async (req, res) => {
  try {
    const { mode = "me" } = req.body;
    const userId = req.user._id;

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (!assertParticipant(msg, userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (mode === "everyone") {
      // Only sender can delete for everyone
      if (msg.sender.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Only sender can delete for everyone" });
      }
      msg.isDeletedForEveryone = true;
    } else {
      // Delete for me: add userId to deletedFor array (no duplicates)
      if (!msg.deletedFor.map(id => id.toString()).includes(userId.toString())) {
        msg.deletedFor.push(userId);
      }
    }

    await msg.save();
    res.json({ _id: msg._id, mode, isDeletedForEveryone: msg.isDeletedForEveryone });
  } catch (err) {
    console.error("deleteMessage:", err);
    res.status(500).json({ message: "Server error deleting message" });
  }
};

// ─── POST /api/messages/bulk-delete ──────────────────────────────────────────
// Feature 5: multi-select bulk delete
// Body: { messageIds: string[], mode: "me" | "everyone" }
export const bulkDeleteMessages = async (req, res) => {
  try {
    const { messageIds, mode = "me" } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "messageIds array required" });
    }

    const userId = req.user._id;
    const messages = await Message.find({ _id: { $in: messageIds } });

    // Ensure caller is a participant in every message
    for (const m of messages) {
      if (!assertParticipant(m, userId)) {
        return res.status(403).json({ message: `Not a participant in message ${m._id}` });
      }
    }

    if (mode === "everyone") {
      // Only delete for everyone where caller is sender
      await Message.updateMany(
        { _id: { $in: messageIds }, sender: userId },
        { $set: { isDeletedForEveryone: true } }
      );
    } else {
      // Delete for me
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { deletedFor: userId } }
      );
    }

    res.json({ deleted: messageIds.length, mode });
  } catch (err) {
    console.error("bulkDeleteMessages:", err);
    res.status(500).json({ message: "Server error during bulk delete" });
  }
};

// ─── PUT /api/messages/read/:friendId ────────────────────────────────────────
// Mark all incoming messages from a friend as read
export const markMessagesRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.friendId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("markMessagesRead:", err);
    res.status(500).json({ message: "Server error marking read" });
  }
};