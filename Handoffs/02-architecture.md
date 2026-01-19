# Architecture: Annie's Beer Mile Betting App

## 1. Technology Stack Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Frontend | Next.js 14+ (React) | SSR/SSG for fast initial loads, built-in API routes eliminate need for separate backend, single deployment unit |
| Backend | Next.js API Routes | Colocates frontend and backend, reduces operational complexity, perfect for 8-12 user app |
| Database | Neon (PostgreSQL) | Managed PostgreSQL with auto-scaling, perfect relational schema fit, serverless billing aligns with Render |
| ORM | Prisma | Type-safe queries, automatic migrations, works perfectly with Neon, reduces boilerplate |
| Authentication | NextAuth.js | Built for Next.js, handles email/username auth out of the box, JWT tokens, session management |
| Hosting | Render | Native Next.js support, simple deployment, PostgreSQL addon available, auto-deploys on git push |
| Styling | Tailwind CSS | Rapid UI development, responsive design for mobile, minimal CSS to maintain |
| Testing | Jest + React Testing Library | Standard Next.js stack, good for unit and component tests |

### Why This Stack for This Project

**Next.js eliminates the operations burden.** With separate Node backend + React frontend, you'd need to manage two deployments, two processes, separate databases, CORS headers. Next.js handles all of this in one deployment. For a friend group project, this is a huge win.

**Neon + Render is the PostgreSQL-on-serverless story done right.** PostgreSQL's relational model is perfect for your schema. Neon is a managed service that scales to zero, so you pay pennies when nobody's using it. Render deploys Next.js automatically from git.

**Single deployment artifact.** Code pushes to GitHub, Render rebuilds and deploys everything (frontend + backend + migrations) in one go. No manual database steps or cross-service coordination.

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser/Mobile                          │
│                    (User's Web App)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Render.com (Hosting)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Next.js 14 Application                          │ │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐  │ │
│  │  │  React Components    │  │  API Routes             │  │ │
│  │  │  (Frontend)          │  │  (/api/*)               │  │ │
│  │  │                      │  │  ├─ /auth               │  │ │
│  │  │  ├─ Calendar         │  │  ├─ /availability       │  │ │
│  │  │  ├─ BettingForm      │  │  ├─ /bets              │  │ │
│  │  │  ├─ Leaderboard      │  │  ├─ /admin/results     │  │ │
│  │  │  ├─ ResultsDisplay   │  │  ├─ /leaderboard       │  │ │
│  │  │  └─ AdminPanel       │  │  └─ /event             │  │ │
│  │  └──────────────────────┘  └──────────────────────────┘  │ │
│  │            ▲                          │                    │ │
│  │            │                          ▼                    │ │
│  │            └──────────────────────────────────┐            │ │
│  │                                               │            │ │
│  │  ┌──────────────────────────────────────────┐│            │ │
│  │  │  Prisma ORM (Data Access Layer)          ││            │ │
│  │  │  - Query builders                        ││            │ │
│  │  │  - Type safety                           ││            │ │
│  │  │  - Automatic migrations                  ││            │ │
│  │  └──────────────────────────────────────────┘│            │ │
│  │                    │                          │            │ │
│  │                    ▼                          │            │ │
│  │  ┌──────────────────────────────────────────┐│            │ │
│  │  │  NextAuth.js Session Management          ││            │ │
│  │  │  - User sessions                         ││            │ │
│  │  │  - JWT tokens                            ││            │ │
│  │  │  - Role-based access (admin/user)        ││            │ │
│  │  └──────────────────────────────────────────┘│            │ │
│  │                    │                          │            │ │
│  │                    ▼                          │            │ │
│  └──────────────────────────────────────────────┴────────────┘ │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │ SQL Queries
                        ▼
        ┌────────────────────────────────┐
        │    Neon PostgreSQL Database    │
        │    (Managed, Serverless)       │
        │                                │
        │  ├─ users                      │
        │  ├─ event                      │
        │  ├─ availability               │
        │  ├─ bets                       │
        │  └─ leaderboard_entries        │
        │                                │
        └────────────────────────────────┘
```

### Data Flow Examples

**User Places Bet (Phase 2):**
```
User clicks "Bet" button
  ↓
React component sends POST /api/bets
  ↓
API route validates input (bet_type, threshold, user session)
  ↓
Prisma inserts into `bets` table with status: 'pending'
  ↓
Response returns created bet to frontend
  ↓
Component updates UI (shows bet in list)
```

**Admin Enters Final Time (Results):**
```
Admin fills form with MM:SS format
  ↓
React component sends POST /api/admin/results
  ↓
API route validates: only admin, event not already finalized
  ↓
Prisma updates event table: final_time_seconds, vomit_outcome
  ↓
API triggers scoring function:
  - Loop through all bets for this event
  - Calculate winners based on bet_type
  - Update bet.status and points_awarded
  - Refresh leaderboard_entries
  ↓
Response includes preview of all winners and points
  ↓
Frontend displays "Results Finalized" with leaderboard
```

---

## 3. Data Model

### Database Schema (Prisma Schema Format)

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

### Bet Data Shapes (TypeScript Interfaces)

Each bet's `betData` JSON field follows one of these shapes:

```typescript
// Time Over/Under Bet
type TimeOverUnderBet = {
  thresholdSeconds: number;  // e.g., 360 for 6 minutes
  direction: "over" | "under";
  // After results:
  won?: boolean;
};

// Exact Time Guess
type ExactTimeGuessBet = {
  guessedTimeSeconds: number;  // e.g., 347 for 5:47
  // After results:
  distanceFromActual?: number; // Calculated for ranking
  won?: boolean;
};

// Vomit Prop Bet
type VomitPropBet = {
  prediction: "yes" | "no";
  // After results:
  won?: boolean;
};

type BetData = TimeOverUnderBet | ExactTimeGuessBet | VomitPropBet;
```

### Key Design Notes

**JSON for bet_data:** Using PostgreSQL's JSONB type keeps the schema flexible without separate tables per bet type. It also makes adding new bet types in Phase 3 trivial.

**Unique constraints:**
- Users can only have ONE exact_time_guess per event
- Users can only have ONE vomit_prop per event
- Users can have MULTIPLE time_over_under bets (different thresholds)

**Indexes:** Placed on frequently queried columns (eventId, userId, betType) for fast lookups.

**Cascading deletes:** If a user is deleted, their data is cleaned up automatically (though unlikely in this friend-group context).

**Leaderboard denormalization:** The `leaderboard_entries` table is refreshed after results finalize. This means the leaderboard query is O(1) for each user instead of O(n) bets.

---

## 4. API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "username": "annie",
  "email": "annie@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- Username: 3-20 alphanumeric characters, unique
- Email: Valid email format, unique
- Password: Minimum 8 characters, at least one number and one special character

**Response (201):**
```json
{
  "id": "user-123",
  "username": "annie",
  "email": "annie@example.com",
  "role": "user"
}
```

**Error Responses:**
- 400: Invalid input (validation failure)
- 409: Username or email already exists

---

#### POST `/api/auth/login`
Authenticate user and create session.

**Request:**
```json
{
  "email": "annie@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "id": "user-123",
  "username": "annie",
  "email": "annie@example.com",
  "role": "user",
  "session": "eyJhbGciOiJIUzI1NiIs..."  // JWT token
}
```

**Error Responses:**
- 401: Invalid email or password
- 404: User not found

---

#### POST `/api/auth/logout`
Invalidate session.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Phase 1: Calendar & Availability Endpoints

#### GET `/api/event/current`
Get the current event details and lock status.

**Response (200):**
```json
{
  "id": "event-456",
  "name": "Annie's Beer Mile",
  "status": "scheduled",
  "scheduledDate": "2026-03-15",
  "lockedAt": null,  // null if not locked yet
  "finalTimeSeconds": null,
  "vomitOutcome": null,
  "resultsFinalized": false
}
```

---

#### GET `/api/availability?month=2026-03`
Get all availability data for a given month (3-month rolling window).

**Query Parameters:**
- `month`: ISO format "YYYY-MM" (optional, defaults to current month)

**Response (200):**
```json
{
  "eventId": "event-456",
  "eventLocked": false,
  "availabilities": [
    {
      "date": "2026-03-01",
      "allAvailable": true,
      "unavailableCount": 0,
      "unavailableUsers": []
    },
    {
      "date": "2026-03-02",
      "allAvailable": false,
      "unavailableCount": 2,
      "unavailableUsers": ["alice", "bob"]
    }
    // ... one entry per date in the month
  ],
  "userAvailability": {
    // Current user's availability for each date
    "2026-03-01": true,
    "2026-03-02": false,
    "2026-03-03": true
    // ... null for dates not marked yet
  },
  "consensusDates": ["2026-03-05", "2026-03-12", "2026-03-19"]
  // Dates where ALL users are available (green dates)
}
```

---

#### POST `/api/availability`
Mark user as available or unavailable for specific dates.

**Request:**
```json
{
  "updates": [
    {
      "date": "2026-03-15",
      "isAvailable": false  // false = out of town
    },
    {
      "date": "2026-03-16",
      "isAvailable": true
    }
  ]
}
```

**Validation Rules:**
- Can only update dates that are unlocked
- Cannot update dates in the past
- Cannot update dates more than 3 months in the future
- User must be authenticated

**Response (200):**
```json
{
  "updated": 2,
  "message": "Availability updated successfully"
}
```

**Error Responses:**
- 400: Invalid date or locked event
- 401: Not authenticated
- 409: Event is locked; cannot modify availability

---

#### POST `/api/admin/lock-date`
Admin locks a consensus date as the official event date.

**Request:**
```json
{
  "scheduledDate": "2026-03-15"
}
```

**Validation Rules:**
- User must be admin (role === "admin")
- Date must have all users available (GREEN consensus)
- Date cannot be in the past
- Event cannot already be locked

**Response (200):**
```json
{
  "eventId": "event-456",
  "scheduledDate": "2026-03-15",
  "lockedAt": "2026-02-01T14:30:00Z",
  "message": "Event date locked successfully. Users notified."
}
```

**Error Responses:**
- 401: Not authenticated
- 403: User is not admin
- 409: Event already locked OR date does not have full consensus

---

### Phase 2: Betting Endpoints

#### POST `/api/bets`
Place a bet. Request shape varies by bet type.

**Time Over/Under Bet Request:**
```json
{
  "betType": "time_over_under",
  "thresholdSeconds": 360,
  "direction": "over"
}
```

**Exact Time Guess Request:**
```json
{
  "betType": "exact_time_guess",
  "guessedTimeSeconds": 347
}
```

**Vomit Prop Request:**
```json
{
  "betType": "vomit_prop",
  "prediction": "yes"
}
```

**Validation Rules:**
- Event must be locked (scheduled date set)
- Results must NOT be finalized
- User must be authenticated
- For exact_time_guess: Only one per user per event (update replaces previous)
- For vomit_prop: Only one per user per event (update replaces previous)
- For time_over_under: Can place multiple (different thresholds)
- guessedTimeSeconds must be between 0 and 1200 (0-20 minutes)
- thresholdSeconds must be between 0 and 1200

**Response (201):**
```json
{
  "id": "bet-789",
  "betType": "time_over_under",
  "status": "pending",
  "betData": {
    "thresholdSeconds": 360,
    "direction": "over"
  },
  "pointsAwarded": 0,
  "createdAt": "2026-02-15T10:00:00Z"
}
```

**Error Responses:**
- 400: Invalid bet data
- 401: Not authenticated
- 409: Results already finalized OR bet type constraint violated (e.g., already has exact guess)
- 422: Event not locked yet

---

#### GET `/api/bets?eventId=event-456`
Get all bets for the current event (with distribution view).

**Query Parameters:**
- `eventId`: Event ID (optional, defaults to current event)

**Response (200):**
```json
{
  "eventId": "event-456",
  "resultsFinalized": false,
  "myBets": [
    {
      "id": "bet-123",
      "betType": "time_over_under",
      "status": "pending",
      "betData": {
        "thresholdSeconds": 360,
        "direction": "over"
      },
      "pointsAwarded": 0
    },
    {
      "id": "bet-124",
      "betType": "exact_time_guess",
      "status": "pending",
      "betData": {
        "guessedTimeSeconds": 347
      },
      "pointsAwarded": 0
    }
  ],
  "distribution": {
    "time_over_under": {
      "360_over": 5,  // 5 people bet over 6 min
      "360_under": 7  // 7 people bet under 6 min
    },
    "exact_time_guess": {
      "guesses": [
        { "time": 320, "user": "alice" },
        { "time": 347, "user": "bob" },
        { "time": 360, "user": "charlie" }
      ]
    },
    "vomit_prop": {
      "yes": 6,
      "no": 6
    }
  }
}
```

---

#### DELETE `/api/bets/:id`
Delete a pending bet (before results finalize).

**Validation Rules:**
- User must own the bet
- Results must NOT be finalized
- Event must be locked

**Response (204):** No content

**Error Responses:**
- 401: Not authenticated
- 403: User does not own this bet
- 409: Results already finalized

---

### Phase 2: Admin Results Endpoints

#### POST `/api/admin/results`
Admin enters final time and vomit outcome, triggers scoring.

**Request:**
```json
{
  "finalTimeSeconds": 347,  // From stopwatch, in seconds
  "vomitOutcome": true      // true = yes, false = no
}
```

**Validation Rules:**
- User must be admin
- Event must be locked
- Results must NOT already be finalized
- finalTimeSeconds must be between 0 and 1200
- vomitOutcome must be boolean

**Response (200):**
```json
{
  "eventId": "event-456",
  "finalTimeSeconds": 347,
  "vomitOutcome": true,
  "preview": {
    "winners": [
      {
        "betType": "exact_time_guess",
        "user": "bob",
        "points": 1,
        "details": "Guessed 347 (exact match)"
      },
      {
        "betType": "time_over_under",
        "users": ["alice", "charlie"],
        "points": 1,
        "details": "Under 360 seconds"
      },
      {
        "betType": "vomit_prop",
        "users": ["dave", "eve"],
        "points": 1,
        "details": "Predicted 'yes'"
      }
    ],
    "finalLeaderboard": [
      { "rank": 1, "user": "bob", "points": 3 },
      { "rank": 2, "user": "alice", "points": 2 },
      // ... all users with points
    ]
  },
  "message": "Preview ready. Review winners above. Call finalize endpoint to commit."
}
```

---

#### POST `/api/admin/finalize-results`
Confirm and lock results. After this, no bets can be changed.

**Request:**
```json
{
  "confirm": true
}
```

**Validation Rules:**
- User must be admin
- Admin must have called POST /api/admin/results first
- Results cannot already be finalized

**Response (200):**
```json
{
  "eventId": "event-456",
  "resultsFinalized": true,
  "finalizedAt": "2026-03-15T22:30:00Z",
  "message": "Results finalized. Leaderboard is now locked."
}
```

**Error Responses:**
- 401: Not authenticated
- 403: User is not admin
- 409: Results already finalized

---

#### POST `/api/admin/reset-results`
Admin resets results if data entry error detected. Can only be done before finalization.

**Request:**
```json
{
  "reason": "Entered wrong time; stopwatch showed 5:45 not 5:47"
}
```

**Validation Rules:**
- User must be admin
- Results must NOT already be finalized
- Reason must be provided (for audit trail)

**Response (200):**
```json
{
  "eventId": "event-456",
  "message": "Results reset. All bets returned to 'pending' status.",
  "allBetsReset": true
}
```

**Error Responses:**
- 401: Not authenticated
- 403: User is not admin
- 409: Results already finalized

---

### Leaderboard Endpoints

#### GET `/api/leaderboard?eventId=event-456`
Get current leaderboard for an event.

**Query Parameters:**
- `eventId`: Event ID (optional, defaults to current event)

**Response (200):**
```json
{
  "eventId": "event-456",
  "eventName": "Annie's Beer Mile",
  "resultsFinalized": true,
  "finalTimeSeconds": 347,
  "vomitOutcome": true,
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user-123",
      "username": "bob",
      "pointsEarned": 3,
      "bets": {
        "exact_time_guess": {
          "bet": { "guessedTimeSeconds": 347 },
          "result": "won",
          "points": 1
        },
        "time_over_under": [
          {
            "bet": { "thresholdSeconds": 360, "direction": "under" },
            "result": "won",
            "points": 1
          }
        ],
        "vomit_prop": {
          "bet": { "prediction": "yes" },
          "result": "won",
          "points": 1
        }
      }
    },
    {
      "rank": 2,
      "userId": "user-124",
      "username": "alice",
      "pointsEarned": 2,
      "bets": {
        "time_over_under": [
          {
            "bet": { "thresholdSeconds": 360, "direction": "under" },
            "result": "won",
            "points": 1
          },
          {
            "bet": { "thresholdSeconds": 300, "direction": "under" },
            "result": "lost",
            "points": 0
          }
        ],
        "vomit_prop": {
          "bet": { "prediction": "no" },
          "result": "lost",
          "points": 0
        }
      }
    }
    // ... all users
  ]
}
```

---

### Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "password": "Must be at least 8 characters"
    },
    "statusCode": 400
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: User not logged in
- `AUTHORIZATION_ERROR`: User lacks permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Business logic violation (e.g., event already locked)
- `INTERNAL_SERVER_ERROR`: Unexpected server error

---

## 5. Frontend Component Structure

### Component Hierarchy

```
App (layout, routing)
├── AuthLayout
│   ├── SignupPage
│   └── LoginPage
├── MainLayout (authenticated users)
│   ├── NavBar (user menu, logout)
│   └── PageContent
│       ├── DashboardPage
│       │   ├── EventStatus (locked date display)
│       │   └── QuickActions
│       ├── CalendarPage (Phase 1)
│       │   ├── CalendarGrid
│       │   │   ├── DateCell (color-coded)
│       │   │   └── ConsensusList
│       │   ├── MyAvailability (form)
│       │   └── AdminPanel (lock button, only for admin)
│       ├── BettingPage (Phase 2)
│       │   ├── BetForm
│       │   │   ├── TimeOverUnderForm
│       │   │   ├── ExactTimeGuessForm
│       │   │   └── VomitPropForm
│       │   ├── MyBetsList
│       │   └── BetDistribution
│       ├── ResultsPage (after finalization)
│       │   ├── FinalTime
│       │   ├── ResultsSummary (winners)
│       │   └── AdminResultsForm (admin only)
│       └── LeaderboardPage
│           ├── LeaderboardTable
│           └── BetBreakdown (per user details)
```

### Key Components (React)

#### Calendar Component
```typescript
// components/Calendar.tsx
interface CalendarProps {
  availabilities: AvailabilityData;
  userAvailability: Record<string, boolean>;
  onToggleDate: (date: string, isAvailable: boolean) => Promise<void>;
  eventLocked: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  availabilities,
  userAvailability,
  onToggleDate,
  eventLocked
}) => {
  // Render 3-month grid
  // Color cells: GREEN (all available), RED (someone unavailable), GRAY (locked)
  // Allow clicking to toggle availability (unless locked)
  // Show count of unavailable users per date
};
```

#### BetForm Component
```typescript
// components/BetForm.tsx
interface BetFormProps {
  betType: "time_over_under" | "exact_time_guess" | "vomit_prop";
  onSubmit: (betData: BetData) => Promise<void>;
  existingBet?: Bet;
  loading: boolean;
}

export const BetForm: React.FC<BetFormProps> = ({
  betType,
  onSubmit,
  existingBet,
  loading
}) => {
  // Render form based on betType
  // Time Over/Under: threshold dropdown + over/under toggle
  // Exact Time: MM:SS input
  // Vomit Prop: Yes/No buttons
  // Submit button
};
```

#### Leaderboard Component
```typescript
// components/Leaderboard.tsx
interface LeaderboardProps {
  entries: LeaderboardEntry[];
  expanded?: boolean; // Show per-user bet breakdown
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  expanded = false
}) => {
  // Render ranked table
  // Columns: Rank, User, Points
  // If expanded, show each user's bets and which won
  // Color code wins/losses
};
```

#### AdminResultsForm Component
```typescript
// components/AdminResultsForm.tsx
interface AdminResultsFormProps {
  onSubmit: (finalTime: number, vomitOutcome: boolean) => Promise<void>;
  preview?: AdminPreview;
  loading: boolean;
}

export const AdminResultsForm: React.FC<AdminResultsFormProps> = ({
  onSubmit,
  preview,
  loading
}) => {
  // MM:SS time input
  // Yes/No buttons for vomit outcome
  // Shows preview of winners
  // "Finalize Results" button (with confirmation modal)
};
```

### Routing (Next.js App Router)

```
app/
├── layout.tsx                 (root layout, auth check)
├── page.tsx                   (dashboard / home)
├── auth/
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── calendar/
│   └── page.tsx               (Phase 1)
├── betting/
│   └── page.tsx               (Phase 2)
├── results/
│   └── page.tsx               (Phase 2 after finalization)
├── leaderboard/
│   └── page.tsx
└── api/
    ├── auth/
    │   ├── signup/
    │   │   └── route.ts
    │   ├── login/
    │   │   └── route.ts
    │   └── logout/
    │       └── route.ts
    ├── availability/
    │   └── route.ts
    ├── event/
    │   └── current/
    │       └── route.ts
    ├── bets/
    │   └── route.ts
    ├── leaderboard/
    │   └── route.ts
    └── admin/
        ├── lock-date/
        │   └── route.ts
        ├── results/
        │   └── route.ts
        ├── finalize-results/
        │   └── route.ts
        └── reset-results/
            └── route.ts
```

### State Management Strategy

Use Next.js `useContext` + `useState` for simplicity (no Redux needed for this project):

```typescript
// lib/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  // ... auth methods
};

// lib/context/EventContext.tsx
interface EventContextType {
  event: Event | null;
  refreshEvent: () => Promise<void>;
}

export const EventContext = createContext<EventContextType | null>(null);
```

---

## 6. Authentication & Authorization

### Authentication Flow

```
User visits /
  ↓
Middleware checks for NextAuth.js session
  ├─ No session → Redirect to /auth/login
  └─ Session exists → Proceed to dashboard

User submits login form
  ↓
POST /api/auth/login with email + password
  ↓
Hash password, compare with stored hash
  ├─ Match → Create JWT token, set HTTP-only cookie, return user data
  └─ No match → 401 Unauthorized

NextAuth.js manages session for future requests
  ├─ Reads HTTP-only session cookie
  ├─ Validates token
  └─ Attaches user to request context
```

### NextAuth.js Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("No user found");
        }

        const passwordMatch = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const { handlers, auth } = NextAuth(authOptions);
```

### Authorization Middleware

```typescript
// middleware.ts
import { auth } from "@/lib/auth";

export const middleware = auth((req) => {
  // Check if route requires admin
  if (req.nextUrl.pathname.startsWith("/api/admin")) {
    if (req.auth?.user?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
  }

  // Protect betting routes (only available after event locked)
  if (req.nextUrl.pathname.includes("/betting")) {
    // Check if event is locked in database
    // If not, redirect to calendar
  }
});

export const config = {
  matcher: ["/api/:path*", "/calendar", "/betting", "/results"]
};
```

### Role-Based Access Control

| Endpoint | Admin Only | Authenticated | Public |
|----------|-----------|---------------|--------|
| POST /api/auth/signup | No | No | Yes |
| POST /api/auth/login | No | No | Yes |
| GET /api/availability | No | Yes | No |
| POST /api/availability | No | Yes | No |
| POST /api/admin/lock-date | Yes | Yes | No |
| POST /api/bets | No | Yes | No |
| GET /api/bets | No | Yes | No |
| POST /api/admin/results | Yes | Yes | No |
| POST /api/admin/finalize-results | Yes | Yes | No |
| GET /api/leaderboard | No | Yes | No |

---

## 7. Phase 1 vs Phase 2 Breakdown

### Phase 1: Calendar Scheduling (Standalone MVP)

**Deliverables:**
- User signup/login
- 3-month calendar with color-coded availability
- Mark dates as available/unavailable
- Admin lock consensus date
- Event locked notification

**Database:**
- Users table
- Event table (with scheduledDate, lockedAt)
- Availability table

**API Endpoints:**
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/event/current
- GET /api/availability
- POST /api/availability
- POST /api/admin/lock-date

**Frontend Pages:**
- /auth/login
- /auth/signup
- / (dashboard, shows event status)
- /calendar (main feature)

**Testing Focus:**
- Availability toggling logic
- Consensus calculation (all available)
- Lock prevents further changes
- 3-month window rolling logic

**Success Criteria:**
- 8-12 users can mark availability
- Calendar clearly shows GREEN (consensus) and RED (conflicts)
- Admin can lock date immutably
- Locked state persists

**Deployment:** Full Phase 1 MVP deployed to Render. Users can use calendar feature standalone.

---

### Phase 1 → Phase 2 Gate

**Before Phase 2 can be used:**
- Event must be locked (scheduledDate is not null)
- If trying to access /betting and event not locked, show message and redirect to /calendar

```typescript
// Middleware check
if (req.nextUrl.pathname.includes("/betting")) {
  const event = await prisma.event.findFirst({
    where: { id: process.env.EVENT_ID }
  });

  if (!event?.scheduledDate) {
    return NextResponse.redirect(
      new URL("/calendar?message=Lock%20date%20first", req.url)
    );
  }
}
```

---

### Phase 2: Betting Features (Builds on Phase 1)

**Deliverables:**
- Time over/under bets
- Exact time guess (one per user)
- Vomit prop bet (one per user)
- Bet distribution display (aggregate stats)
- Admin results form (final time + vomit outcome)
- Auto-calculated winners
- Leaderboard with rankings

**Database Changes:**
- Add Bet table
- Add LeaderboardEntry table
- Add finalTimeSeconds, vomitOutcome, resultsFinalized to Event

**API Endpoints (New):**
- POST /api/bets
- GET /api/bets
- DELETE /api/bets/:id
- POST /api/admin/results
- POST /api/admin/finalize-results
- POST /api/admin/reset-results
- GET /api/leaderboard

**Frontend Pages (New):**
- /betting (place bets, view distribution)
- /results (show final results and leaderboard, admin form)
- /leaderboard (main leaderboard page)

**Testing Focus:**
- Bet placement validation
- Scoring logic for each bet type
- Tie-breaking (both users get point)
- Leaderboard ranking
- Results finalization idempotency
- Reset results functionality

**Success Criteria:**
- Users can place bets in multiple formats
- System auto-calculates all winners correctly
- Leaderboard shows ranked results
- Results can be reset if admin makes mistake
- Once finalized, no changes allowed

**Deployment:** Phase 2 features merged after Phase 1 is stable. Rolling deployment to Render.

---

### Shared Infrastructure (Both Phases)

- Authentication system (both phases need it)
- User table and session management
- Event table (both phases)
- Database migrations
- Error handling & validation framework
- Component library (buttons, forms, tables, modals)

---

## 8. Deployment on Render

### Environment Variables (.env.local)

```bash
# Database
DATABASE_URL="postgresql://user:pass@neon-db.com/beer-mile?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-app.render.com"

# App Config
NEXT_PUBLIC_API_URL="https://your-app.render.com/api"
NODE_ENV="production"
```

### Render.com Configuration

**Web Service Setup:**

1. **Connect GitHub Repository**
   - Connect your beer-mile repo to Render

2. **Build & Start Commands**
   ```
   Build: npm run build
   Start: npm run start
   ```

3. **Environment Variables**
   - Add all variables from `.env.local` above in Render dashboard
   - Generate NEXTAUTH_SECRET: `openssl rand -base64 32`

4. **Database (PostgreSQL)**
   - Create Neon PostgreSQL database
   - Copy DATABASE_URL from Neon dashboard
   - Add to Render environment variables

**Auto-Deploy on Git Push:**
Render automatically rebuilds and deploys on every push to main branch.

### Database Setup (One-time)

```bash
# Install Prisma CLI
npm install -D prisma

# Generate Prisma client
npx prisma generate

# Run migrations on Neon database
npx prisma migrate deploy

# (Optional) Seed initial admin user
npx prisma db seed
```

### Prisma Seed Script (Optional)

```typescript
// prisma/seed.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

async function main() {
  // Create admin user for development/first run
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

  // Create initial event
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

---

## 9. Error Handling & Validation

### Input Validation Strategy

Use `zod` for schema validation:

```typescript
// lib/validation.ts
import { z } from "zod";

export const SignupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character")
});

export const BetSchema = z.discriminatedUnion("betType", [
  z.object({
    betType: z.literal("time_over_under"),
    thresholdSeconds: z.number().min(0).max(1200),
    direction: z.enum(["over", "under"])
  }),
  z.object({
    betType: z.literal("exact_time_guess"),
    guessedTimeSeconds: z.number().min(0).max(1200)
  }),
  z.object({
    betType: z.literal("vomit_prop"),
    prediction: z.enum(["yes", "no"])
  })
]);

export const AvailabilityUpdateSchema = z.object({
  updates: z.array(
    z.object({
      date: z.string().refine(
        (d) => !isNaN(Date.parse(d)),
        "Invalid date format"
      ),
      isAvailable: z.boolean()
    })
  )
});
```

### API Route Error Handling Pattern

```typescript
// app/api/bets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BetSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: {
            code: "AUTHENTICATION_REQUIRED",
            message: "User must be logged in to place bets"
          }
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate input
    const body = await req.json();
    const validatedData = BetSchema.parse(body);

    // 3. Check business logic
    const event = await prisma.event.findFirst({
      where: { id: process.env.EVENT_ID }
    });

    if (!event?.scheduledDate) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: "Event date must be locked before placing bets"
          }
        },
        { status: 409 }
      );
    }

    if (event.resultsFinalized) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: "Results already finalized; no more bets allowed"
          }
        },
        { status: 409 }
      );
    }

    // 4. Enforce uniqueness for single-bet-per-user types
    if (validatedData.betType === "exact_time_guess") {
      const existing = await prisma.bet.findFirst({
        where: {
          userId: session.user.id,
          eventId: event.id,
          betType: "exact_time_guess"
        }
      });

      if (existing) {
        // Replace existing bet
        await prisma.bet.delete({ where: { id: existing.id } });
      }
    }

    // 5. Create bet
    const bet = await prisma.bet.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        betType: validatedData.betType,
        betData: validatedData,
        status: "pending"
      }
    });

    // 6. Return success
    return NextResponse.json(bet, { status: 201 });

  } catch (error) {
    // 7. Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.flatten().fieldErrors
          }
        },
        { status: 400 }
      );
    }

    // 8. Log and return generic error
    console.error("[API Error]", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred"
        }
      },
      { status: 500 }
    );
  }
}
```

### Form Validation on Frontend

```typescript
// components/BetForm.tsx
import { useState } from "react";
import { BetSchema } from "@/lib/validation";
import { z } from "zod";

export const BetForm = ({ betType, onSubmit }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setErrors({});
    setLoading(true);

    try {
      const validated = BetSchema.parse(formData);
      await onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(
          Object.entries(fieldErrors).reduce(
            (acc, [key, messages]) => ({
              ...acc,
              [key]: messages?.[0] || "Invalid input"
            }),
            {}
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(Object.fromEntries(new FormData(e.currentTarget)));
    }}>
      {/* Form fields */}
      {errors.thresholdSeconds && (
        <p className="text-red-500 text-sm">{errors.thresholdSeconds}</p>
      )}
    </form>
  );
};
```

### Edge Cases & Error Scenarios

| Scenario | Handling |
|----------|----------|
| User submits bet after results finalize | 409 Conflict: "Results already finalized" |
| Admin tries to lock non-consensus date | 409 Conflict: "Date does not have full consensus" |
| User marks availability after event locked | 409 Conflict: "Event is locked" |
| User updates exact_time_guess | Delete old, create new (idempotent) |
| Admin calls finalize-results twice | 409 Conflict: "Results already finalized" |
| Database connection fails | 500 Internal Server Error + log to console |
| Timezone mismatch on calendar dates | Use ISO format (YYYY-MM-DD), interpret as local to event location |
| No consensus dates in 3-month window | Show warning, admin can manually extend or select any date (relaxed validation) |

---

## 10. Future Extensibility (Phase 3+)

### Adding New Bet Types

To add a new bet type (e.g., lap times, complaints, excuses), extend the system minimally:

**1. Add validation schema:**
```typescript
// lib/validation.ts
const LapTimeBetSchema = z.object({
  betType: z.literal("lap_time"),
  lapNumber: z.number().min(1).max(4),
  guessedTimeSeconds: z.number().min(0).max(300)
});

// Update discriminated union
export const BetSchema = z.discriminatedUnion("betType", [
  // ... existing types
  LapTimeBetSchema
]);
```

**2. Add scoring logic:**
```typescript
// lib/scoring.ts
export const scoreAllBets = async (event: Event) => {
  const bets = await prisma.bet.findMany({
    where: { eventId: event.id, status: "pending" }
  });

  for (const bet of bets) {
    let won = false;

    if (bet.betType === "lap_time") {
      // New scoring logic for lap times
      won = calculateLapTimeWinner(bet, event);
    } else {
      // Existing scoring logic
      won = scoreExistingBetType(bet, event);
    }

    await prisma.bet.update({
      where: { id: bet.id },
      data: {
        status: won ? "won" : "lost",
        pointsAwarded: won ? 1 : 0,
        betData: {
          ...bet.betData,
          won
        }
      }
    });
  }
};
```

**3. Add UI component:**
```typescript
// components/LapTimeForm.tsx
export const LapTimeForm = ({ onSubmit }) => {
  // Form for lap number selection + time guess
};
```

**4. Update bet display:**
```typescript
// components/BetList.tsx
const renderBetByType = (bet: Bet) => {
  switch (bet.betType) {
    case "lap_time":
      return <LapTimeBetDisplay bet={bet} />;
    // ... other cases
  }
};
```

### Adding Achievement Badges

Create a new `Achievement` table:

```prisma
model Achievement {
  id        String   @id @default(cuid())
  code      String   @unique  // "muffin_man", "big_back_energy"
  name      String
  icon      String   // URL or emoji
  rule      String   // Description of how to earn
  createdAt DateTime @default(now())
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  earnedAt      DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
}
```

### Adding Chat Feature

Create a separate `Message` table (Phase 4+):

```prisma
model Message {
  id        String   @id @default(cuid())
  userId    String
  eventId   String
  content   String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
}
```

Add WebSocket support if needed (e.g., using Socket.io or Pusher).

### Supporting Multiple Events

The schema already supports this. To track multiple events:

1. Remove hardcoded EVENT_ID from environment
2. Add event selection UI to dashboard
3. Create new event via admin panel
4. All tables already have eventId foreign keys

```typescript
// Future: app/events/[eventId]/betting/page.tsx
export default async function BettingPage({
  params
}: {
  params: { eventId: string };
}) {
  const event = await prisma.event.findUnique({
    where: { id: params.eventId }
  });
  // Render betting page for specific event
}
```

---

## 11. Development Setup

### Prerequisites

- Node.js 18+ (download from nodejs.org)
- Git
- PostgreSQL CLI (optional, for local testing)
- A code editor (VS Code recommended)

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

## 12. Security Considerations

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
