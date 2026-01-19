# Annie's Beer Mile Betting App

A friendly betting application for a 8-12 person friend group to place wagers on Annie's beer mile performance (a humorous fantasy football consequence). No monetary transactions—just points and bragging rights.

## Current Phase

**Architecture & Planning** → Ready for implementation (Phase 1: Calendar scheduling)

## Tech Stack

- **Frontend**: Next.js 14+ (React) with SSR/SSG
- **Backend**: Next.js API Routes (colocated)
- **Database**: Neon PostgreSQL (managed, serverless)
- **ORM**: Prisma (type-safe queries, migrations)
- **Auth**: NextAuth.js (email/username credentials)
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Hosting**: Render.com (native Next.js support, auto-deploys on git push)

## Core Entities

- **Users**: 8-12 friend group members with email/username login. Roles: admin (locks date, enters results) or user (marks availability, places bets).
- **Event**: Single beer mile event (extensible to multiple future events). Tracks scheduled date (locked by admin), final time, and vomit outcome.
- **Availability**: User availability per date (3-month rolling window). Day-level granularity only; users mark themselves as "out of town" on unavailable dates.
- **Bets** (Phase 2): Three types—time over/under (multiple per user), exact time guess (one per user), vomit prop (one per user). Points: 1 per winning bet.
- **Leaderboard**: Cumulative points per user, refreshed after results finalize.

## API Endpoints (Summary)

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Authenticate |
| GET | /api/event/current | Current event status |
| GET | /api/availability?month=YYYY-MM | Get calendar data & consensus dates |
| POST | /api/availability | Mark dates available/unavailable |
| POST | /api/admin/lock-date | Lock consensus date (admin only) |
| POST | /api/bets | Place bet |
| GET | /api/bets | View bets & distribution |
| POST | /api/admin/results | Enter final time & vomit outcome (admin only) |
| POST | /api/admin/finalize-results | Lock results (admin only) |
| GET | /api/leaderboard | View rankings |

*Full API docs in `/Handoffs/02-architecture.md`*

## Key Decisions

- **Next.js monolith**: Single deployment (no separate frontend/backend). Eliminates CORS, simplifies operations for a friend-group project.
- **Neon + Render**: PostgreSQL on serverless. Auto-scaling, pay-per-use, perfect for small user base.
- **Consensus = all available**: Phase 1 locks event only when 100% of users show availability on that date. No majority rule.
- **Tie-breaking**: If two users guess equally close to final time, both get 1 point (fairness).
- **Bet locking**: Once placed, bets cannot be edited or deleted (immutable). Only admin can reset all results if data entry error.
- **Phase gating**: Phase 2 (betting) only available after admin locks event date in Phase 1.
- **JSON bet storage**: Flexible `betData` JSONB column in `bets` table allows adding new bet types (Phase 3+) without schema changes.

## How to Run

### Local Setup

```bash
# Install dependencies
npm install

# Create .env.local (see below)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"  # Generate a secret
# DATABASE_URL from Neon (or local PostgreSQL)
# NEXTAUTH_URL="http://localhost:3000"

# Set up database
npx prisma migrate dev --name init

# Seed with test data (admin user)
npx prisma db seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000` in browser. Login with `admin@beer-mile.test` / `admin123` to test admin functions.

### Database Setup (First Time)

```bash
# Option A: Local PostgreSQL
createdb beer_mile_dev
DATABASE_URL="postgresql://user:password@localhost:5432/beer_mile_dev"

# Option B: Neon (recommended)
# Create Neon project, copy DATABASE_URL, paste in .env.local

# Run migrations (both options)
npx prisma migrate dev --name init
npx prisma db seed  # Creates admin user + initial event
```

### Deployment to Render

1. **Connect GitHub repo** to Render.com
2. **Set environment variables** in Render dashboard:
   - `DATABASE_URL` (from Neon)
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Render domain, e.g., https://beer-mile.render.com)
3. **Build/Start commands**:
   ```
   Build: npm run build
   Start: npm run start
   ```
4. **Auto-deploys** on git push to main branch

## Current Status

- [x] Requirements gathered & documented
- [x] Architecture designed (tech stack, data model, API, components)
- [ ] **Implementation (Phase 1)**: Calendar, availability tracking, consensus lock
- [ ] **Testing Phase 1**: Unit tests, integration tests
- [ ] **Implementation (Phase 2)**: Betting system, results, leaderboard
- [ ] **Testing Phase 2**: Scoring logic, edge cases
- [ ] **Deployment**: Render setup, database migrations, seed data

## Next Steps

1. **Set up project scaffolding**:
   - Create Next.js 14 project with TypeScript
   - Install Prisma, NextAuth, Tailwind, Zod
   - Configure database connection to Neon

2. **Implement Phase 1 (Calendar)**:
   - Create Prisma schema (User, Event, Availability tables)
   - Build auth (signup/login with NextAuth)
   - Build calendar UI (3-month grid, color-coded)
   - Build availability API (mark/unmark dates)
   - Build admin lock-date API
   - Test consensus logic thoroughly

3. **Deploy Phase 1 to Render** for user feedback

4. **Layer Phase 2 (Betting)**:
   - Add Bet and LeaderboardEntry tables
   - Build bet placement UI (3 bet types)
   - Build admin results form & scoring logic
   - Build leaderboard display

5. **Final testing & polish** before full release

## Open Questions / Notes

- **Tie-breaking**: Currently set to "both get 1 point" if equally close guesses. Clarify with user if needed.
- **Timezone**: All dates treated as local to event location (ISO format YYYY-MM-DD).
- **Future events**: Schema supports multiple events; Phase 1 MVP focuses on one event (stored as singleton in environment).
- **Email notifications**: Low priority for MVP (no notification system yet).
- **Admin delegation**: If primary admin unavailable, another user cannot assume admin role (design choice for simplicity).

## Key Constraints & Assumptions

- **No real-time**: Event doesn't track live lap times (admin manually enters final time).
- **No payments**: Bragging rights only. Keeps it simple and fun.
- **Friend group only**: Private access, no public signup or community features.
- **Small scale**: Designed for 8-12 users; not building for massive scale.
- **Consensus required**: All users must be available on selected date (no relaxed constraints in Phase 1).

## Links

- **Requirements**: `/Handoffs/01-requirements.md` (full functional spec, data model, edge cases)
- **Architecture**: `/Handoffs/02-architecture.md` (tech stack, schema, API details, component hierarchy, deployment)
- **Project Root**: This file (`CLAUDE.md`) is the single source of truth for project status

## Development Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run test:watch      # Tests in watch mode
npm run lint             # Run linter
npm run db:studio       # Open Prisma Studio GUI
npx prisma migrate dev   # Create new migration
npx prisma generate     # Regenerate Prisma client
```

---

**Last Updated**: 2026-01-19
**Owner**: Friend group (8-12 people)
**Contact**: Admin contact needed for deployment credentials
