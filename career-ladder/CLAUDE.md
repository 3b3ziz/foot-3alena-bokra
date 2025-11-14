# Career Ladder - Daily Football Puzzle Game

## Project Overview
Daily puzzle game where players guess footballers based on progressive club reveals. Built with React + TypeScript + Vite, deployed on Cloudflare Pages.

## Current State: ✅ MVP Complete & Deployed

**Tech Stack:**
- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Fuse.js (fuzzy name matching)
- Vitest (testing)
- Cloudflare Pages (hosting)

**Build Stats:**
- Bundle: 122.35KB gzipped
- Tests: 23/23 passing
- Players: 10 legendary footballers

## What Works

✅ **Core Game Mechanics:**
- Progressive reveal system (2 clubs → timeline → reveal per wrong guess)
- Timer starts after 3 guesses (45s with idle detection)
- Auto-reveal answer when stuck
- Text selection lock during timer (anti-cheat)

✅ **Fuzzy Matching:**
- Handles typos: "bekham" → Beckham ✓
- Prevents false positives: "ronaldo" ✗ Ronaldinho ✓
- Matches full names and last names
- "Did you mean?" suggestions

✅ **Scoring & Sharing:**
- Simple scoring: 100pts - (guesses × 10) - timer penalty
- Wordle-style share (copy to clipboard)

✅ **Testing:**
- Comprehensive test suite for name matching
- All edge cases covered (ronaldo/ronaldinho, bekham typos, etc.)

## Known Limitations

- Only 10 players (rotates daily)
- No backend - all client-side
- No streak tracking
- No difficulty progression
- No player statistics

## Next Steps

### High Priority (MVP Validation)
1. **User Testing** - Share with friends, collect feedback
2. **Add More Players** - Scale from 10 to 50-100 players
   - Either manual entry or build Transfermarkt scraper
3. **Analytics** (Optional) - Track completion rates, avg guesses
   - Simple Plausible/GA if needed for validation

### Medium Priority (Polish)
4. **Visual Improvements**
   - Add club badges/logos
   - Better animations on reveal
   - Dark mode toggle
5. **UX Enhancements**
   - Hint system (show career years, nationality, etc.)
   - Difficulty levels
   - Tutorial/onboarding for first-time users

### Low Priority (Future Features)
6. **Backend API** - Move player selection to Cloudflare Workers
   - Enables daily puzzle sync across devices
   - Prevents cheating via client inspection
7. **Streak Tracking** - LocalStorage → Backend
8. **Leaderboards** - Weekly/monthly top scores
9. **Social Features** - Challenge friends, share results

## Technical Decisions Made

### Why No Aliases?
Initially had aliases ("ibra", "dinho", "becks") but removed them because:
- Caused false positives (e.g., "ronaldo" matched "ronaldo de assis moreira")
- Overengineered for MVP
- Users can type last names instead

### Fuzzy Matching Strategy
- Single Fuse.js instance searches both canonical name + last name
- Threshold: 0.30 (balances typo tolerance vs false positives)
- Length difference check (within 2 chars) prevents truncation matches
- Test-driven: 23 test cases covering all edge cases

### Share Functionality
Simplified to clipboard-only (like Wordle), removed navigator.share API to reduce complexity.

### Timer Design
- 45s countdown (resets on idle detection)
- Starts after 3 guesses (not immediately)
- Auto-reveals clubs when timer expires + user idle
- Text selection locked during timer to prevent searching

## Development Commands

```bash
npm run dev          # Start dev server
npm test             # Run test suite
npm run build        # Production build
npm run preview      # Preview production build
```

## Deployment

**Cloudflare Pages:**
- Auto-deploys from `claude/career-ladder-game-mvp-*` branch
- Build command: `npm run build`
- Output directory: `career-ladder/dist`
- Deploy command: `npx wrangler deploy`

## Project Structure

```
career-ladder/
├── src/
│   ├── components/
│   │   ├── Game.tsx          (584 lines - main game logic)
│   │   └── ui/               (shadcn components)
│   ├── utils/
│   │   ├── nameValidator.ts  (90 lines - fuzzy matching)
│   │   └── scoring.ts        (52 lines - scoring logic)
│   ├── data/
│   │   └── players.ts        (10 players with career data)
│   └── App.tsx
├── wrangler.toml             (Cloudflare config)
└── package.json
```

## Data Format

Each player has:
```typescript
{
  id: string;
  canonical: string;          // "David Beckham"
  clubs: string[];            // ["Man United", "Real Madrid", ...]
  years: string[];            // ["1992-2003", "2003-2007", ...]
  puzzleConfig: {
    initialClubs: [string, string];  // First 2 clubs shown
    thirdClub: string;               // Club revealed after 1st guess
    difficulty: number;              // 1-10 (unused for now)
  }
}
```

## Future Optimization Opportunities

**If scaling to 100+ players:**
1. Consider removing shadcn/ui (adds ~15KB) - plain Tailwind is faster
2. Extract timer logic to custom hook (`useGameTimer`)
3. Split Game.tsx into smaller components
4. Move player data to backend API
5. Add image optimization for club badges

**Performance is fine for MVP** - don't optimize prematurely.

## Questions for Next Session

- [ ] Did user testing reveal any UX issues?
- [ ] Should we add more players manually or build a scraper?
- [ ] Do we need backend API, or is client-side good enough?
- [ ] Any bugs reported from live deployment?

---

**Last Updated:** 2025-11-13
**Status:** 🟢 Deployed & Ready for Testing
**URL:** TBD (check Cloudflare Pages deployment)
