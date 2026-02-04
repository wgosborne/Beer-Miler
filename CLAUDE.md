# Annie's Beer Mile Betting App

Friendly betting app for 8-12 person friend group. Three bet types, scoring system, leaderboard. No money—just points and bragging rights.

## Current Status

**Phase 1 Complete**: Auth + Calendar + Betting + Scoring + Leaderboard. Code complete, tested (186 passing tests), design finalized (dark theme). Ready for production deployment to Render.

## Tech Stack

| Component | Choice |
|-----------|--------|
| Frontend | Next.js 14 (React, SSR) |
| Backend | Next.js API Routes |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma (type-safe) |
| Auth | NextAuth.js (JWT, bcrypt) |
| Styling | Tailwind CSS (dark theme) |
| Hosting | Render.com (auto-deploys on git) |

## Features Implemented

1. **Auth** (Phase 1a): Signup/login with JWT sessions, bcrypt hashing, role-based access
2. **Calendar** (Phase 1b): 3-month rolling window, consensus calculation (all users available = green), admin lock/unlock date
3. **Betting** (Phase 1c): Three bet types (time over/under, exact time guess, vomit prop), anytime placement (no event lock gate)
4. **Scoring**: Over/under threshold comparison, distance calculation with tie-breaking, vomit yes/no matching
5. **Admin**: Results form with MM:SS input, preview before finalize, reset before finalization
6. **Leaderboard**: Ranked by total points, detailed bet breakdown, expandable details

## Core Entities

- **Users**: Email/username login, roles (admin/user), all users participate in betting
- **Event**: One per MVP, tracks scheduled date, final time, vomit outcome, results finalized flag
- **Availability**: User per date per 3-month window. Locked dates immutable until admin unlocks.
- **Bets**: JSON `betData` column supports flexible types. Exact guess & vomit prop = 1 per user (replaces old). Time over/under = unlimited.
- **Leaderboard**: Denormalized, refreshed after finalization (fast queries)

## API Endpoints

15 total endpoints: auth (3), event (1), availability (2), bets (3), admin (4), leaderboard (1). All authenticated except signup/login. Validation with Zod, error handling with status codes.

See `/Handoffs/02-architecture.md` for complete API spec.

## Key Design Decisions

- **Single Next.js deployment**: Frontend + backend colocated. No separate services, no CORS.
- **Neon + Render**: Serverless PostgreSQL + simple hosting. Perfect for 8-12 users.
- **Unlock date anytime**: Admin can unlock event date at any point. Bets remain (admin responsibility).
- **Betting independent**: Users can bet anytime, no event lock gate. Betting phase separate from scheduling.
- **Consensus = 100%**: All users must be available to mark date as consensus (no majority).
- **Tie-breaking**: Both users get 1 point if equally close (fairness over winner-take-all).
- **JSON betData**: Flexible column supports new bet types (Phase 3+) without schema migration.

## How to Run

### Local Setup

```bash
# Install dependencies
npm install

# Create .env.local
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
DATABASE_URL="postgresql://user:password@localhost:5432/beer_mile_dev"  # or Neon URL
NEXTAUTH_URL="http://localhost:3000"
EVENT_ID="event-1"

# Set up database
npx prisma migrate dev --name init

# Seed with test data
npx prisma db seed

# Start dev server
npm run dev
```

Login at `http://localhost:3000` with `admin@beer-mile.test` / `admin123`.

### Deployment to Render

1. Connect GitHub repo to Render.com
2. Set environment variables:
   - `DATABASE_URL` (from Neon)
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Render domain)
   - `EVENT_ID` (e.g., "event-1")
3. Build: `npm run build` | Start: `npm run start`
4. Auto-deploys on git push to main branch

## Checklist

**Code Complete:**
- [x] Auth (signup/login/logout with JWT)
- [x] Calendar (3-month consensus, lock/unlock)
- [x] Betting (3 bet types, placement, validation)
- [x] Scoring (tie-breaking, distance calc)
- [x] Admin (results form, preview, finalize, reset)
- [x] Leaderboard (ranking, breakdown)

**Testing:**
- [x] 186 unit/integration tests passing
- [x] Auth, validation, calendar, availability, scoring

**Design:**
- [x] Dark theme (black, purple/blue accents)
- [x] Mobile-first (iPhone 414px base)
- [x] Auth carousel with neon subtitle glow
- [x] Responsive pages (home, calendar, betting, results, leaderboard)

**Production Ready:**
- [x] Environment setup (.env.local)
- [x] Database schema (Prisma, 5 tables)
- [x] Error handling & validation
- [x] TypeScript strict mode
- [ ] Deploy to Render (ready, waiting for user)

## Next Steps

1. Deploy to Render.com (connect GitHub repo, set env vars, auto-deploys on push)
2. Optional: Add Annie images to `public/images/annie/`
3. User acceptance testing with full group
4. Phase 3: Notifications, badges, advanced features

## Implementation Notes

- **Files**: `/src/app/` (pages/API), `/src/components/` (UI), `/src/lib/` (auth, utils, scoring)
- **Database**: 5 tables (users, events, availabilities, bets, leaderboard_entries)
- **Validation**: Zod schemas in `/src/lib/validation.ts`
- **Scoring**: `/src/lib/scoring.ts` (scoreAllBets, tie-breaking logic)
- **Design**: Dark theme via Tailwind, minimal custom CSS in `/src/app/globals.css`

## References

- `/Handoffs/01-requirements.md` - Feature spec, data model, edge cases
- `/Handoffs/02-architecture.md` - Tech stack, schema, 15 API endpoints, auth flow
- `/Handoffs/03-implementer.md` - Phase 1 completed, files created, testing notes
- `/Handoffs/04-designer.md` - Dark theme, pages, colors, implementation details
- `/Handoffs/05-test.md` - 186 passing tests, coverage report

**Last Updated**: 2026-02-03
**Status**: Phase 1 Complete, Ready for Deployment
**Next**: Render.com deployment
