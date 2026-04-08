// socket/index.js  (FULL REPLACEMENT — drop-in for your existing socket setup)
// Handles: messaging, typing, message edit/delete, real-time notifications

const userSocketMap = new Map(); // userId → socketId

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      socket.join(userId); // each user joins their own room
      io.emit("online users", Array.from(userSocketMap.keys()));
    }

    // ── Typing indicators ──────────────────────────────────────
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("typing", { senderId });
    });
    socket.on("stop typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("stop typing", { senderId });
    });

    // ── New message ────────────────────────────────────────────
    // Server re-emits to receiver's room AND sends a notification
    socket.on("new message", (message) => {
      const receiverId = message.receiver?._id ?? message.receiver;
      const senderId   = message.sender?._id   ?? message.sender;

      // Deliver the message
      io.to(receiverId.toString()).emit("message received", message);

      // Feature 6: Real-time notification
      io.to(receiverId.toString()).emit("newNotification", {
        type:      "message",
        from:      senderId,
        fromName:  message.sender?.name ?? "Someone",
        preview:   message.content?.slice(0, 60),
        messageId: message._id,
        at:        message.createdAt || new Date().toISOString(),
      });
    });

    // ── Feature 3: Edit ────────────────────────────────────────
    // Client emits after PUT /api/messages/edit/:id succeeds
    socket.on("messageEdited", (updatedMsg) => {
      const receiverId = updatedMsg.receiver?._id ?? updatedMsg.receiver;
      const senderId   = updatedMsg.sender?._id   ?? updatedMsg.sender;
      io.to(receiverId.toString()).emit("messageEdited", updatedMsg);
      io.to(senderId.toString()).emit("messageEdited", updatedMsg);
    });

    // ── Feature 3: Delete ──────────────────────────────────────
    // Client emits after DELETE /api/messages/:id succeeds
    socket.on("messageDeleted", ({ messageId, mode, senderId, receiverId }) => {
      io.to(receiverId.toString()).emit("messageDeleted", { messageId, mode });
      io.to(senderId.toString()).emit("messageDeleted",   { messageId, mode });
    });

    // ── Feature 5: Bulk delete ─────────────────────────────────
    socket.on("bulkMessagesDeleted", ({ messageIds, mode, senderId, receiverId }) => {
      io.to(receiverId.toString()).emit("bulkMessagesDeleted", { messageIds, mode });
      io.to(senderId.toString()).emit("bulkMessagesDeleted",   { messageIds, mode });
    });

    // ── Friend request notification ────────────────────────────
    // Call this from your friends controller after creating a request
    socket.on("friendRequest", ({ toUserId, fromUser }) => {
      io.to(toUserId.toString()).emit("newNotification", {
        type:     "friend_request",
        from:     fromUser._id,
        fromName: fromUser.name,
        at:       new Date().toISOString(),
      });
    });

    // ── Disconnect ─────────────────────────────────────────────
    socket.on("disconnect", () => {
      if (userId) userSocketMap.delete(userId);
      io.emit("online users", Array.from(userSocketMap.keys()));
    });
  });

  // ── Helper to emit from controllers ───────────────────────────────────────
  // Usage in controllers:  req.io.to(userId).emit("newNotification", data)
  // Make sure you attach io to req in your server entry:
  //   app.use((req,_,next) => { req.io = io; next(); });
};

export default initSocket;