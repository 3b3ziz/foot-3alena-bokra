/**
 * Scoring system for Career Ladder
 */

export const PHASE_SCORING = {
  phase1: { base: 100, perGuess: -20 },
  phase2: { base: 70, perGuess: -20 },
  phase3: { base: 50, perSecond: -2 },
  phase4: { base: 30, perSecond: -1 }
} as const;

export const PHASE_NAMES = {
  1: 'Unordered Clubs',
  2: 'Order Revealed',
  3: 'Timer Phase',
  4: 'Full Timeline'
} as const;

export type Phase = 1 | 2 | 3 | 4;

/**
 * Calculate score based on phase, guesses, and time
 * @param {Phase} solvedPhase - Phase where player solved (1-4)
 * @param {number} guessesInPhase - Number of guesses in that phase
 * @param {number} secondsElapsed - Seconds elapsed (for phases 3-4)
 * @returns {number} - Final score
 */
export const calculateScore = (
  solvedPhase: Phase,
  guessesInPhase: number,
  secondsElapsed: number = 0
): number => {
  let score = 0;

  switch (solvedPhase) {
    case 1:
      score = PHASE_SCORING.phase1.base - ((guessesInPhase - 1) * PHASE_SCORING.phase1.perGuess);
      break;
    case 2:
      score = PHASE_SCORING.phase2.base - ((guessesInPhase - 1) * PHASE_SCORING.phase2.perGuess);
      break;
    case 3:
      score = PHASE_SCORING.phase3.base - (secondsElapsed * PHASE_SCORING.phase3.perSecond);
      break;
    case 4:
      score = PHASE_SCORING.phase4.base - (secondsElapsed * PHASE_SCORING.phase4.perSecond);
      break;
    default:
      score = 0;
  }

  return Math.max(score, 5); // Minimum 5 points
};

/**
 * Generate shareable text for social media
 * @param {number} puzzleNumber - Daily puzzle number
 * @param {number} score - Final score
 * @param {number} totalGuesses - Total guesses made
 * @param {Phase} solvedPhase - Phase where solved
 * @param {number} totalSeconds - Total time taken
 * @returns {string} - Shareable text
 */
export const generateShareText = (
  puzzleNumber: number,
  score: number,
  totalGuesses: number,
  solvedPhase: Phase,
  totalSeconds: number
): string => {
  const phaseEmojis = ['🟩', '🟨', '🟧', '🟥'];
  const emojiString = phaseEmojis.slice(0, solvedPhase).join('') +
                      phaseEmojis.slice(solvedPhase).map(() => '⬛').join('');

  return `CAREER LADDER #${puzzleNumber}
⚡ ${totalSeconds}s | ${totalGuesses} ${totalGuesses === 1 ? 'guess' : 'guesses'} | ${score} pts
${emojiString}

Play at: career-ladder.pages.dev`;
};
