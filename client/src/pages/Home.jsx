import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/tg-logo.png";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import axios from "axios";
import NotificationBell from "../components/Notificationbell";
import { io } from "socket.io-client";


const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const sectionsRef = useRef([]);
  const revealRefs = useRef([]);
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    messages: 0,
  });


  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo"))
  );

  const [me, setMe] = useState(null);


  useEffect(() => {
    const fetchMe = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!userInfo?.token) return;

        const { data } = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        setMe(data);
      } catch (err) {
        console.log("error fetching user", err);
      }
    };

    fetchMe();
  }, []);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // initial HTTP fetch so stats show immediately on load
    axios.get(`${SOCKET_URL}/api/stats`)
      .then(({ data }) => setStats(data))
      .catch(console.error);

    // then subscribe for live updates
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("stats update", (data) => {
      setStats(data); // { users, messages }
    });

    return () => socket.disconnect(); // cleanup on unmount
  }, []);


  const handleLogout = () => {
    setPageLoading(true);
    localStorage.removeItem("userInfo");

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1000);
  };

  const handleLoginClick = () => {
    setPageLoading(true);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 700);
  };

  const handleSignupClick = () => {
    setPageLoading(true);

    setTimeout(() => {
      navigate("/signup", { replace: true });
    }, 700);
  };

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleStartChat = () => {
    const user = localStorage.getItem("userInfo");

    setPageLoading(true);

    setTimeout(() => {
      if (user) {
        navigate("/chat", { replace: true });
      } else {
        navigate("/signup", { replace: true });
      }
    }, 1000);
  };

  const handleHome = () => {

    setTimeout(() => {
      navigate("/", { replace: true });
    });
  };


  // Intersection Observer for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("on"), i * 90);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Chat bubble entrance animation
  useEffect(() => {
    const bubbles = document.querySelectorAll(".cc-bubble");
    bubbles.forEach((b, i) => {
      b.style.opacity = "0";
      b.style.transform = "translateY(8px)";
      b.style.transition = "all 0.4s ease";
      setTimeout(() => {
        b.style.opacity = "1";
        b.style.transform = "translateY(0)";
      }, 800 + i * 350);
    });
  }, []);

  // Active nav link on scroll
  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      sectionsRef.current.forEach((section) => {
        if (section && window.scrollY >= section.offsetTop - 100) {
          current = section.id;
        }
      });
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
        if (current === "" && link.getAttribute("href") === "#") {
          link.classList.add("active");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // SVG Icons (replace emojis)
  const SparklesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12" y2="18" />
    </svg>
  );
  const VideoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
  const PaperclipIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
  const SendIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
  const ChatIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
  const BoltIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
  const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
  const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
  const ImageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
  const GreenDotIcon = () => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <circle cx="4" cy="4" r="3" fill="#22c55e" />
    </svg>
  );
  const RobotIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
  const RocketIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
  const ClapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
  const CryingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
  const CatIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5c-6 0-8 4-8 8 0 3 2 6 8 6s8-3 8-6c0-4-2-8-8-8z" />
      <circle cx="8" cy="12" r="1" />
      <circle cx="16" cy="12" r="1" />
      <path d="M9 15c.5.5 1.5 1 3 1s2.5-.5 3-1" />
    </svg>
  );
  const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
  const CameraIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
  const KeyboardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <line x1="6" y1="8" x2="10" y2="8" />
      <line x1="14" y1="8" x2="18" y2="8" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="18" y2="12" />
      <line x1="6" y1="16" x2="18" y2="16" />
    </svg>
  );
  const HeartIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
  const HamburgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --bg:    #07071a;
          --p1:    #7c5cfc;
          --p2:    #38bdf8;
          --p3:    #c084fc;
          --text:  #eeeeff;
          --muted: rgba(180,170,240,0.5);
          --card:  rgba(255,255,255,0.04);
          --border:rgba(255,255,255,0.07);
        }

        body {
          font-family: "Plus Jakarta Sans", sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* ─── BACKGROUND ─── */
        .bg-wrap {
          position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        }
        .bg-base {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 75% 20%, rgba(124,92,252,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 10% 80%, rgba(56,189,248,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 55%, rgba(192,132,252,0.08) 0%, transparent 50%),
            #07071a;
        }
        .bg-grid {
          position: absolute; inset: 0; opacity: 0.25;
          background-image: radial-gradient(circle, rgba(140,120,255,0.35) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
        .bg-wave {
          position: absolute; bottom: 0; left: 0; right: 0; pointer-events: none;
        }
        .star {
          position: absolute; border-radius: 50%; background: white; animation: twinkle 3s ease-in-out infinite alternate;
        }
        @keyframes twinkle { from{opacity:0.2;transform:scale(1)} to{opacity:0.8;transform:scale(1.4)} }
        .orb {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.25;
          animation: floatOrb 10s ease-in-out infinite alternate;
        }
        @keyframes floatOrb { from{transform:translate(0,0)scale(1)} to{transform:translate(30px,-20px)scale(1.1)} }

        /* ─── NAVBAR ─── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 300;
          display: flex; align-items: center;
          padding: 0 6%;
          height: 68px;
          transition: all 0.3s;
          overflow: visible;
        }
        nav.scrolled {
          background: rgba(7,7,26,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo { display:flex;align-items:center;gap:10px;text-decoration:none; }
        .nav-logo img { width: 200px;}
  
        .nav-logo-text .dot { -webkit-text-fill-color:#E879F9; }

        .nav-center {
          display:flex;align-items:center;gap:4px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px;
          padding: 5px;
          margin: 0 auto;
        }
        .nav-link {
          padding: 8px 20px; border-radius: 50px;
          font-size:0.875rem;font-weight:600;color:var(--muted);
          text-decoration:none;transition:all 0.2s;white-space:nowrap;
        }
        .nav-link:hover { color:var(--text);background:rgba(255,255,255,0.07); }
        .nav-link.active { color:white;background:rgba(124,92,252,0.3);border:1px solid rgba(124,92,252,0.3); }

        .nav-right { display:flex;align-items:center;gap:10px;flex-shrink:0;position:relative;overflow:visible; }


        .btn {
          display:inline-flex;align-items:center;gap:7px;
          padding:10px 22px;border-radius:50px;
          font-family:inherit;font-size:0.875rem;font-weight:700;
          text-decoration:none;cursor:pointer;transition:all 0.2s;border:none;
        }
        .btn-ghost {
          background:transparent;color:var(--muted);
          border:1px solid rgba(255,255,255,0.12);
        }
        .btn-ghost:hover { color:var(--text);border-color:rgba(124,92,252,0.5);background:rgba(124,92,252,0.08); }
        .btn-primary {
          background:linear-gradient(135deg,#7c5cfc,#5b3ed4);
          color:white;box-shadow:0 4px 20px rgba(124,92,252,0.45);
        }
        .btn-primary:hover { background:linear-gradient(135deg,#8e72fd,#6d4fe0);transform:translateY(-2px);box-shadow:0 8px 30px rgba(124,92,252,0.55); }
        .btn-white {
          background:white;color:#0f0f1a;box-shadow:0 4px 20px rgba(0,0,0,0.3);
        }
        .btn-white:hover { transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,0.4); }

        /* ─── HAMBURGER ─── */
        .hamburger {
          display: none;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          margin-left: auto;
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
        .mobile-menu {
          display: none;
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          background: rgba(7,7,26,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 20px 6%;
          flex-direction: column;
          gap: 16px;
          z-index: 99;
        }
        .mobile-menu a {
          color: var(--muted);
          text-decoration: none;
          font-weight: 600;
          padding: 10px;
          border-radius: 8px;
        }
        .mobile-menu a:hover {
          color: var(--text);
          background: rgba(255,255,255,0.05);
        }

        /* ─── HERO ─── */
        .hero {
          position:relative;z-index:10;
          min-height:100vh;
          display:grid;grid-template-columns:1fr 1fr;
          align-items:center;gap:40px;
          padding:100px 6% 60px;
          max-width:1400px;margin:0 auto;
        }
        .hero-left { display:flex;flex-direction:column;align-items:flex-start; }
        .hero-pill {
          display:inline-flex;align-items:center;gap:8px;
          padding:6px 14px 6px 8px;border-radius:50px;margin-bottom:28px;
          background:rgba(124,92,252,0.12);border:1px solid rgba(124,92,252,0.3);
          font-size:0.78rem;font-weight:700;color:#c4b5fd;
        }
        .hero-pill-icon {
          width:24px;height:24px;border-radius:50%;
          background:linear-gradient(135deg,#7c5cfc,#c084fc);
          display:flex;align-items:center;justify-content:center;
        }
        .hero-title {
          font-size:clamp(2.8rem,5.5vw,5rem);
          font-weight:900;line-height:1.05;
          letter-spacing:-2px;margin-bottom:20px;
        }
        .hero-title .line-white { color:white;display:block; }
        .hero-title .line-grad {
          display:block;
          background:linear-gradient(90deg,#a78bfa,#7c5cfc,#38bdf8);
          background-size:200%;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          animation:gradShift 4s linear infinite;
        }
        @keyframes gradShift { from{background-position:0%} to{background-position:200%} }
        .hero-sub {
          font-size:1.05rem;color:var(--muted);
          line-height:1.75;max-width:420px;margin-bottom:36px;
        }
        .hero-btns { display:flex;gap:12px;flex-wrap:wrap;margin-bottom:44px; }
        .hero-trust {
          display:flex;align-items:center;gap:10px;
          font-size:0.8rem;color:var(--muted);
        }
        .hero-avatars { display:flex; }
        .hero-avatars .av {
          width:28px;height:28px;border-radius:50%;border:2px solid var(--bg);
          display:flex;align-items:center;justify-content:center;
          font-size:0.6rem;font-weight:700;color:white;margin-left:-6px;
        }
        .hero-avatars .av:first-child { margin-left:0; }

        /* ─── FLOATING UI RIGHT ─── */
        .hero-right { position:relative;height:540px; }
        .float-card {
          position:absolute;
          background:rgba(10,10,35,0.85);
          backdrop-filter:blur(20px);
          border-radius:20px;
          border:1px solid rgba(255,255,255,0.1);
          box-shadow:0 20px 60px rgba(0,0,0,0.5);
          padding:16px;
          animation:floatCard 6s ease-in-out infinite alternate;
        }
        @keyframes floatCard { from{transform:translateY(0)} to{transform:translateY(-14px)} }
        .chat-card {
          width:320px;top:40px;right:0;
          animation-delay:0s;
        }
        .notif-card {
          width:240px;top:0;left:-20px;
          padding:12px 16px;
          animation-delay:-2s;
          border-color:rgba(124,92,252,0.3);
        }
        .online-card {
          width:200px;bottom:60px;right:20px;
          padding:14px 16px;
          animation-delay:-4s;
          border-color:rgba(56,189,248,0.25);
        }
        .msg-count-card {
          bottom:120px;left:-10px;
          padding:12px 16px;
          animation-delay:-1s;
          border-color:rgba(192,132,252,0.25);
        }

        /* Chat card internals */
        .cc-header {
          display:flex;align-items:center;gap:10px;
          padding-bottom:12px;border-bottom:1px solid var(--border);margin-bottom:12px;
        }
        .cc-av {
          width:36px;height:36px;border-radius:50%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          font-size:0.72rem;font-weight:700;color:white;
        }
        .cc-name { font-size:0.82rem;font-weight:700;color:white; }
        .cc-status { font-size:0.68rem;color:#4ade80; }
        .cc-msgs { display:flex;flex-direction:column;gap:8px; }
        .cc-msg-row { display:flex;align-items:flex-end;gap:7px; }
        .cc-msg-row.me { flex-direction:row-reverse; }
        .cc-bubble {
          padding:8px 12px;border-radius:14px;font-size:0.72rem;line-height:1.5;max-width:175px;
        }
        .cc-bubble.them {
          background:rgba(255,255,255,0.08);color:rgba(240,232,255,0.85);
          border-bottom-left-radius:4px;
        }
        .cc-bubble.me {
          background:linear-gradient(135deg,#7c5cfc,#5b3ed4);color:white;
          border-bottom-right-radius:4px;
        }
        .cc-mini-av {
          width:22px;height:22px;border-radius:50%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:0.55rem;font-weight:700;color:white;
        }
        .cc-time { font-size:0.6rem;color:var(--muted);padding:0 2px; }

        .cc-input {
          margin-top:10px;padding-top:10px;border-top:1px solid var(--border);
          display:flex;align-items:center;gap:8px;
        }
        .cc-input-box {
          flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(124,92,252,0.2);
          border-radius:10px;padding:7px 10px;font-size:0.68rem;color:var(--muted);
        }
        .cc-send {
          width:28px;height:28px;border-radius:8px;
          background:linear-gradient(135deg,#7c5cfc,#5b3ed4);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }

        /* ─── STATS ─── */
        .stats-strip {
          position:relative;z-index:10;
          display:flex;justify-content:center;gap:0;
          padding:0 6% 80px;max-width:900px;margin:0 auto;
        }
        .stat {
          flex:1;text-align:center;padding:28px 20px;
          background:var(--card);border:1px solid var(--border);
          transition:all 0.25s;
        }
        .stat:first-child { border-radius:16px 0 0 16px; }
        .stat:last-child  { border-radius:0 16px 16px 0; }
        .stat:hover { background:rgba(124,92,252,0.08);border-color:rgba(124,92,252,0.3);transform:translateY(-4px); }
        .stat-n {
          font-size:2.2rem;font-weight:900;line-height:1;
          background:linear-gradient(135deg,#c4b5fd,#38bdf8);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        }
        .stat-l { font-size:0.78rem;color:var(--muted);margin-top:5px; }

        /* ─── FEATURES ─── */
        .features {
          position:relative;z-index:10;
          padding:80px 6%;max-width:1200px;margin:0 auto;
        }
        .sec-label {
          display:inline-flex;align-items:center;gap:6px;
          padding:5px 14px;border-radius:50px;margin-bottom:14px;
          background:rgba(124,92,252,0.1);border:1px solid rgba(124,92,252,0.25);
          font-size:0.72rem;font-weight:800;color:#c4b5fd;letter-spacing:0.06em;text-transform:uppercase;
        }
        .sec-title {
          font-size:clamp(2rem,3.5vw,2.8rem);font-weight:900;letter-spacing:-1.5px;margin-bottom:12px;
        }
        .sec-sub { font-size:0.95rem;color:var(--muted);line-height:1.75;max-width:480px; }

        .features-header { text-align:center;margin-bottom:52px; }
        .features-header .sec-sub { margin:0 auto; }

        .feat-grid {
          display:grid;grid-template-columns:repeat(3,1fr);gap:16px;
        }
        .feat-card {
          padding:30px;border-radius:20px;
          background:var(--card);border:1px solid var(--border);
          transition:all 0.3s;position:relative;overflow:hidden;
        }
        .feat-card::after {
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(124,92,252,0.05),transparent);
          opacity:0;transition:opacity 0.3s;
        }
        .feat-card:hover { transform:translateY(-6px);border-color:rgba(124,92,252,0.3); }
        .feat-card:hover::after { opacity:1; }
        .feat-ico {
          width:48px;height:48px;border-radius:14px;margin-bottom:16px;
          display:flex;align-items:center;justify-content:center;
        }
        .feat-name { font-size:1.05rem;font-weight:800;margin-bottom:9px; }
        .feat-desc { font-size:0.85rem;color:var(--muted);line-height:1.7; }

        /* ─── HOW IT WORKS ─── */
        .how {
          position:relative;z-index:10;
          padding:80px 6%;
          background:rgba(0,0,0,0.2);
          border-top:1px solid var(--border);border-bottom:1px solid var(--border);
        }
        .how-inner { max-width:1100px;margin:0 auto; }
        .how-header { text-align:center;margin-bottom:52px; }
        .how-grid {
          display:grid;grid-template-columns:repeat(4,1fr);gap:20px;
          position:relative;
        }
        .how-grid::before {
          content:'';position:absolute;top:44px;left:12%;right:12%;height:1px;
          background:linear-gradient(90deg,transparent,rgba(124,92,252,0.5),rgba(56,189,248,0.5),transparent);
        }
        .how-step { text-align:center;padding:0 10px; }
        .how-num {
          width:88px;height:88px;border-radius:50%;margin:0 auto 18px;
          display:flex;align-items:center;justify-content:center;
          font-size:1.5rem;font-weight:900;color:var(--p1);
          background:rgba(7,7,26,0.9);border:1px solid rgba(124,92,252,0.4);
          box-shadow:0 0 30px rgba(124,92,252,0.18);
          position:relative;z-index:1;
        }
        .how-title { font-size:1rem;font-weight:800;margin-bottom:8px; }
        .how-desc { font-size:0.82rem;color:var(--muted);line-height:1.65; }

        /* ─── TESTIMONIALS ─── */
        .testimonials {
          position:relative;z-index:10;
          padding:80px 6%;max-width:1200px;margin:0 auto;
        }
        .test-header { text-align:center;margin-bottom:52px; }
        .test-grid {
          display:grid;grid-template-columns:repeat(3,1fr);gap:18px;
        }
        .test-card {
          padding:28px;border-radius:20px;
          background:var(--card);border:1px solid var(--border);
          transition:all 0.3s;
        }
        .test-card:hover { border-color:rgba(124,92,252,0.3);transform:translateY(-4px); }
        .test-quote {
          font-size:2rem;line-height:1;margin-bottom:14px;
          background:linear-gradient(135deg,#7c5cfc,#38bdf8);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          font-family:serif;
        }
        .test-text { font-size:0.875rem;color:rgba(240,232,255,0.78);line-height:1.75;margin-bottom:20px;font-style:italic; }
        .test-author { display:flex;align-items:center;gap:12px; }
        .test-av {
          width:40px;height:40px;border-radius:50%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;color:white;
        }
        .test-name { font-size:0.85rem;font-weight:800; }
        .test-role { font-size:0.72rem;color:var(--muted); }
        .test-stars { color:#f59e0b;font-size:0.75rem;letter-spacing:1px;margin-top:2px; }

        /* ─── CTA ─── */
        .cta {
          position:relative;z-index:10;
          padding:80px 6%;text-align:center;
        }
        .cta-inner {
          max-width:680px;margin:0 auto;padding:56px 44px;
          border-radius:28px;
          background:rgba(124,92,252,0.06);
          border:1px solid rgba(124,92,252,0.22);
          box-shadow:0 0 80px rgba(124,92,252,0.1);
          position:relative;overflow:hidden;
        }
        .cta-inner::before {
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(124,92,252,0.8),rgba(56,189,248,0.6),transparent);
        }
        .cta-emoji { margin-bottom:16px;display:block;animation:bounce 3s ease-in-out infinite; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .cta-title { font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:900;letter-spacing:-1px;margin-bottom:12px; }
        .cta-sub { font-size:0.95rem;color:var(--muted);margin-bottom:32px;line-height:1.7; }
        .cta-btns { display:flex;gap:12px;justify-content:center;flex-wrap:wrap; }
        .cta-note { font-size:0.72rem;color:var(--muted);margin-top:16px; }
        
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}


        /* ─── FOOTER ─── */
        footer {
          position:relative;z-index:10;
          border-top:1px solid var(--border);
          background:rgba(0,0,0,0.35);
          padding:32px 6%;
        }
        .footer-inner {
          max-width:1200px;margin:0 auto;
          display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;
        }
        .footer-logo { display:flex;align-items:center;gap:10px;text-decoration:none; }
        .footer-logo img { width:200px;}
        .footer-logo-text { font-size:1rem;font-weight:900;-webkit-background-clip:}
        .footer-logo-text .dot { -webkit-text-fill-color:#E879F9; }

        .footer-links { display:flex;gap:24px;flex-wrap:wrap; }
        .footer-link { font-size:0.82rem;color:var(--muted);text-decoration:none;transition:color 0.2s; }
        .footer-link:hover { color:var(--text); }

        .footer-socials { display:flex;gap:8px; }
        .social {
          width:34px;height:34px;border-radius:10px;
          background:rgba(255,255,255,0.05);border:1px solid var(--border);
          display:flex;align-items:center;justify-content:center;
          font-size:0.9rem;text-decoration:none;transition:all 0.2s;cursor:pointer;
        }
        .social:hover { background:rgba(124,92,252,0.18);border-color:rgba(124,92,252,0.4);transform:translateY(-2px); }

        .footer-copy { font-size:0.75rem;color:rgba(180,170,240,0.35);margin-top:20px;width:100%;text-align:center; }

        /* ─── ANIMATIONS ─── */
        .reveal { opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease; }
        .reveal.on { opacity:1;transform:translateY(0); }

        /* ─── MOBILE RESPONSIVENESS (Enhanced) ─── */
        @media(max-width:900px){
          .hero { grid-template-columns:1fr;padding-top:120px;text-align:center; }
          .hero-left { align-items:center; }
          .hero-right { display:none; }
          .feat-grid { grid-template-columns:1fr 1fr; }
          .how-grid { grid-template-columns:1fr 1fr;gap:30px; }
          .how-grid::before { display:none; }
          .test-grid { grid-template-columns:1fr; }
          .nav-center { display:none; }
          .hamburger { display: block; }
          .mobile-menu { display: flex; }
          .footer-inner { flex-direction:column;align-items:center;text-align:center; }
          .footer-links { justify-content:center; }
        }

        @media(max-width:600px){
          nav { padding: 0 4%; height: 60px; }
          .nav-logo img { width: 120px; }
          .btn { padding: 6px 12px; font-size: 0.75rem; }
          .btn-ghost { padding: 6px 12px; }
          .hamburger svg { width: 22px; height: 22px; }
          .mobile-menu { padding: 16px 4%; }
          .hero { padding-top: 100px; }
          .hero-title { font-size: 2.2rem; }
          .hero-sub { font-size: 0.9rem; max-width: 100%; }
          .hero-btns .btn { padding: 10px 18px; font-size: 0.85rem; }
          .hero-trust { font-size: 0.7rem; gap: 6px; }
          .hero-avatars .av { width: 24px; height: 24px; font-size: 0.5rem; }
          .stats-strip { flex-direction: column; gap: 0; padding-bottom: 40px; }
          .stat:first-child, .stat:last-child { border-radius: 0; }
          .stat:first-child { border-radius: 16px 16px 0 0; }
          .stat:last-child { border-radius: 0 0 16px 16px; }
          .feat-grid { grid-template-columns: 1fr; gap: 12px; }
          .feat-card { padding: 24px; }
          .how-grid { grid-template-columns: 1fr; gap: 24px; }
          .how-step { max-width: 300px; margin: 0 auto; }
          .test-card { padding: 20px; }
          .cta-inner { padding: 36px 24px; }
          .footer-logo img { width: 120px; }
          .footer-links { gap: 16px; }
        }

        @media(max-width:480px){
          .nav-logo img { width: 100px; }
          .btn { padding: 5px 10px; font-size: 0.7rem; }
          .btn-ghost { padding: 5px 10px; }
          .hero-title { font-size: 1.8rem; }
          .hero-pill { font-size: 0.7rem; padding: 4px 12px 4px 8px; }
          .hero-pill-icon { width: 20px; height: 20px; }
          .hero-btns .btn { padding: 8px 14px; font-size: 0.8rem; }
          .stat-n { font-size: 1.6rem; }
          .stat-l { font-size: 0.7rem; }
          .sec-title { font-size: 1.8rem; }
          .sec-sub { font-size: 0.85rem; }
          .feat-name { font-size: 0.95rem; }
          .feat-desc { font-size: 0.8rem; }
          .how-num { width: 70px; height: 70px; font-size: 1.2rem; }
          .how-title { font-size: 0.9rem; }
          .how-desc { font-size: 0.75rem; }
          .test-text { font-size: 0.8rem; }
        }
      `}</style>

      {pageLoading && <Loader />}

      {/* BACKGROUND */}
      <div className="bg-wrap">
        <div className="bg-base"></div>
        <div className="bg-grid"></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "8%", left: "12%", animationDelay: "0s", animationDuration: "2.5s" }}></div>
        <div className="star" style={{ width: "3px", height: "3px", top: "15%", left: "45%", animationDelay: "-1s", animationDuration: "3s" }}></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "25%", left: "78%", animationDelay: "-0.5s", animationDuration: "2s" }}></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "55%", left: "20%", animationDelay: "-2s", animationDuration: "3.5s" }}></div>
        <div className="star" style={{ width: "3px", height: "3px", top: "70%", left: "60%", animationDelay: "-1.5s", animationDuration: "2.8s" }}></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "40%", left: "90%", animationDelay: "-0.8s", animationDuration: "3.2s" }}></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "82%", left: "35%", animationDelay: "-3s", animationDuration: "2.2s" }}></div>
        <div className="star" style={{ width: "3px", height: "3px", top: "5%", left: "65%", animationDelay: "-1.2s", animationDuration: "4s" }}></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "90%", left: "80%", animationDelay: "-0.3s", animationDuration: "2.6s" }}></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "48%", left: "5%", animationDelay: "-2.5s", animationDuration: "3s" }}></div>
        <div className="star" style={{ width: "1.5px", height: "1.5px", top: "62%", left: "52%", animationDelay: "-1.8s", animationDuration: "2.4s", background: "rgba(124,92,252,0.8)" }}></div>
        <div className="star" style={{ width: "2px", height: "2px", top: "33%", left: "30%", animationDelay: "-0.6s", animationDuration: "3.8s", background: "rgba(56,189,248,0.7)" }}></div>
        <div className="orb" style={{ width: "500px", height: "500px", background: "rgba(124,92,252,0.2)", top: "-150px", right: "-100px", animationDelay: "0s" }}></div>
        <div className="orb" style={{ width: "400px", height: "400px", background: "rgba(56,189,248,0.13)", bottom: "-100px", left: "-80px", animationDelay: "-5s", animationDirection: "alternate-reverse" }}></div>
        <div className="orb" style={{ width: "300px", height: "300px", background: "rgba(192,132,252,0.1)", top: "40%", left: "40%", animationDelay: "-3s" }}></div>
        <svg className="bg-wave" viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ height: "200px", opacity: 0.4 }}>
          <path d="M0,100 C200,160 400,40 600,100 C800,160 1000,40 1200,100 C1300,130 1380,90 1440,100 L1440,200 L0,200 Z" fill="none" stroke="rgba(124,92,252,0.35)" strokeWidth="1.5" />
          <path d="M0,130 C300,60 500,170 800,110 C1000,70 1200,150 1440,120 L1440,200 L0,200 Z" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />
        </svg>
      </div>

      {/* NAVBAR */}
      <nav ref={navRef} className={scrolled ? "scrolled" : ""}>
        <Link onClick={handleHome} className="nav-logo">
          <img src={logo} alt="TanGent.chat logo" />
        </Link>

        <div className="nav-center">
          <a href="/" className="nav-link active">Home</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How it works</a>
          <a href="/friends" className="nav-link">Friends</a>
          <a href="#testimonials" className="nav-link">Reviews</a>
        </div>

        {/* NAV RIGHT */}
        <div className="nav-right">
          {user ? (
            // when logged in: show user name/avatar + Notification Bell + Logout
            <>
              <>
                <div
                  className="btn btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                  onClick={() => navigate("/profile")}
                >


                  <span style={{ fontWeight: 600 }}>
                    {user.name}
                  </span>
                </div>
              </>

              {/* 🔔 Notification Bell — drop-in, fully self-contained */}
              <NotificationBell />

              <button
                onClick={handleLogout}
                className="btn btn-white"
                style={{ marginLeft: 8 }}
                title="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            // not logged in: show Login / Signup
            <>
              <button onClick={handleLoginClick} className="btn btn-ghost">
                Log In
              </button>

              <button onClick={handleSignupClick} className="btn btn-primary">
                Get Started →
              </button>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a onClick={() => {
            setMobileMenuOpen(false);
            handleHome();

          }}>Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="/friends" onClick={() => setMobileMenuOpen(false)}>Friends</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
          {user && (
            <a
              onClick={() => {
                setMobileMenuOpen(false);
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

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-pill">
            <div className="hero-pill-icon"><SparklesIcon /></div>
            With AI Smart Chatbot &amp; E2E Encryption
          </div>

          <h1 className="hero-title">
            <span className="line-white">Talk different.</span>
            <span className="line-grad">Connect deeper.</span>
          </h1>

          <p className="hero-sub">
            TanGent.chat is built for people who go off-script. Real-time messaging, group rooms, encrypted file sharing — all wrapped in one dark, beautiful app.
          </p>

          <div className="hero-btns">
            <button
              onClick={handleStartChat}
              className="btn btn-primary"
              style={{ padding: "14px 30px", fontSize: "1rem", borderRadius: "14px" }}
            >
              <ChatIcon /> Start Chatting — Free
            </button>
            <a href="#how" className="btn btn-ghost" style={{ padding: "14px 26px", fontSize: "1rem", borderRadius: "14px" }}>See how it works</a>
          </div>

          <div className="hero-trust">
            <div className="hero-avatars">
              <div className="av" style={{ background: "linear-gradient(135deg,#7c5cfc,#38bdf8)" }}>ZK</div>
              <div className="av" style={{ background: "linear-gradient(135deg,#e879f9,#f43f5e)" }}>AX</div>
              <div className="av" style={{ background: "linear-gradient(135deg,#f59e0b,#22c55e)" }}>JP</div>
              <div className="av" style={{ background: "linear-gradient(135deg,#38bdf8,#7c5cfc)" }}>SR</div>
            </div>
            <span>Joined by <strong style={{ color: "white" }}>2.4M+</strong> people worldwide</span>
          </div>
        </div>

        {/* Floating chat UI */}
        <div className="hero-right">
          {/* Main chat card */}
          <div className="float-card chat-card">
            <div className="cc-header">
              <div className="cc-av" style={{ background: "linear-gradient(135deg,#7c5cfc,#38bdf8)" }}>ZK</div>
              <div>
                <div className="cc-name">Zara Khan</div>
                <div className="cc-status" style={{ display: "flex", alignItems: "center" }}><GreenDotIcon /> Online now</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "10px", color: "var(--muted)" }}>
                <PhoneIcon /> <VideoIcon />
              </div>
            </div>
            <div className="cc-msgs">
              <div className="cc-msg-row">
                <div className="cc-mini-av" style={{ background: "linear-gradient(135deg,#7c5cfc,#38bdf8)" }}>ZK</div>
                <div>
                  <div className="cc-bubble them">Bro TanGent is actually 🔥 </div>
                  <div className="cc-time">2:41 PM</div>
                </div>
              </div>
              <div className="cc-msg-row me">
                <div>
                  <div className="cc-bubble me">Real-time + encrypted 😭🔐 </div>
                  <div className="cc-time" style={{ textAlign: "right" }}>2:42 PM</div>
                </div>
              </div>
              <div className="cc-msg-row">
                <div className="cc-mini-av" style={{ background: "linear-gradient(135deg,#7c5cfc,#38bdf8)" }}>ZK</div>
                <div>
                  <div className="cc-bubble them" style={{ display: "flex", alignItems: "center" }}>This hits different fr 🚀 </div>
                  <div className="cc-time">2:42 PM</div>
                </div>
              </div>
              <div className="cc-msg-row me">
                <div>
                  <div className="cc-bubble me">Groups work flawlessly too 💖</div>
                  <div className="cc-time" style={{ textAlign: "right" }}>2:43 PM</div>
                </div>
              </div>
            </div>
            <div className="cc-input">
              <div className="cc-input-box">Type a message...</div>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}><PaperclipIcon /></span>
              <div className="cc-send">
                <SendIcon />
              </div>
            </div>
          </div>

          {/* Notification card */}
          <div className="float-card notif-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c5cfc", boxShadow: "0 0 8px #7c5cfc", flexShrink: 0 }}></div>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>New Message</span>
              <span style={{ fontSize: "0.62rem", color: "var(--muted)", marginLeft: "auto" }}>now</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "10px" }}>
              <div className="cc-av" style={{ background: "linear-gradient(135deg,#e879f9,#f43f5e)", width: "30px", height: "30px", fontSize: "0.6rem" }}>AX</div>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "white" }}>Alex Chen</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "3PX" }}><PaperclipIcon />Sent a file </div>
              </div>
            </div>
          </div>

          {/* Online users card */}
          <div className="float-card online-card">
            <div style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: "10px" }}>Online Friends</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ position: "relative" }}>
                  <div className="cc-av" style={{ background: "linear-gradient(135deg,#7c5cfc,#38bdf8)", width: "26px", height: "26px", fontSize: "0.58rem" }}>ZK</div>
                  <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", border: "1.5px solid #07071a" }}></div>
                </div>
                <span style={{ fontSize: "0.72rem", color: "rgba(240,232,255,0.8)" }}>Zara Khan</span>
                <span style={{ fontSize: "0.65rem", color: "#4ade80", marginLeft: "auto", display: "flex", alignItems: "center", gap: "3px" }}><GreenDotIcon /> Active</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ position: "relative" }}>
                  <div className="cc-av" style={{ background: "linear-gradient(135deg,#f59e0b,#22c55e)", width: "26px", height: "26px", fontSize: "0.58rem" }}>JP</div>
                  <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", border: "1.5px solid #07071a" }}></div>
                </div>
                <span style={{ fontSize: "0.72rem", color: "rgba(240,232,255,0.8)" }}>Jay Patel</span>
                <span style={{ fontSize: "0.65rem", color: "#4ade80", marginLeft: "auto", display: "flex", alignItems: "center", gap: "3px" }}><GreenDotIcon /> Active</span>
              </div>
            </div>
          </div>

          {/* Message count badge */}
          <div className="float-card msg-count-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "rgba(124,92,252,0.2)", border: "1px solid rgba(124,92,252,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChatIcon />
              </div>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "white", lineHeight: "1" }}>10+</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>msgs today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 6% 72px", maxWidth: "960px", margin: "0 auto" }}>
        <div className="stats-strip">
          <div className="stat reveal" ref={(el) => (revealRefs.current[0] = el)}>
            <div className="stat-n">{stats.users}</div>
            <div className="stat-l">Active Users</div>
          </div>
          <div className="stat reveal" ref={(el) => (revealRefs.current[1] = el)}>
            <div className="stat-n">Only for</div>
            <div className="stat-l">Indians</div>
          </div>
          <div className="stat reveal" ref={(el) => (revealRefs.current[2] = el)}>
            <div className="stat-n">{stats.messages}</div>
            <div className="stat-l">Messages / Day</div>
          </div>
          <div className="stat reveal" ref={(el) => (revealRefs.current[3] = el)}>
            <div className="stat-n">99.9%</div>
            <div className="stat-l">Uptime</div>
          </div>
          {/* <div className="stat reveal" ref={(el) => (revealRefs.current[4] = el)}>
            <div className="stat-n">4.9★</div>
            <div className="stat-l">User Rating</div>
          </div> */}
        </div>
      </div>

      {/* FEATURES */}
      <section className="features" id="features" ref={(el) => (sectionsRef.current[0] = el)}>
        <div className="features-header">
          <div className="sec-label"><SparklesIcon /> Features</div>
          <h2 className="sec-title">Everything you need</h2>
          <p className="sec-sub">TanGent is packed with features that make real-time messaging actually feel good.</p>
        </div>
        <div className="feat-grid">
          <div className="feat-card reveal" ref={(el) => (revealRefs.current[5] = el)}>
            <div className="feat-ico" style={{ background: "rgba(124,92,252,0.15)" }}><BoltIcon /></div>
            <div className="feat-name">Real-time Messaging</div>
            <div className="feat-desc">Instant delivery with WebSockets. Messages appear the moment you hit send — zero lag, zero delay.</div>
          </div>
          {/* <div className="feat-card reveal" ref={(el) => (revealRefs.current[6] = el)}>
            <div className="feat-ico" style={{ background: "rgba(56,189,248,0.15)" }}><UsersIcon /></div>
            <div className="feat-name">Group Chat Rooms</div>
            <div className="feat-desc">Create groups for any crew — friends, teams, or communities. Invite, manage, and chat in one place.</div>
          </div> */}
          <div className="feat-card reveal" ref={(el) => (revealRefs.current[7] = el)}>
            <div className="feat-ico" style={{ background: "rgba(232,121,249,0.15)" }}><LockIcon /></div>
            <div className="feat-name">E2E Encrypted</div>
            <div className="feat-desc">Every message is encrypted before it leaves your device. Nobody — not even us — can read your chats.</div>
          </div>
          {/* <div className="feat-card reveal" ref={(el) => (revealRefs.current[8] = el)}>
            <div className="feat-ico" style={{ background: "rgba(245,158,11,0.15)" }}><PaperclipIcon /></div>
            <div className="feat-name">File & Image Sharing</div>
            <div className="feat-desc">Drop photos, videos and docs straight into chat. Powered by Cloudinary for fast, reliable uploads.</div>
          </div> */}
          <div className="feat-card reveal" ref={(el) => (revealRefs.current[9] = el)}>
            <div className="feat-ico" style={{ background: "rgba(34,197,94,0.15)" }}><GreenDotIcon /></div>
            <div className="feat-name">Online Presence</div>
            <div className="feat-desc">See who's active, typing, or away in real time. Green dots, typing indicators, and read receipts.</div>
          </div>
          {/* <div className="feat-card reveal" ref={(el) => (revealRefs.current[10] = el)}>
            <div className="feat-ico" style={{ background: "rgba(124,92,252,0.15)" }}><RobotIcon /></div>
            <div className="feat-name">AI Smart Replies</div>
            <div className="feat-desc">AI-powered reply suggestions based on context. Reply smarter and faster without losing your voice.</div>
          </div> */}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how" ref={(el) => (sectionsRef.current[1] = el)}>
        <div className="how-inner">
          <div className="how-header">
            <div className="sec-label"><SparklesIcon /> How it works</div>
            <h2 className="sec-title">Live in 60 seconds</h2>
            <p className="sec-sub" style={{ margin: "0 auto", textAlign: "center" }}>No downloads. No credit card. Just sign up and go.</p>
          </div>
          <div className="how-grid">
            <div className="how-step reveal" ref={(el) => (revealRefs.current[11] = el)}>
              <div className="how-num">1</div>
              <div className="how-title">Create Account</div>
              <div className="how-desc">Sign up with email or Google. Takes 10 seconds flat, no card required.</div>
            </div>
            <div className="how-step reveal" ref={(el) => (revealRefs.current[12] = el)}>
              <div className="how-num">2</div>
              <div className="how-title">Add Friends</div>
              <div className="how-desc">Search by username or email. Send a request and connect instantly.</div>
            </div>
            <div className="how-step reveal" ref={(el) => (revealRefs.current[13] = el)}>
              <div className="how-num">3</div>
              <div className="how-title">Create Groups</div>
              <div className="how-desc">Build group rooms for any crew. Name it, invite members, go live.</div>
            </div>
            <div className="how-step reveal" ref={(el) => (revealRefs.current[14] = el)}>
              <div className="how-num">4</div>
              <div className="how-title">Start Chatting</div>
              <div className="how-desc">Send messages, share files, see who's online — fully encrypted.</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials" ref={(el) => (sectionsRef.current[2] = el)}>
        <div className="test-header">
          <div className="sec-label"><SparklesIcon /> What people say</div>
          <h2 className="sec-title">Don't take our word for it</h2>
          <p className="sec-sub" style={{ margin: "0 auto", textAlign: "center" }}>We've asked real users what they think. Here's what they had to say.</p>
        </div>
        <div className="test-grid">
          <div className="test-card reveal" ref={(el) => (revealRefs.current[15] = el)}>
            <div className="test-quote">"</div>
            <div className="test-text">TanGent replaced WhatsApp for our entire squad. The UI is on another level — dark, clean, blazing fast. We're not going back.</div>
            <div className="test-author">
              <div className="test-av" style={{ background: "linear-gradient(135deg,#7c5cfc,#38bdf8)" }}>SR</div>
              <div>
                <div className="test-name">Sneha Rao</div>
                <div className="test-role">UI Designer, Bangalore</div>
                <div className="test-stars">★★★★★</div>
              </div>
              <div style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: "50px", background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.25)", fontSize: "0.68rem", color: "#c4b5fd", fontWeight: 700 }}>Verified</div>
            </div>
          </div>
          <div className="test-card reveal" ref={(el) => (revealRefs.current[16] = el)}>
            <div className="test-quote">"</div>
            <div className="test-text">The group chat feature is incredible. I manage 3 teams through TanGent and it's smoother than Slack. File sharing alone is worth it.</div>
            <div className="test-author">
              <div className="test-av" style={{ background: "linear-gradient(135deg,#e879f9,#f43f5e)" }}>MK</div>
              <div>
                <div className="test-name">Marcus Kim</div>
                <div className="test-role">Product Manager, NYC</div>
                <div className="test-stars">★★★★★</div>
              </div>
              <div style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: "50px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", fontSize: "0.68rem", color: "#4ade80", fontWeight: 700 }}>Verified</div>
            </div>
          </div>
          <div className="test-card reveal" ref={(el) => (revealRefs.current[17] = el)}>
            <div className="test-quote">"</div>
            <div className="test-text">Encryption and privacy are top-tier. I finally feel safe messaging people. Plus the alien cat mascot is adorable <CryingIcon /> 10/10.</div>
            <div className="test-author">
              <div className="test-av" style={{ background: "linear-gradient(135deg,#f59e0b,#22c55e)" }}>PD</div>
              <div>
                <div className="test-name">Priya Desai</div>
                <div className="test-role">Cybersecurity Analyst</div>
                <div className="test-stars">★★★★★</div>
              </div>
              <div style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: "50px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", fontSize: "0.68rem", color: "#7dd3fc", fontWeight: 700 }}>Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <a href="#" className="footer-logo">
            <img src={logo} alt="TanGent.chat logo" />

          </a>

          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#how" className="footer-link">How it works</a>
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Contact</a>
            <a href="/friends" className="footer-link">Friends</a>
          </div>

          <div className="footer-socials">
            <div className="social" title="Twitter"><XIcon /></div>
            <div className="social" title="Instagram"><CameraIcon /></div>
            <div className="social" title="Discord"><ChatIcon /></div>
            <div className="social" title="GitHub"><KeyboardIcon /></div>
          </div>
        </div>
        <div className="footer-copy">© 2026 TanGent.fun — Made with <HeartIcon /> by Kushal  ·  All rights reserved</div>
      </footer>
    </>
  );
};

export default HomePage;