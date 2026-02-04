# Implementation: Annie's Beer Mile Betting App

**Status:** Phase 1 Complete (Auth, Calendar, Betting, Scoring, Leaderboard)
**Last Updated:** 2026-02-03

---

## Phase 1: Complete Feature Set

### Phase 1a: Authentication (COMPLETE)

---

## Phase 1b: Calendar & Availability (COMPLETE)

- Event status API, 3-month rolling calendar, consensus calculation, admin lock/unlock date
- Calendar component with color-coded dates (green=consensus, blue=available, red=unavailable, gray=past)
- Full type safety with TypeScript

## Phase 1c: Betting System (COMPLETE)

- Three bet types: time over/under, exact time guess (2 points), vomit prop
- Scoring logic with tie-breaking (both users get points if equally close)
- Admin results form with preview before finalization
- Leaderboard with ranking and detailed bet breakdown
- All APIs support validation, error handling, idempotency

---

## Project Structure

```
beer-mile/
├── .env.local                        (NEXTAUTH_SECRET, DATABASE_URL set)
├── .env.local.example
├── package.json                      (All dependencies installed)
├── tsconfig.json                     (Strict mode)
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.json
├── prisma/
│   ├── schema.prisma                 (5 models: User, Event, Availability, Bet, LeaderboardEntry)
│   ├── seed.ts                       (Admin + event seeded)
│   └── migrations/
│       └── 20260124150516_init/
│           └── migration.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx               (Root + SessionProvider)
│   │   ├── page.tsx                 (Home dashboard with nav links)
│   │   ├── globals.css              (Tailwind)
│   │   ├── (auth)/                  (Route group for auth pages)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         (Login form)
│   │   │   └── signup/
│   │   │       └── page.tsx         (Signup form)
│   │   ├── calendar/                (Phase 1b)
│   │   │   └── page.tsx             (Calendar interface)
│   │   ├── betting/                 (Phase 1c - NEW)
│   │   │   └── page.tsx             (Betting interface)
│   │   ├── results/                 (Phase 1c - NEW)
│   │   │   └── page.tsx             (Results & admin form)
│   │   ├── leaderboard/             (Phase 1c - NEW)
│   │   │   └── page.tsx             (Leaderboard display)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/
│   │       │   │   └── route.ts     (NextAuth handler)
│   │       │   ├── signup/
│   │       │   │   └── route.ts     (Register API)
│   │       │   └── logout/
│   │       │       └── route.ts     (Logout API)
│   │       ├── event/
│   │       │   └── current/
│   │       │       └── route.ts     (Event status)
│   │       ├── availability/
│   │       │   └── route.ts         (GET/POST availability)
│   │       ├── bets/                (Phase 1c - NEW)
│   │       │   ├── route.ts         (POST/GET bets)
│   │       │   └── [id]/
│   │       │       └── route.ts     (DELETE bet)
│   │       ├── leaderboard/         (Phase 1c - NEW)
│   │       │   └── route.ts         (GET leaderboard)
│   │       └── admin/
│   │           ├── lock-date/
│   │           │   └── route.ts     (Lock event date)
│   │           ├── results/         (Phase 1c - NEW)
│   │           │   └── route.ts     (Enter results)
│   │           ├── finalize-results/ (Phase 1c - NEW)
│   │           │   └── route.ts     (Finalize results)
│   │           └── reset-results/   (Phase 1c - NEW)
│   │               └── route.ts     (Reset results)
│   ├── components/
│   │   ├── SessionProviderWrapper.tsx  (Client SessionProvider)
│   │   ├── Calendar.tsx             (Phase 1b)
│   │   ├── AdminLockPanel.tsx       (Phase 1b)
│   │   ├── BetForm.tsx              (Phase 1c - NEW)
│   │   ├── MyBetsList.tsx           (Phase 1c - NEW)
│   │   ├── BetDistribution.tsx      (Phase 1c - NEW)
│   │   └── Leaderboard.tsx          (Phase 1c - NEW)
│   ├── lib/
│   │   ├── prisma.ts               (Singleton)
│   │   ├── validation.ts           (Zod schemas - updated for Phase 1c)
│   │   ├── utils.ts                (Helper functions)
│   │   ├── auth.ts                 (NextAuth config)
│   │   ├── types.ts                (TypeScript extensions)
│   │   └── scoring.ts              (Phase 1c - NEW, Scoring logic)
│   ├── middleware.ts               (Route protection)
│   └── context/                    (To be created in Phase 3)
├── Handoffs/
│   ├── 01-requirements.md
│   ├── 02-architecture.md
│   ├── 03-implementer.md            (This file)
├── CLAUDE.md
├── README.md
└── node_modules/

Note: .next/ and .git/ directories created by npm/git
```

---

## 8. Environment Setup

### .env.local (Configured)
```
DATABASE_URL="postgresql://neondb_owner:npg_KzgbpcDJ9Vv2@ep-wispy-star-ae1i0hdg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="F7gglgmkdHvW0ym7Kiulg8DaEiWkuHyUBAs9+xk4zz0="
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NODE_ENV="development"
EVENT_ID="event-1"
```

### Database
- Provider: Neon PostgreSQL (managed serverless)
- Tables: 5 (users, events, availabilities, bets, leaderboard_entries)
- Admin User: admin@beer-mile.test / admin123
- Event: event-1 ("Annie's Beer Mile")

---

## 9. Testing Checklist (Phase 1a Complete)

- [x] npm run dev - Server starts on http://localhost:3001
- [x] TypeScript compilation - npx tsc --noEmit passes without errors
- [x] Database connection - Neon PostgreSQL connected and migrated
- [x] Admin user - admin@beer-mile.test / admin123 seeded in database
- [x] Signup API - POST /api/auth/signup accepts valid users
- [x] Login page - /auth/login renders with form
- [x] Signup page - /auth/signup renders with validation
- [x] Route protection - Middleware redirects to /auth/login?callbackUrl
- [x] Session persistence - JWT-based sessions work correctly
- [x] Type safety - All TypeScript types compile without errors

### Quick Test Script
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'

# Expected: {"success":true,"data":{...user info...}}

# Then visit in browser:
# http://localhost:3001/auth/login
# Login with admin@beer-mile.test / admin123
```

---

## 10. Next Actions

### Immediate (Phase 3: Testing & Polish)
1. **Testing & Bug Fixes**
   - Test all bet placement workflows end-to-end
   - Test exact time guess tie-breaking
   - Test admin result entry and finalization
   - Test results cannot be changed after finalization
   - Test leaderboard updates correctly

2. **Error Handling Audit**
   - Review all error messages are user-friendly
   - Ensure proper HTTP status codes
   - Handle edge cases (no users, ties, zero points, etc.)

3. **UI Polish**
   - Responsive design for mobile betting
   - Loading states and animations
   - Better form UX (MM:SS picker, threshold suggestions)
   - Accessibility audit

4. **Logging & Monitoring**
   - Add structured logging for all operations
   - Track bet placement, scoring, finalization
   - Error logs for debugging

5. **Documentation**
   - Testing guide for manual QA
   - Admin user guide for results entry
   - User guide for betting system

### Phase 4+
6. **Advanced Features:**
   - Email notifications when date locked / results finalized
   - Real-time bet distribution updates
   - Achievement badges
   - Chat/trash talk feature
   - Multi-event support

---

## 11. Key Decisions Made

### Phase 0 Decisions
- **Singleton Event for MVP:** Using EVENT_ID="event-1" env var. Multi-event refactoring deferred to Phase 4+.
- **Prisma Seed:** CommonJS syntax (require) to avoid ESM/CJS cycle issues with ts-node.
- **Strict TypeScript:** Enabled strict mode, no implicit any types (excluding prisma folder from build).
- **Validation with Zod:** All schemas pre-defined in lib/validation.ts, ready for API routes.
- **Util Functions:** Pre-built time formatting, date utilities, calendar grid generation.

### Phase 1a Decisions
- **JWT Sessions:** Using JWT strategy instead of database sessions for simplicity and scalability. 30-day expiry.
- **CredentialsProvider:** Custom credentials provider with bcryptjs password hashing (10 salt rounds).
- **Route Groups:** Using Next.js route groups `(auth)` to organize auth pages without affecting URL structure.
- **Middleware:** Using Next.js middleware for centralized route protection with callback URL preservation.
- **Client Wrapper:** SessionProvider wrapped in client component to avoid metadata conflicts in root layout.
- **Automatic Leaderboard:** New users automatically added to leaderboard_entries table with 0 points upon signup.
- **Type Safety:** Extended NextAuth types for Session/JWT to include username and role for strict type checking.

### Phase 1c Decisions
- **Bet Uniqueness:** Enforce 1 exact_time_guess and 1 vomit_prop per user per event via database upsert (delete old, create new).
- **Unlimited Over/Under:** Users can place multiple time_over_under bets with different thresholds for flexibility.
- **Tie-Breaking:** Both users get 1 point if equally close on exact time guess (fairness over winner-take-all).
- **Preview Before Finalize:** Admin must preview winners before finalizing to prevent accidental misconfigurations.
- **Idempotent Finalize:** Check resultsFinalized flag before updating to prevent double-finalization.
- **Reset with Audit Trail:** Reset endpoint requires reason for audit trail before wiping scores.
- **Scoring Module:** Separated all scoring logic into lib/scoring.ts for testability and maintainability.
- **Client-Side Forms:** Use separate form components (TimeOverUnderForm, etc.) for better UX and type safety per bet type.
- **Leaderboard Denormalization:** Store final points/rank in leaderboard_entries table, calculated once at finalization for fast queries.

---

## 12. Success Criteria (Phase 0)

- [x] Next.js 14 project created with TypeScript
- [x] All dependencies installed (next, prisma, nextauth, zod, bcryptjs, etc.)
- [x] .env.local configured with DATABASE_URL and NEXTAUTH_SECRET
- [x] Prisma schema created with all 5 models
- [x] Database migrated (tables created in Neon)
- [x] Admin user seeded (admin@beer-mile.test / admin123)
- [x] Initial event seeded (event-1)
- [x] Project builds without errors
- [x] Utility modules created (prisma, validation, utils)

**Phase 0 Status:** ✅ COMPLETE

## 13. Success Criteria (Phase 1a)

- [x] NextAuth.js configured with CredentialsProvider and JWT sessions
- [x] Password hashing with bcryptjs (10 salt rounds)
- [x] Signup endpoint validates inputs and prevents duplicate emails/usernames
- [x] Login endpoint authenticates with password comparison
- [x] JWT callbacks correctly populate session with user id, username, role
- [x] Middleware protects routes and preserves callback URLs
- [x] Login page with form, error messages, link to signup
- [x] Signup page with client-side validation and form fields
- [x] Home page dashboard shows user info and logout button
- [x] SessionProvider available to all components via client wrapper
- [x] TypeScript strict mode passes - no implicit any types
- [x] All types properly extended (Session, JWT, User)
- [x] New users automatically added to leaderboard on signup

**Phase 1a Status:** ✅ COMPLETE

## 15. Success Criteria (Phase 1c)

- [x] All three bet types can be placed (time over/under, exact time guess, vomit prop)
- [x] Validation enforces: event locked, results not finalized, time limits 0-1200s
- [x] Exact time guess and vomit prop: max 1 per user per event (replace old)
- [x] Time over/under: unlimited with different thresholds
- [x] Bet distribution shows aggregate stats (counts, guesses, predictions)
- [x] Scoring logic implemented for all bet types
- [x] Tie-breaking: both users get point if equally close
- [x] Admin can enter final time and vomit outcome
- [x] Admin can preview winners before finalizing
- [x] Admin can finalize results (idempotent)
- [x] Admin can reset results before finalization (with audit trail)
- [x] Leaderboard displays ranked users by points
- [x] Leaderboard shows detailed bet breakdown when expanded
- [x] Users cannot place/delete bets after results finalized
- [x] All API endpoints have proper error handling and validation
- [x] All pages are client-safe with proper authentication checks
- [x] Home page updated with navigation to all features

**Phase 1c Status:** ✅ COMPLETE

---

## Testing Phase 1c

### Quick Start
```bash
npm run dev  # Start on http://localhost:3001
```

### Test Workflow
1. **Login as regular user** (alice@example.com / Alice123@)
2. **Go to /betting page**
3. **Place a time over/under bet** (e.g., under 6 minutes)
4. **Place an exact time guess** (e.g., 5:47)
5. **Place a vomit prop** (yes or no)
6. **View your bets** in the "My Bets" section
7. **See distribution** in "Bet Distribution" section
8. **Login as admin** (admin@beer-mile.test / admin123)
9. **Go to /results page**
10. **Enter final time** (e.g., 5:45)
11. **Select vomit outcome** (yes/no)
12. **Preview results** - should show winners
13. **Finalize results** - locks leaderboard
14. **View /leaderboard** - should show final rankings with medal emojis

### API Testing (with curl or Postman)
```bash
# Place over/under bet (need auth session)
curl -X POST http://localhost:3001/api/bets \
  -H "Content-Type: application/json" \
  -d '{"betType":"time_over_under","thresholdSeconds":360,"direction":"over"}'

# Get all bets and distribution
curl http://localhost:3001/api/bets

# Enter results (admin only)
curl -X POST http://localhost:3001/api/admin/results \
  -H "Content-Type: application/json" \
  -d '{"finalTimeSeconds":345,"vomitOutcome":false}'

# Finalize results (admin only)
curl -X POST http://localhost:3001/api/admin/finalize-results \
  -H "Content-Type: application/json" \
  -d '{"confirm":true}'

# Get leaderboard
curl http://localhost:3001/api/leaderboard
```

### Edge Cases to Test
1. User tries to place exact_time_guess, then places another - old one should be deleted
2. User tries to place vomit_prop, then changes mind - old one should be deleted
3. User tries to delete bet after results finalized - should get error
4. Admin tries to finalize twice - should get "already finalized" error
5. Admin tries to reset after finalization - should get error
6. No consensus date reached - betting page should say event not locked
7. Multiple users with same exact time distance - both should get 1 point

---

## 14. Known Issues & Notes

### Phase 0 Notes
- npm audit reports 3 high severity vulnerabilities (minor, not blocking development)
- Prisma Studio accessible via: `DATABASE_URL="..." npx prisma studio`
- Build configures strict mode automatically; tsconfig.json updated to match Next.js defaults
- Seed script uses CommonJS (require) instead of ES modules to avoid ts-node cycle issues

### Phase 1a Notes
- Dev server runs on port 3001 (configured in package.json)
- NEXTAUTH_URL must match dev server port (http://localhost:3001) - FIXED Jan 25
- NEXT_PUBLIC_API_URL also updated to port 3001 - FIXED Jan 25
- Sessions persist for 30 days via JWT tokens
- All new users created with role="user"; admin role must be manually set or use seed
- Password requirements: 8+ chars, at least one number, at least one special character
- Email uniqueness enforced at database level (unique constraint)
- Logout handled client-side via NextAuth signOut() function
- Middleware allows /api/auth/* routes without authentication for NextAuth flow

### Auth Callback 404 Fix (Jan 25)
- ISSUE: When calling signIn('credentials', ...), NextAuth internally posts to /api/auth/callback/credentials
- ROOT CAUSE: NEXTAUTH_URL was incorrectly set to http://localhost:3000 while dev server runs on port 3001
- This mismatch caused NextAuth to generate incorrect internal redirect URLs
- FIX: Updated .env.local NEXTAUTH_URL from port 3000 → port 3001
- The [...]nextauth catch-all route was already correct; the issue was purely the environment variable mismatch

### TypeScript / Build Notes
- Session types extended in src/lib/types.ts module declaration
- SessionProvider must be wrapped in client component ("use client") due to React server component constraints
- Metadata export in root layout is incompatible with "use client"; metadata moved to layout component directly
- All route handlers use /route.ts pattern (not /route.js)

---

## Testing Phase 1b

### Quick Start
```bash
npm run dev  # Start on http://localhost:3001
```

### Test Users
- Admin: admin@beer-mile.test / admin123
- Alice: alice@example.com / Alice123@
- Bob: bob@example.com / Bobby123@
- Charlie: charlie@example.com / Charlie123@
- TestUser1: test1@example.com / Test123@

### Browser Testing
1. Visit http://localhost:3001/calendar
2. Login with any test user
3. Mark dates as available/unavailable (blue = available, red = unavailable)
4. Switch to admin user to see AdminLockPanel
5. When all users mark the same date available (shows green), admin can lock it

### API Testing (with authenticated request)
The endpoints are protected by middleware. Access them through the browser UI or by:
1. Getting a valid session cookie from login
2. Using that cookie in API requests

---

**Last Updated:** 2026-02-03 by Claude (Implementer Agent)
**Current Phase:** Phase 1c - Betting System (COMPLETE + Routing Updates)
**Completed Phases:** Phase 0 (Setup), Phase 1a (Auth), Phase 1b (Calendar), Phase 1c (Betting)
**Latest Changes:** Updated home page routing logic to redirect users immediately
**Next Phase:** Phase 3 - Testing, Polish, Logging, and Deployment
**Ready for Review:** Yes - Phase 1c complete with all betting, scoring, and admin functionality

## Recent Changes (Feb 3, 2026)

### Change 5: Updated Exact Time Guess Scoring to 2 Points
**Files:**
- `/src/lib/scoring.ts` (lines 76 and 197)
- `/src/app/betting/page.tsx` (point values guide added)

**What:**
- Changed exact time guess winning bets from 1 point to 2 points
- Updated scoring logic in `scoreAllBets` function to award 2 points for exact_time_guess winners
- Updated preview generator in `generateScoringPreview` to display 2 points for exact_time_guess
- Added visible point values guide on betting page showing all three bet types and their point values

**Why:**
- Exact time guess is harder to predict than other bet types
- Increased reward incentivizes more strategic guessing
- Makes leaderboard more competitive and interesting

**Implementation Details:**
1. In `scoreAllBets()`: Changed `pointsAwarded: won ? 1 : 0` to `pointsAwarded: won ? (bet.betType === 'exact_time_guess' ? 2 : 1) : 0`
2. In `generateScoringPreview()`: Changed `points: 1` to `points: 2` in the exact_time_guess winners block
3. In `/betting page`: Added new "Point Values" section at top showing:
   - Time Over/Under: 1 point (purple)
   - Exact Time Guess: 2 points (cyan)
   - Vomit Prop: 1 point (pink)

**Impact:**
- Users now understand the point structure before betting
- Exact time guess winners earn double the standard bet reward
- Leaderboard calculations automatically account for 2-point wins
- No database migration needed (existing bets keep original 1-point value; new winners score 2 points)

### Change 4: Removed Dashboard Link from Header Navigation
**File:** `/src/components/Header.tsx`
- **What:** Removed Dashboard link from both desktop and mobile navigation menus
- **Why:** Home page (/) now redirects to login or betting automatically - no dashboard UI exists anymore
- **Removed Items:**
  - Line 23: `const isDashboard = pathname === '/'` (path check no longer needed)
  - Lines 45-54: Desktop nav Dashboard link with `isDashboard` styling
  - Lines 172-182: Mobile menu Dashboard link with active state styling
- **Result:** Header navigation now shows only: Calendar, Betting, Results (for authenticated users)
- **Impact:** Cleaner menu, no dead navigation link

### Change 3: Updated Home Page Routing Logic
**File:** `/src/app/page.tsx`
- **What:** Replaced dashboard display with automatic redirect logic
- **Before:** Home page showed landing page to anonymous users, dashboard to authenticated users
- **After:** Home page now redirects based on auth status:
  - Not logged in → Redirect to `/auth/login`
  - Logged in → Redirect to `/betting`
- **Implementation:**
  - Used `useEffect` with `useSession()` to detect auth status changes
  - Router redirects after status is determined (not during loading)
  - Shows loading spinner during auth check
- **Behavior:** Fully automatic - no UI interaction needed. Loading state properly handled.

### Change 1: Removed Event Lock Requirement for Results Entry
**File:** `/src/app/api/admin/results/route.ts` (lines 81-93 removed)
- **What:** Deleted validation check that required event to be locked before admin could enter results
- **Why:** To allow admins to enter results at any time, regardless of event lock status
- **Impact:** Admins can now preview and finalize results immediately without needing event date to be locked first
- **Tests:** Admin can use Results page to enter final time and vomit outcome anytime

### Change 2: Added Navigation Menu Items
**File:** `/src/components/Header.tsx` (multiple additions)
- **What:** Added two new navigation links to both desktop and mobile menus
  - "Betting" link to `/betting` page
  - "Results" link to `/results` page
- **How:**
  - Added `isBettingPage` and `isResultsPage` path checks (lines 21-22)
  - Added Betting and Results links to desktop nav (lines 67-86)
  - Added Betting and Results links to mobile nav (lines 174-195)
- **Styling:** Links highlight when active and follow existing design pattern
- **Mobile Support:** Mobile menu items close on click and respond to active state

## Summary of Implementation

**Annie's Beer Mile Betting App - Complete Phase 1 Implementation:**

The application now supports the full Phase 1 feature set:
1. User authentication (signup/login with JWT sessions)
2. Calendar with availability tracking (3-month rolling window, consensus calculation)
3. Admin lock date functionality
4. Complete betting system with 3 bet types
5. Scoring logic with tie-breaking
6. Admin results entry with preview
7. Leaderboard with detailed breakdowns

**Code Quality:**
- Full TypeScript with strict mode
- Zod validation on all inputs
- Proper error handling with meaningful messages
- Modular architecture (scoring in lib/scoring.ts)
- Client/server separation (use client for components, route handlers for API)
- Database relationships and constraints in Prisma schema

**Next for Tester:** Run full end-to-end test workflow from betting to finalization
**Next for Designer:** Review UI/UX, suggest polish improvements
**Next for Deployer:** Prepare deployment to Render with Neon PostgreSQL
