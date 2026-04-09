import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/tg-logo.png";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const StarField = () => {
  const stars = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.2 + 0.6,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s) => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          borderRadius: '50%', background: 'rgba(255,255,255,0.85)', opacity: 0.7,
        }} />
      ))}
    </div>
  );
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user?.token) {
      navigate("/chat", { replace: true });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // ✅ Save user + token
      localStorage.setItem("userInfo", JSON.stringify(data));

      // ✅ Redirect to chat
      setPageLoading(true);

      setTimeout(() => {
        navigate("/chat");
      }, 1000);

    } catch (error) {
      console.log(error);
      alert("Server error");
    }

    setIsLoading(false);
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* NO SCROLLBAR */
        html, body, #root {
          height: 100%;
          overflow: hidden; /* scrollbar removed as requested */
          background: #080818;
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 28px;
          position: relative;
          background: #080818;
          font-family: 'DM Sans', sans-serif;
          color: white;
          padding: 28px;
        }

        /* LEFT PANEL (will be hidden on small screens) */
        .left-panel {
          display: block;
          padding: 0 8px;
          position: relative;
          z-index: 10;
        }
        @media (min-width: 768px) {
          .login-root {
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 56px;
            padding: 40px;
          }
          .left-panel {
            flex: 1 1 0%;
            max-width: 720px;
            padding: 0 28px;
          }
        }
        @media (max-width: 767px) {
          .left-panel { display: none; } /* remove left content on mobile */
        }

        .site-logo { display:flex; align-items:center; gap:12px; margin-bottom: 22px; }
        .site-logo img { width:200px;  }
        .site-logo { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; color:white; letter-spacing:0.2px; }

        .hero-title { font-family:'Syne',sans-serif; font-weight:800; font-size: clamp(40px, 6vw, 64px); line-height:1.05; color:white; margin-bottom:8px; }
        .hero-gradient { background: linear-gradient(90deg, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-sub { color: rgba(255,255,255,0.46); font-size: 15px; line-height:1.6; max-width: 480px; font-weight:300; margin-bottom:14px; }

        .pills { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
        .pill { padding:6px 12px; border-radius:999px; font-size:12px; color: rgba(255,255,255,0.48); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }

        .chat-preview { display:flex; flex-direction:column; gap:10px; margin-top:8px; }
        .msg-row { display:flex; align-items:flex-end; gap:10px; }
        .msg-row.right { justify-content:flex-end; }
        .avatar { width:28px; height:28px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:white; }
        .bubble { padding:9px 14px; font-size:13px; max-width:280px; line-height:1.45; }
        .bubble.left { background: rgba(108,99,255,0.10); border: 1px solid rgba(108,99,255,0.22); border-radius: 14px 14px 14px 4px; color: rgba(255,255,255,0.9); }
        .bubble.right { background: linear-gradient(135deg, rgba(139,92,246,0.5), rgba(236,72,153,0.4)); border: 1px solid rgba(139,92,246,0.12); border-radius: 14px 14px 4px 14px; color: white; }
        .msg-time { font-size:11px; color: rgba(255,255,255,0.22); padding-bottom:2px; white-space:nowrap; }

        /* RIGHT PANEL */
        .right-panel {
          display:flex; align-items:center; justify-content:center; width:100%; padding: 6px; position:relative; z-index:10;
        }
        @media (min-width: 768px) {
          .right-panel { width:420px; padding: 28px; }
        }

        .glass-card {
          width: 100%;
          background: rgba(10, 10, 30, 0.86); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
          padding: 22px;
          box-shadow: 0 8px 22px rgba(2,6,23,0.6);
        }

        .card-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; text-align:center; margin-bottom:6px; }
        .card-sub { font-size:13px; color: rgba(255,255,255,0.34); text-align:center; margin-bottom:14px; }

        .btn-google {
          width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:10px 12px; border-radius:12px;
          background: white; color:#101026; font-weight:600; font-size:13px; border:none; cursor:pointer; margin-bottom:12px;
        }

        .divider { display:flex; align-items:center; gap:10px; margin-bottom:14px; margin-top:6px; }
        .divider-line { flex:1; height:1px; background: rgba(255,255,255,0.06); }
        .divider-text { font-size:11px; color: rgba(255,255,255,0.22); white-space:nowrap; }

        .field { margin-bottom:12px; }
        .field-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .field-label { font-size:10px; font-weight:700; letter-spacing:0.08em; color: rgba(255,255,255,0.36); text-transform:uppercase; }
        .forgot-link { font-size:12px; color:#a78bfa; text-decoration:none; }

        .input-wrap { position:relative; }
        .input-icon { position:absolute; left:11px; top:50%; transform: translateY(-50%); opacity:0.24; pointer-events:none; }
        .input-field {
          width:100%; border-radius:10px; padding:10px 14px 10px 36px; font-size:14px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          color:white; outline:none; font-family:'DM Sans',sans-serif;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.22); }
        .input-field:focus { background: rgba(255,255,255,0.06); border-color: rgba(139,92,246,0.36); box-shadow: 0 0 0 4px rgba(139,92,246,0.06); }
        .input-field.has-right { padding-right:42px; }

        .eye-btn { position:absolute; right:10px; top:50%; transform: translateY(-50%); background:none; border:none; cursor:pointer; color: rgba(255,255,255,0.32); }
        .btn-primary {
          width:100%; padding:11px; border-radius:12px;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          color:white; font-weight:700; font-size:14px; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:10px; margin-top:6px;
        }
        .btn-primary:disabled { opacity:0.7; cursor:not-allowed; }

        .signup-text { text-align:center; font-size:13px; color: rgba(255,255,255,0.34); }
        .signup-link { color:#a78bfa; font-weight:600; text-decoration:none; }

        .spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.34); border-top-color:white; border-radius:50%; animation:spin 0.7s linear infinite; }
        /* small helper to color the .chat part differently where used */
        .brand-chat { color: #E879F9; font-weight:800; }

      `}</style>
      {pageLoading && <Loader />}

      <div className="login-root">

        {/* subtle background orbs (static, non-animated) */}
        <div style={{ position: 'absolute', top: '-12%', left: '-8%', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.16) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-18%', left: '22%', width: '430px', height: '430px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '32%', right: '3%', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,39,119,0.06) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none' }} />

        <StarField />

        {/* ── LEFT ── */}
        <div className="left-panel" aria-hidden={false}>
          <div className="site-logo">
            <img src={logo} alt="TanGent logo" />
            
          </div>

          <h1 className="hero-title">
            Connect<br />with<br />
            <span className="hero-gradient">clarity.</span>
          </h1>

          <p className="hero-sub">
            Real-time messaging that feels clean and direct. Chat with friends, create spaces, and stay connected.
          </p>

          <div className="pills">
            <span className="pill">230+ friends online</span>
            <span className="pill">Real-time messaging</span>
            <span className="pill">End-to-end secure</span>
          </div>

          <div className="chat-preview" aria-hidden="true">
            <div className="msg-row msg-1">
              <div className="avatar" style={{ background: '#6C63FF' }}>K</div>
              <div className="bubble left">Hey! Did you try the new voice rooms? 🎙️</div>
              <span className="msg-time">2m</span>
            </div>
            <div className="msg-row right msg-2">
              <span className="msg-time">1m</span>
              <div className="bubble right">Yess! Hopped in with 12 people 🚀</div>
              <div className="avatar" style={{ background: '#EC4899' }}>B</div>
            </div>
            <div className="msg-row msg-3">
              <div className="avatar" style={{ background: '#6C63FF' }}>K</div>
              <div className="bubble left">TanGent.fun really hits different ✨</div>
              <span className="msg-time">now</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right-panel">
          <div className="glass-card">

            {/* right-side logo removed; auth SVG inserted */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.6" aria-hidden>
                <rect x="3.5" y="10" width="17" height="9" rx="1.5" />
                <path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="card-title">Welcome back</h2>
            <p className="card-sub">Sign in to continue your TanGent<span className="brand-chat">.fun</span> conversations</p>

            <form onSubmit={handleSubmit}>

              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await axios.post(
                      `${import.meta.env.VITE_API_URL}/api/auth/google`,
                      {
                        token: credentialResponse.credential,
                      }
                    );

                    localStorage.setItem("userInfo", JSON.stringify(res.data));

                    navigate("/chat", { replace: true });

                  } catch (err) {
                    console.log(err);
                  }
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or sign in with email</span>
                <div className="divider-line" />
              </div>

              <div className="field">
                <div className="field-header">
                  <label className="field-label">Email Address</label>
                </div>
                <div className="input-wrap">
                  <svg className="input-icon" width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" required className="input-field" />
                </div>
              </div>

              <div className="field">
                <div className="field-header">
                  <label className="field-label">Password</label>
                  <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                </div>
                <div className="input-wrap">
                  <svg className="input-icon" width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input-field has-right" />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                    {showPassword
                      ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /></svg>
                      : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading
                  ? <span className="spinner" />
                  : <>Sign In to TanGent<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
                }
              </button>

              <p className="signup-text">
                New to TanGent<span className="brand-chat">.chat</span>?{' '}
                <Link to="/signup" className="signup-link">Create an account</Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}

export default Login;