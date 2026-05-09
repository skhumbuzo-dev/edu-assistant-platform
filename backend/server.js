import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import { promisify } from "util";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const DATABASE_URL = process.env.DATABASE_URL || "./eduassist.db";

let db;

(async () => {
  db = new sqlite3.Database(DATABASE_URL);
  db.all = promisify(db.all.bind(db));
  db.get = promisify(db.get.bind(db));
  db.run = promisify(db.run.bind(db));

  // Create tables
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    province TEXT,
    city TEXT,
    bio TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE REFERENCES users(id),
    hourly_rate REAL,
    remote_available INTEGER DEFAULT 1,
    subjects TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT
  )`);

  await db.run(`INSERT OR IGNORE INTO service_categories (name, slug, icon) VALUES
    ('Marking', 'marking', '✏️'),
    ('Lesson Planning', 'lesson-planning', '📋'),
    ('Assessment Design', 'assessment-design', '📐'),
    ('Moderation Support', 'moderation-support', '🔍'),
    ('Data Capturing', 'data-capturing', '💻'),
    ('Resource Creation', 'resource-creation', '🖨️'),
    ('SBA Portfolio Compilation', 'sba-portfolio', '📁'),
    ('Exam Preparation Support', 'exam-prep', '📚')`);

  await db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    teacher_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER,
    subject TEXT,
    grade_level TEXT,
    budget REAL NOT NULL,
    deadline TEXT NOT NULL,
    province TEXT,
    city TEXT,
    remote_ok INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample data if empty
  const count = await db.get("SELECT COUNT(*) as count FROM users");
  if (count.count === 0) {
    const freelancers = [
      { id: "f1", name: "Thandi Nkosi", email: "thandi@example.com", password_hash: await bcrypt.hash("pass", 10), role: "freelancer", province: "Gauteng", city: "Johannesburg", bio: "Former HOD with 15 years experience.", remote_available: 1, subjects: '["Mathematics"]', verified: 1 },
      { id: "f2", name: "Johan van der Berg", email: "johan@example.com", password_hash: await bcrypt.hash("pass", 10), role: "freelancer", province: "Western Cape", city: "Cape Town", bio: "Curriculum specialist.", remote_available: 1, subjects: '["English"]', verified: 1 },
    ];

    for (const f of freelancers) {
      await db.run("INSERT INTO users (id, name, email, password_hash, role, province, city, bio, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [f.id, f.name, f.email, f.password_hash, f.role, f.province, f.city, f.bio, f.verified]);
      await db.run("INSERT INTO freelancer_profiles (id, user_id, hourly_rate, remote_available, subjects) VALUES (?, ?, ?, ?, ?)", [f.id + "_profile", f.id, 180, f.remote_available, f.subjects]);
    }

    const jobs = [
      { id: "j1", title: "Grade 12 Maths Paper 1 Marking", teacher_id: "t1", category_id: 1, budget: 1200, deadline: "2025-06-15", province: "KwaZulu-Natal", city: "Durban", remote_ok: 1, description: "Need experienced marker.", subject: "Mathematics", grade_level: "Grade 12" },
    ];

    for (const j of jobs) {
      await db.run("INSERT INTO jobs (id, teacher_id, title, description, category_id, subject, grade_level, budget, deadline, province, city, remote_ok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [j.id, j.teacher_id, j.title, j.description, j.category_id, j.subject, j.grade_level, j.budget, j.deadline, j.province, j.city, j.remote_ok]);
    }
  }

  console.log("Database initialized");
})();

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await db.get("SELECT 1");
    res.json({ ok: true, message: "Backend + DB are running" });
  } catch (err) {
    console.error("DB health check failed:", err.message);
    res.status(500).json({ ok: false, message: "DB connection failed" });
  }
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db.get("SELECT id FROM users WHERE email = ?", [normalizedEmail]);

    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substr(2, 9);

    await db.run(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [id, name.trim(), normalizedEmail, passwordHash, "teacher"]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: { id, name: name.trim(), email: normalizedEmail },
    });
  } catch (err) {
    console.error("Register failed:", err.message);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.get(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login failed:", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

// Auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Current user
app.get("/api/users/me", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await db.get("SELECT id, name, email FROM users WHERE id = ?", [userId]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch {
    return res.status(500).json({ error: "Failed to fetch current user" });
  }
});

// Freelancers
app.get("/api/freelancers", async (req, res) => {
  try {
    const freelancers = await db.all(`
      SELECT u.id, u.name, u.province, u.city, u.bio, u.is_verified as verified,
             fp.hourly_rate as hourlyRate, fp.remote_available as remote, fp.subjects,
             4.8 as rating, 47 as reviews, 52 as jobs
      FROM users u
      LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'freelancer'
    `);

    freelancers.forEach(f => {
      f.subjects = JSON.parse(f.subjects || '[]');
      f.avatar = f.name.split(' ').map(n => n[0]).join('').slice(0, 2);
      f.categories = ["Marking"];
    });

    res.json(freelancers);
  } catch (err) {
    console.error("Freelancers fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch freelancers" });
  }
});

// Jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await db.all(`
      SELECT j.id, j.title, j.description, j.budget, j.deadline, j.province, j.city,
             j.remote_ok as remote, j.subject, j.grade_level as grade,
             sc.name as category, 'Teacher' as teacher, j.created_at as postedDate,
             4 as proposals, j.status
      FROM jobs j
      LEFT JOIN service_categories sc ON j.category_id = sc.id
    `);

    res.json(jobs);
  } catch (err) {
    console.error("Jobs fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
