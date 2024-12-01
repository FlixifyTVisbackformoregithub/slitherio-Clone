import React, { useState } from 'react';
import { Crown, Swords, Trophy } from 'lucide-react';

interface HomePageProps {
  onStartGame: (playerName: string) => void;
  highScore: number;
}

const HomePage: React.FC<HomePageProps> = ({ onStartGame, highScore }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStartGame(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-600 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2 flex items-center justify-center gap-2">
            <Crown className="w-8 h-8" />
            Slither.io Clone
          </h1>
          <p className="text-gray-600">Eat, grow, and survive!</p>
        </div>

        <div className="mb-8 flex justify-around">
          <div className="text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">High Score</p>
            <p className="font-bold text-purple-900">{highScore}</p>
          </div>
          <div className="text-center">
            <Swords className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Players Online</p>
            <p className="font-bold text-purple-900">10</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={15}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Play Now
          </button>
        </form>

        <div className="mt-6 text-center">
          <h2 className="font-semibold text-gray-700 mb-2">How to Play</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Move your mouse to control direction</li>
            <li>Or use Arrow Keys / WASD to rotate</li>
            <li>Collect orbs to grow longer</li>
            <li>Avoid colliding with other snakes</li>
            <li>Try to become the longest snake!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;