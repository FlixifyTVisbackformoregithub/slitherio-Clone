import { useEffect } from 'react';
import { Snake } from '../types/game';

const ROTATION_SPEED = 0.05; // Reduced rotation speed

export const useKeyboardControls = (
  gameState: 'menu' | 'playing' | 'dead',
  setPlayer: (updater: (prev: Snake) => Snake) => void
) => {
  useEffect(() => {
    const keys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const key = e.key?.toLowerCase() || '';
      keys.add(key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase() || '';
      keys.delete(key);
    };

    const updateRotation = () => {
      if (gameState !== 'playing') return;

      if (keys.has('arrowleft') || keys.has('a')) {
        setPlayer(prev => ({
          ...prev,
          angle: prev.angle - ROTATION_SPEED
        }));
      }
      if (keys.has('arrowright') || keys.has('d')) {
        setPlayer(prev => ({
          ...prev,
          angle: prev.angle + ROTATION_SPEED
        }));
      }
    };

    const intervalId = setInterval(updateRotation, 16); // ~60fps

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(intervalId);
    };
  }, [gameState, setPlayer]);
};