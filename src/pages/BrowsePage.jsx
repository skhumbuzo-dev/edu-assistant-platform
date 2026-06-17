import { useState, useEffect } from 'react';
import { Card, Avatar, Badge, Stars, ZAR } from '../helpers.jsx';
import { C, bgPage, accent, CATEGORIES, CAT_ICONS, PROVINCES } from '../constants.js';
import { api } from '../api.js';

const BrowsePage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getFreelancers()
      .then(setFreelancers)
      .catch(err => {
        if (import.meta.env.DEV) console.error("Failed to fetch freelancers:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = freelancers.filter(f =>
    (!catFilter || f.categories.includes(catFilter)) &&
    (!provinceFilter || f.province === provinceFilter) &&
    (!remoteOnly || f.remote) &&
    (!search || f.name.toLowerCase().includes(search.toLowerCase()) || f.categories.some(c => c.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) return <div style={{ textAlign: "center", padding: "3rem" }}>Loading freelancers...</div>;

  return (
    <div style={{ minHeight: "calc(100vh-60px)", background: bgPage, padding: "0 0 3rem" }}>
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.gray[200]}`, padding: "20px 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: "0 0 16px" }}>Browse CAPS Admin Freelancers</h1>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or service..." style={{ padding: "8px 14px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", flex: 1, minWidth: 200 }} />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit" }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
            <select value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit" }}>
              <option value="">All Provinces</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
              <input type="checkbox" checked={remoteOnly} onChange={() => setRemoteOnly(!remoteOnly)} />Remote only
            </label>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 2rem" }}>
        <div style={{ fontSize: 14, color: C.gray[500], marginBottom: 16 }}>{filtered.length} freelancer{filtered.length !== 1 ? "s" : ""} found</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
          {filtered.map(f => (
            <Card key={f.id} style={{ cursor: "pointer", transition: "all 0.2s", borderColor: C.gray[200] }}
              onMouseEnter={e => e.currentTarget.style.borderColor = accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.gray[200]}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                <Avatar initials={f.avatar} size={48} color={accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: C.gray[900] }}>{f.name}</span>
                    {f.verified && <span title="Verified" style={{ color: C.blue[600] }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.gray[500] }}>📍 {f.city}, {f.province}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <Stars rating={f.rating} size={13} />
                    <span style={{ fontSize: 12, color: C.gray[500] }}>{f.rating} ({f.reviews} reviews)</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: accent }}>{ZAR(f.hourlyRate)}</div>
                  <div style={{ fontSize: 11, color: C.gray[400] }}>per hour</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.gray[600], lineHeight: 1.5, margin: "0 0 12px" }}>{f.bio}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {f.categories.map(c => <Badge key={c} color="green">{CAT_ICONS[c]} {c}</Badge>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, color: C.gray[500] }}>
                  {f.remote && <span>💻 Remote</span>}
                  {f.inPerson && <span> · 🏫 In-person</span>}
                  · <span>{f.jobs} jobs</span>
                </div>
                <button style={{ background: accent, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>View Profile</button>
              </div>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.gray[400] }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No freelancers found</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;