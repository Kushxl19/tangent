// src/pages/Chat.jsx

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import logo from "../assets/tg-logo.png";
import logoSmall from "../assets/LOGO.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { connectSocket, disconnectSocket } from "../socket";
import ReactDOM from "react-dom";
import MessageBubble from "../components/MessageBubble";
import ChatThemeSettingsModal from "../components/ChatThemeSettingsModal";
import { useAppContext } from "../App";


const API = import.meta.env.VITE_API_URL;
/* ════════════════════════════════════════════════════════════════
   PRESET AVATARS MAP
════════════════════════════════════════════════════════════════ */
const PRESET_AVATARS_MAP = {
  "cosmic-cat": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#1a0533"/>
    <ellipse cx="50" cy="62" rx="22" ry="18" fill="#7c5cfc"/>
    <circle cx="50" cy="42" r="16" fill="#c084fc"/>
    <ellipse cx="38" cy="30" rx="7" ry="10" fill="#c084fc" transform="rotate(-15 38 30)"/>
    <ellipse cx="62" cy="30" rx="7" ry="10" fill="#c084fc" transform="rotate(15 62 30)"/>
    <ellipse cx="38" cy="30" rx="4" ry="6" fill="#7c5cfc" transform="rotate(-15 38 30)"/>
    <ellipse cx="62" cy="30" rx="4" ry="6" fill="#7c5cfc" transform="rotate(15 62 30)"/>
    <circle cx="43" cy="42" r="3.5" fill="#1a0533"/><circle cx="57" cy="42" r="3.5" fill="#1a0533"/>
    <circle cx="44" cy="41" r="1.2" fill="#a78bfa"/><circle cx="58" cy="41" r="1.2" fill="#a78bfa"/>
    <ellipse cx="50" cy="48" rx="3" ry="2" fill="#e879f9"/>
    <line x1="34" y1="46" x2="24" y2="43" stroke="#a78bfa" stroke-width="1.2"/>
    <line x1="34" y1="48" x2="23" y2="48" stroke="#a78bfa" stroke-width="1.2"/>
    <line x1="34" y1="50" x2="24" y2="53" stroke="#a78bfa" stroke-width="1.2"/>
    <line x1="66" y1="46" x2="76" y2="43" stroke="#a78bfa" stroke-width="1.2"/>
    <line x1="66" y1="48" x2="77" y2="48" stroke="#a78bfa" stroke-width="1.2"/>
    <line x1="66" y1="50" x2="76" y2="53" stroke="#a78bfa" stroke-width="1.2"/>
    <circle cx="30" cy="58" r="3" fill="#38bdf8" opacity="0.7"/>
    <circle cx="72" cy="55" r="2" fill="#38bdf8" opacity="0.5"/>
  </svg>`,
  "nebula-fox": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0a1628"/>
    <ellipse cx="50" cy="65" rx="20" ry="15" fill="#f59e0b"/>
    <circle cx="50" cy="44" r="18" fill="#fb923c"/>
    <polygon points="34,30 26,12 42,24" fill="#fb923c"/>
    <polygon points="66,30 74,12 58,24" fill="#fb923c"/>
    <polygon points="34,30 26,12 42,24" fill="#fef3c7" opacity="0.5"/>
    <polygon points="66,30 74,12 58,24" fill="#fef3c7" opacity="0.5"/>
    <ellipse cx="50" cy="44" rx="10" ry="12" fill="#fef3c7"/>
    <circle cx="43" cy="41" r="4" fill="#1a0533"/><circle cx="57" cy="41" r="4" fill="#1a0533"/>
    <circle cx="44" cy="40" r="1.5" fill="#38bdf8"/><circle cx="58" cy="40" r="1.5" fill="#38bdf8"/>
    <ellipse cx="50" cy="49" rx="2.5" ry="1.8" fill="#f43f5e"/>
    <path d="M44 52 Q50 56 56 52" stroke="#1a0533" stroke-width="1.2" fill="none"/>
  </svg>`,
  "void-robot": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#07071a"/>
    <rect x="28" y="30" width="44" height="40" rx="8" fill="#1e1b4b"/>
    <rect x="28" y="30" width="44" height="40" rx="8" fill="none" stroke="#7c5cfc" stroke-width="1.5"/>
    <rect x="34" y="36" width="14" height="10" rx="3" fill="#0d0d1a"/>
    <rect x="52" y="36" width="14" height="10" rx="3" fill="#0d0d1a"/>
    <circle cx="41" cy="41" r="3.5" fill="#38bdf8"/><circle cx="59" cy="41" r="3.5" fill="#38bdf8"/>
    <circle cx="41" cy="41" r="1.5" fill="white"/><circle cx="59" cy="41" r="1.5" fill="white"/>
    <rect x="38" y="53" width="24" height="4" rx="2" fill="#7c5cfc" opacity="0.6"/>
    <rect x="38" y="53" width="10" height="4" rx="2" fill="#7c5cfc"/>
    <rect x="44" y="25" width="12" height="7" rx="3" fill="#1e1b4b" stroke="#7c5cfc" stroke-width="1"/>
    <line x1="50" y1="25" x2="50" y2="22" stroke="#7c5cfc" stroke-width="1.5"/>
    <circle cx="50" cy="21" r="2" fill="#e879f9"/>
    <rect x="22" y="37" width="6" height="18" rx="3" fill="#1e1b4b" stroke="#7c5cfc" stroke-width="1"/>
    <rect x="72" y="37" width="6" height="18" rx="3" fill="#1e1b4b" stroke="#7c5cfc" stroke-width="1"/>
  </svg>`,
  "star-panda": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0f172a"/>
    <circle cx="50" cy="50" r="24" fill="white"/>
    <circle cx="36" cy="33" r="10" fill="#1e293b"/><circle cx="64" cy="33" r="10" fill="#1e293b"/>
    <circle cx="36" cy="33" r="6" fill="white"/><circle cx="64" cy="33" r="6" fill="white"/>
    <ellipse cx="42" cy="46" rx="6" ry="7" fill="#1e293b"/><ellipse cx="58" cy="46" rx="6" ry="7" fill="#1e293b"/>
    <circle cx="42" cy="46" r="3" fill="#c084fc"/><circle cx="58" cy="46" r="3" fill="#c084fc"/>
    <circle cx="42" cy="46" r="1.2" fill="white"/><circle cx="58" cy="46" r="1.2" fill="white"/>
    <ellipse cx="50" cy="55" rx="4" ry="3" fill="#fda4af"/>
    <path d="M44 58 Q50 63 56 58" stroke="#1e293b" stroke-width="1.5" fill="none"/>
    <polygon points="50,15 52,21 58,21 53,25 55,31 50,27 45,31 47,25 42,21 48,21" fill="#fbbf24" opacity="0.8"/>
  </svg>`,
  "glitch-bear": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0c0a1e"/>
    <circle cx="50" cy="52" r="22" fill="#7c3aed"/>
    <circle cx="34" cy="34" r="10" fill="#7c3aed"/><circle cx="66" cy="34" r="10" fill="#7c3aed"/>
    <circle cx="34" cy="34" r="6" fill="#a78bfa"/><circle cx="66" cy="34" r="6" fill="#a78bfa"/>
    <rect x="40" y="43" width="8" height="9" rx="1" fill="#0c0a1e"/>
    <rect x="52" y="43" width="8" height="9" rx="1" fill="#0c0a1e"/>
    <rect x="40" y="43" width="8" height="4" rx="1" fill="#22d3ee"/>
    <rect x="52" y="43" width="8" height="4" rx="1" fill="#f43f5e"/>
    <ellipse cx="50" cy="56" rx="3" ry="2" fill="#c4b5fd"/>
    <rect x="36" y="58" width="6" height="2" fill="#22d3ee" opacity="0.7"/>
    <rect x="40" y="61" width="20" height="2" fill="#f43f5e" opacity="0.5"/>
  </svg>`,
  "pixel-alien": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#042f2e"/>
    <ellipse cx="50" cy="52" rx="20" ry="24" fill="#10b981"/>
    <ellipse cx="50" cy="34" rx="16" ry="20" fill="#34d399"/>
    <ellipse cx="38" cy="30" rx="7" ry="10" fill="#34d399" transform="rotate(-20 38 30)"/>
    <ellipse cx="62" cy="30" rx="7" ry="10" fill="#34d399" transform="rotate(20 62 30)"/>
    <ellipse cx="42" cy="38" rx="5" ry="7" fill="#0d0d1a"/><ellipse cx="58" cy="38" rx="5" ry="7" fill="#0d0d1a"/>
    <ellipse cx="42" cy="38" rx="3" ry="5" fill="#a7f3d0"/><ellipse cx="58" cy="38" rx="3" ry="5" fill="#a7f3d0"/>
    <circle cx="42" cy="38" r="1.5" fill="#0d0d1a"/><circle cx="58" cy="38" r="1.5" fill="#0d0d1a"/>
    <path d="M44 50 Q50 54 56 50" stroke="#0d0d1a" stroke-width="1.5" fill="none"/>
  </svg>`,
  "neon-wolf": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0a0a1a"/>
    <polygon points="50,20 28,50 72,50" fill="#374151"/>
    <circle cx="50" cy="54" r="22" fill="#374151"/>
    <polygon points="36,32 28,14 44,28" fill="#374151"/><polygon points="64,32 72,14 56,28" fill="#374151"/>
    <ellipse cx="50" cy="52" rx="12" ry="10" fill="#4b5563"/>
    <ellipse cx="42" cy="48" rx="5" ry="6" fill="#111827"/><ellipse cx="58" cy="48" rx="5" ry="6" fill="#111827"/>
    <ellipse cx="42" cy="48" rx="3" ry="4" fill="#f97316"/><ellipse cx="58" cy="48" rx="3" ry="4" fill="#f97316"/>
    <circle cx="42" cy="48" r="1.5" fill="#0a0a1a"/><circle cx="58" cy="48" r="1.5" fill="#0a0a1a"/>
    <ellipse cx="50" cy="57" rx="3" ry="2" fill="#9ca3af"/>
  </svg>`,
  "cyber-bunny": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0d0d2b"/>
    <ellipse cx="38" cy="28" rx="7" ry="18" fill="#e0e7ff" transform="rotate(-10 38 28)"/>
    <ellipse cx="62" cy="28" rx="7" ry="18" fill="#e0e7ff" transform="rotate(10 62 28)"/>
    <ellipse cx="38" cy="28" rx="4" ry="13" fill="#f9a8d4" transform="rotate(-10 38 28)"/>
    <ellipse cx="62" cy="28" rx="4" ry="13" fill="#f9a8d4" transform="rotate(10 62 28)"/>
    <circle cx="50" cy="54" r="20" fill="#e0e7ff"/>
    <ellipse cx="42" cy="50" rx="4.5" ry="5.5" fill="#1e1b4b"/><ellipse cx="58" cy="50" rx="4.5" ry="5.5" fill="#1e1b4b"/>
    <ellipse cx="42" cy="50" rx="2.5" ry="3.5" fill="#818cf8"/><ellipse cx="58" cy="50" rx="2.5" ry="3.5" fill="#818cf8"/>
    <ellipse cx="50" cy="58" rx="3" ry="2" fill="#f9a8d4"/>
    <path d="M44 61 Q50 65 56 61" stroke="#94a3b8" stroke-width="1.3" fill="none"/>
  </svg>`,
  "plasma-dragon": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#1a0010"/>
    <ellipse cx="50" cy="55" rx="20" ry="18" fill="#991b1b"/>
    <circle cx="50" cy="42" r="17" fill="#dc2626"/>
    <polygon points="40,26 34,12 46,22" fill="#dc2626"/><polygon points="60,26 66,12 54,22" fill="#dc2626"/>
    <polygon points="40,26 34,12 46,22" fill="#fca5a5" opacity="0.4"/><polygon points="60,26 66,12 54,22" fill="#fca5a5" opacity="0.4"/>
    <ellipse cx="42" cy="42" rx="5" ry="6" fill="#1a0010"/><ellipse cx="58" cy="42" rx="5" ry="6" fill="#1a0010"/>
    <ellipse cx="42" cy="42" rx="3" ry="4" fill="#fbbf24"/><ellipse cx="58" cy="42" rx="3" ry="4" fill="#fbbf24"/>
    <path d="M43 52 L50 48 L57 52" stroke="#fca5a5" stroke-width="1.2" fill="none"/>
    <path d="M46 56 Q50 60 54 56" stroke="#1a0010" stroke-width="1.3" fill="none"/>
  </svg>`,
  "holo-owl": `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0a1628"/>
    <ellipse cx="50" cy="56" rx="22" ry="20" fill="#1e3a5f"/>
    <circle cx="50" cy="42" r="18" fill="#2563eb"/>
    <ellipse cx="36" cy="30" rx="8" ry="12" fill="#2563eb" transform="rotate(-5 36 30)"/>
    <ellipse cx="64" cy="30" rx="8" ry="12" fill="#2563eb" transform="rotate(5 64 30)"/>
    <circle cx="42" cy="42" r="7" fill="#0a1628"/><circle cx="58" cy="42" r="7" fill="#0a1628"/>
    <circle cx="42" cy="42" r="5" fill="#67e8f9"/><circle cx="58" cy="42" r="5" fill="#67e8f9"/>
    <circle cx="42" cy="42" r="2.5" fill="#0a1628"/><circle cx="58" cy="42" r="2.5" fill="#0a1628"/>
    <circle cx="43" cy="41" r="1" fill="#e0f2fe"/><circle cx="59" cy="41" r="1" fill="#e0f2fe"/>
    <polygon points="47,50 50,54 53,50" fill="#fbbf24"/>
  </svg>`,
};

/* ─── EMOJI LIST ─── */
const EMOJI_LIST = [
  "😀", "😂", "🥰", "😎", "🤔", "😭", "🥹", "😤",
  "👍", "❤️", "🔥", "💯", "🎉", "✅", "⭐", "🫶",
  "😊", "🤣", "😍", "🤩", "😏", "😢", "😡", "🤯",
  "👋", "🙏", "💪", "✌️", "🤝", "👏", "🫠", "😅",
  "🍕", "🎮", "💻", "🚀", "🌟", "💫", "⚡", "🎯",
];

/* ─────────────────────────── STYLES ─────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:#07071a; --bg2:#0d0d28; --bg3:#111132;
  --p1:#7c5cfc; --p2:#38bdf8; --p3:#c084fc;
  --text:#eeeeff; --muted:rgba(180,170,240,0.55);
  --card:rgba(255,255,255,0.035); --border:rgba(255,255,255,0.07);
  --font:'Plus Jakarta Sans',sans-serif;
}
body, #root { height:100vh; overflow:hidden; }
.tg-app { font-family:var(--font); background:var(--bg); color:var(--text); height:100vh; display:flex; overflow:hidden; position:relative; }

/* BG */
.tg-bg { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
.tg-bg-base { position:absolute; inset:0; background: radial-gradient(ellipse 60% 50% at 20% 20%,rgba(124,92,252,0.15) 0%,transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%,rgba(56,189,248,0.08) 0%,transparent 55%), #07071a; }
.tg-bg-grid { position:absolute; inset:0; opacity:.18; background-image:radial-gradient(circle,rgba(140,120,255,0.4) 1px,transparent 1px); background-size:40px 40px; mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%); }

/* ══ SIDEBAR ══ */
.tg-sidebar {
  width:300px; min-width:300px; height:100vh;
  display:flex; flex-direction:column;
  background:rgba(10,10,30,0.92);
  border-right:1px solid var(--border);
  backdrop-filter:blur(24px);
  position:relative; z-index:10;
  overflow:visible;
  transition: transform .3s cubic-bezier(.4,0,.2,1);
  flex-shrink: 0;
}

/* Logo area — fixed 68px to align with chat header */
.tg-logo-area {
  height: 68px;
  padding: 0 16px;
  border-bottom:1px solid var(--border);
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.logo-container { display:flex; align-items:center; gap:5px; cursor:pointer; background:none; border:none; }
.tg-logo-icon { border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
.tg-logo-full { width:160px; display:block; }
.tg-logo-small { width:38px; height:38px; object-fit:contain; display:none; border-radius:10px; }

/* Bell button */
.tg-bell-wrap { position:relative; flex-shrink:0; }
.tg-bell-btn {
  width:34px; height:34px; border-radius:10px;
  background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.08);
  color:var(--muted);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .18s; position:relative;
}
.tg-bell-btn:hover { background:rgba(124,92,252,0.12); border-color:rgba(124,92,252,0.28); color:#c4b5fd; }
.tg-bell-btn.active { background:rgba(124,92,252,0.15); border-color:rgba(124,92,252,0.35); color:#c4b5fd; }
.tg-bell-badge {
  position:absolute; top:-4px; right:-4px;
  width:16px; height:16px; border-radius:50%;
  background:linear-gradient(135deg,#7c5cfc,#5b3ed4);
  border:2px solid rgba(10,10,30,0.92);
  font-size:.55rem; font-weight:800; color:white;
  display:flex; align-items:center; justify-content:center;
}

/* Notification dropdown */
.tg-notif-dropdown {
  position:absolute; top:calc(100% + 10px); right:0;
  width:290px;
  background:rgba(12,12,34,0.98);
  border:1px solid rgba(255,255,255,0.09); border-radius:16px;
  backdrop-filter:blur(28px) saturate(1.6);
  box-shadow:0 0 0 1px rgba(124,92,252,0.08),0 8px 32px rgba(0,0,0,0.65);
  z-index:1060; overflow:hidden;
  animation:pmFadeIn .2s cubic-bezier(.34,1.3,.64,1) forwards;
}
.tg-notif-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px 10px;
  border-bottom:1px solid rgba(255,255,255,0.07);
}
.tg-notif-title { font-size:.82rem; font-weight:800; color:var(--text); }
.tg-notif-clear { font-size:.65rem; font-weight:700; color:rgba(124,92,252,0.7); cursor:pointer; background:none; border:none; font-family:var(--font); transition:color .15s; }
.tg-notif-clear:hover { color:#c4b5fd; }
.tg-notif-list { max-height:300px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:rgba(124,92,252,0.2) transparent; }
.tg-notif-item {
  display:flex; align-items:center; gap:10px;
  padding:11px 14px;
  border-bottom:1px solid rgba(255,255,255,0.04);
  transition:background .15s;
}
.tg-notif-item:last-child { border-bottom:none; }
.tg-notif-item:hover { background:rgba(255,255,255,0.03); }
.tg-notif-body { flex:1; min-width:0; }
.tg-notif-name { font-size:.8rem; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tg-notif-sub { font-size:.67rem; color:var(--muted); margin-top:1px; }
.tg-notif-actions { display:flex; gap:5px; flex-shrink:0; }
.tg-notif-accept { padding:4px 10px; border-radius:7px; background:linear-gradient(135deg,#7c5cfc,#5b3ed4); border:none; color:white; font-size:.67rem; font-weight:700; cursor:pointer; font-family:var(--font); }
.tg-notif-empty { padding:28px 16px; text-align:center; }
.tg-notif-empty-icon { font-size:2rem; opacity:.3; margin-bottom:8px; }
.tg-notif-empty-txt { font-size:.78rem; color:var(--muted); }

/* ══ TAB BAR ══ */
.tg-tab-bar {
  display:flex; gap:4px;
  padding:10px 10px;
  border-bottom:1px solid var(--border);
  flex-shrink:0;
  background:rgba(0,0,0,0.22);
}
.tg-tab-item {
  flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
  padding:9px 10px; border-radius:10px;
  border:1px solid transparent;
  cursor:pointer; font-size:.82rem; font-weight:700;
  color:var(--muted); transition:all .18s;
  background:transparent; font-family:var(--font);
  user-select:none;
}
.tg-tab-item:hover { background:rgba(255,255,255,0.05); color:var(--text); }
.tg-tab-item.active {
  background:rgba(124,92,252,0.16);
  border-color:rgba(124,92,252,0.3);
  color:#c4b5fd;
  box-shadow: inset 0 0 0 1px rgba(124,92,252,0.1), 0 0 16px rgba(124,92,252,0.1);
}
  /* ══ BOTTOM SHEET PROFILE MENU ══ */
.tg-sheet-backdrop {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  animation: sheetBdFade .22s ease forwards;
}
@keyframes sheetBdFade { from{opacity:0} to{opacity:1} }
.tg-sheet-backdrop.closing { animation: sheetBdFadeOut .22s ease forwards; }
@keyframes sheetBdFadeOut { from{opacity:1} to{opacity:0} }

.tg-sheet {
  position: fixed; left: 0; right: 0; bottom: 0;
  z-index: 2001;
  background: rgba(11,11,32,0.98);
  border-top: 1px solid rgba(255,255,255,0.09);
  border-radius: 24px 24px 0 0;
  padding: 0 0 env(safe-area-inset-bottom,0);
  box-shadow: 0 -8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,92,252,0.08);
  animation: sheetSlideUp .28s cubic-bezier(.34,1.3,.64,1) forwards;
  max-width: 520px; margin: 0 auto;
}
@keyframes sheetSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
.tg-sheet.closing { animation: sheetSlideDown .22s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes sheetSlideDown { from{transform:translateY(0);opacity:1} to{transform:translateY(100%);opacity:0} }

.tg-sheet-handle-row {
  display: flex; justify-content: center;
  padding: 12px 0 4px;
}
.tg-sheet-handle {
  width: 40px; height: 4px; border-radius: 99px;
  background: rgba(255,255,255,0.15);
}
.tg-sheet-user {
  display: flex; align-items: center; gap: 13px;
  padding: 14px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(124,92,252,0.04);
}
.tg-sheet-user-info { flex: 1; min-width: 0; }
.tg-sheet-user-name { font-size: .97rem; font-weight: 800; color: #fff; letter-spacing: -.02em; }
.tg-sheet-user-email { font-size: .7rem; color: var(--muted); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tg-sheet-badge {
  font-size: .58rem; font-weight: 800; letter-spacing: .05em;
  text-transform: uppercase; padding: 4px 10px; border-radius: 20px;
  background: rgba(124,92,252,0.18); border: 1px solid rgba(124,92,252,0.3);
  color: #c4b5fd; white-space: nowrap; flex-shrink: 0;
}
.tg-sheet-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }

.tg-sheet-item {
  display: flex; align-items: center; gap: 13px;
  width: 100%; padding: 13px 12px; border-radius: 14px;
  border: 1px solid transparent;
  background: transparent; color: rgba(220,210,255,0.8);
  font-family: var(--font); font-size: .88rem; font-weight: 600;
  cursor: pointer; text-align: left;
  transition: background .15s, border-color .15s, transform .12s, color .15s;
  letter-spacing: -.01em;
}
.tg-sheet-item:hover, .tg-sheet-item:active {
  background: rgba(255,255,255,0.055);
  border-color: rgba(255,255,255,0.07);
  color: #fff; transform: translateX(2px);
}
.tg-sheet-item-icon {
  width: 38px; height: 38px; border-radius: 11px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background .15s, border-color .15s;
  color: rgba(180,170,240,0.65);
}
.tg-sheet-item:hover .tg-sheet-item-icon {
  background: rgba(124,92,252,0.15);
  border-color: rgba(124,92,252,0.3);
  color: #c4b5fd;
}
.tg-sheet-item-label { flex: 1; }
.tg-sheet-item-arrow { color: var(--muted); opacity: 0.4; transition: opacity .15s, transform .15s; }
.tg-sheet-item:hover .tg-sheet-item-arrow { opacity: 0.8; transform: translateX(3px); }

.tg-sheet-upgrade {
  display: flex; align-items: center; gap: 13px;
  width: 100%; padding: 13px 12px; border-radius: 14px;
  border: 1px solid rgba(124,92,252,0.28);
  background: linear-gradient(135deg,rgba(124,92,252,0.13),rgba(192,132,252,0.07));
  color: #d8b4fe; font-family: var(--font); font-size: .88rem;
  font-weight: 700; cursor: pointer; text-align: left;
  transition: all .18s;
}
.tg-sheet-upgrade:hover {
  border-color: rgba(124,92,252,0.5);
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(124,92,252,0.2);
}
.tg-sheet-upgrade-icon {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg,#7c5cfc,#c084fc);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 2px 10px rgba(124,92,252,0.4);
}
.tg-sheet-upgrade-text { flex: 1; }
.tg-sheet-upgrade-title { font-size: .88rem; font-weight: 700; line-height: 1.2; }
.tg-sheet-upgrade-sub { font-size: .67rem; font-weight: 500; color: rgba(216,180,254,0.5); margin-top: 2px; }
.tg-sheet-upgrade-chip {
  font-size: .58rem; font-weight: 800; letter-spacing: .06em;
  text-transform: uppercase; padding: 3px 9px; border-radius: 20px;
  background: linear-gradient(135deg,#7c5cfc,#c084fc); color: white;
}
.tg-sheet-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
.tg-sheet-item.danger { color: rgba(248,113,113,0.7); }
.tg-sheet-item.danger:hover { background: rgba(239,68,68,0.09); border-color: rgba(239,68,68,0.18); color: #f87171; }
.tg-sheet-item.danger .tg-sheet-item-icon { color: rgba(248,113,113,0.55); }
.tg-sheet-item.danger:hover .tg-sheet-item-icon { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #f87171; }
.tg-sheet-bottom-pad { height: 16px; }

/* ══ SIDEBAR BODY ══ */
.tg-sidebar-body {
  flex:1; overflow-y:auto; display:flex; flex-direction:column;
  scrollbar-width:thin; scrollbar-color:rgba(124,92,252,0.3) transparent;
  min-height:0;
}
.tg-sidebar-body::-webkit-scrollbar { width:4px; }
.tg-sidebar-body::-webkit-scrollbar-thumb { background:rgba(124,92,252,0.3); border-radius:10px; }

/* Search */
.tg-search {
  display:flex; align-items:center; gap:9px;
  background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.09);
  border-radius:12px; padding:10px 13px;
  margin:13px 10px 13px; transition:all .2s;
}
.tg-search:focus-within { border-color:rgba(124,92,252,0.4); background:rgba(124,92,252,0.07); box-shadow:0 0 0 3px rgba(124,92,252,0.1); }
.tg-search svg { flex-shrink:0; opacity:.45; }
.tg-search input { background:none; border:none; outline:none; color:var(--text); font-family:var(--font); font-size:.82rem; width:100%; }
.tg-search input::placeholder { color:var(--muted); }

/* Section label with lines on both sides */
.tg-sec-label {
  display:flex; align-items:center; gap:8px;
  padding:10px 16px 8px;
  font-size:.62rem; font-weight:800; color:rgba(180,170,240,0.32);
  text-transform:uppercase; letter-spacing:.09em; flex-shrink:0;
}
.tg-sec-label::before, .tg-sec-label::after {
  content:''; flex:1; height:1px;
  background:rgba(255,255,255,0.07);
}

/* Friends list */
.tg-friends { flex:1; padding:4px 8px 8px; }

/* Skeleton */
.tg-friend-skeleton { display:flex; align-items:center; gap:11px; padding:9px 10px; border-radius:13px; margin-bottom:4px; }
.tg-skel { background:rgba(255,255,255,0.06); border-radius:8px; animation:skelPulse 1.4s ease-in-out infinite; }
.tg-skel-circle { width:40px; height:40px; border-radius:50%; flex-shrink:0; }
.tg-skel-line { height:10px; }
@keyframes skelPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

/* Friend item */
.tg-friend-item { display:flex; align-items:center; gap:11px; padding:9px 10px; border-radius:13px; cursor:pointer; transition:all .18s; position:relative; margin-bottom:2px; }
.tg-friend-item:hover { background:rgba(255,255,255,0.05); }
.tg-friend-item.active { background:rgba(124,92,252,0.14); border:1px solid rgba(124,92,252,0.22); }

/* Avatar */
.tg-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:800; color:white; flex-shrink:0; position:relative; overflow:hidden; }
.tg-avatar img { width:100%; height:100%; object-fit:cover; }
.tg-avatar-sm { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.62rem; font-weight:800; color:white; flex-shrink:0; position:relative; overflow:hidden; }
.tg-avatar-sm img { width:100%; height:100%; object-fit:cover; }

/* Friend info */
.tg-friend-info { flex:1; min-width:0; }
.tg-friend-name { font-size:.82rem; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tg-friend-preview { font-size:.7rem; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
.tg-friend-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
.tg-friend-time { font-size:.63rem; color:rgba(180,170,240,0.38); }
.tg-unread { background:linear-gradient(135deg,#7c5cfc,#5b3ed4); color:white; font-size:.6rem; font-weight:800; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; }

/* ══ PROFILE PANEL ══ */
.tg-profile {
  padding:10px 14px;
  border-top:1px solid var(--border);
  display:flex; align-items:center; gap:11px;
  background:rgba(0,0,0,0.22);
  flex-shrink:0;
  cursor:pointer; transition:background .18s;
  position:relative; z-index:20;
  user-select:none;
}
.tg-profile:hover { background:rgba(124,92,252,0.08); }
.tg-profile.menu-open { cursor:default; background:rgba(124,92,252,0.06); }
.tg-profile-info { flex:1; min-width:0; }
.tg-profile-name { font-size:.83rem; font-weight:800; color:var(--text); }
.tg-profile-email { font-size:.67rem; color:var(--muted); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
.tg-profile-chevron { color:var(--muted); transition:transform .25s cubic-bezier(.34,1.3,.64,1),opacity .18s; opacity:.5; display:flex; align-items:center; }
.tg-profile.menu-open .tg-profile-chevron { transform:rotate(180deg); opacity:.8; }

/* Backdrop & dropdown */
.tg-menu-backdrop { position:fixed; inset:0; z-index:1040; background:transparent; }
.tg-profile-menu {
  position:absolute; bottom:calc(100% + 8px); left:0; width:284px;
  background:rgba(12,12,34,0.97);
  border:1px solid rgba(255,255,255,0.09); border-radius:16px;
  backdrop-filter:blur(28px) saturate(1.6);
  box-shadow:0 0 0 1px rgba(124,92,252,0.08),0 8px 32px rgba(0,0,0,0.65),0 2px 8px rgba(0,0,0,0.45);
  z-index:1050; overflow:hidden;
  transform-origin:bottom left;
  animation:pmFadeIn .22s cubic-bezier(.34,1.3,.64,1) forwards;
}
@keyframes pmFadeIn { from{opacity:0;transform:scale(0.93) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
.tg-pm-header { display:flex; align-items:center; gap:11px; padding:14px 14px 12px; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(124,92,252,0.04); }
.tg-pm-avatar { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,#7c5cfc,#c084fc); display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:900; color:white; flex-shrink:0; position:relative; box-shadow:0 2px 10px rgba(124,92,252,0.4); overflow:hidden; }
.tg-pm-avatar img { width:100%; height:100%; object-fit:cover; }
.tg-pm-user { flex:1; min-width:0; }
.tg-pm-name { font-size:.87rem; font-weight:800; color:#fff; letter-spacing:-.01em; }
.tg-pm-email { font-size:.67rem; color:var(--muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tg-pm-badge { font-size:.58rem; font-weight:800; letter-spacing:.05em; text-transform:uppercase; padding:3px 8px; border-radius:20px; background:rgba(124,92,252,0.18); border:1px solid rgba(124,92,252,0.28); color:#c4b5fd; white-space:nowrap; }
.tg-pm-body { padding:6px; }
.tg-pm-item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border-radius:10px; border:none; background:transparent; color:rgba(220,210,255,0.75); font-family:var(--font); font-size:.83rem; font-weight:600; cursor:pointer; text-align:left; transition:background .15s,color .15s,transform .12s; letter-spacing:-.005em; }
.tg-pm-item:hover { background:rgba(255,255,255,0.055); color:#fff; transform:translateX(1px); }
.tg-pm-item-icon { width:30px; height:30px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .15s,border-color .15s; color:rgba(200,190,255,0.6); }
.tg-pm-item:hover .tg-pm-item-icon { background:rgba(124,92,252,0.15); border-color:rgba(124,92,252,0.28); color:#c4b5fd; }
.tg-pm-item-label { flex:1; }
.tg-pm-item-arrow { opacity:0; transform:translateX(-4px); transition:opacity .15s,transform .15s; color:var(--muted); }
.tg-pm-item:hover .tg-pm-item-arrow { opacity:1; transform:translateX(0); }
.tg-pm-upgrade { display:flex; align-items:center; gap:10px; width:100%; padding:10px; border-radius:10px; border:1px solid rgba(124,92,252,0.28); background:linear-gradient(135deg,rgba(124,92,252,0.14),rgba(192,132,252,0.08)); color:#d8b4fe; font-family:var(--font); font-size:.83rem; font-weight:700; cursor:pointer; text-align:left; transition:all .18s; position:relative; overflow:hidden; letter-spacing:-.005em; margin:2px 0; }
.tg-pm-upgrade:hover { border-color:rgba(124,92,252,0.5); transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,92,252,0.2); color:#ede9fe; }
.tg-pm-upgrade-icon { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#7c5cfc,#c084fc); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 8px rgba(124,92,252,0.4); }
.tg-pm-upgrade-text { flex:1; }
.tg-pm-upgrade-title { font-size:.83rem; font-weight:700; line-height:1.2; }
.tg-pm-upgrade-sub { font-size:.63rem; font-weight:500; color:rgba(216,180,254,0.55); margin-top:1px; }
.tg-pm-upgrade-chip { font-size:.55rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; padding:2px 7px; border-radius:20px; background:linear-gradient(135deg,#7c5cfc,#c084fc); color:white; }
.tg-pm-divider { height:1px; background:rgba(255,255,255,0.06); margin:4px 0; }
.tg-pm-item.danger { color:rgba(248,113,113,0.65); }
.tg-pm-item.danger:hover { background:rgba(239,68,68,0.08); color:#f87171; }
.tg-pm-item.danger .tg-pm-item-icon { color:rgba(248,113,113,0.5); }
.tg-pm-item.danger:hover .tg-pm-item-icon { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.25); color:#f87171; }

/* ══ EMPTY STATES ══ */
.tg-empty-chat { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; }
.tg-empty-icon { font-size:3rem; opacity:.4; }
.tg-empty-title { font-size:1.1rem; font-weight:800; color:var(--text); opacity:.5; }
.tg-empty-sub { font-size:.8rem; color:var(--muted); text-align:center; max-width:260px; line-height:1.6; }
.tg-add-friends-btn {
  margin-top:8px; padding:11px 24px; border-radius:12px;
  background:linear-gradient(135deg,#7c5cfc,#5b3ed4);
  border:none; color:white; font-family:var(--font);
  font-size:.85rem; font-weight:700; cursor:pointer;
  box-shadow:0 4px 18px rgba(124,92,252,0.4); transition:all .2s;
}
.tg-add-friends-btn:hover { transform:translateY(-2px); box-shadow:0 8px 26px rgba(124,92,252,0.5); }

/* ══ MAIN ══ */
.tg-main { flex:1; display:flex; flex-direction:column; height:100vh; position:relative; z-index:5; overflow:hidden; transition:transform .3s cubic-bezier(.4,0,.2,1); }

/* Chat header — 68px aligned with logo area */
.tg-chat-header { padding:0 20px; height:68px; display:flex; align-items:center; gap:12px; background:rgba(10,10,30,0.85); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); flex-shrink:0; }
.tg-chat-info { flex:1; min-width:0; }
.tg-chat-name { font-size:.95rem; font-weight:800; color:var(--text); }
.tg-chat-sub { font-size:.72rem; color:var(--muted); margin-top:2px; }
.tg-chat-actions { display:flex; align-items:center; gap:6px; }
.tg-action-btn { width:38px; height:38px; border-radius:12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
.tg-action-btn:hover { background:rgba(124,92,252,0.15); border-color:rgba(124,92,252,0.35); color:white; transform:translateY(-1px); }
.tg-action-btn.call:hover  { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.35); color:#4ade80; }
.tg-action-btn.video:hover { background:rgba(56,189,248,0.15); border-color:rgba(56,189,248,0.35); color:#38bdf8; }

/* Mobile back button — hidden on desktop */
.tg-back-btn {
  display:none;
  width:36px; height:36px; border-radius:10px;
  background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.07);
  color:var(--muted); cursor:pointer;
  align-items:center; justify-content:center;
  flex-shrink:0; transition:all .18s;
}
.tg-back-btn:hover { background:rgba(124,92,252,0.12); border-color:rgba(124,92,252,0.28); color:#c4b5fd; }

/* Messages */
.tg-messages { flex:1; overflow-y:auto; padding:24px 24px 12px; display:flex; flex-direction:column; gap:16px; scrollbar-width:thin; scrollbar-color:rgba(124,92,252,0.25) transparent; }
.tg-messages::-webkit-scrollbar { width:5px; }
.tg-messages::-webkit-scrollbar-thumb { background:rgba(124,92,252,0.25); border-radius:10px; }
.tg-msg-loading { flex:1; display:flex; align-items:center; justify-content:center; gap:10px; color:var(--muted); font-size:.82rem; }
.tg-spinner { width:20px; height:20px; border-radius:50%; border:2px solid rgba(124,92,252,0.2); border-top-color:#7c5cfc; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.tg-date-div { display:flex; align-items:center; gap:12px; font-size:.68rem; color:var(--muted); font-weight:700; }
.tg-date-div::before, .tg-date-div::after { content:''; flex:1; height:1px; background:var(--border); }

/* Message bubbles */
.tg-msg-row { display:flex; align-items:flex-end; gap:10px; width:100%; }
.tg-msg-row.me { flex-direction:row-reverse; }
.tg-msg-bubble-wrap { max-width:65%; min-width:0; }
.tg-bubble { padding:11px 15px; border-radius:18px; font-size:.875rem; line-height:1.6; word-break:break-word; overflow-wrap:anywhere; white-space:pre-wrap; }
.tg-bubble.them { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.08); color:rgba(240,232,255,0.9); border-bottom-left-radius:5px; }
.tg-bubble.me { background:linear-gradient(135deg,#7c5cfc,#5b3ed4); color:white; border-bottom-right-radius:5px; box-shadow:0 4px 20px rgba(124,92,252,0.35); }
.tg-typing-dots { display:flex; gap:4px; background:rgba(255,255,255,0.07); padding:10px 14px; border-radius:18px; border:1px solid rgba(255,255,255,0.08); }
.tg-typing-dot { width:6px; height:6px; border-radius:50%; background:rgba(180,170,240,0.5); animation:typingPulse 1.2s ease-in-out infinite; }
.tg-typing-dot:nth-child(2) { animation-delay:.2s; }
.tg-typing-dot:nth-child(3) { animation-delay:.4s; }
@keyframes typingPulse { 0%,100%{opacity:0.4;transform:scale(0.85)} 50%{opacity:1;transform:scale(1.1)} }

/* Input */
.tg-input-area { padding:5px 20px 5px; background:rgba(10,10,30,0.75); backdrop-filter:blur(20px); border-top:1px solid var(--border); flex-shrink:0; }
.tg-input-row { display:flex; align-items:flex-end; gap:10px; }
.tg-input-tools { display:flex; gap:4px; flex-shrink:0; }
.tg-tool-btn { width:40px; height:40px; border-radius:11px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.05); color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .18s; }
.tg-tool-btn:hover { background:rgba(124,92,252,0.12); border-color:rgba(124,92,252,0.28); color:#c4b5fd; }
.tg-input-wrap { flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:14px; padding:10px 14px; display:flex; align-items:center; gap:10px; transition:border-color .18s; }
.tg-input-wrap:focus-within { border-color:rgba(124,92,252,0.4); }
.tg-input-wrap textarea { flex:1; background:none; border:none; outline:none; color:var(--text); font-family:var(--font); font-size:.875rem; resize:none; min-height:22px; max-height:120px; }
.tg-emoji-btn-wrap { position:relative; flex-shrink:0; display:flex; align-items:center; }
.tg-emoji-btn { font-size:1.1rem; cursor:pointer; opacity:.6; transition:opacity .15s; }
.tg-emoji-btn:hover { opacity:1; }
/* Emoji picker uses fixed positioning to escape overflow:hidden — see JSX for inline style */
.tg-emoji-picker {
  position:fixed;
  width:256px;
  background:rgba(12,12,34,0.97);
  border:1px solid rgba(255,255,255,0.09);
  border-radius:14px; padding:12px;
  display:grid; grid-template-columns:repeat(8,1fr);
  gap:2px; z-index:9999;
  backdrop-filter:blur(20px);
  box-shadow:0 8px 32px rgba(0,0,0,0.6);
  animation:pmFadeIn .18s cubic-bezier(.34,1.3,.64,1) forwards;
}
.tg-emoji-picker span { font-size:1.15rem; cursor:pointer; padding:5px 3px; border-radius:7px; text-align:center; transition:background .12s; display:block; }
.tg-emoji-picker span:hover { background:rgba(124,92,252,0.2); }
.tg-send-btn { width:44px; height:44px; border-radius:13px; border:none; background:linear-gradient(135deg,#7c5cfc,#5b3ed4); color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 4px 16px rgba(124,92,252,0.4); transition:all .2s; }
.tg-send-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(124,92,252,0.55); }
.tg-send-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

/* Call modal */
.tg-call-overlay { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.65); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; }
.tg-call-card { background:rgba(13,13,40,0.97); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:36px 28px 28px; width:300px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.6); }
.tg-call-avatar { width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.4rem; font-weight:900; color:white; margin:0 auto 16px; box-shadow:0 0 0 8px rgba(124,92,252,0.1); overflow:hidden; }
.tg-call-avatar img { width:100%; height:100%; object-fit:cover; }
.tg-call-name { font-size:1.2rem; font-weight:800; color:var(--text); margin-bottom:6px; }
.tg-call-desc { font-size:.78rem; color:var(--muted); margin-bottom:20px; }
.tg-call-actions { display:flex; gap:14px; justify-content:center; margin-top:8px; }
.tg-call-btn { width:52px; height:52px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
.tg-call-btn.end    { background:#ef4444; }
.tg-call-btn.accept { background:#22c55e; }
.tg-call-btn.mute   { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); }
.tg-call-btn:hover  { transform:scale(1.08); }

.tg-app {
  height: 100dvh; /* mobile fix */
}

.tg-sidebar,
.tg-sidebar-body {
  height: 100%;
}

.tg-main {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tg-chat-messages {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.tg-chat-input {
  flex-shrink: 0;
}

/* ══ FRIENDS INLINE VIEW ══ */
.fi-wrap { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.fi-header {
  height:68px; padding:0 24px;
  background:rgba(10,10,30,0.85); backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border); flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between; gap:12px;
}
.fi-header-left h2 { font-size:1rem; font-weight:900; color:var(--text); letter-spacing:-.03em; }
.fi-header-left p  { font-size:.68rem; color:var(--muted); margin-top:2px; }
.fi-stats { display:flex; gap:8px; flex-shrink:0; }
.fi-stat { display:flex; align-items:center; gap:5px; padding:4px 12px; border-radius:50px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); font-size:.72rem; font-weight:700; color:rgba(180,170,240,0.7); }
.fi-stat-dot { width:6px; height:6px; border-radius:50%; }
.fi-body { flex:1; overflow:hidden; display:flex; gap:0; }
.fi-pane { flex:1; display:flex; flex-direction:column; overflow:hidden; border-right:1px solid var(--border); }
.fi-pane:last-child { border-right:none; }
.fi-pane-head { padding:16px 20px 12px; border-bottom:1px solid var(--border); flex-shrink:0; }
.fi-pane-title { font-size:.85rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px; }
.fi-pane-sub { font-size:.68rem; color:var(--muted); margin-top:3px; }
.fi-search {
  display:flex; align-items:center; gap:8px;
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:10px; padding:9px 12px; margin-top:10px;
  transition:border-color .18s;
}
.fi-search:focus-within { border-color:rgba(124,92,252,0.35); background:rgba(124,92,252,0.04); }
.fi-search input { background:none; border:none; outline:none; color:var(--text); font-family:var(--font); font-size:.82rem; flex:1; }
.fi-search input::placeholder { color:var(--muted); }
.fi-list { flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:8px; scrollbar-width:thin; scrollbar-color:rgba(124,92,252,0.2) transparent; }
.fi-list::-webkit-scrollbar { width:4px; }
.fi-list::-webkit-scrollbar-thumb { background:rgba(124,92,252,0.2); border-radius:4px; }
.fi-friend-card { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); transition:all .2s; animation:fiSlideIn .25s ease both; }
.fi-friend-card:hover { border-color:rgba(124,92,252,0.22); background:rgba(124,92,252,0.04); }
@keyframes fiSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.fi-friend-card-info { flex:1; min-width:0; }
.fi-friend-card-name { font-size:.85rem; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fi-friend-card-sub  { font-size:.7rem; color:var(--muted); margin-top:2px; }
.fi-btn { padding:5px 12px; border-radius:8px; font-family:var(--font); font-size:.72rem; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; flex-shrink:0; }
.fi-btn-remove { background:transparent; border:1px solid rgba(255,255,255,0.1); color:rgba(180,170,240,0.5); }
.fi-btn-remove:hover { border-color:rgba(244,63,94,0.4); color:#fb7185; background:rgba(244,63,94,0.08); }
.fi-btn-add { background:linear-gradient(135deg,#7c5cfc,#5b3ed4); border:none; color:white; padding:6px 14px; box-shadow:0 3px 12px rgba(124,92,252,0.3); }
.fi-btn-add:hover { opacity:.88; transform:translateY(-1px); }
.fi-btn-add:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.fi-btn-pending { background:rgba(124,92,252,0.1); border:1px solid rgba(124,92,252,0.25); color:#c4b5fd; cursor:default; }
.fi-btn-friends { background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.25); color:#4ade80; cursor:default; }
.fi-confirm-row { display:flex; gap:6px; flex-shrink:0; }
.fi-requests-banner { margin:0 0 8px; border-radius:14px; background:rgba(124,92,252,0.06); border:1px solid rgba(124,92,252,0.18); overflow:hidden; }
.fi-requests-banner-head { padding:10px 14px; border-bottom:1px solid rgba(124,92,252,0.12); font-size:.7rem; font-weight:800; color:#c4b5fd; text-transform:uppercase; letter-spacing:.08em; }
.fi-req-card { display:flex; align-items:center; gap:11px; padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.04); animation:fiSlideIn .25s ease both; }
.fi-req-card:last-child { border-bottom:none; }
.fi-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; gap:12px; text-align:center; }
.fi-empty-icon { font-size:2.5rem; opacity:.3; }
.fi-empty-title { font-size:.95rem; font-weight:800; color:var(--text); opacity:.5; }
.fi-empty-sub { font-size:.75rem; color:var(--muted); line-height:1.6; max-width:220px; }
.fi-mob-tabs { display:none; gap:4px; padding:12px 16px; border-bottom:1px solid var(--border); background:rgba(10,10,30,0.85); flex-shrink:0; }
.fi-mob-tab { flex:1; padding:9px; border-radius:10px; border:1px solid transparent; background:transparent; font-family:var(--font); font-size:.8rem; font-weight:700; cursor:pointer; color:var(--muted); transition:all .18s; }
.fi-mob-tab.active { background:rgba(124,92,252,0.15); border-color:rgba(124,92,252,0.28); color:#c4b5fd; }

/* Scrollbar global */
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(124,92,252,0.25); border-radius:10px; }

/* ══ TABLET (641–900px) ══ */
@media (max-width:900px) {
  .tg-sidebar { width:72px; min-width:72px; }
  .tg-logo-full { display:none !important; }
  .tg-logo-small { display:block !important; }
  .tg-bell-btn { display:none; }
  .tg-tab-item span { display:none; }
  .tg-tab-item { padding:10px; }
  .tg-friend-info,.tg-friend-meta,.tg-profile-info { display:none; }
  .tg-friend-item { justify-content:center; padding:11px; }
  .tg-profile { justify-content:center; padding:12px; }
  .tg-chat-header { padding:0 12px; gap:10px; }
  .tg-messages { padding:12px; }
  .tg-msg-bubble-wrap { max-width:85%; }
  .fi-pane:first-child { display:none; }
  .fi-mob-tabs { display:flex; }
  .fi-body { flex-direction:column; }
  .fi-pane { border-right:none; border-bottom:1px solid var(--border); }
}

/* ══ MOBILE (≤640px) — full slide layout ══ */
@media (max-width:640px) {
  .tg-sidebar {
    position:fixed; left:0; top:0; bottom:0;
    width:100vw !important; min-width:100vw !important;
    z-index:100;
    transform:translateX(0);
  }
  .tg-sidebar.mobile-chat-open {
    transform:translateX(-100%);
    pointer-events:none;
  }
  .tg-main {
    position:fixed; left:0; right:0; top:0; bottom:0;
    width:100vw;
    transform:translateX(100%);
    z-index:90;
  }
  .tg-main.mobile-chat-open {
    transform:translateX(0);
  }
  /* Show friend info + meta on mobile since we have full width */
  .tg-friend-info, .tg-friend-meta, .tg-profile-info { display:flex !important; }
  .tg-friend-info { flex-direction:column; }
  .tg-friend-meta { flex-direction:column; }
  .tg-friend-item { justify-content:flex-start !important; padding:9px 10px !important; }
  .tg-profile { justify-content:flex-start !important; padding:12px 14px !important; }
  /* Show back button on mobile */
  .tg-back-btn { display:flex !important; }
  /* Show full sidebar width items */
  .tg-logo-full { display:none !important; }
  .tg-logo-small { display:block !important; }
  .tg-bell-btn { display:flex !important; }
  .tg-tab-item span { display:inline !important; }
  .tg-tab-item { padding:9px 10px !important; }
  /* Friends inline header back button */
  .fi-header-back { display:flex !important; }
  /* Messages padding */
  .tg-messages { padding:12px 12px 8px; }
  .tg-msg-bubble-wrap { max-width:82%; }
  /* Input area compact */
  .tg-input-area { padding:10px 12px 14px; }
  .tg-input-tools { display:none; }
  /* Chat header compact on mobile */
  .tg-chat-header { padding:0 12px; gap:8px; }
  .tg-chat-actions .tg-action-btn:not(.call):not(.video) { display:none; }
}
`;

/* ─── ICONS ─── */
const ChatTabIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const FriendsTabIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const BellIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const PhoneIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const VideoIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>;
const InfoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const PinIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m12 17-1-11h2L12 17zm-5 0 1.6-4H12m5 4-1.6-4H12" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="12" y1="17" x2="12" y2="22" /></svg>;
const AttachIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>;
const ImageIcon2 = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
const SendIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const MicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const MoreIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>;
const EndCallIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 9.91a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L10.68 13.31z" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
const AcceptIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const MuteIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const DblCheckIcon = () => <svg width="14" height="10" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="1 9 5 13 13 5" /><polyline points="9 13 13 9 21 1" style={{ strokeOpacity: 0.5 }} /></svg>;
const ChevronUpIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>;
const ArrowRightIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const BackIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IconProfile = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconHelp = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IconUpgrade = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>;
const IconThreeDot = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>;
const IconLearnMore = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const IconLogout = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const UsersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

/* ─── HELPERS ─── */
const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const GRAD_PALETTE = [
  ["#7c5cfc", "#38bdf8"], ["#e879f9", "#f43f5e"], ["#f59e0b", "#22c55e"],
  ["#38bdf8", "#7c5cfc"], ["#f43f5e", "#fb923c"], ["#a78bfa", "#60a5fa"],
];
const getGrad = (id = "") => GRAD_PALETTE[id.charCodeAt(0) % GRAD_PALETTE.length];

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso), now = new Date(), diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short" });
};

const groupByDate = (msgs) => {
  const buckets = []; let lastDate = null;
  msgs.forEach(m => {
    const ds = new Date(m.createdAt).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    if (ds !== lastDate) { buckets.push({ type: "divider", label: ds }); lastDate = ds; }
    buckets.push(m);
  });
  return buckets;
};

/* ═══════════════ AVATAR ═══════════════ */
function Avatar({ user, size = 40, className = "tg-avatar" }) {
  const grad = getGrad(user?._id || user?.id || "default");
  const initials = getInitials(user?.name);
  const presetSvg = user?.presetAvatarId
    ? PRESET_AVATARS_MAP[user.presetAvatarId]
    : PRESET_AVATARS_MAP[user?.profilePic];
  const hasPic = !presetSvg && user?.profilePic && !user.profilePic.startsWith("<svg");
  const hasSvg = !presetSvg && !hasPic && user?.profilePic?.startsWith("<svg");
  const bg = (presetSvg || hasPic || hasSvg) ? "transparent"
    : `linear-gradient(135deg,${grad[0]},${grad[1]})`;
  return (
    <div className={className} style={{ width: size, height: size, fontSize: size * 0.18, background: bg, borderRadius: "50%", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white" }}>
      {presetSvg ? (
        <span dangerouslySetInnerHTML={{ __html: presetSvg }}
          style={{ width: "100%", height: "100%", display: "flex", borderRadius: "50%", overflow: "hidden" }} />
      ) : hasPic ? (
        <img src={user.profilePic} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : hasSvg ? (
        <span dangerouslySetInnerHTML={{ __html: user.profilePic }}
          style={{ width: "100%", height: "100%", display: "flex" }} />
      ) : (
        initials
      )}
    </div>
  );
}

/* ═══════════════ FRIENDS INLINE VIEW ═══════════════ */
function FriendsInlineView({ friends, setFriends, token, authHeader, onGoToChat, onBack }) {
  const [allUsers, setAllUsers] = useState([]);
  const [sentReqs, setSentReqs] = useState(new Set());
  const [requests, setRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [friendSearch, setFriendSearch] = useState("");
  const [discSearch, setDiscSearch] = useState("");
  const [mobPane, setMobPane] = useState("friends");

  useEffect(() => {
    if (!token) return;
    setLoadingUsers(true);
    axios.get(`${API}/api/users`, { headers: authHeader() })
      .then(r => setAllUsers(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
    axios.get(`${API}/api/users/sent-requests`, { headers: authHeader() })
      .then(r => setSentReqs(new Set(Array.isArray(r.data) ? r.data.map(u => u._id) : [])))
      .catch(console.error);
    axios.get(`${API}/api/friends/requests`, { headers: authHeader() })
      .then(r => setRequests(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, [token]);

  const myId = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("userInfo"))?._id; } catch { return null; }
  }, []);

  const friendIds = useMemo(() => new Set(friends.map(f => f._id)), [friends]);

  const filteredFriends = useMemo(() => {
    const q = friendSearch.toLowerCase().trim();
    if (!q) return friends;
    return friends.filter(f =>
      f.name?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q)
    );
  }, [friends, friendSearch]);

  const discoverUsers = useMemo(() => {
    const q = discSearch.toLowerCase().trim();
    return allUsers
      .filter(u => u._id !== myId)
      .filter(u =>
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.bio?.toLowerCase().includes(q)
      )
      .map(u => ({
        ...u,
        status: friendIds.has(u._id) ? "friends"
          : sentReqs.has(u._id) ? "pending" : "none",
      }));
  }, [discSearch, allUsers, friendIds, sentReqs, myId]);

  const handleAdd = async (id) => {
    setSentReqs(p => new Set([...p, id]));
    try { await axios.post(`${API}/api/friends/request`, { userId: id }, { headers: authHeader() }); }
    catch (e) { console.error("add:", e.message); setSentReqs(p => { const n = new Set(p); n.delete(id); return n; }); }
  };

  const handleRemove = async (id) => {
    let snap;
    setFriends(f => { snap = f; return f.filter(x => x._id !== id); });
    try { await axios.delete(`${API}/api/friends/${id}`, { headers: authHeader() }); }
    catch (e) { console.error("remove:", e.message); setFriends(snap); }
  };

  const handleAccept = async (id) => {
    setRequests(p => p.filter(r => r._id !== id));
    try {
      await axios.post(`${API}/api/friends/accept`, { userId: id }, { headers: authHeader() });
      const { data } = await axios.get(`${API}/api/friends`, { headers: authHeader() });
      setFriends(Array.isArray(data) ? data : []);
    } catch (e) { console.error("accept:", e.message); }
  };

  const handleReject = async (id) => {
    setRequests(p => p.filter(r => r._id !== id));
    try { await axios.post(`${API}/api/friends/reject`, { userId: id }, { headers: authHeader() }); }
    catch (e) { console.error("reject:", e.message); }
  };

  const FriendCard = ({ friend }) => {
    const [phase, setPhase] = useState("idle");
    return (
      <div className="fi-friend-card">
        {/* Use full Avatar component to render pfp properly */}
        <Avatar user={friend} size={40} className="" />
        <div className="fi-friend-card-info">
          <div className="fi-friend-card-name">{friend.name}</div>
          <div className="fi-friend-card-sub">
            {phase === "confirm"
              ? <span style={{ color: "#fb7185" }}>Remove this friend?</span>
              : "TanGent member"
            }
          </div>
        </div>
        {phase === "idle" && (
          <button className="fi-btn fi-btn-remove" onClick={() => {
            setPhase("confirm");
            setTimeout(() => setPhase(p => p === "confirm" ? "idle" : p), 4000);
          }}>Remove</button>
        )}
        {phase === "confirm" && (
          <div className="fi-confirm-row">
            <button className="fi-btn" style={{ background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.4)", color: "#fb7185" }}
              onClick={() => handleRemove(friend._id)}>Yes</button>
            <button className="fi-btn fi-btn-remove" onClick={() => setPhase("idle")}>No</button>
          </div>
        )}
      </div>
    );
  };

  const UserCard = ({ user }) => {
    const [sending, setSending] = useState(false);
    const handleAdd_ = async () => {
      if (user.status !== "none" || sending) return;
      setSending(true);
      await handleAdd(user._id);
      setSending(false);
    };
    return (
      <div className="fi-friend-card">
        {/* Use full Avatar component */}
        <Avatar user={user} size={38} className="" />
        <div className="fi-friend-card-info">
          <div className="fi-friend-card-name">{user.name}</div>
          <div className="fi-friend-card-sub">{user.bio || "TanGent member"}</div>
        </div>
        {user.status === "friends" && <span className="fi-btn fi-btn-friends">✓ Friends</span>}
        {user.status === "pending" && <span className="fi-btn fi-btn-pending">Pending…</span>}
        {user.status === "none" && (
          <button className="fi-btn fi-btn-add" onClick={handleAdd_} disabled={sending}>
            {sending ? "Sending…" : "+ Add"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fi-wrap">
      {/* Header — same height as chat header (68px) */}
      <div className="fi-header">
        {/* Mobile back button */}
        <button
          className="tg-back-btn"
          style={{ display: "none", marginRight: 4 }}
          onClick={onBack}
          title="Back"
        >
          <BackIcon />
        </button>
        <div className="fi-header-left">
          <h2>Friends</h2>
          <p>Manage your connections and discover new people</p>
        </div>
        <div className="fi-stats">
          <div className="fi-stat">
            <div className="fi-stat-dot" style={{ background: "#7c5cfc" }} />
            {friends.length} friends
          </div>
          {requests.length > 0 && (
            <div className="fi-stat" style={{ borderColor: "rgba(124,92,252,0.3)", color: "#c4b5fd" }}>
              🔔 {requests.length} request{requests.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="fi-mob-tabs">
        <button className={`fi-mob-tab ${mobPane === "friends" ? "active" : ""}`} onClick={() => setMobPane("friends")}>
          My Friends ({friends.length})
        </button>
        <button className={`fi-mob-tab ${mobPane === "discover" ? "active" : ""}`} onClick={() => setMobPane("discover")}>
          Find People
        </button>
      </div>

      {/* Body */}
      <div className="fi-body">
        {/* LEFT: My Friends */}
        <div className="fi-pane" style={{ display: mobPane === "discover" ? "none" : "flex" }}>
          <div className="fi-pane-head">
            <div className="fi-pane-title"><UsersIcon /> My Friends</div>
            <div className="fi-pane-sub">{friends.length} total</div>
            <div className="fi-search">
              <SearchIcon />
              <input placeholder="Search friends…" value={friendSearch} onChange={e => setFriendSearch(e.target.value)} />
            </div>
          </div>
          <div className="fi-list">
            {/* Incoming requests */}
            {requests.length > 0 && (
              <div className="fi-requests-banner">
                <div className="fi-requests-banner-head">🔔 Friend Requests · {requests.length}</div>
                {requests.map(req => (
                  <div key={req._id} className="fi-req-card">
                    <Avatar user={req} size={36} className="" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--text)" }}>{req.name}</div>
                      <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: 2 }}>Wants to be friends</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button className="fi-btn fi-btn-add" onClick={() => handleAccept(req._id)}>Accept</button>
                      <button className="fi-btn fi-btn-remove" onClick={() => handleReject(req._id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {friends.length === 0 && (
              <div className="fi-empty">
                <div className="fi-empty-icon">👥</div>
                <div className="fi-empty-title">No friends yet</div>
                <div className="fi-empty-sub">Search for people on the right to start building your circle.</div>
              </div>
            )}
            {filteredFriends.length === 0 && friends.length > 0 && (
              <div className="fi-empty">
                <div className="fi-empty-icon">🔍</div>
                <div className="fi-empty-title">No match</div>
                <div className="fi-empty-sub">No friends match "{friendSearch}"</div>
              </div>
            )}
            {filteredFriends.map(f => <FriendCard key={f._id} friend={f} />)}
          </div>
        </div>

        {/* RIGHT: Find People */}
        <div className="fi-pane" style={{ display: mobPane === "friends" ? "none" : "flex" }}>
          <div className="fi-pane-head">
            <div className="fi-pane-title"><SearchIcon /> Find People</div>
            <div className="fi-pane-sub">Search and add new friends</div>
            <div className="fi-search">
              <SearchIcon />
              <input placeholder="Search by name, email or bio…" value={discSearch} onChange={e => setDiscSearch(e.target.value)} />
            </div>
          </div>
          <div className="fi-list">
            {!discSearch && (
              <div className="fi-empty">
                <div className="fi-empty-icon">🔭</div>
                <div className="fi-empty-title">Search to discover</div>
                <div className="fi-empty-sub">Type a name or email above to find people on TanGent.</div>
              </div>
            )}
            {discSearch && loadingUsers && (
              <div className="fi-empty">
                <div className="tg-spinner" style={{ width: 24, height: 24, margin: "0 auto" }} />
              </div>
            )}
            {discSearch && !loadingUsers && discoverUsers.length === 0 && (
              <div className="fi-empty">
                <div className="fi-empty-icon">😶</div>
                <div className="fi-empty-title">No users found</div>
                <div className="fi-empty-sub">No results for "{discSearch}"</div>
              </div>
            )}
            {discSearch && discoverUsers.map(u => <UserCard key={u._id} user={u} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileBottomSheet({ me, displayName, displayEmail, onClose, onLogout, onProfile, onSettings, onHelp }) {
  const [closing, setClosing] = useState(false);

  const close = (cb) => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); if (cb) cb(); }, 210);
  };

  return ReactDOM.createPortal(
    <>
      <div className={`tg-sheet-backdrop${closing ? " closing" : ""}`} onClick={() => close()} />
      <div className={`tg-sheet${closing ? " closing" : ""}`}>
        {/* Handle */}
        <div className="tg-sheet-handle-row"><div className="tg-sheet-handle" /></div>

        {/* User info */}
        <div className="tg-sheet-user">
          <Avatar user={me || { name: displayName }} size={46} className="" />
          <div className="tg-sheet-user-info">
            <div className="tg-sheet-user-name">{displayName}</div>
            <div className="tg-sheet-user-email">{displayEmail}</div>
          </div>
          <span className="tg-sheet-badge">Free plan</span>
        </div>

        <div className="tg-sheet-body">
          {/* Profile */}
          <button className="tg-sheet-item" onClick={() => close(onProfile)}>
            <span className="tg-sheet-item-icon"><IconProfile /></span>
            <span className="tg-sheet-item-label">Profile</span>
            <span className="tg-sheet-item-arrow"><ArrowRightIcon /></span>
          </button>

          {/* Settings */}
          <button className="tg-sheet-item" onClick={() => close(onSettings)}>
            <span className="tg-sheet-item-icon"><IconThreeDot /></span>
            <span className="tg-sheet-item-label">Settings</span>
            <span className="tg-sheet-item-arrow"><ArrowRightIcon /></span>
          </button>

          {/* Help */}
          <button className="tg-sheet-item" onClick={() => close(onHelp)}>
            <span className="tg-sheet-item-icon"><IconHelp /></span>
            <span className="tg-sheet-item-label">Help &amp; Support</span>
            <span className="tg-sheet-item-arrow"><ArrowRightIcon /></span>
          </button>

          <div className="tg-sheet-divider" />

          {/* Upgrade */}
          <button className="tg-sheet-upgrade">
            <span className="tg-sheet-upgrade-icon"><IconUpgrade /></span>
            <span className="tg-sheet-upgrade-text">
              <div className="tg-sheet-upgrade-title">Upgrade TanGent</div>
              <div className="tg-sheet-upgrade-sub">Unlock AI replies &amp; more</div>
            </span>
            <span className="tg-sheet-upgrade-chip">Pro</span>
          </button>

          <div className="tg-sheet-divider" />

          {/* Logout */}
          <button className="tg-sheet-item danger" onClick={() => close(onLogout)}>
            <span className="tg-sheet-item-icon"><IconLogout /></span>
            <span className="tg-sheet-item-label">Log out</span>
          </button>

          <div className="tg-sheet-bottom-pad" />
        </div>
      </div>
    </>,
    document.body
  );
}
/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function TanGentChatUI() {
  const navigate = useNavigate();

  const [authUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("userInfo")); } catch { return null; }
  });
  const token = authUser?.token || localStorage.getItem("token") || null;
  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    if (!authUser && !token) navigate("/login", { replace: true });
  }, []);

  /* ── State ── */
  const [me, setMe] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [search, setSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [iAmTyping, setIAmTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [callModal, setCallModal] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerCoords, setEmojiPickerCoords] = useState({ bottom: 80, right: 60 });
  /* Notification bell state */
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  /* Mobile: whether the main chat/friends panel is visible */
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const notifRef = useRef(null);
  const notifBtnRef = useRef(null);
  const typingTimeout = useRef(null);
  const socketRef = useRef(null);
  const { socketRef: globalSocket, notifications, markRead } = useAppContext();

  // Feature 1: theme
  const [chatTheme, setChatTheme] = useState(null);   // loaded from API

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [replyTo, setReplyTo] = useState(null);  // message object being replied to

  // Feature 5: multi-select
  const [selectedMsgs, setSelectedMsgs] = useState(new Set()); // set of _ids

  // Refs for reply-scroll
  const msgRefs = useRef({});  // { [msgId]: domNode }

  /* ── 1. Fetch current user ── */
  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/api/users/me`, { headers: authHeader() })
      .then(r => setMe(r.data))
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/api/settings`, { headers: authHeader() })
      .then(r => setChatTheme(r.data))
      .catch(console.error);
  }, [token]);

  /* ── 2. Fetch pending friend requests for notification bell ── */
  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/api/friends/requests`, { headers: authHeader() })
      .then(r => setPendingRequests(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, [token]);

  /* ── 3. Socket.IO ── */
  useEffect(() => {
    if (!me?._id) return;
    const socket = connectSocket(me._id);
    socketRef.current = socket;

    socket.on("message received", (newMsg) => {
      const senderId = newMsg.sender?._id || newMsg.sender;
      setMessages(prev => {
        const inConv = senderId === activeFriend?._id || newMsg.receiver === activeFriend?._id;
        if (inConv) {
          if (prev.find(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        }
        return prev;
      });
      setActiveFriend(cur => {
        if (senderId !== cur?._id)
          setUnreadCounts(u => ({ ...u, [senderId]: (u[senderId] || 0) + 1 }));
        return cur;
      });
      setFriends(prev => prev.map(f =>
        f._id === senderId ? { ...f, lastMessage: newMsg.content, lastMessageTime: newMsg.createdAt } : f
      ));
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === activeFriend?._id) setIsTyping(true);
    });
    socket.on("stop typing", ({ senderId }) => {
      if (senderId === activeFriend?._id) setIsTyping(false);
    });
    socket.on("messageEdited", (updatedMsg) => {
      setMessages(prev => prev.map(m =>
        m._id === updatedMsg._id ? { ...m, ...updatedMsg } : m
      ));
    });

    socket.on("messageDeleted", ({ messageId, mode }) => {
      if (mode === "everyone") {
        setMessages(prev => prev.map(m =>
          m._id === messageId ? { ...m, isDeletedForEveryone: true, content: "🚫 This message was deleted" } : m
        ));
      } else {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    });

    socket.on("bulkMessagesDeleted", ({ messageIds, mode }) => {
      if (mode === "everyone") {
        setMessages(prev => prev.map(m =>
          messageIds.includes(m._id) ? { ...m, isDeletedForEveryone: true } : m
        ));
      } else {
        setMessages(prev => prev.filter(m => !messageIds.includes(m._id)));
      }
    });

    return () => {
      socket.off("message received");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [me?._id, activeFriend?._id]);

  /* ── 4. Fetch friends ── */
  useEffect(() => {
    if (!token) return;
    setFriendsLoading(true);
    axios.get(`${API}/api/friends`, { headers: authHeader() })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : r.data.friends || [];
        setFriends(list);
        if (list.length > 0) {
          const lastId = localStorage.getItem("tg_last_friend_id");
          const restored = lastId ? list.find(f => f._id === lastId) : null;
          setActiveFriend(restored || list[0]);
        }
      })
      .catch(console.error)
      .finally(() => setFriendsLoading(false));
  }, [token]);

  /* ── 5. Fetch messages on friend change ── */
  useEffect(() => {
    if (!activeFriend?._id || !token) return;
    localStorage.setItem("tg_last_friend_id", activeFriend._id);
    setMessagesLoading(true);
    setMessages([]);
    setIsTyping(false);
    axios.get(`${API}/api/messages/${activeFriend._id}`, { headers: authHeader() })
      .then(r => {
        const msgs = Array.isArray(r.data) ? r.data : r.data.messages || [];
        setMessages(msgs);
        setUnreadCounts(u => ({ ...u, [activeFriend._id]: 0 }));
        axios.put(`${API}/api/messages/read/${activeFriend._id}`, {}, { headers: authHeader() }).catch(() => { });
      })
      .catch(console.error)
      .finally(() => setMessagesLoading(false));
  }, [activeFriend?._id]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Close emoji picker on outside click ── */
  useEffect(() => {
    if (!showEmojiPicker) return;
    const onDown = (e) => {
      const picker = document.querySelector(".tg-emoji-picker");
      if (picker?.contains(e.target) || emojiBtnRef.current?.contains(e.target)) return;
      setShowEmojiPicker(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showEmojiPicker]);

  /* ── Close notification dropdown on outside click ── */
  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e) => {
      if (notifRef.current?.contains(e.target) || notifBtnRef.current?.contains(e.target)) return;
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  /* ── Mobile: handle browser back button ── */
  useEffect(() => {
    if (!mobileChatOpen) return;
    window.history.pushState({ mobileChatOpen: true }, "");
    const onPop = () => setMobileChatOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [mobileChatOpen]);

  /* ── 6. Send message ── */

  /* ── Main send handler ── */
  const sendMsg = async () => {
    const txt = inputVal.trim();
    if (!txt || !activeFriend?._id || sending) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      _id: tempId, sender: me?._id || "me",
      receiver: activeFriend._id, content: txt,
      createdAt: new Date().toISOString(), read: false, sending: true,
      replyTo: replyTo || null,
    };
    setMessages(prev => [...prev, tempMsg]);
    setInputVal("");
    setReplyTo(null);  // clear reply after sending
    cancelReply();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIAmTyping(false);
    socketRef.current?.emit("stop typing", { senderId: me._id, receiverId: activeFriend._id });
    setSending(true);

    try {
      const { data } = await axios.post(
        `${API}/api/messages`,
        {
          receiverId: activeFriend._id,
          content: txt,
          replyTo: replyTo?._id ?? null,
        },
        { headers: authHeader() }
      );
      setMessages(prev => prev.map(m => m._id === tempId ? data : m));
      socketRef.current?.emit("new message", data);
      setFriends(prev =>
        prev.map(f =>
          f._id === activeFriend._id
            ? { ...f, lastMessage: data.content, lastMessageTime: data.createdAt }
            : f
        )
      );
    } catch {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, failed: true, sending: false } : m));
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (msg, newContent) => {
    try {
      const { data: updated } = await axios.put(
        `${API}/api/messages/edit/${msg._id}`,
        { content: newContent },
        { headers: authHeader() }
      );
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));

      // Emit to the other participant
      socketRef.current?.emit("messageEdited", updated);
    } catch (e) {
      console.error("edit:", e.message);
    }
  };

  // Feature 3: handle delete
  const handleDeleteMessage = async (msg, mode) => {
    try {
      await axios.delete(`${API}/api/messages/${msg._id}`, {
        headers: { ...authHeader(), "Content-Type": "application/json" },
        data: { mode },
      });

      if (mode === "everyone") {
        setMessages(prev => prev.map(m =>
          m._id === msg._id ? { ...m, isDeletedForEveryone: true } : m
        ));
      } else {
        setMessages(prev => prev.filter(m => m._id !== msg._id));
      }

      const senderId = msg.sender?._id ?? msg.sender;
      const receiverId = msg.receiver?._id ?? msg.receiver;
      socketRef.current?.emit("messageDeleted", {
        messageId: msg._id,
        mode,
        senderId,
        receiverId,
      });
    } catch (e) {
      console.error("delete:", e.message);
    }
  };

  // Feature 5: bulk delete
  const handleBulkDelete = async (mode = "me") => {
    const ids = [...selectedMsgs];
    if (!ids.length) return;
    try {
      await axios.post(
        `${API}/api/messages/bulk-delete`,
        { messageIds: ids, mode },
        { headers: authHeader() }
      );
      if (mode === "everyone") {
        setMessages(prev => prev.map(m => ids.includes(m._id) ? { ...m, isDeletedForEveryone: true } : m));
      } else {
        setMessages(prev => prev.filter(m => !ids.includes(m._id)));
      }
      const myId = me?._id;
      const receiverId = activeFriend?._id;
      socketRef.current?.emit("bulkMessagesDeleted", { messageIds: ids, mode, senderId: myId, receiverId });
      setSelectedMsgs(new Set());
    } catch (e) {
      console.error("bulk delete:", e.message);
    }
  };

  // Feature 4: reply
  const handleReply = (msg) => setReplyTo(msg);
  const cancelReply = () => setReplyTo(null);

  // Feature 4: scroll to original message
  const handleScrollToReply = (msgId) => {
    const el = msgRefs.current[msgId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "2px solid rgba(124,92,252,0.7)";
      setTimeout(() => { if (el) el.style.outline = "none"; }, 1200);
    }
  };

  // Feature 5: toggle select
  const toggleSelectMsg = (msgId) => {
    setSelectedMsgs(prev => {
      const next = new Set(prev);
      next.has(msgId) ? next.delete(msgId) : next.add(msgId);
      return next;
    });
  };

  // Feature 3: unified context action handler
  const handleContextAction = (action, msg, extra) => {
    switch (action) {
      case "edit": handleEditMessage(msg, extra); break;
      case "deleteMe": handleDeleteMessage(msg, "me"); break;
      case "deleteEveryone": handleDeleteMessage(msg, "everyone"); break;
      case "reply": handleReply(msg); break;
      case "select": toggleSelectMsg(msg._id); break;
      default: break;
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setInputVal(value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    if (!iAmTyping && activeFriend?._id) {
      setIAmTyping(true);
      socketRef.current?.emit("typing", { senderId: me._id, receiverId: activeFriend._id });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIAmTyping(false);
      socketRef.current?.emit("stop typing", { senderId: me._id, receiverId: activeFriend._id });
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const handleLogout = () => {
    setPageLoading(true);
    try { disconnectSocket(); } catch (e) { console.error(e); }
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("tg_last_friend_id");
    setTimeout(() => navigate("/login", { replace: true }), 900);
  };

  const handleUpgrade = async () => {
    // Load Razorpay script dynamically if not already loaded
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    try {
      // Step 1: Create order from backend
      const { data } = await axios.post(
        `${API}/api/payment/create-order`,
        {},
        { headers: authHeader() }
      );

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,  // public key — safe to expose
        amount: data.amount,
        currency: data.currency,
        name: "TanGent",
        description: "TanGent Pro — ₹199/month",
        order_id: data.orderId,
        prefill: {
          name: displayName,
          email: displayEmail,
        },
        theme: { color: "#7c5cfc" },

        // Step 3: On success — verify with backend
        handler: async (response) => {
          try {
            await axios.post(
              `${API}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: authHeader() }
            );

            // Refresh user data so isPro updates in UI
            const { data: updatedUser } = await axios.get(
              `${API}/api/users/me`,
              { headers: authHeader() }
            );
            setMe(updatedUser);

            alert("🎉 You're now on TanGent Pro!");
          } catch {
            alert("Payment done but verification failed. Contact support with ID: " + response.razorpay_payment_id);
          }
        },

        modal: {
          ondismiss: () => console.log("Payment dismissed"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Could not start payment. Please try again.");
    }
  };

  const handleHome = () => {
    setPageLoading(true);
    setTimeout(() => navigate("/", { replace: true }), 700);
  };

  /* Accept friend request from notification dropdown */
  const handleAcceptFromNotif = async (id) => {
    setPendingRequests(prev => prev.filter(r => r._id !== id));
    setNotifOpen(false);
    try {
      await axios.post(`${API}/api/friends/accept`, { userId: id }, { headers: authHeader() });
      const { data } = await axios.get(`${API}/api/friends`, { headers: authHeader() });
      setFriends(Array.isArray(data) ? data : []);
    } catch (e) { console.error("accept notif:", e.message); }
  };

  const filteredFriends = useMemo(() => friends.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.username?.toLowerCase().includes(search.toLowerCase())
  ), [friends, search]);

  const displayName = me?.name || authUser?.name || "You";
  const displayEmail = me?.email || authUser?.email || "";

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  /* Tab change — opens main panel on mobile for friends tab */
  const handleTabChange2 = (tab) => {
    setActiveTab(tab);
    if (tab === "friends" && window.innerWidth <= 640) {
      setMobileChatOpen(true);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "friends") {
      setPageLoading(true);  // loader on
      setTimeout(() => {
        navigate("/friends");
      }, 700);
      return;
    }
    setActiveTab(tab);
    if (window.innerWidth <= 640) {
      setMobileChatOpen(true);
    }
  };

  /* Friend click */
  const handleFriendClick = (f) => {
    setActiveFriend(f);
    setUnreadCounts(u => ({ ...u, [f._id]: 0 }));
    setActiveTab("chat");
    setMobileChatOpen(true);
  };

  /* Mobile back */
  const handleMobileBack = () => {
    setMobileChatOpen(false);
  };

  /* Emoji picker: use fixed position to escape overflow:hidden */
  const toggleEmojiPicker = () => {
    if (!showEmojiPicker && emojiBtnRef.current) {
      const rect = emojiBtnRef.current.getBoundingClientRect();
      setEmojiPickerCoords({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowEmojiPicker(p => !p);
  };
  const chatBgStyle = chatTheme && chatTheme.backgroundType !== "none" ? {
    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
    background: chatTheme.backgroundType === "image"
      ? `url(${chatTheme.backgroundValue}) center/cover no-repeat`
      : chatTheme.backgroundValue,
    opacity: (chatTheme.opacity ?? 100) / 100,
  } : null;

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <>
      <style>{styles}</style>

      <div className="tg-bg">
        <div className="tg-bg-base" />
        <div className="tg-bg-grid" />
      </div>

      {pageLoading && <Loader />}

      {menuOpen && (
        <div className="tg-menu-backdrop" onMouseDown={() => setMenuOpen(false)} />
      )}

      <div className="tg-app">

        {/* ══════════════ SIDEBAR ══════════════ */}
        <aside className={`tg-sidebar${mobileChatOpen ? " mobile-chat-open" : ""}`}>

          {/* Logo + Bell */}
          <div className="tg-logo-area">
            <button onClick={handleHome} className="logo-container">
              <div className="tg-logo-icon">
                {/* Full logo for desktop */}
                <img src={logo} alt="TanGent" className="tg-logo-full" />
                {/* Icon-only for mobile/tablet */}
                <img src={logoSmall} alt="TanGent" className="tg-logo-small" />
              </div>
            </button>

            {/* Notification Bell — functional */}
            <div className="tg-bell-wrap" ref={notifBtnRef}>
              <button
                className={`tg-bell-btn${notifOpen ? " active" : ""}`}
                title="Notifications"
                onClick={() => setNotifOpen(p => !p)}
              >
                <BellIcon />
                {pendingRequests.length > 0 && (
                  <span className="tg-bell-badge">
                    {pendingRequests.length + notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="tg-notif-dropdown" ref={notifRef}>
                  <div className="tg-notif-head">
                    <span className="tg-notif-title">🔔 Notifications</span>
                    {pendingRequests.length > 0 && (
                      <button className="tg-notif-clear" onClick={() => setPendingRequests([])}>
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="tg-notif-list">
                    {pendingRequests.length === 0 ? (
                      <div className="tg-notif-empty">
                        <div className="tg-notif-empty-icon">🎉</div>
                        <div className="tg-notif-empty-txt">You're all caught up!</div>
                      </div>
                    ) : (
                      pendingRequests.map(req => (
                        <div key={req._id} className="tg-notif-item">
                          <Avatar user={req} size={34} className="" />
                          <div className="tg-notif-body">
                            <div className="tg-notif-name">{req.name}</div>
                            <div className="tg-notif-sub">Sent you a friend request</div>
                          </div>
                          <div className="tg-notif-actions">
                            <button
                              className="tg-notif-accept"
                              onClick={() => handleAcceptFromNotif(req._id)}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="tg-tab-bar">
            <button
              className={`tg-tab-item ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => handleTabChange("chat")}
            >
              <ChatTabIcon />
              <span>Chat</span>
              {totalUnread > 0 && activeTab !== "chat" && (
                <span style={{ marginLeft: "auto", background: "linear-gradient(135deg,#7c5cfc,#5b3ed4)", color: "white", fontSize: ".6rem", fontWeight: 800, padding: "2px 6px", borderRadius: "50px" }}>
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </button>
            <button
              className={`tg-tab-item ${activeTab === "friends" ? "active" : ""}`}
              onClick={() => handleTabChange2("friends")}
            >
              <FriendsTabIcon />
              <span>Friends</span>
            </button>
          </div>

          {/* Sidebar scrollable body */}
          <div className="tg-sidebar-body">

            {activeTab === "chat" && (
              <>
                <div className="tg-search">
                  <SearchIcon />
                  <input
                    placeholder="Search messages…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="tg-sec-label">Direct Messages</div>

                <div className="tg-friends">
                  {friendsLoading && [1, 2, 3, 4].map(i => (
                    <div key={i} className="tg-friend-skeleton">
                      <div className="tg-skel tg-skel-circle" />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div className="tg-skel tg-skel-line" style={{ width: "60%" }} />
                        <div className="tg-skel tg-skel-line" style={{ width: "80%" }} />
                      </div>
                    </div>
                  ))}
                  {!friendsLoading && filteredFriends.length === 0 && (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: ".78rem", lineHeight: 1.6 }}>
                      {search ? `No friends match "${search}"` : "No friends yet. Go to Friends tab to add some!"}
                    </div>
                  )}
                  {!friendsLoading && filteredFriends.map(f => {
                    const unread = unreadCounts[f._id] || 0;
                    const preview = f.lastMessage || f.preview || "Say hello! 👋";
                    const timeStr = formatTime(f.lastMessageTime || f.updatedAt);
                    return (
                      <div
                        key={f._id}
                        className={`tg-friend-item ${activeFriend?._id === f._id ? "active" : ""}`}
                        onClick={() => handleFriendClick(f)}
                      >
                        <Avatar user={f} size={40} className="tg-avatar" />
                        <div className="tg-friend-info">
                          <div className="tg-friend-name">{f.name}</div>
                          <div className="tg-friend-preview">{preview}</div>
                        </div>
                        <div className="tg-friend-meta">
                          <span className="tg-friend-time">{timeStr}</span>
                          {unread > 0 && <span className="tg-unread">{unread > 9 ? "9+" : unread}</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ height: 8 }} />
                </div>
              </>
            )}

            {activeTab === "friends" && (
              <>
                <div className="tg-sec-label">Direct Messages</div>
                <div className="tg-friends">
                  {friendsLoading && [1, 2, 3].map(i => (
                    <div key={i} className="tg-friend-skeleton">
                      <div className="tg-skel tg-skel-circle" />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div className="tg-skel tg-skel-line" style={{ width: "60%" }} />
                        <div className="tg-skel tg-skel-line" style={{ width: "75%" }} />
                      </div>
                    </div>
                  ))}
                  {!friendsLoading && friends.length === 0 && (
                    <div style={{ padding: "20px 12px", textAlign: "center", color: "var(--muted)", fontSize: ".75rem", lineHeight: 1.6 }}>
                      No friends yet
                    </div>
                  )}
                  {!friendsLoading && friends.map(f => {
                    const unread = unreadCounts[f._id] || 0;
                    return (
                      <div
                        key={f._id}
                        className={`tg-friend-item ${activeFriend?._id === f._id ? "active" : ""}`}
                        onClick={() => handleFriendClick(f)}
                      >
                        {/* Avatar renders pfp properly */}
                        <Avatar user={f} size={40} className="tg-avatar" />
                        <div className="tg-friend-info">
                          <div className="tg-friend-name">{f.name}</div>
                          {/* Removed email — show member status only */}
                          <div className="tg-friend-preview">TanGent member</div>
                        </div>
                        <div className="tg-friend-meta">
                          {unread > 0 && <span className="tg-unread">{unread > 9 ? "9+" : unread}</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ height: 8 }} />
                </div>
              </>
            )}

          </div>

          {/* ══ PROFILE ══ */}
          <div
            ref={profileRef}
            className={`tg-profile ${menuOpen ? "menu-open" : ""}`}
            onClick={() => !menuOpen && setMenuOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && !menuOpen && setMenuOpen(true)}
          >
            <Avatar user={me || { name: displayName }} size={38} className="tg-avatar" />
            <div className="tg-profile-info">
              <div className="tg-profile-name">{displayName}</div>
              <div className="tg-profile-email">{me?.isPro && (
                <div>
                  Pro
                </div>
              )}</div>
            </div>
            <span className="tg-profile-chevron"><ChevronUpIcon /></span>
          </div>

          {menuOpen && ReactDOM.createPortal(
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 1040 }}
                onMouseDown={() => setMenuOpen(false)}
              />
              <div
                ref={menuRef}
                className="tg-profile-menu"
                style={{
                  position: "fixed", bottom: (() => {
                    const el = profileRef.current;
                    if (!el) return 80;
                    const rect = el.getBoundingClientRect();
                    return window.innerHeight - rect.top + 8;
                  })(), left: (() => {
                    const el = profileRef.current;
                    if (!el) return 0;
                    return el.getBoundingClientRect().left;
                  })(), zIndex: 1050, width: 284
                }}
              >
                <div className="tg-pm-header">
                  <div className="tg-pm-user">

                    <div className="tg-pm-email">{displayEmail}</div>
                  </div>
                  <span
                    className="tg-pm-badge"
                    style={me?.isPro ? {
                      background: "rgba(251,191,36,0.15)",
                      border: "1px solid rgba(251,191,36,0.35)",
                      color: "#fbbf24",
                    } : {}}
                  >
                    {me?.isPro ? "⚡ Pro" : "Free plan"}
                  </span>
                </div>

                <div className="tg-pm-body">
                  <button className="tg-pm-item"
                    onClick={() => { setMenuOpen(false); navigate("/profile"); }}>
                    <span className="tg-pm-item-icon"><IconProfile /></span>
                    <span className="tg-pm-item-label">Profile</span>
                    <span className="tg-pm-item-arrow"><ArrowRightIcon /></span>
                  </button>

                  <button className="tg-pm-item"
                    onClick={() => { setMenuOpen(false); }}>
                    <span className="tg-pm-item-icon"><IconHelp /></span>
                    <span className="tg-pm-item-label">Help &amp; Support</span>
                    <span className="tg-pm-item-arrow"><ArrowRightIcon /></span>
                  </button>

                  <div className="tg-pm-divider" />

                  {!me?.isPro && (
                    <button
                      className="tg-pm-upgrade"
                      onClick={() => { setMenuOpen(false); handleUpgrade(); }}
                    >
                      <span className="tg-pm-upgrade-icon"><IconUpgrade /></span>
                      <span className="tg-pm-upgrade-text">
                        <div className="tg-pm-upgrade-title">Upgrade to Pro</div>
                        <div className="tg-pm-upgrade-sub">₹199/month — AI replies &amp; more</div>
                      </span>
                      <span className="tg-pm-upgrade-chip">Pro</span>
                    </button>
                  )}

                  {/* Pro confirmation — only shown if user IS pro */}
                  {me?.isPro && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(251,191,36,0.07)",
                      border: "1px solid rgba(251,191,36,0.2)",
                      color: "#fbbf24",
                      fontSize: ".82rem",
                      fontWeight: 700,
                    }}>
                      ⚡ You're on Pro!
                    </div>
                  )}

                  <div className="tg-pm-divider" />

                  <button className="tg-pm-item"
                    onClick={() => { setMenuOpen(false); setShowThemeModal(true); }}>
                    <span className="tg-pm-item-icon"><IconThreeDot /></span>
                    <span className="tg-pm-item-label">Settings</span>
                    <span className="tg-pm-item-arrow"><ArrowRightIcon /></span>
                  </button>

                  <div className="tg-pm-divider" />

                  <button className="tg-pm-item danger"
                    onClick={() => { setMenuOpen(false); handleLogout(); }}>
                    <span className="tg-pm-item-icon"><IconLogout /></span>
                    <span className="tg-pm-item-label">Log out</span>
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}

        </aside>

        {/* ══════════════ MAIN AREA ══════════════ */}
        <main className={`tg-main${mobileChatOpen ? " mobile-chat-open" : ""}`}>
          {chatBgStyle && <div style={chatBgStyle} />}
          {/* Friends tab → FriendsInlineView */}
          {activeTab === "friends" && (
            <FriendsInlineView
              friends={friends}
              setFriends={setFriends}
              token={token}
              authHeader={authHeader}
              onGoToChat={() => setActiveTab("chat")}
              onBack={handleMobileBack}
            />
          )}

          {/* Chat tab */}
          {activeTab === "chat" && (
            <>
              {!friendsLoading && friends.length === 0 && (
                <div className="tg-empty-chat">
                  <div className="tg-empty-icon">👥</div>
                  <div className="tg-empty-title">No friends yet</div>
                  <div className="tg-empty-sub">
                    Add some friends to start chatting. Head to the Friends tab to find people on TanGent.
                  </div>
                  <button className="tg-add-friends-btn" onClick={() => handleTabChange("friends")}>
                    Find Friends →
                  </button>
                </div>
              )}

              {!friendsLoading && friends.length > 0 && !activeFriend && (
                <div className="tg-empty-chat">
                  <div className="tg-empty-icon">💬</div>
                  <div className="tg-empty-title">Select a conversation</div>
                  <div className="tg-empty-sub">Choose a friend from the sidebar to start chatting.</div>
                </div>
              )}

              {activeFriend && (
                <>
                  {/* Chat header */}
                  <div className="tg-chat-header">
                    {/* Back button — visible only on mobile via CSS */}
                    <button className="tg-back-btn" onClick={handleMobileBack} title="Back">
                      <BackIcon />
                    </button>

                    <Avatar user={activeFriend} size={42} className="tg-avatar" />
                    <div className="tg-chat-info">
                      <div className="tg-chat-name">{activeFriend.name}</div>
                      <div className="tg-chat-sub">
                        {isTyping ? "typing…" : ""}
                      </div>
                    </div>
                    <div className="tg-chat-actions">
                      <button className="tg-action-btn" title="Pinned"><PinIcon /></button>
                      <button className="tg-action-btn call" title="Voice call" onClick={() => setCallModal("voice")}><PhoneIcon /></button>
                      <button className="tg-action-btn video" title="Video call" onClick={() => setCallModal("video")}><VideoIcon /></button>
                      <button className="tg-action-btn" title="Info"><InfoIcon /></button>
                      <button className="tg-action-btn" title="More"><MoreIcon /></button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="tg-messages">
                    {messagesLoading && (
                      <div className="tg-msg-loading">
                        <div className="tg-spinner" /> Loading messages…
                      </div>
                    )}
                    {!messagesLoading && messages.length === 0 && (
                      <div style={{ textAlign: "center", color: "var(--muted)", fontSize: ".82rem", marginTop: 40 }}>
                        No messages yet. Say hi to {activeFriend.name}! 👋
                      </div>
                    )}
                    {!messagesLoading && groupByDate(messages).map((item, idx) => {
                      if (item.type === "divider")
                        return <div key={`div-${idx}`} className="tg-date-div">{item.label}</div>;

                      const senderId = item.sender?._id || item.sender;
                      const isMe = senderId === (me?._id || me?.id);

                      return (
                        <div
                          key={item._id}
                          className={`tg-msg-row${isMe ? " me" : ""}`}
                          ref={el => { msgRefs.current[item._id] = el; }}
                          style={{ opacity: item.sending ? 0.65 : 1, transition: "opacity .2s" }}
                        >
                          {!isMe && <Avatar user={activeFriend} size={32} className="tg-avatar-sm" />}

                          <div className="tg-msg-bubble-wrap">
                            <MessageBubble
                              msg={item}
                              isMe={isMe}
                              isSelected={selectedMsgs.has(item._id)}
                              onContextAction={handleContextAction}
                              onScrollToReply={handleScrollToReply}
                              bubbleColorMe={chatTheme?.bubbleColorMe}
                              bubbleColorThem={chatTheme?.bubbleColorThem}
                              textColorMe={chatTheme?.textColorMe}
                              textColorThem={chatTheme?.textColorThem}
                            />

                            <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                              <span style={{ fontSize: ".63rem", color: "var(--muted)" }}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMe && (
                                <span style={{ color: item.read ? "#38bdf8" : "var(--muted)" }}>
                                  <DblCheckIcon />
                                </span>
                              )}
                              {item.failed && (
                                <span style={{ fontSize: ".65rem", color: "#f87171" }}>Failed — tap to retry</span>
                              )}
                            </div>
                          </div>

                          {isMe && <Avatar user={me || { name: displayName }} size={32} className="tg-avatar-sm" />}
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="tg-msg-row">
                        <Avatar user={activeFriend} size={32} className="tg-avatar-sm" />
                        <div>
                          <div className="tg-typing-dots">
                            <div className="tg-typing-dot" /><div className="tg-typing-dot" /><div className="tg-typing-dot" />
                          </div>
                          <span style={{ fontSize: ".63rem", color: "var(--muted)" }}>
                            {activeFriend.name} is typing…
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {replyTo && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 20px",
                      background: "rgba(124,92,252,0.08)",
                      borderTop: "1px solid rgba(124,92,252,0.15)",
                      borderLeft: "3px solid rgba(124,92,252,0.7)",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: ".68rem", color: "#c4b5fd", fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 2 }}>
                          ↩ Replying to {replyTo.sender?.name ?? "Unknown"}
                        </div>
                        <div style={{ fontSize: ".78rem", color: "rgba(180,170,240,0.6)", fontFamily: "'Plus Jakarta Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>
                          {replyTo.content}
                        </div>
                      </div>
                      <button onClick={cancelReply} style={{ background: "transparent", border: "none", color: "rgba(180,170,240,0.5)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>✕</button>
                    </div>
                  )}
                  {selectedMsgs.size > 0 && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 20px",
                      background: "rgba(124,92,252,0.12)",
                      borderTop: "1px solid rgba(124,92,252,0.2)",
                    }}>
                      <span style={{ flex: 1, fontSize: ".82rem", fontWeight: 700, color: "#c4b5fd", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        {selectedMsgs.size} selected
                      </span>
                      <button
                        onClick={() => handleBulkDelete("me")}
                        style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(244,63,94,0.4)", background: "rgba(244,63,94,0.1)", color: "#fb7185", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".78rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Delete for me
                      </button>
                      <button
                        onClick={() => handleBulkDelete("everyone")}
                        style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(244,63,94,0.6)", background: "rgba(244,63,94,0.18)", color: "#f87171", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".78rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Delete for everyone
                      </button>
                      <button
                        onClick={() => setSelectedMsgs(new Set())}
                        style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(180,170,240,0.5)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".78rem", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {/* Input area */}
                  <div className="tg-input-area">
                    <div className="tg-input-row">
                      <div className="tg-input-tools">
                        <button className="tg-tool-btn" title="Attach"><AttachIcon /></button>
                        <button className="tg-tool-btn" title="Image"><ImageIcon2 /></button>
                      </div>
                      <div className="tg-input-wrap">
                        <textarea
                          ref={textareaRef}
                          rows={1}
                          placeholder={`Message ${activeFriend.name}…`}
                          value={inputVal}
                          onChange={handleInput}
                          onKeyDown={handleKeyDown}
                        />
                        {/* Emoji button with fixed-position picker to avoid overflow clipping */}
                        <div className="tg-emoji-btn-wrap" ref={emojiBtnRef}>
                          <span
                            className="tg-emoji-btn"
                            title="Emoji"
                            onClick={toggleEmojiPicker}
                          >
                            😊
                          </span>
                        </div>
                        <button className="tg-tool-btn" style={{ background: "none", border: "none", width: 26, height: 26, flexShrink: 0 }}>
                          <MicIcon />
                        </button>
                      </div>
                      <button className="tg-send-btn" onClick={sendMsg} disabled={!inputVal.trim() || sending}>
                        {sending ? <div className="tg-spinner" style={{ borderTopColor: "white" }} /> : <SendIcon />}
                      </button>
                    </div>
                  </div>

                  {/* Emoji picker — rendered in body via fixed position to bypass overflow:hidden */}
                  {showEmojiPicker && (
                    <div
                      className="tg-emoji-picker"
                      style={{
                        bottom: emojiPickerCoords.bottom,
                        right: emojiPickerCoords.right,
                      }}
                    >
                      {EMOJI_LIST.map(emoji => (
                        <span
                          key={emoji}
                          onClick={() => {
                            setInputVal(v => v + emoji);
                            setShowEmojiPicker(false);
                            textareaRef.current?.focus();
                          }}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </main>
      </div>

      {/* Call modal */}
      {callModal && activeFriend && (
        <div className="tg-call-overlay" onClick={() => setCallModal(null)}>
          <div className="tg-call-card" onClick={e => e.stopPropagation()}>
            <div className="tg-call-avatar" style={{ background: `linear-gradient(135deg,${getGrad(activeFriend._id)[0]},${getGrad(activeFriend._id)[1]})` }}>
              {activeFriend.profilePic
                ? <img src={activeFriend.profilePic} alt={activeFriend.name} />
                : getInitials(activeFriend.name)
              }
            </div>
            <div className="tg-call-name">{activeFriend.name}</div>
            <div className="tg-call-desc">{callModal === "video" ? "📹 Video Call" : "📞 Voice Call"} — Calling…</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
              {["🔒 E2E Encrypted", "TanGent Secure"].map((t, i) => (
                <span key={i} style={{ fontSize: ".65rem", padding: "3px 10px", borderRadius: "50px", background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.2)", color: "#c4b5fd" }}>{t}</span>
              ))}
            </div>
            <div className="tg-call-actions">
              <button className="tg-call-btn mute"><MuteIcon /></button>
              <button className="tg-call-btn end" onClick={() => setCallModal(null)}><EndCallIcon /></button>
              <button className="tg-call-btn accept"><AcceptIcon /></button>
            </div>
            <div style={{ marginTop: 16, fontSize: ".68rem", color: "var(--muted)" }}>Tap outside to dismiss</div>
          </div>
        </div>
      )}
      {showThemeModal && (
        <ChatThemeSettingsModal
          authHeader={authHeader}
          onClose={() => setShowThemeModal(false)}
          onSave={(saved) => setChatTheme(saved)}
        />
      )}
    </>
  );
}
