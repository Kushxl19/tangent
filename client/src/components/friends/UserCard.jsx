import React, { useState, memo } from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────

const AddIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const PendingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FriendsCheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── AVATAR ───────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "linear-gradient(135deg,#7c5cfc,#38bdf8)",
  "linear-gradient(135deg,#e879f9,#f43f5e)",
  "linear-gradient(135deg,#f59e0b,#22c55e)",
  "linear-gradient(135deg,#38bdf8,#7c5cfc)",
  "linear-gradient(135deg,#c084fc,#e879f9)",
  "linear-gradient(135deg,#22c55e,#38bdf8)",
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

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  none: {
    label: "Add Friend",
    Icon: AddIcon,
    base: {
      background: "linear-gradient(135deg,#7c5cfc,#5b3ed4)",
      border: "1px solid transparent",
      color: "white",
      boxShadow: "0 3px 14px rgba(124,92,252,0.38)",
      cursor: "pointer",
    },
    hover: {
      background: "linear-gradient(135deg,#8e72fd,#6b4fe0)",
      boxShadow: "0 5px 20px rgba(124,92,252,0.5)",
    },
  },
  pending: {
    label: "Pending",
    Icon: PendingIcon,
    base: {
      background: "rgba(245,158,11,0.1)",
      border: "1px solid rgba(245,158,11,0.32)",
      color: "#fbbf24",
      boxShadow: "none",
      cursor: "default",
    },
    hover: null,
  },
  friends: {
    label: "Friends",
    Icon: FriendsCheckIcon,
    base: {
      background: "rgba(34,197,94,0.09)",
      border: "1px solid rgba(34,197,94,0.28)",
      color: "#4ade80",
      boxShadow: "none",
      cursor: "default",
    },
    hover: null,
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * UserCard  (React.memo)
 *
 * Props:
 *  - user: { id, name, username, avatar, online, bio, mutualFriends }
 *  - status: "none" | "pending" | "friends"
 *  - onAddFriend: (id) => void
 */
const UserCard = memo(({ user, status, onAddFriend }) => {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.none;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "13px 15px",
        borderRadius: "14px",
        background: hovered ? "rgba(124,92,252,0.06)" : "rgba(255,255,255,0.028)",
        border: `1px solid ${hovered ? "rgba(124,92,252,0.22)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateX(3px)" : "translateX(0)",
        boxShadow: hovered ? "0 3px 18px rgba(124,92,252,0.1)" : "none",
      }}
    >
      {/* Avatar */}
      <Avatar user={user} size={44} />

      {/* Text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: "0.88rem", color: "#eeeeff",
          letterSpacing: "-0.01em", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {user.name}
        </div>
        <div style={{
          fontSize: "0.73rem", color: "rgba(180,170,240,0.43)", marginTop: "1px",
        }}>
          @{user.username}
        </div>

        {/* Bio */}
        {user.bio && (
          <div style={{
            fontSize: "0.73rem", color: "rgba(180,170,240,0.52)",
            marginTop: "3px", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis", fontStyle: "italic",
          }}>
            {user.bio}
          </div>
        )}

        {/* Mutual friends */}
        {user.mutualFriends > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
            {/* Mini avatar stack */}
            <div style={{ display: "flex" }}>
              {[...Array(Math.min(user.mutualFriends, 3))].map((_, i) => (
                <div key={i} style={{
                  width: "13px", height: "13px", borderRadius: "50%",
                  background: GRADIENTS[i],
                  border: "1.5px solid #07071a",
                  marginLeft: i > 0 ? "-4px" : "0",
                }} />
              ))}
            </div>
            <span style={{ fontSize: "0.68rem", color: "rgba(180,170,240,0.38)", marginLeft: "3px" }}>
              {user.mutualFriends} mutual
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={() => status === "none" && onAddFriend(user._id)}
        disabled={status !== "none"}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "7px 13px", borderRadius: "9px",
          fontSize: "0.76rem", fontWeight: 700,
          transition: "all 0.18s",
          fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap",
          ...cfg.base,
        }}
        onMouseEnter={(e) => {
          if (status === "none" && cfg.hover) {
            Object.assign(e.currentTarget.style, cfg.hover);
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (status === "none") {
            Object.assign(e.currentTarget.style, cfg.base);
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
        onMouseDown={(e) => {
          if (status === "none") e.currentTarget.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          if (status === "none") e.currentTarget.style.transform = "translateY(-1px)";
        }}
      >
        <cfg.Icon />
        {cfg.label}
      </button>
    </div>
  );
});

UserCard.displayName = "UserCard";
export default UserCard;