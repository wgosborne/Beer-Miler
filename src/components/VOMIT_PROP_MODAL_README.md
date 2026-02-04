# Vomit Prop Celebration Modal

## Overview
A celebratory modal component that displays when users place a vomit prop bet. The modal shows different content based on whether they bet "YES" (Annie will vomit) or "NO" (Annie won't vomit).

## Files
- **Component**: `src/components/VomitPropCelebration.tsx`
- **Integration**: `src/components/BetForm.tsx` (VomitPropForm component)

## Features

### Auto-Dismissal
- Automatically dismisses after 4 seconds
- Can be dismissed manually by:
  - Clicking the close (X) button in the top-right
  - Clicking the backdrop/overlay
  - Clicking the "Awesome!" button

### Styling
- **YES Bet** (She will vomit):
  - Pink neon border with glow effect
  - Red/pink gradient background for image placeholder
  - Angry emoji (😠) as placeholder
  - Pink-themed badge and text

- **NO Bet** (She won't vomit):
  - Green neon border with glow effect
  - Green/emerald gradient background for image placeholder
  - Happy emoji (😊) as placeholder
  - Green-themed badge and text

### Animations
- Smooth fade-in and zoom-in entrance (300ms)
- Fade-out on dismissal (300ms)
- Floating sparkle particles with staggered animation
- Pulsing glow effect behind image

## Image Placeholders

The modal currently displays gradient placeholders for images. To add actual Annie photos:

### Step 1: Prepare Images
1. Take/prepare two photos:
   - **annie-angry.jpg**: Annie looking angry/determined (for YES bets)
   - **annie-happy.jpg**: Annie looking happy/confident (for NO bets)
2. Recommended dimensions: 400x300px or larger
3. Supports formats: .jpg, .png, .webp

### Step 2: Add Images to Project
1. Create directory if it doesn't exist:
   ```bash
   mkdir -p public/images/annie
   ```

2. Place your images:
   - `public/images/annie/annie-angry.jpg`
   - `public/images/annie/annie-happy.jpg`

### Step 3: Update Component (Optional - for Next.js Image optimization)
Currently uses placeholder gradients. To use real images via Next.js Image:

```tsx
// In VomitPropCelebration.tsx, replace the placeholder section with:
import Image from 'next/image';

// In the image placeholder div:
<Image
  src={isYes ? '/images/annie/annie-angry.jpg' : '/images/annie/annie-happy.jpg'}
  alt={isYes ? 'Annie - determined' : 'Annie - happy'}
  fill
  className="object-cover"
/>
```

## Component Props

```tsx
interface VomitPropCelebrationProps {
  prediction: 'yes' | 'no';  // Bet prediction
  onDismiss: () => void;      // Callback when modal closes
}
```

## Usage

The component is integrated into BetForm automatically. When a user:
1. Selects YES or NO for vomit prop
2. Clicks "PLACE BET"
3. Bet is successfully placed (no errors)
4. Modal automatically displays
5. Modal auto-dismisses after 4 seconds (or user can dismiss manually)
6. Form resets for next bet

## Styling Reference

### Color Values
- **Pink** (YES bets): `rgb(236, 72, 153)` / `#EC4899`
- **Green** (NO bets): `rgb(34, 197, 94)` / `#22C55E`
- **Dark background**: `from-gray-900 to-black`

### CSS Classes
- **Modal Container**: `bg-gradient-to-b from-gray-900 to-black`, `border-2`, `rounded-2xl`, `shadow-2xl`
- **Image Section**: `h-64` with gradient background
- **Text Section**: `p-6 sm:p-8`, centered with `space-y-4`
- **Button**: Color-matched to prediction, `py-3`, `rounded-lg`, `font-bold`

### Animations
- Entrance: `zoom-in-95` with `fade-in` (300ms ease-out)
- Exit: Fade-out (300ms)
- Sparkles: `float-up` (2s-2.8s staggered)
- Glow: `animate-pulse` on background

## Accessibility
- Modal uses fixed positioning with proper z-indices
- Close button is clearly labeled and large enough to tap
- Backdrop is clickable to dismiss
- Text is readable with good contrast on dark background
- No essential content hidden behind animations

## Browser Support
- Modern browsers with CSS Grid/Flexbox support
- Smooth animations require CSS animation support
- Fallback: Modal still displays without animations in older browsers

## Future Enhancements
1. Add actual Annie photos when available
2. Add sound effects (optional celebration sound)
3. Add confetti animation library for more visual flair
4. Customize messages based on user preferences
5. Add option to share bet on social media

## Testing
To test the modal manually:
1. Navigate to `/betting`
2. Select "Vomit Prop" bet type
3. Choose YES or NO
4. Click "PLACE BET"
5. Modal should display with matching colors and animations
6. Auto-dismiss after 4 seconds (or click to dismiss sooner)

## Troubleshooting

### Modal not appearing
- Check browser console for errors
- Verify bet submission was successful (no error message)
- Check that form state is updating correctly

### Images not loading
- Verify file paths: `public/images/annie/annie-angry.jpg` and `public/images/annie/annie-happy.jpg`
- Check file permissions
- Clear Next.js cache: `rm -rf .next && npm run dev`

### Animations not smooth
- Check browser supports CSS animations
- Verify `globals.css` has animation definitions
- Check for CSS conflicts in dev tools

## Code Quality
- Written in TypeScript with proper interfaces
- Uses React hooks (useState, useEffect) for state management
- Proper cleanup with effect return function
- Semantic HTML with proper button/div elements
- Responsive design (mobile-first with sm: breakpoints)
- No external dependencies beyond React/Next.js

---

**Version**: 1.0 (2026-02-03)
**Status**: Production-ready with placeholder images
**Last Updated**: 2026-02-03
