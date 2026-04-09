// src/components/AIChatbot.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Global floating AI chatbot — rendered via React Portal in App.jsx.
// Visible on all pages EXCEPT /login and /signup.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ── Rate-limit constants (client-side guard — server has its own) ─────────────
const CLIENT_RATE_LIMIT   = 15;    // max messages in window
const CLIENT_RATE_WINDOW  = 60_000; // 1 minute

// ── Styles injected once ──────────────────────────────────────────────────────
const CHATBOT_STYLES = `
@keyframes aib-fadeIn   { from{opacity:0;transform:scale(.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes aib-fadeOut  { from{opacity:1;transform:scale(1) translateY(0)}     to{opacity:0;transform:scale(.94) translateY(8px)} }
@keyframes aib-slideUp  { from{opacity:0;transform:translateY(22px)}            to{opacity:1;transform:translateY(0)} }
@keyframes aib-pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(124,92,252,.55)} 60%{box-shadow:0 0 0 10px rgba(124,92,252,0)} }
@keyframes aib-dot      { 0%,80%,100%{transform:scale(.7);opacity:.4} 40%{transform:scale(1);opacity:1} }
@keyframes aib-ripple   { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
@keyframes aib-msgIn    { from{opacity:0;transform:translateY(6px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes aib-spin     { to{transform:rotate(360deg)} }

/* ── FAB button ── */
.aib-fab {
  position:fixed; bottom:28px; right:28px; z-index:9990;
  width:58px; height:58px; border-radius:50%;
  background:linear-gradient(135deg,#7c5cfc 0%,#5b3ed4 50%,#38bdf8 100%);
  border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 24px rgba(124,92,252,.55), 0 1px 6px rgba(0,0,0,.45);
  transition:transform .18s cubic-bezier(.34,1.4,.64,1), box-shadow .18s;
  animation: aib-pulse 2.6s ease-in-out infinite;
  padding:0;
}
.aib-fab:hover  { transform:scale(1.1); box-shadow:0 6px 32px rgba(124,92,252,.7),0 2px 10px rgba(0,0,0,.5); }
.aib-fab:active { transform:scale(.97); }
.aib-fab-ripple {
  position:absolute; inset:0; border-radius:50%;
  background:rgba(124,92,252,.35);
  animation:aib-ripple .6s ease-out forwards;
  pointer-events:none;
}
.aib-fab-icon { color:#fff; display:flex; align-items:center; justify-content:center; }

/* ── Modal backdrop ── */
.aib-backdrop {
  position:fixed; inset:0; z-index:9991;
  background:rgba(0,0,0,.4);
  backdrop-filter:blur(4px);
  animation:aib-fadeIn .22s ease forwards;
}
.aib-backdrop.closing { animation:aib-fadeOut .2s ease forwards; pointer-events:none; }

/* ── Chat modal ── */
.aib-modal {
  position:fixed; bottom:100px; right:28px; z-index:9992;
  width:370px; max-width:calc(100vw - 40px);
  height:520px; max-height:calc(100vh - 140px);
  background:rgba(9,9,26,0.97);
  border:1px solid rgba(124,92,252,.22);
  border-radius:22px;
  display:flex; flex-direction:column;
  overflow:hidden;
  box-shadow:0 0 0 1px rgba(124,92,252,.08),
             0 8px 48px rgba(0,0,0,.75),
             0 0 80px rgba(124,92,252,.08);
  animation:aib-fadeIn .25s cubic-bezier(.34,1.2,.64,1) forwards;
}
.aib-modal.closing { animation:aib-fadeOut .2s ease forwards; }

/* ── Header ── */
.aib-header {
  padding:14px 16px 13px;
  border-bottom:1px solid rgba(255,255,255,.06);
  background:rgba(124,92,252,.06);
  display:flex; align-items:center; gap:11px;
  flex-shrink:0;
}
.aib-avatar {
  width:38px; height:38px; border-radius:50%;
  background:linear-gradient(135deg,#7c5cfc,#38bdf8);
  display:flex; align-items:center; justify-content:center;
  font-size:1.1rem; flex-shrink:0;
  box-shadow:0 2px 10px rgba(124,92,252,.45);
  position:relative;
}
.aib-online-dot {
  position:absolute; bottom:1px; right:1px;
  width:9px; height:9px; border-radius:50%;
  background:#22d3ee; border:2px solid rgba(9,9,26,.97);
}
.aib-header-info { flex:1; min-width:0; }
.aib-header-name {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.88rem; font-weight:800; color:#eeeeff;
  letter-spacing:-.01em;
}
.aib-header-status {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.65rem; color:rgba(180,170,240,.55);
  margin-top:1px;
}
.aib-header-actions { display:flex; gap:6px; }
.aib-header-btn {
  width:30px; height:30px; border-radius:9px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.07);
  color:rgba(180,170,240,.6);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .16s; padding:0;
}
.aib-header-btn:hover { background:rgba(124,92,252,.14); border-color:rgba(124,92,252,.28); color:#c4b5fd; }

/* ── Messages area ── */
.aib-messages {
  flex:1; overflow-y:auto; padding:14px 14px 6px;
  display:flex; flex-direction:column; gap:8px;
  scrollbar-width:thin; scrollbar-color:rgba(124,92,252,.2) transparent;
}
.aib-messages::-webkit-scrollbar { width:4px; }
.aib-messages::-webkit-scrollbar-thumb { background:rgba(124,92,252,.25); border-radius:10px; }

/* ── Welcome state ── */
.aib-welcome {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; flex:1; gap:10px;
  padding:20px; text-align:center;
}
.aib-welcome-icon {
  width:56px; height:56px; border-radius:50%;
  background:linear-gradient(135deg,rgba(124,92,252,.2),rgba(56,189,248,.15));
  border:1px solid rgba(124,92,252,.25);
  display:flex; align-items:center; justify-content:center;
  font-size:1.6rem;
}
.aib-welcome-title {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.92rem; font-weight:800; color:#eeeeff;
}
.aib-welcome-sub {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.72rem; color:rgba(180,170,240,.5); line-height:1.55; max-width:240px;
}
.aib-quick-chips {
  display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:4px;
}
.aib-chip {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.68rem; font-weight:600;
  padding:5px 11px; border-radius:20px;
  background:rgba(124,92,252,.11);
  border:1px solid rgba(124,92,252,.22);
  color:#c4b5fd; cursor:pointer; transition:all .16s;
}
.aib-chip:hover { background:rgba(124,92,252,.22); border-color:rgba(124,92,252,.4); color:#e9d5ff; }

/* ── Message bubble ── */
.aib-msg-row {
  display:flex; align-items:flex-end; gap:7px;
  animation:aib-msgIn .22s ease forwards;
}
.aib-msg-row.user { flex-direction:row-reverse; }

.aib-msg-mini-avatar {
  width:24px; height:24px; border-radius:50%; flex-shrink:0;
  background:linear-gradient(135deg,#7c5cfc,#38bdf8);
  display:flex; align-items:center; justify-content:center;
  font-size:.7rem;
}

.aib-bubble {
  max-width:80%; padding:9px 13px; border-radius:16px;
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.82rem; line-height:1.52; word-break:break-word;
}
.aib-bubble.ai {
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.07);
  color:#ddd8ff; border-bottom-left-radius:5px;
}
.aib-bubble.user {
  background:linear-gradient(135deg,#7c5cfc,#5b3ed4);
  color:#fff;
  box-shadow:0 2px 12px rgba(124,92,252,.35);
  border-bottom-right-radius:5px;
}
.aib-bubble.error {
  background:rgba(239,68,68,.1);
  border:1px solid rgba(239,68,68,.22);
  color:#fca5a5;
}
.aib-msg-time {
  font-size:.58rem; color:rgba(180,170,240,.35);
  margin-top:2px; text-align:right;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.aib-msg-time.ai { text-align:left; }

/* ── Typing indicator ── */
.aib-typing-row {
  display:flex; align-items:flex-end; gap:7px;
  animation:aib-slideUp .2s ease forwards;
}
.aib-typing-bubble {
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.07);
  border-radius:16px; border-bottom-left-radius:5px;
  padding:10px 14px;
  display:flex; align-items:center; gap:4px;
}
.aib-typing-dot {
  width:6px; height:6px; border-radius:50%;
  background:#7c5cfc;
}
.aib-typing-dot:nth-child(1) { animation:aib-dot 1.2s ease-in-out .0s infinite; }
.aib-typing-dot:nth-child(2) { animation:aib-dot 1.2s ease-in-out .2s infinite; }
.aib-typing-dot:nth-child(3) { animation:aib-dot 1.2s ease-in-out .4s infinite; }
.aib-typing-label {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.6rem; color:rgba(180,170,240,.4); margin-top:2px;
}

/* ── Input area ── */
.aib-input-area {
  padding:10px 12px 14px;
  border-top:1px solid rgba(255,255,255,.06);
  flex-shrink:0;
}
.aib-input-row {
  display:flex; align-items:flex-end; gap:8px;
}
.aib-textarea-wrap {
  flex:1; position:relative;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.09);
  border-radius:14px; transition:border-color .18s, box-shadow .18s;
}
.aib-textarea-wrap:focus-within {
  border-color:rgba(124,92,252,.45);
  box-shadow:0 0 0 3px rgba(124,92,252,.1);
}
.aib-textarea {
  width:100%; resize:none; border:none; outline:none; background:none;
  font-family:'Plus Jakarta Sans',sans-serif; font-size:.82rem;
  color:#eeeeff; padding:9px 12px; line-height:1.45;
  min-height:38px; max-height:110px; overflow-y:auto;
  scrollbar-width:thin; scrollbar-color:rgba(124,92,252,.2) transparent;
}
.aib-textarea::placeholder { color:rgba(180,170,240,.35); }

.aib-send-btn {
  width:38px; height:38px; border-radius:12px; flex-shrink:0;
  background:linear-gradient(135deg,#7c5cfc,#5b3ed4);
  border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 2px 10px rgba(124,92,252,.4);
  transition:all .16s; color:#fff; padding:0;
}
.aib-send-btn:hover:not(:disabled) { transform:scale(1.07); box-shadow:0 4px 16px rgba(124,92,252,.55); }
.aib-send-btn:active:not(:disabled) { transform:scale(.96); }
.aib-send-btn:disabled { opacity:.45; cursor:not-allowed; }

.aib-spinner {
  width:16px; height:16px; border-radius:50%;
  border:2px solid rgba(255,255,255,.25);
  border-top-color:#fff;
  animation:aib-spin .7s linear infinite;
}

.aib-rate-warn {
  font-family:'Plus Jakarta Sans',sans-serif;
  font-size:.65rem; color:rgba(248,113,113,.7);
  text-align:center; margin-top:5px;
}
`;

// ── Quick suggestion chips ────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  "Tell me a fun fact 🎲",
  "Help me write a message ✍️",
  "What can you do? 🤖",
  "Summarize something 📝",
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none"/>
    <path d="M12 11V7"/>
    <path d="M8 7h8"/>
    <circle cx="12" cy="5" r="2"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);

// ── Helper ────────────────────────────────────────────────────────────────────
const timeStr = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ── localStorage key & 12-hour expiry ────────────────────────────────────────
const STORAGE_KEY = "tg_chatbot_messages";
const EXPIRY_MS   = 12 * 60 * 60 * 1000; // 12 hours in ms

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const cutoff = Date.now() - EXPIRY_MS;
    return JSON.parse(raw).filter((m) => m.ts > cutoff);
  } catch { return []; }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const [open, setOpen]         = useState(false);
  const [closing, setClosing]   = useState(false);
  const [messages, setMessages] = useState(() => loadMessages()); // restored from storage
  const [input, setInput]       = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [sending, setSending]   = useState(false);
  const [ripple, setRipple]     = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const endRef       = useRef(null);
  const textareaRef  = useRef(null);
  const rateBucket   = useRef({ count: 0, resetAt: Date.now() + CLIENT_RATE_WINDOW });

  // Inject styles once
  useEffect(() => {
    if (document.getElementById("aib-styles")) return;
    const tag = document.createElement("style");
    tag.id = "aib-styles";
    tag.textContent = CHATBOT_STYLES;
    document.head.appendChild(tag);
  }, []);

  // Persist messages to localStorage on every change (skip error messages)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.filter((m) => !m.error)));
    } catch { /* storage full — fail silently */ }
  }, [messages]);

  // Auto-expire: every 60s drop messages older than 12 hours
  useEffect(() => {
    const id = setInterval(() => {
      const cutoff = Date.now() - EXPIRY_MS;
      setMessages((prev) => {
        const fresh = prev.filter((m) => m.ts > cutoff);
        return fresh.length !== prev.length ? fresh : prev;
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll on new messages or typing state change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  // Reset textarea height on clear
  useEffect(() => {
    if (!input && textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input]);

  const openModal = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    setClosing(false);
    setOpen(true);
  };

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 200);
  };

  // Client-side rate limit check
  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const b   = rateBucket.current;
    if (now > b.resetAt) {
      rateBucket.current = { count: 1, resetAt: now + CLIENT_RATE_WINDOW };
      setRateLimited(false);
      return false;
    }
    if (b.count >= CLIENT_RATE_LIMIT) {
      setRateLimited(true);
      return true;
    }
    b.count++;
    return false;
  }, []);

  // Build history for the API call (last 12 turns)
  const buildHistory = useCallback(() =>
    messages
      .filter((m) => !m.error)
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const sendMessage = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;

    if (isRateLimited()) return;

    const token = (() => {
      try { return JSON.parse(localStorage.getItem("userInfo"))?.token || localStorage.getItem("token"); }
      catch { return null; }
    })();

    if (!token) {
      setMessages((p) => [...p, {
        id: `err-${Date.now()}`, role: "assistant", content: "Please log in to chat with TanGent AI.", ts: Date.now(), error: true,
      }]);
      return;
    }

    const userMsg = { id: `u-${Date.now()}`, role: "user", content: msg, ts: Date.now() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setSending(true);
    setAiTyping(true);

    // Get history BEFORE adding this message (already pushed above, so exclude last)
    const history = buildHistory();

    try {
      const { data } = await axios.post(
        `${API}/api/ai/chat`,
        { message: msg, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiTyping(false);
      setMessages((p) => [...p, {
        id: `a-${Date.now()}`, role: "assistant", content: data.reply, ts: Date.now(),
      }]);
    } catch (err) {
      setAiTyping(false);
      const status = err?.response?.status;
      const fallback = status === 429
        ? "You're sending too fast! Give me a moment to breathe. 😅"
        : "Oops, something went wrong on my end. Please try again! 🤖";

      setMessages((p) => [...p, {
        id: `err-${Date.now()}`, role: "assistant",
        content: err?.response?.data?.reply || fallback,
        ts: Date.now(), error: status !== 429,
      }]);
    } finally {
      setSending(false);
    }
  }, [input, sending, isRateLimited, buildHistory]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";
  };

  const clearChat = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const showWelcome = messages.length === 0;

  return ReactDOM.createPortal(
    <>
      {/* ── FAB button ── */}
      <button
        className="aib-fab"
        onClick={open ? closeModal : openModal}
        title="Chat with TanGent AI"
        aria-label="Open AI chatbot"
      >
        {ripple && <span className="aib-fab-ripple" />}
        <span className="aib-fab-icon">
          {open
            ? <CloseIcon />
            : <BotIcon />
          }
        </span>
      </button>

      {/* ── Modal ── */}
      {open && (
        <>
          {/* Backdrop (click to close) */}
          <div
            className={`aib-backdrop${closing ? " closing" : ""}`}
            onClick={closeModal}
          />

          <div className={`aib-modal${closing ? " closing" : ""}`}>

            {/* Header */}
            <div className="aib-header">
              <div className="aib-avatar">
                🤖
                <span className="aib-online-dot" />
              </div>
              <div className="aib-header-info">
                <div className="aib-header-name">TanGent AI</div>
                <div className="aib-header-status">
                  {aiTyping ? "Typing…" : "Always here to help ✨"}
                </div>
              </div>
              <div className="aib-header-actions">
                {messages.length > 0 && (
                  <button className="aib-header-btn" title="Clear chat" onClick={clearChat}>
                    <ClearIcon />
                  </button>
                )}
                <button className="aib-header-btn" title="Close" onClick={closeModal}>
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="aib-messages">
              {showWelcome ? (
                <div className="aib-welcome">
                  <div className="aib-welcome-icon">✨</div>
                  <div className="aib-welcome-title">Hey there! I'm TanGent AI</div>
                  <div className="aib-welcome-sub">
                    Ask me anything — I'm here to help with your messages, ideas, or just a chat!
                  </div>
                  <div className="aib-quick-chips">
                    {QUICK_SUGGESTIONS.map((s) => (
                      <button key={s} className="aib-chip" onClick={() => sendMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <div key={m.id}>
                      <div className={`aib-msg-row${m.role === "user" ? " user" : ""}`}>
                        {m.role === "assistant" && (
                          <div className="aib-msg-mini-avatar">🤖</div>
                        )}
                        <div>
                          <div className={`aib-bubble ${m.role === "user" ? "user" : m.error ? "error" : "ai"}`}>
                            {m.content}
                          </div>
                          <div className={`aib-msg-time${m.role === "assistant" ? " ai" : ""}`}>
                            {timeStr(m.ts)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing animation */}
                  {aiTyping && (
                    <div className="aib-typing-row">
                      <div className="aib-msg-mini-avatar">🤖</div>
                      <div>
                        <div className="aib-typing-bubble">
                          <div className="aib-typing-dot" />
                          <div className="aib-typing-dot" />
                          <div className="aib-typing-dot" />
                        </div>
                        <div className="aib-typing-label">AI is typing…</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="aib-input-area">
              <div className="aib-input-row">
                <div className="aib-textarea-wrap">
                  <textarea
                    ref={textareaRef}
                    className="aib-textarea"
                    rows={1}
                    placeholder="Ask me anything…"
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                  />
                </div>
                <button
                  className="aib-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  title="Send"
                >
                  {sending
                    ? <div className="aib-spinner" />
                    : <SendIcon />
                  }
                </button>
              </div>
              {rateLimited && (
                <div className="aib-rate-warn">⚠️ Slow down a bit — rate limit reached.</div>
              )}
            </div>

          </div>
        </>
      )}
    </>,
    document.body
  );
}