import React, { useRef, useState } from "react";

const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoClear = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SearchBar = ({ value, onChange, placeholder = "Search…" }) => {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;

  return (
    <div style={{ position:"relative", width:"100%" }}>
      {/* Icon */}
      <div style={{
        position:"absolute", left:13, top:"50%", transform:"translateY(-50%)",
        color: active ? "rgba(124,92,252,.85)" : "rgba(180,170,240,.38)",
        display:"flex", alignItems:"center", pointerEvents:"none",
        transition:"color .2s",
      }}>
        <IcoSearch />
      </div>

      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:"100%",
          padding:"11px 38px 11px 38px",
          borderRadius:12,
          background: active ? "rgba(124,92,252,.055)" : "rgba(255,255,255,.045)",
          border: `1.5px solid ${active ? "rgba(124,92,252,.42)" : "rgba(255,255,255,.08)"}`,
          color:"#eeeeff",
          fontSize:".875rem",
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          fontWeight:500,
          outline:"none",
          transition:"border-color .2s, background .2s, box-shadow .2s",
          boxShadow: active ? "0 0 0 3px rgba(124,92,252,.12)" : "none",
        }}
      />

      {/* Clear */}
      {value && (
        <button
          onClick={() => { onChange(""); ref.current?.focus(); }}
          style={{
            position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
            width:22, height:22, borderRadius:6, border:"none",
            background:"rgba(255,255,255,.08)", color:"rgba(180,170,240,.65)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", transition:"background .15s, color .15s",
            fontFamily:"inherit",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background="rgba(244,63,94,.14)"; e.currentTarget.style.color="#f87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background="rgba(255,255,255,.08)"; e.currentTarget.style.color="rgba(180,170,240,.65)"; }}
          aria-label="Clear"
        >
          <IcoClear />
        </button>
      )}
    </div>
  );
};

export default SearchBar;