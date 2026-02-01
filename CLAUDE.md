# Annie's Beer Mile Betting App

A friendly betting application for a 8-12 person friend group to place wagers on Annie's beer mile performance. No monetary transactions—just points and bragging rights.

## Current Phase

**Phase 1 & 2 Complete** (Calendar, Availability, Betting, Results, Leaderboard). Ready for testing and production deployment.

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

- **Users**: 8-12 friend group members with email/username login. Roles: admin (locks/unlocks date, enters results) or user (marks availability, places bets).
- **Event**: Single beer mile event. Tracks scheduled date (lockable by admin), final time, vomit outcome, results finalization status.
- **Availability**: User availability per date (3-month rolling window). Locked dates prevent changes until unlocked by admin.
- **Bets**: Three types—time over/under (multiple per user), exact time guess (one per user), vomit prop (one per user). Points: 1 per winning bet. Anytime placement (no event lock gate).
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
| POST | /api/admin/unlock-date | Unlock date to reopen availability (admin only) |
| POST | /api/bets | Place bet (anytime) |
| GET | /api/bets | View bets & distribution |
| POST | /api/admin/results | Enter final time & vomit outcome (admin only) |
| POST | /api/admin/finalize-results | Lock results (admin only) |
| POST | /api/admin/reset-results | Reset results before finalization (admin only) |
| GET | /api/leaderboard | View rankings |

*Full API docs in `/Handoffs/02-architecture.md`*

## Key Decisions & Recent Changes

- **Next.js monolith**: Single deployment (no separate frontend/backend). Eliminates CORS, simplifies operations.
- **Neon + Render**: PostgreSQL serverless. Auto-scaling, pay-per-use, perfect for small user base.
- **Unlock date feature** (NEW): Admin can unlock a previously locked event date anytime without restrictions. Users can then modify availability again. Bets remain in database (admin responsibility to manage consistency).
- **Betting independent of lock** (NEW): Users can place bets anytime, regardless of event date lock status. No event lock gate.
- **Consensus = all available**: Lock only when 100% of users show availability. No majority rule.
- **Tie-breaking**: If two users guess equally close, both get 1 point (fairness).
- **Bet immutability**: Once placed, bets cannot be edited or deleted. Admin can reset all results if data entry error.
- **BetDistribution fixed** (NEW): Exact time guesses now return as direct array (not nested object).
- **JSON bet storage**: Flexible `betData` JSONB column allows new bet types (Phase 3+) without schema changes.

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

## Current Status

- [x] Phase 1: Calendar, availability, lock/unlock date
- [x] Phase 2: Betting system (3 types), results, leaderboard
- [x] API endpoints: All core endpoints implemented
- [x] Admin unlock-date: Fully functional
- [x] Betting gates: Removed (no event lock required)
- [x] BetDistribution: Fixed exact_time_guess array format
- [ ] **Testing**: Unit & integration tests needed
- [ ] **Production**: Ready for Render deployment

## Next Steps

1. Write unit tests for scoring logic (tie-breaking, exact time matching, vomit prop)
2. Write integration tests for bet placement & results calculation
3. Write component tests for Calendar, BetForm, Leaderboard
4. Deploy to Render with Neon database
5. User acceptance testing with full group

## Implementation Notes

- **Unlock logic**: Resets `scheduledDate` and `lockedAt` to null. Bets NOT deleted (admin decision).
- **Betting anytime**: No check on event lock status in POST /api/bets. Only checks results finalization.
- **Exact time guesses**: Returns as sorted array `[{time, user}, ...]` in distribution (fixed from nested structure).
- **Bet placement**: When replacing exact_time_guess or vomit_prop, old bet is deleted, new one created (idempotent).
- **Results flow**: POST /api/admin/results (preview) → POST /api/admin/finalize-results (commit) → leaderboard locked.

## Key Constraints & Assumptions

- **No real-time**: Admin manually enters final time via UI (no video analysis).
- **No payments**: Bragging rights only. Legally simple and fun.
- **Friend group only**: Private access, no public signup or community features.
- **Small scale**: 8-12 users; not building for massive scale.
- **Single event**: MVP supports one event (schema extensible for multiple future events).
- **Admin trusted**: Admin responsibility to ensure data consistency if unlocking event with existing bets.

## Testing Checklist

- [ ] Calendar consensus calculation (all users = GREEN)
- [ ] Lock date prevents availability updates
- [ ] Unlock date reopens availability, preserves bets
- [ ] Place bet: time_over_under (multiple allowed)
- [ ] Place bet: exact_time_guess (one per user, updates replace old)
- [ ] Place bet: vomit_prop (one per user, updates replace old)
- [ ] Bet distribution display (exact_time_guess as array)
- [ ] Results preview before finalization
- [ ] Scoring: exact_time_guess winner (closest guess gets point, ties get both)
- [ ] Scoring: time_over_under (over/under against final time)
- [ ] Scoring: vomit_prop (yes/no match)
- [ ] Leaderboard ranks by total points
- [ ] Results finalized blocks new bets
- [ ] Reset results (before finalize) returns all bets to pending

## Links

- **Requirements**: `/Handoffs/01-requirements.md` (functional spec, data model, edge cases)
- **Architecture**: `/Handoffs/02-architecture.md` (tech stack, schema, API details, deployment)

## Development Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run test:watch      # Watch mode
npm run lint             # Lint code
npm run db:studio       # Open Prisma GUI
npx prisma migrate dev   # Create migration
npx prisma generate     # Regenerate client
```

---

**Last Updated**: 2026-01-31
**Status**: Phase 1 & 2 Complete, Ready for Testing
**Owner**: Friend group (8-12 people)
