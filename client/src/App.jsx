// src/App.jsx  (FULL REPLACEMENT)
// Adds: global socket context, real-time notification state (Feature 6)
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import AIChatbot      from "./components/AIChatbot";
import Login          from "./pages/Login";
import Signup         from "./pages/Signup";
import Home           from "./pages/Home";
import Chat           from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile        from "./pages/Profile";
import Friends        from "./pages/Friends";
import { connectSocket, disconnectSocket } from "./socket";

// ─── Global socket + notification context ─────────────────────────────────────
export const AppContext = createContext(null);
export const useAppContext = () => useContext(AppContext);

function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers,   setOnlineUsers]   = useState([]);
  const socketRef = useRef(null);

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("userInfo")); } catch { return null; }
  };

  const initSocket = useCallback(() => {
    const user = getUser();
    if (!user?._id) return;

    const socket = connectSocket(user._id);
    socketRef.current = socket;

    // Feature 6: global notification listener — works on ALL pages
    socket.on("newNotification", (data) => {
      setNotifications(prev => [
        {
          id:        `${Date.now()}-${Math.random()}`,
          type:      data.type      ?? "message",
          username:  data.fromName  ?? "Someone",
          message:   data.preview   ?? "New notification",
          timestamp: new Date(data.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read:      false,
          from:      data.from,
        },
        ...prev,
      ]);
    });

    socket.on("online users", (ids) => setOnlineUsers(ids));
  }, []);

  useEffect(() => {
    initSocket();
    // Re-init if user logs in/out mid-session
    const onStorage = (e) => {
      if (e.key === "userInfo") {
        if (e.newValue) initSocket();
        else {
          disconnectSocket();
          socketRef.current = null;
          setNotifications([]);
          setOnlineUsers([]);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [initSocket]);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  return (
    <AppContext.Provider value={{
      notifications,
      setNotifications,
      markRead,
      markAllRead,
      clearNotifications,
      onlineUsers,
      socketRef,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ── Moved into its own component so useLocation runs INSIDE <BrowserRouter> ──
function AppContent() {
  const location = useLocation();
  const hideBot = ["/login", "/signup", "/chat"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/chat"    element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>

      {!hideBot && <AIChatbot />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}