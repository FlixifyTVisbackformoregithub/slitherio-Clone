import { useEffect, useRef } from 'react';
import { Snake, Food } from '../types/game';
import {
  calculateNextPosition,
  checkCollision,
  checkSnakeCollision,
  checkBoundaryCollision,
  generateFood,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from '../utils/gameLogic';

export const useGameLoop = (
  player: Snake,
  bots: Snake[],
  foods: Food[],
  setPlayer: (p: Snake) => void,
  setBots: (b: Snake[]) => void,
  setFoods: (f: Food[]) => void,
  onPlayerDeath: () => void
) => {
  const frameRef = useRef<number>();

  const updateBot = (bot: Snake): Snake => {
    if (bot.isDead) return bot;

    // Find nearest food
    const nearestFood = foods.reduce((closest, food) => {
      const distToCurrent = Math.hypot(bot.points[0].x - food.x, bot.points[0].y - food.y);
      const distToClosest = Math.hypot(bot.points[0].x - closest.x, bot.points[0].y - closest.y);
      return distToCurrent < distToClosest ? food : closest;
    }, foods[0]);

    if (!nearestFood) return bot;

    // Calculate target angle with some randomness for more natural movement
    const targetAngle = Math.atan2(
      nearestFood.y - bot.points[0].y,
      nearestFood.x - bot.points[0].x
    ) + (Math.random() - 0.5) * 0.2;

    let newAngle = bot.angle;
    const angleDiff = targetAngle - bot.angle;
    // Normalize angle difference
    const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    newAngle += Math.sign(normalizedDiff) * Math.min(Math.abs(normalizedDiff), 0.03);

    const nextPos = calculateNextPosition({ ...bot, angle: newAngle });
    
    // Check collisions
    const isDead = checkBoundaryCollision(nextPos) ||
      bots.some(other => other.id !== bot.id && !other.isDead && checkSnakeCollision(bot, other)) ||
      (!player.isDead && checkSnakeCollision(bot, player));

    if (isDead) {
      return { ...bot, isDead: true };
    }

    const newPoints = [nextPos, ...bot.points.slice(0, bot.length - 1)];
    return { ...bot, points: newPoints, angle: newAngle };
  };

  const gameLoop = () => {
    if (player.isDead) return;

    // Update player position
    const nextPlayerPos = calculateNextPosition(player);
    
    // Check player collisions
    const playerDead = checkBoundaryCollision(nextPlayerPos) ||
      bots.some(bot => !bot.isDead && checkSnakeCollision(player, bot));

    if (playerDead) {
      setPlayer({ ...player, isDead: true });
      onPlayerDeath();
      return;
    }

    // Update player
    const newPlayerPoints = [nextPlayerPos, ...player.points.slice(0, player.length - 1)];
    setPlayer({ ...player, points: newPlayerPoints });

    // Update bots
    setBots(bots.map(updateBot));

    // Manage food
    const newFoods = [...foods];
    let foodsChanged = false;

    // Check food collisions and add new food
    for (let i = newFoods.length - 1; i >= 0; i--) {
      const food = newFoods[i];
      const playerDist = Math.hypot(player.points[0].x - food.x, player.points[0].y - food.y);
      if (playerDist < 10) {
        newFoods.splice(i, 1);
        setPlayer(prev => ({ ...prev, length: prev.length + food.value }));
        foodsChanged = true;
        continue;
      }

      // Bots can also eat food
      for (let j = 0; j < bots.length; j++) {
        const bot = bots[j];
        if (!bot.isDead) {
          const botDist = Math.hypot(bot.points[0].x - food.x, bot.points[0].y - food.y);
          if (botDist < 10) {
            newFoods.splice(i, 1);
            const newBots = [...bots];
            newBots[j] = { ...bot, length: bot.length + food.value };
            setBots(newBots);
            foodsChanged = true;
            break;
          }
        }
      }
    }

    // Add new food if needed
    while (newFoods.length < 100) {
      newFoods.push(generateFood());
      foodsChanged = true;
    }

    if (foodsChanged) {
      setFoods(newFoods);
    }

    frameRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    frameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [player, bots, foods]);
};