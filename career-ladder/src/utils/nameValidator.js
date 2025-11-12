/**
 * Fuzzy name matching utility
 * Handles accents, special characters, and common variations
 */

// Normalize a string for comparison
const normalize = (str) => {
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

/**
 * Check if a guess matches the player
 * @param {string} guess - User's guess
 * @param {Object} player - Player object with canonical name and aliases
 * @returns {Object} - { matched: boolean, canonical: string }
 */
export const validateGuess = (guess, player) => {
  const normalizedGuess = normalize(guess);

  // Check canonical name
  const normalizedCanonical = normalize(player.canonical);
  if (normalizedGuess === normalizedCanonical) {
    return {
      matched: true,
      canonical: player.canonical
    };
  }

  // Check aliases
  for (const alias of player.aliases) {
    const normalizedAlias = normalize(alias);
    if (normalizedGuess === normalizedAlias) {
      return {
        matched: true,
        canonical: player.canonical
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
        canonical: player.canonical
      };
    }
  }

  return {
    matched: false,
    canonical: null
  };
};
