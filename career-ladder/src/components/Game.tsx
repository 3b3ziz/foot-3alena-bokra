import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Trophy, Clock, Target, Share2, CheckCircle2, XCircle, Zap, ArrowRight } from 'lucide-react';
import { validateGuess } from '@/utils/nameValidator';
import { calculateScore, generateShareText, type Phase } from '@/utils/scoring';
import type { Player } from '@/data/players';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PhaseConfig {
  maxGuesses: number;
  title: string;
  subtitle: string;
  timerSeconds?: number;
}

const PHASE_CONFIG: Record<Phase, PhaseConfig> = {
  1: { maxGuesses: 2, title: 'Unordered Clubs', subtitle: 'These clubs appear somewhere in the career' },
  2: { maxGuesses: 1, title: 'Order Revealed', subtitle: 'There are mystery clubs between them!' },
  3: { maxGuesses: 1, title: 'Timer Challenge', subtitle: '20 seconds - no searching!', timerSeconds: 20 },
  4: { maxGuesses: 2, title: 'Full Timeline', subtitle: 'The complete career path revealed' }
};

type GameState = 'playing' | 'won' | 'lost';

interface Guess {
  text: string;
  phase: Phase;
  correct: boolean;
  suggestion?: string;
}

interface GameProps {
  player: Player;
  puzzleNumber: number;
}

export default function Game({ player, puzzleNumber }: GameProps) {
  const [phase, setPhase] = useState<Phase>(1);
  const [guessInput, setGuessInput] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [guessesInPhase, setGuessesInPhase] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [shake, setShake] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setTimerActive(true);
      setTimer(PHASE_CONFIG[3].timerSeconds!);
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

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guessInput.trim()) return;
    if (gameState !== 'playing') return;

    const result = validateGuess(guessInput, player);
    const newGuess: Guess = {
      text: guessInput,
      phase: phase,
      correct: result.matched,
      suggestion: result.suggestion
    };

    setGuesses([...guesses, newGuess]);
    setGuessesInPhase(guessesInPhase + 1);
    setGuessInput('');

    if (result.suggestion && !result.matched) {
      setSuggestion(result.suggestion);
      setTimeout(() => setSuggestion(''), 3000);
    }

    if (result.matched) {
      // WIN!
      setGameState('won');
      const finalScore = calculateScore(phase, guessesInPhase + 1, totalSeconds);
      setScore(finalScore);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (totalTimeIntervalRef.current) clearInterval(totalTimeIntervalRef.current);
    } else {
      // Wrong guess - shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // Check if we should advance phase
      if (guessesInPhase + 1 >= PHASE_CONFIG[phase].maxGuesses) {
        if (phase < 4) {
          setPhase((phase + 1) as Phase);
          setGuessesInPhase(0);
        } else {
          // Game over
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

  const renderClubs = () => {
    const config = player.puzzleConfig;

    switch (phase) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Badge variant="default" className="text-lg px-6 py-3">
              {config.initialClubs[0]}
            </Badge>
            <span className="text-4xl font-bold text-muted-foreground">+</span>
            <Badge variant="default" className="text-lg px-6 py-3">
              {config.initialClubs[1]}
            </Badge>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-base px-4 py-2">
                {config.initialClubs[0]}
              </Badge>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <Badge variant="secondary" className="text-base px-4 py-2">
                ???
              </Badge>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <Badge variant="default" className="text-base px-4 py-2">
                {config.initialClubs[1]}
              </Badge>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="default" className="text-base px-4 py-2">
                {config.initialClubs[0]}
              </Badge>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <Badge variant="secondary" className="text-base px-4 py-2">
                ???
              </Badge>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <Badge variant="default" className="text-base px-4 py-2">
                {config.initialClubs[1]}
              </Badge>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Badge variant="warning" className="text-base px-4 py-2">
                + {config.thirdClub}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                (appears somewhere in career)
              </p>
            </motion.div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2 max-h-64 overflow-y-auto"
          >
            {player.clubs.map((club, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 justify-center"
              >
                <Badge variant="default" className="text-sm px-3 py-1.5">
                  {club}
                </Badge>
                {idx < player.clubs.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </motion.div>
            ))}
          </motion.div>
        );

      default:
        return null;
    }
  };

  const remainingGuesses = PHASE_CONFIG[phase].maxGuesses - guessesInPhase;
  const phaseProgress = (phase / 4) * 100;

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

      {/* Progress Bar */}
      {gameState === 'playing' && (
        <div className="mb-6">
          <Progress value={phaseProgress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground mt-1">
            Phase {phase} of 4
          </p>
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
            >
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {PHASE_CONFIG[phase].title}
                    {phase === 3 && timerActive && (
                      <motion.div
                        animate={{
                          scale: timer <= 5 ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          repeat: timer <= 5 ? Infinity : 0,
                          duration: 0.5
                        }}
                        className={`flex items-center gap-1 ${
                          timer <= 5 ? 'text-destructive' : 'text-primary'
                        }`}
                      >
                        <Timer className="w-5 h-5" />
                        <span className="text-2xl font-bold">{timer}s</span>
                      </motion.div>
                    )}
                  </CardTitle>
                  <CardDescription>{PHASE_CONFIG[phase].subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderClubs()}
                </CardContent>
              </Card>

              {/* Guess Form */}
              <motion.form
                onSubmit={handleGuess}
                className="mb-4"
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder="Enter player name..."
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="gap-2"
                  >
                    Guess
                    <Badge
                      variant={remainingGuesses === 1 ? "destructive" : "secondary"}
                      className={remainingGuesses === 1 ? "animate-pulse" : ""}
                    >
                      {remainingGuesses}
                    </Badge>
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
                    className="mb-4"
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
                        <Badge variant="outline" className="text-xs">
                          Phase {guess.phase}
                        </Badge>
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
                      <Zap className="w-8 h-8 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{phase}</p>
                      <p className="text-xs text-muted-foreground">Phase</p>
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
