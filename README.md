# ⚽ Career Ladder

A daily football puzzle game where players guess a footballer based on their club career progression.

## 🎮 Game Concept

Career Ladder reveals a player's club history in strategic phases, making it impossible to simply Google the answer while maintaining intrigue throughout the puzzle.

### How It Works

**Phase 1: Unordered Clubs** (2 guesses)
- Shows 2 clubs from the player's career (not in order)
- Players guess who played for both clubs

**Phase 2: Order Revealed** (1 guess)
- Reveals the clubs are in chronological order with mystery clubs between them
- Example: `Inter → ??? → Milan`

**Phase 3: Timer Challenge** (20 seconds, 1 guess)
- Starts a 20-second timer (prevents mid-game Googling!)
- Adds a 3rd club that appears somewhere in the career
- Example: `Inter → ??? → Milan + Barcelona`

**Phase 4: Full Timeline** (2 final guesses)
- Shows the complete career path
- Example: `Barcelona → Inter → Real Madrid → Milan`

## 🏗️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (mobile-first)
- **Deployment**: Cloudflare Pages
- **Future Backend**: Cloudflare Workers for daily puzzle API

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
career-ladder/
├── src/
│   ├── components/
│   │   ├── Game.jsx           # Main game component
│   │   └── Game.css           # Game styles
│   ├── data/
│   │   └── players.js         # Mock player data
│   ├── utils/
│   │   ├── nameValidator.js   # Fuzzy name matching
│   │   └── scoring.js         # Scoring & sharing logic
│   ├── App.jsx                # Root component
│   ├── App.css
│   └── main.jsx
├── public/
│   └── _redirects             # SPA routing for Cloudflare
├── DEPLOYMENT.md              # Cloudflare Pages deployment guide
└── package.json
```

## 🎯 Features

### Current (MVP)
- ✅ 4-phase progressive reveal system
- ✅ Timer-gated Phase 3 (anti-cheat)
- ✅ Fuzzy name matching (handles accents, aliases, last names)
- ✅ Score calculation based on speed & guesses
- ✅ Share results (emoji grid + stats)
- ✅ 10 real players with accurate career data
- ✅ Mobile-first responsive design
- ✅ Daily puzzle rotation

### Future Enhancements
- [ ] Cloudflare Workers API for daily puzzles
- [ ] Transfermarkt scraper for 100+ players
- [ ] LLM-optimized puzzle generation
- [ ] Streak tracking (localStorage)
- [ ] Difficulty curve (Mon: easy → Sun: expert)
- [ ] Statistics & analytics
- [ ] Social media integration
- [ ] Custom domain

## 🎲 Mock Data

Currently includes 10 legendary players:
- Ronaldinho
- Zlatan Ibrahimovic
- Andrea Pirlo
- Samuel Eto'o
- David Beckham
- Thierry Henry
- Clarence Seedorf
- Hernan Crespo
- Robinho
- Andriy Shevchenko

## 📊 Scoring System

```javascript
Phase 1: 100 points (base) - 20 per guess
Phase 2: 70 points (base) - 20 per guess
Phase 3: 50 points (base) - 2 per second
Phase 4: 30 points (base) - 1 per second
Minimum: 5 points
```

## 🎨 Design Philosophy

- **Mobile-first**: Optimized for phone gameplay
- **Minimal UI**: Clean, focused design
- **Fast loading**: < 100KB total bundle size
- **No dependencies**: Vanilla React, no heavy libraries
- **Progressive enhancement**: Works without JS (future)

## 🔐 Anti-Cheat Design

The timer in Phase 3 creates a 20-second window where searching becomes impractical:
1. Timer starts automatically when Phase 3 begins
2. No pause button
3. Even if someone Googles, they lose time-based points
4. Full timeline in Phase 4 makes searching pointless

## 🌍 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Cloudflare Pages deployment instructions.

Quick deploy:
```bash
npm run build
npx wrangler pages deploy dist --project-name=career-ladder
```

## 🎯 Future: Data Pipeline

1. **Scraper** (Python + Transfermarkt)
   - Scrape 100+ retired players
   - Verify data accuracy
   - Export to JSON

2. **LLM Optimizer** (OpenAI/Claude API)
   - Analyze each player's career
   - Pick optimal club pairs for maximum confusion
   - Determine reveal strategy

3. **Daily Selection**
   - Cloudflare Workers API
   - Difficulty curve by day of week
   - Rotate through player pool

## 📝 License

MIT - Feel free to fork and build your own!

## 🙏 Credits

Inspired by Wordle, Who Are Ya?, and other daily puzzle games.

---

**Play a new puzzle every day!** 🎯
