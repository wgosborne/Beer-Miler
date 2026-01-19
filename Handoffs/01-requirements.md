# Requirements: Annie's Beer Mile Betting App

## Project Overview

**Project Name:** Annie's Beer Mile Betting App

**Purpose:** A betting/wagering application for a close friend group (8-12 people) to place friendly wagers on Annie's beer mile performance (a humorous consequence from losing fantasy football). The app facilitates scheduling consensus for the event date and manages various types of fun bets with point-based scoring.

**Scope (MVP):** Two-phase implementation - Calendar scheduling first, then betting features. No monetary transactions; bragging rights and points only.

**Target Users:** 8-12 person friend group in a private context (no public/stranger access)

---

## Functional Requirements

### Phase 1: Calendar Scheduling Feature

#### Core Entity: Calendar & Availability

**Purpose:** Allow users to coordinate a consensus date for Annie's beer mile performance within a 3-month window.

**Data to Track:**
- Date (day-level granularity only, no time selection)
- User availability status for each date (available/unavailable)
- Dates when individual users are out of town
- Event lock date (once consensus is reached)

#### Operations

**1. Mark Availability (User Action)**
- Users view a 3-month calendar of future dates (rolling window from today)
- Users select weekends/dates when they are OUT OF TOWN (unavailable)
- System shows GREEN for dates where ALL users are available
- Users can update their availability multiple times before consensus is reached
- No restrictions on marking/unmarking availability until date is locked

**2. View Consensus Calendar (User Action)**
- Display calendar with color coding:
  - GREEN: All users available (consensus dates)
  - RED: At least one user unavailable
  - LOCKED: Consensus date has been selected (shows which date is locked)
- Show count of unavailable users per date (transparency)
- Show current consensus options at top of page

**3. Select/Lock Event Date (Admin Action)**
- Admin can select any GREEN date from the calendar as the final event date
- Once locked:
  - No more availability changes allowed
  - System locks this date as the official beer mile date
  - Cannot be changed unless admin explicitly resets
- Notification to all users when date is locked

**4. View Locked Date (All Users)**
- Once locked, all users see the official event date prominently displayed
- Locked status is clear (cannot be misunderstood as a suggestion)

#### Business Rules
- Consensus = ALL users available (no one out of town on that date)
- Admin can only lock a date where all users show availability
- Users must be authenticated to mark availability
- 3-month rolling window (cannot select dates more than 3 months in future)
- Day-level only; no time selection needed for Phase 1

#### Data Requirements
- User ID
- Calendar dates (3-month range)
- Availability status per user per date (boolean or enum: available/unavailable)
- Event locked date (nullable, null until locked)
- Timestamp of when date was locked
- Timestamp of last availability update per user

---

### Phase 2: Betting Features (Post-Date-Lock)

**Trigger:** Betting features only become available after admin locks an event date in Phase 1.

#### Core Entity 1: Bet Type - Time-Based Betting

**Description:** Over/Under bets on specific finish times (e.g., "Will Annie finish under 6 minutes?")

**Attributes:**
- Bet ID (unique identifier)
- Bet type: "time_over_under"
- Threshold time in seconds (e.g., 360 seconds = 6 minutes)
- Bet direction: "over" or "under"
- User ID (who placed the bet)
- Points awarded if won: 1 point
- Status: pending / won / lost (populated after admin enters final time)

**Operations:**

**Create Bet (User Action)**
- User selects a threshold time (system provides common suggestions: 5min, 6min, 7min, 8min, etc.)
- User selects "over" or "under"
- User confirms bet
- Bet is created in pending state
- User can place multiple over/under bets on different thresholds
- Bets cannot be modified once placed
- Bets cannot be placed after admin enters final time

**View Bets (User Action)**
- User sees their own bets in a list before results are finalized
- Shows threshold, direction, status (pending)
- All users can see aggregate bet distribution (e.g., "5 people picked under 6 min, 4 picked over")

**Admin Scores Over/Under Bets (Admin Action)**
- After obtaining final time from stopwatch, admin enters final time in seconds
- System automatically calculates which over/under bets won
- Winning bets marked as "won," losing bets marked as "lost"
- Users awarded 1 point per winning bet

---

#### Core Entity 2: Bet Type - Exact Time Guessing

**Description:** Users input their exact guess for Annie's finish time. Closest guess wins.

**Attributes:**
- Bet ID (unique identifier)
- Bet type: "exact_time_guess"
- Guessed time in seconds (user input)
- User ID (who placed the bet)
- Points awarded if won: 1 point (only closest guess wins)
- Status: pending / won / lost
- Distance from actual time (calculated, used for determining winner)

**Operations:**

**Create Exact Time Guess (User Action)**
- User enters their predicted finish time (e.g., "5:47" = 347 seconds)
- User can only have ONE exact time guess per event
- If user updates their guess, previous guess is replaced (last guess wins)
- Guess cannot be placed/modified after admin enters final time

**View Guess (User Action)**
- User sees their own exact time guess before results finalized
- All users can see the distribution of guesses (sorted, show all guesses)

**Admin Scores Exact Time (Admin Action)**
- After entering final time, system calculates distance from each user's guess to actual time
- User with smallest absolute difference (closest guess) wins 1 point
- Tie-breaking rule: If two users guess equally close, both get the point (or pick one—clarify with user)

---

#### Core Entity 3: Bet Type - Vomit Prop Bet

**Description:** Simple yes/no prop bet on whether Annie vomits during the beer mile.

**Attributes:**
- Bet ID (unique identifier)
- Bet type: "vomit_prop"
- Prediction: "yes" or "no"
- User ID (who placed the bet)
- Points awarded if won: 1 point
- Status: pending / won / lost

**Operations:**

**Create Vomit Bet (User Action)**
- User selects "Yes" or "No" to "Will Annie vomit?"
- User can only have ONE vomit prop bet per event
- Bet is confirmed and locked

**View Vomit Bet (User Action)**
- User sees their own vomit prediction before results
- All users can see aggregate bet distribution ("6 people said yes, 6 people said no")

**Admin Scores Vomit Prop (Admin Action)**
- After event concludes, admin indicates whether Annie vomited (yes/no)
- System marks all matching bets as "won," others as "lost"
- Winners awarded 1 point

---

#### Core Entity 4: Leaderboard & Results

**Description:** Tracks cumulative points and event results for all users.

**Attributes:**
- User ID
- Total points (sum across all bets)
- Event-specific points (points from this specific event)
- All-time points (across all future events)
- Rank (position on leaderboard)

**Operations:**

**View Event Results (All Users)**
- After admin marks all results as final:
  - Show final time (in MM:SS format)
  - Show vomit outcome (yes/no)
  - Show winning bets and which users won them
  - Show exact time guesses and which user was closest
  - Show points awarded per bet type

**View Leaderboard (All Users)**
- Display ranked list of all users by total points
- Show event-by-event breakdown
- Show all-time ranking
- Annie's position visible (she bets too)

**Admin View Results (Admin Only)**
- Form to enter final time (in MM:SS format)
- Form to indicate vomit outcome (yes/no)
- "Finalize Results" button that triggers scoring
- Preview of winners before finalizing
- Ability to reset/recalculate if data entry error

---

## Non-Functional Requirements

### Performance
- **Page Load Time:** <2 seconds for calendar and betting screens
- **Result Calculation:** <1 second to auto-calculate winners after admin enters final time
- **Concurrent Users:** Support 12 simultaneous users without degradation

### Scale
- **Data Volume:** Small (12 users × 365 potential dates × multiple events over time)
- **Storage:** No optimization needed; simple SQL database sufficient
- **Growth Assumption:** Friend group stays 8-12 people; not building for scale

### Security & Privacy
- **Authentication:** Email/username login required for all users
- **Authorization:**
  - Admin can: input final time, mark results, lock event date
  - Regular users can: place bets, mark availability, view leaderboard
  - Annie can: do everything a regular user can do (also bets on herself)
- **Data Privacy:** No sensitive personal data beyond username/email needed
- **No Monetization:** No payment processing, no financial transactions

### Reliability
- **Data Integrity:** Bets locked once placed (cannot be edited/deleted by user)
- **Admin Overrides:** Admin can reset results if data entry error detected
- **Consensus Lock:** Once event date locked, cannot be accidentally changed

### User Experience
- **Clarity:** Green/Red calendar should be instantly understandable
- **Mobile Friendly:** App should work on phones (people bet during/after event)
- **Accessibility:** Standard web accessibility (readable text, clickable buttons)

---

## Data Model Overview

### Core Entities

**Users**
- user_id (primary key)
- username (unique)
- email (unique)
- password_hash
- role (admin / regular_user / annie - or just track is_admin boolean)
- created_at
- updated_at

**Event** (one per beer mile)
- event_id (primary key)
- event_name (e.g., "Annie's Beer Mile")
- scheduled_date (day of event, locked by admin)
- final_time_seconds (admin input after event, null until entered)
- vomit_outcome (boolean: true/false, null until admin indicates)
- status (scheduled / in_progress / completed)
- created_at
- locked_at (timestamp when date was locked)

**Availability** (tracks user availability per date)
- availability_id (primary key)
- user_id (foreign key)
- event_id (foreign key)
- calendar_date (specific date user is marking)
- is_available (boolean)
- updated_at

**Bet** (polymorphic or separate tables per bet type)
- bet_id (primary key)
- event_id (foreign key)
- user_id (foreign key)
- bet_type (time_over_under / exact_time_guess / vomit_prop)
- bet_data (JSON or specific columns per type)
  - For time_over_under: threshold_seconds, direction (over/under)
  - For exact_time_guess: guessed_time_seconds
  - For vomit_prop: prediction (yes/no)
- status (pending / won / lost)
- points_awarded (0 or 1)
- created_at

**Leaderboard** (denormalized for fast queries, refreshed after results finalize)
- leaderboard_entry_id (primary key)
- user_id (foreign key)
- event_id (foreign key)
- points_earned (integer)
- rank (integer)
- updated_at

---

## Edge Cases & Risks

### Calendar Scheduling
1. **Timezone issues:** If friend group is distributed across timezones, clarify what "date" means. Assumption: Local timezone where event occurs.
2. **Availability updates after lock:** User marks unavailable after date is locked—handle gracefully (availability locked with date).
3. **All dates unavailable:** Edge case where no consensus date exists in 3-month window. Mitigation: Admin extends window or manually selects date.
4. **New user joins:** What if someone new wants to join after availability is tracked? Define: Require re-poll of all users.

### Betting System
1. **Exact time tie-breaking:** Two users guess equally close—clarify whether both get 1 point or only one. Assumption: Both get 1 point (fairness).
2. **Time format ambiguity:** User enters "5:47" but means seconds vs minutes. Mitigation: Strict input format (MM:SS), clear labeling.
3. **Admin error on final time:** Admin enters wrong time, results calculated incorrectly. Mitigation: Provide "reset results" functionality before finalizing.
4. **Bet after event starts:** User places bet after event is in progress. Mitigation: Lock all bets once admin marks event as "in progress" or enters final time.
5. **Annie's betting on herself:** No special rules; Annie bets like everyone else.
6. **Multiple events over time:** Leaderboard tracks cumulative points across events. Data model supports this.

### Admin Actions
1. **Admin leaves:** If admin is unavailable on event day, another user cannot assume role. Mitigation: Consider secondary admin or delegate final time entry.
2. **Accidental double-finalize:** Admin hits "finalize results" twice. Mitigation: Idempotent operation or "already finalized" warning.

---

## Constraints & Assumptions

### Technical Constraints
- **No real-time updates:** App doesn't need live lap tracking in MVP (deferred to Phase 3+)
- **No payment processing:** Simplifies backend (no Stripe, PayPal, etc.)
- **Small user base:** No need for horizontal scaling, CDN, or complex caching
- **Single event focus:** MVP is one beer mile event; future events handled as separate records

### Business Constraints
- **Friend group only:** No public signup, no stranger access, no community features in Phase 1/2
- **Bragging rights only:** No money involved; keeps things fun and legally simple
- **Manual result input:** Admin manually enters final time via UI (not automated video analysis)
- **Consensus required:** All users must be available on selected date (no majority rule)

### Assumptions
- Event date will be locked before Phase 2 (betting) is used
- Admin is trusted to accurately enter final time and vomit outcome
- Users have valid email addresses and can be reached for notifications
- No need for password reset/account recovery in MVP (can add later)
- All users participate in scheduling; no "inactive" users
- 3-month scheduling window is sufficient to find consensus

---

## Open Questions for Architect/Implementation Team

1. **Database Platform:** PostgreSQL, MongoDB, Firebase, or other? (affects schema design)
2. **Backend Framework:** Node.js/Express, Python/Django, Ruby/Rails, or other?
3. **Frontend Tech:** React, Vue, vanilla JS? Web-only or mobile app?
4. **Deployment:** Self-hosted, Heroku, AWS, Vercel, or other?
5. **Email Notifications:** Send notifications when date is locked? When results finalize? (low priority for MVP)
6. **Tie-breaking for Exact Time:** If two users guess equally close, both get 1 point or only one?
7. **Secondary Admin:** If primary admin unavailable on event day, can anyone else enter final time?
8. **Future Events:** Should app support multiple beer mile events over time, or just one?
9. **User Deletion:** How to handle if a user wants to leave the app mid-way?

---

## Success Criteria

### Phase 1 (Calendar)
- All 8-12 users can mark availability for dates in a 3-month window
- Calendar clearly shows which dates have full consensus (all green)
- Admin can lock a consensus date
- Locked date is immutable until explicitly reset by admin
- Availability cannot be changed after lock

### Phase 2 (Betting)
- Users can place time over/under bets with clear confirmation
- Users can input exact time guess with one guess per user
- Users can place vomit yes/no bet with one bet per user
- Admin can enter final time and vomit outcome
- System auto-calculates winners and awards points correctly
- Leaderboard displays ranked users by total points
- All users can see results and final leaderboard
- No bets can be placed or modified after results are finalized

### Overall MVP
- App is functional and stable for 8-12 concurrent users
- No data loss or corruption
- Admin controls fully working
- User experience is clear and intuitive
- Ready for feedback and iteration on Phase 3 features (props, badges, etc.)

---

## Future Phases (Out of Scope for MVP)

The following features were discussed but are deferred:

- **Lap-by-lap betting:** Detailed props on specific laps
- **Advanced props:** Blame attribution, complaint counts, excuses, "Big Back Energy," post-race attitude, recovery time
- **Joke props:** Muffin stacking
- **Live tracking:** Real-time lap time updates during event
- **Achievement badges:** "Muffin Man," "Big Back Energy," etc.
- **Hall of fame:** All-time across multiple events
- **Chat/trash talk:** Social messaging feature
- **Spectator bets:** Bets placed by non-core friend group
- **Seasonal events:** Multi-event tracking with seasonal leaderboards

---

## Notes for Architect

This requirements document is intentionally focused on the MVP (Phases 1-2). The betting system is designed to be extensible—the `bet_type` field in the Bet table makes it easy to add new prop bets (lap rankings, complaints, etc.) in Phase 3 without restructuring the core data model.

The calendar feature is self-contained in Phase 1 and should be fully deployed/stable before Phase 2 begins, as Phase 2 depends on an event date being locked.

Recommendations for architecture:
- Keep the bet system modular; each bet type should have clear scoring logic that can be tested independently
- Admin interface should have clear confirmations before finalizing results
- Leaderboard should be query-optimized or cached, though 12 users won't stress performance
- Consider whether to track bet history (deleted bets, updated guesses) for audit/debugging purposes
