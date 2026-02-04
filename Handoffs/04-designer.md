# Design: Annie's Beer Mile Betting App

**Status**: Phase 1 Complete - Dark theme with premium aesthetic
**Style**: Modern betting platform (FanDuel/DraftKings inspired), dark theme, dramatic imagery, neon accents
**Mobile-First**: Base design for iPhone (414px), scales to desktop via sm: breakpoints

## Design System

**Colors:**
- Dark: #000000 (bg), #111111-#1a1a1a (components), #2d2d2d (cards)
- Accents: Purple (#9333ea-#a855f7), Blue (#2563eb-#3b82f6), gradient buttons
- Text: White (#fff), Gray (#e5e7eb, #9ca3af), Disabled (#6b7280)
- Status: Green (#10b981 consensus), Red (#dc2626 errors), Yellow (#f59e0b warnings)

**Typography:**
- Headings: font-black (h1: text-3xl sm:text-4xl), bold (h2/h3/h4)
- Body: text-xs sm:text-sm (mobile-first scaling)
- Labels: UPPERCASE, font-semibold, tracking-wider (professional)

**Spacing:**
- Mobile-first (compact), sm: breakpoints for desktop
- Gaps: gap-1 sm:gap-2 or gap-2 sm:gap-4
- Padding: p-3 sm:p-4 or p-4 sm:p-6

**Responsive:**
- Mobile: < 640px (iPhone portrait, base design)
- sm: 640px+ (tablets, desktop)

## Pages Completed

| Page | Status | Key Features |
|------|--------|--------------|
| Home (/) | Complete | Dark gradient, gradient buttons, cards with hover glow |
| Login | Complete | Full-screen carousel, absolutely positioned form, neon subtitle glow |
| Signup | Complete | Same carousel as login, 4-field form, validation inline |
| Calendar | Complete | Dark cards, color-coded dates (green/blue/red/gray), admin lock panel |
| Betting | Complete | SVG track background, 3 bet type cards (neon badges), form + distribution |
| Results | Complete | Admin form with MM:SS time input, preview section, finalize button |
| Leaderboard | Complete | Ranked table, badge-based ranking (1st/2nd/3rd), expandable details |

## Key Design Decisions

1. **Dark Theme**: Premium feel, modern betting platform aesthetic, reduces eye strain for extended use
2. **No Emojis**: Clean text labels only, more professional/sophisticated (no casual vibe)
3. **Full-Screen Carousel**: Dramatic Annie imagery centerpiece on auth pages
4. **Mobile-First**: iPhone (414px) is primary device; scales elegantly to desktop
5. **Neon Accents**: Cyan glow on subtitle, neon badges on bet cards, premium aesthetic
6. **Glass Morphism**: `bg-white/5 backdrop-blur-sm` on cards for depth and premium feel
7. **Gradient Buttons**: Purple-to-blue CTA buttons for eye-catching, modern look
8. **UPPERCASE Labels**: Technical, professional tone consistent with betting platform

## Implementation Notes

**Auth Carousel:**
- Full-screen: h-screen w-screen relative overflow-hidden
- 3 rotating slides (fade transitions, 3s interval)
- Next.js Image with fill + object-cover
- Carousel continues rotating even when form is open
- Clickable indicators at bottom (z-30)

**Bet Type Cards:**
- Color-coded: Purple (over/under), Cyan (exact time), Pink (vomit prop)
- Inactive: `border-white/20 bg-white/5`
- Active: `border-COLOR-500 bg-COLOR-500/20 shadow-lg shadow-COLOR-500/20`
- Neon point badge in top-right (px-2.5 py-1, text-xs, font-bold)

**Calendar Colors:**
- Green: bg-green-600 shadow-green-600/50 (consensus - all available)
- Blue: bg-blue-600 shadow-blue-600/30 (you available)
- Red: bg-red-600 shadow-red-600/30 (you unavailable)
- Gray: bg-gray-700 (past/locked)

**Component Patterns:**
- Cards: `bg-gray-800 border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-lg`
- Buttons: `py-3 px-4 sm:px-6 font-bold rounded-lg transition-all`
- Inputs: `w-full px-4 py-3 bg-gray-900 border-gray-700 rounded-lg focus:border-purple-500`

## Images

**Carousel Background:**
- Location: `public/images/onload-bg.png` (fallback/placeholder)
- Ready for Annie photos in: `public/images/annie/annie-1.jpg`, `annie-2.jpg`, `annie-3.jpg`
- Next.js Image with responsive sizing (fill, object-cover)

**Vomit Prop Modal Placeholders:**
- YES: `public/images/annie/annie-angry.jpg` (determined expression)
- NO: `public/images/annie/annie-happy.jpg` (happy expression)
- Gradient placeholders ready for user images

## Tools

- **Tailwind CSS**: v3.4.19 (all dark theme utilities)
- **Next.js Image**: Built-in optimization for carousels
- **Custom CSS**: Minimal (neon-glow-text animation, responsive tweaks in globals.css)

## Next Steps

1. User adds real Annie photos to `public/images/annie/` directory
2. Carousel auto-loads and displays images with fade transitions
3. Design complete and production-ready

**Design Completed**: 2026-02-03
**Version**: 3.0 (Vomit Prop Celebration Modal)
**All Pages**: Complete and deployed
