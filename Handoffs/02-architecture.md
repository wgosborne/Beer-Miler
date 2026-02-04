# Architecture: Annie's Beer Mile Betting App

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | Next.js 14 (React) | Single deployment, built-in API routes, SSR/SSG |
| Backend | Next.js API Routes | Colocated with frontend, no separate service needed |
| Database | Neon PostgreSQL | Managed, auto-scaling, serverless billing |
| ORM | Prisma | Type-safe queries, auto-migrations |
| Auth | NextAuth.js | JWT sessions, password hashing built-in |
| Hosting | Render.com | Native Next.js support, auto-deploys on git push |
| Styling | Tailwind CSS | Rapid development, dark theme support |
| Testing | Jest | Unit and integration tests |

**Why this stack:** Single Next.js deployment eliminates operational complexity. Neon + Render = serverless PostgreSQL + simple hosting. No separate frontend/backend coordination needed.

---

## System Architecture

```
Browser/Mobile
    ↓ HTTPS
Render.com (Next.js 14 App)
├── React Components (UI)
├── API Routes (/api/*)
│   ├── /auth (signup, login, logout)
│   ├── /availability (calendar)
│   ├── /bets (place, view, delete)
│   ├── /leaderboard
│   └── /admin/* (results, finalize, unlock)
├── Prisma ORM (data access)
└── NextAuth.js (sessions, JWT)
    ↓
Neon PostgreSQL (managed)
├── users
├── events
├── availabilities
├── bets
└── leaderboard_entries
```

---

## Data Model (5 Tables)

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================
// USERS TABLE
// ============================================
model User {
  id                String      @id @default(cuid())
  username          String      @unique
  email             String      @unique
  passwordHash      String
  role              String      @default("user") // "admin" or "user"
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  availabilities    Availability[]
  bets              Bet[]
  leaderboardEntries LeaderboardEntry[]

  @@map("users")
}

// ============================================
// EVENT TABLE
// ============================================
model Event {
  id                String      @id @default(cuid())
  name              String      @default("Annie's Beer Mile")
  status            String      @default("scheduled") // "scheduled", "in_progress", "completed"

  // Calendar/Scheduling (Phase 1)
  scheduledDate     DateTime?   // Date when event is locked (day only, no time)
  lockedAt          DateTime?   // Timestamp when admin locked the date

  // Results (Phase 2)
  finalTimeSeconds  Int?        // Null until admin enters result
  vomitOutcome      Boolean?    // Null until admin indicates yes/no
  resultsFinalized  Boolean     @default(false) // Prevents double-finalization
  finalizedAt       DateTime?   // When results were marked final

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  availabilities    Availability[]
  bets              Bet[]
  leaderboardEntries LeaderboardEntry[]

  @@map("events")
}

// ============================================
// AVAILABILITY TABLE (Phase 1)
// ============================================
model Availability {
  id                String      @id @default(cuid())
  userId            String
  eventId           String
  calendarDate      DateTime    // Date user is marking availability for
  isAvailable       Boolean     @default(true) // true = available, false = out of town
  updatedAt         DateTime    @updatedAt

  // Relations
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  event             Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([userId, eventId, calendarDate])
  @@index([eventId])
  @@index([userId])
  @@map("availabilities")
}

// ============================================
// BETS TABLE (Phase 2)
// ============================================
model Bet {
  id                String      @id @default(cuid())
  eventId           String
  userId            String
  betType           String      // "time_over_under" | "exact_time_guess" | "vomit_prop"
  status            String      @default("pending") // "pending" | "won" | "lost"
  pointsAwarded     Int         @default(0) // 0 or 1

  // Flexible JSON storage for bet-type-specific data
  // See BetData union type below for shape
  betData           Json

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  event             Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([userId])
  @@index([betType])
  @@map("bets")
}

// ============================================
// LEADERBOARD_ENTRIES TABLE
// ============================================
model LeaderboardEntry {
  id                String      @id @default(cuid())
  userId            String
  eventId           String
  pointsEarned      Int         @default(0)
  rank              Int?        // Calculated when results finalize
  updatedAt         DateTime    @updatedAt

  // Relations
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  event             Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
  @@index([eventId])
  @@index([pointsEarned])
  @@map("leaderboard_entries")
}
```

**Key Design Notes:**
- **JSON `betData`**: Flexible JSONB column per bet type (time_over_under, exact_time_guess, vomit_prop)
- **Uniqueness**: exact_time_guess & vomit_prop = 1 per user per event (replace old). time_over_under = unlimited.
- **Leaderboard**: Denormalized table refreshed after results finalize (fast queries)

---

## API Endpoints (Quick Reference)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/auth/signup | Public | Register new user |
| POST | /api/auth/login | Public | Login (JWT session) |
| POST | /api/auth/logout | Authed | Logout |
| GET | /api/event/current | Authed | Event status |
| GET | /api/availability?month=YYYY-MM | Authed | Calendar data + consensus |
| POST | /api/availability | Authed | Mark dates available/unavailable |
| POST | /api/admin/lock-date | Admin | Lock consensus date |
| POST | /api/admin/unlock-date | Admin | Unlock date |
| POST | /api/bets | Authed | Place bet (any type) |
| GET | /api/bets | Authed | View bets + distribution |
| DELETE | /api/bets/:id | Authed | Delete pending bet |
| POST | /api/admin/results | Admin | Enter final time + vomit, preview winners |
| POST | /api/admin/finalize-results | Admin | Lock results |
| POST | /api/admin/reset-results | Admin | Reset before finalization |
| GET | /api/leaderboard | Authed | Ranked users by points |

**Validation:** All inputs validated with Zod. Bet time limits: 0-1200 seconds. Exact time guess & vomit prop: max 1 per user per event (replaces old). Time over/under: unlimited.

---

## Frontend Routes

```
/                    - Home/dashboard (redirects based on auth)
/auth/login          - Login with carousel
/auth/signup         - Signup with carousel
/calendar            - Availability marking (Phase 1)
/betting             - Place bets (Phase 2)
/results             - Admin results form + leaderboard
/leaderboard         - Detailed ranking page
```

---

## Authentication & Authorization

**JWT Sessions:** NextAuth.js with bcryptjs password hashing (10 rounds). Credentials provider. 30-day token expiry.

**Admin-Only Routes:** `/api/admin/*` require role === "admin" in middleware.

---

## Phase 1 vs Phase 2

**Phase 1 Complete**: Calendar + availability + admin lock/unlock date
**Phase 2 Complete**: Betting (3 types) + scoring + admin results + leaderboard

**Key Rule:** Betting is independent of calendar lock. Users can place bets anytime, regardless of event date lock status.

---

---

---

## Deployment & Setup

**Local Setup:** Node 18+, Git, PostgreSQL (Neon), code editor (VS Code).

### Local Development Environment

**1. Clone repository and install dependencies:**
```bash
git clone https://github.com/your-username/beer-mile.git
cd beer-mile
npm install
```

**2. Create environment file:**
```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/beer_mile_dev"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"
```

**3. Set up database:**

Option A: Local PostgreSQL
```bash
# Create local database
createdb beer_mile_dev

# Run migrations
npx prisma migrate dev --name init
```

Option B: Neon (recommended for consistency with production)
```bash
# Get DATABASE_URL from Neon dashboard
# Update .env.local with Neon DATABASE_URL
npx prisma migrate dev --name init
```

**4. Seed database with test data:**
```bash
npx prisma db seed
```

**5. Start development server:**
```bash
npm run dev
```

Visit `http://localhost:3000` in browser.

### Available npm Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "db:seed": "prisma db seed",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

### Useful Development Commands

```bash
# View database in Prisma Studio GUI
npm run db:studio

# Create a new database migration
npx prisma migrate dev --name add_feature_name

# Generate Prisma client (do after schema changes)
npx prisma generate

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check TypeScript
npx tsc --noEmit
```

### Project Structure

```
beer-mile/
├── app/                          # Next.js app router
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── availability/
│   │   ├── bets/
│   │   ├── leaderboard/
│   │   └── admin/
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   └── signup/
│   ├── calendar/
│   ├── betting/
│   ├── results/
│   ├── leaderboard/
│   └── layout.tsx
├── components/                   # React components
│   ├── Calendar.tsx
│   ├── BetForm.tsx
│   ├── Leaderboard.tsx
│   ├── AdminResultsForm.tsx
│   └── ...
├── lib/                          # Utilities and helpers
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validation.ts             # Zod schemas
│   ├── scoring.ts                # Bet scoring logic
│   ├── context/                  # React contexts
│   └── utils.ts
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed script
│   └── migrations/
├── public/                       # Static assets
├── tests/                        # Unit and integration tests
├── .env.local                    # Local environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

### Testing Strategy

**Unit tests for scoring logic:**
```typescript
// tests/scoring.test.ts
import { scoreTimeOverUnderBets } from "@/lib/scoring";

describe("scoreTimeOverUnderBets", () => {
  it("should mark 'under' bets as won if final time < threshold", () => {
    const bets = [
      { betType: "time_over_under", betData: { thresholdSeconds: 360, direction: "under" } }
    ];
    const finalTime = 347;
    const results = scoreTimeOverUnderBets(bets, finalTime);
    expect(results[0].won).toBe(true);
  });

  it("should mark 'over' bets as lost if final time < threshold", () => {
    const bets = [
      { betType: "time_over_under", betData: { thresholdSeconds: 360, direction: "over" } }
    ];
    const finalTime = 347;
    const results = scoreTimeOverUnderBets(bets, finalTime);
    expect(results[0].won).toBe(false);
  });
});
```

**Component tests with React Testing Library:**
```typescript
// tests/Calendar.test.tsx
import { render, screen } from "@testing-library/react";
import { Calendar } from "@/components/Calendar";

describe("Calendar", () => {
  it("should display green for dates where all users available", () => {
    const availabilities = {
      "2026-03-01": { allAvailable: true, unavailableCount: 0 }
    };
    render(<Calendar availabilities={availabilities} {...otherProps} />);
    expect(screen.getByTestId("date-2026-03-01")).toHaveClass("bg-green-500");
  });
});
```

### Debugging Tips

**1. Check database state:**
```bash
npm run db:studio
# GUI opens for viewing/editing database directly
```

**2. Enable NextAuth debug logging:**
```bash
# .env.local
DEBUG="next-auth:*"
```

**3. Use browser DevTools:**
- Network tab: Check API requests/responses
- Console: Look for JavaScript errors
- Application > Cookies: Verify NextAuth session cookie

**4. Check server logs:**
```bash
# Terminal where you ran npm run dev
# Watch for errors and warnings
```

---

## 13. Security Considerations

### Input Validation
- All API inputs validated with Zod before processing
- Time inputs limited to 0-1200 seconds (0-20 minutes)
- Dates validated as ISO format
- Email format validated

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- Sessions managed via NextAuth with HTTP-only cookies
- JWT tokens signed with NEXTAUTH_SECRET
- CSRF protection built into NextAuth

### Authorization
- Middleware checks for admin role on admin endpoints
- Users can only view their own bets (unless leaderboard public)
- Bets locked once placed (users cannot modify)
- Results finalization one-way (admin can reset, but UI confirms intent)

### Database
- Use environment variables for connection string (never commit)
- Prepared statements via Prisma ORM prevent SQL injection
- Neon provides encryption at rest

### API Security
- Rate limiting: Consider adding Vercel rate limits or Render limits
- CORS: Configure allowed origins if frontend/backend separated (not needed for Next.js single deployment)
- Sensitive data: Don't return password hashes or secrets
- Error responses: Don't expose internal database errors to users

### Deployment
- Set NEXTAUTH_SECRET in Render environment (strong, random value)
- Use HTTPS only (Render enforces this)
- Keep dependencies updated (`npm audit`, `npm update`)
- Monitor error logs on Render dashboard

---

## Summary

This architecture provides a solid foundation for Annie's Beer Mile Betting App. Key highlights:

- **Single deployment:** Next.js on Render eliminates operational complexity
- **Type-safe:** Prisma + TypeScript prevent bugs
- **Extensible:** Bet system supports new types without schema changes
- **Clear phases:** Phase 1 (calendar) independent, Phase 2 builds on it
- **Simple scaling:** Works for 8-12 users, can grow if needed

The implementer should follow this document closely, using the provided schemas, API specs, and component structures. Focus on:

1. Getting Phase 1 (calendar) working end-to-end first
2. Testing availability consensus logic thoroughly
3. Then layering Phase 2 (betting + results) on top
4. Leaving Phase 3 architecture flexible for future props and features

**Next step:** Hand this off to the implementer for coding.
