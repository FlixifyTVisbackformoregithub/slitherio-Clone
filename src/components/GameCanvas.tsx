import React, { useRef, useEffect } from 'react';
import { Snake, Food } from '../types/game';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT, ZOOM_LEVEL } from '../utils/gameLogic';

interface GameCanvasProps {
  player: Snake;
  bots: Snake[];
  foods: Food[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ player, bots, foods }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSnake = (ctx: CanvasRenderingContext2D, snake: Snake) => {
    if (snake.isDead) return;
    
    // Create gradient for snake body
    const gradient = ctx.createLinearGradient(
      snake.points[0].x,
      snake.points[0].y,
      snake.points[snake.points.length - 1].x,
      snake.points[snake.points.length - 1].y
    );
    gradient.addColorStop(0, snake.color);
    gradient.addColorStop(1, adjustColor(snake.color, -20));

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Add glow effect for special abilities
    if (snake.activeEffects.shielded) {
      ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
      ctx.shadowBlur = 10;
    } else if (snake.activeEffects.ghosted) {
      ctx.globalAlpha = 0.5;
    } else if (snake.activeEffects.boosted) {
      ctx.shadowColor = 'rgba(255, 255, 0, 0.5)';
      ctx.shadowBlur = 10;
    }

    snake.points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();
    
    // Reset effects
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Draw eyes
    const head = snake.points[0];
    const eyeOffset = 3;
    const eyeAngle = Math.PI / 4;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      head.x + Math.cos(snake.angle - eyeAngle) * eyeOffset,
      head.y + Math.sin(snake.angle - eyeAngle) * eyeOffset,
      2,
      0,
      Math.PI * 2
    );
    ctx.arc(
      head.x + Math.cos(snake.angle + eyeAngle) * eyeOffset,
      head.y + Math.sin(snake.angle + eyeAngle) * eyeOffset,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw name with glow effect
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(snake.name, head.x, head.y - 15);
    ctx.shadowBlur = 0;
  };

  const drawFood = (ctx: CanvasRenderingContext2D, food: Food) => {
    ctx.beginPath();
    
    if (food.type === 'special') {
      // Update pulse phase
      food.pulsePhase = (food.pulsePhase || 0) + 0.1;
      const scale = 1 + Math.sin(food.pulsePhase) * 0.2;
      
      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = food.color;
      ctx.arc(food.x, food.y, 6 * scale, 0, Math.PI * 2);
    } else {
      ctx.fillStyle = food.color;
      ctx.arc(food.x, food.y, 4, 0, Math.PI * 2);
    }
    
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const adjustColor = (color: string, amount: number): string => {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return color;
    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = Math.max(0, Math.min(100, parseInt(match[3]) + amount));
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Set camera to follow player with zoom
    ctx.save();
    ctx.scale(ZOOM_LEVEL, ZOOM_LEVEL);
    ctx.translate(
      VIEWPORT_WIDTH / (2 * ZOOM_LEVEL) - player.points[0].x,
      VIEWPORT_HEIGHT / (2 * ZOOM_LEVEL) - player.points[0].y
    );

    // Draw background with gradient
    const gradient = ctx.createRadialGradient(
      player.points[0].x,
      player.points[0].y,
      0,
      player.points[0].x,
      player.points[0].y,
      VIEWPORT_WIDTH
    );
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid with fade effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    const gridSize = 50;
    
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw game elements
    foods.forEach(food => drawFood(ctx, food));
    bots.forEach(bot => !bot.isDead && drawSnake(ctx, bot));
    if (!player.isDead) drawSnake(ctx, player);

    ctx.restore();
  }, [player, bots, foods]);

  return (
    <canvas
      ref={canvasRef}
      width={VIEWPORT_WIDTH}
      height={VIEWPORT_HEIGHT}
      className="absolute top-0 left-0"
    />
  );
};

export default GameCanvas;