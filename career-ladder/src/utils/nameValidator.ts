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

  // 0. Early rejections
  if (normalizedGuess.length === 0) {
    return { matched: false, canonical: null };
  }

  if (normalizedGuess.length < 3) {
    return { matched: false, canonical: null };
  }

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

  // 4. Fuzzy matching with Fuse.js on ALL valid names (canonical + aliases)
  // This handles typos like "bekham" → "beckham"
  const searchCorpus = [player.canonical, ...player.aliases];
  const fuse = new Fuse(searchCorpus, {
    threshold: 0.30, // Balanced: handles typos but prevents "ronaldo" → "ronaldinho"
    includeScore: true,
  });

  const fuseResults = fuse.search(guess);

  if (fuseResults.length > 0 && fuseResults[0].score !== undefined && fuseResults[0].score < 0.30) {
    const matchedName = normalize(fuseResults[0].item);
    const lengthRatio = normalizedGuess.length / matchedName.length;

    // Prevent substring false positives like "ronaldo" matching "ronaldo de assis moreira"
    // If the guess is much shorter AND is a substring, reject it
    if (lengthRatio < 0.7 && matchedName.includes(normalizedGuess)) {
      // This is likely a partial match (first name, substring), not a typo
      // Don't match it
    } else {
      return {
        matched: true,
        canonical: player.canonical,
        confidence: 1 - fuseResults[0].score
      };
    }
  }

  // 5. Provide suggestion if close enough (between 0.30 and 0.45)
  if (fuseResults.length > 0 && fuseResults[0].score !== undefined && fuseResults[0].score < 0.45) {
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
