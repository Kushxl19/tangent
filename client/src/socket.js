// src/socket.js
// ─────────────────────────────────────────────────────────────
// Singleton Socket.IO client.
// Import { getSocket, connectSocket, disconnectSocket } anywhere.
// ─────────────────────────────────────────────────────────────
import { io } from "socket.io-client";

const SOCKET_URL =  import.meta.env.VITE_API_URL; // ← same as your API base

let socket = null;

/**
 * Create (or return existing) socket connection.
 * Call once after login with the logged-in userId.
 */
export const connectSocket = (userId) => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    // Tell the server who we are so it can map socketId → userId
    socket.emit("setup", userId);
  });

  return socket;
};

/** Get the current socket instance (null if not connected). */
export const getSocket = () => socket;

/** Cleanly disconnect (call on logout). */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};