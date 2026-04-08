import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import initSocket from "./socket/index.js";

import User from "./models/User.js";
import Message from "./models/Message.js";

dotenv.config();
connectDB();

const app = express();

/* ─── CORS ─── */
const allowedOrigins = ["https://tangent-fun.vercel.app"];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

/* ─── ROUTES ─── */
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/auth/test", (req, res) => {
  res.send("Auth route working");
});

app.get("/", (_req, res) => res.send("API Running..."));

/* 🔥 CREATE SERVER + SOCKET */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://tangent-fun.vercel.app"
  },
});

initSocket(io);

/* 👉 attach io to req AFTER creation */
app.use((req, _, next) => {
  req.io = io;
  next();
});

/* ─── SOCKET LOGIC (ONLY ONE BLOCK) ─── */
const broadcastStats = async () => {
  try {
    const [users, messages] = await Promise.all([
      User.countDocuments(),
      Message.countDocuments(),
    ]);
    io.emit("stats update", { users, messages });
  } catch (err) {
    console.error("broadcastStats error", err);
  }
};

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("setup", (userId) => {
    socket.join(userId);
  });

  socket.on("new message", (msg) => {
    const receiverId = msg.receiver;
    socket.to(receiverId).emit("message received", msg);
    broadcastStats();
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    socket.to(receiverId).emit("typing", { senderId });
  });

  socket.on("stop typing", ({ senderId, receiverId }) => {
    socket.to(receiverId).emit("stop typing", { senderId });
  });

  socket.on("disconnect", () => {
    broadcastStats();
  });

  broadcastStats();
});

/* ─── START SERVER ─── */
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
