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

  await db.run(`CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    job_id TEXT REFERENCES jobs(id),
    freelancer_id TEXT REFERENCES users(id),
    cover_letter TEXT NOT NULL,
    proposed_price REAL NOT NULL,
    estimated_days INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    job_id TEXT REFERENCES jobs(id),
    teacher_id TEXT REFERENCES users(id),
    freelancer_id TEXT REFERENCES users(id),
    last_message_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id),
    sender_id TEXT REFERENCES users(id),
    body TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    job_id TEXT REFERENCES jobs(id),
    teacher_id TEXT REFERENCES users(id),
    freelancer_id TEXT REFERENCES users(id),
    gross_amount REAL NOT NULL,
    commission_rate REAL DEFAULT 0.20,
    commission_amount REAL,
    freelancer_amount REAL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Ensure demo accounts exist
  const demoAccounts = [
    { id: "t1", name: "Teacher Demo", email: "teacher@demo.com", password: "demo123", role: "teacher", province: "Gauteng", city: "Pretoria", bio: "CAPS classroom teacher looking for admin support.", verified: 1 },
    { id: "f1", name: "Thandi Nkosi", email: "freelancer@demo.com", password: "demo123", role: "freelancer", province: "Gauteng", city: "Johannesburg", bio: "Former HOD with 15 years experience.", verified: 1 },
    { id: "f2", name: "Johan van der Berg", email: "johan@example.com", password: "pass", role: "freelancer", province: "Western Cape", city: "Cape Town", bio: "Curriculum specialist.", verified: 1 },
    { id: "a1", name: "Admin Demo", email: "admin@demo.com", password: "admin123", role: "admin", province: "Western Cape", city: "Cape Town", bio: "Platform administrator.", verified: 1 },
  ];

  for (const account of demoAccounts) {
    const existing = await db.get("SELECT id FROM users WHERE email = ?", [account.email]);
    if (!existing) {
      const passwordHash = await bcrypt.hash(account.password, 10);
      await db.run("INSERT INTO users (id, name, email, password_hash, role, province, city, bio, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [account.id, account.name, account.email, passwordHash, account.role, account.province, account.city, account.bio, account.verified]);
    }
  }

  // Insert sample data
  const count = await db.get("SELECT COUNT(*) as count FROM jobs");
  if (count.count === 0) {
    const freelancerProfiles = [
      { id: "f1_profile", user_id: "f1", hourly_rate: 180, remote_available: 1, subjects: '["Mathematics"]' },
      { id: "f2_profile", user_id: "f2", hourly_rate: 180, remote_available: 1, subjects: '["English"]' },
    ];

    for (const profile of freelancerProfiles) {
      const existing = await db.get("SELECT id FROM freelancer_profiles WHERE id = ?", [profile.id]);
      if (!existing) {
        await db.run("INSERT INTO freelancer_profiles (id, user_id, hourly_rate, remote_available, subjects) VALUES (?, ?, ?, ?, ?)", [profile.id, profile.user_id, profile.hourly_rate, profile.remote_available, profile.subjects]);
      }
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

// Root route
app.get("/", (req, res) => {
  res.json({ message: "EduAssist Backend API is running", status: "ok", endpoints: ["/api/health", "/api/auth/login", "/api/auth/register", "/api/freelancers", "/api/jobs"] });
});

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
    const { name, email, password, role = "teacher", province, city, bio, subjects = [] } = req.body;

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
    const normalizedRole = role === "freelancer" ? "freelancer" : role === "admin" ? "admin" : "teacher";

    await db.run(
      "INSERT INTO users (id, name, email, password_hash, role, province, city, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name.trim(), normalizedEmail, passwordHash, normalizedRole, province || null, city || null, bio || null]
    );

    if (normalizedRole === "freelancer") {
      const profileSubjects = Array.isArray(subjects) ? JSON.stringify(subjects) : JSON.stringify([subjects]);
      await db.run(
        "INSERT INTO freelancer_profiles (id, user_id, hourly_rate, remote_available, subjects) VALUES (?, ?, ?, ?, ?)",
        [id + "_profile", id, 180, 1, profileSubjects]
      );
    }

    const token = jwt.sign(
      { userId: id, email: normalizedEmail },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id, name: name.trim(), email: normalizedEmail, role: normalizedRole, province: province || null, city: city || null, bio: bio || null },
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
      "SELECT id, name, email, role, province, city, bio, password_hash FROM users WHERE email = ?",
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role, province: user.province, city: user.city, bio: user.bio },
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
    const user = await db.get("SELECT id, name, email, role, province, city, bio FROM users WHERE id = ?", [userId]);

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

// Create job
app.post("/api/jobs", requireAuth, async (req, res) => {
  try {
    const { title, description, categoryId, subject, gradeLevel, budget, deadline, province, city, remoteOk } = req.body;
    const teacherId = req.auth.userId;

    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({ error: "Title, description, budget, and deadline are required" });
    }

    const jobId = Math.random().toString(36).substr(2, 9);
    await db.run(`
      INSERT INTO jobs (id, teacher_id, title, description, category_id, subject, grade_level, budget, deadline, province, city, remote_ok)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [jobId, teacherId, title, description, categoryId, subject, gradeLevel, budget, deadline, province, city, remoteOk || true]);

    const job = await db.get("SELECT * FROM jobs WHERE id = ?", [jobId]);
    res.status(201).json(job);
  } catch (err) {
    console.error("Job creation failed:", err.message);
    res.status(500).json({ error: "Failed to create job" });
  }
});

// Get job by ID
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await db.get(`
      SELECT j.*, sc.name as category_name, u.name as teacher_name
      FROM jobs j
      LEFT JOIN service_categories sc ON j.category_id = sc.id
      LEFT JOIN users u ON j.teacher_id = u.id
      WHERE j.id = ?
    `, [id]);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    console.error("Job fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Submit proposal
app.post("/api/proposals", requireAuth, async (req, res) => {
  try {
    const { jobId, coverLetter, proposedPrice, estimatedDays } = req.body;
    const freelancerId = req.auth.userId;

    if (!jobId || !coverLetter || !proposedPrice) {
      return res.status(400).json({ error: "Job ID, cover letter, and proposed price are required" });
    }

    // Check if job exists and is open
    const job = await db.get("SELECT id, status FROM jobs WHERE id = ?", [jobId]);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ error: "Job is no longer accepting proposals" });
    }

    // Check if user already submitted proposal
    const existing = await db.get("SELECT id FROM proposals WHERE job_id = ? AND freelancer_id = ?", [jobId, freelancerId]);
    if (existing) {
      return res.status(409).json({ error: "You have already submitted a proposal for this job" });
    }

    const proposalId = Math.random().toString(36).substr(2, 9);
    await db.run(`
      INSERT INTO proposals (id, job_id, freelancer_id, cover_letter, proposed_price, estimated_days)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [proposalId, jobId, freelancerId, coverLetter, proposedPrice, estimatedDays]);

    const proposal = await db.get("SELECT * FROM proposals WHERE id = ?", [proposalId]);
    res.status(201).json(proposal);
  } catch (err) {
    console.error("Proposal submission failed:", err.message);
    res.status(500).json({ error: "Failed to submit proposal" });
  }
});

// Send message
app.post("/api/messages", requireAuth, async (req, res) => {
  try {
    const { jobId, recipientId, body } = req.body;
    const senderId = req.auth.userId;

    if (!jobId || !recipientId || !body) {
      return res.status(400).json({ error: "Job ID, recipient ID, and message body are required" });
    }

    // Get or create conversation
    let conversation = await db.get(`
      SELECT id FROM conversations 
      WHERE job_id = ? AND ((teacher_id = ? AND freelancer_id = ?) OR (teacher_id = ? AND freelancer_id = ?))
    `, [jobId, senderId, recipientId, recipientId, senderId]);

    let conversationId;
    if (!conversation) {
      // Create conversation - get the users to determine roles
      const user1 = await db.get("SELECT role FROM users WHERE id = ?", [senderId]);
      const user2 = await db.get("SELECT role FROM users WHERE id = ?", [recipientId]);
      
      const teacherId = user1.role === 'teacher' ? senderId : recipientId;
      const freelancerId = user1.role === 'freelancer' ? senderId : recipientId;
      
      conversationId = Math.random().toString(36).substr(2, 9);
      await db.run(`
        INSERT INTO conversations (id, job_id, teacher_id, freelancer_id)
        VALUES (?, ?, ?, ?)
      `, [conversationId, jobId, teacherId, freelancerId]);
    } else {
      conversationId = conversation.id;
    }

    // Insert message
    const messageId = Math.random().toString(36).substr(2, 9);
    await db.run(`
      INSERT INTO messages (id, conversation_id, sender_id, body)
      VALUES (?, ?, ?, ?)
    `, [messageId, conversationId, senderId, body]);

    // Update conversation last_message_at
    await db.run("UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?", [conversationId]);

    const message = await db.get("SELECT * FROM messages WHERE id = ?", [messageId]);
    res.status(201).json(message);
  } catch (err) {
    console.error("Message send failed:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Release escrow payment
app.put("/api/transactions/:id/release", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    // Find transaction and verify ownership
    const tx = await db.get(`
      SELECT t.*, j.title as job_title, u.name as freelancer_name
      FROM transactions t
      JOIN jobs j ON t.job_id = j.id
      JOIN users u ON t.freelancer_id = u.id
      WHERE t.id = ? AND t.teacher_id = ? AND t.status = ?
    `, [id, userId, 'escrow']);

    if (!tx) {
      return res.status(404).json({ error: "Transaction not found or not authorized to release" });
    }

    // Update transaction status
    await db.run(`
      UPDATE transactions 
      SET status = ?, released_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, ['released', id]);

    // Update job status
    await db.run("UPDATE jobs SET status = ? WHERE id = ?", ['completed', tx.job_id]);

    res.json({ message: "Payment released successfully", transaction: tx });
  } catch (err) {
    console.error("Payment release failed:", err.message);
    res.status(500).json({ error: "Failed to release payment" });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
