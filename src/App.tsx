import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import Game from './components/Game'
import { getTodaysPlayer, type Player } from './data/players'

function App() {
  const posthog = usePostHog();
  const [player, setPlayer] = useState<Player | null>(null);
  const [puzzleNumber, setPuzzleNumber] = useState<number>(0);

  useEffect(() => {
    // Get today's player
    const todaysPlayer = getTodaysPlayer();
    setPlayer(todaysPlayer);

    // Calculate puzzle number (days since launch)
    const launchDate = new Date('2025-11-12');
    const today = new Date();
    const daysSinceLaunch = Math.floor((today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
    setPuzzleNumber(daysSinceLaunch);
    
    // Track puzzle load
    posthog?.capture('puzzle_loaded', {
      puzzle_number: daysSinceLaunch,
    });
  }, [posthog]);

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          CAREER LADDER
        </h1>
        <p className="text-muted-foreground">Loading today's puzzle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Game player={player} puzzleNumber={puzzleNumber} />
    </div>
  );
}

export default App
