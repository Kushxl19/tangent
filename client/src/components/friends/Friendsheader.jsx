import React from "react";

// ─── ICON ─────────────────────────────────────────────────────────────────────

const SparklesIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * FriendsHeader
 *
 * Props:
 *  - friendCount:    number
 *  - onlineCount:    number
 *  - pendingCount:   number
 *  - loaded:         boolean  (drives entrance animation)
 */
const FriendsHeader = ({ friendCount, onlineCount, pendingCount, loaded }) => (
  <div className={`fr-header ${loaded ? "fr-loaded" : ""}`}>

    {/* Label pill */}
    <div className="fr-pill">
      <div className="fr-pill-dot"><SparklesIcon /></div>
      Social Hub
    </div>

    {/* Title */}
    <h1 className="fr-title">
      Your <span className="fr-title-grad">Circle</span>
    </h1>
    <p className="fr-subtitle">
      Stay connected with friends and discover new people on TanGent.
    </p>

    {/* Live stats row */}
    <div className="fr-stats">
      <div className="fr-stat-chip">
        <div className="fr-dot-green" />
        {onlineCount} online now
      </div>
      <div className="fr-stat-chip">
        <div className="fr-dot-purple" />
        {friendCount} friend{friendCount !== 1 ? "s" : ""}
      </div>
      {pendingCount > 0 && (
        <div className="fr-stat-chip">
          <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>📨</span>
          {pendingCount} pending
        </div>
      )}
    </div>
  </div>
);

export default FriendsHeader;