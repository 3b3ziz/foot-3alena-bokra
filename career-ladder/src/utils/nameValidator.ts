/**
 * Fuzzy name matching utility using Fuse.js
 * Simplified: No aliases, just canonical name + fuzzy matching
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
 * @param {Player} player - Player object with canonical name
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

  // 2. Last name extraction
  const canonicalParts = normalizedCanonical.split(' ');
  const lastName = canonicalParts.length > 1 ? canonicalParts[canonicalParts.length - 1] : normalizedCanonical;

  // 2a. Exact match on last name
  if (normalizedGuess === lastName) {
    return {
      matched: true,
      canonical: player.canonical,
      confidence: 0.9
    };
  }

  // 2b. Fuzzy match on last name (for typos like "bekham")
  if (canonicalParts.length > 1) {
    const lastNameFuse = new Fuse([lastName], {
      threshold: 0.30,
      includeScore: true,
    });

    const lastNameResults = lastNameFuse.search(guess);

    if (lastNameResults.length > 0 && lastNameResults[0].score !== undefined && lastNameResults[0].score < 0.30) {
      const lengthDiff = Math.abs(normalizedGuess.length - lastName.length);

      // Only match if lengths are similar (within 2 chars)
      if (lengthDiff <= 2) {
        return {
          matched: true,
          canonical: player.canonical,
          confidence: 1 - lastNameResults[0].score
        };
      }
    }
  }

  // 3. Fuzzy matching on full canonical name (for single-name players or full name typos)
  const fuse = new Fuse([player.canonical], {
    threshold: 0.30,
    includeScore: true,
  });

  const fuseResults = fuse.search(guess);

  if (fuseResults.length > 0 && fuseResults[0].score !== undefined && fuseResults[0].score < 0.30) {
    const matchedName = normalize(fuseResults[0].item);
    const lengthDiff = Math.abs(normalizedGuess.length - matchedName.length);

    // Only match if lengths are similar (within 2 chars)
    if (lengthDiff <= 2) {
      return {
        matched: true,
        canonical: player.canonical,
        confidence: 1 - fuseResults[0].score
      };
    }
  }

  // 4. Provide suggestion if close enough
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
