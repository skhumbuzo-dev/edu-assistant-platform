import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Btn } from '../helpers.jsx';
import { Input } from '../components/FormElements.jsx';
import { C, bgPage, accent } from '../constants.js';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate('/browse');
    } catch (err) {
      setError(err.message || "Invalid credentials. Try: teacher@demo.com / demo123");
    }
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
          Don't have an account? <span style={{ color: accent, cursor: "pointer", fontWeight: 600 }} onClick={() => navigate('/register')}>Sign up</span>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;