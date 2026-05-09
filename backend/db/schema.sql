-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('teacher','freelancer','admin')),
  name          VARCHAR(255) NOT NULL,
  phone         VARCHAR(30),
  province      VARCHAR(100),
  city          VARCHAR(100),
  lat           DECIMAL(9,6),
  lng           DECIMAL(9,6),
  avatar_url    TEXT,
  bio           TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_approved   BOOLEAN DEFAULT FALSE,  -- admin approves freelancers
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  popia_consent BOOLEAN DEFAULT FALSE,
  popia_consented_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FREELANCER PROFILES ─────────────────────────────────────────────────────
CREATE TABLE freelancer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  hourly_rate     DECIMAL(10,2),
  per_task_rate   DECIMAL(10,2),
  remote_available    BOOLEAN DEFAULT TRUE,
  in_person_available BOOLEAN DEFAULT FALSE,
  subjects        TEXT[],
  grade_levels    TEXT[],
  years_experience INT,
  qualifications  TEXT,
  id_verified     BOOLEAN DEFAULT FALSE,
  sace_number     VARCHAR(50),
  total_earnings  DECIMAL(12,2) DEFAULT 0,
  total_jobs      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SERVICE CATEGORIES ──────────────────────────────────────────────────────
CREATE TABLE service_categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(10),
  description TEXT
);

INSERT INTO service_categories (name, slug, icon) VALUES
  ('Marking', 'marking', '✏️'),
  ('Lesson Planning', 'lesson-planning', '📋'),
  ('Assessment Design', 'assessment-design', '📐'),
  ('Moderation Support', 'moderation-support', '🔍'),
  ('Data Capturing', 'data-capturing', '💻'),
  ('Resource Creation', 'resource-creation', '🖨️'),
  ('SBA Portfolio Compilation', 'sba-portfolio', '📁'),
  ('Exam Preparation Support', 'exam-prep', '📚');

-- ─── FREELANCER SERVICES ─────────────────────────────────────────────────────
CREATE TABLE freelancer_services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id   INT REFERENCES service_categories(id),
  pricing_type  VARCHAR(20) CHECK (pricing_type IN ('hourly','per_task','fixed')),
  rate          DECIMAL(10,2) NOT NULL,
  description   TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  UNIQUE(freelancer_id, category_id)
);

-- ─── JOBS ────────────────────────────────────────────────────────────────────
CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(500) NOT NULL,
  description     TEXT NOT NULL,
  category_id     INT REFERENCES service_categories(id),
  subject         VARCHAR(100),
  grade_level     VARCHAR(50),
  budget          DECIMAL(10,2) NOT NULL,
  deadline        DATE NOT NULL,
  province        VARCHAR(100),
  city            VARCHAR(100),
  lat             DECIMAL(9,6),
  lng             DECIMAL(9,6),
  remote_ok       BOOLEAN DEFAULT TRUE,
  in_person_ok    BOOLEAN DEFAULT FALSE,
  status          VARCHAR(30) DEFAULT 'open'
                  CHECK (status IN ('open','in_progress','completed','cancelled','disputed')),
  accepted_freelancer_id UUID REFERENCES users(id),
  views           INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROPOSALS ───────────────────────────────────────────────────────────────
CREATE TABLE proposals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cover_letter  TEXT NOT NULL,
  proposed_price DECIMAL(10,2) NOT NULL,
  estimated_days INT,
  status        VARCHAR(20) DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, freelancer_id)
);

-- ─── TRANSACTIONS (ESCROW) ───────────────────────────────────────────────────
CREATE TABLE transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id            UUID REFERENCES jobs(id),
  teacher_id        UUID REFERENCES users(id),
  freelancer_id     UUID REFERENCES users(id),
  gross_amount      DECIMAL(12,2) NOT NULL,
  commission_rate   DECIMAL(5,4) DEFAULT 0.2000,  -- 20%
  commission_amount DECIMAL(12,2),
  freelancer_amount DECIMAL(12,2),
  status            VARCHAR(30) DEFAULT 'pending'
                    CHECK (status IN ('pending','escrow','released','refunded','disputed')),
  payment_intent_id TEXT,              -- Stripe/PayFast reference
  payment_method    VARCHAR(50),
  paid_at           TIMESTAMPTZ,
  released_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger: auto-calculate commission_amount and freelancer_amount
CREATE OR REPLACE FUNCTION calc_commission() RETURNS TRIGGER AS $$
BEGIN
  NEW.commission_amount := NEW.gross_amount * NEW.commission_rate;
  NEW.freelancer_amount := NEW.gross_amount - NEW.commission_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_commission BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION calc_commission();

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES jobs(id),
  teacher_id    UUID REFERENCES users(id),
  freelancer_id UUID REFERENCES users(id),
  last_message_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, teacher_id, freelancer_id)
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES users(id),
  body            TEXT,
  file_url        TEXT,
  file_name       VARCHAR(500),
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RATINGS & REVIEWS ───────────────────────────────────────────────────────
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID REFERENCES jobs(id),
  reviewer_id     UUID REFERENCES users(id),
  reviewee_id     UUID REFERENCES users(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, reviewer_id)
);

-- Materialized view for avg ratings (refresh hourly)
CREATE MATERIALIZED VIEW user_ratings AS
  SELECT reviewee_id as user_id,
         ROUND(AVG(rating)::numeric, 1) as avg_rating,
         COUNT(*) as review_count
  FROM reviews GROUP BY reviewee_id;

-- ─── DISPUTES ────────────────────────────────────────────────────────────────
CREATE TABLE disputes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES jobs(id),
  raised_by     UUID REFERENCES users(id),
  reason        TEXT NOT NULL,
  status        VARCHAR(20) DEFAULT 'open'
                CHECK (status IN ('open','under_review','resolved','escalated')),
  resolution    TEXT,
  resolved_by   UUID REFERENCES users(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
