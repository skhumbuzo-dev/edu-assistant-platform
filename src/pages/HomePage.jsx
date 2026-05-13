import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Btn, Card } from '../helpers.jsx';
import { C, CATEGORIES, CAT_ICONS, accent, gold, accentLight } from '../constants.js';

const HomePage = () => {
  const [statsAnim] = useState({ teachers: 2847, freelancers: 614, jobs: 4391, paid: 1280000 });
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #134d28 60%, #0d3d1f 100%)`, color: "#fff", padding: "80px 2rem 90px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212,160,23,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,160,23,0.2)", border: "1px solid rgba(212,160,23,0.4)", borderRadius: 20, padding: "4px 14px", fontSize: 13, marginBottom: 24, color: C.gold[200] }}>
            🇿🇦 South Africa's #1 Education Admin Marketplace
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.15, letterSpacing: -1 }}>
            CAPS Admin Support,<br /><span style={{ color: C.gold[300] }}>Done For You</span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 2vw, 20px)", opacity: 0.85, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Connect with qualified freelancers who handle your marking, lesson planning, SBA portfolios, and more — so you can focus on teaching.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn size="lg" style={{ background: gold, fontSize: 16 }} onClick={() => navigate('/register')}>Hire a Freelancer</Btn>
            <Btn size="lg" variant="outline" style={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff", fontSize: 16 }} onClick={() => navigate('/register')}>Offer Your Services</Btn>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.gray[200]}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 2rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {[["👩‍🏫", statsAnim.teachers.toLocaleString(), "Registered Teachers"], ["🧑‍💼", statsAnim.freelancers.toLocaleString(), "Vetted Freelancers"], ["📋", statsAnim.jobs.toLocaleString(), "Jobs Completed"], ["💰", `R${(statsAnim.paid / 1000).toFixed(0)}k+`, "Paid to Freelancers"]].map(([icon, val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: accent }}>{val}</div>
              <div style={{ fontSize: 13, color: C.gray[500] }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: C.gray[900], marginBottom: 8 }}>How It Works</h2>
        <p style={{ textAlign: "center", color: C.gray[500], marginBottom: 40 }}>Three simple steps to get your admin done</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[["📝", "Post Your Task", "Describe what you need — marking, lesson plans, SBA portfolios — set your budget and deadline."],
            ["🔍", "Choose a Freelancer", "Browse proposals from qualified CAPS-experienced freelancers in your province."],
            ["✅", "Pay Securely", "Funds are held in escrow. Release payment only when you're satisfied with the work."]
          ].map(([icon, title, desc], i) => (
            <Card key={i} style={{ textAlign: "center", padding: "28px 20px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.green[100], margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: accentLight, letterSpacing: 1, marginBottom: 8 }}>STEP {i + 1}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.gray[900], margin: "0 0 10px" }}>{title}</h3>
              <p style={{ fontSize: 14, color: C.gray[500], lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ background: C.gray[50], padding: "56px 2rem", borderTop: `1px solid ${C.gray[200]}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: C.gray[900], marginBottom: 8 }}>CAPS-Aligned Service Categories</h2>
          <p style={{ textAlign: "center", color: C.gray[500], marginBottom: 40 }}>Every service is aligned to South Africa's CAPS curriculum requirements</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {CATEGORIES.map(cat => (
              <div key={cat} onClick={() => navigate('/browse')}
                style={{ background: "#fff", border: `1px solid ${C.gray[200]}`, borderRadius: 10, padding: "18px 14px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.gray[200]}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{CAT_ICONS[cat]}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray[800] }}>{cat}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: C.gray[900], marginBottom: 40 }}>Why Teachers Trust Us</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[["🔐", "Escrow Protection", "Your money is held safely until you approve the completed work."],
            ["⭐", "Verified Reviews", "All ratings are from real, completed transactions."],
            ["🛡️", "POPIA Compliant", "Your data is protected under South African POPIA regulations."],
            ["📍", "Location Matching", "Find freelancers near you or opt for fully remote services."],
            ["💬", "Built-in Chat", "Communicate and share files directly on the platform."],
            ["🚫", "Off-Platform Protection", "Our system prevents unprotected off-platform payments."]
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14 }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[800], marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: C.gray[500], lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: accent, color: "#fff", padding: "60px 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 12px" }}>Ready to reclaim your evenings?</h2>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 32 }}>Join thousands of SA teachers who've delegated their admin work.</p>
        <Btn size="lg" style={{ background: gold, fontSize: 16 }} onClick={() => navigate('/register')}>Get Started Free</Btn>
      </div>

      <footer style={{ background: C.gray[900], color: C.gray[400], padding: "32px 2rem", textAlign: "center", fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>🎓 EduAdmin Assist SA · Connecting Teachers with Admin Professionals</div>
        <div>Supporting all 9 provinces · Payments in ZAR · POPIA Compliant · 20% Platform Commission</div>
      </footer>
    </div>
  );
};

export default HomePage;