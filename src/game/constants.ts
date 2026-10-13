import { DifficultyConfig } from '../types/game';

export const VIRTUAL_WIDTH = 1000;
export const VIRTUAL_HEIGHT = 560;
export const GROUND_Y = 440; // Ground surface Y coordinate

export const RUNNER_CONFIG = {
  width: 86,
  height: 98,
  slideHeight: 54,
  jumpSpeed: -720,
  gravity: 1600,
  maxFallSpeed: 850,
  baseX: 380, // Yellow runner stays comfortably positioned for great forward visibility
  speedBoostMax: 80,
};

export const CHASER_CONFIG = {
  width: 92,
  height: 102,
  minXOffset: 65, // When captured (kiss distance)
  maxXOffset: 340, // When far away
};

export const CHASE_SYSTEM = {
  maxDistance: 100, // 0 to 100%
  initialDistance: 75,
  hitPenalty: 28, // Distance lost on obstacle hit
  recoveryRate: 2.2, // Distance recovered per second during clean running
  dangerThreshold: 30, // Trigger danger heartbeat/pulse on HUD
  invulnerabilityDuration: 1.6, // Seconds of recovery grace after a hit
};

export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  {
    level: 1,
    name: 'Gentle Stroll 🌸',
    scrollSpeed: 340,
    minSpawnInterval: 2.2,
    maxSpawnInterval: 3.2,
    flyingChance: 0.15,
    overheadChance: 0.1,
    chaseRecoveryRate: 3.0,
    chaseLossOnHit: 22,
  },
  {
    level: 2,
    name: 'Cute Trot 🥕',
    scrollSpeed: 400,
    minSpawnInterval: 1.8,
    maxSpawnInterval: 2.6,
    flyingChance: 0.28,
    overheadChance: 0.2,
    chaseRecoveryRate: 2.5,
    chaseLossOnHit: 25,
  },
  {
    level: 3,
    name: 'Playful Scurry 💨',
    scrollSpeed: 460,
    minSpawnInterval: 1.5,
    maxSpawnInterval: 2.2,
    flyingChance: 0.38,
    overheadChance: 0.28,
    chaseRecoveryRate: 2.0,
    chaseLossOnHit: 28,
  },
  {
    level: 4,
    name: 'Energetic Dash 💖',
    scrollSpeed: 520,
    minSpawnInterval: 1.3,
    maxSpawnInterval: 1.9,
    flyingChance: 0.45,
    overheadChance: 0.32,
    chaseRecoveryRate: 1.6,
    chaseLossOnHit: 30,
  },
  {
    level: 5,
    name: 'Unstoppable Love Chase! 🚀',
    scrollSpeed: 590,
    minSpawnInterval: 1.1,
    maxSpawnInterval: 1.6,
    flyingChance: 0.5,
    overheadChance: 0.35,
    chaseRecoveryRate: 1.2,
    chaseLossOnHit: 34,
  },
];
