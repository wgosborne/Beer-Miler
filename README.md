# Annie's Beer Mile Betting App

A fun, friend-group betting app for wagering on Annie's beer mile performance. Place bets on finish time, exact time guesses, and whether she'll vomit. Track points on a leaderboard. No money involved—just bragging rights!

## What Is This?

This started as a fantasy football consequence (Annie has to do a beer mile) and evolved into a betting app for the friend group. Here's how it works:

1. **Phase 1 (Calendar)**: Everyone marks their availability on a 3-month calendar. When all users are available on the same date, it's "green" (consensus). Admin locks that date as the event date.
2. **Phase 2 (Betting)**: Once the date is locked, everyone places bets on:
   - **Time Over/Under**: "Will Annie finish under 6 minutes?" (can place multiple)
   - **Exact Time Guess**: "I guess 5:47" (one guess per person)
   - **Vomit Prop**: "Yes or No—will she vomit?" (one bet per person)
3. **Results**: After the event, admin enters the final time and vomit outcome. The app auto-calculates winners and awards points. Leaderboard shows final rankings.

## Quick Start (Local Development)

### Prerequisites

- **Node.js 18+** (download from [nodejs.org](https://nodejs.org/))
- **Git**
- **A code editor** (VS Code recommended)

### Setup Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/beer-mile.git
cd beer-mile

# 2. Install dependencies
npm install

# 3. Create environment file (.env.local)
# Copy this and fill in:
# DATABASE_URL=postgresql://user:password@neon.tech/beer_mile
# NEXTAUTH_SECRET=your-secret-key (generate: openssl rand -base64 32)
# NEXTAUTH_URL=http://localhost:3000
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# NODE_ENV=development

# 4. Set up database
npx prisma migrate dev --name init

# 5. Seed test data (creates admin user)
npx prisma db seed

# 6. Start development server
npm run dev
```

**Visit** `http://localhost:3000` in your browser.

**Login** with:
- Email: `admin@beer-mile.test`
- Password: `admin123`

## Project Structure

```
beer-mile/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Login/signup endpoints
│   │   ├── availability/         # Calendar data endpoints
│   │   ├── bets/                 # Betting endpoints
│   │   ├── leaderboard/          # Leaderboard endpoint
│   │   └── admin/                # Admin-only endpoints
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── calendar/                 # Phase 1: Calendar page
│   ├── betting/                  # Phase 2: Betting page
│   ├── results/                  # Phase 2: Results page
│   ├── leaderboard/              # Leaderboard page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── Calendar.tsx              # 3-month calendar grid
│   ├── BetForm.tsx               # Bet placement form
│   ├── Leaderboard.tsx           # Ranked leaderboard display
│   ├── AdminResultsForm.tsx      # Admin results entry form
│   └── ...
├── lib/                          # Utilities & helpers
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validation.ts             # Input validation schemas (Zod)
│   ├── scoring.ts                # Bet scoring logic
│   └── context/                  # React contexts
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Database seed script
│   └── migrations/               # Database migrations
├── public/                       # Static files
├── tests/                        # Unit & integration tests
├── .env.local                    # Local environment (not in git)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

## How to Run (Step by Step for Non-Python Folks)

Since you mentioned not knowing how to run Python projects, here's the super clear version for this Node.js project:

### Step 1: Install Node.js

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (not the latest, LTS is more stable)
3. Run the installer and follow the prompts (click "Next" through everything)
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   Both should show version numbers (e.g., `v18.17.0` and `9.6.7`)

### Step 2: Clone the Repository

```bash
git clone https://github.com/your-username/beer-mile.git
cd beer-mile
```

### Step 3: Install Dependencies

This downloads all the libraries the app needs. This ONLY needs to happen once:

```bash
npm install
```

Wait a minute or two—this downloads ~500MB of code. You'll see `added XXX packages` at the end.

### Step 4: Set Up Environment Variables

Create a file called `.env.local` in the project root (same folder as `package.json`):

**Windows** (PowerShell):
```bash
# Generate a secret
openssl rand -base64 32
# Copy the output (a long random string)

# Create the file with Notepad, or use:
New-Item -Path ".env.local" -Type File
```

**Mac/Linux**:
```bash
openssl rand -base64 32  # Copy the output
echo "NEXTAUTH_SECRET=paste-the-output-here" > .env.local
```

**Content of `.env.local`** (fill in the values):
```
# Database (get from Neon dashboard at https://console.neon.tech)
DATABASE_URL=postgresql://user:password@neon.tech/beer_mile

# Auth secret (generate with openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-key-here

# Local development
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

### Step 5: Set Up the Database

```bash
# Create tables in the database
npx prisma migrate dev --name init

# Add test data (creates admin account)
npx prisma db seed
```

You'll see messages like `Database has been created at...` This means success.

### Step 6: Start the App

```bash
npm run dev
```

You'll see something like:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.3s
```

**Open your browser** and go to `http://localhost:3000`

**Login:**
- Email: `admin@beer-mile.test`
- Password: `admin123`

You're in! Now you can test the calendar (Phase 1), mark availability, lock dates, etc.

### Step 7: Stop the App

Press `Ctrl+C` in the terminal to stop the server.

### Common Issues

**"npm: command not found"**
→ Node.js wasn't installed. Go back to Step 1.

**"Error: ENOENT: no such file or directory, open '.env.local'"**
→ You didn't create the `.env.local` file. Do Step 4 again.

**"Prisma migration failed"**
→ Check your `DATABASE_URL` is correct. Test it in Neon dashboard.

**"Cannot find module 'next'"**
→ You skipped Step 3 (`npm install`). Run it now.

## Tech Stack Explained

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | React (Next.js) | Fast, component-based UI. Built-in routing. |
| **Backend** | Node.js (Next.js API Routes) | Single deployment. No separate servers to manage. |
| **Database** | PostgreSQL (Neon) | Relational data (users, bets, availability). Serverless = cheap. |
| **Styling** | Tailwind CSS | Fast, responsive design. Works great on mobile. |
| **Auth** | NextAuth.js | Handles login/logout, sessions, JWT tokens. |
| **Hosting** | Render.com | Auto-deploys on git push. PostgreSQL addon. Free tier available. |

## Phase 1 vs Phase 2

### Phase 1: Calendar Scheduling (MVP)
- ✅ Sign up / Log in
- ✅ View 3-month calendar
- ✅ Mark which dates you're out of town
- ✅ See "green" (all available) and "red" (someone busy) dates
- ✅ Admin locks a green date as the event date
- ❌ No betting yet

**Goal**: Get consensus on a date before anyone places bets.

### Phase 2: Betting (Unlocked After Phase 1)
- ✅ Time Over/Under bets (e.g., "under 6 minutes")
- ✅ Exact time guess (e.g., "I guess 5:47")
- ✅ Vomit prop (Yes/No)
- ✅ View bet distribution (how many people picked each option)
- ✅ Admin enters final time and vomit outcome
- ✅ Auto-calculated winners
- ✅ Leaderboard with points

**Goal**: Everyone places bets, then scores points based on accuracy.

Phase 2 is **only available** after the event date is locked in Phase 1.

## Deployment to Render (Production)

### 1. Create Accounts

- **GitHub**: Push code there (free)
- **Neon**: PostgreSQL database (free tier available at https://console.neon.tech)
- **Render**: Hosting (free tier available at https://render.com)

### 2. Push to GitHub

```bash
git add .
git commit -m "Initial commit: beer mile app"
git push origin main
```

### 3. Connect Render to GitHub

1. Go to [render.com](https://render.com), sign up, connect GitHub
2. Click "New +" → "Web Service"
3. Select the `beer-mile` repository
4. **Build Command**: `npm run build`
5. **Start Command**: `npm run start`

### 4. Add Environment Variables to Render

1. In Render dashboard, go to your web service
2. Settings → Environment Variables
3. Add these (get values from Neon dashboard):
   ```
   DATABASE_URL=postgresql://user:password@neon.tech/...
   NEXTAUTH_SECRET=your-secret-key (generate: openssl rand -base64 32)
   NEXTAUTH_URL=https://your-app.render.com (Render will give you this URL)
   NEXT_PUBLIC_API_URL=https://your-app.render.com/api
   NODE_ENV=production
   ```

### 5. Deploy Migrations

Run this **once** to set up the database on Neon:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 6. Auto-Deploy on Git Push

Now whenever you push to `main`, Render automatically rebuilds and deploys. No manual steps needed!

## Core Features Explained

### Calendar (Phase 1)

- **3-month rolling window**: You can mark availability from today up to 3 months out
- **Green = consensus**: All users are available on that date (no one out of town)
- **Red = conflict**: At least one person is busy
- **Lock**: Admin selects a green date, locks it. No more availability changes allowed.

### Betting (Phase 2)

**Time Over/Under** (multiple per person):
- You pick a threshold (5 min, 6 min, 7 min, etc.)
- You guess "over" or "under"
- If you're right, you get 1 point
- You can place multiple (e.g., bet under 5 min AND under 6 min)

**Exact Time Guess** (one per person):
- You enter your exact prediction (e.g., 5:47)
- Whoever's closest to the actual time gets 1 point
- If two people are equally close, both get 1 point (fairness rule)

**Vomit Prop** (one per person):
- You pick "Yes" or "No"
- If correct, you get 1 point

**Results** (Admin only):
- After the event, admin enters the final time (from stopwatch)
- Admin indicates if Annie vomited (yes/no)
- App auto-calculates all winners
- Points awarded immediately
- Leaderboard shows final rankings

### Leaderboard

- **Ranked by total points** across all bets
- **Shows each user's record**: Which bets they won, which they lost
- **All-time tracking**: As more events happen, points accumulate

## Contributing (For Friend Group)

This is a friend-group project. Here's how to contribute:

### Adding a Feature

1. Create a branch: `git checkout -b feature/my-feature`
2. Make changes
3. Test locally: `npm run test`
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create a pull request on GitHub
7. Someone reviews and merges

### Reporting a Bug

- Open an Issue on GitHub with:
  - What happened
  - What should have happened
  - Steps to reproduce

### Testing Locally

```bash
# Run tests
npm run test

# Run tests in watch mode (re-run on file change)
npm run test:watch

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

## Key Design Decisions

| Decision | Why |
|----------|-----|
| **All-available consensus** | Makes sure everyone can actually attend. No one gets stuck. |
| **Tie-breaking = both win** | If two people guess equally close, both get credit (fairness). |
| **Bets are immutable** | Once placed, you can't change your mind. Keeps it honest. |
| **Admin can reset results** | In case of data entry errors before finalization. |
| **Phase 2 locked behind Phase 1** | Calendar first, betting second. Makes sense logically. |
| **Single event in MVP** | Simplifies Phase 1. Schema supports multiple events later. |

## Troubleshooting

### "Event not locked yet" message

You're trying to access the betting page, but the calendar phase hasn't finished.

**Fix**: Go to Calendar page, mark your availability, wait for admin to lock a date.

### Lost connection to database

Your `.env.local` DATABASE_URL is wrong, or Neon is down.

**Fix**:
1. Check DATABASE_URL in `.env.local` matches Neon dashboard
2. Restart dev server: `npm run dev`
3. Check Neon status at https://neon.tech/status

### Bets aren't showing up

Make sure event date is locked (Phase 1 complete). You can't place bets until then.

### Leaderboard shows 0 points

Results haven't been finalized yet. Admin needs to enter final time and vomit outcome, then click "Finalize Results".

## Database Schema (High Level)

```
Users
├── id, username, email, password_hash, role (admin/user)

Events
├── id, name, scheduled_date (locked), final_time, vomit_outcome, status

Availability
├── user_id, event_id, calendar_date, is_available

Bets
├── user_id, event_id, bet_type, bet_data (JSON), status (pending/won/lost)

LeaderboardEntries
├── user_id, event_id, points_earned, rank
```

Full schema in `prisma/schema.prisma`.

## Useful Commands

```bash
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Build for production
npm run start                  # Start production server (after build)
npm run test                   # Run all tests once
npm run test:watch            # Re-run tests on file change
npm run lint                   # Check code style
npm run db:studio             # Open database GUI (Prisma Studio)
npx prisma migrate dev        # Create new database migration
npx prisma generate           # Regenerate Prisma client
npx tsc --noEmit              # Type check without building
```

## Questions?

- **Architecture details**: See `Handoffs/02-architecture.md`
- **Full requirements**: See `Handoffs/01-requirements.md`
- **Project status**: See `CLAUDE.md`

## License

Friend group project. Use, modify, and enjoy!

---

**Last Updated**: 2026-01-19
**Current Phase**: Ready for Phase 1 implementation
