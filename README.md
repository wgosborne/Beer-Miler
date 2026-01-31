# Annie's Beer Mile Betting App

A friend-group betting app to wager on Annie's beer mile. Place bets on finish time, exact time, and vomit outcome. No money—just points and bragging rights!

## How It Works

**Phase 1 (Calendar)**: Mark availability on a 3-month calendar. When everyone's available on the same date, admin locks it.

**Phase 2 (Betting)**: Once locked, place bets on:
- Time Over/Under (multiple allowed)
- Exact time guess (one per person)
- Vomit prop (one per person)

**Results**: Admin enters final time + vomit outcome. App auto-calculates winners and shows leaderboard.

## Quick Start

**Prerequisites**: Node.js 18+ and Git

```bash
# Install & setup
npm install
npx prisma migrate dev --name init
npx prisma db seed

# Create .env.local with:
# DATABASE_URL=your-neon-url
# NEXTAUTH_SECRET=$(openssl rand -base64 32)
# NEXTAUTH_URL=http://localhost:3000

# Start
npm run dev
```

Visit `http://localhost:3000` and login as `admin@beer-mile.test` / `admin123`

## Project Structure

```
src/
├── app/api/          # API endpoints (auth, bets, admin, etc)
├── app/auth/         # Login/signup pages
├── app/calendar/     # Phase 1: Calendar page
├── app/betting/      # Phase 2: Betting page
├── app/leaderboard/  # Leaderboard page
├── components/       # React components
└── lib/              # Auth, Prisma, validation, scoring
prisma/
├── schema.prisma     # Database schema
└── migrations/       # Database migrations
```

## Development

**Commands**:
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # Run linter
npm run db:studio       # Open Prisma GUI
```

**Troubleshooting**:
- `DATABASE_URL` error? Check `.env.local` and restart
- Tests failing? Run `npx prisma migrate dev` first
- Want clean slate? `npx prisma db push --force-reset` (dev only)

## Tech Stack

- **Frontend**: Next.js 14 + React
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Hosting**: Render.com (auto-deploy on git push)

## Phases

**Phase 1** (Complete): Calendar, availability consensus, admin lock-date
**Phase 2** (Coming): Betting, results, leaderboard, scoring

## Deployment

1. Create accounts at Neon (database), Render (hosting), GitHub (code)
2. Connect Render to GitHub repo
3. Set environment variables in Render dashboard:
   ```
   DATABASE_URL=<from-neon>
   NEXTAUTH_SECRET=<generate-with-openssl>
   NEXTAUTH_URL=<your-render-domain>
   NODE_ENV=production
   ```
4. Deploy migrations: `npx prisma migrate deploy && npx prisma db seed`
5. Push to main branch—Render auto-deploys!

## Features

**Calendar**: Mark availability, see consensus dates (green = all available), admin locks event date

**Betting** (Phase 2): Time over/under, exact time guess, vomit prop. Auto-scoring with point awards.

**Leaderboard**: Ranked by points, shows each user's win/loss record

## Testing

```bash
npm run test              # Run tests
npm run test:watch      # Watch mode
npm run lint             # Lint code
npx tsc --noEmit        # Type check
```

## Key Design Decisions

- All users must be available on same date (100% consensus)
- Bets are immutable once placed
- Tie-breaking awards both users 1 point
- Phase 2 locked until Phase 1 consensus reached
- Admin can reset results before finalization

See `/Handoffs/` docs for full technical details.

## Documentation

- **Full architecture**: See `Handoffs/02-architecture.md`
- **Requirements**: See `Handoffs/01-requirements.md`
- **Status & decisions**: See `CLAUDE.md`

## License

Friend group project. Use, modify, and enjoy!

---

**Last Updated**: 2026-01-31
**Current Phase**: Phase 1 Complete • Phase 2 Ready
