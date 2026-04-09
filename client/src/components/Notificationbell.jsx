import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

/*
  NotificationBell
  ─────────────────
  • Fetches /api/friends/requests on mount and every 30 s
  • Shows a red badge with the count when there are pending requests
  • Clicking the bell opens a dropdown — built with 100% inline styles so
    no CSS injection is needed and nothing can ever clip or z-index the dropdown
  • Accept removes the item immediately (optimistic) and shows a success toast
  • Clicking outside the dropdown closes it
*/

const API =import.meta.env.VITE_API_URL;

// ─── Icons ────────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [open,     setOpen]     = useState(false);
  const [requests, setRequests] = useState([]);
  const [toast,    setToast]    = useState("");
  const [busy,     setBusy]     = useState(false);   // disables buttons during API call
  const wrapRef = useRef(null);

  const token = () =>
    JSON.parse(localStorage.getItem("userInfo") || "{}")?.token ?? "";

  // ── Fetch incoming requests ────────────────────────────────────────────
  const load = async () => {
    if (!token()) return;
    try {
      const { data } = await axios.get(`${API}/api/friends/requests`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Close on outside click ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Accept ─────────────────────────────────────────────────────────────
  const handleAccept = async (req) => {
    setBusy(true);
    try {
      await axios.post(
        `${API}/api/friends/accept`,
        { userId: req._id },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setRequests(prev => prev.filter(r => r._id !== req._id));
      setToast(`✓ You and ${req.name} are now friends!`);
      setTimeout(() => setToast(""), 3500);
    } catch (e) {
      console.error("accept:", e.response?.data || e.message);
    } finally {
      setBusy(false);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────
  const handleReject = async (req) => {
    setBusy(true);
    try {
      await axios.post(
        `${API}/api/friends/reject`,
        { userId: req._id },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setRequests(prev => prev.filter(r => r._id !== req._id));
    } catch (e) {
      console.error("reject:", e.response?.data || e.message);
    } finally {
      setBusy(false);
    }
  };

  // ─── Styles (all inline — no <style> injection so nothing can conflict) ───
  const S = {
    wrap: {
      position: "relative",
      display:  "inline-flex",
    },

    btn: {
      position:       "relative",
      width:          30,
      height:         30,
      borderRadius:   "50%",
      background:     "transparent",
      border:         "1px solid rgba(255,255,255,0.12)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      cursor:         "pointer",
      color:          "rgba(180,170,240,0.6)",
      transition:     "all .2s",
      outline:        "none",
      flexShrink:     0,
    },

    badge: {
      position:       "absolute",
      top:            -4,
      right:          -4,
      minWidth:       18,
      height:         18,
      padding:        "0 4px",
      borderRadius:   9,
      background:     "#f43f5e",
      color:          "white",
      fontSize:       ".62rem",
      fontWeight:     800,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      border:         "2px solid #07071a",
      lineHeight:     1,
      fontFamily:     "'Plus Jakarta Sans', sans-serif",
      pointerEvents:  "none",
    },

    // The dropdown is fixed, not absolute — this is the key fix.
    // Fixed positioning escapes every parent's overflow/stacking context.
    dropdown: (btnRect) => ({
      position:    "fixed",
      top:         btnRect ? btnRect.bottom + 10 : 78,
      right:       btnRect ? window.innerWidth - btnRect.right : 20,
      width:       300,
      background:  "rgba(12,10,35,0.98)",
      border:      "1px solid rgba(124,92,252,0.28)",
      borderRadius: 16,
      overflow:    "hidden",
      zIndex:      99999,
      boxShadow:   "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(124,92,252,0.1)",
      backdropFilter: "blur(20px)",
      animation:   "nbSlideIn .18s ease both",
      fontFamily:  "'Plus Jakarta Sans', sans-serif",
    }),

    ddHead: {
      padding:       "14px 16px 10px",
      fontSize:      ".75rem",
      fontWeight:    800,
      color:         "rgba(180,170,240,0.5)",
      letterSpacing: ".08em",
      textTransform: "uppercase",
      borderBottom:  "1px solid rgba(255,255,255,0.06)",
    },

    empty: {
      padding:   "28px 16px",
      textAlign: "center",
      color:     "rgba(180,170,240,0.4)",
      fontSize:  ".83rem",
    },

    list: {
      maxHeight:   320,
      overflowY:   "auto",
      scrollbarWidth: "thin",
    },

    item: {
      display:       "flex",
      alignItems:    "center",
      gap:           10,
      padding:       "12px 14px",
      borderBottom:  "1px solid rgba(255,255,255,0.04)",
      transition:    "background .15s",
    },

    avatar: {
      width:          36,
      height:         36,
      borderRadius:   10,
      background:     "linear-gradient(135deg,#7c5cfc,#38bdf8)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      fontWeight:     800,
      fontSize:       ".88rem",
      color:          "white",
      flexShrink:     0,
    },

    info: {
      flex:    1,
      minWidth: 0,
    },

    name: {
      fontSize:      ".83rem",
      fontWeight:    700,
      color:         "#eeeeff",
      whiteSpace:    "nowrap",
      overflow:      "hidden",
      textOverflow:  "ellipsis",
    },

    sub: {
      fontSize:  ".71rem",
      color:     "rgba(180,170,240,0.45)",
      marginTop: 1,
    },

    actions: {
      display:   "flex",
      gap:       5,
      flexShrink: 0,
    },

    accBtn: {
      padding:     "5px 10px",
      borderRadius: 7,
      fontSize:    ".72rem",
      fontWeight:  800,
      border:      "1px solid rgba(124,92,252,0.35)",
      background:  "rgba(124,92,252,0.18)",
      color:       "#c4b5fd",
      cursor:      "pointer",
      fontFamily:  "inherit",
      transition:  "all .15s",
    },

    rejBtn: {
      padding:     "5px 10px",
      borderRadius: 7,
      fontSize:    ".72rem",
      fontWeight:  800,
      border:      "1px solid rgba(255,255,255,0.1)",
      background:  "transparent",
      color:       "rgba(180,170,240,0.5)",
      cursor:      "pointer",
      fontFamily:  "inherit",
      transition:  "all .15s",
    },

    toast: {
      padding:       "9px 14px",
      background:    "rgba(34,197,94,0.1)",
      borderTop:     "1px solid rgba(34,197,94,0.18)",
      fontSize:      ".75rem",
      fontWeight:    700,
      color:         "#4ade80",
      textAlign:     "center",
      display:       "flex",
      alignItems:    "center",
      justifyContent: "center",
      gap:           6,
    },
  };

  // We track the button's bounding rect to position the dropdown precisely
  const [btnRect, setBtnRect] = useState(null);

  const handleToggle = () => {
    if (!open && wrapRef.current) {
      setBtnRect(wrapRef.current.getBoundingClientRect());
    }
    setOpen(o => !o);
  };

  // Re-position dropdown on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (wrapRef.current) setBtnRect(wrapRef.current.getBoundingClientRect());
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  return (
    <>
      {/* One tiny animation keyframe — won't conflict with anything */}
      <style>{`@keyframes nbSlideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div ref={wrapRef} style={S.wrap}>

        {/* Bell button */}
        <button
          style={S.btn}
          onClick={handleToggle}
          title="Friend requests"
          onMouseEnter={e => {
            e.currentTarget.style.borderColor  = "rgba(124,92,252,0.5)";
            e.currentTarget.style.background   = "rgba(124,92,252,0.1)";
            e.currentTarget.style.color        = "#c4b5fd";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor  = "rgba(255,255,255,0.12)";
            e.currentTarget.style.background   = "transparent";
            e.currentTarget.style.color        = "rgba(180,170,240,0.6)";
          }}
        >
          <BellIcon />
          {requests.length > 0 && (
            <span style={S.badge}>
              {requests.length > 9 ? "9+" : requests.length}
            </span>
          )}
        </button>

        {/* Dropdown — fixed positioning so it escapes parent overflow/stacking */}
        {open && (
          <div style={S.dropdown(btnRect)}>

            {/* Header */}
            <div style={S.ddHead}>
              Friend Requests{requests.length > 0 ? ` · ${requests.length}` : ""}
            </div>

            {/* Empty */}
            {requests.length === 0 && !toast && (
              <div style={S.empty}>All caught up — no pending requests 🎉</div>
            )}

            {/* Request list */}
            {requests.length > 0 && (
              <div style={S.list}>
                {requests.map((req, idx) => (
                  <div
                    key={req._id}
                    style={{
                      ...S.item,
                      borderBottom: idx === requests.length - 1
                        ? "none"
                        : S.item.borderBottom,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,252,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={S.avatar}>
                      {(req.name?.[0] ?? "?").toUpperCase()}
                    </div>

                    <div style={S.info}>
                      <div style={S.name}>{req.name}</div>
                      <div style={S.sub}>Wants to be friends</div>
                    </div>

                    <div style={S.actions}>
                      <button
                        style={S.accBtn}
                        disabled={busy}
                        onClick={() => handleAccept(req)}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(124,92,252,0.35)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(124,92,252,0.18)"}
                      >
                        Accept
                      </button>
                      <button
                        style={S.rejBtn}
                        disabled={busy}
                        onClick={() => handleReject(req)}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "rgba(244,63,94,0.4)";
                          e.currentTarget.style.color       = "#fb7185";
                          e.currentTarget.style.background  = "rgba(244,63,94,0.08)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                          e.currentTarget.style.color       = "rgba(180,170,240,0.5)";
                          e.currentTarget.style.background  = "transparent";
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Success toast */}
            {toast && (
              <div style={S.toast}>
                <CheckIcon /> {toast}
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}