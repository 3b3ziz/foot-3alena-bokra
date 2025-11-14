#!/usr/bin/env python3
"""
Transfermarkt Player Scraper
Extracts player career data and generates Career Ladder puzzle configs
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import sys
from typing import List, Dict, Optional

class TransfermarktScraper:
    BASE_URL = "https://www.transfermarkt.com"
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    def scrape_player(self, player_url: str) -> Optional[Dict]:
        """Scrape a single player's career data"""
        try:
            response = requests.get(player_url, headers=self.HEADERS)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract player name
            name_elem = soup.find('h1', class_='data-header__headline-wrapper')
            if not name_elem:
                print(f"❌ Could not find player name in {player_url}")
                return None

            canonical_name = name_elem.text.strip()

            # Extract career history
            clubs, years = self._extract_career_history(soup)

            if not clubs or len(clubs) < 3:
                print(f"❌ {canonical_name}: Not enough clubs ({len(clubs)})")
                return None

            # Generate puzzle config
            puzzle_config = self._generate_puzzle_config(clubs, years)

            # Generate player ID (lowercase, no spaces)
            player_id = re.sub(r'[^a-z0-9]', '', canonical_name.lower())

            player_data = {
                "id": player_id,
                "canonical": canonical_name,
                "clubs": clubs,
                "years": years,
                "puzzleConfig": puzzle_config
            }

            print(f"✅ {canonical_name}: {len(clubs)} clubs scraped")
            return player_data

        except Exception as e:
            print(f"❌ Error scraping {player_url}: {str(e)}")
            return None

    def _extract_career_history(self, soup) -> tuple:
        """Extract clubs and years from career history table"""
        clubs = []
        years = []

        # Find the transfer history table
        transfer_table = soup.find('div', class_='box transferhistorie')
        if not transfer_table:
            return [], []

        rows = transfer_table.find_all('div', class_='grid tm-player-transfer-history-grid')

        current_club = None
        current_start = None

        for row in rows:
            # Extract club name
            club_elem = row.find('img', class_='tiny_wappen')
            if club_elem and club_elem.get('alt'):
                club_name = club_elem['alt']

                # Extract season/year
                season_elem = row.find('div', class_='grid__cell grid__cell--center tm-player-transfer-history-grid__season')
                if season_elem:
                    season = season_elem.text.strip()

                    # Parse year from season (e.g., "Jul 1, 2004" -> "2004")
                    year_match = re.search(r'\d{4}', season)
                    if year_match:
                        year = year_match.group()

                        if current_club and current_club != club_name:
                            # New club, save previous
                            clubs.append(current_club)
                            years.append(f"{current_start}-{year}")
                            current_start = year
                            current_club = club_name
                        elif not current_club:
                            # First club
                            current_club = club_name
                            current_start = year

        # Add final club
        if current_club:
            clubs.append(current_club)
            years.append(f"{current_start}-Present")

        return clubs, years

    def _generate_puzzle_config(self, clubs: List[str], years: List[str]) -> Dict:
        """Generate puzzle config with smart club selection"""
        num_clubs = len(clubs)

        # Select initial clubs (first and last are too easy, pick mid-career)
        if num_clubs >= 5:
            initial_idx1 = 1  # Second club
            initial_idx2 = num_clubs - 2  # Second to last club
        else:
            initial_idx1 = 0
            initial_idx2 = num_clubs - 1

        # Third club (revealed after first wrong guess)
        # Pick the most "iconic" club (usually mid-career)
        third_idx = num_clubs // 2

        # Difficulty based on number of clubs and obscurity
        # More clubs = harder puzzle
        difficulty = min(10, max(1, num_clubs - 2))

        return {
            "initialClubs": [clubs[initial_idx1], clubs[initial_idx2]],
            "thirdClub": clubs[third_idx],
            "difficulty": difficulty
        }

    def scrape_players(self, player_urls: List[str]) -> List[Dict]:
        """Scrape multiple players"""
        players = []

        for i, url in enumerate(player_urls, 1):
            print(f"\n[{i}/{len(player_urls)}] Scraping {url}...")
            player = self.scrape_player(url)
            if player:
                players.append(player)

        return players

    def export_typescript(self, players: List[Dict], output_file: str):
        """Export players to TypeScript format"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("// Auto-generated player data from Transfermarkt\n\n")
            f.write("export interface PuzzleConfig {\n")
            f.write("  initialClubs: [string, string];\n")
            f.write("  thirdClub: string;\n")
            f.write("  difficulty: number;\n")
            f.write("}\n\n")
            f.write("export interface Player {\n")
            f.write("  id: string;\n")
            f.write("  canonical: string;\n")
            f.write("  clubs: string[];\n")
            f.write("  years: string[];\n")
            f.write("  puzzleConfig: PuzzleConfig;\n")
            f.write("}\n\n")
            f.write("export const players: Player[] = ")
            f.write(json.dumps(players, indent=2, ensure_ascii=False))
            f.write(";\n\n")
            f.write("// Get today's player (date-based rotation)\n")
            f.write("export const getTodaysPlayer = (): Player => {\n")
            f.write("  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));\n")
            f.write("  const index = daysSinceEpoch % players.length;\n")
            f.write("  return players[index];\n")
            f.write("};\n")

        print(f"\n✅ Exported {len(players)} players to {output_file}")


# Example player URLs (legendary footballers)
LEGENDARY_PLAYERS = [
    "https://www.transfermarkt.com/lionel-messi/profil/spieler/28003",
    "https://www.transfermarkt.com/cristiano-ronaldo/profil/spieler/8198",
    "https://www.transfermarkt.com/zinedine-zidane/profil/spieler/3111",
    "https://www.transfermarkt.com/ronaldinho/profil/spieler/3373",
    "https://www.transfermarkt.com/zlatan-ibrahimovic/profil/spieler/3455",
    "https://www.transfermarkt.com/andrea-pirlo/profil/spieler/5817",
    "https://www.transfermarkt.com/david-beckham/profil/spieler/3139",
    "https://www.transfermarkt.com/thierry-henry/profil/spieler/3207",
    "https://www.transfermarkt.com/luis-figo/profil/spieler/364",
    "https://www.transfermarkt.com/ronaldo/profil/spieler/3140",
]


if __name__ == "__main__":
    scraper = TransfermarktScraper()

    # Scrape players
    print("🔍 Starting Transfermarkt scraper...\n")
    players = scraper.scrape_players(LEGENDARY_PLAYERS)

    # Export to TypeScript
    output_file = "../src/data/players_scraped.ts"
    scraper.export_typescript(players, output_file)

    print(f"\n🎉 Done! Scraped {len(players)}/{len(LEGENDARY_PLAYERS)} players")
    print(f"📝 Output: {output_file}")
