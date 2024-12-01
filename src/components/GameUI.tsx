import React from 'react';
import { Snake } from '../types/game';
import { Zap, Shield, Ghost } from 'lucide-react';

interface GameUIProps {
  score: number;
  playerCount: number;
  player: Snake;
  onUseAbility: (abilityName: keyof Snake['abilities']) => void;
}

const GameUI: React.FC<GameUIProps> = ({ score, playerCount, player, onUseAbility }) => {
  const renderAbilityButton = (abilityName: keyof Snake['abilities']) => {
    const ability = player.abilities[abilityName];
    const isOnCooldown = Date.now() - ability.lastUsed < ability.cooldown;
    const isUnlocked = score >= ability.requiredScore;
    
    let icon;
    switch (abilityName) {
      case 'boost': icon = <Zap className="w-6 h-6" />; break;
      case 'shield': icon = <Shield className="w-6 h-6" />; break;
      case 'ghost': icon = <Ghost className="w-6 h-6" />; break;
    }

    return (
      <button
        onClick={() => onUseAbility(abilityName)}
        disabled={isOnCooldown || !isUnlocked}
        className={`relative p-3 rounded-lg transition-all ${
          isUnlocked
            ? isOnCooldown
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
            : 'bg-gray-700 cursor-not-allowed'
        }`}
      >
        {icon}
        {!isUnlocked && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
            Unlock at {ability.requiredScore}
          </div>
        )}
        {isOnCooldown && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            {Math.ceil((ability.cooldown - (Date.now() - ability.lastUsed)) / 1000)}s
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start">
      <div className="bg-black/50 rounded-lg p-3">
        <p className="text-2xl font-bold text-white">Score: {score}</p>
        <p className="text-sm text-white">Players: {playerCount}</p>
      </div>
      
      <div className="flex gap-3 bg-black/50 rounded-lg p-3">
        {renderAbilityButton('boost')}
        {renderAbilityButton('shield')}
        {renderAbilityButton('ghost')}
      </div>
    </div>
  );
};

export default GameUI;