import { Point, Snake, Food, Ability } from '../types/game';

export const CANVAS_WIDTH = 3000;
export const CANVAS_HEIGHT = 3000;
export const VIEWPORT_WIDTH = window.innerWidth;
export const VIEWPORT_HEIGHT = window.innerHeight;
export const INITIAL_SNAKE_LENGTH = 20;
export const ZOOM_LEVEL = 1.5;

const createAbility = (name: string, cooldown: number, requiredScore: number, icon: string): Ability => ({
  name,
  cooldown,
  lastUsed: 0,
  requiredScore,
  icon,
});

export const calculateNextPosition = (snake: Snake): Point => {
  const speed = snake.activeEffects.boosted ? snake.speed * 1.5 : snake.speed;
  const head = snake.points[0];
  return {
    x: head.x + Math.cos(snake.angle) * speed,
    y: head.y + Math.sin(snake.angle) * speed
  };
};

export const checkCollision = (point: Point, snake: Snake): boolean => {
  if (snake.activeEffects.ghosted) return false;
  
  for (let i = 0; i < snake.points.length - 1; i++) {
    const p1 = snake.points[i];
    const p2 = snake.points[i + 1];
    const distance = distanceToSegment(point, p1, p2);
    if (distance < 5) return true;
  }
  return false;
};

export const checkSnakeCollision = (snake1: Snake, snake2: Snake): boolean => {
  if (snake1.activeEffects.ghosted || snake2.activeEffects.ghosted) return false;
  if (snake1.activeEffects.shielded || snake2.activeEffects.shielded) return false;
  
  const head = snake1.points[0];
  return checkCollision(head, snake2);
};

export const checkBoundaryCollision = (point: Point): boolean => {
  const margin = 50;
  return (
    point.x < margin ||
    point.x > CANVAS_WIDTH - margin ||
    point.y < margin ||
    point.y > CANVAS_HEIGHT - margin
  );
};

export const distanceToSegment = (p: Point, v: Point, w: Point): number => {
  const l2 = Math.pow(w.x - v.x, 2) + Math.pow(w.y - v.y, 2);
  if (l2 === 0) return Math.sqrt(Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2));
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(
    Math.pow(p.x - (v.x + t * (w.x - v.x)), 2) +
    Math.pow(p.y - (v.y + t * (w.y - v.y)), 2)
  );
};

export const generateFood = (): Food => {
  const isSpecial = Math.random() < 0.1; // 10% chance for special food
  return {
    x: Math.random() * (CANVAS_WIDTH - 100) + 50,
    y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
    color: isSpecial ? 'rgb(255, 215, 0)' : `hsl(${Math.random() * 360}, 100%, 50%)`,
    value: isSpecial ? 5 : 1,
    type: isSpecial ? 'special' : 'normal',
    pulsePhase: 0
  };
};

export const createInitialSnake = (isBot: boolean = false, name: string = ''): Snake => {
  const startX = Math.random() * (CANVAS_WIDTH * 0.8) + (CANVAS_WIDTH * 0.1);
  const startY = Math.random() * (CANVAS_HEIGHT * 0.8) + (CANVAS_HEIGHT * 0.1);
  const points = Array(INITIAL_SNAKE_LENGTH).fill(null).map(() => ({
    x: startX,
    y: startY
  }));
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    points,
    angle: Math.random() * Math.PI * 2,
    length: INITIAL_SNAKE_LENGTH,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    speed: isBot ? 1.5 : 2,
    isBot,
    isDead: false,
    name: name || (isBot ? `Bot ${Math.floor(Math.random() * 1000)}` : 'Player'),
    abilities: {
      boost: createAbility('Boost', 5000, 10, '⚡'),
      shield: createAbility('Shield', 10000, 20, '🛡️'),
      ghost: createAbility('Ghost', 15000, 30, '👻')
    },
    activeEffects: {}
  };
};