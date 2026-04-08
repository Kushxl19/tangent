import React, { useState, memo } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────

const MessageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RemoveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const MutualIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a78bfa"
    strokeWidth="2.2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ConfirmIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── AVATAR ───────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "linear-gradient(135deg,#7c5cfc,#38bdf8)",
  "linear-gradient(135deg,#e879f9,#f43f5e)",
  "linear-gradient(135deg,#f59e0b,#22c55e)",
  "linear-gradient(135deg,#38bdf8,#7c5cfc)",
  "linear-gradient(135deg,#c084fc,#f43f5e)",
];

const Avatar = ({ user, size = 50 }) => {
  const bg = GRADIENTS[(user._id || user.id || "").charCodeAt(0) % GRADIENTS.length];
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // 👇 ADD THIS
  const presetSvg = user?.presetAvatarId
    ? PRESET_AVATARS_MAP[user.presetAvatarId]
    : PRESET_AVATARS_MAP[user?.profilePic];

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {presetSvg ? (
        <span
          dangerouslySetInnerHTML={{ __html: presetSvg }}
          style={{ width: size, height: size, display: "flex" }}
        />
      ) : user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(255,255,255,0.1)",
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: size * 0.3 + "px",
            color: "white",
          }}
        >
          {initials}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "1px",
          right: "1px",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: user.online ? "#22c55e" : "rgba(180,170,240,0.2)",
          border: "2px solid #07071a",
        }}
      />
    </div>
  );
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * FriendCard  (React.memo)
 *
 * Props:
 *  - friend: { id, name, username, avatar, online, mutualFriends, lastSeen }
 *  - onRemove: (id) => void
 */
const FriendCard = memo(({ friend, onRemove }) => {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving]           = useState(false);
  const [hovered, setHovered]             = useState(false);

  const handleRemoveClick = () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
      return;
    }
    setRemoving(true);
    setTimeout(() => onRemove(friend._id), 300);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "18px",
        borderRadius: "16px",
        background: hovered
          ? "rgba(124,92,252,0.07)"
          : "rgba(255,255,255,0.035)",
        border: `1px solid ${hovered ? "rgba(124,92,252,0.28)" : "rgba(255,255,255,0.07)"}`,
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), border-color 0.28s, background 0.28s, opacity 0.3s, box-shadow 0.28s",
        opacity: removing ? 0 : 1,
        transform: removing
          ? "scale(0.93)"
          : hovered
          ? "translateY(-3px)"
          : "translateY(0)",
        boxShadow: hovered
          ? "0 10px 32px rgba(124,92,252,0.14), 0 2px 8px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.15)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top shimmer line (appears on hover) */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg,transparent,rgba(124,92,252,0.6),rgba(56,189,248,0.4),transparent)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.28s",
      }} />

      {/* Avatar + name block */}
      <div style={{ display: "flex", alignItems: "center", gap: "13px", marginBottom: "14px" }}>
        <Avatar user={friend} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 800, fontSize: "0.93rem", color: "#eeeeff",
            letterSpacing: "-0.02em", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {friend.name}
          </div>
          <div style={{
            fontSize: "0.76rem", color: "rgba(180,170,240,0.48)",
            marginTop: "1px", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            @{friend.username}
          </div>

          {/* Online status row */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: friend.online ? "#22c55e" : "rgba(180,170,240,0.22)",
              boxShadow: friend.online ? "0 0 5px rgba(34,197,94,0.7)" : "none",
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: "0.71rem",
              color: friend.online ? "#4ade80" : "rgba(180,170,240,0.38)",
              fontWeight: 600,
            }}>
              {friend.online ? "Online" : (friend.lastSeen ?? "Offline")}
            </span>
          </div>
        </div>
      </div>

      {/* Mutual friends badge */}
      {friend.mutualFriends > 0 && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "3px 9px", borderRadius: "7px",
          background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.16)",
          marginBottom: "13px", alignSelf: "flex-start",
        }}>
          <MutualIcon />
          <span style={{ fontSize: "0.7rem", color: "#a78bfa", fontWeight: 700 }}>
            {friend.mutualFriends} mutual
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>

        {/* Message */}
        <button
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            gap: "6px", padding: "8px 0", borderRadius: "9px",
            border: "1px solid rgba(124,92,252,0.28)",
            background: "rgba(124,92,252,0.09)", color: "#c4b5fd",
            fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            transition: "all 0.18s", fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124,92,252,0.2)";
            e.currentTarget.style.borderColor = "rgba(124,92,252,0.5)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,92,252,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(124,92,252,0.09)";
            e.currentTarget.style.borderColor = "rgba(124,92,252,0.28)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
          onMouseUp={(e)   => { e.currentTarget.style.transform = "translateY(-1px)"; }}
        >
          <MessageIcon /> Message
        </button>

        {/* Remove / Confirm */}
        <button
          onClick={handleRemoveClick}
          style={{
            flex: confirmRemove ? 1.3 : 0,
            minWidth: confirmRemove ? "auto" : "36px",
            padding: "8px 10px", borderRadius: "9px",
            border: `1px solid ${confirmRemove ? "rgba(244,63,94,0.45)" : "rgba(255,255,255,0.08)"}`,
            background: confirmRemove ? "rgba(244,63,94,0.11)" : "rgba(255,255,255,0.04)",
            color: confirmRemove ? "#f87171" : "rgba(180,170,240,0.45)",
            fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "inherit", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "5px",
            whiteSpace: "nowrap", overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            if (!confirmRemove) {
              e.currentTarget.style.borderColor = "rgba(244,63,94,0.38)";
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.background = "rgba(244,63,94,0.07)";
            }
          }}
          onMouseLeave={(e) => {
            if (!confirmRemove) {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "rgba(180,170,240,0.45)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
          onMouseUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
          title="Remove friend"
        >
          {confirmRemove ? <><ConfirmIcon /> Confirm?</> : <RemoveIcon />}
        </button>
      </div>
    </div>
  );
});

FriendCard.displayName = "FriendCard";
export default FriendCard;