# EduAdmin Assist SA — Backend Documentation

## PostgreSQL Database Schema

```sql
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
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50),
  title      TEXT,
  body       TEXT,
  data       JSONB,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_province ON jobs(province);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_teacher ON jobs(teacher_id);
CREATE INDEX idx_proposals_job ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer ON proposals(freelancer_id);
CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_users_role ON users(role);
```

---

## API Endpoints (Express.js / Node.js)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (teacher or freelancer) |
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |

### Users / Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get own profile |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users/:id` | Get public profile |
| GET | `/api/freelancers` | List freelancers (with filters) |
| PUT | `/api/freelancers/me/services` | Update services offered |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs (filter: category, province, remote) |
| POST | `/api/jobs` | Create job (teacher only) |
| GET | `/api/jobs/:id` | Get job detail |
| PUT | `/api/jobs/:id` | Update job (owner only) |
| DELETE | `/api/jobs/:id` | Cancel job |
| POST | `/api/jobs/:id/accept/:proposalId` | Accept a proposal |

### Proposals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/:id/proposals` | List proposals for a job |
| POST | `/api/jobs/:id/proposals` | Submit proposal (freelancer) |
| PUT | `/api/proposals/:id` | Update proposal |
| DELETE | `/api/proposals/:id` | Withdraw proposal |

### Payments (Escrow)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initiate` | Initiate payment → create escrow |
| POST | `/api/payments/webhook` | PayFast / Stripe webhook |
| POST | `/api/payments/:txId/release` | Release escrow to freelancer |
| POST | `/api/payments/:txId/refund` | Refund to teacher (dispute) |
| GET | `/api/payments/history` | My transaction history |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | My conversations |
| GET | `/api/conversations/:id/messages` | Get messages |
| POST | `/api/conversations/:id/messages` | Send message |
| POST | `/api/conversations` | Start conversation |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/:id/reviews` | Submit review after completion |
| GET | `/api/users/:id/reviews` | Get user's reviews |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | All users with filters |
| PUT | `/api/admin/users/:id/approve` | Approve freelancer |
| PUT | `/api/admin/users/:id/suspend` | Suspend user |
| GET | `/api/admin/transactions` | All transactions |
| GET | `/api/admin/analytics` | Platform analytics |
| GET | `/api/admin/disputes` | Open disputes |
| PUT | `/api/admin/disputes/:id/resolve` | Resolve dispute |

---

## Payment Integration (PayFast — SA-native)

```javascript
// PayFast is the primary South African payment gateway
// Supports ZAR, EFT, credit cards, Instant EFT

const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  passphrase: process.env.PAYFAST_PASSPHRASE,
  sandbox: process.env.NODE_ENV !== 'production',
  return_url: `${process.env.APP_URL}/payment/success`,
  cancel_url: `${process.env.APP_URL}/payment/cancel`,
  notify_url: `${process.env.APP_URL}/api/payments/webhook`,
};

// Escrow flow:
// 1. Teacher pays → funds held in platform account
// 2. Job completed → teacher approves
// 3. Platform splits: 80% to freelancer (payout), 20% retained
// 4. Freelancer payout via PayFast payout API or manual EFT

// Alternative: Stripe (supports ZA with USD conversion)
// stripe.paymentIntents.create({ amount, currency: 'zar', ... })
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/eduadmin_sa

# Auth
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=7d

# PayFast (South Africa)
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=jt7NOE43FZPn
PAYFAST_SANDBOX=true

# Email (Postmark / SendGrid)
SMTP_HOST=smtp.postmarkapp.com
SMTP_FROM=noreply@eduadminassist.co.za

# Storage (Cloudflare R2 / AWS S3)
S3_BUCKET=eduadmin-files
S3_REGION=af-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Redis (for sessions, queues)
REDIS_URL=redis://localhost:6379

# App
PORT=3001
APP_URL=https://eduadminassist.co.za
COMMISSION_RATE=0.20
```

---

## Deployment (Vercel + Supabase + Railway)

### Option A: Vercel + Supabase (Recommended)

```bash
# 1. Clone and install
git clone https://github.com/yourorg/eduadmin-assist-sa
cd eduadmin-assist-sa
npm install

# 2. Setup Supabase (PostgreSQL + Auth + Storage)
#    - Create project at supabase.com
#    - Run schema.sql in SQL editor
#    - Copy connection string

# 3. Deploy frontend (Next.js) to Vercel
npx vercel deploy

# 4. Deploy API to Railway
railway init
railway up

# 5. Set environment variables in both platforms
vercel env add DATABASE_URL
railway variables set DATABASE_URL=...
```

### Option B: AWS (Production Scale)

```
Frontend:  CloudFront + S3 (React build)
API:       ECS Fargate (Node.js containers)
Database:  RDS PostgreSQL (af-south-1 region)
Cache:     ElastiCache Redis
Files:     S3 af-south-1
Email:     SES
```

---

## Sample Test Data (seed.sql)

```sql
-- Admin user
INSERT INTO users (email, password_hash, role, name, is_verified, is_approved)
VALUES ('admin@eduadminassist.co.za', '$2b$12$...', 'admin', 'Platform Admin', true, true);

-- Sample teachers
INSERT INTO users (email, password_hash, role, name, province, city, is_verified)
VALUES
  ('priya@demo.co.za', '$2b$12$...', 'teacher', 'Mrs. Priya Naidoo', 'KwaZulu-Natal', 'Durban', true),
  ('andile@demo.co.za', '$2b$12$...', 'teacher', 'Mr. Andile Khumalo', 'Gauteng', 'Johannesburg', true);

-- Sample freelancers (require admin approval)
INSERT INTO users (email, password_hash, role, name, province, city, is_verified, is_approved)
VALUES
  ('thandi@demo.co.za', '$2b$12$...', 'freelancer', 'Thandi Nkosi', 'Gauteng', 'Johannesburg', true, true),
  ('johan@demo.co.za', '$2b$12$...', 'freelancer', 'Johan van der Berg', 'Western Cape', 'Cape Town', true, true);
```

---

## Security & POPIA Compliance

- All passwords hashed with bcrypt (12 rounds)
- JWT tokens with 7-day expiry + refresh tokens
- Rate limiting on auth endpoints (5 req/min)
- HTTPS enforced via HSTS headers
- File uploads virus-scanned via ClamAV
- PII encrypted at rest (AES-256)
- POPIA consent logged with timestamp
- Right to deletion: `DELETE /api/users/me` anonymises all PII
- Off-platform payment detection: message scanner flags bank account numbers, cash requests
- Admin audit log for all destructive actions

---

## Project Structure

```
eduadmin-assist-sa/
├── frontend/                   # React/Next.js
│   ├── pages/
│   ├── components/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── marketplace/
│   │   ├── messages/
│   │   └── admin/
│   └── lib/
├── backend/                    # Node.js/Express
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── proposals.js
│   │   ├── payments.js
│   │   ├── messages.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── roles.js            # Role-based access
│   │   └── offPlatform.js      # Payment attempt detector
│   ├── models/
│   ├── services/
│   │   ├── payfast.js          # Payment gateway
│   │   ├── email.js            # Email notifications
│   │   └── storage.js          # File uploads
│   └── db/
│       └── schema.sql
└── README.md
```
