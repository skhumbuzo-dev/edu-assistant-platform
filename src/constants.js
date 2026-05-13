// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const C = {
  green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 400: "#4ade80", 600: "#16a34a", 800: "#166534", 900: "#14532d" },
  gold: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 400: "#fbbf24", 600: "#d97706", 800: "#92400e", 900: "#78350f" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 400: "#60a5fa", 600: "#2563eb", 800: "#1e40af", 900: "#1e3a8a" },
  red: { 50: "#fff1f2", 100: "#ffe4e6", 400: "#f87171", 600: "#dc2626", 800: "#991b1b" },
  gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 400: "#2dd4bf", 600: "#0d9488", 800: "#115e59" },
};

export const accent = "#1B6B3A";    // SA green
export const accentLight = "#22a854";
export const gold = "#D4A017";      // SA gold
export const bgPage = "#f8faf9";

// ─── DATA ─────────────────────────────────────────────────────────────────
export const PROVINCES = ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];
export const CITIES = { "Gauteng": ["Johannesburg","Pretoria","Soweto","Sandton","Midrand"], "Western Cape": ["Cape Town","Stellenbosch","George","Paarl"], "KwaZulu-Natal": ["Durban","Pietermaritzburg","Richards Bay"], "Eastern Cape": ["East London","Port Elizabeth","Mthatha"], "Free State": ["Bloemfontein","Welkom"], "Limpopo": ["Polokwane","Tzaneen"], "Mpumalanga": ["Nelspruit","Witbank"], "Northern Cape": ["Kimberley"], "North West": ["Rustenburg","Mahikeng"] };
export const CATEGORIES = ["Marking","Lesson Planning","Assessment Design","Moderation Support","Data Capturing","Resource Creation","SBA Portfolio Compilation","Exam Preparation Support"];
export const CAT_ICONS = { "Marking": "✏️", "Lesson Planning": "📋", "Assessment Design": "📐", "Moderation Support": "🔍", "Data Capturing": "💻", "Resource Creation": "🖨️", "SBA Portfolio Compilation": "📁", "Exam Preparation Support": "📚" };
export const SUBJECTS = ["Mathematics","Physical Sciences","Life Sciences","English Home Language","Afrikaans","History","Geography","Accounting","Business Studies","Economics","Life Orientation","Technology","Arts & Culture"];

export const MOCK_FREELANCERS = [
  { id: "f1", name: "Thandi Nkosi", avatar: "TN", province: "Gauteng", city: "Johannesburg", categories: ["Marking","Lesson Planning","Assessment Design"], rating: 4.8, reviews: 47, jobs: 52, hourlyRate: 180, bio: "Former HOD with 15 years experience. CAPS expert across FET phase.", remote: true, inPerson: true, subjects: ["Mathematics","Physical Sciences"], verified: true },
  { id: "f2", name: "Johan van der Berg", avatar: "JV", province: "Western Cape", city: "Cape Town", categories: ["Resource Creation","Exam Preparation Support","SBA Portfolio Compilation"], rating: 4.9, reviews: 63, jobs: 71, hourlyRate: 200, bio: "Curriculum specialist. Expert in creating high-quality CAPS-aligned resources.", remote: true, inPerson: false, subjects: ["English Home Language","History","Geography"], verified: true },
  { id: "f3", name: "Zanele Dlamini", avatar: "ZD", province: "KwaZulu-Natal", city: "Durban", categories: ["Data Capturing","Moderation Support"], rating: 4.6, reviews: 28, jobs: 31, hourlyRate: 150, bio: "Specialist in SASAMS and school admin systems. Fast and accurate.", remote: true, inPerson: true, subjects: ["All Subjects"], verified: true },
  { id: "f4", name: "Mpho Sithole", avatar: "MS", province: "Gauteng", city: "Pretoria", categories: ["Assessment Design","Marking","Moderation Support"], rating: 4.7, reviews: 39, jobs: 43, hourlyRate: 170, bio: "IEB and NSC exam expert. Specialises in rubric design and standardisation.", remote: true, inPerson: true, subjects: ["Accounting","Business Studies","Economics"], verified: true },
  { id: "f5", name: "Liezel Botha", avatar: "LB", province: "Western Cape", city: "Stellenbosch", categories: ["Lesson Planning","Resource Creation","SBA Portfolio Compilation"], rating: 4.5, reviews: 19, jobs: 22, hourlyRate: 160, bio: "Creative educator with strong design skills. Makes beautiful resources.", remote: true, inPerson: false, subjects: ["Arts & Culture","Life Orientation"], verified: false },
];

export const MOCK_JOBS = [
  { id: "j1", title: "Grade 12 Maths Paper 1 Marking", teacher: "Mrs. Priya Naidoo", teacherId: "t1", category: "Marking", budget: 1200, deadline: "2025-06-15", province: "KwaZulu-Natal", city: "Durban", remote: true, description: "Need experienced marker for 120 Grade 12 Mathematics Paper 1 scripts. NSC guidelines must be followed. Memorandum provided.", subject: "Mathematics", grade: "Grade 12", proposals: 4, status: "open", postedDate: "2025-05-28" },
  { id: "j2", title: "Term 3 Lesson Plans - Life Sciences Grade 10-12", teacher: "Mr. Andile Khumalo", teacherId: "t2", category: "Lesson Planning", budget: 2800, deadline: "2025-06-30", province: "Gauteng", city: "Johannesburg", remote: true, description: "Complete Term 3 lesson plans for Life Sciences across Grade 10, 11 and 12 aligned to CAPS ATP.", subject: "Life Sciences", grade: "Grade 10-12", proposals: 7, status: "open", postedDate: "2025-05-25" },
  { id: "j3", title: "SBA Portfolio Compilation - Accounting", teacher: "Ms. Fatima Adams", teacherId: "t3", category: "SBA Portfolio Compilation", budget: 950, deadline: "2025-06-10", province: "Western Cape", city: "Cape Town", remote: false, description: "Compile SBA portfolios for 2 classes (60 learners) in Accounting Grade 11. All documents provided.", subject: "Accounting", grade: "Grade 11", proposals: 2, status: "open", postedDate: "2025-06-01" },
  { id: "j4", name: "Grade 9 Data Capturing - Q2 Results", teacher: "Mr. Sipho Mokoena", teacherId: "t4", category: "Data Capturing", budget: 600, deadline: "2025-06-08", province: "Gauteng", city: "Pretoria", remote: true, description: "Data entry of Term 2 results for Grade 9 (180 learners, 8 subjects each) into Excel template provided.", subject: "All Subjects", grade: "Grade 9", proposals: 9, status: "open", postedDate: "2025-06-02" },
  { id: "j5", title: "Matric Exam Revision Worksheets - Physical Sciences", teacher: "Dr. Yolanda Pretorius", teacherId: "t5", category: "Exam Preparation Support", budget: 1500, deadline: "2025-07-01", province: "Gauteng", city: "Sandton", remote: true, description: "Create 10 comprehensive revision worksheets covering all Physical Sciences Paper 1 and 2 topics.", subject: "Physical Sciences", grade: "Grade 12", proposals: 5, status: "open", postedDate: "2025-05-30" },
];

export const MOCK_TRANSACTIONS = [
  { id: "tx1", jobTitle: "History Essay Marking", teacher: "Mrs. B. Molefe", freelancer: "Thandi Nkosi", amount: 800, commission: 160, freelancerPayout: 640, date: "2025-05-20", status: "completed" },
  { id: "tx2", jobTitle: "Lesson Plan Bundle - English", teacher: "Mr. R. Pieterse", freelancer: "Johan van der Berg", amount: 1400, commission: 280, freelancerPayout: 1120, date: "2025-05-22", status: "completed" },
  { id: "tx3", jobTitle: "Grade 11 Data Entry", teacher: "Ms. L. Swart", freelancer: "Zanele Dlamini", amount: 550, commission: 110, freelancerPayout: 440, date: "2025-05-28", status: "completed" },
  { id: "tx4", jobTitle: "Maths Rubric Design", teacher: "Mr. K. Dube", freelancer: "Mpho Sithole", amount: 700, commission: 140, freelancerPayout: 560, date: "2025-06-01", status: "escrow" },
  { id: "tx5", jobTitle: "Resource Pack Creation", teacher: "Ms. N. Williams", freelancer: "Johan van der Berg", amount: 2200, commission: 440, freelancerPayout: 1760, date: "2025-06-03", status: "escrow" },
];

export const MOCK_MESSAGES = [
  { id: "m1", from: "f1", fromName: "Thandi Nkosi", text: "Hello! I saw your Maths marking job. I have extensive experience with NSC Paper 1 marking and can start immediately.", time: "10:23" },
  { id: "m2", from: "me", fromName: "You", text: "Great! Could you share your experience with Grade 12 specifically?", time: "10:31" },
  { id: "m3", from: "f1", fromName: "Thandi Nkosi", text: "I've marked NSC Maths for 8 years including at provincial level. I also have IEB experience. I charge R180/hr and can complete 120 scripts in about 6 hours.", time: "10:35" },
  { id: "m4", from: "me", fromName: "You", text: "That sounds perfect. I'll accept your proposal. I'll release the escrow payment now.", time: "10:40" },
];