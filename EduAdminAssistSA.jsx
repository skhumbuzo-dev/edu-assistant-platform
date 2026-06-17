import { useState, useEffect, useRef, useCallback } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = {
  async getFreelancers() {
    const res = await fetch(`${API_BASE}/freelancers`);
    if (!res.ok) throw new Error("Failed to fetch freelancers");
    return res.json();
  },
  async getJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  },
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 400: "#4ade80", 600: "#16a34a", 800: "#166534", 900: "#14532d" },
  gold: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 400: "#fbbf24", 600: "#d97706", 800: "#92400e", 900: "#78350f" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 400: "#60a5fa", 600: "#2563eb", 800: "#1e40af", 900: "#1e3a8a" },
  red: { 50: "#fff1f2", 100: "#ffe4e6", 400: "#f87171", 600: "#dc2626", 800: "#991b1b" },
  gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 400: "#2dd4bf", 600: "#0d9488", 800: "#115e59" },
};

const accent = "#1B6B3A";    // SA green
const accentLight = "#22a854";
const gold = "#D4A017";      // SA gold
const bgPage = "#f8faf9";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const PROVINCES = ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];
const CITIES = { "Gauteng": ["Johannesburg","Pretoria","Soweto","Sandton","Midrand"], "Western Cape": ["Cape Town","Stellenbosch","George","Paarl"], "KwaZulu-Natal": ["Durban","Pietermaritzburg","Richards Bay"], "Eastern Cape": ["East London","Port Elizabeth","Mthatha"], "Free State": ["Bloemfontein","Welkom"], "Limpopo": ["Polokwane","Tzaneen"], "Mpumalanga": ["Nelspruit","Witbank"], "Northern Cape": ["Kimberley"], "North West": ["Rustenburg","Mahikeng"] };
const CATEGORIES = ["Marking","Lesson Planning","Assessment Design","Moderation Support","Data Capturing","Resource Creation","SBA Portfolio Compilation","Exam Preparation Support"];
const CAT_ICONS = { "Marking": "✏️", "Lesson Planning": "📋", "Assessment Design": "📐", "Moderation Support": "🔍", "Data Capturing": "💻", "Resource Creation": "🖨️", "SBA Portfolio Compilation": "📁", "Exam Preparation Support": "📚" };
const SUBJECTS = ["Mathematics","Physical Sciences","Life Sciences","English Home Language","Afrikaans","History","Geography","Accounting","Business Studies","Economics","Life Orientation","Technology","Arts & Culture"];

const MOCK_FREELANCERS = [
  { id: "f1", name: "Thandi Nkosi", avatar: "TN", province: "Gauteng", city: "Johannesburg", categories: ["Marking","Lesson Planning","Assessment Design"], rating: 4.8, reviews: 47, jobs: 52, hourlyRate: 180, bio: "Former HOD with 15 years experience. CAPS expert across FET phase.", remote: true, inPerson: true, subjects: ["Mathematics","Physical Sciences"], verified: true },
  { id: "f2", name: "Johan van der Berg", avatar: "JV", province: "Western Cape", city: "Cape Town", categories: ["Resource Creation","Exam Preparation Support","SBA Portfolio Compilation"], rating: 4.9, reviews: 63, jobs: 71, hourlyRate: 200, bio: "Curriculum specialist. Expert in creating high-quality CAPS-aligned resources.", remote: true, inPerson: false, subjects: ["English Home Language","History","Geography"], verified: true },
  { id: "f3", name: "Zanele Dlamini", avatar: "ZD", province: "KwaZulu-Natal", city: "Durban", categories: ["Data Capturing","Moderation Support"], rating: 4.6, reviews: 28, jobs: 31, hourlyRate: 150, bio: "Specialist in SASAMS and school admin systems. Fast and accurate.", remote: true, inPerson: true, subjects: ["All Subjects"], verified: true },
  { id: "f4", name: "Mpho Sithole", avatar: "MS", province: "Gauteng", city: "Pretoria", categories: ["Assessment Design","Marking","Moderation Support"], rating: 4.7, reviews: 39, jobs: 43, hourlyRate: 170, bio: "IEB and NSC exam expert. Specialises in rubric design and standardisation.", remote: true, inPerson: true, subjects: ["Accounting","Business Studies","Economics"], verified: true },
  { id: "f5", name: "Liezel Botha", avatar: "LB", province: "Western Cape", city: "Stellenbosch", categories: ["Lesson Planning","Resource Creation","SBA Portfolio Compilation"], rating: 4.5, reviews: 19, jobs: 22, hourlyRate: 160, bio: "Creative educator with strong design skills. Makes beautiful resources.", remote: true, inPerson: false, subjects: ["Arts & Culture","Life Orientation"], verified: false },
];

const MOCK_JOBS = [
  { id: "j1", title: "Grade 12 Maths Paper 1 Marking", teacher: "Mrs. Priya Naidoo", teacherId: "t1", category: "Marking", budget: 1200, deadline: "2025-06-15", province: "KwaZulu-Natal", city: "Durban", remote: true, description: "Need experienced marker for 120 Grade 12 Mathematics Paper 1 scripts. NSC guidelines must be followed. Memorandum provided.", subject: "Mathematics", grade: "Grade 12", proposals: 4, status: "open", postedDate: "2025-05-28" },
  { id: "j2", title: "Term 3 Lesson Plans - Life Sciences Grade 10-12", teacher: "Mr. Andile Khumalo", teacherId: "t2", category: "Lesson Planning", budget: 2800, deadline: "2025-06-30", province: "Gauteng", city: "Johannesburg", remote: true, description: "Complete Term 3 lesson plans for Life Sciences across Grade 10, 11 and 12 aligned to CAPS ATP.", subject: "Life Sciences", grade: "Grade 10-12", proposals: 7, status: "open", postedDate: "2025-05-25" },
  { id: "j3", title: "SBA Portfolio Compilation - Accounting", teacher: "Ms. Fatima Adams", teacherId: "t3", category: "SBA Portfolio Compilation", budget: 950, deadline: "2025-06-10", province: "Western Cape", city: "Cape Town", remote: false, description: "Compile SBA portfolios for 2 classes (60 learners) in Accounting Grade 11. All documents provided.", subject: "Accounting", grade: "Grade 11", proposals: 2, status: "open", postedDate: "2025-06-01" },
  { id: "j4", title: "Grade 9 Data Capturing - Q2 Results", teacher: "Mr. Sipho Mokoena", teacherId: "t4", category: "Data Capturing", budget: 600, deadline: "2025-06-08", province: "Gauteng", city: "Pretoria", remote: true, description: "Data entry of Term 2 results for Grade 9 (180 learners, 8 subjects each) into Excel template provided.", subject: "All Subjects", grade: "Grade 9", proposals: 9, status: "open", postedDate: "2025-06-02" },
  { id: "j5", title: "Matric Exam Revision Worksheets - Physical Sciences", teacher: "Dr. Yolanda Pretorius", teacherId: "t5", category: "Exam Preparation Support", budget: 1500, deadline: "2025-07-01", province: "Gauteng", city: "Sandton", remote: true, description: "Create 10 comprehensive revision worksheets covering all Physical Sciences Paper 1 and 2 topics.", subject: "Physical Sciences", grade: "Grade 12", proposals: 5, status: "open", postedDate: "2025-05-30" },
];

const MOCK_TRANSACTIONS = [
  { id: "tx1", jobTitle: "History Essay Marking", teacher: "Mrs. B. Molefe", freelancer: "Thandi Nkosi", amount: 800, commission: 160, freelancerPayout: 640, date: "2025-05-20", status: "completed" },
  { id: "tx2", jobTitle: "Lesson Plan Bundle - English", teacher: "Mr. R. Pieterse", freelancer: "Johan van der Berg", amount: 1400, commission: 280, freelancerPayout: 1120, date: "2025-05-22", status: "completed" },
  { id: "tx3", jobTitle: "Grade 11 Data Entry", teacher: "Ms. L. Swart", freelancer: "Zanele Dlamini", amount: 550, commission: 110, freelancerPayout: 440, date: "2025-05-28", status: "completed" },
  { id: "tx4", jobTitle: "Maths Rubric Design", teacher: "Mr. K. Dube", freelancer: "Mpho Sithole", amount: 700, commission: 140, freelancerPayout: 560, date: "2025-06-01", status: "escrow" },
  { id: "tx5", jobTitle: "Resource Pack Creation", teacher: "Ms. N. Williams", freelancer: "Johan van der Berg", amount: 2200, commission: 440, freelancerPayout: 1760, date: "2025-06-03", status: "escrow" },
];

const MOCK_MESSAGES = [
  { id: "m1", from: "f1", fromName: "Thandi Nkosi", text: "Hello! I saw your Maths marking job. I have extensive experience with NSC Paper 1 marking and can start immediately.", time: "10:23" },
  { id: "m2", from: "me", fromName: "You", text: "Great! Could you share your experience with Grade 12 specifically?", time: "10:31" },
  { id: "m3", from: "f1", fromName: "Thandi Nkosi", text: "I've marked NSC Maths for 8 years including at provincial level. I also have IEB experience. I charge R180/hr and can complete 120 scripts in about 6 hours.", time: "10:35" },
  { id: "m4", from: "me", fromName: "You", text: "That sounds perfect. I'll accept your proposal. I'll release the escrow payment now.", time: "10:40" },
];

// ─── STORAGE (persistent across sessions) ─────────────────────────────────────
const useStorage = () => {
  const get = async (key) => { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } };
  const set = async (key, val) => { try { await window.storage.set(key, JSON.stringify(val)); } catch {} };
  return { get, set };
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const ZAR = (n) => `R${Number(n).toLocaleString("en-ZA")}`;
const Stars = ({ rating, size = 14 }) => {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return <span style={{ fontSize: size, color: gold, letterSpacing: 1 }}>{"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}</span>;
};
const Badge = ({ children, color = "green" }) => {
  const colors = { green: { bg: C.green[100], text: C.green[800] }, gold: { bg: C.gold[100], text: C.gold[800] }, blue: { bg: C.blue[100], text: C.blue[800] }, red: { bg: C.red[100], text: C.red[800] }, gray: { bg: C.gray[100], text: C.gray[600] }, teal: { bg: C.teal[100], text: C.teal[800] } };
  const c = colors[color] || colors.green;
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.3 }}>{children}</span>;
};
const Avatar = ({ initials, size = 40, color = accent }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>{initials}</div>
);
const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", border: `1px solid ${C.gray[200]}`, borderRadius: 12, padding: "1rem 1.25rem", ...style }}>{children}</div>
);
const Btn = ({ children, onClick, variant = "primary", size = "md", style = {}, disabled = false }) => {
  const base = { border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s", opacity: disabled ? 0.6 : 1 };
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "13px 28px", fontSize: 15 } };
  const variants = { primary: { background: accent, color: "#fff" }, secondary: { background: C.gray[100], color: C.gray[700] }, outline: { background: "transparent", color: accent, border: `1.5px solid ${accent}` }, danger: { background: C.red[600], color: "#fff" }, gold: { background: gold, color: "#fff" } };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>{children}</button>;
};
const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 4 }}>{label}{required && <span style={{ color: C.red[600] }}> *</span>}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
  </div>
);
const Select = ({ label, value, onChange, options, placeholder = "Select..." }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 4 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const Textarea = ({ label, value, onChange, rows = 4, placeholder = "" }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 4 }}>{label}</label>}
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
  </div>
);
const Stat = ({ label, value, icon, color = accent }) => (
  <div style={{ background: "#fff", border: `1px solid ${C.gray[200]}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
    <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 12, color: C.gray[500], marginTop: 2 }}>{label}</div>
  </div>
);

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NavBar = ({ user, setView, view, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = user?.role === "teacher"
    ? [["browse", "Browse Services"], ["my-jobs", "My Jobs"], ["post-job", "Post a Job"], ["messages", "Messages"]]
    : user?.role === "freelancer"
    ? [["browse-jobs", "Browse Jobs"], ["my-proposals", "My Proposals"], ["my-services", "My Services"], ["messages", "Messages"]]
    : [["admin-overview", "Overview"], ["admin-users", "Users"], ["admin-transactions", "Transactions"], ["admin-analytics", "Analytics"]];

  return (
    <nav style={{ background: accent, color: "#fff", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView(user ? (user.role === "teacher" ? "browse" : user.role === "admin" ? "admin-overview" : "browse-jobs") : "home")}>
        <span style={{ fontSize: 22 }}>🎓</span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>EduAdmin<span style={{ color: C.gold[200] }}>Assist</span> SA</span>
      </div>
      {user && (
        <div style={{ display: "flex", gap: 4 }}>
          {navLinks.map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              style={{ background: view === v ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: view === v ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={user.name.split(" ").map(n => n[0]).join("").slice(0, 2)} size={34} color={gold} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 11, opacity: 0.8, textTransform: "capitalize" }}>{user.role}</div>
            </div>
            <button onClick={() => { setUser(null); setView("home"); }}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Logout</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" variant="outline" style={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff" }} onClick={() => setView("login")}>Login</Btn>
            <Btn size="sm" style={{ background: gold, border: "none" }} onClick={() => setView("register")}>Sign Up</Btn>
          </div>
        )}
      </div>
    </nav>
  );
};

// ─── HOME ─────────────────────────────────────────────────────────────────────
const HomePage = ({ setView }) => {
  const [statsAnim] = useState({ teachers: 2847, freelancers: 614, jobs: 4391, paid: 1280000 });
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
            <Btn size="lg" style={{ background: gold, fontSize: 16 }} onClick={() => setView("register")}>Hire a Freelancer</Btn>
            <Btn size="lg" variant="outline" style={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff", fontSize: 16 }} onClick={() => setView("register-freelancer")}>Offer Your Services</Btn>
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
              <div key={cat} onClick={() => setView("browse")}
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
        <Btn size="lg" style={{ background: gold, fontSize: 16 }} onClick={() => setView("register")}>Get Started Free</Btn>
      </div>

      <footer style={{ background: C.gray[900], color: C.gray[400], padding: "32px 2rem", textAlign: "center", fontSize: 13 }}>
        <div style={{ marginBottom: 8 }}>🎓 EduAdmin Assist SA · Connecting Teachers with Admin Professionals</div>
        <div>Supporting all 9 provinces · Payments in ZAR · POPIA Compliant · 20% Platform Commission</div>
      </footer>
    </div>
  );
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const LoginPage = ({ setUser, setView }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const DEMO_USERS = [
    { email: "teacher@demo.com", password: "demo123", role: "teacher", name: "Mrs. Priya Naidoo", province: "KwaZulu-Natal", city: "Durban", balance: 5000 },
    { email: "freelancer@demo.com", password: "demo123", role: "freelancer", name: "Thandi Nkosi", province: "Gauteng", city: "Johannesburg", balance: 3840, categories: ["Marking","Lesson Planning","Assessment Design"], rating: 4.8, jobs: 52 },
    { email: "admin@demo.com", password: "admin123", role: "admin", name: "Platform Admin" },
  ];

  const handleLogin = () => {
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (user) { setUser(user); setView(user.role === "teacher" ? "browse" : user.role === "admin" ? "admin-overview" : "browse-jobs"); }
    else setError("Invalid credentials. Try: teacher@demo.com / demo123");
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: bgPage, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Card style={{ maxWidth: 420, width: "100%", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: "0 0 4px" }}>Welcome back</h2>
          <p style={{ color: C.gray[500], fontSize: 14, margin: 0 }}>Sign in to your EduAdmin Assist account</p>
        </div>
        {error && <div style={{ background: C.red[50], border: `1px solid ${C.red[100]}`, color: C.red[800], padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ background: C.gold[50], border: `1px solid ${C.gold[200]}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.gold[800], marginBottom: 18 }}>
          <strong>Demo credentials:</strong><br />
          Teacher: teacher@demo.com / demo123<br />
          Freelancer: freelancer@demo.com / demo123<br />
          Admin: admin@demo.com / admin123
        </div>
        <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="you@email.com" required />
        <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />
        <Btn style={{ width: "100%", marginTop: 4 }} size="lg" onClick={handleLogin}>Sign In</Btn>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.gray[500] }}>
          Don't have an account? <span style={{ color: accent, cursor: "pointer", fontWeight: 600 }} onClick={() => setView("register")}>Sign up</span>
        </div>
      </Card>
    </div>
  );
};

const RegisterPage = ({ setUser, setView, defaultRole = "teacher" }) => {
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [step, setStep] = useState(1);

  const handleRegister = () => {
    const user = { name, email, role, province, city, categories: selectedCats, balance: role === "teacher" ? 10000 : 0, rating: 0, jobs: 0 };
    setUser(user);
    setView(role === "teacher" ? "browse" : "browse-jobs");
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: bgPage, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Card style={{ maxWidth: 520, width: "100%", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: "0 0 4px" }}>Create your account</h2>
          <p style={{ color: C.gray[500], fontSize: 14, margin: 0 }}>Join South Africa's leading edu-admin marketplace</p>
        </div>
        {step === 1 && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
              {[["teacher", "👩‍🏫", "I'm a Teacher", "I need admin support"], ["freelancer", "🧑‍💼", "I'm a Freelancer", "I offer admin services"]].map(([r, icon, title, sub]) => (
                <div key={r} onClick={() => setRole(r)} style={{ flex: 1, border: `2px solid ${role === r ? accent : C.gray[200]}`, borderRadius: 10, padding: 14, cursor: "pointer", textAlign: "center", background: role === r ? C.green[50] : "#fff" }}>
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.gray[800] }}>{title}</div>
                  <div style={{ fontSize: 12, color: C.gray[500] }}>{sub}</div>
                </div>
              ))}
            </div>
            <Input label="Full Name" value={name} onChange={setName} placeholder="e.g. Thandi Nkosi" required />
            <Input label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@email.com" required />
            <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="Min. 8 characters" required />
            <Btn style={{ width: "100%" }} size="lg" onClick={() => setStep(2)} disabled={!name || !email || !password}>Continue</Btn>
          </>
        )}
        {step === 2 && (
          <>
            <Select label="Province" value={province} onChange={setProvince} options={PROVINCES} />
            <Select label="City" value={city} onChange={setCity} options={province ? (CITIES[province] || []) : []} placeholder="Select province first" />
            {role === "freelancer" && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 8 }}>Services You Offer</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {CATEGORIES.map(cat => (
                    <label key={cat} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", padding: "6px 10px", border: `1px solid ${selectedCats.includes(cat) ? accent : C.gray[200]}`, borderRadius: 8, background: selectedCats.includes(cat) ? C.green[50] : "#fff" }}>
                      <input type="checkbox" checked={selectedCats.includes(cat)} onChange={() => setSelectedCats(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat])} />
                      {CAT_ICONS[cat]} {cat}
                    </label>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</Btn>
              <Btn onClick={handleRegister} style={{ flex: 2 }} disabled={!province || !city}>Create Account</Btn>
            </div>
          </>
        )}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.gray[500] }}>
          Already have an account? <span style={{ color: accent, cursor: "pointer", fontWeight: 600 }} onClick={() => setView("login")}>Sign in</span>
        </div>
      </Card>
    </div>
  );
};

// ─── BROWSE FREELANCERS (Teacher View) ────────────────────────────────────────
const BrowsePage = ({ user, setView, setSelectedFreelancer }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getFreelancers()
      .then(setFreelancers)
      .catch(console.error)
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
                <Btn size="sm" onClick={() => { setSelectedFreelancer(f); setView("freelancer-profile"); }}>View Profile</Btn>
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

// ─── FREELANCER PROFILE ───────────────────────────────────────────────────────
const FreelancerProfile = ({ freelancer: f, user, setView }) => {
  const [showHire, setShowHire] = useState(false);
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [hired, setHired] = useState(false);

  if (!f) return null;
  const MOCK_REVIEWS = [
    { teacher: "Mrs. B. Molefe", rating: 5, date: "May 2025", text: "Exceptional work! Marked 150 scripts accurately and on time. Will definitely hire again." },
    { teacher: "Mr. A. Khumalo", rating: 5, date: "April 2025", text: "Professional and CAPS-aligned lesson plans. Saved me hours of work." },
    { teacher: "Ms. F. Adams", rating: 4, date: "March 2025", text: "Good quality work, responsive communication. Slightly slow but worth it." },
  ];

  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh - 60px)", padding: "0 0 3rem" }}>
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.gray[200]}`, padding: "16px 2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button onClick={() => setView("browse")} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← Back to Browse</button>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div>
            <Card style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <Avatar initials={f.avatar} size={70} color={accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: 0 }}>{f.name}</h1>
                    {f.verified && <Badge color="blue">✓ Verified</Badge>}
                  </div>
                  <div style={{ fontSize: 14, color: C.gray[500], marginBottom: 8 }}>📍 {f.city}, {f.province}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Stars rating={f.rating} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.gray[700] }}>{f.rating}</span>
                    <span style={{ fontSize: 13, color: C.gray[400] }}>({f.reviews} reviews · {f.jobs} jobs completed)</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {f.remote && <Badge color="teal">💻 Remote</Badge>}
                    {f.inPerson && <Badge color="green">🏫 In-person</Badge>}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.gray[100]}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.gray[700], marginBottom: 8 }}>About</div>
                <p style={{ fontSize: 14, color: C.gray[600], lineHeight: 1.7, margin: 0 }}>{f.bio} With deep knowledge of the CAPS curriculum and extensive experience supporting teachers across multiple grades and subjects, I deliver accurate, on-time admin support that meets DBE standards.</p>
              </div>
            </Card>

            <Card style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 14 }}>Services Offered</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {f.categories.map(cat => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.green[50], borderRadius: 8, border: `1px solid ${C.green[100]}` }}>
                    <span style={{ fontSize: 20 }}>{CAT_ICONS[cat]}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.gray[800] }}>{cat}</div>
                      <div style={{ fontSize: 12, color: C.gray[500] }}>{ZAR(f.hourlyRate)}/hr or per task</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 16 }}>Recent Reviews</div>
              {MOCK_REVIEWS.map((r, i) => (
                <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < MOCK_REVIEWS.length - 1 ? `1px solid ${C.gray[100]}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.teacher}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Stars rating={r.rating} size={12} />
                      <span style={{ fontSize: 12, color: C.gray[400] }}>{r.date}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: C.gray[600], margin: 0, lineHeight: 1.5 }}>{r.text}</p>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <Card style={{ position: "sticky", top: 80 }}>
              <div style={{ textAlign: "center", paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${C.gray[100]}` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: accent }}>{ZAR(f.hourlyRate)}</div>
                <div style={{ fontSize: 13, color: C.gray[500] }}>per hour / negotiable per task</div>
              </div>
              {!showHire ? (
                <>
                  <Btn style={{ width: "100%", marginBottom: 10 }} onClick={() => setShowHire(true)}>Hire Now</Btn>
                  <Btn variant="outline" style={{ width: "100%" }} onClick={() => setView("messages")}>Send Message</Btn>
                </>
              ) : hired ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                  <div style={{ fontWeight: 700, color: C.green[700], marginBottom: 6 }}>Invitation Sent!</div>
                  <div style={{ fontSize: 13, color: C.gray[500] }}>You'll receive a proposal from {f.name.split(" ")[0]} shortly.</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[800], marginBottom: 12 }}>Send an Invitation</div>
                  <Textarea label="Describe the task" value={message} onChange={setMessage} rows={3} placeholder="What do you need help with?" />
                  <Input label="Your Budget (ZAR)" value={budget} onChange={setBudget} type="number" placeholder="e.g. 800" />
                  <Btn style={{ width: "100%", marginBottom: 8 }} onClick={() => setHired(true)} disabled={!message || !budget}>Send Invitation</Btn>
                  <Btn variant="secondary" style={{ width: "100%" }} onClick={() => setShowHire(false)}>Cancel</Btn>
                </>
              )}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.gray[100]}`, fontSize: 12, color: C.gray[500] }}>
                <div style={{ marginBottom: 4 }}>🔐 Payments held in escrow</div>
                <div style={{ marginBottom: 4 }}>✅ 80% released on completion</div>
                <div>🛡️ POPIA-compliant platform</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── POST JOB ─────────────────────────────────────────────────────────────────
const PostJob = ({ user, setView }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", category: "", subject: "", grade: "", description: "", budget: "", deadline: "", province: user?.province || "", city: user?.city || "", remote: true, inPerson: false });
  const [posted, setPosted] = useState(false);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (posted) return (
    <div style={{ minHeight: "calc(100vh-60px)", background: bgPage, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <Card style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: "2.5rem" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], marginBottom: 8 }}>Job Posted Successfully!</h2>
        <p style={{ color: C.gray[500], fontSize: 14, marginBottom: 28 }}>Your task is now live. Freelancers in your area will start sending proposals soon.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="secondary" style={{ flex: 1 }} onClick={() => setView("my-jobs")}>View My Jobs</Btn>
          <Btn style={{ flex: 1 }} onClick={() => { setPosted(false); setStep(1); setForm({ title:"",category:"",subject:"",grade:"",description:"",budget:"",deadline:"",province:user?.province||"",city:user?.city||"",remote:true,inPerson:false }); }}>Post Another</Btn>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh-60px)", padding: "2rem" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], marginBottom: 6 }}>Post a Task</h1>
        <p style={{ color: C.gray[500], fontSize: 14, marginBottom: 24 }}>Describe what you need and receive proposals from qualified freelancers</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["Task Details", "Requirements", "Budget & Deadline"].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 4, borderRadius: 2, background: step > i ? accent : C.gray[200], marginBottom: 6 }} />
              <div style={{ fontSize: 11, color: step > i ? accent : C.gray[400], fontWeight: step === i + 1 ? 700 : 400 }}>{s}</div>
            </div>
          ))}
        </div>
        <Card>
          {step === 1 && (
            <>
              <Input label="Task Title" value={form.title} onChange={v => upd("title", v)} placeholder="e.g. Grade 12 Maths Paper 1 Marking" required />
              <Select label="Service Category" value={form.category} onChange={v => upd("category", v)} options={CATEGORIES} placeholder="Select a category..." />
              <Select label="Subject" value={form.subject} onChange={v => upd("subject", v)} options={SUBJECTS} />
              <Select label="Grade" value={form.grade} onChange={v => upd("grade", v)} options={["Grade R","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"]} />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn variant="secondary" style={{ flex: 1 }} onClick={() => setView("browse")}>Cancel</Btn>
                <Btn style={{ flex: 2 }} onClick={() => setStep(2)} disabled={!form.title || !form.category}>Continue</Btn>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <Textarea label="Task Description" value={form.description} onChange={v => upd("description", v)} rows={5} placeholder="Describe the task in detail — number of scripts, specific requirements, files provided, etc." />
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray[700], marginBottom: 8 }}>Work Location</div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {[["remote", "💻 Remote"], ["inPerson", "🏫 In-Person"]].map(([k, label]) => (
                  <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                    <input type="checkbox" checked={form[k]} onChange={() => upd(k, !form[k])} />
                    {label}
                  </label>
                ))}
              </div>
              <Select label="Province" value={form.province} onChange={v => upd("province", v)} options={PROVINCES} />
              <Select label="City" value={form.city} onChange={v => upd("city", v)} options={form.province ? (CITIES[form.province] || []) : []} />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn variant="secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</Btn>
                <Btn style={{ flex: 2 }} onClick={() => setStep(3)} disabled={!form.description}>Continue</Btn>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <Input label="Budget (ZAR)" value={form.budget} onChange={v => upd("budget", v)} type="number" placeholder="e.g. 1200" required />
              <Input label="Deadline" value={form.deadline} onChange={v => upd("deadline", v)} type="date" required />
              {form.budget && (
                <div style={{ background: C.gold[50], border: `1px solid ${C.gold[200]}`, borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: C.gold[800], marginBottom: 4 }}>Payment Breakdown</div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: C.gray[600] }}>
                    <span>Freelancer receives:</span><span style={{ fontWeight: 600 }}>{ZAR(form.budget * 0.8)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: C.gray[600] }}>
                    <span>Platform commission (20%):</span><span>{ZAR(form.budget * 0.2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: C.gray[800], borderTop: `1px solid ${C.gold[200]}`, paddingTop: 8, marginTop: 8 }}>
                    <span>You pay total:</span><span>{ZAR(form.budget)}</span>
                  </div>
                </div>
              )}
              <div style={{ background: C.blue[50], border: `1px solid ${C.blue[100]}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: C.blue[800] }}>
                🔐 Your payment will be held securely in escrow until you approve the completed work.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</Btn>
                <Btn style={{ flex: 2 }} onClick={() => setPosted(true)} disabled={!form.budget || !form.deadline}>Post Job</Btn>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

// ─── MY JOBS (Teacher) ────────────────────────────────────────────────────────
const MyJobs = ({ user, setView }) => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedJob, setSelectedJob] = useState(null);
  const [releasePaymentJob, setReleasePaymentJob] = useState(null);
  const [releaseDone, setReleaseDone] = useState(false);

  const tabs = { active: MOCK_JOBS.slice(0, 3), completed: [{ id: "jc1", title: "History Essay Marking", category: "Marking", budget: 800, status: "completed", freelancer: "Thandi Nkosi", grade: "Grade 10" }] };

  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh-60px)", padding: "2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: 0 }}>My Jobs</h1>
          <Btn onClick={() => setView("post-job")}>+ Post New Job</Btn>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {[["active", "Active Jobs"], ["completed", "Completed"]].map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: activeTab === t ? accent : C.gray[100], color: activeTab === t ? "#fff" : C.gray[600], fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
          ))}
        </div>
        {releaseDone && <div style={{ background: C.green[100], border: `1px solid ${C.green[200]}`, color: C.green[800], padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600, fontSize: 14 }}>✅ Payment released successfully! The freelancer has been paid.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(tabs[activeTab] || []).map(job => (
            <Card key={job.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.gray[900] }}>{job.title}</span>
                    <Badge color={job.status === "open" ? "green" : job.status === "completed" ? "gray" : "gold"}>{job.status}</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: C.gray[500] }}>
                    <span>{CAT_ICONS[job.category]} {job.category}</span>
                    <span>💰 {ZAR(job.budget)}</span>
                    {job.deadline && <span>📅 Due {job.deadline}</span>}
                    {job.proposals !== undefined && <span>📨 {job.proposals} proposals</span>}
                    {job.freelancer && <span>👤 {job.freelancer}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {job.status === "open" && <Btn size="sm" variant="outline" onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}>View Proposals</Btn>}
                  {job.status === "open" && job.proposals > 0 && <Btn size="sm" onClick={() => { setReleasePaymentJob(job); }}>Release Payment</Btn>}
                </div>
              </div>
              {selectedJob?.id === job.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.gray[100]}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.gray[700], marginBottom: 12 }}>Proposals Received</div>
                  {MOCK_FREELANCERS.slice(0, job.proposals).map(f => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.gray[100]}` }}>
                      <Avatar initials={f.avatar} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: C.gray[500] }}><Stars rating={f.rating} size={11} /> {f.rating} · {f.jobs} jobs</div>
                      </div>
                      <div style={{ fontWeight: 700, color: accent }}>{ZAR(job.budget * 0.9)}</div>
                      <Btn size="sm">Accept</Btn>
                    </div>
                  ))}
                </div>
              )}
              {releasePaymentJob?.id === job.id && !releaseDone && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.gray[100]}` }}>
                  <div style={{ background: C.gold[50], border: `1px solid ${C.gold[200]}`, borderRadius: 8, padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, color: C.gold[800], marginBottom: 8 }}>Release Escrow Payment</div>
                    <div style={{ fontSize: 13, color: C.gray[600], marginBottom: 12 }}>By releasing payment, you confirm the work is complete and satisfactory.</div>
                    <div style={{ fontSize: 13, marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Freelancer receives (80%):</span><span style={{ fontWeight: 700, color: C.green[700] }}>{ZAR(job.budget * 0.8)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: C.gray[500] }}><span>Platform fee (20%):</span><span>{ZAR(job.budget * 0.2)}</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="secondary" size="sm" onClick={() => setReleasePaymentJob(null)}>Cancel</Btn>
                      <Btn size="sm" onClick={() => { setReleaseDone(true); setReleasePaymentJob(null); }}>✅ Confirm Release</Btn>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── BROWSE JOBS (Freelancer View) ────────────────────────────────────────────
const BrowseJobs = ({ user, setView }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [proposalJob, setProposalJob] = useState(null);
  const [proposalText, setProposalText] = useState("");
  const [proposalPrice, setProposalPrice] = useState("");
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    api.getJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => !catFilter || j.category === catFilter);

  if (loading) return <div style={{ textAlign: "center", padding: "3rem" }}>Loading jobs...</div>;

  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh - 60px)", padding: "0 0 3rem" }}>
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.gray[200]}`, padding: "20px 2rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: "0 0 16px" }}>Browse Available Jobs</h1>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit" }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(job => (
            <Card key={job.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.gray[900] }}>{job.title}</span>
                    <Badge color="green">Open</Badge>
                    {job.remote && <Badge color="teal">Remote</Badge>}
                  </div>
                  <p style={{ fontSize: 13, color: C.gray[600], margin: "0 0 10px", lineHeight: 1.5 }}>{job.description}</p>
                  <div style={{ display: "flex", gap: 14, fontSize: 12, color: C.gray[500], flexWrap: "wrap" }}>
                    <span>{CAT_ICONS[job.category]} {job.category}</span>
                    <span>📚 {job.subject}</span>
                    <span>🎓 {job.grade}</span>
                    <span>📍 {job.city}, {job.province}</span>
                    <span>📅 Due {job.deadline}</span>
                    <span>📨 {job.proposals} proposals</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: accent, marginBottom: 4 }}>{ZAR(job.budget)}</div>
                  <div style={{ fontSize: 12, color: C.gray[400], marginBottom: 12 }}>You receive: {ZAR(job.budget * 0.8)}</div>
                  {submitted[job.id] ? (
                    <Badge color="green">✓ Proposal Sent</Badge>
                  ) : (
                    <Btn size="sm" onClick={() => setProposalJob(job)}>Submit Proposal</Btn>
                  )}
                </div>
              </div>
              {proposalJob?.id === job.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.gray[100]}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.gray[800], marginBottom: 12 }}>Submit Your Proposal</div>
                  <Textarea value={proposalText} onChange={setProposalText} rows={3} placeholder="Describe your experience and approach for this task..." />
                  <Input label="Your Price (ZAR)" value={proposalPrice} onChange={setProposalPrice} type="number" placeholder={`Budget: ${ZAR(job.budget)}`} />
                  <div style={{ background: C.gold[50], border: `1px solid ${C.gold[100]}`, borderRadius: 6, padding: "8px 12px", fontSize: 12, color: C.gold[800], marginBottom: 12 }}>
                    You will receive 80% = {proposalPrice ? ZAR(proposalPrice * 0.8) : "—"} after platform commission
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="secondary" size="sm" onClick={() => setProposalJob(null)}>Cancel</Btn>
                    <Btn size="sm" onClick={() => { setSubmitted(s => ({ ...s, [job.id]: true })); setProposalJob(null); setProposalText(""); setProposalPrice(""); }} disabled={!proposalText || !proposalPrice}>Submit Proposal</Btn>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
const Messages = ({ user }) => {
  const [msgs, setMsgs] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const bottomRef = useRef(null);

  const CONVERSATIONS = [
    { id: "c1", with: "Thandi Nkosi", avatar: "TN", lastMsg: "...I charge R180/hr", time: "10:35", unread: 1, job: "Grade 12 Maths Marking" },
    { id: "c2", with: "Johan van der Berg", avatar: "JV", lastMsg: "I'll send the plans by Friday", time: "Yesterday", unread: 0, job: "Lesson Plans - English" },
  ];

  const send = () => {
    if (!input.trim() && !file) return;
    setMsgs(m => [...m, { id: Date.now(), from: "me", fromName: "You", text: input || `📎 ${file.name}`, time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    setFile(null);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div style={{ background: bgPage, height: "calc(100vh - 60px)", display: "flex" }}>
      <div style={{ width: 280, background: "#fff", borderRight: `1px solid ${C.gray[200]}`, overflowY: "auto" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${C.gray[100]}`, fontWeight: 700, fontSize: 16, color: C.gray[900] }}>Messages</div>
        {CONVERSATIONS.map(c => (
          <div key={c.id} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.gray[100]}`, cursor: "pointer", background: c.id === "c1" ? C.green[50] : "transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={c.avatar} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: C.gray[800] }}>{c.with}</span>
                  <span style={{ fontSize: 11, color: C.gray[400] }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: C.gray[500], overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMsg}</div>
                <div style={{ fontSize: 11, color: accentLight }}>{c.job}</div>
              </div>
              {c.unread > 0 && <div style={{ background: accent, color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.unread}</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#fff", padding: "14px 20px", borderBottom: `1px solid ${C.gray[200]}`, display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials="TN" size={36} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.gray[900] }}>Thandi Nkosi</div>
            <div style={{ fontSize: 12, color: C.gray[500] }}>Re: Grade 12 Maths Paper 1 Marking</div>
          </div>
          <div style={{ marginLeft: "auto" }}><Badge color="green">Active</Badge></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {msgs.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
              {m.from !== "me" && <Avatar initials="TN" size={28} />}
              <div style={{ maxWidth: "70%" }}>
                <div style={{ fontSize: 11, color: C.gray[400], marginBottom: 3, textAlign: m.from === "me" ? "right" : "left" }}>{m.fromName} · {m.time}</div>
                <div style={{ background: m.from === "me" ? accent : "#fff", color: m.from === "me" ? "#fff" : C.gray[800], padding: "10px 14px", borderRadius: m.from === "me" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", fontSize: 14, border: m.from !== "me" ? `1px solid ${C.gray[200]}` : "none", lineHeight: 1.5 }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ background: "#fff", borderTop: `1px solid ${C.gray[200]}`, padding: "12px 16px" }}>
          {file && <div style={{ fontSize: 12, color: accent, marginBottom: 6 }}>📎 {file.name} <span style={{ cursor: "pointer" }} onClick={() => setFile(null)}>✕</span></div>}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ cursor: "pointer", color: C.gray[500], fontSize: 20 }}>
              📎<input type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
            </label>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", border: `1px solid ${C.gray[300]}`, borderRadius: 24, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            <Btn onClick={send} disabled={!input.trim() && !file}>Send</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── FREELANCER DASHBOARD ─────────────────────────────────────────────────────
const FreelancerDashboard = ({ user, setView }) => (
  <div style={{ background: bgPage, minHeight: "calc(100vh-60px)", padding: "2rem" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], marginBottom: 24 }}>My Services & Proposals</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        <Stat label="Active Proposals" value="3" icon="📨" />
        <Stat label="Jobs Completed" value={user?.jobs || 52} icon="✅" color={C.green[700]} />
        <Stat label="Avg Rating" value={user?.rating || "4.8"} icon="⭐" color={gold} />
        <Stat label="Earnings (ZAR)" value={ZAR(user?.balance || 3840)} icon="💰" color={accent} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 16 }}>Recent Proposals</div>
          {MOCK_JOBS.slice(0, 3).map(j => (
            <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.gray[100]}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.gray[800] }}>{j.title}</div>
                <div style={{ fontSize: 12, color: C.gray[500] }}>{j.category} · {j.city} · {ZAR(j.budget)}</div>
              </div>
              <Badge color="gold">Pending</Badge>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <Btn variant="outline" size="sm" onClick={() => setView("browse-jobs")}>Browse More Jobs →</Btn>
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 14 }}>My Services</div>
          {(user?.categories || ["Marking", "Lesson Planning"]).map(c => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.gray[100]}` }}>
              <span>{CAT_ICONS[c] || "📋"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray[800] }}>{c}</div>
                <div style={{ fontSize: 12, color: C.gray[500] }}>R180/hr</div>
              </div>
              <Badge color="green">Active</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  </div>
);

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminOverview = ({ setView }) => {
  const totalRevenue = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.commission, 0);
  const totalVolume = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0);
  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh-60px)", padding: "2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], margin: 0 }}>Admin Dashboard</h1>
            <div style={{ fontSize: 13, color: C.gray[500] }}>Platform Owner Control Panel</div>
          </div>
          <Badge color="red">🔴 Admin Access</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 28 }}>
          <Stat label="Total Revenue (20%)" value={ZAR(totalRevenue)} icon="💰" color={accent} />
          <Stat label="Total Volume" value={ZAR(totalVolume)} icon="📊" />
          <Stat label="Active Users" value="3,461" icon="👥" />
          <Stat label="Jobs Posted" value="4,391" icon="📋" />
          <Stat label="Pending Approvals" value="12" icon="⏳" color={C.gold[600]} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
          <Card>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 16 }}>Recent Transactions</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.gray[100]}` }}>
                  {["Job", "Teacher", "Freelancer", "Amount", "Commission", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.gray[500], fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: `1px solid ${C.gray[50]}` }}>
                    <td style={{ padding: "8px 8px", color: C.gray[800], fontWeight: 500 }}>{tx.jobTitle}</td>
                    <td style={{ padding: "8px 8px", color: C.gray[600] }}>{tx.teacher}</td>
                    <td style={{ padding: "8px 8px", color: C.gray[600] }}>{tx.freelancer}</td>
                    <td style={{ padding: "8px 8px", fontWeight: 600 }}>{ZAR(tx.amount)}</td>
                    <td style={{ padding: "8px 8px", color: C.green[700], fontWeight: 700 }}>{ZAR(tx.commission)}</td>
                    <td style={{ padding: "8px 8px" }}><Badge color={tx.status === "completed" ? "green" : "gold"}>{tx.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 14 }}>Quick Actions</div>
              {[["admin-users", "Manage Users", "👥"], ["admin-transactions", "View Transactions", "💳"], ["admin-analytics", "Analytics", "📈"]].map(([v, label, icon]) => (
                <button key={v} onClick={() => setView(v)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.gray[50], border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 8, fontWeight: 500, color: C.gray[700] }}>
                  <span>{icon}</span>{label} →
                </button>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 12 }}>Pending Freelancer Approvals</div>
              {[["Liezel Botha", "Western Cape", "Resource Creation"], ["Kgosi Molefe", "Gauteng", "Marking"]].map(([name, prov, cat]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Avatar initials={name.split(" ").map(n => n[0]).join("")} size={32} color={C.gray[500]} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: 11, color: C.gray[500] }}>{prov} · {cat}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn size="sm" style={{ padding: "4px 10px" }}>✓</Btn>
                    <Btn size="sm" variant="danger" style={{ padding: "4px 10px" }}>✗</Btn>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [tab, setTab] = useState("freelancers");
  const [search, setSearch] = useState("");
  const filtered = MOCK_FREELANCERS.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh-60px)", padding: "2rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], marginBottom: 24 }}>User Management</h1>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {["freelancers", "teachers"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: tab === t ? accent : C.gray[100], color: tab === t ? "#fff" : C.gray[600], fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
        <Card>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." style={{ padding: "8px 12px", border: `1px solid ${C.gray[300]}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", marginBottom: 16, width: 300 }} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.gray[100]}` }}>
                {["Name", "Location", "Categories", "Rating", "Jobs", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.gray[500], fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} style={{ borderBottom: `1px solid ${C.gray[50]}` }}>
                  <td style={{ padding: "10px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar initials={f.avatar} size={28} />
                      <span style={{ fontWeight: 600 }}>{f.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 10px", color: C.gray[600], fontSize: 13 }}>{f.city}, {f.province}</td>
                  <td style={{ padding: "10px 10px" }}><span style={{ fontSize: 12, color: C.gray[600] }}>{f.categories.slice(0, 2).join(", ")}{f.categories.length > 2 ? `+${f.categories.length - 2}` : ""}</span></td>
                  <td style={{ padding: "10px 10px" }}><Stars rating={f.rating} size={12} /> {f.rating}</td>
                  <td style={{ padding: "10px 10px", color: C.gray[600] }}>{f.jobs}</td>
                  <td style={{ padding: "10px 10px" }}><Badge color={f.verified ? "green" : "gold"}>{f.verified ? "Verified" : "Pending"}</Badge></td>
                  <td style={{ padding: "10px 10px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!f.verified && <Btn size="sm" style={{ padding: "4px 10px", fontSize: 12 }}>Approve</Btn>}
                      <Btn size="sm" variant="secondary" style={{ padding: "4px 10px", fontSize: 12 }}>View</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

const AdminTransactions = () => {
  const total20 = MOCK_TRANSACTIONS.reduce((s, t) => s + t.commission, 0);
  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh-60px)", padding: "2rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], marginBottom: 24 }}>Transactions & Commission</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          <Stat label="Total Commission Earned" value={ZAR(total20)} icon="💰" color={C.green[700]} />
          <Stat label="In Escrow" value={ZAR(MOCK_TRANSACTIONS.filter(t => t.status === "escrow").reduce((s, t) => s + t.amount, 0))} icon="🔐" color={C.gold[600]} />
          <Stat label="Transactions" value={MOCK_TRANSACTIONS.length} icon="📊" />
        </div>
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 16 }}>All Transactions</div>
          {MOCK_TRANSACTIONS.map(tx => (
            <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: 8, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.gray[100]}`, fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 600, color: C.gray[800] }}>{tx.jobTitle}</div>
                <div style={{ fontSize: 11, color: C.gray[400] }}>{tx.date}</div>
              </div>
              <div style={{ color: C.gray[600] }}>{tx.teacher}</div>
              <div style={{ color: C.gray[600] }}>{tx.freelancer}</div>
              <div style={{ fontWeight: 700 }}>{ZAR(tx.amount)}</div>
              <div style={{ color: C.green[700], fontWeight: 700 }}>{ZAR(tx.commission)}</div>
              <Badge color={tx.status === "completed" ? "green" : "gold"}>{tx.status}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const provinces = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Limpopo"];
  const counts = [1842, 934, 721, 432, 298];
  const maxCount = Math.max(...counts);
  return (
    <div style={{ background: bgPage, minHeight: "calc(100vh-60px)", padding: "2rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray[900], marginBottom: 24 }}>Platform Analytics</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Card>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 18 }}>Users by Province</div>
            {provinces.map((p, i) => (
              <div key={p} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: C.gray[700] }}>{p}</span>
                  <span style={{ fontWeight: 600 }}>{counts[i].toLocaleString()}</span>
                </div>
                <div style={{ height: 8, background: C.gray[100], borderRadius: 4 }}>
                  <div style={{ height: 8, background: accent, borderRadius: 4, width: `${(counts[i] / maxCount) * 100}%`, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 18 }}>Jobs by Category</div>
            {CATEGORIES.slice(0, 6).map((cat, i) => {
              const count = [1240, 983, 847, 621, 534, 412][i];
              return (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 16, width: 24 }}>{CAT_ICONS[cat]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                      <span style={{ color: C.gray[700] }}>{cat}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: C.gray[100], borderRadius: 3 }}>
                      <div style={{ height: 6, background: gold, borderRadius: 3, width: `${(count / 1240) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 16 }}>Monthly Revenue (ZAR)</div>
            {[["Jan", 8400], ["Feb", 11200], ["Mar", 15600], ["Apr", 19800], ["May", 24100]].map(([month, rev]) => (
              <div key={month} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ width: 32, fontSize: 13, color: C.gray[500] }}>{month}</span>
                <div style={{ flex: 1, height: 28, background: C.gray[100], borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: 28, background: `linear-gradient(90deg, ${accent}, ${accentLight})`, width: `${(rev / 24100) * 100}%`, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{ZAR(rev)}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gray[800], marginBottom: 16 }}>Platform Health</div>
            {[["Avg job completion time", "2.3 days"], ["Dispute rate", "1.2%"], ["Repeat teacher rate", "68%"], ["Avg freelancer rating", "4.7 ⭐"], ["Off-platform attempts blocked", "23 this month"], ["Active jobs right now", "142"]].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.gray[50]}`, fontSize: 13 }}>
                <span style={{ color: C.gray[600] }}>{label}</span>
                <span style={{ fontWeight: 700, color: C.gray[800] }}>{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  const renderView = () => {
    switch (view) {
      case "home": return <HomePage setView={setView} />;
      case "login": return <LoginPage setUser={setUser} setView={setView} />;
      case "register": return <RegisterPage setUser={setUser} setView={setView} defaultRole="teacher" />;
      case "register-freelancer": return <RegisterPage setUser={setUser} setView={setView} defaultRole="freelancer" />;
      case "browse": return <BrowsePage user={user} setView={setView} setSelectedFreelancer={setSelectedFreelancer} />;
      case "freelancer-profile": return <FreelancerProfile freelancer={selectedFreelancer} user={user} setView={setView} />;
      case "post-job": return <PostJob user={user} setView={setView} />;
      case "my-jobs": return <MyJobs user={user} setView={setView} />;
      case "browse-jobs": return <BrowseJobs user={user} setView={setView} />;
      case "my-proposals": return <FreelancerDashboard user={user} setView={setView} />;
      case "my-services": return <FreelancerDashboard user={user} setView={setView} />;
      case "messages": return <Messages user={user} />;
      case "admin-overview": return <AdminOverview setView={setView} />;
      case "admin-users": return <AdminUsers />;
      case "admin-transactions": return <AdminTransactions />;
      case "admin-analytics": return <AdminAnalytics />;
      default: return <HomePage setView={setView} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: bgPage }}>
      <NavBar user={user} setView={setView} view={view} setUser={setUser} />
      {renderView()}
    </div>
  );
}
