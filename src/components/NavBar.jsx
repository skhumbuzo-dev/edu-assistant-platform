import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from '../helpers.jsx';
import { accent, gold, C } from '../constants.js';
import { useAuth } from '../context/AuthContext.jsx';

const NavBar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = user?.role === 'teacher'
    ? [{ to: '/browse', label: 'Browse Services' }, { to: '/jobs', label: 'My Jobs' }, { to: '/post-job', label: 'Post a Job' }]
    : user?.role === 'freelancer'
    ? [{ to: '/jobs', label: 'Browse Jobs' }, { to: '/browse', label: 'Browse Services' }]
    : [{ to: '/', label: 'Overview' }];

  const activePath = location.pathname;

  return (
    <nav style={{ background: accent, color: "#fff", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
        <span style={{ fontSize: 22 }}>🎓</span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>EduAdmin<span style={{ color: gold }}>Assist</span> SA</span>
      </div>
      {user && (
        <div style={{ display: "flex", gap: 4 }}>
          {navLinks.map(link => (
            <button key={link.to} onClick={() => navigate(link.to)}
              style={{ background: activePath === link.to ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: activePath === link.to ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
              {link.label}
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
            <button onClick={() => { logout(); navigate("/"); }}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Logout</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate('/login')}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.6)", color: "#fff", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Login</button>
            <button onClick={() => navigate('/register')}
              style={{ background: gold, border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;