import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Btn } from '../helpers.jsx';
import { Input, Select } from '../components/FormElements.jsx';
import { C, bgPage, accent, PROVINCES, CITIES, CATEGORIES, CAT_ICONS } from '../constants.js';
import { useAuth } from '../context/AuthContext.jsx';

const RegisterPage = () => {
  const [role, setRole] = useState("teacher");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      const bio = role === "freelancer"
        ? `Experienced ${selectedCats.join(", ")} support professional.`
        : "Teacher seeking reliable admin support.";

      await register({
        name,
        email,
        password,
        role,
        province,
        city,
        bio,
        subjects: selectedCats,
      });
      navigate('/browse');
    } catch (err) {
      setError(err.message || "Registration failed");
    }
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
        {error && <div style={{ background: C.red[50], border: `1px solid ${C.red[100]}`, color: C.red[800], padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.gray[500] }}>
          Already have an account? <span style={{ color: accent, cursor: "pointer", fontWeight: 600 }} onClick={() => navigate('/login')}>Sign in</span>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;