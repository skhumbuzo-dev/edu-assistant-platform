import { C } from '../constants.js';

export const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false, style = {} }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 4 }}>{label}{required && <span style={{ color: C.red[600] }}> *</span>}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
  </div>
);

export const Select = ({ label, value, onChange, options, placeholder = "Select..." }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 4 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export const Textarea = ({ label, value, onChange, rows = 4, placeholder = "" }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 4 }}>{label}</label>}
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
  </div>
);

export const Stat = ({ label, value, icon, color = "#1B6B3A" }) => (
  <div style={{ background: "#fff", border: `1px solid #e5e7eb`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
  </div>
);