import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import { randomUUID } from "crypto";

dotenv.config();

const app = express();

// ─── UTILITY: Generate consistent IDs ──────────────────────────────────────────
const genId = () => randomUUID();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is required for production");
}

// SQLite Database Setup
const dbPath = "./eduassist.db";
const sqlite = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("SQLite connection error:", err);
    if (process.env.NODE_ENV === 'development') console.error("Error details:", err);
  } else if (process.env.NODE_ENV === 'development') {
    console.log("✅ Connected to SQLite database:", dbPath);
  }
});

sqlite.configure("busyTimeout", 5000);

// Helper functions for database queries
const db = {
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
};

(async () => {
  try {
    // Test connection
    await db.get("SELECT 1");
    if (process.env.NODE_ENV === 'development') console.log("✅ SQLite database ready");

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS freelancer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE,
      hourly_rate REAL,
      remote_available INTEGER DEFAULT 1,
      subjects TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(teacher_id) REFERENCES users(id),
      FOREIGN KEY(category_id) REFERENCES service_categories(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      freelancer_id TEXT,
      cover_letter TEXT NOT NULL,
      proposed_price REAL NOT NULL,
      estimated_days INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_id) REFERENCES jobs(id),
      FOREIGN KEY(freelancer_id) REFERENCES users(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      teacher_id TEXT,
      freelancer_id TEXT,
      last_message_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_id) REFERENCES jobs(id),
      FOREIGN KEY(teacher_id) REFERENCES users(id),
      FOREIGN KEY(freelancer_id) REFERENCES users(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      sender_id TEXT,
      body TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id) REFERENCES conversations(id),
      FOREIGN KEY(sender_id) REFERENCES users(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      teacher_id TEXT,
      freelancer_id TEXT,
      gross_amount REAL NOT NULL,
      commission_rate REAL DEFAULT 0.20,
      commission_amount REAL,
      freelancer_amount REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(job_id) REFERENCES jobs(id),
      FOREIGN KEY(teacher_id) REFERENCES users(id),
      FOREIGN KEY(freelancer_id) REFERENCES users(id)
    )`);

    // Ensure demo accounts exist
    const demoAccounts = [
      { id: "t1", name: "Teacher Demo", email: "teacher@demo.com", password: "demo123", role: "teacher", province: "Gauteng", city: "Pretoria", bio: "CAPS classroom teacher looking for admin support.", verified: 1 },
      { id: "f1", name: "Thandi Nkosi", email: "freelancer@demo.com", password: "demo123", role: "freelancer", province: "Gauteng", city: "Johannesburg", bio: "Former HOD with 15 years experience.", verified: 1 },
      { id: "f2", name: "Johan van der Berg", email: "johan@example.com", password: "pass", role: "freelancer", province: "Western Cape", city: "Cape Town", bio: "Curriculum specialist.", verified: 1 },
      { id: "a1", name: "Admin Demo", email: "admin@demo.com", password: "admin123", role: "admin", province: "Western Cape", city: "Cape Town", bio: "Platform administrator.", verified: 1 },
    ];

    for (const account of demoAccounts) {
      const existing = await db.get("SELECT id FROM users WHERE email = $1", [account.email]);
      if (!existing) {
        const passwordHash = await bcrypt.hash(account.password, 10);
        await db.run("INSERT INTO users (id, name, email, password_hash, role, province, city, bio, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [account.id, account.name, account.email, passwordHash, account.role, account.province, account.city, account.bio, account.verified]);
      }
    }

    // Insert sample data
    const count = await db.get("SELECT COUNT(*) as count FROM jobs", []);
    if (parseInt(count.count) === 0) {
      const freelancerProfiles = [
        { id: "f1_profile", user_id: "f1", hourly_rate: 180, remote_available: 1, subjects: '["Mathematics"]' },
        { id: "f2_profile", user_id: "f2", hourly_rate: 180, remote_available: 1, subjects: '["English"]' },
      ];

      for (const profile of freelancerProfiles) {
        const existing = await db.get("SELECT id FROM freelancer_profiles WHERE id = $1", [profile.id]);
        if (!existing) {
          await db.run("INSERT INTO freelancer_profiles (id, user_id, hourly_rate, remote_available, subjects) VALUES ($1, $2, $3, $4, $5)", [profile.id, profile.user_id, profile.hourly_rate, profile.remote_available, profile.subjects]);
        }
      }

      const jobs = [
        { id: "j1", title: "Grade 12 Maths Paper 1 Marking", teacher_id: "t1", category_id: 1, budget: 1200, deadline: "2025-06-15", province: "KwaZulu-Natal", city: "Durban", remote_ok: 1, description: "Need experienced marker.", subject: "Mathematics", grade_level: "Grade 12" },
      ];

      for (const j of jobs) {
        await db.run("INSERT INTO jobs (id, teacher_id, title, description, category_id, subject, grade_level, budget, deadline, province, city, remote_ok) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)", [j.id, j.teacher_id, j.title, j.description, j.category_id, j.subject, j.grade_level, j.budget, j.deadline, j.province, j.city, j.remote_ok]);
      }
    }

    console.log("Database schema initialized");
  } catch (err) {
    console.error("Database initialization error:", err);
    process.exit(1);
  }
})();

// Root route
app.get("/", (req, res) => {
  res.json({ message: "EduAssist Backend API is running", status: "ok", endpoints: ["/api/health", "/api/auth/login", "/api/auth/register", "/api/freelancers", "/api/jobs"] });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await db.get("SELECT 1", []);
    res.json({ ok: true, message: "Backend + DB are running" });
  } catch (err) {
    console.error("Health check failed:", err.message);
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
    const existing = await db.get("SELECT id FROM users WHERE email = $1", [normalizedEmail]);

    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = genId();
    const normalizedRole = role === "freelancer" ? "freelancer" : role === "admin" ? "admin" : "teacher";

    await db.run(
      "INSERT INTO users (id, name, email, password_hash, role, province, city, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [id, name.trim(), normalizedEmail, passwordHash, normalizedRole, province || null, city || null, bio || null]
    );

    if (normalizedRole === "freelancer") {
      const profileSubjects = Array.isArray(subjects) ? JSON.stringify(subjects) : JSON.stringify([subjects]);
      await db.run(
        "INSERT INTO freelancer_profiles (id, user_id, hourly_rate, remote_available, subjects) VALUES ($1, $2, $3, $4, $5)",
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
      "SELECT id, name, email, role, province, city, bio, password_hash FROM users WHERE email = $1",
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
    const user = await db.get("SELECT id, name, email, role, province, city, bio FROM users WHERE id = $1", [userId]);

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
             fp.hourly_rate as hourlyRate, fp.remote_available as remote, fp.subjects
      FROM users u
      LEFT JOIN freelancer_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'freelancer'
    `, []);

    const CATEGORIES = ["Marking","Lesson Planning","Assessment Design","Moderation Support","Data Capturing","Resource Creation","SBA Portfolio Compilation","Exam Preparation Support"];
    
    const enrichedFreelancers = freelancers.map(f => ({
      ...f,
      subjects: f.subjects ? JSON.parse(f.subjects) : [],
      avatar: f.name.split(' ').map(n => n[0]).join('').slice(0, 2),
      categories: f.subjects ? JSON.parse(f.subjects) : [CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]],
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 50) + 20,
      jobs: Math.floor(Math.random() * 50) + 30,
      inPerson: Math.random() > 0.5
    }));

    res.json(enrichedFreelancers);
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
             sc.name as category, u.name as teacher, j.created_at as postedDate,
             j.status,
             (SELECT COUNT(*) FROM proposals WHERE job_id = j.id) as proposals
      FROM jobs j
      LEFT JOIN service_categories sc ON j.category_id = sc.id
      LEFT JOIN users u ON j.teacher_id = u.id
    `, []);

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

    const jobId = genId();
    await db.run(`
      INSERT INTO jobs (id, teacher_id, title, description, category_id, subject, grade_level, budget, deadline, province, city, remote_ok)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [jobId, teacherId, title, description, categoryId, subject, gradeLevel, budget, deadline, province, city, remoteOk || 1]);

    const job = await db.get("SELECT * FROM jobs WHERE id = $1", [jobId]);
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
      WHERE j.id = $1
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

// ─── NEW ENDPOINTS ────────────────────────────────────────────────────────────

// Get proposals for a job
app.get("/api/jobs/:jobId/proposals", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.auth.userId;

    // Verify user is the teacher who posted this job
    const job = await db.get("SELECT teacher_id FROM jobs WHERE id = $1", [jobId]);
    if (!job || job.teacher_id !== userId) {
      return res.status(403).json({ error: "Not authorized to view proposals for this job" });
    }

    const proposals = await db.all(`
      SELECT p.*, u.name as freelancer_name, u.email as freelancer_email
      FROM proposals p
      JOIN users u ON p.freelancer_id = u.id
      WHERE p.job_id = $1
      ORDER BY p.created_at DESC
    `, [jobId]);

    res.json(proposals);
  } catch (err) {
    console.error("Proposals fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

// Accept proposal
app.put("/api/proposals/:proposalId/accept", requireAuth, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const userId = req.auth.userId;

    const proposal = await db.get(`
      SELECT p.*, j.teacher_id FROM proposals p
      JOIN jobs j ON p.job_id = j.id
      WHERE p.id = $1
    `, [proposalId]);

    if (!proposal || proposal.teacher_id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: "Proposal is no longer pending" });
    }

    // Accept this proposal
    await db.run("UPDATE proposals SET status = $1 WHERE id = $2", ['accepted', proposalId]);

    // Reject all other proposals for this job
    await db.run("UPDATE proposals SET status = $1 WHERE job_id = $2 AND id != $3", ['rejected', proposal.job_id, proposalId]);

    // Update job status
    await db.run("UPDATE jobs SET status = $1 WHERE id = $2", ['in_progress', proposal.job_id]);

    res.json({ message: "Proposal accepted", proposal });
  } catch (err) {
    console.error("Accept proposal failed:", err.message);
    res.status(500).json({ error: "Failed to accept proposal" });
  }
});

// Reject proposal
app.put("/api/proposals/:proposalId/reject", requireAuth, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const userId = req.auth.userId;

    const proposal = await db.get(`
      SELECT p.*, j.teacher_id FROM proposals p
      JOIN jobs j ON p.job_id = j.id
      WHERE p.id = $1
    `, [proposalId]);

    if (!proposal || proposal.teacher_id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.run("UPDATE proposals SET status = $1 WHERE id = $2", ['rejected', proposalId]);
    res.json({ message: "Proposal rejected" });
  } catch (err) {
    console.error("Reject proposal failed:", err.message);
    res.status(500).json({ error: "Failed to reject proposal" });
  }
});

// Get conversations
app.get("/api/conversations", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;

    const conversations = await db.all(`
      SELECT c.*, j.title as job_title,
             CASE WHEN c.teacher_id = $1 THEN u1.name ELSE u2.name END as other_user_name,
             CASE WHEN c.teacher_id = $1 THEN u1.id ELSE u2.id END as other_user_id
      FROM conversations c
      JOIN jobs j ON c.job_id = j.id
      JOIN users u1 ON c.teacher_id = u1.id
      JOIN users u2 ON c.freelancer_id = u2.id
      WHERE c.teacher_id = $1 OR c.freelancer_id = $1
      ORDER BY c.last_message_at DESC NULLS LAST
    `, [userId]);

    res.json(conversations);
  } catch (err) {
    console.error("Conversations fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a conversation
app.get("/api/messages/:conversationId", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.auth.userId;

    // Verify user is part of conversation
    const conv = await db.get(`
      SELECT id FROM conversations 
      WHERE id = $1 AND (teacher_id = $2 OR freelancer_id = $2)
    `, [conversationId, userId]);

    if (!conv) {
      return res.status(403).json({ error: "Not authorized to view messages" });
    }

    const messages = await db.all(`
      SELECT m.*, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId]);

    // Mark messages as read
    await db.run("UPDATE messages SET is_read = 1 WHERE conversation_id = $1 AND sender_id != $2", [conversationId, userId]);

    res.json(messages);
  } catch (err) {
    console.error("Messages fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
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
    const job = await db.get("SELECT id, status FROM jobs WHERE id = $1", [jobId]);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ error: "Job is no longer accepting proposals" });
    }

    // Check if user already submitted proposal
    const existing = await db.get("SELECT id FROM proposals WHERE job_id = $1 AND freelancer_id = $2", [jobId, freelancerId]);
    if (existing) {
      return res.status(409).json({ error: "You have already submitted a proposal for this job" });
    }

    const proposalId = genId();
    await db.run(`
      INSERT INTO proposals (id, job_id, freelancer_id, cover_letter, proposed_price, estimated_days)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [proposalId, jobId, freelancerId, coverLetter, proposedPrice, estimatedDays || null]);

    const proposal = await db.get("SELECT * FROM proposals WHERE id = $1", [proposalId]);
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
      WHERE job_id = $1 AND ((teacher_id = $2 AND freelancer_id = $3) OR (teacher_id = $3 AND freelancer_id = $2))
    `, [jobId, senderId, recipientId]);

    let conversationId;
    if (!conversation) {
      // Create conversation - get the users to determine roles
      const user1 = await db.get("SELECT role FROM users WHERE id = $1", [senderId]);
      const user2 = await db.get("SELECT role FROM users WHERE id = $1", [recipientId]);
      
      const teacherId = user1.role === 'teacher' ? senderId : recipientId;
      const freelancerId = user1.role === 'freelancer' ? senderId : recipientId;
      
      conversationId = genId();
      await db.run(`
        INSERT INTO conversations (id, job_id, teacher_id, freelancer_id)
        VALUES ($1, $2, $3, $4)
      `, [conversationId, jobId, teacherId, freelancerId]);
    } else {
      conversationId = conversation.id;
    }

    // Insert message
    const messageId = genId();
    await db.run(`
      INSERT INTO messages (id, conversation_id, sender_id, body)
      VALUES ($1, $2, $3, $4)
    `, [messageId, conversationId, senderId, body]);

    // Update conversation last_message_at
    await db.run("UPDATE conversations SET last_message_at = NOW() WHERE id = $1", [conversationId]);

    const message = await db.get("SELECT * FROM messages WHERE id = $1", [messageId]);
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
      WHERE t.id = $1 AND t.teacher_id = $2 AND t.status = $3
    `, [id, userId, 'escrow']);

    if (!tx) {
      return res.status(404).json({ error: "Transaction not found or not authorized to release" });
    }

    // Update transaction status
    await db.run(`
      UPDATE transactions 
      SET status = $1
      WHERE id = $2
    `, ['released', id]);

    // Update job status
    await db.run("UPDATE jobs SET status = $1 WHERE id = $2", ['completed', tx.job_id]);

    res.json({ message: "Payment released successfully", transaction: tx });
  } catch (err) {
    console.error("Payment release failed:", err.message);
    res.status(500).json({ error: "Failed to release payment" });
  }
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
