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

  // Early rejections
  if (normalizedGuess.length === 0 || normalizedGuess.length < 3) {
    return { matched: false, canonical: null };
  }

  // 1. Exact match on canonical name
  if (normalizedGuess === normalizedCanonical) {
    return { matched: true, canonical: player.canonical };
  }

  // 2. Extract last name for multi-word names
  const canonicalParts = normalizedCanonical.split(' ');
  const lastName = canonicalParts.length > 1 ? canonicalParts[canonicalParts.length - 1] : normalizedCanonical;

  // Exact match on last name
  if (normalizedGuess === lastName) {
    return { matched: true, canonical: player.canonical };
  }

  // 3. Single Fuse.js pass on both canonical and last name
  const searchCorpus = canonicalParts.length > 1
    ? [player.canonical, lastName]
    : [player.canonical];

  const fuse = new Fuse(searchCorpus, {
    threshold: 0.30,
    includeScore: true,
  });

  const results = fuse.search(guess);

  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.30) {
    // Only match if lengths are similar (within 2 chars) to avoid "ronaldo" → "ronaldinho"
    const matchedName = normalize(results[0].item);
    const lengthDiff = Math.abs(normalizedGuess.length - matchedName.length);

    if (lengthDiff <= 2) {
      return { matched: true, canonical: player.canonical };
    }
  }

  // 4. Provide suggestion if close enough
  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.45) {
    return {
      matched: false,
      canonical: null,
      suggestion: `Did you mean "${player.canonical}"?`
    };
  }

  return { matched: false, canonical: null };
};
