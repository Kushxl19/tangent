import express from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/", async (req, res) => {   // ← "/" not "/stats"
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();

    res.json({
      users: totalUsers,
      messages: totalMessages,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;