import React from "react";

// ─── BUILT-IN ICON PRESETS ────────────────────────────────────────────────────

const ICONS = {
  friends: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  search: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  ),
  offline: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

/**
 * EmptyState
 *
 * Props:
 *  - icon: "friends" | "search" | "offline"   (default "search")
 *  - title: string
 *  - subtitle: string
 *  - ctaLabel?: string         — if provided, renders a CTA button
 *  - onCta?: () => void
 */
const EmptyState = ({ icon = "search", title, subtitle, ctaLabel, onCta }) => (
  <div className="fr-empty">
    <div className="fr-empty-icon">
      {ICONS[icon] ?? ICONS.search}
    </div>
    <p className="fr-empty-title">{title}</p>
    <p className="fr-empty-sub">{subtitle}</p>
    {ctaLabel && onCta && (
      <button className="fr-empty-btn" onClick={onCta}>
        {ctaLabel}
      </button>
    )}
  </div>
);

export default EmptyState;