export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PLAYER_HIT'
  | 'PLAYER_RECOVERING'
  | 'PLAYER_CAPTURED'
  | 'KISS_ANIMATION'
  | 'GAME_OVER'
  | 'PAUSED';

export type RunnerAction = 'RUN' | 'JUMP' | 'FALL' | 'SLIDE' | 'HIT' | 'CAPTURED' | 'IDLE';
export type ChaserAction = 'RUN' | 'JUMP' | 'REACH' | 'CATCH' | 'KISS' | 'IDLE';

export type ObstacleType =
  | 'carrot_ground'
  | 'carrot_flying'
  | 'pumpkin_roll'
  | 'broccoli_bounce'
  | 'tomato_spin'
  | 'cucumber_ground'
  | 'cucumber_flying'
  | 'eggplant_ground'
  | 'overhead_basket';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  baseY: number;
  isFlying: boolean;
  isOverhead: boolean;
  rotation: number;
  rotationSpeed: number;
  bounceOffset: number;
  bounceSpeed: number;
  speedMultiplier: number;
  passed: boolean;
}

export interface Particle {
  id: number;
  type: 'dust' | 'heart' | 'star' | 'sweat' | 'sparkle' | 'kiss_text';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color?: string;
  rotation?: number;
  rotationSpeed?: number;
  text?: string;
  scale?: number;
}

export interface GameScore {
  score: number;
  survivalTime: number; // in seconds
  vegetablesDodged: number;
  level: number;
  highScore: number;
  bestTime: number;
}

export interface DifficultyConfig {
  level: number;
  name: string;
  scrollSpeed: number;
  minSpawnInterval: number; // seconds
  maxSpawnInterval: number; // seconds
  flyingChance: number;
  overheadChance: number;
  chaseRecoveryRate: number; // distance units recovered per second
  chaseLossOnHit: number; // distance lost when hitting obstacle
}
