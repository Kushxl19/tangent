// src/components/MessageBubble.jsx
// Features: right-click context menu, edit, delete for me/everyone, reply preview,
//           multi-select (ctrl+click / long-press), "edited" label
import { useState, useRef, useEffect, useCallback } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────
const EditIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const ReplyIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>;
const SelectIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="9 12 11 14 15 10"/></svg>;
const DblCheckIcon = () => (
  <svg width="14" height="10" viewBox="0 0 16 10" fill="none">
    <path d="M1 5l3.5 3.5L10 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 5l3.5 3.5L15 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Context menu ──────────────────────────────────────────────────────────────
function ContextMenu({ x, y, isMe, onEdit, onDeleteMe, onDeleteEveryone, onReply, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    // small delay so the triggering mousedown doesn't immediately close it
    const tid = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => { clearTimeout(tid); document.removeEventListener("mousedown", handler); };
  }, [onClose]);

  // Clamp to viewport
  const style = {
    position: "fixed",
    top:      Math.min(y, window.innerHeight - 220),
    left:     Math.min(x, window.innerWidth  - 180),
    width:    175,
    background: "rgba(12,12,34,0.97)",
    border:   "1px solid rgba(124,92,252,0.28)",
    borderRadius: 14,
    zIndex:   9999,
    overflow: "hidden",
    boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
    animation: "cmFadeIn .15s ease both",
  };

  const itemStyle = (danger) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px", border: "none", background: "transparent",
    color:  danger ? "#f87171" : "rgba(220,210,255,0.8)",
    fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".82rem", fontWeight: 600,
    cursor: "pointer", width: "100%", textAlign: "left", transition: "background .12s",
  });

  return (
    <>
      <style>{`@keyframes cmFadeIn{from{opacity:0;transform:scale(.94) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div ref={ref} style={style}>
        <button style={itemStyle(false)} onClick={onReply}
          onMouseEnter={e => e.currentTarget.style.background="rgba(124,92,252,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        ><ReplyIcon /> Reply</button>

        {isMe && (
          <button style={itemStyle(false)} onClick={onEdit}
            onMouseEnter={e => e.currentTarget.style.background="rgba(124,92,252,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}
          ><EditIcon /> Edit</button>
        )}

        <button style={itemStyle(false)} onClick={onSelect}
          onMouseEnter={e => e.currentTarget.style.background="rgba(124,92,252,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        ><SelectIcon /> Select</button>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />

        <button style={itemStyle(true)} onClick={onDeleteMe}
          onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        ><TrashIcon /> Delete for me</button>

        {isMe && (
          <button style={itemStyle(true)} onClick={onDeleteEveryone}
            onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}
          ><TrashIcon /> Delete for everyone</button>
        )}
      </div>
    </>
  );
}

// ── Inline edit input ─────────────────────────────────────────────────────────
function EditInput({ value, onSave, onCancel }) {
  const [text, setText] = useState(value);
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);

  const save = () => { if (text.trim()) onSave(text.trim()); };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginTop: 4 }}>
      <textarea
        ref={ref}
        rows={1}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
          if (e.key === "Escape") onCancel();
        }}
        style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(124,92,252,0.4)", background: "rgba(255,255,255,0.06)", color: "#eeeeff", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".875rem", resize: "none", outline: "none" }}
      />
      <button onClick={save}   style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#7c5cfc,#5b3ed4)", color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>Save</button>
      <button onClick={onCancel} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(180,170,240,0.6)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".75rem", cursor: "pointer" }}>✕</button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
/**
 * Props:
 *  msg            – message object (with optional .replyTo populated)
 *  isMe           – boolean
 *  isSelected     – boolean (multi-select)
 *  onContextAction(action, msg, extra?)
 *                   actions: "edit" | "deleteMe" | "deleteEveryone" | "reply" | "select"
 *  bubbleColorMe, bubbleColorThem, textColorMe, textColorThem  – theme overrides
 */
export default function MessageBubble({
  msg,
  isMe,
  isSelected = false,
  onContextAction,
  bubbleColorMe    = "linear-gradient(135deg,#7c5cfc,#5b3ed4)",
  bubbleColorThem  = "rgba(255,255,255,0.07)",
  textColorMe      = "#ffffff",
  textColorThem    = "rgba(240,232,255,0.9)",
  onScrollToReply,
}) {
  const [contextMenu, setContextMenu] = useState(null); // { x, y }
  const [editing,     setEditing]     = useState(false);
  const [hovered,     setHovered]     = useState(false);
  const longPressTimer = useRef(null);

  const openMenu = useCallback((x, y) => setContextMenu({ x, y }), []);
  const closeMenu = useCallback(() => setContextMenu(null), []);

  // Right-click
  const handleContextMenu = (e) => {
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
  };

  // Long press (mobile)
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => openMenu(80, 200), 500);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  // Ctrl+Click = select
  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      onContextAction?.("select", msg);
    }
  };

  const isDeleted = msg.isDeletedForEveryone;
  const content   = isDeleted ? "🚫 This message was deleted" : msg.content;

  const bubbleStyle = {
    padding: "11px 15px",
    borderRadius: 18,
    fontSize: ".875rem",
    lineHeight: 1.6,
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
    background:        isMe ? bubbleColorMe   : bubbleColorThem,
    color:             isMe ? textColorMe     : textColorThem,
    borderBottomRightRadius: isMe ? 5 : 18,
    borderBottomLeftRadius:  isMe ? 18 : 5,
    boxShadow: isMe ? "0 4px 20px rgba(124,92,252,0.3)" : "none",
    border:    isMe ? "none" : "1px solid rgba(255,255,255,0.08)",
    fontStyle: isDeleted ? "italic" : "normal",
    opacity:   isDeleted ? 0.55 : 1,
    position:  "relative",
    outline:   isSelected ? "2px solid #7c5cfc" : "2px solid transparent",
    transition: "outline .15s, transform .1s",
    transform:  isSelected ? "scale(0.98)" : "scale(1)",
    cursor:    "default",
  };

  if (editing) {
    return (
      <div style={{ maxWidth: "65%", minWidth: 0 }}>
        <EditInput
          value={msg.content}
          onSave={(text) => { setEditing(false); onContextAction?.("edit", msg, text); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div
        style={{minWidth: 0, position: "relative" }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Reply preview */}
        {msg.replyTo && !isDeleted && (
          <div
            onClick={(e) => { e.stopPropagation(); onScrollToReply?.(msg.replyTo._id); }}
            style={{
              marginBottom: 4, padding: "6px 10px",
              borderLeft: "3px solid rgba(124,92,252,0.6)",
              borderRadius: "0 8px 8px 0",
              background: "rgba(124,92,252,0.1)",
              cursor: "pointer", maxWidth: "100%",
            }}
          >
            <div style={{ fontSize: ".68rem", color: "#c4b5fd", fontWeight: 700, marginBottom: 2, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              ↩ {msg.replyTo.sender?.name ?? "Unknown"}
            </div>
            <div style={{ fontSize: ".75rem", color: "rgba(180,170,240,0.6)", fontFamily: "'Plus Jakarta Sans',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
              {msg.replyTo.content}
            </div>
          </div>
        )}

        {/* Bubble */}
        <div style={bubbleStyle}>
          {content}
          {msg.isEdited && !isDeleted && (
            <span style={{ fontSize: ".62rem", color: isMe ? "rgba(255,255,255,0.5)" : "rgba(180,170,240,0.4)", marginLeft: 6 }}>
              (edited)
            </span>
          )}
        </div>

        {/* Hover quick-actions (Reply & more) */}
        {hovered && !isDeleted && (
          <div style={{
            position: "absolute", top: -6,
            [isMe ? "left" : "right"]: "calc(100% + 6px)",
            display: "flex", gap: 4, zIndex: 10,
            animation: "cmFadeIn .12s ease both",
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onContextAction?.("reply", msg); }}
              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(12,12,34,0.9)", color: "rgba(180,170,240,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              title="Reply"
            >
              <ReplyIcon />
            </button>
            {isMe && (
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true); closeMenu(); }}
                style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(12,12,34,0.9)", color: "rgba(180,170,240,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Edit"
              >
                <EditIcon />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Context menu portal */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          isMe={isMe}
          onEdit={() => { closeMenu(); setEditing(true); }}
          onDeleteMe={() => { closeMenu(); onContextAction?.("deleteMe", msg); }}
          onDeleteEveryone={() => { closeMenu(); onContextAction?.("deleteEveryone", msg); }}
          onReply={() => { closeMenu(); onContextAction?.("reply", msg); }}
          onSelect={() => { closeMenu(); onContextAction?.("select", msg); }}
          onClose={closeMenu}
        />
      )}
    </>
  );
}