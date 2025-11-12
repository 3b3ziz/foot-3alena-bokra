/**
 * Scoring system for Career Ladder
 * Simple guess-based scoring with timer penalties
 */

/**
 * Calculate score based on total guesses and timer usage
 * @param {number} totalGuesses - Total number of guesses made
 * @param {boolean} timerUsed - Whether the timer was activated
 * @returns {number} - Final score
 */
export const calculateScore = (
  totalGuesses: number,
  timerUsed: boolean
): number => {
  let score = 100;

  // Deduct points per guess
  score -= (totalGuesses * 10);

  // Timer penalty
  if (timerUsed) {
    score -= 20;
  }

  return Math.max(score, 5); // Minimum 5 points
};

/**
 * Generate shareable text for social media
 * @param {number} puzzleNumber - Daily puzzle number
 * @param {number} score - Final score
 * @param {number} totalGuesses - Total guesses made
 * @param {number} clubsRevealed - Number of clubs revealed during solve
 * @param {number} totalSeconds - Total time taken
 * @returns {string} - Shareable text
 */
export const generateShareText = (
  puzzleNumber: number,
  score: number,
  totalGuesses: number,
  clubsRevealed: number,
  totalSeconds: number
): string => {
  // Generate emoji based on performance
  const emoji = score >= 80 ? '🔥' : score >= 60 ? '⚡' : score >= 40 ? '✨' : '💪';

  return `CAREER LADDER #${puzzleNumber}
${emoji} ${score} pts | ${totalGuesses} ${totalGuesses === 1 ? 'guess' : 'guesses'} | ${clubsRevealed} clubs revealed | ${totalSeconds}s

Play at: career-ladder.pages.dev`;
};
