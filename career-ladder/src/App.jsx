import { useEffect, useState } from 'react'
import Game from './components/Game'
import { getTodaysPlayer } from './data/players'
import './App.css'

function App() {
  const [player, setPlayer] = useState(null);
  const [puzzleNumber, setPuzzleNumber] = useState(0);

  useEffect(() => {
    // Get today's player
    const todaysPlayer = getTodaysPlayer();
    setPlayer(todaysPlayer);

    // Calculate puzzle number (days since launch)
    const launchDate = new Date('2024-01-01');
    const today = new Date();
    const daysSinceLaunch = Math.floor((today - launchDate) / (1000 * 60 * 60 * 24));
    setPuzzleNumber(daysSinceLaunch);
  }, []);

  if (!player) {
    return (
      <div className="loading">
        <h1>CAREER LADDER</h1>
        <p>Loading today's puzzle...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Game player={player} puzzleNumber={puzzleNumber} />
    </div>
  );
}

export default App
