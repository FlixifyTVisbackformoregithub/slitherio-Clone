import React from 'react';
import { Skull } from 'lucide-react';

interface DeathScreenProps {
  score: number;
  onRestart: () => void;
}

const DeathScreen: React.FC<DeathScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full mx-4">
        <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Over!</h2>
        <p className="text-xl text-purple-600 mb-6">Final Score: {score}</p>
        <button
          onClick={onRestart}
          className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default DeathScreen;