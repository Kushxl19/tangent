import React, { useState, useEffect, useMemo, memo, useCallback,useRef } from "react";
import logo from "../assets/tg-logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import NotificationBell from "../components/Notificationbell";

const getToken = () => JSON.parse(localStorage.getItem("userInfo") || "{}")?.token;
const H = () => ({ Authorization: `Bearer ${getToken()}` });

const API = "http://localhost:5000";

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

/* ─── CSS (enhanced responsiveness) ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
:root{
  --bg:#07071a;--p1:#7c5cfc;--p2:#38bdf8;--p3:#c084fc;
  --text:#eeeeff;--muted:rgba(180,170,240,.5);
  --card:rgba(255,255,255,.04);--border:rgba(255,255,255,.07);
}
body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;min-height:100vh}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:300;display:flex;align-items:center;padding:0 6%;height:68px;transition:all .3s;overflow:visible}
nav.scrolled{background:rgba(7,7,26,.92);backdrop-filter:blur(22px);border-bottom:1px solid var(--border)}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}
.nav-logo img{
  /* ── responsive logo ── */
  height:36px;
  width:auto;
  max-width:180px;
  display:block;
  object-fit:contain;
}
.nav-center{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:50px;padding:5px;margin:0 auto}
.nav-link{padding:8px 20px;border-radius:50px;font-size:.875rem;font-weight:600;color:var(--muted);text-decoration:none;transition:all .2s;white-space:nowrap}
.nav-link:hover{color:var(--text);background:rgba(255,255,255,.07)}
.nav-link.active{color:white;background:rgba(124,92,252,.3);border:1px solid rgba(124,92,252,.3)}
.nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;position:relative;overflow:visible}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;border-radius:50px;font-family:inherit;font-size:.875rem;font-weight:700;text-decoration:none;cursor:pointer;transition:all .2s;border:none}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid rgba(255,255,255,.12)}
.btn-ghost:hover{color:var(--text);border-color:rgba(124,92,252,.5);background:rgba(124,92,252,.08)}
.btn-primary{background:linear-gradient(135deg,#7c5cfc,#5b3ed4);color:white;box-shadow:0 4px 20px rgba(124,92,252,.45)}
.btn-white{background:white;color:#0f0f1a;box-shadow:0 4px 20px rgba(0,0,0,.3)}
.btn-white:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.4)}
.hamburger{display:none;background:none;border:none;color:var(--text);cursor:pointer;margin-left:auto}
.mobile-menu{display:none;position:fixed;top:68px;left:0;right:0;background:rgba(7,7,26,.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:20px 6%;flex-direction:column;gap:16px;z-index:299}
.mobile-menu a{color:var(--muted);text-decoration:none;font-weight:600;padding:10px;border-radius:8px}
.mobile-menu a:hover{color:var(--text);background:rgba(255,255,255,.05)}
@media(max-width:900px){
  .nav-center{display:none}
  .hamburger{display:block}
  .mobile-menu{display:flex}
  /* shrink logo slightly on tablet */
  .nav-logo img{max-width:140px;}
}
@media(max-width:600px){
  nav{padding:0 4%;height:60px}
  .nav-logo img{height:30px;max-width:120px}
  .btn{padding:6px 12px;font-size:.75rem}
  .btn-ghost{padding:6px 12px}
  .hamburger svg{width:22px;height:22px}
  .mobile-menu{padding:16px 4%}
}
@media(max-width:480px){
  nav{padding:0 4%}
  .nav-logo img{height:28px;max-width:100px}
  .btn{padding:5px 10px;font-size:.7rem}
  .btn-ghost{padding:5px 10px}
}
  @media(max-width:900px){
  .nav-right .btn-white{
    display:none;
  }
}
@media(max-width:900px){
  .nav-right{
    margin-left: auto;
  }
}
/* ── icon action button shared style ── */
.fr-icon-btn {
  width:32px; height:32px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; border:1px solid transparent;
  background:transparent; transition:all .16s; flex-shrink:0;
  font-family:inherit;
}
/* DM button */
.fr-icon-btn-dm {
  border-color:rgba(124,92,252,.22);
  background:rgba(124,92,252,.08);
  color:#a78bfa;
}
.fr-icon-btn-dm:hover {
  background:rgba(124,92,252,.18);
  border-color:rgba(124,92,252,.4);
  color:#c4b5fd;
  transform:translateY(-1px);
}
/* Remove button */
.fr-icon-btn-rm {
  border-color:rgba(255,255,255,.1);
  color:rgba(180,170,240,.45);
}
.fr-icon-btn-rm:hover {
  border-color:rgba(244,63,94,.4);
  background:rgba(244,63,94,.08);
  color:#fb7185;
  transform:translateY(-1px);
}
/* Remove confirm state */
.fr-icon-btn-rm.confirm {
  border-color:rgba(244,63,94,.4);
  background:rgba(244,63,94,.1);
  color:#fb7185;
}

/* BG */
.fr-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.fr-bg-base{position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 80% 10%,rgba(124,92,252,.2) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 5% 85%,rgba(56,189,248,.12) 0%,transparent 55%),radial-gradient(ellipse 40% 40% at 50% 50%,rgba(192,132,252,.07) 0%,transparent 50%),#07071a}
.fr-bg-grid{position:absolute;inset:0;opacity:.18;background-image:radial-gradient(circle,rgba(140,120,255,.35) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 90% 90% at 50% 50%,black 10%,transparent 100%)}
.fr-orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.18;animation:frOrb 14s ease-in-out infinite alternate}
@keyframes frOrb{from{transform:translate(0,0) scale(1)}to{transform:translate(28px,-20px) scale(1.1)}}
.star{position:absolute;border-radius:50%;background:white;animation:twinkle 3s ease-in-out infinite alternate}
@keyframes twinkle{from{opacity:.2;transform:scale(1)}to{opacity:.8;transform:scale(1.4)}}

/* PAGE */
.fr-page{min-height:100vh;padding-top:68px;overflow-x:hidden;position:relative}
.fr-wrap{position:relative;z-index:10;max-width:1200px;margin:0 auto;padding:52px 5% 100px}
@media(max-width:600px){.fr-wrap{padding:32px 4% 60px}}
@media(max-width:480px){.fr-wrap{padding:28px 4% 60px}}

/* HEADER */
.fr-header{margin-bottom:40px;opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease}
.fr-header.vis{opacity:1;transform:translateY(0)}
.fr-title{font-size:clamp(2rem,4vw,2.9rem);font-weight:900;letter-spacing:-2px;line-height:1.08;margin-bottom:10px}
.fr-title-grad{background:linear-gradient(90deg,#c4b5fd,#7c5cfc,#38bdf8);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 5s linear infinite}
@keyframes gradShift{from{background-position:0%}to{background-position:200%}}
.fr-sub{font-size:.9rem;color:rgba(180,170,240,.5);line-height:1.65}
.fr-stats-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}
.fr-stat{display:flex;align-items:center;gap:6px;padding:5px 13px;border-radius:50px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:.75rem;font-weight:700;color:rgba(180,170,240,.7);transition:border-color .2s}
.fr-stat:hover{border-color:rgba(124,92,252,.3)}
.dot-g{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 7px rgba(34,197,94,.8)}
.dot-p{width:7px;height:7px;border-radius:50%;background:#7c5cfc;box-shadow:0 0 7px rgba(124,92,252,.8)}

/* MOBILE TABS */
.fr-mob-tabs{display:none;gap:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:5px;margin-bottom:28px;width:100%;opacity:0;transform:translateY(14px);transition:opacity .5s .1s ease,transform .5s .1s ease}
.fr-mob-tabs.vis{opacity:1;transform:translateY(0)}
.fr-mob-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 16px;border-radius:10px;font-size:.85rem;font-weight:700;cursor:pointer;transition:all .22s;border:1px solid transparent;background:transparent;font-family:'Plus Jakarta Sans',sans-serif;color:rgba(180,170,240,.5)}
.fr-mob-tab:hover:not(.on){color:rgba(180,170,240,.85);background:rgba(255,255,255,.04)}
.fr-mob-tab.on{background:rgba(124,92,252,.17);color:#c4b5fd;border-color:rgba(124,92,252,.28);box-shadow:0 0 18px rgba(124,92,252,.1)}
.fr-tab-badge{min-width:20px;height:20px;padding:0 5px;border-radius:6px;font-size:.67rem;font-weight:800;display:flex;align-items:center;justify-content:center}
.fr-mob-tab.on .fr-tab-badge{background:rgba(124,92,252,.3);color:#c4b5fd}
.fr-mob-tab:not(.on) .fr-tab-badge{background:rgba(255,255,255,.07);color:rgba(180,170,240,.5)}
@media(max-width:600px){
  .fr-mob-tab{padding:8px 12px;font-size:.75rem;gap:6px}
  .fr-tab-badge{min-width:18px;height:18px;font-size:.6rem}
}

/* BODY */
.fr-body{opacity:0;transform:translateY(16px);transition:opacity .45s .2s ease,transform .45s .2s ease}
.fr-body.vis{opacity:1;transform:translateY(0)}
.fr-split{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}

/* PANEL */
.fr-panel{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:22px;overflow:hidden;position:relative}
.fr-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(124,92,252,.5),rgba(56,189,248,.3),transparent)}
.fr-panel-head{padding:20px 20px 0}
.fr-search-sticky{position:sticky;top:68px;z-index:30;padding:12px 20px;background:rgba(7,7,26,.88);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.06)}
.fr-panel-body{max-height:calc(100vh - 220px);overflow-y:auto;padding:16px 20px 24px;scrollbar-width:thin;scrollbar-color:rgba(124,92,252,.25) transparent}
.fr-panel-body::-webkit-scrollbar{width:4px}
.fr-panel-body::-webkit-scrollbar-thumb{background:rgba(124,92,252,.25);border-radius:4px}
@media(max-width:860px){
  .fr-panel-body{max-height:none;overflow:visible}
}
@media(max-width:600px){
  .fr-panel-head{padding:16px 16px 0}
  .fr-search-sticky{padding:10px 16px}
  .fr-panel-body{padding:12px 16px 20px}
}

/* SECTION */
.fr-sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px}
.fr-sec-title{font-size:1rem;font-weight:800;color:#eeeeff;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.fr-sec-count{font-size:.73rem;color:rgba(180,170,240,.4);margin-top:2px;font-weight:500}
.fr-pills{display:flex;align-items:center;gap:6px}
.fr-pill{padding:5px 11px;border-radius:8px;font-size:.73rem;font-weight:700;cursor:pointer;transition:all .16s;border:1px solid transparent;font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;gap:5px}
.fr-pill-all{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09);color:rgba(180,170,240,.6)}
.fr-pill-all:hover{background:rgba(255,255,255,.09);color:rgba(180,170,240,.9)}
.fr-pill-all.on{background:rgba(124,92,252,.14);border-color:rgba(124,92,252,.32);color:#c4b5fd}
.fr-pill-online{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:rgba(180,170,240,.55)}
.fr-pill-online:hover{background:rgba(34,197,94,.08);color:#4ade80;border-color:rgba(34,197,94,.25)}
.fr-pill-online.on{background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:#4ade80}
@media(max-width:600px){
  .fr-sec-title{font-size:.9rem}
  .fr-sec-count{font-size:.68rem}
  .fr-pill{padding:4px 9px;font-size:.68rem}
}

/* LISTS */
.fr-grid{display:flex;flex-direction:column;gap:10px}
.fr-disc-list{display:flex;flex-direction:column;gap:6px}
.fr-div{display:flex;align-items:center;gap:10px;margin:20px 0 14px}
.fr-div-line{flex:1;height:1px;background:rgba(255,255,255,.06)}
.fr-div-lbl{font-size:.67rem;font-weight:700;color:rgba(180,170,240,.32);text-transform:uppercase;letter-spacing:.1em;white-space:nowrap}
.fr-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.fr-chip{padding:5px 12px;border-radius:8px;font-size:.73rem;font-weight:700;cursor:pointer;transition:all .16s;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(180,170,240,.55);font-family:'Plus Jakarta Sans',sans-serif}
.fr-chip:hover{background:rgba(124,92,252,.1);border-color:rgba(124,92,252,.28);color:#c4b5fd}
.fr-chip.on{background:rgba(124,92,252,.16);border-color:rgba(124,92,252,.38);color:#c4b5fd;box-shadow:0 0 12px rgba(124,92,252,.15)}
.fr-suggest-box{border-radius:14px;background:rgba(124,92,252,.045);border:1px solid rgba(124,92,252,.12);padding:12px 12px 8px;margin-bottom:4px}
.fr-suggest-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:6px;margin-bottom:10px;background:rgba(124,92,252,.13);border:1px solid rgba(124,92,252,.24);font-size:.65rem;font-weight:800;color:#c4b5fd;letter-spacing:.06em;text-transform:uppercase}
@media(max-width:600px){
  .fr-grid{gap:8px}
  .fr-disc-list{gap:5px}
  .fr-chip{padding:4px 10px;font-size:.68rem}
  .fr-suggest-box{padding:10px}
}

/* EMPTY */
.fr-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:52px 20px;gap:13px;text-align:center}
.fr-empty-ico{width:72px;height:72px;border-radius:20px;background:rgba(124,92,252,.07);border:1px solid rgba(124,92,252,.15);display:flex;align-items:center;justify-content:center;color:rgba(124,92,252,.48);margin-bottom:4px}
.fr-empty-title{font-size:1rem;font-weight:800;color:#eeeeff;letter-spacing:-.02em}
.fr-empty-sub{font-size:.81rem;color:rgba(180,170,240,.4);line-height:1.65;max-width:260px}
.fr-empty-cta{margin-top:6px;padding:9px 22px;border-radius:10px;background:linear-gradient(135deg,#7c5cfc,#5b3ed4);border:none;color:white;font-size:.81rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 18px rgba(124,92,252,.4);transition:all .2s}
.fr-empty-cta:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(124,92,252,.5)}
@media(max-width:600px){
  .fr-empty{padding:40px 16px}
  .fr-empty-ico{width:56px;height:56px}
  .fr-empty-title{font-size:.9rem}
  .fr-empty-sub{font-size:.75rem}
  .fr-empty-cta{padding:7px 18px;font-size:.75rem}
}

/* ANIMATIONS */
@keyframes slideIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

/* RESPONSIVE LAYOUT SWITCH */
@media(max-width:860px){
  .fr-split{display:block}
  .fr-mob-tabs{display:flex}
  .fr-panel{background:transparent;border:none;border-radius:0}
  .fr-panel::before{display:none}
  .fr-panel-body{max-height:none;overflow:visible;padding:12px 0 24px}
  .fr-search-sticky{margin:0;border-radius:12px}
  .fr-split>div{display:none}
  .fr-split>div.show{display:block;animation:fadeIn .25s ease both}
  .fr-panel-head{padding:16px 0 0}
}
`;

/* ─── ICONS ─── */
const IcoMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IcoX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcoUsers = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IcoCompass = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>;
const IcoStar = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IcoPeople = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IcoSearch = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>;
const IcoOffline = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;

/* DM icon — chat bubble */
const IcoDM = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

/* Remove person icon — user with X */
const IcoRemovePerson = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);

/* ─── SEARCH BAR ─── */
const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "8px 12px" }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(180,170,240,.4)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: "transparent", border: "none", outline: "none", color: "#eeeeff", fontSize: ".85rem", width: "100%", fontFamily: "inherit" }} />
    {value && <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(180,170,240,.4)", fontSize: "1.1rem", lineHeight: 1, padding: 0 }}>×</button>}
  </div>
);

/* ─── EMPTY STATE ─── */
const Empty = ({ icon, title, sub, cta, onCta }) => (
  <div className="fr-empty">
    <div className="fr-empty-ico">{icon}</div>
    <p className="fr-empty-title">{title}</p>
    <p className="fr-empty-sub">{sub}</p>
    {cta && <button className="fr-empty-cta" onClick={onCta}>{cta}</button>}
  </div>
);

/* ─── FRIEND CARD ─── */
const FriendCard = memo(({ friend, onRemove, onDM }) => {
  const [phase, setPhase] = useState("idle"); // idle | confirm | removing

  const handleRemoveClick = () => {
    if (phase === "idle") {
      setPhase("confirm");
      setTimeout(() => setPhase(p => p === "confirm" ? "idle" : p), 4000);
    } else if (phase === "confirm") {
      setPhase("removing");
      onRemove(friend._id);
    }
  };

  const gradients = [
    "linear-gradient(135deg,#7c5cfc,#38bdf8)",
    "linear-gradient(135deg,#e879f9,#7c5cfc)",
    "linear-gradient(135deg,#38bdf8,#22c55e)",
    "linear-gradient(135deg,#f59e0b,#e879f9)",
  ];
  const grad = gradients[friend._id?.charCodeAt(0) % 4 || 0];

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "13px 14px", borderRadius: 16,
        background: "rgba(255,255,255,.03)",
        border: `1px solid ${phase === "confirm" ? "rgba(244,63,94,.3)" : "rgba(255,255,255,.07)"}`,
        transition: "all .25s", animation: "slideIn .3s ease both",
      }}
      onMouseEnter={e => { if (phase === "idle") e.currentTarget.style.borderColor = "rgba(124,92,252,.25)"; }}
      onMouseLeave={e => { if (phase === "idle") e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
    >
      {/* Avatar */}
      <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", color: "white" }}>
        {(friend.name?.[0] ?? "?").toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: ".9rem", color: "#eeeeff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{friend.name}</div>
        <div style={{ fontSize: ".73rem", color: "rgba(180,170,240,.45)", marginTop: 2 }}>
          {phase === "confirm"
            ? <span style={{ color: "#fb7185" }}>Tap again to confirm remove</span>
            : friend.email || "TanGent member"}
        </div>
      </div>

      {/* Action buttons */}
      {phase !== "removing" && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {/* DM button */}
          <button
            className="fr-icon-btn fr-icon-btn-dm"
            title={`Message ${friend.name}`}
            onClick={() => onDM(friend)}
          >
            <IcoDM />
          </button>

          {/* Remove button — icon only, tap once to show confirm state, tap again to remove */}
          <button
            className={`fr-icon-btn fr-icon-btn-rm${phase === "confirm" ? " confirm" : ""}`}
            title={phase === "confirm" ? "Tap again to confirm" : `Remove ${friend.name}`}
            onClick={handleRemoveClick}
          >
            <IcoRemovePerson />
          </button>
        </div>
      )}
      {phase === "removing" && (
        <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(244,63,94,.08)", border: "1px solid rgba(244,63,94,.2)", flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="10" y1="15" x2="10.01" y2="15" /></svg>
        </div>
      )}
    </div>
  );
});

/* ─── USER CARD ─── */
const UserCard = memo(({ user, status, onAddFriend }) => {
  const [sending, setSending] = useState(false);

  const handleAdd = async () => {
    if (status !== "none" || sending) return;
    setSending(true);
    await onAddFriend(user._id);
    setSending(false);
  };

  const gradients = ["linear-gradient(135deg,#c084fc,#7c5cfc)", "linear-gradient(135deg,#7c5cfc,#38bdf8)", "linear-gradient(135deg,#f59e0b,#c084fc)", "linear-gradient(135deg,#38bdf8,#22c55e)"];
  const grad = gradients[user._id?.charCodeAt(0) % 4 || 0];

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 14, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", transition: "all .2s", animation: "slideIn .3s ease both" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,92,252,.22)"; e.currentTarget.style.background = "rgba(124,92,252,.04)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; e.currentTarget.style.background = "rgba(255,255,255,.025)"; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".9rem", color: "white" }}>
        {(user.name?.[0] ?? "?").toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: ".85rem", color: "#eeeeff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
        <div style={{ fontSize: ".71rem", color: "rgba(180,170,240,.4)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {user.bio || user.email || ""}
        </div>
      </div>
      {status === "friends" && <span style={{ padding: "4px 10px", borderRadius: 7, flexShrink: 0, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", color: "#4ade80", fontSize: ".68rem", fontWeight: 700 }}>✓ Friends</span>}
      {status === "pending" && <span style={{ padding: "4px 10px", borderRadius: 7, flexShrink: 0, background: "rgba(124,92,252,.1)", border: "1px solid rgba(124,92,252,.25)", color: "#c4b5fd", fontSize: ".68rem", fontWeight: 700 }}>Pending…</span>}
      {status === "none" && (
        <button
          onClick={handleAdd} disabled={sending}
          style={{ padding: "6px 14px", borderRadius: 8, flexShrink: 0, background: sending ? "rgba(124,92,252,.12)" : "linear-gradient(135deg,#7c5cfc,#5b3ed4)", border: sending ? "1px solid rgba(124,92,252,.25)" : "none", color: sending ? "#c4b5fd" : "white", fontSize: ".73rem", fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all .2s" }}
          onMouseEnter={e => { if (!sending) e.currentTarget.style.opacity = ".85"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
          {sending ? "Sending…" : "+ Add"}
        </button>
      )}
    </div>
  );
});

/* ─── FRIENDS PANEL ─── */
const FriendsPanel = memo(({ friends, filtered, query, onQuery, onRemove, onDiscover, onDM }) => {
  const [onlineOnly, setOnlineOnly] = useState(false);
  const onlineCnt = friends.filter(f => f.online).length;
  const shown = onlineOnly ? filtered.filter(f => f.online) : filtered;

  return (
    <div className="fr-panel">
      <div className="fr-panel-head">
        <div className="fr-sec-hd">
          <div>
            <div className="fr-sec-title"><IcoUsers /> My Friends</div>
            <div className="fr-sec-count">{friends.length} total · {onlineCnt} online</div>
          </div>
          <div className="fr-pills">
            <button className={`fr-pill fr-pill-all${!onlineOnly ? " on" : ""}`} onClick={() => setOnlineOnly(false)}>All</button>
            <button className={`fr-pill fr-pill-online${onlineOnly ? " on" : ""}`} onClick={() => setOnlineOnly(true)}><div className="dot-g" /> Online</button>
          </div>
        </div>
      </div>
      {friends.length > 0 && <div className="fr-search-sticky"><SearchBar value={query} onChange={onQuery} placeholder="Search friends…" /></div>}
      <div className="fr-panel-body">
        {friends.length === 0 && <Empty icon={<IcoPeople />} title="No friends yet" sub="Start building your circle — find people on TanGent." cta="Find People →" onCta={onDiscover} />}
        {friends.length > 0 && shown.length === 0 && onlineOnly && <Empty icon={<IcoOffline />} title="Nobody online" sub="None of your friends are online right now." />}
        {friends.length > 0 && shown.length === 0 && !onlineOnly && query && <Empty icon={<IcoSearch />} title="No match" sub={`No friends match "${query}".`} />}
        {shown.length > 0 && (
          <div className="fr-grid">
            {shown.map(f => <FriendCard key={f._id} friend={f} onRemove={onRemove} onDM={onDM} />)}
          </div>
        )}
      </div>
    </div>
  );
});

/* ─── DISCOVER PANEL ─── */
const CHIPS = ["All", "Online", "Mutual friends", "Pending"];

const DiscoverPanel = memo(({ users, query, onQuery, onAdd }) => {
  const [chip, setChip] = useState("All");
  const shown = users.filter(u => { if (chip === "Online") return u.online; if (chip === "Mutual friends") return u.mutualFriends > 0; if (chip === "Pending") return u.status === "pending"; return true; });
  const suggest = shown.filter(u => u.status === "none");
  const pending = shown.filter(u => u.status === "pending");
  const alreadyFr = shown.filter(u => u.status === "friends");
  const hasOther = pending.length > 0 || alreadyFr.length > 0;

  return (
    <div className="fr-panel">
      <div className="fr-panel-head">
        <div className="fr-sec-hd">
          <div><div className="fr-sec-title"><IcoCompass /> Find People</div><div className="fr-sec-count">Discover people on TanGent</div></div>
        </div>
      </div>
      <div className="fr-search-sticky"><SearchBar value={query} onChange={onQuery} placeholder="Search by name, email or bio…" /></div>
      <div className="fr-panel-body">
        {!query && <Empty icon={<IcoSearch />} title="Search to find people" sub="Type a name or email above to discover people on TanGent." />}
        {query && (<>
          <div className="fr-chips">{CHIPS.map(c => <button key={c} className={`fr-chip${chip === c ? " on" : ""}`} onClick={() => setChip(c)}>{c}</button>)}</div>
          {shown.length === 0 && <Empty icon={<IcoSearch />} title="No users found" sub={`No results for "${query}".`} />}
          {suggest.length > 0 && (<>
            {hasOther && <div className="fr-div"><div className="fr-div-line" /><span className="fr-div-lbl">Suggestions</span><div className="fr-div-line" /></div>}
            <div className="fr-suggest-box">
              <div className="fr-suggest-badge"><IcoStar /> Suggested for you</div>
              <div className="fr-disc-list">{suggest.map(u => <UserCard key={u._id} user={u} status={u.status} onAddFriend={onAdd} />)}</div>
            </div>
          </>)}
          {pending.length > 0 && (<>
            <div className="fr-div"><div className="fr-div-line" /><span className="fr-div-lbl">Pending · {pending.length}</span><div className="fr-div-line" /></div>
            <div className="fr-disc-list">{pending.map(u => <UserCard key={u._id} user={u} status="pending" onAddFriend={onAdd} />)}</div>
          </>)}
          {alreadyFr.length > 0 && (<>
            <div className="fr-div"><div className="fr-div-line" /><span className="fr-div-lbl">Already friends · {alreadyFr.length}</span><div className="fr-div-line" /></div>
            <div className="fr-disc-list">{alreadyFr.map(u => <UserCard key={u._id} user={u} status="friends" onAddFriend={onAdd} />)}</div>
          </>)}
        </>)}
      </div>
    </div>
  );
});

/* ─── MAIN ─── */
export default function Friends() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [requests, setRequests] = useState([]);
  const [user] = useState(() => { try { return JSON.parse(localStorage.getItem("userInfo")); } catch { return null; } });
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [sentReqs, setSentReqs] = useState(new Set());
  const [friendSearch, setFriendSearch] = useState("");
  const [discSearch, setDiscSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFriends = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/friends`, { headers: H() });
      setFriends(Array.isArray(data) ? data : []);
    } catch (e) { console.error("friends:", e.message); }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/friends/requests`, { headers: H() });
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) { console.error("requests:", e.message); }
  }, []);

  const didInit = useRef(false); // ✅ ye line useEffect se PEHLE add karo

useEffect(() => {
    if (didInit.current) return; // ✅ double-run rokta hai
    didInit.current = true;

    const init = async () => {
      setPageLoading(true);
      setLoading(true);
      try {
        await fetchFriends();
        try {
          const { data } = await axios.get(`${API}/api/users`, { headers: H() });
          const arr = Array.isArray(data) ? data : [];
          setAllUsers(arr.map(u => ({
            _id: u._id, name: u.name || "User",
            username: u.email?.split("@")[0] || "user",
            avatar: u.profilePic || null, bio: u.bio || "",
            email: u.email || "", online: false, mutualFriends: 0,
          })));
        } catch (e) {
          console.error("users:", e.response?.data || e.message);
          setError("Could not reach backend — is it running on port 5000?");
        }
        try {
          const { data } = await axios.get(`${API}/api/users/sent-requests`, { headers: H() });
          setSentReqs(new Set(Array.isArray(data) ? data.map(u => u._id) : []));
        } catch (e) { console.error("sent-requests:", e.message); }
        await fetchRequests();
      } finally {
        setLoading(false);     // ✅ error aaye ya na aaye, loading band hoga
        setPageLoading(false);
      }
    };
    init();
  }, [fetchFriends, fetchRequests]);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);

  const handleLogout = () => {
    setPageLoading(true);
    localStorage.removeItem("userInfo");
    setTimeout(() => navigate("/login", { replace: true }), 900);
  };

  const friendIds = useMemo(() => new Set(friends.map(f => f._id)), [friends]);

  const filteredFriends = useMemo(() => {
    const q = friendSearch.toLowerCase().trim();
    if (!q) return friends;
    return friends.filter(f => f.name?.toLowerCase().includes(q) || (f.email || "").toLowerCase().includes(q));
  }, [friends, friendSearch]);

  const discoverUsers = useMemo(() => {
    const q = discSearch.toLowerCase().trim();
    const myId = JSON.parse(localStorage.getItem("userInfo") || "{}")?._id;
    return allUsers
      .filter(u => u._id !== myId)
      .filter(u => !q || (u.name || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q) || (u.bio || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q))
      .map(u => ({ ...u, status: friendIds.has(u._id) ? "friends" : sentReqs.has(u._id) ? "pending" : "none" }));
  }, [discSearch, allUsers, friendIds, sentReqs]);

  const onlineCount = friends.filter(f => f.online).length;
  const pendingCount = sentReqs.size;

  /* ── Actions ── */
  const handleAdd = async (id) => {
    setSentReqs(p => new Set([...p, id]));
    try { await axios.post(`${API}/api/friends/request`, { userId: id }, { headers: H() }); }
    catch (e) { console.error("add:", e.response?.data || e.message); setSentReqs(p => { const n = new Set(p); n.delete(id); return n; }); }
  };

  const handleRemove = async (id) => {
    let snap;
    setFriends(f => { snap = f; return f.filter(x => x._id !== id); });
    try { await axios.delete(`${API}/api/friends/${id}`, { headers: H() }); }
    catch (e) { console.error("remove:", e.response?.data || e.message); setFriends(snap); }
  };

  const handleAccept = async (id) => {
    setRequests(prev => prev.filter(r => r._id !== id));
    try { await axios.post(`${API}/api/friends/accept`, { userId: id }, { headers: H() }); fetchFriends(); }
    catch (e) { console.error("accept:", e.response?.data || e.message); fetchRequests(); }
  };

  const handleReject = async (id) => {
    setRequests(prev => prev.filter(r => r._id !== id));
    try { await axios.post(`${API}/api/friends/reject`, { userId: id }, { headers: H() }); }
    catch (e) { console.error("reject:", e.response?.data || e.message); fetchRequests(); }
  };

  /**
   * Navigate to /chat and pre-select the friend.
   * Chat.jsx reads `tg_last_friend_id` from localStorage to restore the last open friend,
   * so setting it here means the user lands directly in that conversation.
   */
  const handleDM = (friend) => {
    localStorage.setItem("tg_last_friend_id", friend._id);
    setPageLoading(true);
    setTimeout(() => navigate("/chat"), 500);
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{CSS}</style>
      {pageLoading && <Loader />}

      {/* BG */}
      <div className="fr-bg">
        <div className="fr-bg-base" /><div className="fr-bg-grid" />
        {[[2, "8%", "12%", "0s", "2.5s"], [3, "15%", "45%", "-1s", "3s"], [2, "25%", "78%", "-.5s", "2s"], [2, "55%", "20%", "-2s", "3.5s"], [3, "70%", "60%", "-1.5s", "2.8s"], [2, "40%", "90%", "-.8s", "3.2s"]].map(([w, t, l, d, dur], i) => (
          <div key={i} className="star" style={{ width: `${w}px`, height: `${w}px`, top: t, left: l, animationDelay: d, animationDuration: dur }} />
        ))}
        <div className="fr-orb" style={{ width: "480px", height: "480px", background: "rgba(124,92,252,.17)", top: "-120px", right: "-80px" }} />
        <div className="fr-orb" style={{ width: "380px", height: "380px", background: "rgba(56,189,248,.1)", bottom: "-60px", left: "-90px", animationDelay: "-7s", animationDirection: "alternate-reverse" }} />
      </div>

      {/* NAVBAR */}
      <nav className={scrolled ? "scrolled" : ""}>
        <Link to="/" className="nav-logo">
          <img src={logo} alt="TanGent.chat" />
        </Link>
        <div className="nav-center">
          <Link to="/" className="nav-link">Home</Link>
          <a href="/#features" className="nav-link">Features</a>
          <a href="/#how" className="nav-link">How it works</a>
          <Link to="/friends" className="nav-link active">Friends</Link>
          <a href="/#testimonials" className="nav-link">Reviews</a>
        </div>
        <div className="nav-right">
          {user ? (<>
            <div className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/profile")}>

              <span style={{ fontWeight: 600 }}>{user.name}</span>
            </div>
            <NotificationBell />
            <button onClick={handleLogout} className="btn btn-white" style={{ marginLeft: 8 }}>Logout</button>
          </>) : (<>
            <button className="btn btn-ghost" onClick={() => { setPageLoading(true); setTimeout(() => navigate("/login"), 700); }}>Log In</button>
            <button className="btn btn-primary" onClick={() => { setPageLoading(true); setTimeout(() => navigate("/signup"), 700); }}>Get Started →</button>
          </>)}
        </div>
        <button className="hamburger" onClick={() => setMobileMenu(m => !m)}>{mobileMenu ? <IcoX /> : <IcoMenu />}</button>
      </nav>

      {mobileMenu && (
        <div className="mobile-menu" style={{ display: "flex" }}>
          <Link to="/" onClick={() => setMobileMenu(false)}>Home</Link>
          <a href="/#features" onClick={() => setMobileMenu(false)}>Features</a>
          <a href="/#how" onClick={() => setMobileMenu(false)}>How it works</a>
          <Link to="/friends" onClick={() => setMobileMenu(false)}>Friends</Link>
          <a href="/#testimonials" onClick={() => setMobileMenu(false)}>Reviews</a>
          {user && (
            <a
              onClick={() => {
                setMobileMenu(false);
                handleLogout();
              }}
              className="btn"
              style={{ width: "100%", fontSize: "15px" }}
            >
              Logout
            </a>
          )}
        </div>
      )}

      {/* PAGE */}
      <div className="fr-page">
        <div className="fr-wrap">
          {loading && <Loader />}
          {error && (
            <p style={{ textAlign: "center", color: "#fb7185", padding: "20px 0", fontSize: ".88rem", background: "rgba(244,63,94,.06)", borderRadius: 12, border: "1px solid rgba(244,63,94,.2)" }}>
              {error}
            </p>
          )}

          {/* Header */}
          <div className={`fr-header${loaded ? " vis" : ""}`}>
            <h1 className="fr-title">Your <span className="fr-title-grad">Circle</span></h1>
            <p className="fr-sub">Stay connected with friends and discover new people on TanGent.</p>
            <div className="fr-stats-row">
              <div className="fr-stat"><div className="dot-g" />{onlineCount} online now</div>
              <div className="fr-stat"><div className="dot-p" />{friends.length} friend{friends.length !== 1 ? "s" : ""}</div>
              {pendingCount > 0 && <div className="fr-stat"><span style={{ fontSize: ".85rem" }}>📨</span>{pendingCount} pending</div>}
              {requests.length > 0 && <div className="fr-stat" style={{ borderColor: "rgba(124,92,252,.3)", color: "#c4b5fd" }}><span style={{ fontSize: ".85rem" }}>🔔</span>{requests.length} request{requests.length !== 1 ? "s" : ""}</div>}
            </div>
          </div>

          {/* Mobile tabs */}
          <div className={`fr-mob-tabs${loaded ? " vis" : ""}`}>
            <button className={`fr-mob-tab${activeTab === "friends" ? " on" : ""}`} onClick={() => setActiveTab("friends")}><IcoUsers /> My Friends <span className="fr-tab-badge">{friends.length}</span></button>
            <button className={`fr-mob-tab${activeTab === "discover" ? " on" : ""}`} onClick={() => setActiveTab("discover")}><IcoCompass /> Find People {pendingCount > 0 && <span className="fr-tab-badge">{pendingCount}</span>}</button>
          </div>

          {/* Body */}
          <div className={`fr-body${loaded ? " vis" : ""}`}>
            <div className="fr-split">

              {/* LEFT: requests + friends */}
              <div className={activeTab === "friends" ? "show" : ""}>
                {requests.length > 0 && (
                  <div style={{ marginBottom: 20, borderRadius: 18, background: "rgba(124,92,252,.06)", border: "1px solid rgba(124,92,252,.18)", overflow: "hidden", animation: "slideIn .3s ease" }}>
                    <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(124,92,252,.12)" }}>
                      <p style={{ fontSize: ".72rem", fontWeight: 800, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: ".08em" }}>🔔 Friend Requests · {requests.length}</p>
                    </div>
                    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {requests.map(req => (
                        <div key={req._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", animation: "slideIn .3s ease" }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#7c5cfc,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".9rem", color: "white" }}>
                            {(req.name?.[0] ?? "?").toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: ".87rem", color: "#eeeeff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.name}</div>
                            <div style={{ fontSize: ".71rem", color: "rgba(180,170,240,.45)", marginTop: 1 }}>Wants to be friends</div>
                          </div>
                          <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                            <button onClick={() => handleAccept(req._id)}
                              style={{ padding: "6px 14px", borderRadius: 8, background: "linear-gradient(135deg,#7c5cfc,#5b3ed4)", border: "none", color: "white", fontSize: ".73rem", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 12px rgba(124,92,252,.35)", transition: "all .15s" }}
                              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                              Accept
                            </button>
                            <button onClick={() => handleReject(req._id)}
                              style={{ padding: "6px 10px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(180,170,240,.5)", fontSize: ".73rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(244,63,94,.4)"; e.currentTarget.style.color = "#fb7185"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "rgba(180,170,240,.5)"; }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FriendsPanel
                  friends={friends}
                  filtered={filteredFriends}
                  query={friendSearch}
                  onQuery={setFriendSearch}
                  onRemove={handleRemove}
                  onDiscover={() => setActiveTab("discover")}
                  onDM={handleDM}
                />
              </div>

              {/* RIGHT: discover */}
              <div className={activeTab === "discover" ? "show" : ""}>
                <DiscoverPanel users={discoverUsers} query={discSearch} onQuery={setDiscSearch} onAdd={handleAdd} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}