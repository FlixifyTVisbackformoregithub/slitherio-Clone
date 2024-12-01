import React, { useState, useEffect } from 'react';
import { Snake, Food, GameState } from './types/game';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { generateFood, createInitialSnake, CANVAS_WIDTH, CANVAS_HEIGHT } from './utils/gameLogic';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import HomePage from './components/HomePage';
import DeathScreen from './components/DeathScreen';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [player, setPlayer] = useState<Snake>(createInitialSnake());
  const [bots, setBots] = useState<Snake[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [highScore, setHighScore] = useState(0);

  const handleUseAbility = (abilityName: keyof Snake['abilities']) => {
    if (!player || player.isDead) return;

    const ability = player.abilities[abilityName];
    const now = Date.now();
    
    if (now - ability.lastUsed < ability.cooldown) return;

    setPlayer(prev => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [abilityName]: {
          ...ability,
          lastUsed: now
        }
      },
      activeEffects: {
        ...prev.activeEffects,
        [abilityName === 'boost' ? 'boosted' : 
          abilityName === 'shield' ? 'shielded' : 
          'ghosted']: true
      }
    }));

    // Clear effect after duration
    setTimeout(() => {
      setPlayer(prev => ({
        ...prev,
        activeEffects: {
          ...prev.activeEffects,
          [abilityName === 'boost' ? 'boosted' : 
            abilityName === 'shield' ? 'shielded' : 
            'ghosted']: false
        }
      }));
    }, 5000); // 5 seconds duration for all abilities
  };

  const initializeGame = (playerName: string) => {
    const newPlayer = createInitialSnake(false, playerName);
    const newBots = Array(10).fill(null).map(() => createInitialSnake(true));
    const newFoods = Array(100).fill(null).map(generateFood);
    
    setPlayer(newPlayer);
    setBots(newBots);
    setFoods(newFoods);
    setGameState('playing');
  };

  const handlePlayerDeath = () => {
    setGameState('dead');
    setHighScore(Math.max(highScore, player.length - 20));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== 'playing') return;
      
      const rect = document.getElementById('game-container')?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      setPlayer(prev => ({ ...prev, angle }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        if (foods.length < 100) {
          setFoods(prev => [...prev, generateFood()]);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, foods]);

  useKeyboardControls(gameState, setPlayer);
  useGameLoop(player, bots, foods, setPlayer, setBots, setFoods, handlePlayerDeath);

  if (gameState === 'menu') {
    return <HomePage onStartGame={initializeGame} highScore={highScore} />;
  }

  return (
    <div id="game-container" className="w-screen h-screen bg-gray-900 overflow-hidden relative">
      <GameCanvas player={player} bots={bots} foods={foods} />
      <GameUI 
        score={player.length - 20} 
        playerCount={bots.filter(b => !b.isDead).length + 1} 
        player={player}
        onUseAbility={handleUseAbility}
      />
      {gameState === 'dead' && (
        <DeathScreen
          score={player.length - 20}
          onRestart={() => setGameState('menu')}
        />
      )}
    </div>
  );
}

export default App;