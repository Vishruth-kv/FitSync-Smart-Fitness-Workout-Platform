# FitMatch AI — Gym Partner Matching

A full-stack web app built with Next.js 15, TypeScript, and a weighted AI compatibility engine.

---

## ▶️ How to run (2 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and set a `JWT_SECRET` (any long random string).

### 3. Start the dev server
```bash
npm run dev
```

Open http://localhost:3000 — the app is live.

---

## 📁 What's in the project

```
src/
├── app/
│   ├── page.tsx              ← Landing page
│   ├── login/page.tsx        ← Login
│   ├── signup/page.tsx       ← 3-step signup with full profile
│   ├── dashboard/page.tsx    ← User dashboard with stats
│   ├── matches/page.tsx      ← Ranked gym partner matches
│   ├── profile/page.tsx      ← Edit your profile
│   ├── coach/page.tsx        ← AI fitness coach chat
│   └── api/
│       ├── auth/
│       │   ├── signup/       ← POST: create account
│       │   ├── login/        ← POST: login
│       │   ├── logout/       ← POST: logout
│       │   └── me/           ← GET: current user
│       ├── matches/          ← GET: ranked partner matches
│       ├── profile/          ← GET/PATCH: view & edit profile
│       └── coach/            ← POST: AI fitness coach messages
├── lib/
│   ├── db.ts                 ← JSON database (swappable for Postgres)
│   ├── auth.ts               ← bcrypt + JWT helpers
│   ├── matching.ts           ← Compatibility scoring algorithm
│   └── session.ts            ← Cookie-based session helper
└── components/
    └── Navbar.tsx            ← Shared navigation bar
data/
└── db.json                   ← Database file (auto-created, gitignore this)
```

---

## 🧠 Matching Algorithm

Compatibility is scored 0–100 across 6 factors:

| Factor | Weight | How it's scored |
|--------|--------|-----------------|
| Fitness Goal | **30%** | Exact match = 100%, any other = 30% |
| Routine | **20%** | Avg of time match (100/30%) + day overlap ratio |
| Location | **20%** | Exact area text match = 100%, else 20% |
| Fitness Level | **15%** | Same = 100%, 1 tier diff = 50%, 2 tiers = 0% |
| Budget | **10%** | Proximity ratio — within 5% = near 100% |
| Personality | **5%** | Same type = 100%, different = 50% |

Reasons shown on match cards (e.g. "Same fitness goal", "Overlapping workout days") come directly from which factors scored high.

---

## 🤖 AI Fitness Coach

The coach page at `/coach` works in two modes:

**Demo mode** (no API key needed): Returns detailed, realistic responses about workouts, diet, and form — personalised using your profile data.

**Live mode**: Add `OPENAI_API_KEY=sk-...` to `.env.local`. The coach will call GPT-4o-mini with your full profile as context.

---

## 🗄️ Database

User data is stored in `data/db.json` via **lowdb** (pure JavaScript, no native binaries needed).

**To switch to PostgreSQL + Prisma in production:**

1. `npm install prisma @prisma/client`
2. `npx prisma init --datasource-provider postgresql`
3. Define the `User` model in `prisma/schema.prisma` (fields match `UserProfile` in `src/lib/db.ts`)
4. Replace the lowdb calls in `src/lib/db.ts` with `prisma.user.findUnique/create/update`
5. Everything else (auth, matching, pages) stays unchanged

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard:
- `JWT_SECRET` (required)
- `OPENAI_API_KEY` (optional, for live AI coaching)

For production, swap `data/db.json` for PostgreSQL (see above).

---

## 🏋️ Intermediate Workout Plan for Muscle Gain

**Transformation**

### Day 1 - Push (Chest, Shoulders, Triceps)
*Bench Press Anatomy*

- **Bench Press**: 4x8 (rest 90s)
- **Overhead Press**: 3x10 (rest 75s)
- **Incline Dumbbell Press**: 3x12 (rest 60s)
- **Lateral Raises**: 3x15 (rest 45s)
- **Tricep Pushdown**: 3x12 (rest 45s)

### Day 2 - Pull (Back, Biceps)

- **Deadlift**: 4x6 (rest 2min)
- **Pull-ups**: 3xmax (rest 90s)
- **Seated Cable Row**: 3x12 (rest 60s)
- **Face Pulls**: 3x15 (rest 45s)
- **Barbell Curl**: 3x12 (rest 45s)

### Day 3 - Legs
*Squat Anatomy*

- **Squat**: 4x8 (rest 2min)
- **Romanian Deadlift**: 3x10 (rest 90s)
- **Leg Press**: 3x12 (rest 60s)
- **Walking Lunges**: 3x20 steps (rest 60s)
- **Calf Raises**: 4x20 (rest 30s)

> **Tip**: Add 2.5kg per week to compound lifts (progressive overload).
