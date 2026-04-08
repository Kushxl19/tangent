import React from "react";

// ─── ICONS ────────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CompassIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * FriendsTabs
 *
 * Mobile-only tab row (hidden on desktop via CSS).
 *
 * Props:
 *  - activeTab:      "friends" | "discover"
 *  - onTabChange:    (tab: string) => void
 *  - friendCount:    number
 *  - pendingCount:   number
 *  - loaded:         boolean
 */
const FriendsTabs = ({ activeTab, onTabChange, friendCount, pendingCount, loaded }) => (
  <div className={`fr-tabs ${loaded ? "fr-loaded" : ""}`}>

    <button
      className={`fr-tab ${activeTab === "friends" ? "fr-tab-active" : ""}`}
      onClick={() => onTabChange("friends")}
    >
      <UsersIcon />
      My Friends
      <span className="fr-tab-badge">{friendCount}</span>
    </button>

    <button
      className={`fr-tab ${activeTab === "discover" ? "fr-tab-active" : ""}`}
      onClick={() => onTabChange("discover")}
    >
      <CompassIcon />
      Find People
      {pendingCount > 0 && (
        <span className="fr-tab-badge">{pendingCount}</span>
      )}
    </button>

  </div>
);

export default FriendsTabs;