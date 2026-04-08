import React, { useState } from "react";
import UserCard from "./UserCard";
import SearchBar from "./SearchBar";
import EmptyState from "./EmptyState";

// ─── ICONS ────────────────────────────────────────────────────────────────────

const CompassIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── CHIP CONFIG ──────────────────────────────────────────────────────────────

const CHIPS = ["All", "Online", "Mutual friends", "Pending"];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * DiscoverTab
 *
 * Props:
 *  - discoverUsers:          computed user list with status field
 *  - discoverQuery:          string
 *  - onDiscoverQueryChange:  (q: string) => void
 *  - onAddFriend:            (id: string) => void
 */
const DiscoverTab = ({
  discoverUsers,
  discoverQuery,
  onDiscoverQueryChange,
  onAddFriend,
}) => {
  const [activeChip, setActiveChip] = useState("All");

  // Apply chip filter on top of text-search results
  const displayed = discoverUsers.filter((u) => {
    if (activeChip === "Online")          return u.online;
    if (activeChip === "Mutual friends")  return u.mutualFriends > 0;
    if (activeChip === "Pending")         return u.status === "pending";
    return true;
  });

  // Split into three buckets
  const suggestions    = displayed.filter((u) => u.status === "none");
  const pendingUsers   = displayed.filter((u) => u.status === "pending");
  const alreadyFriends = displayed.filter((u) => u.status === "friends");

  const hasOtherSections = pendingUsers.length > 0 || alreadyFriends.length > 0;

  return (
    <div className="fr-panel">

      {/* ── Panel header ── */}
      <div className="fr-panel-head">
        <div className="fr-sec-header">
          <div>
            <div className="fr-sec-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CompassIcon /> Find People
            </div>
            <div className="fr-sec-count">Discover people on TanGent</div>
          </div>
        </div>
      </div>

      {/* ── Sticky search ── */}
      <div className="fr-search-sticky">
        <SearchBar
          value={discoverQuery}
          onChange={onDiscoverQueryChange}
          placeholder="Search by name, username, or bio..."
        />
      </div>

      {/* ── Scrollable content ── */}
      <div className="fr-panel-scroll">

        {/* Filter chips */}
        <div className="fr-chips">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              className={`fr-chip ${activeChip === chip ? "fr-chip-active" : ""}`}
              onClick={() => setActiveChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* No results */}
        {displayed.length === 0 && (
          <EmptyState
            icon="search"
            title="No users found"
            subtitle={
              discoverQuery
                ? `No results for "${discoverQuery}". Try a different search.`
                : "No users match this filter right now."
            }
          />
        )}

        {/* ── SECTION: Suggestions ── */}
        {suggestions.length > 0 && (
          <>
            {hasOtherSections && (
              <div className="fr-divider">
                <div className="fr-divider-line" />
                <span className="fr-divider-label">Suggestions</span>
                <div className="fr-divider-line" />
              </div>
            )}

            {/* Highlighted suggestion wrapper */}
            <div className="fr-suggestion-wrap">
              <div className="fr-suggestion-label">
                <StarIcon /> Suggested for you
              </div>
              <div className="fr-discover-list">
                {suggestions.map((user, i) => (
                  <div
                    key={user._id}
                    className="fr-row-enter"
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    <UserCard
                      user={user}
                      status={user.status}
                      onAddFriend={onAddFriend}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── SECTION: Pending ── */}
        {pendingUsers.length > 0 && (
          <>
            <div className="fr-divider">
              <div className="fr-divider-line" />
              <span className="fr-divider-label">Pending · {pendingUsers.length}</span>
              <div className="fr-divider-line" />
            </div>
            <div className="fr-discover-list">
              {pendingUsers.map((user, i) => (
                <div
                  key={user._id}
                  className="fr-row-enter"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <UserCard user={user} status="pending" onAddFriend={onAddFriend} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SECTION: Already friends ── */}
        {alreadyFriends.length > 0 && (
          <>
            <div className="fr-divider">
              <div className="fr-divider-line" />
              <span className="fr-divider-label">Already friends · {alreadyFriends.length}</span>
              <div className="fr-divider-line" />
            </div>
            <div className="fr-discover-list">
              {alreadyFriends.map((user, i) => (
                <div
                  key={user._id}
                  className="fr-row-enter"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <UserCard user={user} status="friends" onAddFriend={onAddFriend} />
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default DiscoverTab;