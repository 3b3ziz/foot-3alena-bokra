# Transfermarkt Player Scraper

Scrapes player career data from Transfermarkt and generates TypeScript player data for Career Ladder.

## Setup

```bash
# Install Python dependencies
pip install -r requirements.txt
```

## Usage

### Quick Start (10 players)
```bash
python transfermarkt_scraper.py
```

This will scrape the default 10 legendary players and output to `../src/data/players_scraped.ts`.

### Custom Player List
Edit `player_list.txt` with Transfermarkt URLs, then:
```bash
python scraper_batch.py player_list.txt
```

## What It Does

1. **Scrapes player pages** from Transfermarkt
2. **Extracts career data**:
   - Player name
   - Club history (chronological order)
   - Years at each club
3. **Auto-generates puzzle config**:
   - `initialClubs`: Smart selection (usually 2nd club + 2nd-to-last club)
   - `thirdClub`: Mid-career "iconic" club
   - `difficulty`: Based on number of clubs (more = harder)
4. **Outputs TypeScript file** ready to drop into `src/data/players.ts`

## Output Format

```typescript
{
  id: "davidbeckham",
  canonical: "David Beckham",
  clubs: ["Manchester United", "Real Madrid", "LA Galaxy", "Milan", "PSG"],
  years: ["1992-2003", "2003-2007", "2007-2012", "2009-2010", "2013-Present"],
  puzzleConfig: {
    initialClubs: ["Real Madrid", "Milan"],
    thirdClub: "LA Galaxy",
    difficulty: 5
  }
}
```

## Notes

- **Rate limiting**: Add delays between requests if scraping many players
- **Transfermarkt changes**: HTML structure may change, update selectors if needed
- **Player selection**: Mix of eras (90s, 2000s, 2010s, 2020s) for variety
- **Manual review**: Check output for accuracy before deploying

## Troubleshooting

**"Could not find player name"**: Transfermarkt HTML changed, update selectors
**"Not enough clubs"**: Player has < 3 clubs, skip or add manually
**Rate limited**: Add `time.sleep(2)` between requests
