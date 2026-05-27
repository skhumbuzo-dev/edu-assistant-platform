import { gold, C } from './constants.js';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const ZAR = (n) => `R${Number(n).toLocaleString("en-ZA")}`;

export const Stars = ({ rating, size = 14 }) => {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return <span style={{ fontSize: size, color: gold, letterSpacing: 1 }}>{"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}</span>;
};

export const Badge = ({ children, color = "green" }) => {
  const colors = { green: { bg: "#dcfce7", text: "#166534" }, gold: { bg: "#fef3c7", text: "#92400e" }, blue: { bg: "#dbeafe", text: "#1e40af" }, red: { bg: "#ffe4e6", text: "#991b1b" }, gray: { bg: "#f3f4f6", text: "#4b5563" }, teal: { bg: "#ccfbf1", text: "#115e59" } };
  const c = colors[color] || colors.green;
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.3 }}>{children}</span>;
};

export const Avatar = ({ initials, size = 40, color = "#1B6B3A" }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>{initials}</div>
);

export const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", border: `1px solid #e5e7eb`, borderRadius: 12, padding: "1rem 1.25rem", ...style }}>{children}</div>
);

export const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) => {
  const base = { border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s", opacity: disabled ? 0.6 : 1 };
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "13px 28px", fontSize: 15 } };
  const variants = { primary: { background: "#1B6B3A", color: "#fff" }, secondary: { background: "#f3f4f6", color: "#374151" }, outline: { background: "transparent", color: "#1B6B3A", border: `1.5px solid #1B6B3A` }, danger: { background: "#dc2626", color: "#fff" }, gold: { background: "#D4A017", color: "#fff" } };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>{children}</button>;
};

export const Stat = ({ label, value, icon, color = "#1B6B3A" }) => (
  <div style={{ background: "#fff", border: `1px solid #e5e7eb`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
  </div>
);
