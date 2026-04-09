// src/components/ChatThemeSettingsModal.jsx
// Feature 1: Full chat theme customisation modal
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const PRESET_GRADIENTS = [
  { label: "Purple Dream",  value: "linear-gradient(135deg,#7c5cfc,#5b3ed4)" },
  { label: "Ocean Breeze",  value: "linear-gradient(135deg,#0ea5e9,#0284c7)" },
  { label: "Sunset Glow",   value: "linear-gradient(135deg,#f43f5e,#f97316)" },
  { label: "Forest Mist",   value: "linear-gradient(135deg,#22c55e,#0d9488)" },
  { label: "Midnight",      value: "linear-gradient(135deg,#1e293b,#0f172a)" },
  { label: "Rose Gold",     value: "linear-gradient(135deg,#ec4899,#d97706)" },
];

const BG_PRESETS = [
  { label: "Dark",    type: "color",    value: "#07071a" },
  { label: "Deep Blue", type: "color",  value: "#0a0f2e" },
  { label: "Forest",  type: "color",    value: "#071a0e" },
  { label: "Nebula",  type: "gradient", value: "radial-gradient(ellipse at 20% 20%,rgba(124,92,252,0.3),transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(56,189,248,0.2),transparent 55%),#07071a" },
  { label: "Aurora",  type: "gradient", value: "linear-gradient(135deg,#0a1628,#1a0533,#0a2818)" },
  { label: "Cosmos",  type: "gradient", value: "radial-gradient(circle at 50% 50%,#1a0533,#07071a 70%)" },
];

export default function ChatThemeSettingsModal({ onClose, onSave, authHeader }) {
  const [settings, setSettings] = useState({
    backgroundType:  "none",
    backgroundValue: "",
    opacity:          100,
    bubbleColorMe:   "linear-gradient(135deg,#7c5cfc,#5b3ed4)",
    bubbleColorThem: "rgba(255,255,255,0.07)",
    textColorMe:     "#ffffff",
    textColorThem:   "rgba(240,232,255,0.9)",
  });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState("background"); // "background" | "bubbles"

  // Load existing settings
  useEffect(() => {
    axios.get(`${API}/api/settings`, { headers: authHeader() })
      .then(r => {
        const d = r.data;
        setSettings({
          backgroundType:  d.backgroundType  || "none",
          backgroundValue: d.backgroundValue || "",
          opacity:         d.opacity         ?? 100,
          bubbleColorMe:   d.bubbleColorMe   || "linear-gradient(135deg,#7c5cfc,#5b3ed4)",
          bubbleColorThem: d.bubbleColorThem || "rgba(255,255,255,0.07)",
          textColorMe:     d.textColorMe     || "#ffffff",
          textColorThem:   d.textColorThem   || "rgba(240,232,255,0.9)",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/api/settings`, settings, { headers: authHeader() });
      onSave(data);
      onClose();
    } catch (e) {
      console.error("save settings:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSettings(s => ({ ...s, backgroundType: "image", backgroundValue: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Live preview background style
  const previewBg = settings.backgroundType === "none" ? "#07071a"
    : settings.backgroundType === "image"
      ? `url(${settings.backgroundValue}) center/cover no-repeat`
      : settings.backgroundValue;

  const s = {
    overlay: { position: "fixed", inset: 0, background: "rgba(7,7,26,0.85)", backdropFilter: "blur(10px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
    modal:   { width: "min(700px,100%)", maxHeight: "90vh", background: "rgba(13,13,40,0.98)", border: "1px solid rgba(124,92,252,0.25)", borderRadius: 20, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" },
    header:  { padding: "18px 22px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
    title:   { fontSize: "1.05rem", fontWeight: 800, color: "#eeeeff", fontFamily: "'Plus Jakarta Sans',sans-serif" },
    body:    { display: "flex", flex: 1, overflow: "hidden", minHeight: 0 },
    left:    { flex: 1, overflowY: "auto", padding: "16px 18px", scrollbarWidth: "thin" },
    right:   { width: 220, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column" },
    footer:  { padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10, justifyContent: "flex-end" },
    label:   { fontSize: ".75rem", fontWeight: 700, color: "rgba(180,170,240,0.6)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, display: "block" },
    section: { marginBottom: 22 },
    tab:     (active) => ({ padding: "8px 16px", borderRadius: 10, border: "none", background: active ? "rgba(124,92,252,0.2)" : "transparent", color: active ? "#c4b5fd" : "rgba(180,170,240,0.5)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".82rem", fontWeight: 700, cursor: "pointer", transition: "all .15s" }),
    btn:     (primary) => ({ padding: "10px 22px", borderRadius: 12, border: primary ? "none" : "1px solid rgba(255,255,255,0.1)", background: primary ? "linear-gradient(135deg,#7c5cfc,#5b3ed4)" : "transparent", color: primary ? "white" : "rgba(180,170,240,0.6)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".85rem", fontWeight: 700, cursor: "pointer", transition: "all .2s" }),
  };

  if (loading) return (
    <div style={s.overlay}>
      <div style={{ color: "#c4b5fd", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Loading settings…</div>
    </div>
  );

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.title}>🎨 Chat Theme</div>
            <div style={{ fontSize: ".72rem", color: "rgba(180,170,240,0.45)", marginTop: 2, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Personalise your conversation look</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(180,170,240,0.6)", borderRadius: 10, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, padding: "10px 16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {["background", "bubbles"].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "background" ? "🖼 Background" : "💬 Bubbles & Text"}
            </button>
          ))}
        </div>

        <div style={s.body}>
          {/* ── Controls ── */}
          <div style={s.left}>

            {tab === "background" && (
              <>
                <div style={s.section}>
                  <span style={s.label}>Background Style</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { val: "none",     icon: "🚫", label: "None" },
                      { val: "color",    icon: "🎨", label: "Color" },
                      { val: "gradient", icon: "✨", label: "Gradient" },
                      { val: "image",    icon: "🖼", label: "Image" },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setSettings(s => ({ ...s, backgroundType: opt.val }))}
                        style={{
                          padding: "8px 14px", borderRadius: 10, border: settings.backgroundType === opt.val ? "1px solid rgba(124,92,252,0.7)" : "1px solid rgba(255,255,255,0.08)",
                          background: settings.backgroundType === opt.val ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)",
                          color: settings.backgroundType === opt.val ? "#c4b5fd" : "rgba(180,170,240,0.55)",
                          fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", transition: "all .15s",
                        }}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {settings.backgroundType === "color" && (
                  <div style={s.section}>
                    <span style={s.label}>Pick Color</span>
                    <input type="color" value={settings.backgroundValue || "#07071a"}
                      onChange={e => setSettings(s => ({ ...s, backgroundValue: e.target.value }))}
                      style={{ width: 60, height: 38, border: "none", background: "none", cursor: "pointer", borderRadius: 8 }}
                    />
                  </div>
                )}

                {settings.backgroundType === "gradient" && (
                  <div style={s.section}>
                    <span style={s.label}>Preset Gradients</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {BG_PRESETS.filter(p => p.type === "gradient").map(p => (
                        <button key={p.label} onClick={() => setSettings(s => ({ ...s, backgroundValue: p.value }))}
                          style={{ height: 48, borderRadius: 10, background: p.value, border: settings.backgroundValue === p.value ? "2px solid #7c5cfc" : "2px solid transparent", cursor: "pointer", transition: "border .15s" }}
                          title={p.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {settings.backgroundType === "image" && (
                  <div style={s.section}>
                    <span style={s.label}>Upload Image</span>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "1px dashed rgba(124,92,252,0.35)", cursor: "pointer", color: "rgba(180,170,240,0.6)", fontSize: ".82rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      📁 Choose image…
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                    {settings.backgroundValue && (
                      <div style={{ marginTop: 8, borderRadius: 10, overflow: "hidden", height: 80 }}>
                        <img src={settings.backgroundValue} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>
                )}

                {settings.backgroundType !== "none" && (
                  <div style={s.section}>
                    <span style={s.label}>Background Opacity: {settings.opacity}%</span>
                    <input type="range" min={0} max={100} value={settings.opacity}
                      onChange={e => setSettings(s => ({ ...s, opacity: +e.target.value }))}
                      style={{ width: "100%", accentColor: "#7c5cfc" }}
                    />
                  </div>
                )}
              </>
            )}

            {tab === "bubbles" && (
              <>
                <div style={s.section}>
                  <span style={s.label}>Your Bubble (preset gradients)</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {PRESET_GRADIENTS.map(g => (
                      <button key={g.label}
                        onClick={() => setSettings(s => ({ ...s, bubbleColorMe: g.value }))}
                        title={g.label}
                        style={{ height: 36, borderRadius: 10, background: g.value, border: settings.bubbleColorMe === g.value ? "2px solid white" : "2px solid transparent", cursor: "pointer", transition: "border .15s" }}
                      />
                    ))}
                  </div>
                </div>

                <div style={s.section}>
                  <span style={s.label}>Their Bubble (solid color)</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="color"
                      value={settings.bubbleColorThem?.startsWith("#") ? settings.bubbleColorThem : "#1a1a40"}
                      onChange={e => setSettings(s => ({ ...s, bubbleColorThem: e.target.value }))}
                      style={{ width: 50, height: 36, border: "none", background: "none", cursor: "pointer", borderRadius: 8 }}
                    />
                    <span style={{ fontSize: ".75rem", color: "rgba(180,170,240,0.5)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      Or paste CSS color / gradient
                    </span>
                  </div>
                  <input type="text" placeholder="e.g. rgba(255,255,255,0.07)" value={settings.bubbleColorThem}
                    onChange={e => setSettings(s => ({ ...s, bubbleColorThem: e.target.value }))}
                    style={{ marginTop: 8, width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#eeeeff", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".8rem" }}
                  />
                </div>

                <div style={s.section}>
                  <span style={s.label}>Your Text Color</span>
                  <input type="color" value={settings.textColorMe}
                    onChange={e => setSettings(s => ({ ...s, textColorMe: e.target.value }))}
                    style={{ width: 50, height: 36, border: "none", background: "none", cursor: "pointer" }}
                  />
                </div>

                <div style={s.section}>
                  <span style={s.label}>Their Text Color</span>
                  <input type="color"
                    value={settings.textColorThem?.startsWith("#") ? settings.textColorThem : "#e0d8ff"}
                    onChange={e => setSettings(s => ({ ...s, textColorThem: e.target.value }))}
                    style={{ width: 50, height: 36, border: "none", background: "none", cursor: "pointer" }}
                  />
                </div>
              </>
            )}
          </div>

          {/* ── Live Preview ── */}
          <div style={s.right}>
            <div style={{ padding: "10px 12px 6px", fontSize: ".7rem", fontWeight: 700, color: "rgba(180,170,240,0.45)", textTransform: "uppercase", letterSpacing: ".06em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Preview</div>
            <div style={{ flex: 1, overflow: "hidden", margin: "0 10px 10px", borderRadius: 14, position: "relative", background: previewBg, backgroundSize: "cover", backgroundPosition: "center" }}>
              {/* Opacity overlay */}
              {settings.backgroundType !== "none" && settings.opacity < 100 && (
                <div style={{ position: "absolute", inset: 0, background: "#07071a", opacity: 1 - settings.opacity / 100 }} />
              )}
              {/* Sample bubbles */}
              <div style={{ position: "relative", zIndex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
                {/* Their message */}
                <div style={{ alignSelf: "flex-start", maxWidth: "80%", padding: "9px 13px", borderRadius: 16, borderBottomLeftRadius: 4, background: settings.bubbleColorThem, color: settings.textColorThem, fontSize: ".76rem", fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.5 }}>
                  Hey! What's up? 👋
                </div>
                {/* My message */}
                <div style={{ alignSelf: "flex-end", maxWidth: "80%", padding: "9px 13px", borderRadius: 16, borderBottomRightRadius: 4, background: settings.bubbleColorMe, color: settings.textColorMe, fontSize: ".76rem", fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.5 }}>
                  All good, you? 😊
                </div>
                <div style={{ alignSelf: "flex-end", maxWidth: "80%", padding: "9px 13px", borderRadius: 16, borderBottomRightRadius: 4, background: settings.bubbleColorMe, color: settings.textColorMe, fontSize: ".76rem", fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.5 }}>
                  Loving this theme! 🎨
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button style={s.btn(false)} onClick={onClose}>Cancel</button>
          <button style={s.btn(true)} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Theme"}
          </button>
        </div>
      </div>
    </div>
  );
}