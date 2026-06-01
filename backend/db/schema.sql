-- ─── USERS ───────────────────────────────────────────────────────────────────
-- SQLite version (actual database used by server.js)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher','freelancer','admin')),
  name TEXT NOT NULL,
  province TEXT,
  city TEXT,
  bio TEXT,
  is_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ─── FREELANCER PROFILES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  hourly_rate REAL,
  remote_available INTEGER DEFAULT 1,
  subjects TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ─── SERVICE CATEGORIES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

INSERT OR IGNORE INTO service_categories (name, slug, icon) VALUES
  ('Marking', 'marking', '✏️'),
  ('Lesson Planning', 'lesson-planning', '📋'),
  ('Assessment Design', 'assessment-design', '📐'),
  ('Moderation Support', 'moderation-support', '🔍'),
  ('Data Capturing', 'data-capturing', '💻'),
  ('Resource Creation', 'resource-creation', '🖨️'),
  ('SBA Portfolio Compilation', 'sba-portfolio', '📁'),
  ('Exam Preparation Support', 'exam-prep', '📚');

-- ─── JOBS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  teacher_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES service_categories(id),
  subject TEXT,
  grade_level TEXT,
  budget REAL NOT NULL,
  deadline TEXT NOT NULL,
  province TEXT,
  city TEXT,
  remote_ok INTEGER DEFAULT 1,
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ─── PROPOSALS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  freelancer_id TEXT REFERENCES users(id),
  cover_letter TEXT NOT NULL,
  proposed_price REAL NOT NULL,
  estimated_days INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ─── TRANSACTIONS (ESCROW) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  teacher_id TEXT REFERENCES users(id),
  freelancer_id TEXT REFERENCES users(id),
  gross_amount REAL NOT NULL,
  commission_rate REAL DEFAULT 0.20,
  commission_amount REAL,
  freelancer_amount REAL,
  status TEXT DEFAULT 'pending',
  released_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  teacher_id TEXT REFERENCES users(id),
  freelancer_id TEXT REFERENCES users(id),
  last_message_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id),
  sender_id TEXT REFERENCES users(id),
  body TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
