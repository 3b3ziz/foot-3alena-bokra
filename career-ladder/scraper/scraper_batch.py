#!/usr/bin/env python3
"""
Batch scraper - reads player URLs from file and scrapes all
"""

import sys
import time
from transfermarkt_scraper import TransfermarktScraper


def read_player_urls(filename: str) -> list:
    """Read player URLs from file (skip comments and empty lines)"""
    urls = []
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                urls.append(line)
    return urls


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scraper_batch.py player_list.txt")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "../src/data/players_scraped.ts"

    # Read player URLs
    print(f"📖 Reading player URLs from {input_file}...")
    player_urls = read_player_urls(input_file)
    print(f"Found {len(player_urls)} players to scrape\n")

    # Initialize scraper
    scraper = TransfermarktScraper()
    players = []

    # Scrape with rate limiting
    for i, url in enumerate(player_urls, 1):
        print(f"\n[{i}/{len(player_urls)}] Scraping {url}...")
        player = scraper.scrape_player(url)

        if player:
            players.append(player)

        # Rate limit: 2 second delay between requests
        if i < len(player_urls):
            time.sleep(2)

    # Export results
    print(f"\n{'='*60}")
    scraper.export_typescript(players, output_file)
    print(f"\n🎉 Successfully scraped {len(players)}/{len(player_urls)} players")

    if len(players) < len(player_urls):
        print(f"\n⚠️  Failed to scrape {len(player_urls) - len(players)} players")
        print("Check the error messages above")
