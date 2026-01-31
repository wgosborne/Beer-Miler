# Phase 1c API Reference

## Authentication Required

All endpoints require valid NextAuth session. User must be logged in.

Admin-only endpoints require `session.user.role === "admin"`

## Bet Placement

### POST /api/bets

Place a new bet. Accepts three bet types with discriminated union.

**Request:**
```json
// Time Over/Under
{
  "betType": "time_over_under",
  "thresholdSeconds": 360,
  "direction": "over"  // or "under"
}

// Exact Time Guess
{
  "betType": "exact_time_guess",
  "guessedTimeSeconds": 345
}

// Vomit Prop
{
  "betType": "vomit_prop",
  "prediction": "yes"  // or "no"
}
```

**Validation:**
- `thresholdSeconds`: 0-1200
- `guessedTimeSeconds`: 0-1200
- `direction`: "over" | "under"
- `prediction`: "yes" | "no"

**Response (201):**
```json
{
  "id": "bet-123",
  "eventId": "event-1",
  "userId": "user-456",
  "betType": "time_over_under",
  "status": "pending",
  "pointsAwarded": 0,
  "betData": {
    "thresholdSeconds": 360,
    "direction": "over"
  },
  "createdAt": "2026-01-31T12:00:00Z",
  "updatedAt": "2026-01-31T12:00:00Z"
}
```

**Errors:**
- `401 AUTHENTICATION_REQUIRED` - User not logged in
- `400 VALIDATION_ERROR` - Invalid bet data (time out of range, etc.)
- `404 RESOURCE_NOT_FOUND` - Event not found
- `409 CONFLICT` - Event not locked, results finalized, or uniqueness violation

**Uniqueness Rules:**
- `exact_time_guess`: Max 1 per user per event. Placing another deletes previous.
- `vomit_prop`: Max 1 per user per event. Placing another deletes previous.
- `time_over_under`: Unlimited (different thresholds)

---

### GET /api/bets

Get all bets and bet distribution for current event.

**Query Parameters:**
- `eventId`: Optional. Defaults to EVENT_ID env var.

**Response (200):**
```json
{
  "eventId": "event-1",
  "resultsFinalized": false,
  "myBets": [
    {
      "id": "bet-123",
      "betType": "time_over_under",
      "status": "pending",
      "pointsAwarded": 0,
      "betData": {
        "thresholdSeconds": 360,
        "direction": "over"
      },
      "createdAt": "2026-01-31T12:00:00Z",
      "updatedAt": "2026-01-31T12:00:00Z"
    }
  ],
  "distribution": {
    "time_over_under": {
      "360_over": 5,
      "360_under": 7,
      "420_over": 3
    },
    "exact_time_guess": {
      "guesses": [
        { "time": 320, "user": "alice" },
        { "time": 345, "user": "bob" }
      ]
    },
    "vomit_prop": {
      "yes": 6,
      "no": 6
    }
  }
}
```

**Errors:**
- `401 AUTHENTICATION_REQUIRED` - User not logged in
- `404 RESOURCE_NOT_FOUND` - Event not found

---

### DELETE /api/bets/[id]

Delete a pending bet.

**URL Params:**
- `id`: Bet ID to delete

**Response (204):** No content

**Errors:**
- `401 AUTHENTICATION_REQUIRED` - User not logged in
- `403 AUTHORIZATION_ERROR` - User does not own this bet
- `404 RESOURCE_NOT_FOUND` - Bet not found
- `409 CONFLICT` - Results already finalized

---

## Admin Results

### POST /api/admin/results

Enter final time and vomit outcome. Generates preview of winners.

**Request:**
```json
{
  "finalTimeSeconds": 347,
  "vomitOutcome": true  // or false
}
```

**Validation:**
- `finalTimeSeconds`: 0-1200
- `vomitOutcome`: boolean

**Response (200):**
```json
{
  "eventId": "event-1",
  "finalTimeSeconds": 347,
  "vomitOutcome": true,
  "preview": {
    "winners": [
      {
        "betType": "exact_time_guess",
        "users": ["bob"],
        "points": 1,
        "details": "Closest guess: bob (2s off)"
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
        "details": "Annie vomited"
      }
    ],
    "finalLeaderboard": [
      { "rank": 1, "userId": "user-123", "username": "bob", "points": 3 },
      { "rank": 2, "userId": "user-124", "username": "alice", "points": 2 }
    ]
  },
  "message": "Preview ready. Review winners above. Call finalize endpoint to commit."
}
```

**Notes:**
- Admin must review preview before finalizing
- Results stored temporarily (not finalized yet)
- Call finalize endpoint to commit

**Errors:**
- `401 AUTHENTICATION_REQUIRED` - User not logged in
- `403 AUTHORIZATION_ERROR` - User is not admin
- `404 RESOURCE_NOT_FOUND` - Event not found
- `409 CONFLICT` - Event not locked, results already finalized

---

### POST /api/admin/finalize-results

Finalize results and lock leaderboard.

**Request:**
```json
{
  "confirm": true
}
```

**Response (200):**
```json
{
  "eventId": "event-1",
  "resultsFinalized": true,
  "finalizedAt": "2026-01-31T22:30:00Z",
  "message": "Results finalized. Leaderboard is now locked."
}
```

**Side Effects:**
- All bets updated with final status (won/lost)
- Leaderboard entries calculated with ranks
- Event.resultsFinalized = true
- Event.status = "completed"
- No more bets can be placed/deleted
- Admin can no longer reset results

**Errors:**
- `401 AUTHENTICATION_REQUIRED` - User not logged in
- `403 AUTHORIZATION_ERROR` - User is not admin
- `409 CONFLICT` - Results not entered yet, already finalized

---

### POST /api/admin/reset-results

Reset results if data entry error found.

**Request:**
```json
{
  "reason": "Entered wrong time; stopwatch showed 5:45 not 5:47"
}
```

**Validation:**
- `reason`: Required, at least 1 character

**Response (200):**
```json
{
  "eventId": "event-1",
  "message": "Results reset. All bets returned to pending status.",
  "allBetsReset": true
}
```

**Side Effects:**
- All bets reverted to pending status (pointsAwarded = 0)
- Leaderboard entries reset (pointsEarned = 0, rank = null)
- Event.finalTimeSeconds = null
- Event.vomitOutcome = null
- Admin can enter results again

**Notes:**
- Reason stored for audit trail
- Can only be done BEFORE finalization
- Cannot reset after finalization

**Errors:**
- `401 AUTHENTICATION_REQUIRED` - User not logged in
- `403 AUTHORIZATION_ERROR` - User is not admin
- `409 CONFLICT` - Results already finalized

---

## Leaderboard

### GET /api/leaderboard

Get ranked leaderboard with detailed bet breakdown per user.

**Query Parameters:**
- `eventId`: Optional. Defaults to EVENT_ID env var.

**Response (200):**
```json
{
  "eventId": "event-1",
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
          },
          {
            "bet": { "thresholdSeconds": 300, "direction": "under" },
            "result": "lost",
            "points": 0
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
        "exact_time_guess": null,
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
    }
  ]
}
```

**Errors:**
- `401 AUTHENTICATION_REQUIRED` - User not logged in
- `404 RESOURCE_NOT_FOUND` - Event not found

---

## Error Response Format

All errors follow this standard format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "thresholdSeconds": ["Time must be between 0 and 1200 seconds"]
    },
    "statusCode": 400
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_REQUIRED` - User not logged in
- `AUTHORIZATION_ERROR` - User lacks permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `CONFLICT` - Business logic violation
- `INTERNAL_SERVER_ERROR` - Unexpected error

---

## Scoring Rules

### Time Over/Under
- Bet wins if final time is on correct side of threshold
- Example: "under 360" wins if final time < 360 seconds
- Example: "over 360" wins if final time > 360 seconds

### Exact Time Guess
- Bet wins if it's the closest guess to final time
- Distance calculated as: |guessedTime - finalTime|
- **Tie-breaking:** If two users guess equally close, both get 1 point

### Vomit Prop
- "yes" prediction wins if vomitOutcome = true
- "no" prediction wins if vomitOutcome = false

**Points:**
- Each winning bet: 1 point
- Each losing bet: 0 points
