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
  const normalizedCanonical = normalize(player.canonical);

  // 1. Exact match on canonical name
  if (normalizedGuess === normalizedCanonical) {
    return {
      matched: true,
      canonical: player.canonical,
      confidence: 1.0
    };
  }

  // 2. Exact match on aliases
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

  // 3. Last name only match
  const canonicalParts = normalizedCanonical.split(' ');
  if (canonicalParts.length > 1) {
    const lastName = canonicalParts[canonicalParts.length - 1];
    if (normalizedGuess === lastName) {
      return {
        matched: true,
        canonical: player.canonical,
        confidence: 0.9
      };
    }
  }

  // 4. Substring matching for short nicknames
  const lengthRatio = normalizedGuess.length / normalizedCanonical.length;

  // If guess is much shorter (like "ibra" vs "zlatan ibrahimovic")
  if (lengthRatio < 0.6 && normalizedGuess.length >= 3) {
    // Check if it's a substring of the canonical name
    if (normalizedCanonical.includes(normalizedGuess)) {
      return {
        matched: true,
        canonical: player.canonical,
        confidence: 0.8
      };
    }

    // Check if it's a substring of any alias
    for (const alias of player.aliases) {
      if (normalize(alias).includes(normalizedGuess)) {
        return {
          matched: true,
          canonical: player.canonical,
          confidence: 0.8
        };
      }
    }

    // Too short and not a substring - don't match
    return {
      matched: false,
      canonical: null
    };
  }

  // 5. Fuse.js fuzzy matching for similar-length strings (typos)
  const fuse = new Fuse([player.canonical], {
    threshold: 0.35, // More forgiving for typos
    includeScore: true,
  });

  const fuseResults = fuse.search(guess);

  if (fuseResults.length > 0 && fuseResults[0].score !== undefined && fuseResults[0].score < 0.35) {
    return {
      matched: true,
      canonical: player.canonical,
      confidence: 1 - fuseResults[0].score
    };
  }

  // 6. Provide suggestion if close enough
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
