# Implementation Plan: Annie's Beer Mile Betting App

**Document Version:** 1.0
**Last Updated:** 2026-01-24
**Status:** Ready for Phase 0 (Awaiting Neon Setup)
**Author:** Claude (Implementer Agent)

---

## 1. Project Overview & Current Status

### What We're Building
A friendly betting application for an 8-12 person friend group to place wagers on Annie's beer mile performance. No monetary transactions—just points and bragging rights.

### Current Phase
- [x] Requirements gathered & documented (`01-requirements.md`)
- [x] Architecture designed (`02-architecture.md`)
- [ ] **Implementation starts here (Phase 0)**
- [ ] Testing & deployment (later phases)

### Tech Stack (Confirmed)
- **Frontend:** Next.js 14+ (React) with SSR/SSG
- **Backend:** Next.js API Routes
- **Database:** Neon PostgreSQL (managed serverless)
- **ORM:** Prisma
- **Auth:** NextAuth.js (email/username credentials)
- **Styling:** Tailwind CSS
- **Hosting:** Render.com

### Key Decision: Revised Approach (Final)
After user feedback, we're implementing a **parallel, merged Phase 1** that combines calendar scheduling and betting into one MVP launch:
- **No event lock gate:** Users can place bets anytime (avoids artificial phase separation)
- **Calendar & Betting coexist:** Both available from day 1
- **Singleton event for MVP:** One event in production; multi-event refactoring deferred to Phase 3

---

## 2. Revised Phase Breakdown

### Phase 0: Project Scaffolding & Database Setup (Days 1-2)
**Goal:** Get the project structure, dependencies, and database connected.

**Not yet started. Awaiting Neon setup confirmation.**

**Includes:**
- Create Next.js 14 project with TypeScript
- Install all dependencies (Prisma, NextAuth, Tailwind, Zod, etc.)
- Configure `.env.local` with Neon database
- Create Prisma schema
- Run initial migration
- Verify database connection

**Deliverables:**
- [ ] Next.js project scaffolded
- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Prisma schema created
- [ ] Database migrated
- [ ] Prisma Studio accessible

---

### Phase 1a: Authentication (Days 2-4)
**Goal:** Enable users to sign up and log in.

**Includes:**
- NextAuth.js configuration (CredentialsProvider)
- POST `/api/auth/signup` endpoint
- POST `/api/auth/login` endpoint
- POST `/api/auth/logout` endpoint
- Signup page (`/auth/signup`)
- Login page (`/auth/login`)
- Seed admin user (hardcoded: `admin@beer-mile.test` / `admin123`)
- Session middleware & protected routes

**Deliverables:**
- [ ] Auth API endpoints working
- [ ] Signup/login UI functional
- [ ] Admin user seeded
- [ ] Session persists across page reloads
- [ ] Unauthenticated users redirect to login

---

### Phase 1b: Calendar & Availability (Days 4-7, Parallel with 1a)
**Goal:** Implement calendar scheduling and availability tracking.

**Includes:**
- GET `/api/event/current` endpoint
- GET `/api/availability?month=YYYY-MM` endpoint
- POST `/api/availability` endpoint
- POST `/api/admin/lock-date` endpoint
- Calendar component (3-month grid, color-coded)
- Availability form (mark/unmark dates)
- Admin lock-date panel (admin only)
- Consensus date calculation (all available)

**Deliverables:**
- [ ] Calendar displays 3-month rolling window
- [ ] Color coding works (GREEN = all available, RED = someone unavailable)
- [ ] Users can toggle availability
- [ ] Admin can lock consensus dates
- [ ] Locked state persists and prevents changes
- [ ] Event status visible to all users

---

### Phase 1c: Betting System (Days 7-12, Parallel with 1a/1b)
**Goal:** Implement three bet types, bet placement, and distribution viewing.

**Includes:**
- POST `/api/bets` endpoint
- GET `/api/bets` endpoint (with user's bets + distribution)
- DELETE `/api/bets/:id` endpoint
- Time Over/Under bet form component
- Exact Time Guess form component
- Vomit Prop form component
- Bet distribution display (aggregate stats)
- Validation for bet constraints (1x exact, 1x vomit, multiple time O/U)

**Deliverables:**
- [ ] Users can place all three bet types
- [ ] Bets stored in database
- [ ] Bet validation enforced (no duplicates, etc.)
- [ ] Distribution stats displayed correctly
- [ ] Users can view and delete their bets
- [ ] Bets locked once placed (immutable)

---

### Phase 2: Results & Leaderboard (Days 12-16, Depends on Phase 1)
**Goal:** Admin enters results, system auto-scores bets, leaderboard appears.

**Includes:**
- POST `/api/admin/results` endpoint (with preview)
- POST `/api/admin/finalize-results` endpoint
- POST `/api/admin/reset-results` endpoint
- GET `/api/leaderboard` endpoint
- Admin results form (MM:SS time input + yes/no vomit)
- Results preview modal (winners summary)
- Leaderboard page with rankings & bet breakdowns
- Scoring logic for all bet types
- Tie-breaking logic (both get 1 point)

**Deliverables:**
- [ ] Admin can enter final time and vomit outcome
- [ ] System auto-calculates all winners
- [ ] Scoring logic passes unit tests
- [ ] Leaderboard displays correct rankings
- [ ] Results can be reset before finalization
- [ ] Once finalized, results are immutable

---

### Phase 3: Polish, Optimization & Future Extensibility (Days 16-20)
**Goal:** Ensure production-readiness and build foundation for future phases.

**Includes:**
- Comprehensive error handling & user-friendly error messages
- Validation across all endpoints
- Logging (server-side request/error logging)
- Performance optimization (database indexes, query optimization)
- TypeScript strict mode audit
- Component library polish (styling, accessibility)
- Unit tests for critical functions (scoring, consensus)
- Documentation for future bet types & features
- Deployment checklist
- Multi-event refactoring blueprint (for Phase 4+)

**Deliverables:**
- [ ] All error cases handled gracefully
- [ ] Validation comprehensive across API & forms
- [ ] Logging in place (errors, API requests)
- [ ] Database indexes optimized
- [ ] Critical functions tested
- [ ] TypeScript strict, no `any` types
- [ ] UI polished & responsive
- [ ] Production deployment ready

---

## 3. Detailed Task Breakdown

### Phase 0: Project Scaffolding & Database Setup

#### Task 0.1: Create Next.js Project
```bash
# Create new Next.js 14 project with TypeScript
npx create-next-app@latest beer-mile \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir

cd beer-mile
```

**Commit message:**
```
Initial setup: Create Next.js 14 project with TypeScript and Tailwind

- Create Next.js 14 app directory structure
- Configure TypeScript with strict mode
- Enable Tailwind CSS
- Configure ESLint

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 0.2: Install Dependencies
```bash
npm install \
  prisma @prisma/client \
  next-auth \
  bcryptjs \
  zod \
  jose \
  axios

npm install -D \
  prisma \
  @types/node \
  @types/react \
  typescript
```

**Commit message:**
```
Add project dependencies

Install Prisma, NextAuth, validation (Zod), and utilities:
- Prisma ORM for database access
- NextAuth for authentication
- bcryptjs for password hashing
- Zod for input validation
- jose for JWT handling
- axios for HTTP requests

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 0.3: Create `.env.local`
User provides Neon connection string and NEXTAUTH_SECRET. Implementer creates file locally (not committed).

```bash
# .env.local (CREATE LOCALLY, DO NOT COMMIT)
DATABASE_URL="postgresql://user:password@ep-xxxxx-pooling.neon.tech/beer_mile_dev?sslmode=require"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
EVENT_ID="event-1"
```

**No commit for this file.**

#### Task 0.4: Create Prisma Schema
Create `prisma/schema.prisma` with complete schema (User, Event, Availability, Bet, LeaderboardEntry).

Reference: `/Handoffs/02-architecture.md` section 3 (Data Model).

**Commit message:**
```
Create Prisma schema for database models

Define all core models:
- User: Authentication and role-based access
- Event: Single beer mile event (extensible)
- Availability: User availability per date (3-month window)
- Bet: Three bet types (time O/U, exact time, vomit prop)
- LeaderboardEntry: Points per user per event

Uses PostgreSQL with Neon. Supports JSONB bet storage for flexibility.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 0.5: Run Initial Migration
```bash
npx prisma migrate dev --name init
```

Creates tables in Neon database.

**Commit message:**
```
Run initial Prisma migration

Create all database tables (users, events, availabilities, bets, leaderboard_entries).

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 0.6: Create Utility Files
Create foundational utility files:
- `lib/prisma.ts` (Prisma client singleton)
- `lib/validation.ts` (Zod schemas for all endpoints)
- `lib/utils.ts` (Helper functions)

**Commit message:**
```
Create utility and validation modules

Add:
- lib/prisma.ts: Prisma client singleton for data access
- lib/validation.ts: Zod schemas for auth, availability, bets, etc.
- lib/utils.ts: Helper functions (date formatting, time conversion, etc.)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 0.7: Verify Database Connection
```bash
npm run db:studio
# Browser opens with Prisma Studio. Check that tables exist.
```

No commit needed; verification step only.

---

### Phase 1a: Authentication

#### Task 1a.1: Create NextAuth Configuration
Create `lib/auth.ts` with CredentialsProvider, JWT callbacks, and session config.

**Commit message:**
```
Configure NextAuth.js for email/password authentication

Set up:
- CredentialsProvider for email/password login
- JWT callbacks for token generation
- Session callbacks for user context
- Callback routes

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1a.2: Create Auth API Routes
Create API routes:
- `app/api/auth/[...nextauth]/route.ts` (NextAuth handler)
- `app/api/auth/signup/route.ts` (POST signup)
- `app/api/auth/logout/route.ts` (POST logout)

**Commit message:**
```
Implement authentication API endpoints

Create:
- POST /api/auth/signup: Create new user account with validation
- POST /api/auth/logout: Invalidate session
- NextAuth handler for credentials provider

Validate:
- Username: 3-20 alphanumeric, unique
- Email: Valid format, unique
- Password: 8+ chars, 1+ number, 1+ special character

Hash passwords with bcryptjs (10 rounds).

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1a.3: Create Login & Signup Pages
Create pages:
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`

With forms, validation feedback, and redirect to dashboard on success.

**Commit message:**
```
Add login and signup UI pages

Create:
- /auth/login: Email + password login form
- /auth/signup: Username + email + password signup form

Features:
- Client-side validation feedback
- Loading states
- Error messages
- Redirect to dashboard on success
- Redirect to login for unauthenticated users

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1a.4: Create Middleware & Layout
Create:
- `middleware.ts` (auth check, redirects)
- `app/layout.tsx` (root layout with auth provider)

**Commit message:**
```
Add authentication middleware and root layout

Create:
- middleware.ts: Check auth on protected routes, redirect to login
- app/layout.tsx: Root layout with NextAuth provider, navbar
- lib/context/AuthContext.tsx: React context for user state

Features:
- Automatic redirect to login for unauthenticated users
- User menu with logout button
- Navigation bar visible on all pages

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1a.5: Create Seed Script
Create `prisma/seed.ts` to populate initial admin user.

```typescript
// prisma/seed.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@beer-mile.test" },
    update: {},
    create: {
      email: "admin@beer-mile.test",
      username: "admin",
      passwordHash: adminPassword,
      role: "admin"
    }
  });

  const event = await prisma.event.upsert({
    where: { id: "event-1" },
    update: {},
    create: {
      id: "event-1",
      name: "Annie's Beer Mile"
    }
  });

  console.log("Seed completed:", { admin, event });
}

main().catch(console.error);
```

**Commit message:**
```
Add Prisma seed script for admin user and initial event

Create prisma/seed.ts with:
- Admin user (admin@beer-mile.test / admin123)
- Initial event (event-1, singleton for MVP)

Run with: npx prisma db seed

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1a.6: Run Seed & Test Auth
```bash
npx prisma db seed
npm run dev
# Visit http://localhost:3000
# Should redirect to /auth/login
# Test login with admin@beer-mile.test / admin123
```

No commit; verification step only.

---

### Phase 1b: Calendar & Availability

#### Task 1b.1: Create Event API Endpoint
Create `app/api/event/current/route.ts` (GET /api/event/current).

**Commit message:**
```
Implement GET /api/event/current endpoint

Returns:
- id, name, status
- scheduledDate, lockedAt
- finalTimeSeconds, vomitOutcome, resultsFinalized

Used by frontend to show event state and determine phase (calendar vs betting).

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1b.2: Create Availability API Endpoints
Create:
- `app/api/availability/route.ts` (GET & POST)

GET returns calendar data (all dates, user's marks, consensus dates).
POST updates user's availability for dates.

**Commit message:**
```
Implement availability API endpoints

GET /api/availability?month=YYYY-MM:
- Returns calendar data for month
- Shows all users' availability per date
- Highlights consensus dates (GREEN = all available)
- Returns current user's marks

POST /api/availability:
- Update user's availability for multiple dates
- Validate: unlocked event, future dates, 3-month window
- Returns updated count

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1b.3: Create Admin Lock-Date Endpoint
Create `app/api/admin/lock-date/route.ts` (POST).

Validates:
- User is admin
- Date has full consensus (all users available)
- Date is future
- Event not already locked

**Commit message:**
```
Implement POST /api/admin/lock-date endpoint

Admin-only endpoint to lock event date:
- Validates date has full consensus (all users available)
- Prevents past dates
- Prevents double-locking
- Updates event.scheduledDate and event.lockedAt
- Returns confirmation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1b.4: Create Calendar Component
Create `components/Calendar.tsx`:
- 3-month grid display
- Color-coded cells (GREEN/RED/GRAY)
- Click to toggle availability
- Show unavailable user count per date
- Show consensus dates list

**Commit message:**
```
Add Calendar React component

Displays:
- 3-month rolling calendar grid
- GREEN: All users available (consensus)
- RED: Someone unavailable
- GRAY: Locked (cannot edit)
- Unavailable count per date
- List of consensus dates below

Features:
- Click to toggle own availability (if unlocked)
- Real-time sync with API
- Loading states

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1b.5: Create Admin Lock Panel
Create `components/AdminLockPanel.tsx`:
- Show current event status
- List consensus dates
- Button to lock date (admin only)
- Confirmation modal

**Commit message:**
```
Add AdminLockPanel component for date locking

Admin-only panel shows:
- Current event status (locked/unlocked)
- List of green consensus dates
- Button to select and lock a date
- Confirmation modal before locking
- Prevents re-locking

Non-admins see event status only.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1b.6: Create Calendar Page
Create `app/calendar/page.tsx`:
- Fetch event status and availability data
- Render Calendar + AdminLockPanel
- Show loading/error states
- Real-time updates on availability toggle

**Commit message:**
```
Add /calendar page with calendar and admin panel

Features:
- Displays 3-month calendar with availability data
- Shows consensus dates
- Admin can lock date (with confirmation)
- Real-time updates when toggling availability
- Error handling for API failures
- Loading states

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

### Phase 1c: Betting System

#### Task 1c.1: Create Bet API Endpoints
Create `app/api/bets/route.ts` (POST & GET).

POST: Create new bet with validation.
GET: Return user's bets + distribution stats.

**Commit message:**
```
Implement betting API endpoints

POST /api/bets:
- Create bet (time_over_under | exact_time_guess | vomit_prop)
- Validate bet data per type
- Enforce uniqueness (1x exact, 1x vomit)
- Allow multiple time O/U per user
- Prevent after results finalized
- Store in betData JSONB column

GET /api/bets:
- Return user's bets for event
- Include distribution stats (aggregate counts)
- Show all users' exact guesses
- Show over/under split for time bets

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1c.2: Create Delete Bet Endpoint
Create `app/api/bets/[id]/route.ts` (DELETE).

Validates:
- User owns bet
- Results not finalized
- Event locked

**Commit message:**
```
Implement DELETE /api/bets/[id] endpoint

Delete a pending bet:
- Validate user owns bet
- Prevent deletion if results finalized
- Requires event to be locked
- Returns 204 on success

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1c.3: Create Bet Form Components
Create:
- `components/TimeOverUnderForm.tsx` (threshold selector + over/under toggle)
- `components/ExactTimeGuessForm.tsx` (MM:SS time input)
- `components/VomitPropForm.tsx` (Yes/No buttons)

**Commit message:**
```
Add bet form components for three bet types

Create:
- TimeOverUnderForm: Dropdown for threshold + over/under buttons
- ExactTimeGuessForm: MM:SS time input with validation
- VomitPropForm: Yes/No buttons

Features:
- Client-side validation
- Real-time error feedback
- Loading states on submit
- Success/error messages

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1c.4: Create Bet Distribution Component
Create `components/BetDistribution.tsx`:
- Show time O/U split (# over vs # under per threshold)
- Show exact time guesses (user + time for each)
- Show vomit prop split (# yes vs # no)

**Commit message:**
```
Add BetDistribution component for viewing all bets

Displays aggregate stats:
- Time Over/Under: Split per threshold
- Exact Time Guesses: List of users + their guesses
- Vomit Prop: Yes/No count

Features:
- Readable formatting (MM:SS for times)
- Responsive table layout
- Show/hide details

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1c.5: Create My Bets Component
Create `components/MyBets.tsx`:
- Show current user's bets
- Format per bet type
- Delete button per bet
- Confirmation before delete

**Commit message:**
```
Add MyBets component for viewing personal bets

Features:
- List all current user's bets
- Format per bet type (readable)
- Delete button with confirmation
- Real-time update on delete
- Empty state message

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 1c.6: Create Betting Page
Create `app/betting/page.tsx`:
- Three bet forms (tabs or stacked)
- My Bets section
- Bet Distribution section
- Event status (locked/unlocked)

**Commit message:**
```
Add /betting page for placing bets and viewing distribution

Features:
- Tab or stacked layout with all three bet forms
- Display current user's bets with delete option
- Show aggregate bet distribution
- Show event lock status
- Error/success messages
- Real-time updates

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

### Phase 2: Results & Leaderboard

#### Task 2.1: Create Results API Endpoints
Create:
- `app/api/admin/results/route.ts` (POST /api/admin/results)
- `app/api/admin/finalize-results/route.ts` (POST)
- `app/api/admin/reset-results/route.ts` (POST)

**Commit message:**
```
Implement admin results endpoints

POST /api/admin/results:
- Enter finalTimeSeconds and vomitOutcome
- Admin-only
- Trigger scoring logic (calculate all winners)
- Return preview of winners + final leaderboard
- Do NOT finalize yet (allows review)

POST /api/admin/finalize-results:
- Confirm results, lock them
- Mark event.resultsFinalized = true
- Prevent any further changes

POST /api/admin/reset-results:
- Reset all bets to 'pending' status
- Clear event.finalTimeSeconds, vomitOutcome
- Only if not finalized
- Record reason for audit trail

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 2.2: Create Scoring Logic
Create `lib/scoring.ts` with scoring functions:
- `scoreTimeOverUnderBets()`
- `scoreExactTimeGuess()`
- `scoreVomitPropBet()`
- `calculateLeaderboard()`

**Commit message:**
```
Implement scoring logic for all bet types

Functions:
- scoreTimeOverUnderBets: Compare threshold vs final time
- scoreExactTimeGuess: Find closest guess(es), handle ties
- scoreVomitPropBet: Match prediction vs outcome
- calculateLeaderboard: Sum points per user, rank

Tie-breaking:
- Multiple equal guesses to exact time: All get 1 point
- Multiple equal threshold O/U matches: All get 1 point

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 2.3: Create Leaderboard API Endpoint
Create `app/api/leaderboard/route.ts` (GET).

Returns ranked leaderboard with per-user bet breakdown.

**Commit message:**
```
Implement GET /api/leaderboard endpoint

Returns:
- Ranked list of users by points
- Per-user bet breakdown (which bets won/lost, points each)
- Event details (final time, vomit outcome, finalized status)
- Summary of all winning bets

Used by frontend leaderboard page.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 2.4: Create Admin Results Form
Create `components/AdminResultsForm.tsx`:
- MM:SS time input
- Yes/No vomit outcome buttons
- Preview button (calls results endpoint)
- Show preview modal with winners
- Finalize button with confirmation

**Commit message:**
```
Add AdminResultsForm component for entering results

Features:
- MM:SS time input with validation
- Yes/No buttons for vomit outcome
- "Preview" button to see winners before finalizing
- Modal shows:
  - List of all winners by bet type
  - Final leaderboard preview
- "Finalize" button with confirmation modal
- Error handling

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 2.5: Create Leaderboard Page
Create `app/leaderboard/page.tsx`:
- Display ranked table (rank, user, points)
- Per-user expandable bet breakdown
- Show final time & vomit outcome (if finalized)
- Color-coded wins/losses

**Commit message:**
```
Add /leaderboard page with final rankings

Features:
- Ranked table: Rank, User, Total Points
- Expandable rows showing each user's bet breakdown
- Color-coded: GREEN for won, RED for lost, GRAY for pending
- Show final event details (time, vomit outcome)
- Message if results not finalized yet
- Responsive design

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 2.6: Create Results Page
Create `app/results/page.tsx`:
- Show final event results (time, vomit outcome)
- Display AdminResultsForm if admin and not finalized
- Show winner summary
- Link to leaderboard

**Commit message:**
```
Add /results page for displaying and entering results

Features:
- Display final time and vomit outcome (if available)
- Show admin form (admin-only, if not finalized)
- Display preview of winners
- Link to full leaderboard
- Show results finalization status

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

### Phase 3: Polish, Optimization & Testing

#### Task 3.1: Error Handling
Create `lib/errors.ts` with custom error classes and API error handler middleware.

**Commit message:**
```
Implement comprehensive error handling

Add:
- Custom error classes (ValidationError, AuthError, ConflictError, etc.)
- API error response formatter (consistent error shape)
- Server-side error logging
- User-friendly error messages (no internal details)
- Error boundary component for React errors

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 3.2: Validation
Audit all API routes for input validation. Ensure Zod schemas cover:
- Auth endpoints
- Availability endpoints
- Bet endpoints
- Admin endpoints

**Commit message:**
```
Audit and enhance input validation across all endpoints

Review and expand Zod schemas for:
- Signup/login
- Availability updates
- Bet placement (all types)
- Admin results entry
- Admin lock-date

Add custom validators (date ranges, time bounds, etc.).

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 3.3: Logging
Create `lib/logging.ts` with structured logging.

**Commit message:**
```
Add server-side logging for debugging and monitoring

Features:
- Log all API requests (method, path, user, timestamp)
- Log errors with full stack
- Log important business events (bet placed, results finalized)
- Structured JSON format for parsing
- Console output in development, file/service in production

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 3.4: Unit Tests
Write tests for critical functions:
- Scoring logic
- Consensus calculation
- Validation schemas

**Commit message:**
```
Add unit tests for critical business logic

Create Jest tests for:
- Scoring functions (time O/U, exact time, vomit)
- Tie-breaking logic
- Consensus calculation (all users available)
- Validation schemas

Tests cover happy path and edge cases.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 3.5: Database Optimization
Add indexes and optimize queries.

**Commit message:**
```
Optimize database queries and add indexes

Add indexes on frequently queried columns:
- Bet: eventId, userId, betType, status
- Availability: eventId, userId, calendarDate
- LeaderboardEntry: eventId, pointsEarned

Optimize queries:
- Leaderboard query (use denormalized table)
- Consensus calculation (efficient aggregation)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 3.6: TypeScript Audit
Ensure strict mode, no `any` types.

**Commit message:**
```
TypeScript strict mode audit and type safety improvements

- Enable strict mode in tsconfig.json
- Eliminate all implicit any types
- Add explicit types to functions
- Fix any casting with proper types
- Audit React component prop types

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 3.7: UI Polish
Style refinements, accessibility, responsive design.

**Commit message:**
```
Polish UI and improve accessibility

Enhancements:
- Tailwind refinements (spacing, colors, borders)
- Responsive design for mobile/tablet
- Accessibility improvements (ARIA labels, keyboard nav)
- Button/form states (hover, active, disabled)
- Loading spinners and transitions
- Toast/notification styling

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

#### Task 3.8: Deployment Checklist
Create deployment guide and verify production readiness.

**Commit message:**
```
Create deployment guide and production readiness checklist

Document:
- Environment variables for production
- Render dashboard setup (build/start commands)
- Database migration process on Render
- Monitoring and debugging on Render
- Rollback procedures
- First-time admin setup

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

## 4. Dependencies & Independence

### Parallel Implementation Strategy

**Phase 1a (Auth) and Phase 1b (Calendar) and Phase 1c (Betting) can run in PARALLEL:**

```
Phase 0 (Setup)
│
├─→ Phase 1a (Auth) ─┐
├─→ Phase 1b (Calendar) ├─→ Phase 2 (Results & Leaderboard) ─→ Phase 3 (Polish)
└─→ Phase 1c (Betting) ─┘
```

### Why Parallel is Safe

1. **Auth is independent:** No other phase depends on anything but Auth (which is first)
2. **Calendar is independent:** Doesn't need betting to work
3. **Betting is independent:** Doesn't need calendar to work
4. **Phase 2 depends on all Phase 1:** Results endpoint needs bets, leaderboard needs both
5. **Phase 3 is final polish:** Applies to everything

### Git Merge Strategy

All three Phase 1 branches can be developed in parallel:
```bash
git checkout -b dev

# Parallel development
git checkout -b phase-1a-auth
git checkout -b phase-1b-calendar
git checkout -b phase-1c-betting

# After each completes, merge to dev:
git checkout dev
git merge phase-1a-auth
git merge phase-1b-calendar
git merge phase-1c-betting

# Phase 2 starts on merged dev branch:
git checkout -b phase-2-results
```

---

## 5. Implementation Order (Sequential Commits)

### Commit Sequence (One at a Time)

**Phase 0:**
1. Initial setup: Create Next.js 14 project with TypeScript
2. Add project dependencies
3. Create Prisma schema
4. Run initial migration
5. Create utility and validation modules
6. Add Prisma seed script

**Phase 1a (Auth):**
7. Configure NextAuth.js
8. Implement authentication endpoints
9. Add login and signup UI pages
10. Add middleware and root layout
11. (Database already has user table)

**Phase 1b (Calendar):**
12. Implement event and availability endpoints
13. Implement admin lock-date endpoint
14. Add Calendar component
15. Add AdminLockPanel component
16. Add /calendar page

**Phase 1c (Betting):**
17. Implement betting endpoints (POST, GET, DELETE)
18. Add bet form components
19. Add BetDistribution component
20. Add MyBets component
21. Add /betting page

**Phase 2 (Results):**
22. Implement admin results endpoints
23. Implement scoring logic
24. Implement leaderboard endpoint
25. Add AdminResultsForm component
26. Add /leaderboard page
27. Add /results page

**Phase 3 (Polish):**
28. Implement error handling
29. Audit and enhance validation
30. Add logging
31. Add unit tests
32. Optimize database queries
33. TypeScript strict audit
34. UI polish
35. Create deployment guide

---

## 6. Neon Setup Instructions (Reference)

### Pre-Implementation: User Sets Up Neon

**Before implementing, user must:**

1. **Create Neon dev database:**
   - Go to https://neon.tech
   - Sign up/sign in
   - Create project: `beer-mile-dev`
   - Copy pooled connection string
   - Format: `postgresql://user:password@ep-xxxxx-pooling.neon.tech/beer_mile_dev?sslmode=require`

2. **Create Neon prod database:**
   - Create project: `beer-mile-prod` (same region as Render app)
   - Copy pooled connection string

3. **Create `.env.local` file locally:**
   ```bash
   # .env.local (DO NOT COMMIT)
   DATABASE_URL="postgresql://user:password@ep-xxxxx-pooling.neon.tech/beer_mile_dev?sslmode=require"
   NEXTAUTH_SECRET="$(openssl rand -base64 32)"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   NODE_ENV="development"
   EVENT_ID="event-1"
   ```

4. **Verify connection (after Phase 0):**
   ```bash
   npm run db:studio  # Should open Prisma Studio GUI
   ```

### For Render Deployment (Later)

Set environment variables in Render dashboard:
- `DATABASE_URL` (from Neon prod)
- `NEXTAUTH_SECRET` (generate new: `openssl rand -base64 32`)
- `NEXTAUTH_URL` (your Render domain, e.g., https://beer-mile.render.com)
- `NEXT_PUBLIC_API_URL` (same as NEXTAUTH_URL + /api)
- `NODE_ENV="production"`
- `EVENT_ID="event-1"`

---

## 7. Pre-Implementation Checklist

### User Must Complete Before We Start

- [ ] Created Neon dev database (`beer-mile-dev`)
- [ ] Created Neon prod database (`beer-mile-prod`)
- [ ] Obtained dev connection string from Neon
- [ ] Obtained prod connection string from Neon
- [ ] Confirmed `.env.local` will be created locally (not committed)
- [ ] Confirmed NEXTAUTH_SECRET will be generated
- [ ] Ready to create `dev` branch: `git checkout -b dev`
- [ ] Node.js 18+ installed locally
- [ ] npm installed locally

### Implementer Must Complete Before Phase 0 Starts

- [ ] Review `01-requirements.md` and `02-architecture.md`
- [ ] Understand Prisma schema and data relationships
- [ ] Understand NextAuth.js configuration approach
- [ ] Understand Zod validation pattern
- [ ] Ready to proceed with Phase 0 scaffolding

---

## 8. Key Gates & Dependencies

| Gate | Depends On | Blocks | Decision |
|------|-----------|--------|----------|
| Phase 0 Complete | Neon setup | All other phases | User provides connection strings |
| Phase 1a Complete | Phase 0 | Phase 1b, 1c (UI needs auth) | Auth must work first |
| Phase 1b Complete | Phase 0 | Phase 2 (lock gate removed) | Calendar done |
| Phase 1c Complete | Phase 0 | Phase 2 (needs bets) | Betting done |
| Phase 2 Start | 1a + 1b + 1c | Phase 3 | Results endpoint needs everything |
| Phase 2 Complete | Scoring logic | Phase 3 | Leaderboard must be accurate |
| Phase 3 Start | Phase 0-2 | Deployment | Polish all components |
| Deployment Ready | Phase 3 | Production | All tests pass, docs complete |

---

## 9. Success Criteria by Phase

### Phase 0: Scaffolding
- [ ] Next.js 14 project created with TypeScript
- [ ] All dependencies installed
- [ ] `.env.local` created with Neon connection string
- [ ] Prisma schema created and reviewed
- [ ] Database tables created in Neon (verify via Prisma Studio)
- [ ] Utility files created (prisma.ts, validation.ts, utils.ts)

### Phase 1a: Authentication
- [ ] User can sign up with email, username, password
- [ ] User can log in with email and password
- [ ] Passwords are hashed with bcryptjs
- [ ] Sessions persist across page reloads
- [ ] Unauthenticated users redirected to login
- [ ] Admin user seeded (admin@beer-mile.test / admin123)
- [ ] Logout works and clears session

### Phase 1b: Calendar & Availability
- [ ] Calendar displays 3-month rolling window
- [ ] Users can toggle availability (mark dates as available/unavailable)
- [ ] Consensus dates show GREEN (all users available)
- [ ] Non-consensus dates show RED (someone unavailable)
- [ ] Admin can lock a consensus date
- [ ] Locked date prevents further availability changes
- [ ] Event status visible to all users
- [ ] Consensus calculation accurate (100% required)

### Phase 1c: Betting
- [ ] Users can place all three bet types
- [ ] Time Over/Under: threshold selector + direction (over/under)
- [ ] Exact Time Guess: MM:SS input, one per user per event
- [ ] Vomit Prop: Yes/No buttons, one per user per event
- [ ] Bet distribution shows aggregate stats (counts, guesses list)
- [ ] Users can view their own bets
- [ ] Users can delete their bets (before finalization)
- [ ] Bets persist in database
- [ ] Validation prevents invalid bets
- [ ] Bet uniqueness enforced (1x exact, 1x vomit)

### Phase 2: Results & Leaderboard
- [ ] Admin can enter final time (MM:SS) and vomit outcome
- [ ] Scoring logic calculates winners correctly
- [ ] Exact time guess: Closest guess(es) win 1 point each (ties included)
- [ ] Time Over/Under: Correct direction wins 1 point each (ties included)
- [ ] Vomit Prop: Correct prediction wins 1 point each (ties included)
- [ ] Admin can preview winners before finalizing
- [ ] Admin can finalize results (locks everything)
- [ ] Once finalized, no more bets can be placed/deleted
- [ ] Leaderboard shows accurate rankings by points
- [ ] Leaderboard shows per-user bet breakdown (won/lost)
- [ ] Admin can reset results before finalization (data entry error recovery)

### Phase 3: Polish & Production
- [ ] All API error responses follow standard format
- [ ] Validation errors provide helpful feedback
- [ ] Server logs important events (signup, bets, results)
- [ ] Database indexes optimized for queries
- [ ] Critical functions have unit tests (scoring, consensus)
- [ ] TypeScript strict mode enabled, no implicit any types
- [ ] UI responsive on mobile/tablet
- [ ] Loading states and transitions smooth
- [ ] Error messages user-friendly (no internal details)
- [ ] Deployment guide complete
- [ ] Environment variables documented

---

## 10. Next Steps (Waiting for User)

### Immediate Actions
1. **User:** Set up Neon databases (dev & prod)
2. **User:** Create `.env.local` with DATABASE_URL and NEXTAUTH_SECRET
3. **User:** Run `git checkout -b dev` to create feature branch
4. **User:** Message implementer when ready

### Once User Confirms Ready
1. **Implementer:** Begin Phase 0 (scaffolding)
2. **Implementer:** Create Next.js project, install dependencies
3. **Implementer:** Create Prisma schema and run migration
4. **Implementer:** Commit each task sequentially (not all at once)
5. **Implementer:** Test locally with `npm run dev` and `npm run db:studio`

### During Implementation
- Update `03-implementer.md` with progress after each phase completes
- Keep git commits small and focused (one feature per commit)
- Test each phase end-to-end before moving to next
- Document any decisions or blockers

### After Phase 3 Complete
- User will call Designer for code review & architecture validation
- Designer will review implementation against architecture spec
- Then proceed to Tester phase for comprehensive testing

---

## Quick Reference: File Structure After Completion

```
beer-mile/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...]nextauth/route.ts
│   │   │   ├── signup/route.ts
│   │   │   └── logout/route.ts
│   │   ├── availability/route.ts
│   │   ├── event/current/route.ts
│   │   ├── bets/route.ts
│   │   ├── bets/[id]/route.ts
│   │   ├── leaderboard/route.ts
│   │   └── admin/
│   │       ├── lock-date/route.ts
│   │       ├── results/route.ts
│   │       ├── finalize-results/route.ts
│   │       └── reset-results/route.ts
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── calendar/page.tsx
│   ├── betting/page.tsx
│   ├── results/page.tsx
│   ├── leaderboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx (dashboard)
├── components/
│   ├── Calendar.tsx
│   ├── AdminLockPanel.tsx
│   ├── TimeOverUnderForm.tsx
│   ├── ExactTimeGuessForm.tsx
│   ├── VomitPropForm.tsx
│   ├── BetDistribution.tsx
│   ├── MyBets.tsx
│   ├── AdminResultsForm.tsx
│   ├── Leaderboard.tsx
│   └── ...
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── validation.ts
│   ├── utils.ts
│   ├── scoring.ts
│   ├── errors.ts
│   ├── logging.ts
│   └── context/
│       └── AuthContext.tsx
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/
│   ├── scoring.test.ts
│   └── ...
├── .env.local (local only, not committed)
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── middleware.ts
```

---

## Summary

This implementation plan breaks Annie's Beer Mile Betting App into 35 incremental commits across 3 phases + 1 polish phase. The approach is:

1. **Phase 0:** Scaffolding (6 commits) - Set up project, database, utilities
2. **Phase 1a:** Authentication (5 commits) - Signup, login, sessions
3. **Phase 1b:** Calendar (5 commits) - Availability tracking, consensus, admin lock
4. **Phase 1c:** Betting (5 commits) - All three bet types, forms, distribution
5. **Phase 2:** Results (6 commits) - Scoring, leaderboard, admin finalization
6. **Phase 3:** Polish (8 commits) - Errors, validation, logging, tests, deployment

**Key design decisions:**
- No event lock gate: Users can bet anytime
- Singleton event for MVP: Can scale to multi-event in Phase 4+
- Parallel Phase 1a/1b/1c: Calendar and betting independent
- Sequential commits: One feature per commit for clarity
- Database already multi-event capable: Migrations will include eventId foreign keys

**Ready to start Phase 0 once user:**
- Sets up Neon dev database
- Sets up Neon prod database
- Creates `.env.local` with DATABASE_URL and NEXTAUTH_SECRET
- Runs `git checkout -b dev`
- Confirms readiness

---

**Document Status:** FINALIZED & READY FOR IMPLEMENTATION

**Next Action:** Await user confirmation that Neon is set up and `.env.local` is ready. Then proceed with Phase 0.
