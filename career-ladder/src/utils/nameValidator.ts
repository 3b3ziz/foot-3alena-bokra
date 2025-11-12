/**
 * Fuzzy name matching utility using Fuse.js
 * Handles accents, special characters, and common variations
 */

import Fuse from 'fuse.js';
import type { Player } from '@/data/players';

// Normalize a string for comparison
const normalize = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    // Remove accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove special characters except spaces
    .replace(/[^a-z0-9\s]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ');
};

export interface ValidationResult {
  matched: boolean;
  canonical: string | null;
  confidence?: number;
  suggestion?: string;
}

/**
 * Check if a guess matches the player using fuzzy matching
 * @param {string} guess - User's guess
 * @param {Player} player - Player object with canonical name and aliases
 * @returns {ValidationResult} - Validation result with match status and suggestions
 */
export const validateGuess = (guess: string, player: Player): ValidationResult => {
  const normalizedGuess = normalize(guess);

  // Exact match on canonical name
  const normalizedCanonical = normalize(player.canonical);
  if (normalizedGuess === normalizedCanonical) {
    return {
      matched: true,
      canonical: player.canonical,
      confidence: 1.0
    };
  }

  // Exact match on aliases
  for (const alias of player.aliases) {
    const normalizedAlias = normalize(alias);
    if (normalizedGuess === normalizedAlias) {
      return {
        matched: true,
        canonical: player.canonical,
        confidence: 1.0
      };
    }
  }

  // Partial match (last name only)
  const guessParts = normalizedGuess.split(' ');
  const canonicalParts = normalizedCanonical.split(' ');

  // If guess is a single word and matches last part of canonical name
  if (guessParts.length === 1 && canonicalParts.length > 1) {
    const lastName = canonicalParts[canonicalParts.length - 1];
    if (guessParts[0] === lastName) {
      return {
        matched: true,
        canonical: player.canonical,
        confidence: 0.8
      };
    }
  }

  // Use Fuse.js for fuzzy matching
  const searchSpace = [
    player.canonical,
    ...player.aliases
  ];

  const fuse = new Fuse(searchSpace, {
    threshold: 0.3, // Lower = more strict (0.0 = exact, 1.0 = anything matches)
    distance: 100,
    includeScore: true,
    keys: []
  });

  const fuseResults = fuse.search(guess);

  if (fuseResults.length > 0 && fuseResults[0].score !== undefined && fuseResults[0].score < 0.3) {
    // Good match found with Fuse.js
    return {
      matched: true,
      canonical: player.canonical,
      confidence: 1 - fuseResults[0].score
    };
  }

  // No match, but provide suggestion if close
  if (fuseResults.length > 0 && fuseResults[0].score !== undefined && fuseResults[0].score < 0.5) {
    return {
      matched: false,
      canonical: null,
      confidence: 1 - fuseResults[0].score,
      suggestion: `Did you mean "${player.canonical}"?`
    };
  }

  return {
    matched: false,
    canonical: null
  };
};
