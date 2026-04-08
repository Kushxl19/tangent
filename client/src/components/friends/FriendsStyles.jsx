/**
 * friendsStyles.js
 * All page-level CSS for the Friends feature in one place.
 * Imported by Friends.jsx as a <style> tag.
 */

export const FRIENDS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  /* ── Reset scoped to page ── */
  .fr-page *, .fr-page *::before, .fr-page *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }

  /* ── Root page shell ── */
  .fr-page {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #07071a;
    color: #eeeeff;
    min-height: 100vh;
    padding-top: 68px;
    overflow-x: hidden;
    position: relative;
  }

  /* ════════════════════════════
     BACKGROUND
  ════════════════════════════ */
  .fr-bg {
    position: fixed; inset: 0; z-index: 0;
    pointer-events: none; overflow: hidden;
  }
  .fr-bg-base {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 65% 55% at 80% 10%, rgba(124,92,252,0.2) 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 5%  85%, rgba(56,189,248,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(192,132,252,0.07) 0%, transparent 50%),
      #07071a;
  }
  .fr-bg-grid {
    position: absolute; inset: 0; opacity: 0.17;
    background-image: radial-gradient(circle, rgba(140,120,255,0.35) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 10%, transparent 100%);
  }
  .fr-orb {
    position: absolute; border-radius: 50%;
    filter: blur(90px); opacity: 0.18;
    animation: frFloatOrb 14s ease-in-out infinite alternate;
  }
  @keyframes frFloatOrb {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(28px,-20px) scale(1.1); }
  }

  /* ════════════════════════════
     LAYOUT SHELL
  ════════════════════════════ */
  .fr-wrap {
    position: relative; z-index: 10;
    max-width: 1180px;
    margin: 0 auto;
    padding: 44px 5% 80px;
  }

  /* ════════════════════════════
     HEADER
  ════════════════════════════ */
  .fr-header {
    margin-bottom: 32px;
    opacity: 0; transform: translateY(18px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fr-header.fr-loaded { opacity: 1; transform: translateY(0); }

  .fr-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 14px 5px 7px; border-radius: 50px; margin-bottom: 16px;
    background: rgba(124,92,252,0.1); border: 1px solid rgba(124,92,252,0.28);
    font-size: 0.7rem; font-weight: 800; color: #c4b5fd;
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  .fr-pill-dot {
    width: 20px; height: 20px; border-radius: 50%;
    background: linear-gradient(135deg,#7c5cfc,#c084fc);
    display: flex; align-items: center; justify-content: center;
  }

  .fr-title {
    font-size: clamp(1.9rem, 4vw, 2.7rem);
    font-weight: 900; letter-spacing: -1.5px; line-height: 1.1;
    margin-bottom: 8px;
  }
  .fr-title-grad {
    background: linear-gradient(90deg,#c4b5fd,#7c5cfc,#38bdf8);
    background-size: 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: frGradShift 5s linear infinite;
  }
  @keyframes frGradShift { from{background-position:0%} to{background-position:200%} }

  .fr-subtitle {
    font-size: 0.88rem; color: rgba(180,170,240,0.48); line-height: 1.6;
  }

  /* ── Stats row ── */
  .fr-stats {
    display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px;
  }
  .fr-stat-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 50px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    font-size: 0.76rem; font-weight: 700; color: rgba(180,170,240,0.7);
    transition: border-color 0.2s;
  }
  .fr-stat-chip:hover { border-color: rgba(124,92,252,0.3); }
  .fr-dot-green  { width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 7px rgba(34,197,94,0.8); }
  .fr-dot-purple { width:7px;height:7px;border-radius:50%;background:#7c5cfc;box-shadow:0 0 7px rgba(124,92,252,0.8); }

  /* ════════════════════════════
     TABS (mobile only)
  ════════════════════════════ */
  .fr-tabs {
    display: none; /* hidden on desktop — both panels show */
    gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 5px;
    margin-bottom: 28px; width: 100%;
    opacity: 0; transform: translateY(14px);
    transition: opacity 0.5s 0.1s ease, transform 0.5s 0.1s ease;
  }
  .fr-tabs.fr-loaded { opacity: 1; transform: translateY(0); }

  .fr-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 10px 16px; border-radius: 10px;
    font-size: 0.85rem; font-weight: 700;
    cursor: pointer; transition: all 0.22s;
    border: 1px solid transparent; background: transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: rgba(180,170,240,0.5);
  }
  .fr-tab:hover:not(.fr-tab-active) {
    color: rgba(180,170,240,0.85);
    background: rgba(255,255,255,0.04);
  }
  .fr-tab-active {
    background: rgba(124,92,252,0.17);
    color: #c4b5fd;
    border-color: rgba(124,92,252,0.28);
    box-shadow: 0 0 18px rgba(124,92,252,0.1);
  }
  .fr-tab-badge {
    min-width: 20px; height: 20px; padding: 0 5px;
    border-radius: 6px; font-size: 0.67rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
  }
  .fr-tab-active .fr-tab-badge { background: rgba(124,92,252,0.3); color: #c4b5fd; }
  .fr-tab:not(.fr-tab-active) .fr-tab-badge { background: rgba(255,255,255,0.07); color: rgba(180,170,240,0.5); }

  /* ════════════════════════════
     SPLIT LAYOUT
  ════════════════════════════ */
  .fr-body {
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.45s 0.2s ease, transform 0.45s 0.2s ease;
  }
  .fr-body.fr-loaded { opacity: 1; transform: translateY(0); }

  /* Desktop: side-by-side */
  .fr-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }

  /* Panel shared styles */
  .fr-panel {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
  }
  /* Top shimmer accent */
  .fr-panel::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg,transparent,rgba(124,92,252,0.4),rgba(56,189,248,0.3),transparent);
  }

  .fr-panel-head {
    padding: 20px 20px 0;
  }
  .fr-panel-body {
    padding: 16px 20px 20px;
  }

  /* Sticky search bar */
  .fr-search-sticky {
    position: sticky;
    top: 68px; /* navbar height */
    z-index: 20;
    padding: 12px 20px;
    background: rgba(7,7,26,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin: 0 -1px; /* bleed to panel edges */
  }

  /* Scrollable panel interior */
  .fr-panel-scroll {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    padding: 16px 20px 20px;
  }
  .fr-panel-scroll::-webkit-scrollbar { width: 4px; }
  .fr-panel-scroll::-webkit-scrollbar-track { background: transparent; }
  .fr-panel-scroll::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.22); border-radius: 4px; }
  .fr-panel-scroll::-webkit-scrollbar-thumb:hover { background: rgba(124,92,252,0.45); }

  /* ════════════════════════════
     PANEL SECTION HEADER
  ════════════════════════════ */
  .fr-sec-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; flex-wrap: wrap; gap: 10px;
  }
  .fr-sec-title {
    font-size: 1rem; font-weight: 800; color: #eeeeff; letter-spacing: -0.02em;
  }
  .fr-sec-count {
    font-size: 0.73rem; color: rgba(180,170,240,0.4); margin-top: 2px; font-weight: 500;
  }

  /* ── Filter buttons ── */
  .fr-filter-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .fr-filter-btn {
    padding: 5px 11px; border-radius: 8px; font-size: 0.73rem; font-weight: 700;
    cursor: pointer; transition: all 0.16s; border: 1px solid transparent;
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex; align-items: center; gap: 5px;
  }
  .fr-filter-btn-all {
    background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.09);
    color: rgba(180,170,240,0.6);
  }
  .fr-filter-btn-all:hover { background: rgba(255,255,255,0.09); color: rgba(180,170,240,0.9); }
  .fr-filter-btn-all.fr-active { background: rgba(124,92,252,0.14); border-color: rgba(124,92,252,0.32); color: #c4b5fd; }
  .fr-filter-btn-online {
    background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.08);
    color: rgba(180,170,240,0.55);
  }
  .fr-filter-btn-online:hover { background: rgba(34,197,94,0.09); color: #4ade80; border-color: rgba(34,197,94,0.25); }
  .fr-filter-btn-online.fr-active { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.3); color: #4ade80; }

  /* ════════════════════════════
     FRIENDS GRID
  ════════════════════════════ */
  .fr-friends-grid {
    display: flex; flex-direction: column; gap: 10px;
  }
  /* On desktop, the panel is already split — stack vertically for density */

  /* ════════════════════════════
     DISCOVER LIST
  ════════════════════════════ */
  .fr-discover-list { display: flex; flex-direction: column; gap: 6px; }

  /* ════════════════════════════
     DIVIDER
  ════════════════════════════ */
  .fr-divider {
    display: flex; align-items: center; gap: 10px;
    margin: 20px 0 14px;
  }
  .fr-divider-line { flex:1; height:1px; background: rgba(255,255,255,0.06); }
  .fr-divider-label {
    font-size: 0.68rem; font-weight: 700; color: rgba(180,170,240,0.32);
    text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap;
  }

  /* ════════════════════════════
     DISCOVER CHIPS
  ════════════════════════════ */
  .fr-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
  .fr-chip {
    padding: 5px 12px; border-radius: 8px; font-size: 0.74rem; font-weight: 700;
    cursor: pointer; transition: all 0.16s;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04); color: rgba(180,170,240,0.55);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .fr-chip:hover { background: rgba(124,92,252,0.1); border-color: rgba(124,92,252,0.28); color: #c4b5fd; }
  .fr-chip.fr-chip-active {
    background: rgba(124,92,252,0.16); border-color: rgba(124,92,252,0.38); color: #c4b5fd;
    box-shadow: 0 0 12px rgba(124,92,252,0.15);
  }

  /* ════════════════════════════
     SUGGESTION HIGHLIGHT
  ════════════════════════════ */
  .fr-suggestion-wrap {
    border-radius: 14px;
    background: rgba(124,92,252,0.04);
    border: 1px solid rgba(124,92,252,0.1);
    padding: 12px;
    margin-bottom: 4px;
  }
  .fr-suggestion-label {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 6px; margin-bottom: 10px;
    background: rgba(124,92,252,0.12); border: 1px solid rgba(124,92,252,0.22);
    font-size: 0.67rem; font-weight: 800; color: #c4b5fd; letter-spacing: 0.06em; text-transform: uppercase;
  }

  /* ════════════════════════════
     EMPTY STATE
  ════════════════════════════ */
  .fr-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 48px 20px; gap: 12px; text-align: center;
  }
  .fr-empty-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: rgba(124,92,252,0.07); border: 1px solid rgba(124,92,252,0.14);
    display: flex; align-items: center; justify-content: center;
    color: rgba(124,92,252,0.45); margin-bottom: 4px;
  }
  .fr-empty-title {
    font-size: 1rem; font-weight: 800; color: #eeeeff; letter-spacing: -0.02em;
  }
  .fr-empty-sub {
    font-size: 0.81rem; color: rgba(180,170,240,0.4);
    line-height: 1.65; max-width: 260px;
  }
  .fr-empty-btn {
    margin-top: 6px; padding: 9px 20px; border-radius: 10px;
    background: linear-gradient(135deg,#7c5cfc,#5b3ed4);
    border: none; color: white; font-size: 0.81rem; font-weight: 700;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 4px 18px rgba(124,92,252,0.38); transition: all 0.2s;
  }
  .fr-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(124,92,252,0.5); }
  .fr-empty-btn:active { transform: translateY(0) scale(0.97); }

  /* ════════════════════════════
     ANIMATIONS
  ════════════════════════════ */
  .fr-card-enter {
    animation: frCardIn 0.38s cubic-bezier(0.34,1.15,0.64,1) both;
  }
  @keyframes frCardIn {
    from { opacity: 0; transform: scale(0.94) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .fr-row-enter {
    animation: frRowIn 0.32s ease both;
  }
  @keyframes frRowIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* Online dot pulse */
  @keyframes frPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
    50%       { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
  }
  .fr-pulse { animation: frPulse 2.2s ease-in-out infinite; }

  /* Tab content fade */
  .fr-tab-panel {
    animation: frTabFadeIn 0.28s ease both;
  }
  @keyframes frTabFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ════════════════════════════
     RESPONSIVE
  ════════════════════════════ */
  @media (max-width: 860px) {
    .fr-split { display: block; }
    .fr-tabs  { display: flex; }
    .fr-panel-scroll { max-height: none; overflow: visible; }
    .fr-search-sticky { top: 68px; margin: 0; border-radius: 12px; }
    /* Hide panels that are not the active tab */
    .fr-split > div:not(.fr-tab-panel) { display: none; }
    .fr-split > div.fr-tab-panel {
      display: block;
      animation: frTabFadeIn 0.28s ease both;
    }
    /* Strip card styling on mobile */
    .fr-panel {
      background: transparent;
      border: none;
      border-radius: 0;
    }
    .fr-panel::before { display: none; }
    .fr-panel-head { padding: 0; }
  }
  @media (max-width: 480px) {
    .fr-wrap { padding: 28px 4% 60px; }
  }
  @media (max-width: 480px) {
    .fr-wrap { padding: 28px 4% 60px; }
  }
`;