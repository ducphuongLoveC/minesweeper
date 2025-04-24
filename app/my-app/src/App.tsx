import React, { useState } from 'react';
import Minesweeper from './components/Minesweeper';
// import './App.css';
// import './Minesweeper.css'
const difficultyLevels = {
  beginner: { x: 9, y: 9, mines: 10 },
  intermediate: { x: 16, y: 16, mines: 40 },
  expert: { x: 30, y: 16, mines: 99 },
  level4: { x: 50, y: 25, mines: 99 },
};

const App: React.FC = () => {
  const [gameKey, setGameKey] = useState(0);
  const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>('beginner');

  const handleChooseLevel = (level: keyof typeof difficultyLevels) => {
    setDifficulty(level);
    setGameKey(prev => prev + 1);
  };

  const { x, y } = difficultyLevels[difficulty];

  return (
    <div>
      <header>
        <h1>Minesweeper</h1>
        <div className="action-container">
          {Object.keys(difficultyLevels).map((level) => (
            <button
              key={level}
              onClick={() => handleChooseLevel(level as keyof typeof difficultyLevels)}
              className={difficulty === level ? 'active' : ''}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
          <button id="btn-custom">Custom</button>
        </div>
        <div className="mine-counter" id="mine-counter">
          Mines: 0
        </div>
      </header>
      <Minesweeper key={gameKey} ratioX={x} ratioY={y} />
    </div>
  );
};

export default App;