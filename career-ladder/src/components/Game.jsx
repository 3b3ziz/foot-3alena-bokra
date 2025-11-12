import { useState, useEffect, useRef } from 'react';
import { validateGuess } from '../utils/nameValidator';
import { calculateScore, generateShareText } from '../utils/scoring';
import './Game.css';

const PHASE_CONFIG = {
  1: { maxGuesses: 2, title: 'Phase 1: Unordered Clubs', subtitle: 'These clubs appear in the player\'s career (not in order)' },
  2: { maxGuesses: 1, title: 'Phase 2: Order Revealed', subtitle: 'There are clubs between them!' },
  3: { maxGuesses: 1, title: 'Phase 3: Timer Challenge', subtitle: '20 seconds - no searching!', timerSeconds: 20 },
  4: { maxGuesses: 2, title: 'Phase 4: Full Timeline', subtitle: 'The complete career path' }
};

export default function Game({ player, puzzleNumber }) {
  const [phase, setPhase] = useState(1);
  const [guessInput, setGuessInput] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [guessesInPhase, setGuessesInPhase] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  const inputRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);
  const totalTimeIntervalRef = useRef(null);

  // Start total time counter
  useEffect(() => {
    totalTimeIntervalRef.current = setInterval(() => {
      setTotalSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (totalTimeIntervalRef.current) {
        clearInterval(totalTimeIntervalRef.current);
      }
    };
  }, []);

  // Timer for Phase 3
  useEffect(() => {
    if (phase === 3 && !timerActive) {
      // Start timer when entering Phase 3
      setTimerActive(true);
      setTimer(PHASE_CONFIG[3].timerSeconds);
    }

    if (timerActive && timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [phase, timerActive, timer]);

  const handleGuess = (e) => {
    e.preventDefault();

    if (!guessInput.trim()) return;
    if (gameState !== 'playing') return;

    const result = validateGuess(guessInput, player);
    const newGuess = {
      text: guessInput,
      phase: phase,
      correct: result.matched
    };

    setGuesses([...guesses, newGuess]);
    setGuessesInPhase(guessesInPhase + 1);
    setGuessInput('');

    if (result.matched) {
      // WIN!
      setGameState('won');
      const finalScore = calculateScore(phase, guessesInPhase + 1, totalSeconds);
      setScore(finalScore);

      // Stop timers
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (totalTimeIntervalRef.current) clearInterval(totalTimeIntervalRef.current);
    } else {
      // Wrong guess - check if we should advance phase
      if (guessesInPhase + 1 >= PHASE_CONFIG[phase].maxGuesses) {
        if (phase < 4) {
          setPhase(phase + 1);
          setGuessesInPhase(0);
        } else {
          // No more phases - game over
          setGameState('lost');
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (totalTimeIntervalRef.current) clearInterval(totalTimeIntervalRef.current);
        }
      }
    }
  };

  const handleShare = async () => {
    const shareText = generateShareText(
      puzzleNumber,
      score,
      guesses.length,
      phase,
      totalSeconds
    );

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        // Fallback to clipboard
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const renderClubs = () => {
    const config = player.puzzleConfig;

    switch (phase) {
      case 1:
        // Unordered clubs
        return (
          <div className="clubs-container">
            <div className="club-badge">{config.initialClubs[0]}</div>
            <div className="separator">+</div>
            <div className="club-badge">{config.initialClubs[1]}</div>
          </div>
        );

      case 2:
        // Order revealed with mystery clubs
        return (
          <div className="clubs-container timeline">
            <div className="club-badge">{config.initialClubs[0]}</div>
            <div className="arrow">→</div>
            <div className="club-badge mystery">???</div>
            <div className="arrow">→</div>
            <div className="club-badge">{config.initialClubs[1]}</div>
          </div>
        );

      case 3:
        // Add third club randomly positioned
        return (
          <div className="clubs-container timeline">
            <div className="club-badge">{config.initialClubs[0]}</div>
            <div className="arrow">→</div>
            <div className="club-badge mystery">???</div>
            <div className="arrow">→</div>
            <div className="club-badge">{config.initialClubs[1]}</div>
            <div className="plus-club">+ {config.thirdClub}</div>
            <div className="hint-text">(appears somewhere in career)</div>
          </div>
        );

      case 4:
        // Full timeline
        return (
          <div className="clubs-container timeline full">
            {player.clubs.map((club, idx) => (
              <div key={idx} className="timeline-item">
                <div className="club-badge">{club}</div>
                {idx < player.clubs.length - 1 && <div className="arrow">→</div>}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const remainingGuesses = PHASE_CONFIG[phase].maxGuesses - guessesInPhase;

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>CAREER LADDER</h1>
        <div className="puzzle-info">
          <span>Puzzle #{puzzleNumber}</span>
          <span>⏱️ {totalSeconds}s</span>
        </div>
      </header>

      <div className="game-content">
        {gameState === 'playing' && (
          <>
            <div className="phase-header">
              <h2>{PHASE_CONFIG[phase].title}</h2>
              <p>{PHASE_CONFIG[phase].subtitle}</p>
              {phase === 3 && timerActive && (
                <div className={`timer ${timer <= 5 ? 'urgent' : ''}`}>
                  ⏱️ {timer}s
                </div>
              )}
            </div>

            {renderClubs()}

            <form onSubmit={handleGuess} className="guess-form">
              <input
                ref={inputRef}
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Enter player name..."
                className="guess-input"
                autoFocus
              />
              <button type="submit" className="guess-button">
                Guess ({remainingGuesses} left)
              </button>
            </form>

            {guesses.length > 0 && (
              <div className="guesses-list">
                <h3>Your Guesses:</h3>
                {guesses.map((guess, idx) => (
                  <div key={idx} className={`guess-item ${guess.correct ? 'correct' : 'wrong'}`}>
                    <span>{guess.text}</span>
                    <span className="phase-badge">Phase {guess.phase}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {gameState === 'won' && (
          <div className="result-container won">
            <h2>🎉 Correct!</h2>
            <div className="answer-reveal">
              <h3>{player.canonical}</h3>
              <div className="career-path">
                {player.clubs.map((club, idx) => (
                  <span key={idx}>
                    {club}
                    {idx < player.clubs.length - 1 && ' → '}
                  </span>
                ))}
              </div>
            </div>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">Score</span>
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Time</span>
                <span className="stat-value">{totalSeconds}s</span>
              </div>
              <div className="stat">
                <span className="stat-label">Guesses</span>
                <span className="stat-value">{guesses.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Phase</span>
                <span className="stat-value">{phase}</span>
              </div>
            </div>
            <button onClick={handleShare} className="share-button">
              {showCopied ? '✓ Copied!' : '📋 Share Result'}
            </button>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="result-container lost">
            <h2>😔 Better luck tomorrow!</h2>
            <div className="answer-reveal">
              <h3>The answer was: {player.canonical}</h3>
              <div className="career-path">
                {player.clubs.map((club, idx) => (
                  <span key={idx}>
                    {club}
                    {idx < player.clubs.length - 1 && ' → '}
                  </span>
                ))}
              </div>
            </div>
            <div className="stats">
              <div className="stat">
                <span className="stat-label">Time</span>
                <span className="stat-value">{totalSeconds}s</span>
              </div>
              <div className="stat">
                <span className="stat-label">Guesses</span>
                <span className="stat-value">{guesses.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="game-footer">
        <p>A new player every day at midnight UTC</p>
      </footer>
    </div>
  );
}
