import React from "react";

// ─── TYPE ICONS ───────────────────────────────────────────────────────────────

/** Bell/wave icon for friend requests */
const FriendRequestIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

/** Green dot icon for online status */
const OnlineIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

/** Chat bubble icon for messages */
const MessageIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ─── TYPE CONFIG ──────────────────────────────────────────────────────────────

/**
 * Maps a notification `type` to its icon, accent color, and badge background.
 * Add more types here as the backend evolves.
 */
const TYPE_CONFIG = {
  friend_request: {
    Icon: FriendRequestIcon,
    color: "#7c5cfc",          // --p1 purple
    bgColor: "rgba(124,92,252,0.15)",
    label: "Friend Request",
  },
  online: {
    Icon: OnlineIcon,
    color: "#22c55e",          // green
    bgColor: "rgba(34,197,94,0.15)",
    label: "Online",
  },
  message: {
    Icon: MessageIcon,
    color: "#38bdf8",          // --p2 sky blue
    bgColor: "rgba(56,189,248,0.15)",
    label: "Message",
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * NotificationItem
 *
 * Props:
 *  - notification: { id, type, username, message, timestamp, avatar, read }
 *  - onMarkRead: (id) => void   – called when the item is clicked
 */
const NotificationItem = ({ notification, onMarkRead }) => {
  const { id, type, username, message, timestamp, avatar, read } = notification;

  // Fall back gracefully for unknown types
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.message;
  const { Icon, color, bgColor } = config;

  return (
    <div
      onClick={() => !read && onMarkRead(id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "14px",
        background: read ? "transparent" : "rgba(124,92,252,0.06)",
        border: `1px solid ${read ? "rgba(255,255,255,0.05)" : "rgba(124,92,252,0.14)"}`,
        cursor: read ? "default" : "pointer",
        transition: "background 0.2s, border-color 0.2s, transform 0.15s",
        position: "relative",
        marginBottom: "8px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = read
          ? "rgba(255,255,255,0.03)"
          : "rgba(124,92,252,0.1)";
        e.currentTarget.style.transform = "translateX(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = read ? "transparent" : "rgba(124,92,252,0.06)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
      role="button"
      aria-label={`Notification from ${username}`}
    >
      {/* ── Avatar + type badge ── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Profile picture / initials fallback */}
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.08)",
            }}
          />
        ) : (
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c5cfc,#38bdf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.85rem",
              color: "white",
              border: "2px solid rgba(255,255,255,0.08)",
            }}
          >
            {username?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        {/* Tiny type badge overlaid at bottom-right of avatar */}
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: bgColor,
            border: `1.5px solid ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          <Icon />
        </div>
      </div>

      {/* ── Text block ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: "0.88rem",
              color: "#eeeeff",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "120px",
            }}
          >
            {username}
          </span>

          {/* Unread dot */}
          {!read && (
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#7c5cfc",
                flexShrink: 0,
                boxShadow: "0 0 6px rgba(124,92,252,0.8)",
              }}
            />
          )}
        </div>

        <p
          style={{
            fontSize: "0.80rem",
            color: "rgba(180,170,240,0.75)",
            lineHeight: 1.45,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {message}
        </p>

        {/* Timestamp */}
        <span
          style={{
            fontSize: "0.72rem",
            color: "rgba(180,170,240,0.4)",
            marginTop: "5px",
            display: "block",
          }}
        >
          {timestamp}
        </span>
      </div>

      {/* ── Accept / Decline quick actions (only for friend_request) ── */}
      {type === "friend_request" && !read && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()} // prevent parent click
        >
          <button
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg,#7c5cfc,#38bdf8)",
              color: "white",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "opacity 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            onClick={() => onMarkRead(id)}
          >
            Accept
          </button>
          <button
            style={{
              padding: "5px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(180,170,240,0.6)",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(244,63,94,0.4)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(180,170,240,0.6)";
            }}
            onClick={() => onMarkRead(id)}
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;