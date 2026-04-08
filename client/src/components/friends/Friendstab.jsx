import React, { useState } from "react";
import FriendCard from "./FriendCard";
import SearchBar from "./SearchBar";
import EmptyState from "./EmptyState";

// ─── ICONS ────────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * FriendsTab
 *
 * Props:
 *  - friends:            full friend list (for counts)
 *  - filteredFriends:    search-filtered friend list
 *  - searchQuery:        string
 *  - onSearchChange:     (q: string) => void
 *  - onRemove:           (id: string) => void
 *  - onSwitchDiscover:   () => void
 */
const FriendsTab = ({
  friends,
  filteredFriends,
  searchQuery,
  onSearchChange,
  onRemove,
  onSwitchDiscover,
}) => {
  const [onlineOnly, setOnlineOnly] = useState(false);

  const onlineCount = friends.filter((f) => f.online).length;

  // Apply online filter on top of already-searched list
  const displayed = onlineOnly
    ? filteredFriends.filter((f) => f.online)
    : filteredFriends;

  return (
    <div className="fr-panel">

      {/* ── Panel header ── */}
      <div className="fr-panel-head">
        <div className="fr-sec-header">
          <div>
            <div className="fr-sec-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UsersIcon /> My Friends
            </div>
            <div className="fr-sec-count">
              {friends.length} total · {onlineCount} online
            </div>
          </div>

          {/* Online / All filter */}
          <div className="fr-filter-row">
            <button
              className={`fr-filter-btn fr-filter-btn-all ${!onlineOnly ? "fr-active" : ""}`}
              onClick={() => setOnlineOnly(false)}
            >
              All
            </button>
            <button
              className={`fr-filter-btn fr-filter-btn-online ${onlineOnly ? "fr-active" : ""}`}
              onClick={() => setOnlineOnly(true)}
            >
              <div className="fr-dot-green" />
              Online
            </button>
          </div>
        </div>
      </div>

      {/* ── Sticky search bar (only if there's something to search) ── */}
      {friends.length > 0 && (
        <div className="fr-search-sticky">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search friends..."
          />
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="fr-panel-scroll">

        {/* Case 1: No friends at all */}
        {friends.length === 0 && (
          <EmptyState
            icon="friends"
            title="No friends yet"
            subtitle="Start building your circle — find people on TanGent and send your first request."
            ctaLabel="Find People →"
            onCta={onSwitchDiscover}
          />
        )}

        {/* Case 2: Online filter is on but nobody online */}
        {friends.length > 0 && displayed.length === 0 && onlineOnly && (
          <EmptyState
            icon="offline"
            title="Nobody online"
            subtitle="None of your friends are online right now. Check back later!"
          />
        )}

        {/* Case 3: Search returned nothing */}
        {friends.length > 0 && displayed.length === 0 && !onlineOnly && searchQuery && (
          <EmptyState
            icon="search"
            title="No match found"
            subtitle={`No friends match "${searchQuery}".`}
          />
        )}

        {/* ── Friend list ── */}
        {displayed.length > 0 && (
          <div className="fr-friends-grid">
            {displayed.map((friend, i) => (
              <div
                key={friend._id}
                className="fr-card-enter"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <FriendCard friend={friend} onRemove={onRemove} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default FriendsTab;