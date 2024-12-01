export interface Point {
  x: number;
  y: number;
}

export interface Ability {
  name: string;
  cooldown: number;
  lastUsed: number;
  requiredScore: number;
  icon: string;
}

export interface Snake {
  id: string;
  points: Point[];
  angle: number;
  length: number;
  color: string;
  speed: number;
  isBot: boolean;
  isDead?: boolean;
  name: string;
  abilities: {
    boost: Ability;
    shield: Ability;
    ghost: Ability;
  };
  activeEffects: {
    boosted?: boolean;
    shielded?: boolean;
    ghosted?: boolean;
  };
}

export interface Food {
  x: number;
  y: number;
  color: string;
  value: number;
  type: 'normal' | 'special';
  pulsePhase?: number;
}

export type GameState = 'menu' | 'playing' | 'dead';