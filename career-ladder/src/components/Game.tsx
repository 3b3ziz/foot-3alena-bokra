import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Clock, Target, Share2, CheckCircle2, XCircle, ArrowRight, Eye } from 'lucide-react';
import { validateGuess } from '@/utils/nameValidator';
import { calculateScore, generateShareText } from '@/utils/scoring';
import type { Player } from '@/data/players';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type GameState = 'playing' | 'won' | 'lost';

interface Guess {
  text: string;
  correct: boolean;
  suggestion?: string;
}

interface GameProps {
  player: Player;
  puzzleNumber: number;
}

export default function Game({ player, puzzleNumber }: GameProps) {
  // Game state
  const [revealedClubs, setRevealedClubs] = useState<(string | null)[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [guessInput, setGuessInput] = useState('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [suggestion, setSuggestion] = useState<string>('');
  const [shake, setShake] = useState(false);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timer, setTimer] = useState(45);
  const [lastKeystroke, setLastKeystroke] = useState(Date.now());

  // Scoring
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game - show 2 clubs in their correct positions
  useEffect(() => {
    const timeline = Array(player.clubs.length).fill(null);
    const [club1, club2] = player.puzzleConfig.initialClubs;

    const idx1 = player.clubs.indexOf(club1);
    const idx2 = player.clubs.indexOf(club2);

    timeline[idx1] = club1;
    timeline[idx2] = club2;

    setRevealedClubs(timeline);
  }, [player]);

  // Total time counter
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

  // Timer logic
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            // Timer expired - check if user is idle
            const timeSinceLastKey = Date.now() - lastKeystroke;
            if (timeSinceLastKey > 3000) {
              // User is idle - auto reveal a club
              revealRandomClub();
              return 45; // Reset timer
            }
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
  }, [timerActive, timer, lastKeystroke]);

  const revealRandomClub = () => {
    const hiddenIndices = revealedClubs
      .map((club, idx) => club === null ? idx : -1)
      .filter(idx => idx !== -1);

    if (hiddenIndices.length === 0) return;

    const randomIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
    const newRevealed = [...revealedClubs];
    newRevealed[randomIdx] = player.clubs[randomIdx];
    setRevealedClubs(newRevealed);
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guessInput.trim()) return;
    if (gameState !== 'playing') return;

    const result = validateGuess(guessInput, player);
    const newGuess: Guess = {
      text: guessInput,
      correct: result.matched,
      suggestion: result.suggestion
    };

    setGuesses([...guesses, newGuess]);
    setGuessInput('');

    if (result.suggestion && !result.matched) {
      setSuggestion(result.suggestion);
      setTimeout(() => setSuggestion(''), 3000);
    }

    if (result.matched) {
      // WIN!
      setGameState('won');
      const finalScore = calculateScore(guesses.length + 1, timerActive);
      setScore(finalScore);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (totalTimeIntervalRef.current) clearInterval(totalTimeIntervalRef.current);
    } else {
      // Wrong guess
      setShake(true);
      setTimeout(() => setShake(false), 500);

      handleWrongGuess();
    }
  };

  const handleWrongGuess = () => {
    const guessCount = guesses.length + 1;

    // First wrong guess - reveal timeline with placeholders
    if (guessCount === 1) {
      setShowTimeline(true);
      return;
    }

    // After 3 guesses - start timer
    if (guessCount === 3 && !timerActive) {
      setTimerActive(true);
      return;
    }

    // Check if all clubs are revealed
    const currentHiddenCount = revealedClubs.filter(c => c === null).length;

    if (currentHiddenCount === 0) {
      // All clubs revealed - count additional guesses
      const guessesAfterFullReveal = guesses.filter((_, idx) => {
        // Count guesses made after all clubs were shown
        return revealedClubs.filter(c => c === null).length === 0;
      }).length;

      // After 2 wrong guesses with all clubs visible, auto-reveal answer
      if (guessesAfterFullReveal >= 1) {
        handleRevealAnswer();
        return;
      }
    }

    // Otherwise - reveal a random club
    revealRandomClub();
  };

  const handleRevealAnswer = () => {
    setGameState('lost');
    setScore(0);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (totalTimeIntervalRef.current) clearInterval(totalTimeIntervalRef.current);
  };

  const handleShare = async () => {
    const clubsRevealed = revealedClubs.filter(c => c !== null).length;
    const shareText = generateShareText(
      puzzleNumber,
      score,
      guesses.length,
      clubsRevealed,
      totalSeconds
    );

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuessInput(e.target.value);
    setLastKeystroke(Date.now());
  };

  // Count revealed and hidden clubs
  const revealedCount = revealedClubs.filter(c => c !== null).length;
  const hiddenCount = revealedClubs.filter(c => c === null).length;
  const progress = (revealedCount / player.clubs.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
          CAREER LADDER
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            Puzzle #{puzzleNumber}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {totalSeconds}s
          </span>
        </div>
      </header>

      {/* Progress */}
      {gameState === 'playing' && (
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-muted-foreground">
              {revealedCount} of {player.clubs.length} clubs revealed
            </span>
            <Badge variant="outline">{guesses.length} guesses</Badge>
          </div>
        </div>
      )}

      {/* Game Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Clubs Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>
                      {!showTimeline && "Guess who played for both clubs"}
                      {showTimeline && !timerActive && `${hiddenCount} clubs hidden`}
                      {timerActive && "Timer Active"}
                    </span>
                    {timerActive && (
                      <motion.div
                        animate={{
                          scale: timer <= 10 ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          repeat: timer <= 10 ? Infinity : 0,
                          duration: 0.5
                        }}
                        className={`flex items-center gap-1 ${
                          timer <= 10 ? 'text-destructive' : 'text-primary'
                        }`}
                      >
                        <Timer className="w-5 h-5" />
                        <span className="text-2xl font-bold">{timer}s</span>
                      </motion.div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {guesses.length === 0 && "Start guessing to reveal the career timeline"}
                    {guesses.length > 0 && !showTimeline && "First wrong guess reveals the full career path"}
                    {showTimeline && !timerActive && "Each wrong guess reveals another club"}
                    {timerActive && "Type actively or a club will auto-reveal when timer expires"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showTimeline ? (
                    // Initial view - 2 unordered clubs
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-4 flex-wrap"
                    >
                      <Badge variant="default" className="text-lg px-6 py-3">
                        {player.puzzleConfig.initialClubs[0]}
                      </Badge>
                      <span className="text-4xl font-bold text-muted-foreground">+</span>
                      <Badge variant="default" className="text-lg px-6 py-3">
                        {player.puzzleConfig.initialClubs[1]}
                      </Badge>
                    </motion.div>
                  ) : (
                    // Timeline view with placeholders
                    <div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-2 max-h-96 overflow-y-auto"
                      >
                        {revealedClubs.map((club, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-2 justify-center"
                          >
                            <Badge
                              variant={club ? "default" : "secondary"}
                              className="text-sm px-3 py-1.5 min-w-[120px] text-center"
                            >
                              {club || "???"}
                            </Badge>
                            {idx < revealedClubs.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Input Form */}
              <motion.form
                onSubmit={handleGuess}
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={guessInput}
                    onChange={handleInputChange}
                    placeholder="Enter player name..."
                    autoFocus
                    className="flex-1"
                  />
                  <Button type="submit" size="lg">
                    Guess
                  </Button>
                </div>
              </motion.form>

              {/* Suggestion */}
              <AnimatePresence>
                {suggestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="border-amber-500 bg-amber-50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-amber-900">{suggestion}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Guesses List */}
              {guesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Guesses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {guesses.map((guess, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          guess.correct
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {guess.correct ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={guess.correct ? 'text-green-900' : 'text-red-900'}>
                            {guess.text}
                          </span>
                        </span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {gameState === 'won' && (
            <motion.div
              key="won"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-green-500">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-6xl mb-2"
                  >
                    🎉
                  </motion.div>
                  <CardTitle className="text-3xl text-green-600">Correct!</CardTitle>
                  <CardDescription className="text-xl font-semibold mt-2">
                    {player.canonical}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Career Path */}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Career Path:</p>
                    <div className="flex flex-wrap gap-1 text-sm">
                      {player.clubs.map((club, idx) => (
                        <span key={idx}>
                          {club}
                          {idx < player.clubs.length - 1 && ' → '}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{totalSeconds}s</p>
                      <p className="text-xs text-muted-foreground">Time</p>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{guesses.length}</p>
                      <p className="text-xs text-muted-foreground">Guesses</p>
                    </div>
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{revealedCount}</p>
                      <p className="text-xs text-muted-foreground">Clubs Seen</p>
                    </div>
                  </div>

                  {/* Share Button */}
                  <Button
                    onClick={handleShare}
                    className="w-full gap-2"
                    size="lg"
                    variant={showCopied ? "secondary" : "default"}
                  >
                    {showCopied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5" />
                        Share Result
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameState === 'lost' && (
            <motion.div
              key="lost"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-red-500">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-6xl mb-2"
                  >
                    😔
                  </motion.div>
                  <CardTitle className="text-2xl text-red-600">Better luck tomorrow!</CardTitle>
                  <CardDescription className="text-xl font-semibold mt-2">
                    The answer was: {player.canonical}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Career Path */}
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Career Path:</p>
                    <div className="flex flex-wrap gap-1 text-sm">
                      {player.clubs.map((club, idx) => (
                        <span key={idx}>
                          {club}
                          {idx < player.clubs.length - 1 && ' → '}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{totalSeconds}s</p>
                      <p className="text-xs text-muted-foreground">Time</p>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-2xl font-bold">{guesses.length}</p>
                      <p className="text-xs text-muted-foreground">Guesses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-sm text-muted-foreground">
        <p>A new player every day at midnight UTC</p>
      </footer>
    </div>
  );
}
