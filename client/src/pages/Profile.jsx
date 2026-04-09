// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/tg-logo.png";
import Loader from "../components/Loader";
import NotificationBell from "../components/Notificationbell";

const API = import.meta.env.VITE_API_URL;


// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
:root{
  --bg:#07071a;--p1:#7c5cfc;--p2:#38bdf8;--p3:#c084fc;
  --text:#eeeeff;--muted:rgba(180,170,240,0.52);
  --card:rgba(255,255,255,.04);--border:rgba(255,255,255,.07);
  --font:'Plus Jakarta Sans',sans-serif;
}
body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden;min-height:100vh}

/* ── NAVBAR ─────────────────────────────────────────────────────────────── */
nav{position:fixed;top:0;left:0;right:0;z-index:300;display:flex;align-items:center;padding:0 6%;height:68px;transition:all .3s;overflow:visible}
nav.scrolled{background:rgba(7,7,26,.92);backdrop-filter:blur(22px);border-bottom:1px solid var(--border)}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.nav-logo img{width:200px;}
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
.mobile-menu a{color:var(--muted);text-decoration:none;font-weight:600;padding:10px;border-radius:8px;cursor:pointer}
.mobile-menu a:hover{color:var(--text);background:rgba(255,255,255,.05)}
@media(max-width:900px){.nav-center{display:none}.hamburger{display:block}.mobile-menu{display:flex}}

/* ── ADDITIONAL RESPONSIVENESS ─────────────────────────────────────────── */
@media(max-width:600px){
  nav{padding:0 4%;height:60px}
  .nav-logo img{width:120px}
  .nav-right .btn{padding:6px 12px;font-size:.75rem}
  .nav-right .btn-ghost{padding:6px 12px}
  .hamburger svg{width:22px;height:22px}
  .mobile-menu{padding:16px 4%}
  .pp-wrap{padding:28px 4% 60px}
  .pp-panel-head{padding:18px 20px}
  .pp-panel-body{padding:20px}
  .pp-panel-footer{padding:12px 20px 18px}
  .pp-sidebar{position:relative;top:0}
  .pp-g2{grid-template-columns:1fr;gap:12px}
}
@media(max-width:480px){
  .nav-logo img{width:100px}
  .nav-right .btn{padding:5px 10px;font-size:.7rem}
  .nav-right .btn-ghost{padding:5px 10px}
  .pp-title{font-size:1.6rem}
  .pp-mob-tab{padding:7px 8px;font-size:.7rem}
  .pp-mob-tab svg{width:12px;height:12px}
  .pp-av-w{width:70px;height:70px}
  .pp-av-img,.pp-av-init{width:64px;height:64px}
  .pp-btn{padding:7px 14px;font-size:.75rem}
}
@media(max-width:900px){
  .nav-right .btn-white{
    display:none;
  }
}
  @media(max-width:900px){
  .nav-right{
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
/* ── BACKGROUND ─────────────────────────────────────────────────────────── */
.pp-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.pp-bg-base{position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 80% 10%,rgba(124,92,252,.2) 0%,transparent 60%),radial-gradient(ellipse 50% 50% at 5% 85%,rgba(56,189,248,.12) 0%,transparent 55%),radial-gradient(ellipse 40% 40% at 50% 50%,rgba(192,132,252,.07) 0%,transparent 50%),#07071a}
.pp-bg-grid{position:absolute;inset:0;opacity:.18;background-image:radial-gradient(circle,rgba(140,120,255,.35) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 90% 90% at 50% 50%,black 10%,transparent 100%)}
.pp-orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.18;animation:ppOrb 14s ease-in-out infinite alternate}
@keyframes ppOrb{from{transform:translate(0,0) scale(1)}to{transform:translate(28px,-20px) scale(1.1)}}
.pp-star{position:absolute;border-radius:50%;background:white;animation:ppTwinkle 3s ease-in-out infinite alternate}
@keyframes ppTwinkle{from{opacity:.2;transform:scale(1)}to{opacity:.8;transform:scale(1.4)}}

/* ── PAGE LAYOUT ────────────────────────────────────────────────────────── */
.pp-page{min-height:100vh;padding-top:68px;overflow-x:hidden;position:relative}
.pp-wrap{position:relative;z-index:10;max-width:1100px;margin:0 auto;padding:52px 5% 100px}

/* ── PAGE HEADER ────────────────────────────────────────────────────────── */
.pp-header{margin-bottom:36px;opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease}
.pp-header.pp-loaded{opacity:1;transform:translateY(0)}
.pp-title{font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:900;letter-spacing:-2px;line-height:1.08;margin-bottom:8px}
.pp-title-grad{background:linear-gradient(90deg,#c4b5fd,#7c5cfc,#38bdf8);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:ppGrad 5s linear infinite}
@keyframes ppGrad{from{background-position:0%}to{background-position:200%}}
.pp-subtitle{font-size:.88rem;color:rgba(180,170,240,.5);line-height:1.65}

/* ── MAIN BODY ENTRANCE ─────────────────────────────────────────────────── */
.pp-body{opacity:0;transform:translateY(16px);transition:opacity .45s .2s ease,transform .45s .2s ease}
.pp-body.pp-loaded{opacity:1;transform:translateY(0)}

/* ── TWO-COLUMN LAYOUT ──────────────────────────────────────────────────── */
.pp-layout{display:grid;grid-template-columns:240px 1fr;gap:20px;align-items:start}
@media(max-width:860px){.pp-layout{grid-template-columns:1fr}.pp-sidebar{display:none}}
@media(max-width:480px){.pp-wrap{padding:28px 4% 60px}}

/* ── SIDEBAR ────────────────────────────────────────────────────────────── */
.pp-sidebar{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:22px;overflow:hidden;position:sticky;top:86px}
.pp-sidebar::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(124,92,252,.5),rgba(56,189,248,.3),transparent)}
.pp-av-blk{display:flex;flex-direction:column;align-items:center;padding:24px 18px 20px;border-bottom:1px solid rgba(255,255,255,.07)}
.pp-av-w{position:relative;width:78px;height:78px;cursor:pointer;margin-bottom:12px;flex-shrink:0}
.pp-av-ring{position:absolute;inset:-3px;border-radius:50%;background:linear-gradient(135deg,#7c5cfc,#38bdf8,#c084fc);padding:2.5px}
.pp-av-ri{width:100%;height:100%;border-radius:50%;background:#07071a;display:flex;align-items:center;justify-content:center}
.pp-av-img{width:72px;height:72px;border-radius:50%;object-fit:cover;display:block}
.pp-av-init{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:white;background:linear-gradient(135deg,#7c5cfc,#c084fc)}
.pp-av-name{font-size:.88rem;font-weight:800;color:var(--text);text-align:center;line-height:1.3}
.pp-av-mail{font-size:.67rem;color:var(--muted);text-align:center;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:175px}
.pp-av-badge{margin-top:10px;display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:50px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.22);font-size:.65rem;font-weight:700;color:#4ade80}
.pp-av-badge-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 5px rgba(34,197,94,.8)}
.pp-sidenav{display:flex;flex-direction:column;gap:3px;padding:14px 10px}
.pp-sidenav-item{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;font-size:.79rem;font-weight:700;color:var(--muted);cursor:pointer;border:1px solid transparent;transition:background .14s,color .14s;user-select:none}
.pp-sidenav-item:hover{background:rgba(255,255,255,.05);color:var(--text)}
.pp-sidenav-item.active{background:rgba(124,92,252,.14);border-color:rgba(124,92,252,.24);color:white}
.pp-sidenav-item.active .pp-sidenav-icon{color:#a78bfa}
.pp-sidenav-icon{display:flex;align-items:center;flex-shrink:0}
.pp-sidenav-divider{height:1px;background:rgba(255,255,255,.06);margin:6px 10px}
.pp-sidebar-footer{padding:12px 10px 14px;border-top:1px solid rgba(255,255,255,.06)}
.pp-back-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 12px;border-radius:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:var(--muted);font-family:var(--font);font-size:.77rem;font-weight:700;cursor:pointer;transition:background .14s,color .14s}
.pp-back-btn:hover{background:rgba(124,92,252,.1);border-color:rgba(124,92,252,.28);color:#c4b5fd}

/* Mobile tab row */
.pp-mob-tabs{display:none;gap:4px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:5px;margin-bottom:20px;width:100%}
.pp-mob-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 12px;border-radius:10px;font-size:.78rem;font-weight:700;cursor:pointer;border:1px solid transparent;background:transparent;font-family:var(--font);color:rgba(180,170,240,.5);transition:all .2s}
.pp-mob-tab.active{background:rgba(124,92,252,.17);color:#c4b5fd;border-color:rgba(124,92,252,.28)}
@media(max-width:860px){.pp-mob-tabs{display:flex}}

/* ── CONTENT PANEL ──────────────────────────────────────────────────────── */
.pp-panel{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:22px;overflow:hidden}
.pp-panel::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(124,92,252,.5),rgba(56,189,248,.3),transparent)}
.pp-panel-head{padding:22px 28px 18px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between}
.pp-panel-title{font-size:1.05rem;font-weight:900;letter-spacing:-.3px;color:var(--text)}
.pp-panel-sub{font-size:.7rem;color:var(--muted);margin-top:3px}
.pp-unsaved{display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:50px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.26);font-size:.67rem;font-weight:700;color:#fcd34d}
.pp-unsaved-dot{width:6px;height:6px;border-radius:50%;background:#f59e0b;flex-shrink:0}
.pp-panel-body{padding:24px 28px;display:flex;flex-direction:column;gap:0}
.pp-panel-footer{padding:14px 28px 18px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:9px}

/* ── FORM ELEMENTS ──────────────────────────────────────────────────────── */
.pp-slabel{font-size:.62rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;margin-top:18px}
.pp-slabel:first-child{margin-top:0}
.pp-divider{height:1px;margin:16px 0;background:linear-gradient(90deg,transparent,rgba(124,92,252,.28),rgba(56,189,248,.13),transparent)}
.pp-g2{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.pp-field{position:relative}
.pp-fw{position:relative;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:11px;transition:border-color .17s,box-shadow .17s;overflow:hidden}
.pp-fw:focus-within{border-color:rgba(124,92,252,.48);box-shadow:0 0 0 3px rgba(124,92,252,.09)}
.pp-fw.ro{background:rgba(255,255,255,.02);border-color:rgba(255,255,255,.05)}
.pp-fw.er{border-color:rgba(239,68,68,.44);box-shadow:0 0 0 3px rgba(239,68,68,.07)}
.pp-fw.ok{border-color:rgba(34,197,94,.35);box-shadow:0 0 0 3px rgba(34,197,94,.06)}
.pp-fic{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);display:flex;align-items:center;pointer-events:none;z-index:1;transition:color .15s}
.pp-fw:focus-within .pp-fic{color:#a78bfa}
.pp-fl{position:absolute;left:36px;top:50%;transform:translateY(-50%);font-size:.77rem;font-weight:600;color:var(--muted);pointer-events:none;z-index:1;white-space:nowrap;transition:top .15s,font-size .15s,color .15s,transform .15s}
.pp-fl.up{top:8px;transform:none;font-size:.56rem;font-weight:700;color:#a78bfa;letter-spacing:.04em}
.pp-fl.ta{top:12px;transform:none}
.pp-fl.ta.up{top:7px;font-size:.56rem;color:#a78bfa}
.pp-inp{width:100%;background:none;border:none;outline:none;color:var(--text);font-family:var(--font);font-size:.82rem;font-weight:600;padding:19px 32px 7px 36px}
.pp-inp.ro{cursor:default}
.pp-inp::placeholder{color:transparent}
.pp-ta{width:100%;background:none;border:none;outline:none;color:var(--text);font-family:var(--font);font-size:.82rem;font-weight:600;padding:23px 10px 8px 36px;resize:none;line-height:1.5}
.pp-ta::placeholder{color:transparent}
.pp-sel{width:100%;background:none;border:none;outline:none;color:var(--text);font-family:var(--font);font-size:.82rem;font-weight:600;padding:19px 32px 7px 36px;-webkit-appearance:none;appearance:none;cursor:pointer}
.pp-sel option{background:#0e0e2e;color:var(--text)}
.pp-sel-arr{position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--muted)}
.pp-ro-badge{position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:.53rem;font-weight:800;letter-spacing:.06em;padding:2px 6px;border-radius:50px;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.2);color:#7dd3fc;text-transform:uppercase}
.pp-cc{position:absolute;right:9px;bottom:7px;font-size:.57rem;color:var(--muted);font-weight:600;pointer-events:none}
.pp-cc.wn{color:#fbbf24}.pp-cc.ov{color:#f87171}
.pp-em{font-size:.61rem;font-weight:700;color:#f87171;margin-top:4px;padding-left:2px;display:flex;align-items:center;gap:4px}

/* Toggle */
.pp-tg-row{display:flex;align-items:center;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.07);gap:12px;transition:border-color .2s}
.pp-tg-row:hover{border-color:rgba(124,92,252,.18)}
.pp-tg-info{flex:1}
.pp-tg-title{font-size:.8rem;font-weight:700;color:var(--text)}
.pp-tg-sub{font-size:.67rem;color:var(--muted);margin-top:2px}
.pp-tg-sw{width:38px;height:21px;border-radius:50px;border:none;cursor:pointer;position:relative;flex-shrink:0;transition:background .2s;background:rgba(255,255,255,.12)}
.pp-tg-sw.on{background:linear-gradient(135deg,#7c5cfc,#5b3ed4)}
.pp-tg-sw::after{content:'';position:absolute;top:3px;left:3px;width:15px;height:15px;border-radius:50%;background:white;transition:left .17s}
.pp-tg-sw.on::after{left:20px}

/* Danger zone */
.pp-dz{background:rgba(239,68,68,.04);border:1.5px solid rgba(239,68,68,.14);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px}
.pp-dz-title{font-size:.65rem;font-weight:900;color:#f87171;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px}
.pp-dr{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border-radius:10px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);transition:border-color .2s}
.pp-dr:hover{border-color:rgba(239,68,68,.1)}
.pp-dr-title{font-size:.8rem;font-weight:700;color:var(--text)}
.pp-dr-sub{font-size:.66rem;color:var(--muted);margin-top:2px;max-width:320px}

/* Buttons */
.pp-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;border-radius:10px;border:none;font-family:var(--font);font-size:.8rem;font-weight:800;cursor:pointer;transition:background .15s,box-shadow .15s,transform .13s,border-color .15s;white-space:nowrap;user-select:none}
.pp-btn-p{background:linear-gradient(135deg,#7c5cfc,#5b3ed4);color:white;box-shadow:0 4px 15px rgba(124,92,252,.36),inset 0 1px 0 rgba(255,255,255,.13)}
.pp-btn-p:hover:not(:disabled){background:linear-gradient(135deg,#8e72fd,#6d4fe0);transform:translateY(-1px);box-shadow:0 7px 22px rgba(124,92,252,.46)}
.pp-btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.pp-btn-g{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:var(--muted)}
.pp-btn-g:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);color:var(--text);transform:translateY(-1px)}
.pp-btn-g:disabled{opacity:.4;cursor:not-allowed;transform:none}
.pp-btn-d{background:linear-gradient(135deg,rgba(239,68,68,.12),rgba(220,38,38,.08));border:1.5px solid rgba(239,68,68,.26);color:#f87171}
.pp-btn-d:hover{background:linear-gradient(135deg,rgba(239,68,68,.22),rgba(220,38,38,.15));border-color:rgba(239,68,68,.46);color:#fca5a5;transform:translateY(-1px)}
.pp-btn-w{background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(217,119,6,.07));border:1.5px solid rgba(245,158,11,.26);color:#fbbf24}
.pp-btn-w:hover{background:linear-gradient(135deg,rgba(245,158,11,.22),rgba(217,119,6,.14));border-color:rgba(245,158,11,.45);color:#fde68a;transform:translateY(-1px)}
.pp-spinner{width:13px;height:13px;border-radius:50%;border:2px solid rgba(255,255,255,.25);border-top-color:white;animation:ppSpin .7s linear infinite;flex-shrink:0}
@keyframes ppSpin{to{transform:rotate(360deg)}}

/* Toast */
.pp-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:10001;display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:13px;background:rgba(7,7,26,.97);border:1px solid rgba(34,197,94,.28);box-shadow:0 16px 50px rgba(0,0,0,.55),0 0 22px rgba(34,197,94,.09);backdrop-filter:blur(16px);font-size:.8rem;font-weight:700;color:#4ade80;font-family:var(--font);white-space:nowrap;animation:ppSlideUp .25s ease}
.pp-toast.er{border-color:rgba(239,68,68,.28);color:#f87171;box-shadow:0 16px 50px rgba(0,0,0,.55),0 0 22px rgba(239,68,68,.09)}
.pp-toast-ic{width:22px;height:22px;border-radius:50%;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.26);display:flex;align-items:center;justify-content:center;font-size:.72rem;flex-shrink:0}
.pp-toast.er .pp-toast-ic{background:rgba(239,68,68,.13);border-color:rgba(239,68,68,.26)}
@keyframes ppSlideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* Modal */
.pp-modal-ov{position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,.82);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;animation:ppFadeIn .18s ease}
.pp-modal{background:rgba(8,8,28,.99);border:1px solid rgba(239,68,68,.19);border-radius:22px;padding:32px;max-width:420px;width:100%;box-shadow:0 26px 75px rgba(0,0,0,.72);font-family:var(--font);color:var(--text)}
.pp-modal.warn{border-color:rgba(245,158,11,.22)}
.pp-modal-icon{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.7rem;background:rgba(239,68,68,.07);border:1.5px solid rgba(239,68,68,.18)}
.pp-modal-icon.warn{background:rgba(245,158,11,.07);border-color:rgba(245,158,11,.2)}
.pp-modal-title{font-size:1.12rem;font-weight:900;text-align:center;margin-bottom:8px}
.pp-modal-desc{font-size:.78rem;color:var(--muted);text-align:center;line-height:1.7;margin-bottom:20px}
.pp-modal-input-wrap{margin-bottom:18px}
.pp-modal-input-wrap label{display:block;font-size:.68rem;font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.04em}
.pp-modal-input-wrap label span{color:#f87171}
.pp-modal-input-wrap label span.warn{color:#fbbf24}
.pp-modal-input{width:100%;background:rgba(255,255,255,.04);border:1.5px solid rgba(239,68,68,.2);border-radius:10px;padding:10px 13px;color:var(--text);font-family:var(--font);font-size:.83rem;outline:none;transition:border-color .16s,box-shadow .16s}
.pp-modal-input:focus{border-color:rgba(239,68,68,.48);box-shadow:0 0 0 3px rgba(239,68,68,.07)}
.pp-modal-input.warn{border-color:rgba(245,158,11,.22)}
.pp-modal-input.warn:focus{border-color:rgba(245,158,11,.5);box-shadow:0 0 0 3px rgba(245,158,11,.07)}
.pp-modal-actions{display:flex;gap:9px}
.pp-modal-actions .pp-btn{flex:1;justify-content:center}
.pp-btn-dc{background:linear-gradient(135deg,#ef4444,#b91c1c);color:white;box-shadow:0 4px 14px rgba(239,68,68,.28)}
.pp-btn-dc:hover:not(:disabled){background:linear-gradient(135deg,#f87171,#dc2626);transform:translateY(-1px)}
.pp-btn-dc:disabled{opacity:.4;cursor:not-allowed}
.pp-btn-wc{background:linear-gradient(135deg,#f59e0b,#d97706);color:white;box-shadow:0 4px 14px rgba(245,158,11,.25)}
.pp-btn-wc:hover:not(:disabled){background:linear-gradient(135deg,#fbbf24,#f59e0b);transform:translateY(-1px)}
.pp-btn-wc:disabled{opacity:.4;cursor:not-allowed}

/* Password strength */
.pp-pw-strength{margin-top:6px;display:flex;flex-direction:column;gap:5px}
.pp-pw-bars{display:flex;gap:3px}
.pp-pw-bar{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.08);transition:background .25s}
.pp-pw-label{font-size:.6rem;font-weight:700;letter-spacing:.04em}

/* Helpers */
.pp-section{display:flex;flex-direction:column;gap:10px;margin-bottom:6px}

@keyframes ppFadeIn{from{opacity:0}to{opacity:1}}
@keyframes ppSlideIn{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}

/* Avatar picker */
.pp-av-picker-btn{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:6px 14px;border-radius:9px;border:1px solid rgba(124,92,252,.3);background:rgba(124,92,252,.08);color:#c4b5fd;font-family:var(--font);font-size:.72rem;font-weight:700;cursor:pointer;transition:all .16s}
.pp-av-picker-btn:hover{background:rgba(124,92,252,.18);border-color:rgba(124,92,252,.5)}
.pp-av-modal-ov{position:fixed;inset:0;z-index:10003;background:rgba(0,0,0,.85);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:20px;animation:ppFadeIn .18s ease}
.pp-av-modal{background:rgba(8,8,28,.99);border:1px solid rgba(124,92,252,.2);border-radius:22px;padding:28px;max-width:500px;width:100%;box-shadow:0 26px 75px rgba(0,0,0,.72);font-family:var(--font);color:var(--text)}
.pp-av-modal-title{font-size:1rem;font-weight:900;margin-bottom:6px}
.pp-av-modal-sub{font-size:.72rem;color:var(--muted);margin-bottom:20px}
.pp-av-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.pp-av-option{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:8px 4px;border-radius:12px;border:2px solid transparent;transition:all .18s}
.pp-av-option:hover{background:rgba(124,92,252,.08);border-color:rgba(124,92,252,.2)}
.pp-av-option.selected{border-color:#7c5cfc;background:rgba(124,92,252,.14);box-shadow:0 0 16px rgba(124,92,252,.3)}
.pp-av-option svg{width:52px;height:52px;border-radius:50%}
.pp-av-option-label{font-size:.6rem;font-weight:700;color:var(--muted);text-align:center;line-height:1.2}
.pp-av-option.selected .pp-av-option-label{color:#c4b5fd}
.pp-av-modal-footer{display:flex;gap:9px;margin-top:20px}
.pp-av-modal-footer .pp-btn{flex:1;justify-content:center}

/* Fix DOB date input */
.pp-inp[type="date"]{padding-top:19px;padding-bottom:7px;color-scheme:dark}
.pp-inp[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.7);cursor:pointer;opacity:0.6}

/* Scrollbar */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(124,92,252,.25);border-radius:4px}
`;

// ─── PRESET AVATARS ───────────────────────────────────────────────────────────
const PRESET_AVATARS = [
  {
    id: "cosmic-cat", label: "Cosmic Cat",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
  },
  {
    id: "nebula-fox", label: "Nebula Fox",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
  },
  {
    id: "void-robot", label: "Void Robot",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
  },
  {
    id: "star-panda", label: "Star Panda",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
  },
  {
    id: "glitch-bear", label: "Glitch Bear",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
  },
  {
    id: "pixel-alien", label: "Pixel Alien",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#042f2e"/>
      <ellipse cx="50" cy="52" rx="20" ry="24" fill="#10b981"/>
      <ellipse cx="50" cy="34" rx="16" ry="20" fill="#34d399"/>
      <ellipse cx="38" cy="30" rx="7" ry="10" fill="#34d399" transform="rotate(-20 38 30)"/>
      <ellipse cx="62" cy="30" rx="7" ry="10" fill="#34d399" transform="rotate(20 62 30)"/>
      <ellipse cx="42" cy="38" rx="5" ry="7" fill="#0d0d1a"/><ellipse cx="58" cy="38" rx="5" ry="7" fill="#0d0d1a"/>
      <ellipse cx="42" cy="38" rx="3" ry="5" fill="#a7f3d0"/><ellipse cx="58" cy="38" rx="3" ry="5" fill="#a7f3d0"/>
      <circle cx="42" cy="38" r="1.5" fill="#0d0d1a"/><circle cx="58" cy="38" r="1.5" fill="#0d0d1a"/>
      <path d="M44 50 Q50 54 56 50" stroke="#0d0d1a" stroke-width="1.5" fill="none"/>
    </svg>`
  },
  {
    id: "neon-wolf", label: "Neon Wolf",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#0a0a1a"/>
      <polygon points="50,20 28,50 72,50" fill="#374151"/>
      <circle cx="50" cy="54" r="22" fill="#374151"/>
      <polygon points="36,32 28,14 44,28" fill="#374151"/><polygon points="64,32 72,14 56,28" fill="#374151"/>
      <ellipse cx="50" cy="52" rx="12" ry="10" fill="#4b5563"/>
      <ellipse cx="42" cy="48" rx="5" ry="6" fill="#111827"/><ellipse cx="58" cy="48" rx="5" ry="6" fill="#111827"/>
      <ellipse cx="42" cy="48" rx="3" ry="4" fill="#f97316"/><ellipse cx="58" cy="48" rx="3" ry="4" fill="#f97316"/>
      <circle cx="42" cy="48" r="1.5" fill="#0a0a1a"/><circle cx="58" cy="48" r="1.5" fill="#0a0a1a"/>
      <ellipse cx="50" cy="57" rx="3" ry="2" fill="#9ca3af"/>
    </svg>`
  },
  {
    id: "cyber-bunny", label: "Cyber Bunny",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
  },
  {
    id: "plasma-dragon", label: "Plasma Dragon",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#1a0010"/>
      <ellipse cx="50" cy="55" rx="20" ry="18" fill="#991b1b"/>
      <circle cx="50" cy="42" r="17" fill="#dc2626"/>
      <polygon points="40,26 34,12 46,22" fill="#dc2626"/><polygon points="60,26 66,12 54,22" fill="#dc2626"/>
      <polygon points="40,26 34,12 46,22" fill="#fca5a5" opacity="0.4"/><polygon points="60,26 66,12 54,22" fill="#fca5a5" opacity="0.4"/>
      <ellipse cx="42" cy="42" rx="5" ry="6" fill="#1a0010"/><ellipse cx="58" cy="42" rx="5" ry="6" fill="#1a0010"/>
      <ellipse cx="42" cy="42" rx="3" ry="4" fill="#fbbf24"/><ellipse cx="58" cy="42" rx="3" ry="4" fill="#fbbf24"/>
      <path d="M43 52 L50 48 L57 52" stroke="#fca5a5" stroke-width="1.2" fill="none"/>
      <path d="M46 56 Q50 60 54 56" stroke="#1a0010" stroke-width="1.3" fill="none"/>
    </svg>`
  },
  {
    id: "holo-owl", label: "Holo Owl",
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`
  },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ic = ({ d, s = 15, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c || "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const V = {
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  mail: ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
 lock: ["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M12 3a4 4 0 0 0-4 4v4h8V7a4 4 0 0 0-4-4z"],
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  gear: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  upload: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  check: "M20 6 9 17l-5-5",
  x: ["M18 6 6 18", "M6 6l12 12"],
  trash: ["M3 6h18", "M19 6l-1 14H6L5 6", "M8 6V4h8v2"],
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeOff: ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94", "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19", "M1 1l22 22"],
  alert: ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",
  ban: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
  cal: ["M3 4h18v18H3V4z", "M16 2v4", "M8 2v4", "M3 10h18"],
  globe: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  at: "M20 12a8 8 0 1 1-3.56-6.67M22 12v1a2 2 0 0 1-4 0v-1",
  chev: "M9 18l6-6-6-6",
  back: "M19 12H5M12 5l-7 7 7 7",
  menu: ["M3 12h18", "M3 6h18", "M3 18h18"],
};

const IcoMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IcoX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

// ─── VALIDATION ───────────────────────────────────────────────────────────────
const vld = {
  name: v => !v?.trim() ? "Name is required" : v.trim().length < 2 ? "Too short" : "",
  bio: v => v?.length > 160 ? "Max 160 characters" : "",
  newPass: v => !v ? "Required" : v.length < 8 ? "Min 8 characters" : "",
  confPass: (v, np) => v !== np ? "Passwords don't match" : "",
};

// ─── PASSWORD STRENGTH ────────────────────────────────────────────────────────
const pwStrength = v => {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 8) s++;
  if (v.length >= 12) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(s, 4);
};
const PW_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#4ade80"];
const PW_LABELS = ["Weak", "Fair", "Good", "Strong"];

// ─── FIELD COMPONENT ─────────────────────────────────────────────────────────
// FIX: removed the stray `const [user, setUser] = useState(...)` that was
// inside Field — it was unused and caused a hook-in-wrong-scope issue.
function Field({ name, ico, label, value, onChange, ro, err, type = "text", max, ta, rows = 2, ph, opts }) {
  const [focused, setFocused] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const hasVal = value !== "" && value !== null && value !== undefined && value !== " ";
  const up = focused || hasVal || type === "date" || !!opts;
  const chars = value?.length || 0;
  const cls = ["pp-fw", ro ? "ro" : "", err ? "er" : (!err && hasVal && !ro ? "ok" : "")].filter(Boolean).join(" ");

  const emit = (val) => onChange && onChange({ target: { name, value: val } });

  return (
    <div className="pp-field">
      <div className={cls}>
        <span className="pp-fic"><Ic d={ico} s={13} /></span>
        {ta ? (
          <>
            <label className={`pp-fl ta${up ? " up" : ""}`}>{label}</label>
            <textarea
              name={name}
              className="pp-ta"
              value={value}
              rows={rows}
              onChange={e => emit(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? (ph || "") : ""}
            />
            {max && <span className={`pp-cc${chars > max * .82 ? " wn" : ""}${chars > max ? " ov" : ""}`}>{chars}/{max}</span>}
          </>
        ) : opts ? (
          <>
            <label className={`pp-fl${up ? " up" : ""}`}>{label}</label>
            <select
              name={name}
              className="pp-sel"
              value={value}
              onChange={e => emit(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            >
              {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <span className="pp-sel-arr"><Ic d={V.chev} s={11} /></span>
          </>
        ) : (
          <>
            <label className={`pp-fl${up ? " up" : ""}`}>{label}</label>
            <input
              name={name}
              className={`pp-inp${ro ? " ro" : ""}`}
              type={type === "password" ? (showPw ? "text" : "password") : type}
              value={value}
              readOnly={ro}
              onChange={e => !ro && emit(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? (ph || "") : ""}
            />
            {ro && <span className="pp-ro-badge">Read-only</span>}
            {type === "password" && (
              <span className="pp-fic" style={{ left: "auto", right: 9, cursor: "pointer" }}
                onMouseDown={e => { e.preventDefault(); setShowPw(p => !p); }}>
                <Ic d={showPw ? V.eyeOff : V.eye} s={12} />
              </span>
            )}
          </>
        )}
      </div>
      {err && <div className="pp-em"><Ic d={V.alert} s={11} />{err}</div>}
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
function Toggle({ title, sub, value, onChange }) {
  return (
    <div className="pp-tg-row">
      <div className="pp-tg-info">
        <div className="pp-tg-title">{title}</div>
        {sub && <div className="pp-tg-sub">{sub}</div>}
      </div>
      <button className={`pp-tg-sw${value ? " on" : ""}`} onClick={() => onChange(!value)} />
    </div>
  );
}

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile", label: "Profile", ico: V.user, sub: "Your public profile info" },
  // { id: "privacy", label: "Privacy & Security", ico: V.shield, sub: "Visibility and security settings" },
  { id: "account", label: "Account", ico: V.gear, sub: "Password and danger zone" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProfilePage() {

  const INITIAL_FORM = { name: "", username: "", bio: "", dob: "", gender: "", presetAvatarId: "" };
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [savedData, setSavedData] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [authUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("userInfo")); } catch { return null; }
  });
  const token = authUser?.token || localStorage.getItem("token") || null;
  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  // FIX: expose authUser as `user` so the navbar JSX (which uses `{user ? …}`)
  // works without a ReferenceError — same pattern as HomePage.jsx uses.
  const user = authUser;

  const [tab, setTab] = useState("profile");
  const [me, setMe] = useState(null);
  const [formErr, setFormErr] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const [pwForm, setPwForm] = useState({ curr: "", newPass: "", conf: "" });
  const [pwErr, setPwErr] = useState({});
  const [pwLoading, setPwLoading] = useState(false);

  const [priv, setPriv] = useState({
    twoFA: false, loginAlerts: true,
    showEmail: true, showPhone: false, readReceipts: true,
  });

  const [delModal, setDelModal] = useState(false);
  const [dispModal, setDispModal] = useState(false);
  const [delInput, setDelInput] = useState("");
  const [dispInput, setDispInput] = useState("");
  const [delLoading, setDelLoading] = useState(false);
  const [dispLoading, setDispLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const userToForm = (u) => ({
    name: u?.name || "",
    username: u?.username || "",
    bio: u?.bio || "",
    dob: u?.dob ? u.dob.split("T")[0] : "",
    gender: u?.gender || "",
    presetAvatarId: u?.presetAvatarId ?? u?.profilePic ?? "",
  });

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        const u = res.data;
        setMe(u);
        setPriv(p => ({
          ...p,
          twoFA: u.twoFA ?? p.twoFA,
          loginAlerts: u.loginAlerts ?? p.loginAlerts,
          showEmail: u.showEmail ?? p.showEmail,
          showPhone: u.showPhone ?? p.showPhone,
          readReceipts: u.readReceipts ?? p.readReceipts,
        }));
        const mapped = userToForm(u);
        setFormData(mapped);
        setSavedData(mapped);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchUser();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (Object.keys(formErr).length) runValidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const runValidate = () => {
    const e = {};
    const mn = vld.name(formData.name); if (mn) e.name = mn;
    const mb = vld.bio(formData.bio); if (mb) e.bio = mb;
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const handleLogout = () => {
    setPageLoading(true);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setTimeout(() => navigate("/login", { replace: true }), 900);
  };

  const handleSave = async () => {
    if (!runValidate()) return;
    setSaving(true);
    try {
      const res = await axios.put(
        `${API}/api/users/me`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res?.data ? userToForm(res.data) : { ...formData };
      setFormData(updated);
      setSavedData(updated);
      if (res?.data) setMe(res.data);
      setSelectedPreset(null);
      const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
      localStorage.setItem("userInfo", JSON.stringify({ ...stored, name: res?.data?.name || stored.name }));
      showToast("Profile saved!");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data;
      showToast(typeof msg === "string" ? msg : "Save failed. Try again.", "er");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...savedData });
    setSelectedPreset(null);
    setFormErr({});
  };

  const handlePwSave = async () => {
    const e = {};
    if (!pwForm.curr) e.curr = "Required";
    const m1 = vld.newPass(pwForm.newPass); if (m1) e.newPass = m1;
    const m2 = vld.confPass(pwForm.conf, pwForm.newPass); if (m2) e.conf = m2;
    setPwErr(e);
    if (Object.keys(e).length) return;
    setPwLoading(true);
    try {
      await axios.put(
        `${API}/api/users/me/password`,
        { currentPassword: pwForm.curr, newPassword: pwForm.newPass },
        { headers: authHeader() }
      );
      setPwForm({ curr: "", newPass: "", conf: "" });
      showToast("Password updated!");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data;
      showToast(typeof msg === "string" ? msg : "Incorrect current password.", "er");
    } finally {
      setPwLoading(false);
    }
  };

  const handlePrivSave = async () => {
    try {
      await axios.put(`${API}/api/users/me/privacy`, priv, { headers: authHeader() });
      showToast("Privacy settings saved!");
    } catch {
      showToast("Could not save settings.", "er");
    }
  };

  const handleDelete = async () => {
    if (delInput !== "DELETE") return;
    setPageLoading(true);
    setDelLoading(true);
    try {
      await axios.delete(`${API}/api/users/me`, { headers: authHeader() });
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    } catch (err) {
      showToast("Delete failed", "er");
      setPageLoading(false);
    } finally {
      setDelLoading(false);
    }
  };

  const handleDisable = async () => {
    if (dispInput !== "DISABLE") return;
    setPageLoading(true);
    setDispLoading(true);
    try {
      await axios.put(`${API}/api/users/me/disable`, {}, { headers: authHeader() });
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data;
      showToast(typeof msg === "string" ? msg : "Could not disable account.", "er");
      setPageLoading(false);
    } finally {
      setDispLoading(false);
    }
  };

  const handleAvatarConfirm = () => {
    if (!selectedPreset) return;
    setFormData(prev => ({ ...prev, presetAvatarId: selectedPreset }));
    setAvatarPickerOpen(false);
  };

  const initials = (formData.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const activeAvatarId = formData.presetAvatarId;
  const activeAvatarObj = PRESET_AVATARS.find(a => a.id === activeAvatarId);
  const fallbackImgSrc = me?.profilePic || me?.avatar || me?.pfp || null;
  const strength = pwStrength(pwForm.newPass);
  const activeTab = TABS.find(t => t.id === tab);

  return (
    <>
      <style>{CSS}</style>
      {pageLoading && <Loader />}

      {/* Background */}
      <div className="pp-bg">
        <div className="pp-bg-base" />
        <div className="pp-bg-grid" />
        {[[2,"8%","12%","0s","2.5s"],[3,"15%","45%","-1s","3s"],[2,"25%","78%","-.5s","2s"],
          [2,"55%","20%","-2s","3.5s"],[3,"70%","60%","-1.5s","2.8s"],[2,"40%","90%","-.8s","3.2s"]
        ].map(([w,t,l,d,dur],i) => (
          <div key={i} className="pp-star"
            style={{width:`${w}px`,height:`${w}px`,top:t,left:l,animationDelay:d,animationDuration:dur}} />
        ))}
        <div className="pp-orb" style={{width:"480px",height:"480px",background:"rgba(124,92,252,.17)",top:"-120px",right:"-80px"}} />
        <div className="pp-orb" style={{width:"380px",height:"380px",background:"rgba(56,189,248,.1)",bottom:"-60px",left:"-90px",animationDelay:"-7s",animationDirection:"alternate-reverse"}} />
      </div>

      {/* Navbar — uses `user` (= authUser) just like HomePage */}
      <nav className={scrolled ? "scrolled" : ""}>
        <Link to="/" className="nav-logo">
          <img src={logo} alt="TanGent" />
        </Link>

        <div className="nav-center">
          <Link to="/" className="nav-link">Home</Link>
          <a href="/#features" className="nav-link">Features</a>
          <a href="/#how" className="nav-link">How it works</a>
          <Link to="/friends" className="nav-link">Friends</Link>
          <a href="/#testimonials" className="nav-link">Reviews</a>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <div
                className="btn btn-ghost"
                style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                  background:"rgba(124,92,252,.12)", borderColor:"rgba(124,92,252,.3)" }}
                onClick={() => navigate("/profile")}
              >
                <span style={{ fontWeight:700, color:"#c4b5fd" }}>{user.name}</span>
              </div>
              <NotificationBell />
              <button onClick={handleLogout} className="btn btn-white" style={{ marginLeft:8 }}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => navigate("/login")}>Log In</button>
              <button className="btn btn-primary" onClick={() => navigate("/signup")}>Get Started →</button>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMobileMenu(m => !m)}>
          {mobileMenu ? <IcoX /> : <IcoMenu />}
        </button>
      </nav>

      {mobileMenu && (
        <div className="mobile-menu" style={{ display:"flex" }}>
          <Link to="/" onClick={() => setMobileMenu(false)}>Home</Link>
          <a href="/#features" onClick={() => setMobileMenu(false)}>Features</a>
          <a href="/#how" onClick={() => setMobileMenu(false)}>How it works</a>
          <Link to="/friends" onClick={() => setMobileMenu(false)}>Friends</Link>
          <a href="/#testimonials" onClick={() => setMobileMenu(false)}>Reviews</a>
          {user && (
            <a
              onClick={() => { setMobileMenu(false); handleLogout(); }}
              className="btn"
              style={{ width:"100%", 
                fontSize: "15px"
               }}
            >
              Logout
            </a>
          )}
        </div>
      )}

      {/* Page */}
      <div className="pp-page">
        <div className="pp-wrap">

          <div className={`pp-header${loaded ? " pp-loaded" : ""}`}>
            <h1 className="pp-title">Your <span className="pp-title-grad">Profile</span></h1>
            <p className="pp-subtitle">Manage your personal info, privacy, and account security.</p>
          </div>

          {/* Mobile tabs */}
          <div className="pp-mob-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`pp-mob-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                <Ic d={t.ico} s={13} />{t.label}
              </button>
            ))}
          </div>

          <div className={`pp-body${loaded ? " pp-loaded" : ""}`}>
            <div className="pp-layout">

              {/* Sidebar */}
              <aside className="pp-sidebar">
                <div className="pp-av-blk">
                  <div className="pp-av-w" style={{ cursor:"default" }}>
                    <div className="pp-av-ring">
                      <div className="pp-av-ri">
                        {activeAvatarObj ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: activeAvatarObj.svg }}
                            style={{ width:72, height:72, borderRadius:"50%", overflow:"hidden",
                              display:"flex", alignItems:"center", justifyContent:"center" }}
                          />
                        ) : fallbackImgSrc ? (
                          <img src={fallbackImgSrc} alt="avatar" className="pp-av-img" />
                        ) : (
                          <div className="pp-av-init">{initials}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pp-av-name">{formData.name || "Your Name"}</div>
                  <div className="pp-av-mail">{me?.email || "your@email.com"}</div>
                  <button className="pp-av-picker-btn"
                    onClick={() => { setSelectedPreset(formData.presetAvatarId || null); setAvatarPickerOpen(true); }}>
                    <Ic d={V.upload} s={12} /> Change Avatar
                  </button>
                  <div className="pp-av-badge" style={{ marginTop:8 }}>
                    <div className="pp-av-badge-dot" />Active
                  </div>
                </div>

                <div className="pp-sidenav">
                  {TABS.map(t => (
                    <div key={t.id} className={`pp-sidenav-item${tab === t.id ? " active" : ""}`}
                      onClick={() => setTab(t.id)}>
                      <span className="pp-sidenav-icon"><Ic d={t.ico} s={15} /></span>
                      {t.label}
                    </div>
                  ))}
                </div>

                <div className="pp-sidenav-divider" />

                <div className="pp-sidebar-footer">
                  <button className="pp-back-btn" onClick={() => navigate(-1)}>
                    <Ic d={V.back} s={13} /> Back
                  </button>
                </div>
              </aside>

              {/* Content panel */}
              <div className="pp-panel">
                <div className="pp-panel-head">
                  <div>
                    <div className="pp-panel-title">{activeTab?.label}</div>
                    <div className="pp-panel-sub">{activeTab?.sub}</div>
                  </div>
                  {isDirty && tab === "profile" && (
                    <div className="pp-unsaved">
                      <div className="pp-unsaved-dot" />Unsaved changes
                    </div>
                  )}
                </div>

                {/* ════ PROFILE TAB ════ */}
                {tab === "profile" && (
                  <>
                    <div className="pp-panel-body">
                      <div className="pp-slabel">Basic Info</div>
                      <div className="pp-g2" style={{ marginBottom:13 }}>
                        <Field name="name" ico={V.user} label="Display Name" value={formData.name}
                          onChange={handleChange} err={formErr.name} />
                        <Field name="username" ico={V.at} label="Username" value={formData.username}
                          onChange={e => handleChange({ target: { name:"username", value:e.target.value.toLowerCase() } })} />
                      </div>
                      <div style={{ marginBottom:13 }}>
                        <Field name="email" ico={V.mail} label="Email Address"
                          value={me?.email || ""} onChange={() => {}} ro />
                      </div>
                      <div className="pp-divider" />
                      <div className="pp-slabel">Additional Details</div>
                      <div className="pp-g2" style={{ marginBottom:13 }}>
                        <Field name="dob" ico={V.cal} label="Date of Birth (optional)"
                          value={formData.dob} onChange={handleChange} type="date" />
                        <Field name="gender" ico={V.user} label="Gender (optional)"
                          value={formData.gender} onChange={handleChange}
                          opts={[
                            {v:"",l:"Prefer not to say"},{v:"male",l:"Male"},{v:"female",l:"Female"},
                            {v:"nonbinary",l:"Non-binary"},{v:"other",l:"Other"},
                          ]} />
                      </div>
                      <Field name="bio" ico={V.globe} label="Bio (optional)" value={formData.bio}
                        onChange={handleChange} ta rows={3} max={160} err={formErr.bio}
                        ph="Tell people a bit about yourself..." />
                    </div>
                    <div className="pp-panel-footer">
                      <button className="pp-btn pp-btn-p" onClick={handleSave} disabled={!isDirty || saving}>
                        {saving ? <><div className="pp-spinner" />Saving...</> : <><Ic d={V.check} s={13} />Save Changes</>}
                      </button>
                      <button className="pp-btn pp-btn-g" onClick={handleCancel} disabled={!isDirty || saving}>
                        <Ic d={V.x} s={12} />Cancel
                      </button>
                    </div>
                  </>
                )}

                {/* ════ PRIVACY TAB ════ */}
                {tab === "privacy" && (
                  <>
                    <div className="pp-panel-body">
                      <div className="pp-slabel">Security</div>
                      <div className="pp-section">
                        <Toggle title="Two-Factor Authentication" sub="Secure your account with an authenticator app"
                          value={priv.twoFA} onChange={v => setPriv(p => ({...p, twoFA:v}))} />
                        <Toggle title="Login Alerts" sub="Get notified on new device sign-ins"
                          value={priv.loginAlerts} onChange={v => setPriv(p => ({...p, loginAlerts:v}))} />
                      </div>
                      <div className="pp-divider" />
                      <div className="pp-slabel">Visibility</div>
                      <div className="pp-section">
                        <Toggle title="Show Email to Others" sub="Let other TanGent users see your email"
                          value={priv.showEmail} onChange={v => setPriv(p => ({...p, showEmail:v}))} />
                        <Toggle title="Show Phone Number" sub="Visible to your contacts"
                          value={priv.showPhone} onChange={v => setPriv(p => ({...p, showPhone:v}))} />
                        <Toggle title="Read Receipts" sub="Let others know when you've read messages"
                          value={priv.readReceipts} onChange={v => setPriv(p => ({...p, readReceipts:v}))} />
                      </div>
                    </div>
                    <div className="pp-panel-footer">
                      <button className="pp-btn pp-btn-p" onClick={handlePrivSave}>
                        <Ic d={V.check} s={13} />Save Preferences
                      </button>
                    </div>
                  </>
                )}

                {/* ════ ACCOUNT TAB ════ */}
                {tab === "account" && (
                  <>
                    <div className="pp-panel-body">
                      <div className="pp-slabel">Change Password</div>
                      <div className="pp-g2" style={{ marginBottom:13 }}>
                        <Field name="curr" ico={V.lock} label="Current Password" value={pwForm.curr}
                          onChange={e => setPwForm(p => ({...p, curr:e.target.value}))} type="password" err={pwErr.curr} />
                        <Field name="newPass" ico={V.key} label="New Password" value={pwForm.newPass}
                          onChange={e => setPwForm(p => ({...p, newPass:e.target.value}))} type="password" err={pwErr.newPass} />
                      </div>
                      {pwForm.newPass.length > 0 && (
                        <div className="pp-pw-strength" style={{ marginBottom:13 }}>
                          <div className="pp-pw-bars">
                            {[0,1,2,3].map(i => (
                              <div key={i} className="pp-pw-bar"
                                style={{ background: i < strength ? PW_COLORS[strength-1] : undefined }} />
                            ))}
                          </div>
                          <div className="pp-pw-label" style={{ color:PW_COLORS[strength-1] || "var(--muted)" }}>
                            {strength > 0 ? PW_LABELS[strength-1] : ""}
                          </div>
                        </div>
                      )}
                      <div style={{ marginBottom:16 }}>
                        <Field name="conf" ico={V.check} label="Confirm New Password" value={pwForm.conf}
                          onChange={e => setPwForm(p => ({...p, conf:e.target.value}))} type="password" err={pwErr.conf} />
                      </div>
                      <div style={{ marginBottom:20 }}>
                        <button className="pp-btn pp-btn-p" onClick={handlePwSave} disabled={pwLoading}>
                          {pwLoading ? <><div className="pp-spinner" />Updating...</> : <><Ic d={V.lock} s={13} />Update Password</>}
                        </button>
                      </div>
                      <div className="pp-divider" />
                      <div className="pp-slabel" style={{ color:"#f87171" }}>Danger Zone</div>
                      <div className="pp-dz">
                        <div className="pp-dz-title">⚠ Irreversible Actions</div>
                        <div className="pp-dr">
                          <div>
                            <div className="pp-dr-title">Disable Account</div>
                            <div className="pp-dr-sub">Temporarily deactivate — re-enable anytime by logging back in.</div>
                          </div>
                          <button className="pp-btn pp-btn-w" onClick={() => setDispModal(true)}>
                            <Ic d={V.ban} s={12} />Disable
                          </button>
                        </div>
                        <div className="pp-dr">
                          <div>
                            <div className="pp-dr-title">Delete Account</div>
                            <div className="pp-dr-sub">Permanently removes your account and all data. Cannot be undone.</div>
                          </div>
                          <button className="pp-btn pp-btn-d" onClick={() => setDelModal(true)}>
                            <Ic d={V.trash} s={12} />Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="pp-panel-footer" />
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`pp-toast${toast.type === "er" ? " er" : ""}`}>
          <div className="pp-toast-ic">{toast.type === "er" ? "✕" : "✓"}</div>
          {toast.msg}
        </div>
      )}

      {/* Avatar picker modal */}
      {avatarPickerOpen && (
        <div className="pp-av-modal-ov" onClick={() => setAvatarPickerOpen(false)}>
          <div className="pp-av-modal" onClick={e => e.stopPropagation()}>
            <div className="pp-av-modal-title">Choose your avatar</div>
            <div className="pp-av-modal-sub">Pick one of the characters below — it will save with your profile.</div>
            <div className="pp-av-grid">
              {PRESET_AVATARS.map(av => (
                <div key={av.id}
                  className={`pp-av-option${selectedPreset === av.id ? " selected" : ""}`}
                  onClick={() => setSelectedPreset(av.id)}
                >
                  <div style={{ width:52, height:52, borderRadius:"50%", overflow:"hidden",
                    display:"flex", alignItems:"center", justifyContent:"center" }}
                    dangerouslySetInnerHTML={{ __html: av.svg }}
                  />
                  <span className="pp-av-option-label">{av.label}</span>
                </div>
              ))}
            </div>
            <div className="pp-av-modal-footer">
              <button className="pp-btn pp-btn-g"
                onClick={() => { setAvatarPickerOpen(false); setSelectedPreset(null); }}>
                <Ic d={V.x} s={12} /> Cancel
              </button>
              <button className="pp-btn pp-btn-p" onClick={handleAvatarConfirm} disabled={!selectedPreset}>
                <Ic d={V.check} s={13} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {delModal && (
        <div className="pp-modal-ov" onClick={() => { setDelModal(false); setDelInput(""); }}>
          <div className="pp-modal" onClick={e => e.stopPropagation()}>
            <div className="pp-modal-icon">💣</div>
            <div className="pp-modal-title">Delete Account?</div>
            <div className="pp-modal-desc">
              Permanently deletes your account, messages and all data.<br />
              This <strong style={{ color:"#f87171" }}>cannot be undone</strong>.
            </div>
            <div className="pp-modal-input-wrap">
              <label>Type <span>"DELETE"</span> to confirm</label>
              <input className="pp-modal-input" value={delInput}
                onChange={e => setDelInput(e.target.value)} placeholder="DELETE" autoFocus />
            </div>
            <div className="pp-modal-actions">
              <button className="pp-btn pp-btn-g"
                onClick={() => { setDelModal(false); setDelInput(""); }}>Keep Account</button>
              <button className="pp-btn pp-btn-dc"
                disabled={delInput !== "DELETE" || delLoading} onClick={handleDelete}>
                {delLoading ? <><div className="pp-spinner" />Deleting...</> : <><Ic d={V.trash} s={13} />Delete Forever</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable modal */}
      {dispModal && (
        <div className="pp-modal-ov" onClick={() => { setDispModal(false); setDispInput(""); }}>
          <div className="pp-modal warn" onClick={e => e.stopPropagation()}>
            <div className="pp-modal-icon warn">⏸</div>
            <div className="pp-modal-title">Disable Account?</div>
            <div className="pp-modal-desc">
              Your account will be hidden from other users.<br />
              You can re-enable it by logging back in at any time.
            </div>
            <div className="pp-modal-input-wrap">
              <label>Type <span className="warn">"DISABLE"</span> to confirm</label>
              <input className="pp-modal-input warn" value={dispInput}
                onChange={e => setDispInput(e.target.value)} placeholder="DISABLE" autoFocus />
            </div>
            <div className="pp-modal-actions">
              <button className="pp-btn pp-btn-g"
                onClick={() => { setDispModal(false); setDispInput(""); }}>Cancel</button>
              <button className="pp-btn pp-btn-wc"
                disabled={dispInput !== "DISABLE" || dispLoading} onClick={handleDisable}>
                {dispLoading ? <><div className="pp-spinner" />Disabling...</> : <><Ic d={V.ban} s={13} />Disable Account</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}