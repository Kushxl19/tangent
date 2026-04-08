import React, { useEffect, useRef } from "react";
import NotificationItem from "./NotificationItem";

// ─── ICONS ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BellOffIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
    <path d="M18 8a6 6 0 0 0-9.33-5" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckAllIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="20 12 9 23 4 18" opacity="0.5" />
  </svg>
);

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * NotificationSidebar
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - notifications: Array<NotificationObject>
 *  - onMarkRead: (id) => void
 *  - onMarkAllRead: () => void
 */
const NotificationSidebar = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const sidebarRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Close on outside click ──
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    // slight delay so the opening click doesn't immediately close
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose]);

  // ── Lock body scroll when open ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ── Close on Escape ──
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* ── CSS Keyframes injected once ── */}
      <style>{`
        @keyframes ntf-overlay-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ntf-overlay-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes ntf-slide-in    { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes ntf-slide-out   { from { transform: translateX(0) }   to { transform: translateX(100%) } }
        @keyframes ntf-fade-up     { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes ntf-spin        { to { transform: rotate(360deg) } }

        .ntf-item-enter {
          animation: ntf-fade-up 0.3s ease both;
        }
        .ntf-scrollbar::-webkit-scrollbar        { width: 4px; }
        .ntf-scrollbar::-webkit-scrollbar-track  { background: transparent; }
        .ntf-scrollbar::-webkit-scrollbar-thumb  { background: rgba(124,92,252,0.3); border-radius: 4px; }
        .ntf-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124,92,252,0.6); }
      `}</style>

      {/* ── Dim overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(7,7,26,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          pointerEvents: isOpen ? "auto" : "none",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
        onClick={onClose}
      />

      {/* ── Sidebar panel ── */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(400px, 100vw)",
          background: "linear-gradient(180deg, rgba(15,12,35,0.98) 0%, rgba(7,7,26,0.99) 100%)",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(124,92,252,0.2)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isOpen ? "-20px 0 80px rgba(124,92,252,0.12)" : "none",
        }}
      >
        {/* ── Top shimmer line ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.8), rgba(56,189,248,0.6), transparent)",
          }}
        />

        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#eeeeff",
                    letterSpacing: "-0.02em",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Notifications
                </h2>

                {/* Live unread count badge */}
                {unreadCount > 0 && (
                  <div
                    style={{
                      padding: "2px 8px",
                      borderRadius: "20px",
                      background: "linear-gradient(135deg,#7c5cfc,#38bdf8)",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "0.02em",
                      lineHeight: 1.6,
                    }}
                  >
                    {unreadCount} new
                  </div>
                )}
              </div>

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(180,170,240,0.45)",
                  marginTop: "3px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {notifications.length === 0
                  ? "You're all caught up"
                  : `${notifications.length} total notification${notifications.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(180,170,240,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(124,92,252,0.15)";
                e.currentTarget.style.borderColor = "rgba(124,92,252,0.35)";
                e.currentTarget.style.color = "#eeeeff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(180,170,240,0.7)";
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* ── Mark all as read ── */}
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(124,92,252,0.25)",
                background: "rgba(124,92,252,0.08)",
                color: "rgba(196,181,253,0.9)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                width: "100%",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(124,92,252,0.18)";
                e.currentTarget.style.borderColor = "rgba(124,92,252,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(124,92,252,0.08)";
                e.currentTarget.style.borderColor = "rgba(124,92,252,0.25)";
              }}
            >
              <CheckAllIcon />
              Mark all as read
            </button>
          )}
        </div>

        {/* ── Notification List ── */}
        <div
          className="ntf-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 16px",
          }}
        >
          {notifications.length === 0 ? (
            /* ── Empty State ── */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "14px",
                paddingBottom: "60px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: "rgba(124,92,252,0.08)",
                  border: "1px solid rgba(124,92,252,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(124,92,252,0.5)",
                }}
              >
                <BellOffIcon />
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "#eeeeff",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "6px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  All clear!
                </p>
                <p
                  style={{
                    color: "rgba(180,170,240,0.45)",
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  No notifications yet.
                  <br />
                  We'll let you know when something
                  <br />
                  happens.
                </p>
              </div>
            </div>
          ) : (
            /* ── Items with staggered entrance ── */
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                className="ntf-item-enter"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkRead={onMarkRead}
                />
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {notifications.length > 0 && (
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <button
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(180,170,240,0.55)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(180,170,240,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.color = "rgba(180,170,240,0.55)";
              }}
            >
              View all activity →
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default NotificationSidebar;