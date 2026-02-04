# Design: Annie's Beer Mile Betting App

## Overview
**Phase 2 Redesign**: Complete transformation to a dramatic, premium betting app aesthetic. Dark theme (black/charcoal) with purple/blue gradients, scrolling image carousel featuring Annie, and bottom-anchored auth forms. Mobile-first priority (iPhone-optimized). Removed all emojis for a professional, sophisticated look.

## Design System

### Library & Approach
- **Base**: Tailwind CSS
- **Approach**: Utility-first, dark theme optimized
- **Responsive**: Mobile-first design with sm: breakpoints for tablet/desktop
- **Visual Style**: Dramatic, premium, modern betting platform aesthetic

### Color Palette

**Dark Premium Theme (Dramatic & Sophisticated)**
```
Background:
  - Black: #000000 (primary bg, 95-100% opacity overlays)
  - Dark Gray: #111111, #1a1a1a (components)
  - Charcoal: #2d2d2d, #404040 (cards, subtle contrast)

Accent Gradients:
  - Purple: #9333ea → #a855f7 (primary CTA, highlights)
  - Blue: #2563eb → #3b82f6 (secondary accent, interactive)
  - Purple-Blue Gradient: from-purple-600 to-blue-600 (buttons)

Text:
  - White: #ffffff (primary text, high contrast)
  - Light Gray: #e5e7eb (secondary text)
  - Gray: #9ca3af (tertiary text, labels)
  - Muted Gray: #6b7280 (disabled, hints)

Alerts & Status:
  - Red: #dc2626, #ef4444 (errors, alerts - dark variants)
  - Green: #10b981, #16a34a (success, consensus)
  - Yellow: #f59e0b (warnings)
  - Gray: #4b5563 (neutral status)

Highlights:
  - Purple Glow: text-purple-400, hover:shadow-purple-500/50
  - Blue Glow: text-blue-400, hover:shadow-blue-500/50
```

### Typography
- **Font Stack**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.)
- **Heading Sizes**:
  - h1 (Page Title): text-3xl sm:text-4xl, font-black (900 weight)
  - h2 (Section): text-2xl sm:text-3xl, font-black
  - h3 (Subsection): text-lg sm:text-xl, font-bold
  - h4 (Card Title): text-base sm:text-lg, font-bold
- **Body**: text-xs sm:text-sm for mobile, text-sm sm:text-base for larger content
- **Labels**: text-xs font-semibold uppercase tracking-wider (technical, professional)
- **Line Height**: 1.25rem (sm), 1.5rem (base), 1.75rem (lg)
- **Weight Hierarchy**: black (900) for headlines, bold (700) for emphasis, semibold (600) for labels/buttons

### Spacing & Layout
- **Mobile First**: Base spacing assumes mobile (compact), with sm: breakpoints for desktop
- **Gaps**: gap-1 sm:gap-2 or gap-2 sm:gap-4 (tighter on mobile)
- **Padding**: p-3 sm:p-4 or p-4 sm:p-6 (consistent internal spacing)
- **Margins**: mb-4 sm:mb-6, mb-6 sm:mb-8 (larger vertical rhythm)

### Responsive Breakpoints
- **Mobile**: Default (< 640px) - iPhone portrait
- **sm (640px+)**: Tablets, landscape phones
- **md/lg/xl**: Desktop (not primary focus for this MVP)

## Pages & Components Modified

### Pages Reviewed

#### 1. **Home Dashboard** (`/`)
**Status**: Redesigned with dark theme
**Changes**:
- Dark background: gradient-to-b from-gray-900 to-black
- Removed all emojis (text numbers for steps, no beer/dice icons)
- Unauthenticated: Large dramatic headline "Betting Analytics", purple/blue gradient buttons
- Authenticated: "WELCOME BACK" label (uppercase, purple-400), username headline, admin badge, quick action cards
- Cards: Dark gray (bg-gray-800, border-gray-700), gradient borders on hover (purple glow, blue glow)
- Status section: Dark cards with UPPERCASE labels, professional uppercase labels for role
- Callout: "HOW IT WORKS" section with numbered steps (1, 2, 3, 4 in purple-400)
- No card icons - clean text labels only

#### 2. **Login Page** (`/auth/login`)
**Status**: Full-screen carousel with absolutely positioned content (v2.4 final refinement)
**Architecture**:
Main container: `h-screen w-screen relative overflow-hidden`
- Carousel fills 100% of viewport with Next.js Image (fill, object-cover)
- All content layers positioned absolutely on top
- No flex layout separating carousel from content - entire screen is carousel

**Carousel Layer**:
   - Full-screen background image (public/images/onload-bg.png)
   - 3 auto-rotating slides (fade transitions, duration-1000)
   - Gradient backgrounds (blue-600 to purple-900) placeholder for real Annie photos
   - Dark overlay: subtle (bg-black bg-opacity-30) keeps carousel visible
   - Carousel indicators: positioned absolutely at z-30, bottom-16 sm:bottom-20

**Button View** (when !showForm):
   - Content positioned: `absolute bottom-0 left-0 right-0 w-full flex flex-col items-center px-4 pb-6 sm:pb-8`
   - Title: "Beer Mile 2026" (text-sm sm:text-base, uppercase, tracking-widest, font-black, white, drop-shadow-lg)
   - Subtitle: "We know Annie eats muffins... but does she toss cookies?" (text-xs sm:text-sm, gray-200, italic, font-light, drop-shadow)
   - Two narrower, rounded buttons (w-1/3 width, centered):
     * "Sign In": Gradient purple-to-blue, py-2.5 sm:py-3, px-6, rounded-full, whitespace-nowrap, text-xs sm:text-sm
     * "Sign Up": Border-2 border-purple-400, text-purple-300, py-2.5 sm:py-3, px-6, rounded-full, text-xs sm:text-sm
     * Both: hover scale-105, shadow-lg on hover, font-semibold, transform duration-200
   - Button container: space-y-2, flex flex-col
   - Demo credentials: mt-3 sm:mt-4, text-xs, gray-300, drop-shadow, centered

**Form Modal View** (when showForm = true):
   - Content positioned: `absolute bottom-0 left-0 right-0 w-full flex justify-center pb-6 sm:pb-8 px-4`
   - Modal container: w-full max-w-sm max-h-96 overflow-y-auto
   - Dark container (bg-black bg-opacity-90, border-purple-500 border-opacity-40, rounded-lg, p-5 sm:p-6, backdrop-blur-sm, shadow-2xl)
   - Close button: × in top-right (text-xl, font-light, text-gray-400 hover:text-white, absolute top-3 right-3)
   - Form header: "Sign In" (text-lg sm:text-xl, font-black, white)
   - Form fields: Email, Password (compact: px-3 py-2, text-xs)
   - Input labels: UPPERCASE, tracking-wide, text-xs, font-semibold, gray-300
   - Submit button: py-2, text-xs sm:text-sm (compact)
   - Carousel fully visible in background around and behind modal
   - Carousel continues rotating while form is open (visible around edges)

#### 3. **Signup Page** (`/auth/signup`)
**Status**: Identical full-screen carousel with absolutely positioned content as login (v2.4 final)
**Architecture**:
- Same main container structure: `h-screen w-screen relative overflow-hidden`
- Full-screen carousel background filling entire viewport
- All content absolutely positioned on top

**Button View** (when !showForm):
   - Positioned: `absolute bottom-0 left-0 right-0 w-full flex flex-col items-center px-4 pb-6 sm:pb-8`
   - Same title, subtitle, demo credentials as login page
   - Two narrower, rounded buttons (w-1/3, centered):
     * "Sign In": Links to /auth/login, gradient purple-to-blue, rounded-full
     * "Sign Up": Shows signup modal (button), border-2 border-purple-400, rounded-full
   - Same button styling as login page

**Form Modal View** (when showForm = true):
   - Positioned: `absolute bottom-0 left-0 right-0 w-full flex justify-center pb-6 sm:pb-8 px-4`
   - Modal container: w-full max-w-sm max-h-96 overflow-y-auto
   - Dark container (bg-black bg-opacity-90, border-purple-500 border-opacity-40, rounded-lg, p-5 sm:p-6, backdrop-blur-sm, shadow-2xl)
   - Close button: × in top-right (text-xl, absolute top-3 right-3)
   - Form header: "Create Account" (text-lg sm:text-xl, font-black)
   - Form fields: Username, Email, Password, Confirm Password (all compact: px-3 py-2)
   - Compact input styling: text-xs, bg-gray-900, border-gray-700
   - Validation errors inline (text-xs, red-400)
   - Helper text: single line (mt-0.5, text-xs, gray-400)
   - Submit button: py-2, mt-4 (compact spacing)
   - Carousel fully visible in background and around modal

#### 4. **Calendar Page** (`/calendar`)
**Status**: COMPLETE - Dark theme with purple/blue accents (v2.4 update)
**Design Updates**:
- **Background**: Dark gradient (from-gray-900 to-black), matches home dashboard
- **Header**: "Mark Your Availability" (text-3xl sm:text-4xl, font-black, white)
- **Subtitle**: "Select dates you can attend Annie's beer mile" (text-sm sm:text-base, gray-300)
- **Loading State**: Minimal text "Loading..." (no emoji, just spinner animation)
- **Event Status Card**: bg-gray-800 bg-opacity-50, border-gray-700, backdrop-blur-sm
  * Status label: "Event Status:" (purple-400, font-semibold)
  * Locked date: green-400 text with date
  * Awaiting consensus: yellow-400 text
- **Calendar Container**: bg-gray-800 bg-opacity-50, border-gray-700, backdrop-blur-sm
  * Month header: white, centered, text-xl sm:text-2xl
  * Day names: text-purple-400, abbreviated on mobile
- **Date Cell Colors** (with shadow glow):
  * Consensus (all available): bg-green-600, shadow-lg shadow-green-600/50, hover:bg-green-700
  * You available: bg-blue-600, shadow-lg shadow-blue-600/30, hover:bg-blue-700
  * You unavailable: bg-red-600, shadow-lg shadow-red-600/30, hover:bg-red-700
  * Not marked: bg-gray-700, border-2 border-dashed border-gray-600, hover:bg-gray-600
  * Past dates: bg-gray-700, text-gray-400
  * Locked event: bg-gray-700, text-gray-500
- **Legend**: Dark text (gray-300) with color-coded squares
- **Consensus Info Box**: bg-green-900 bg-opacity-20, border-green-600/40, green-300 text
- **Event Locked Notice**: bg-purple-900 bg-opacity-20, border-purple-600/40, purple-300 text
- **Your Status Sidebar**:
  * Three stat cards: Available, Unavailable, Not marked
  * Each with colored borders (green/40, red/40, gray/40 opacity)
  * bg-gray-900/30, border-opacity-40 styling
- **Admin Controls Panel**:
  * Background: bg-purple-900 bg-opacity-20, border-purple-600/40
  * Title: "Admin Controls" (text-purple-300, font-bold)
  * No consensus message: yellow-900 bg-opacity-20 with yellow borders
  * Date selector: bg-gray-900 bg-opacity-50, border-purple-600/30, scrollable max-h-48
  * Labels: text-purple-300, font-semibold
  * Confirm button: Gradient from-purple-600 to-purple-700, shadow-lg, hover effects
  * Status: Confirmed (green), Awaiting (yellow), Errors (red) in dark theme colors
- **How It Works Panel**: bg-gray-800 bg-opacity-50, border-purple-500/30
  * Steps numbered and labeled in purple-400
  * Content text in gray-300
- **Navigation Buttons**: (Previous/Today/Next)
  * Gradient from-purple-600 to-blue-600
  * hover:from-purple-700 hover:to-blue-700
  * shadow-lg hover:shadow-xl
  * Full width on mobile, auto on desktop
  * py-2.5 sm:py-3 for touch-friendly height
- **Mobile Optimization**:
  * Full-width layout (grid-cols-1 lg:grid-cols-3)
  * Responsive padding (p-4 sm:p-6)
  * Touch-friendly buttons (min-h-10 sm:min-h-12)
  * Compact spacing on mobile

#### 5. **Spinner Component** (`src/components/Spinner.tsx`)
**Status**: NEW - Reusable loading spinner with dark theme styling (v2.6)
**Features**:
- **Props**:
  * `size`: 'sm' (32px), 'md' (48px), 'lg' (64px) - defaults to 'md'
  * `variant`: 'default' (purple/dark), 'light' (gray), 'bright' (blue) - defaults to 'default'
  * `fullScreen`: boolean - renders full-screen centered spinner with dark background
- **Styling**:
  * Border-based spinner with CSS animation (animate-spin)
  * Default: purple-600 border with purple-300 top (gradient effect)
  * Light: gray-700 border with gray-400 top
  * Bright: blue-600 border with blue-300 top
  * Responsive sizing using Tailwind w/h classes
- **Usage**:
  * `<Spinner />` - Small inline spinner
  * `<Spinner size="lg" variant="default" />` - Large purple spinner
  * `<Spinner fullScreen size="lg" variant="default" />` - Full-screen loading screen
- **Used on all pages**: Calendar, Results, Betting, Leaderboard, Home

#### 5a. **Calendar Component** (`src/components/Calendar.tsx`)
**Status**: COMPLETE - Dark theme with responsive date grid (v2.4 update)
**Key Updates**:
- Container: bg-gray-800 bg-opacity-50, border-gray-700, backdrop-blur-sm
- Month title: text-white, centered
- Day names: text-purple-400, responsive abbreviations
- Date cells:
  * Consensus: bg-green-600 with glow shadow-green-600/50
  * Your available: bg-blue-600 with glow shadow-blue-600/30
  * Your unavailable: bg-red-600 with glow shadow-red-600/30
  * Not marked: bg-gray-700, dashed border, gray-600
  * Past/Locked: bg-gray-700, text-gray-400/500
- Legend: Dark text on dark cards, compact grid layout
- Info boxes: Dark themed with colored borders (green/40, purple/40 opacity)
- Mobile: Touch-friendly min-h (10 sm:12), responsive text sizes
- Responsive: Handles empty cells, skips gaps, maintains 7-column grid

#### 5a. **AdminLockPanel Component** (`src/components/AdminLockPanel.tsx`)
**Status**: COMPLETE - Dark theme with purple/green accents (v2.4 update)
**Event Not Locked State**:
- Container: bg-purple-900 bg-opacity-20, border-purple-600/40, backdrop-blur-sm
- Title: "Admin Controls" (text-purple-300, font-bold)
- No consensus message: bg-yellow-900 bg-opacity-20, yellow-300 text
- Date selector label: text-purple-300, font-semibold
- Date list: bg-gray-900 bg-opacity-50, border-purple-600/30, scrollable (max-h-48)
  * Hover state: hover:bg-gray-800, smooth transition
  * Radio inputs: text-purple-500
  * Date text: text-purple-300
- Confirm button: Gradient from-purple-600 to-purple-700, shadow-lg hover:shadow-xl
- Status messages:
  * Error: bg-red-900 bg-opacity-30, border-red-600, text-red-300
  * Success: bg-green-900 bg-opacity-30, border-green-600, text-green-300
- Footer note: border-purple-600/30, text-purple-300

**Event Locked State**:
- Container: bg-green-900 bg-opacity-20, border-green-600/40
- Title: "Event Confirmed" (text-green-400)
- Status text: green-300
- Locked date: text-green-400, font-semibold
- Unlock button: bg-red-600 hover:bg-red-700, disabled:bg-red-800
- Warning text: text-red-400
- Status messages: Dark themed (red for errors, green for success)

#### 6. **Results Page** (`/results`)
**Status**: COMPLETE - Dark theme with admin controls and scoring display (v2.5 update)
**Design Features**:
- **Background**: Dark gradient (from-gray-900 to-black), matches calendar/home pages
- **Page Header**: "Results & Leaderboard" (text-3xl sm:text-4xl, font-black, white)
- **Subtitle**: "View scoring and final rankings" (text-sm sm:text-base, gray-300)
- **Loading State**: Minimal spinner with "Fetching results..." text (no emoji)
- **Error Messages**: bg-red-900 bg-opacity-30, border-red-600, text-red-200
- **Admin Form Section** (if not finalized):
  * Background: bg-purple-900 bg-opacity-20, border-purple-600/40
  * Title: "Admin Results Entry" (text-purple-300, font-bold)
  * Buttons: Gradient from-purple-600 to-blue-600, shadow-lg hover:shadow-xl
  * Input fields: bg-gray-900, border-gray-700, focus:border-purple-500, focus:ring-purple-500
  * Time input: Two number fields (MM and SS) with colon separator
  * Vomit outcome: Two toggle buttons (Yes/No) with conditional colors (red/green)
  * Action buttons: Gradient purple-to-blue (Enter/Preview) and gray (Cancel)
- **Finalized State Display**:
  * Two stat cards: Final Time and Vomit Outcome
  * bg-gray-800 bg-opacity-50, border-gray-700, text-white
  * Values in font-black, large text size
- **Preview Section** (when results are previewed):
  * Background: bg-blue-900 bg-opacity-20, border-blue-600/40
  * Title: "Results Preview" (text-blue-300)
  * Winners subsection:
    - List of bet winners with bet type, usernames, and points earned
    - Each winner card: bg-gray-800 bg-opacity-50, border-gray-700
    - Points in green-400, font-black
    - Bet details in gray-400
  * Final Leaderboard table:
    - Alternating row colors (striped)
    - Headers: text-gray-400, border-blue-600/40
    - Rank/User: text-gray-300
    - Points: text-green-400, font-black, bordered badge
  * Admin action buttons:
    - Finalize (green), Go Back (gray), Reset (red)
    - All gradient-based or solid with hover effects
    - Responsive: flex-col on mobile, flex-row on desktop
- **Leaderboard Container**: bg-gray-800 bg-opacity-50, border-gray-700, backdrop-blur-sm
  * Scrollable on mobile for wide tables
  * Mobile-optimized table with px-2 sm:px-4 padding
  * Touch-friendly row heights (py-2 sm:py-3)

#### 7. **Leaderboard Component** (`src/components/Leaderboard.tsx`)
**Status**: COMPLETE - Dark theme with badge-based ranking (v2.5 update)
**Design Features**:
- **Header**: Event name in text-xl sm:text-2xl, font-bold, white
- **Finalized Badge**: bg-green-600 bg-opacity-30, border-green-600/40, text-green-300
- **Table Styling**:
  * Header row: border-purple-600 border-opacity-40, text-purple-400 labels
  * Data rows: Alternating bg-gray-800 bg-opacity-20 with hover:bg-gray-800 hover:bg-opacity-40
  * Border-bottom: border-gray-700 border-opacity-30
- **Rank Badges** (replacing emoji medals):
  * 1st place: bg-yellow-600 bg-opacity-30, text-yellow-300, border-yellow-600/40
  * 2nd place: bg-gray-600 bg-opacity-30, text-gray-300, border-gray-600/40
  * 3rd place: bg-orange-600 bg-opacity-30, text-orange-300, border-orange-600/40
  * Other: bg-blue-600 bg-opacity-30, text-blue-300, border-blue-600/40
  * Badge text: "1st", "2nd", "3rd", or rank number (no emoji)
- **Points Display**:
  * bg-green-600 bg-opacity-30, text-green-300, border-green-600/40
  * Font-black for emphasis, rounded-full badge style
- **Detailed Breakdown** (when expanded after results finalize):
  * Each user's section: bg-gray-800 bg-opacity-20, border-l-4 border-purple-600/40
  * Rounded container with padding (p-3 sm:p-4)
  * User header: text-white, font-semibold
  * Bet details: text-gray-300, with purple-400 labels
  * Winning points: text-green-400, font-semibold
  * Responsive layout: space-y-1 sm:space-y-2 for spacing
- **Mobile Optimization**:
  * Table: text-xs sm:text-sm
  * Padding: px-2 sm:px-4, py-2 sm:py-3
  * Responsive text sizes throughout
  * Columns stack well on small screens

#### 7. **Betting Page** (`/betting`)
**Status**: COMPLETE - Dramatic dark theme redesign with outlined track background (v2.7 with neon badges)
**Architecture**:
- **Background**: Dark gradient (from-gray-1400 to-black) with floating SVG track outline
- **Track Outline**: Subtle animated SVG (opacity: 0.08, floating animation 6s ease-in-out) - represents running track/mile theme
- **Main Container**: `betting-page-background` with fixed background and relative z-10 content
- **Header**: "PLACE YOUR BETS" (text-6xl font-black text-white), dramatic subtitle in white/60
- **Point Values Section**: REMOVED (moved to neon badges on each card for cleaner layout)
- **Layout**: Grid with bet type selection (left) and bet form/info (right)

**Bet Type Selection (Left Column)**:
- 3 button cards (time_over_under, exact_time_guess, vomit_prop)
- Inactive: `border-white/20 bg-white/5 hover:border-COLOR-400/50 hover:bg-COLOR-500/10`
- Active: `border-COLOR-500 bg-COLOR-500/20 shadow-lg shadow-COLOR-500/20`
- Each has distinct color: purple (over/under), cyan (exact time), pink (vomit prop)
- Font-bold text with hover:text-COLOR-300 transition
- **Neon Point Badges** (NEW - v2.7):
  * Positioned in top-right of each card using flexbox (justify-between items-start)
  * Styled as rounded-full badges with neon glow effect
  * Time Over/Under: `1pt` badge (bg-purple-500/40, border-purple-400/60, text-purple-300, shadow-purple-500/50)
  * Exact Time Guess: `2pts` badge (bg-cyan-500/40, border-cyan-400/60, text-cyan-300, shadow-cyan-500/50)
  * Vomit Prop: `1pt` badge (bg-pink-500/40, border-pink-400/60, text-pink-300, shadow-pink-500/50)
  * Compact sizing: px-2.5 py-1, text-xs, font-bold, whitespace-nowrap
  * Shadow glow: shadow-lg shadow-COLOR-500/50 for neon effect

**Bet Form Container**:
- Dark glass effect: `bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm`
- Form inputs use: `bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-COLOR-500 text-white`
- Focus states match bet type colors

**Bet Form Styles**:
- **TimeOverUnderForm**: Purple theme
  - Label: `text-sm font-semibold text-white`
  - Select: `bg-white/10 border-white/20 rounded-lg text-white`
  - Buttons (OVER/UNDER): Bold text, selected = `bg-purple-600 text-white shadow-lg shadow-purple-500/30`
  - Submit: `bg-purple-600 hover:bg-purple-700 font-bold shadow-lg shadow-purple-500/30`

- **ExactTimeGuessForm**: Cyan theme
  - Time inputs: `w-20 px-3 py-3 bg-white/10 border-white/20 text-center font-bold text-lg`
  - Colon separator: `text-3xl font-bold text-white`
  - Submit: `bg-cyan-600 hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-500/30`

- **VomitPropForm**: Pink theme
  - YES/NO buttons: Bold text, selected = `bg-pink-600 text-white shadow-lg shadow-pink-500/30`
  - Submit: `bg-pink-600 hover:bg-pink-700 font-bold shadow-lg shadow-pink-500/30`

- **Common form elements**:
  - Error messages: `bg-red-500/20 border-red-500/30 text-red-300`
  - Cancel button: `bg-white/10 text-white/70 border-white/20 hover:bg-white/20`
  - All buttons: `rounded-lg font-bold text-sm transition-all duration-300`

**Status Messages**:
- Results finalized: `bg-emerald-950/40 border-emerald-500/50 text-emerald-300 backdrop-blur-sm rounded-xl`
- Errors: `bg-red-950/40 border-red-500/50 text-red-300`

**My Bets Section**:
- Title: "YOUR BETS" (text-3xl font-black)
- Bet cards: `bg-white/5 border-white/10 rounded-lg p-5 hover:bg-white/8 hover:border-white/20`
- Bet type label: Bold white uppercase (e.g., "TIME OVER/UNDER")
- Status badge: `px-3 py-1 rounded-full font-semibold border`
  - Pending: `bg-yellow-500/30 text-yellow-300 border-yellow-500/30`
  - Won: `bg-emerald-500/30 text-emerald-300 border-emerald-500/30`
  - Lost: `bg-red-500/30 text-red-300 border-red-500/30`
- Points display: `text-3xl font-black text-emerald-400` with label "POINTS"
- Delete button: `bg-red-600/20 text-red-300 border-red-600/30 hover:bg-red-600/40`

**Bet Distribution Section**:
- Title: "CROWD PREDICTIONS" (text-3xl font-black)
- 3 sections: Time Over/Under, Exact Time Guesses, Vomit Prop
- Section header: `font-black text-white uppercase tracking-wide`
- Distribution rows: `bg-white/5 rounded-lg border-white/5 hover:bg-white/10 transition-all`
- Count badges: Color-coded (purple for over/under, cyan for times, pink for vomit)
  - `bg-COLOR-600/30 border-COLOR-500/50 rounded-full px-4 py-1 font-bold text-COLOR-300`
- Mono font for time display: `font-mono font-bold text-cyan-300`

#### 7. **Results Panel** (admin)
**Status**: To be redesigned with dark theme
**Planned approach**:
- Dark form inputs (gray-900 background, purple focus)
- Clear action buttons with gradient styling
- Status displays in dark cards

## Key Design Decisions

### 17. Neon Point Value Badges on Bet Type Cards (v2.7)
**Why**: Instead of a separate "Point Values" section box, embed the points directly on each bet type card as compact neon badges. This:
- Reduces visual clutter by eliminating a dedicated information box
- Makes point values immediately visible with their corresponding bet type (users see "1pt" directly on the Time Over/Under card)
- Creates sleek, neon-themed design consistency (badges use the same color + glow pattern as the cards themselves)
- Maintains clean spacing with flexbox layout (text on left, badge on right) that adapts to mobile
- Enhances premium aesthetic with shadow-glow effects (shadow-COLOR-500/50) that feel modern and sophisticated

**Implementation**:
- Wraps card content in flex container with justify-between for left/right alignment
- Badge: rounded-full pill shape (px-2.5 py-1, text-xs, font-bold)
- Colors match their bet type: purple for 1pt, cyan for 2pts, pink for 1pt
- Shadow glow adds neon effect without overwhelming the design
- Compact sizing ensures badges don't clutter cards or break layout on mobile

### 11. Outlined Track Background on Betting Page
**Why**: Annie is running a beer mile. An SVG track outline (subtle, animated floating effect) reinforces the athletic/track theme. Low opacity (0.08) ensures it doesn't interfere with content readability. Techy, minimalist style matches design inspiration. Creates thematic cohesion without literal icons or emojis.

### 12. Color-Coded Bet Types
**Why**: Each bet type has a distinct color (purple for over/under, cyan for exact time, pink for vomit prop) to create visual hierarchy and make selections feel intuitive. Colors carry through to the form and action buttons for consistency and dramatic impact.

### 13. Glass Morphism on Betting Cards
**Why**: `bg-white/5 backdrop-blur-sm` creates depth and premium feel on dark backgrounds. Matches modern app design trends (Discord, Figma dark modes). Allows track background to show through subtly without overwhelming content.

### 14. Dramatic Typography (UPPERCASE Labels)
**Why**: Bet type labels use uppercase (TIME OVER/UNDER, EXACT TIME GUESS, VOMIT PROP) to create emphasis and professional tone. "YOUR BETS" and "CROWD PREDICTIONS" headings in black font with dramatic size creates visual hierarchy and drama.

### 15. No Emojis in Betting Details
**Why**: Previous format used emojis (🤢 for yes vomit, ✅ for no vomit). Dark, dramatic aesthetic demands clean text labels only. "She will vomit" / "She will not vomit" reads more sophisticated and aligns with premium betting platform aesthetic.

### 16. Spinner Component for Loading States
**Why**: Replaced all text-based loading messages ("Loading...", "Fetching results...", etc.) with a reusable, animated Spinner component. Text loading messages felt amateur and unprofessional; a spinning loader is modern, minimal, and visually consistent with dark premium aesthetic. Spinner component allows consistent styling across all pages with configurable size and color variants. Reduces code duplication and ensures uniform user experience.

**Implementation**:
- Created `src/components/Spinner.tsx` with three size variants (sm, md, lg) and three color variants (default/purple, light/gray, bright/blue)
- Replaced all page loading states: home page, calendar, results, betting, leaderboard
- Betting page keeps SVG track outline visible behind spinner for thematic consistency
- All other pages use `fullScreen` prop for centered full-screen loading (dark background gradient from gray-900 to black)
- CSS animation: `animate-spin` with border-based design (no emoji, no text)

### 1. Dark Premium Aesthetic
**Why**: Modern betting apps (FanDuel, DraftKings, crypto platforms) use dark themes for sophisticated, premium feel. Reduces eye strain during extended use. Matches design inspiration's dramatic style.

### 2. Dramatic Image Carousel on Auth Pages
**Why**: Creates strong visual hook with Annie photos as centerpiece. Builds personal connection to the app. Differentiates from generic auth pages. Carousel auto-rotates (3-second interval) to showcase multiple photos.

### 3. Bottom-Anchored Auth Form
**Why**: Mobile-first: keeps carousel/Annie visible while user fills form. Creates immersive experience where the action (signing in) is secondary to the visual story (Annie's performance). Form is compact and scrollable on small screens.

### 4. Gradient Buttons (Purple-to-Blue)
**Why**: Eye-catching, modern aesthetic. Purple conveys energy/excitement, blue adds stability. Gradient movement draws attention. Glow effects (shadow-purple-500/50) add premium feel.

### 5. Removed All Emojis
**Why**: Friend group wanted dramatic, professional betting app aesthetic - not casual/fun vibe. Emojis read as unprofessional in premium sports betting context. Text labels and numbering cleaner and more sophisticated.

### 6. Uppercase Labels with Tracking
**Why**: "WELCOME BACK", "EMAIL ADDRESS" (uppercase) + letter-spacing creates technical, premium aesthetic. Signals professionalism and precision in a betting platform.

### 7. Mobile-First Responsive Design
**Why**: Primary user device is iPhone. Every pixel matters on small screens. Dark theme helps maximize content visibility without overwhelming. Scales elegantly to desktop with sm: breakpoints.

### 8. Semi-Transparent Dark Overlays
**Why**: bg-black bg-opacity-95 keeps background visible (carousel on auth pages) while ensuring form readability. Creates visual depth and premium feel.

### 9. Minimal Animation (Carousel Only)
**Why**: Carousel provides visual interest without being distracting. Fade transitions (duration-500) feel smooth and premium. Auto-rotate keeps content fresh without user action.

### 10. Cards with Dark Borders, Hover Glow
**Why**: Dark theme needs subtle contrast. bg-gray-800 + border-gray-700 provides card definition. Hover glow (shadow-purple-500/50, shadow-blue-500/50) makes interactive elements feel responsive and modern.

## Tools & Libraries

### Installed
- **Tailwind CSS**: v3.4.19 - Utility-first CSS framework
- **Next.js**: v14.2.35 - React framework with SSR
- **NextAuth.js**: v4.24.13 - Authentication
- **TypeScript**: v5.9.3 - Type safety
- **Prisma**: v5.22.0 - Database ORM
- **Next.js Image**: Built-in Image optimization (for carousel background)

### Assets
- **Background Image**: `public/images/onload-bg.png` (OnloadPage.png from design inspiration)
  - Used as carousel background on `/auth/login` and `/auth/signup`
  - Supports responsive image loading via Next.js Image component
  - Placeholder for future Annie photos (currently shows gradient overlays in carousel)

### No Custom CSS Changes Needed Yet
- Dark theme fully achievable with Tailwind utilities
- `tailwind.config.ts` primary color scale still available for future non-dark pages
- Can extend with dark mode utilities later if needed

## Components Architecture

### Layout Hierarchy
```
RootLayout
  ├── Header (existing, to be restyled with dark theme)
  ├── Main Content
  │   ├── Page-specific layout (dark background)
  │   └── Responsive grids/stacks
```

### New Dark Theme Component Patterns
- **Cards**: bg-gray-800, rounded-lg, border border-gray-700, p-4 sm:p-6
  - Hover state: border-purple-500 or border-blue-500 (contextual)
  - Glow: hover:shadow-lg hover:shadow-purple-500/50 or hover:shadow-blue-500/50
- **Buttons**: py-3, px-4 sm:px-6, font-bold, rounded-lg, transition-all
  - Primary (CTA): bg-gradient-to-r from-purple-600 to-blue-600, hover:from-purple-700 hover:to-blue-700
  - Secondary: border-2 border-purple-500, text-purple-400, hover:bg-purple-900/20
  - Shadows: shadow-lg hover:shadow-xl (lifted feel)
- **Inputs**: w-full, px-4 py-3, bg-gray-900, border border-gray-700, rounded-lg
  - Focus: border-purple-500, ring-2 ring-purple-500 ring-opacity-50
  - Text: text-white, placeholder-gray-500
- **Mobile Spacing**: mb-4 sm:mb-6 (vertical), px-4 sm:px-6 (horizontal)
- **Responsive Text**: text-xs sm:text-sm (small), text-sm sm:text-base (body), text-3xl sm:text-4xl (headings)

## Implementation Notes: Modal Carousel Pattern

### State Management (Login/Signup)
```tsx
// Carousel state - auto-rotates independent of form state
const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

// Form visibility state - toggles between button view and form modal
const [showForm, setShowForm] = useState(false);

// Auto-rotate carousel every 3 seconds (runs even when form is open)
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentCarouselIndex((prev) => (prev + 1) % 3);
  }, 3000);
  return () => clearInterval(timer);
}, []);

// Close form handler - resets form state and visibility
const handleCloseForm = () => {
  setShowForm(false);
  setError('');
  setEmail('');
  setPassword('');
};
```

### Layout Architecture
```
Full-page container (h-screen w-screen relative overflow-hidden)
├── Background Image (Next.js Image with fill, object-cover)
├── Absolute carousel slides layer (inset-0)
│   └── 3 slides (fade transitions, duration-1000, absolute inset-0)
├── Dark overlay (absolute inset-0, bg-black bg-opacity-30)
├── Carousel indicators (absolute bottom-16 sm:bottom-20, z-30)
└── Content layer (absolute inset-0 z-40 flex flex-col)
    ├── Button View (!showForm)
    │   └── absolute bottom-0 left-0 right-0 w-full
    │       ├── Title ("Beer Mile 2026")
    │       ├── Subtitle (Annie joke)
    │       ├── Action buttons (centered, w-1/3)
    │       └── Demo credentials
    └── Form Modal (showForm)
        └── absolute bottom-0 left-0 right-0 w-full flex justify-center
            └── Modal container (max-w-sm, max-h-96, overflow-y-auto)
                ├── Close button (×, absolute top-3 right-3)
                ├── Form header
                ├── Form fields
                └── Submit button + links
```

### Carousel Implementation
```tsx
// Carousel fade transition (longer duration for dramatic effect)
className={`transition-opacity duration-1000 ${
  index === currentCarouselIndex ? 'opacity-100' : 'opacity-0'
}`}

// Indicator styling - active dot wider
className={`h-2.5 rounded-full transition-all ${
  index === currentCarouselIndex
    ? 'w-8 bg-white'
    : 'w-2.5 bg-white bg-opacity-40 hover:bg-opacity-70'
}`}

// Subtle dark overlay keeps carousel visible
<div className="absolute inset-0 bg-black bg-opacity-30" />
```

### Full-Screen Carousel Implementation
- **Container**: h-screen w-screen, relative overflow-hidden
- **Background**: Next.js Image with fill and object-cover (responsive sizing)
- **Slides**: 3 absolutely positioned divs with fade transitions (duration-1000)
- **Indicators**: Absolutely positioned at bottom, z-30, clickable to jump to slide
- **Content**: Absolutely positioned overlays (z-40) for title, buttons, forms
- **Carousel Rotation**: Auto-rotates every 3 seconds, continues even when form is open
- **Mobile-First**: All elements use responsive scaling (text-xs sm:text-sm, py-2.5 sm:py-3)

### Image Handling
- **Current Placeholders**: Gradient backgrounds (blue-600 to purple-900) with "Annie Photo X" text
- **Future Integration**: Replace gradient divs with Next.js Image components pointing to real Annie photos
- **Image Sources**: To be provided by user (3+ photos for carousel)
- **Image Path**: Store in `public/images/annie/` (e.g., annie-1.jpg, annie-2.jpg, annie-3.jpg)
- **Background Image**: public/images/onload-bg.png serves as base carousel background

### Placeholder Text Strategy
- Shows "Annie Photo 1", "Annie Photo 2", etc. with emoji camera (📸)
- Subtitle: "(Placeholder - add real photos)"
- Can be removed once real images are added
- Note: Emoji preserved in placeholder text for MVP - will be removed with real photos

## Phase 2: Extending Dark Theme

### Next Pages to Update
1. **Calendar Page** (`/calendar`) - Apply dark background, keep grid logic
2. **Betting Page** (`/betting`) - Dark cards for bet placement, gradient accents
3. **Results Page** (admin) - Dark form, purple/blue accents for actions
4. **Leaderboard** - Dark rows, ranking badges (green for leader, etc.)

### Color Application Guide
- **Active/Winning**: Green (#10b981)
- **Locked/Completed**: Purple (#a855f7) or blue (#3b82f6)
- **Errors/Alerts**: Red (#dc2626)
- **Pending**: Gray (#6b7280)
- **Hover Effects**: Shadow glow in contextual color (purple or blue)

### Design Tokens Ready for Phase 2
- Dark background (from-gray-900 to-black)
- Card system (bg-gray-800, border-gray-700)
- Gradient button system (purple-to-blue for CTA)
- Text color hierarchy (white > gray-300 > gray-400 > gray-500)
- Mobile-first responsive scales already in use
- Shadow/glow system for premium feel

## Testing & QA Checklist

### Mobile (iPhone Portrait)
- [ ] Carousel auto-rotates and is clickable
- [ ] Background image loads and displays correctly
- [ ] Auth form is visible and scrollable without covering carousel entirely
- [ ] All form inputs are touch-friendly (44px+ height)
- [ ] Purple-to-blue gradient buttons are visible and clickable
- [ ] Focus states clearly show on form inputs (purple ring)
- [ ] Error messages display in dark theme (red-400 or red-200 text)
- [ ] Labels uppercase and legible (gray-300 text)

### Dark Theme Contrast
- [ ] White text (headings) on dark background WCAG AA compliant
- [ ] Gray-300 text on dark background readable
- [ ] Buttons have sufficient contrast (white text on gradient)
- [ ] Focus rings visible on dark inputs (purple/blue outline)
- [ ] Error text stands out (red tones)

### Responsive (Tablet & Desktop)
- [ ] Layout adapts smoothly at sm: breakpoint (640px)
- [ ] Carousel maintains aspect ratio on larger screens
- [ ] Form section readable on desktop
- [ ] Text sizing scales appropriately (sm: prefixes working)

### Accessibility
- [ ] Form labels associated with inputs (htmlFor attribute)
- [ ] Focus rings visible (purple or blue outline)
- [ ] Alt text on background image
- [ ] Error messages linked to inputs and visible in aria-live region
- [ ] Carousel controls keyboard accessible (button elements, aria-labels)
- [ ] Color not sole indicator (text labels + color for status)

## File Changes Summary (Phase 2 & Betting Page Redesign)

### New Assets Created
1. `public/images/onload-bg.png` - Background image (OnloadPage.png from design inspiration)
   - Used as carousel backdrop on login/signup pages
   - Optimized via Next.js Image component

### Modified Files (Phase 2, 2.4 Full-Screen Carousel, & Betting Redesign)
1. `src/app/page.tsx` - Dark theme redesign
   - Removed emoji icons (calendar, betting, admin, status indicators)
   - Updated buttons to purple/blue gradients
   - Changed text colors (white, gray-300, purple-400 for labels)
   - Updated cards styling (bg-gray-800, border-gray-700, hover glow)

2. `src/app/auth/login/page.tsx` - Full-screen carousel with absolute positioning (v2.4 update)
   - Full-screen carousel: 3 auto-rotating slides, fade transitions (duration-1000), fills 100% viewport
   - Main container: h-screen w-screen relative overflow-hidden (NO flex layout)
   - **State management**: currentCarouselIndex (carousel), showForm (UI toggle)
   - **Background layer**: Next.js Image (fill, object-cover) + carousel slides (absolute inset-0)
   - **Content layer**: absolute inset-0 z-40 with bottom-positioned content
   - **Button view** (!showForm): Title, subtitle, buttons positioned absolutely at bottom
   - **Form modal** (showForm): Overlays carousel with dark container at bottom, max-h-96, scrollable
   - Buttons: "Sign In" (gradient), "Sign Up" (border style), hover scale-105, rounded-full
   - Form inputs: Dark gray (bg-gray-900), purple focus rings (border-purple-500)
   - Carousel continues rotating even when form is open
   - Close button (×) resets form state and clears inputs

3. `src/app/auth/signup/page.tsx` - Full-screen carousel with absolute positioning (v2.4 update)
   - Identical full-screen carousel architecture as login page
   - Main container: h-screen w-screen relative overflow-hidden
   - **State management**: Same currentCarouselIndex + showForm pattern
   - **Button view** (!showForm): Same title, subtitle, buttons at bottom, centered w-1/3
   - **Form modal** (showForm): Username, Email, Password, Confirm Password fields
   - Form scrollable: max-h-96 overflow-y-auto for all screens
   - Close button (×) resets form fields and visibility
   - Same dark input styling (bg-gray-900, border-gray-700), purple focus, gradient submit button
   - Carousel visible around modal, continues rotating

4. `src/app/calendar/page.tsx` - Dark theme redesign with purple/blue accents (v2.4 update)
   - Background: from-gray-900 to-black (matches home/auth pages)
   - Header: "Mark Your Availability" (text-3xl sm:text-4xl, font-black, white)
   - Loading state: No emoji, just spinner with "Loading..." text
   - Event status card: bg-gray-800 bg-opacity-50, border-gray-700, backdrop-blur-sm
   - Navigation buttons: Gradient purple-to-blue with shadow-lg hover:shadow-xl
   - Main layout: grid-cols-1 lg:grid-cols-3 for responsive design
   - Sidebar panels: bg-gray-800 bg-opacity-50, backdrop-blur-sm
   - Status cards: Three stat panels with colored borders (green/red/gray opacity-40)
   - Admin panel: bg-purple-900 bg-opacity-20, border-purple-600/40
   - How It Works: bg-gray-800 bg-opacity-50, border-purple-500/30
   - Mobile-first: Full width on mobile, responsive scaling with sm: breakpoints

5. `src/components/Calendar.tsx` - Dark theme with shadow glow effects (v2.4 update)
   - Container: bg-gray-800 bg-opacity-50, border-gray-700, backdrop-blur-sm
   - Date cells with colored shadows: green-600/50, blue-600/30, red-600/30
   - Day names: text-purple-400
   - Legend: Dark cards, gray-300 text
   - Info boxes: green-900/20 and purple-900/20 with colored borders
   - Mobile: min-h-10 sm:min-h-12 for touch-friendly cells
   - No emoji in legend, just color swatches and text labels

6. `src/components/AdminLockPanel.tsx` - Dark theme with purple/green accents (v2.4 update)
   - Unlocked state: bg-purple-900 bg-opacity-20, border-purple-600/40
   - Locked state: bg-green-900 bg-opacity-20, border-green-600/40
   - Date selector: bg-gray-900 bg-opacity-50, scrollable, max-h-48
   - Confirm button: Gradient purple-to-purple, shadow-lg
   - Status messages: Dark themed (green for success, red for errors)
   - Text labels: Conditional (purple when unlocked, green when locked)
   - No warning emoji, just text messages

7. `src/app/betting/page.tsx` - Complete dramatic redesign (NEW - v2.7 with neon badges)
   - Dark background: linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%)
   - Floating SVG track outline background (opacity: 0.08, animated)
   - Main header: "PLACE YOUR BETS" (text-6xl font-black text-white)
   - **Point Values section REMOVED** - moved to card-level neon badges (v2.7 update)
   - Responsive grid layout (col-span-1 lg:col-span-3)
   - Bet type buttons with color-coded selection (purple, cyan, pink)
   - **Neon point value badges** on each bet type card:
     * Time Over/Under: `1pt` (purple neon: bg-purple-500/40, border-purple-400/60, shadow-purple-500/50)
     * Exact Time Guess: `2pts` (cyan neon: bg-cyan-500/40, border-cyan-400/60, shadow-cyan-500/50)
     * Vomit Prop: `1pt` (pink neon: bg-pink-500/40, border-pink-400/60, shadow-pink-500/50)
     * Layout: flexbox with justify-between, badges positioned top-right (ml-2, px-2.5 py-1)
   - Status messages with backdrop-blur-sm glass effect
   - Sections: "YOUR BETS" and "CROWD PREDICTIONS" with dramatic headings
   - Integration with redesigned BetForm, MyBetsList, BetDistribution components

8. `src/components/BetForm.tsx` - Color-themed form components (REDESIGNED)
   - TimeOverUnderForm: Purple theme
     * Select inputs: bg-white/10, border-white/20, focus:ring-purple-500
     * Buttons: OVER/UNDER (bold, selected = purple-600, shadow-lg shadow-purple-500/30)
     * Submit: bg-purple-600 hover:bg-purple-700, font-bold, shadow-lg shadow-purple-500/30
   - ExactTimeGuessForm: Cyan theme
     * Input fields: w-20, text-center, font-bold, bg-white/10
     * Time display: font-mono, bold
     * Submit: bg-cyan-600 hover:bg-cyan-700, font-bold, shadow-lg shadow-cyan-500/30
   - VomitPropForm: Pink theme
     * YES/NO buttons: Bold, selected = pink-600, shadow-lg shadow-pink-500/30
     * Submit: bg-pink-600 hover:bg-pink-700, font-bold, shadow-lg shadow-pink-500/30
   - Common: Error messages (red-500/20), cancel buttons (white/10), rounded-lg all

9. `src/components/MyBetsList.tsx` - Dark theme redesign (UPDATED)
   - Bet cards: bg-white/5, border-white/10, rounded-lg p-5, hover:bg-white/8 hover:border-white/20
   - Bet type label: font-bold text-white uppercase (TIME OVER/UNDER, EXACT TIME GUESS, VOMIT PROP)
   - Status badges: Rounded-full with color-coded backgrounds and borders
     * Pending: bg-yellow-500/30, text-yellow-300, border-yellow-500/30
     * Won: bg-emerald-500/30, text-emerald-300, border-emerald-500/30
     * Lost: bg-red-500/30, text-red-300, border-red-500/30
   - Points display: text-3xl font-black text-emerald-400, label "POINTS" (uppercase)
   - Bet details formatted without emojis (no 🤢 or ✅)
   - Delete button: bg-red-600/20, text-red-300, border-red-600/30, hover:bg-red-600/40

10. `src/components/BetDistribution.tsx` - Dark theme redesign (UPDATED)
   - Section containers: bg-white/5, border-white/10, rounded-xl p-6, backdrop-blur-sm
   - Section headers: font-black text-white uppercase tracking-wide
   - Distribution rows: bg-white/5, rounded-lg, border-white/5, hover:bg-white/10 transition-all
   - Time Over/Under counts: bg-purple-600/30, border-purple-500/50, rounded-full
   - Exact time display: font-mono font-bold text-cyan-300
   - Vomit prop counts: bg-pink-600/30 (will vomit), bg-emerald-600/30 (won't vomit)
   - Total predictions: text-xs text-white/40, border-t border-white/10

## Next Steps & Implementation Guide

### Phase 4: Final Pages
1. **Any remaining pages** (if needed)
   - Apply same dark theme pattern
   - Use established color scheme and typography
   - Maintain mobile-first responsive design

### Image Integration
1. Replace placeholder gradients with real Annie photos:
   ```tsx
   <Image
     src="/images/annie/photo-1.jpg"
     alt="Annie - Beer Mile Performance"
     fill
     className="object-cover"
   />
   ```
2. Store images in `public/images/annie/`
3. Maintain carousel functionality (3-slide auto-rotate, clickable indicators)
4. Consider image optimization (next/image handles responsive sizing)

### Known Limitations & Trade-offs
1. **Placeholder Images in Carousel**: Currently shows gradient overlays with text. Replace with real photos when available.
2. **No Dark Mode Toggle**: Dark theme is default. Light theme support not planned for MVP.
3. **Limited Animation**: Only carousel fade transitions. Could add more micro-interactions in future.
4. **No Icon Library**: Text-based labels instead of SVG icons (simpler, matches dramatic aesthetic).

## Design System Handoff Notes

### For Future Designers/Developers
- **Dark Theme Colors**: Use dark gray (bg-gray-800, bg-gray-900), not white cards. Apply border-gray-700 consistently.
- **Button Styling**: All CTA buttons should use gradient (from-purple-600 to-blue-600) with shadow. Secondary buttons have border + text color.
- **Input Styling**: bg-gray-900, border-gray-700, focus border-purple-500 with ring. White text, gray-500 placeholder.
- **Spacing**: Mobile-first (p-3, gap-2) with sm: scaling (sm:p-6, sm:gap-4)
- **Typography**: Uppercase labels (text-xs font-semibold tracking-wider), bold headings (font-black), white text for readability
- **Responsive**: Always use `sm:` prefix for desktop; design for mobile (414px) as baseline
- **Images**: Next.js Image component for carousel and backgrounds; use fill + object-cover for responsive sizing

### Key Colors to Reference
```
Dark Backgrounds: #0f172a (gray-900), #1a202c (gray-900), black (#000000)
Cards: bg-gray-800 (#1f2937) with border-gray-700 (#374151)
Accent: Purple (#a855f7) and Blue (#3b82f6)
Text: White (#ffffff) for headings, gray-300 (#d1d5db) for body
Focus/Hover: border-purple-500 with ring-purple-500
```

### Files to Reference
- **Components**: `src/app/auth/login/page.tsx` (carousel implementation), `src/app/auth/signup/page.tsx` (same pattern)
- **Pages**: `src/app/page.tsx` (dark dashboard pattern), `src/app/auth/` (dark form pattern)
- **Assets**: `public/images/onload-bg.png` (carousel background)
- **Config**: `tailwind.config.ts` (primary colors still available if needed; dark theme uses default Tailwind colors)

---

**Design Completed**: 2026-02-03
**Version**: 2.7 (Betting Page Neon Badges)
**Focus**: Dark premium aesthetic, mobile-first, full-screen dramatic image carousel, no emojis
**Target Device**: iPhone portrait (414px base), scales to desktop via sm: breakpoints
**Visual Style**: Modern betting platform (FanDuel/DraftKings-inspired), sophisticated, professional
**Completed Phases**:
- Auth pages (login/signup): COMPLETE - Full-screen carousel with absolutely positioned content overlays (v2.4)
- Home dashboard: COMPLETE - Dark theme with gradient buttons (v2.4)
- Calendar page & components: COMPLETE - Dark theme with purple/blue accents, shadow glow effects (v2.5)
- Results page & Leaderboard: COMPLETE - Dark theme with admin controls and scoring display (v2.6)
- Betting page: COMPLETE - Removed point values box, added neon badges to bet cards (v2.7)
**All Design Work Complete** - Ready for testing and deployment
