import {
  GameState,
  RunnerAction,
  ChaserAction,
  Obstacle,
  ObstacleType,
  Rect,
  GameScore,
} from '../types/game';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  GROUND_Y,
  RUNNER_CONFIG,
  CHASER_CONFIG,
  CHASE_SYSTEM,
  DIFFICULTY_LEVELS,
} from './constants';
import { drawRunner, drawChaser, drawOriginalKissAnimation, drawCaughtBeatAnimation } from './characterRenderer';
import { drawObstacle, getObstacleHitbox, checkCollision } from './obstacles';
import { ParticleSystem } from './particles';
import { BackgroundRenderer } from './background';
import { soundManager } from '../utils/audio';

export class GameEngine {
  // Canvas & Context
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Render scale & offsets
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private virtualWidth: number = VIRTUAL_WIDTH;
  private virtualHeight: number = VIRTUAL_HEIGHT;
  private groundY: number = GROUND_Y;
  private isPortraitMode: boolean = false;

  // State
  private state: GameState = 'MENU';
  private animTime: number = 0;
  private lastTimestamp: number = 0;
  private animFrameId: number | null = null;

  // Systems
  private particles: ParticleSystem;
  private background: BackgroundRenderer;

  // Player (Runner - Yellow Cutu)
  private runnerX: number = RUNNER_CONFIG.baseX;
  private runnerY: number = GROUND_Y - RUNNER_CONFIG.height / 2;
  private runnerVy: number = 0;
  private isGrounded: boolean = true;
  private runnerAction: RunnerAction = 'IDLE';
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private targetRunnerXOffset: number = 0;
  private currentRunnerXOffset: number = 0;
  private invulnerableTimer: number = 0;
  private blushIntensity: number = 0;

  // Chaser (White Cutu)
  private chaseDistance: number = CHASE_SYSTEM.initialDistance; // 0 to 100
  private chaserX: number = 180;
  private chaserY: number = GROUND_Y - CHASER_CONFIG.height / 2;
  private chaserAction: ChaserAction = 'IDLE';
  private kissTimer: number = 0;
  private lastSmoochTime: number = 0;
  private lastSpankBeatIndex: number = -1;

  // Obstacles
  private obstacles: Obstacle[] = [];
  private nextObstacleId: number = 1;
  private timeSinceLastSpawn: number = 0;
  private currentSpawnInterval: number = 2.5;
  private scrollOffset: number = 0;

  // Difficulty & Score
  private currentLevelIndex: number = 0;
  private score: number = 0;
  private survivalTime: number = 0;
  private vegetablesDodged: number = 0;
  private highScore: number = 0;
  private bestTime: number = 0;

  // Controls state
  private keysPressed: { [key: string]: boolean } = {};

  // Callback to inform React UI of updates
  private onStateChange?: (state: GameState) => void;
  private onScoreUpdate?: (scoreData: GameScore, chaseDist: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    callbacks?: {
      onStateChange?: (state: GameState) => void;
      onScoreUpdate?: (scoreData: GameScore, chaseDist: number) => void;
    }
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    this.onStateChange = callbacks?.onStateChange;
    this.onScoreUpdate = callbacks?.onScoreUpdate;

    this.particles = new ParticleSystem();
    this.background = new BackgroundRenderer();

    // Load saved high score
    const savedScore = localStorage.getItem('cutu_high_score');
    if (savedScore) this.highScore = parseInt(savedScore, 10) || 0;
    const savedTime = localStorage.getItem('cutu_best_time');
    if (savedTime) this.bestTime = parseFloat(savedTime) || 0;

    this.bindEvents();
    this.handleResize();
    this.startLoop();
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public destroy() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundManager.stopBGM();
  }

  public handleResize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    // Gameplay canvas always uses the canonical 1000 x 560 virtual coordinate space
    this.virtualWidth = VIRTUAL_WIDTH;
    this.virtualHeight = VIRTUAL_HEIGHT;
    this.groundY = GROUND_Y;

    // Scale canvas to fit virtual width & height with letterboxing if necessary
    const scaleX = this.canvas.width / this.virtualWidth;
    const scaleY = this.canvas.height / this.virtualHeight;
    this.scale = Math.min(scaleX, scaleY);
    this.offsetX = Math.round((this.canvas.width - this.virtualWidth * this.scale) / 2);
    this.offsetY = Math.round((this.canvas.height - this.virtualHeight * this.scale) / 2);

    const baseX = this.getBaseRunnerX();
    if (this.state === 'MENU') {
      this.runnerX = baseX + 50;
      this.chaserX = baseX - 70;
      this.runnerY = this.groundY - RUNNER_CONFIG.height / 2;
      this.chaserY = this.groundY - CHASER_CONFIG.height / 2;
    } else if (this.isGrounded) {
      this.runnerY = this.groundY - RUNNER_CONFIG.height / 2;
      this.chaserY = this.groundY - CHASER_CONFIG.height / 2;
    }
  };

  public getBaseRunnerX(): number {
    return this.virtualWidth * 0.42;
  }

  public nudgeLeft() {
    if (this.state !== 'PLAYING' && this.state !== 'PLAYER_RECOVERING') return;
    this.targetRunnerXOffset = -55;
    setTimeout(() => {
      this.targetRunnerXOffset = 0;
    }, 280);
  }

  public nudgeRight() {
    if (this.state !== 'PLAYING' && this.state !== 'PLAYER_RECOVERING') return;
    this.targetRunnerXOffset = 55;
    setTimeout(() => {
      this.targetRunnerXOffset = 0;
    }, 280);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    this.keysPressed[e.code] = true;

    if (this.state === 'PLAYING' || this.state === 'PLAYER_RECOVERING') {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.triggerJump();
      } else if (e.code === 'ArrowDown') {
        this.startSlide();
      }
    } else if (this.state === 'MENU' && (e.code === 'Space' || e.code === 'Enter')) {
      this.startGame();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
    if (e.code === 'ArrowDown') {
      this.stopSlide();
    }
  };

  private handleBlur = () => {
    this.keysPressed = {};
    if (this.state === 'PLAYING') {
      this.pauseGame();
    }
  };

  // Mobile / UI Control Hooks
  public triggerJump() {
    if (this.state !== 'PLAYING' && this.state !== 'PLAYER_RECOVERING') return;
    if (this.isGrounded) {
      this.runnerVy = RUNNER_CONFIG.jumpSpeed;
      this.isGrounded = false;
      this.runnerAction = 'JUMP';
      if (this.isSliding) this.stopSlide();
      this.particles.addDust(this.runnerX, GROUND_Y, 4);
      soundManager.playJump();
    }
  }

  public startSlide() {
    if (this.state !== 'PLAYING' && this.state !== 'PLAYER_RECOVERING') return;
    if (this.isGrounded && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.65;
      this.runnerAction = 'SLIDE';
      this.particles.addDust(this.runnerX, GROUND_Y, 3);
      soundManager.playSlide();
    }
  }

  public stopSlide() {
    if (this.isSliding) {
      this.isSliding = false;
      this.slideTimer = 0;
      if (this.isGrounded) {
        this.runnerAction = 'RUN';
      }
    }
  }

  public startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.survivalTime = 0;
    this.vegetablesDodged = 0;
    this.currentLevelIndex = 0;
    this.chaseDistance = CHASE_SYSTEM.initialDistance;
    this.obstacles = [];
    this.particles.clear();
    this.runnerVy = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.runnerAction = 'RUN';
    this.chaserAction = 'RUN';
    this.invulnerableTimer = 0;
    this.blushIntensity = 0;
    this.kissTimer = 0;
    this.timeSinceLastSpawn = 0;
    this.targetRunnerXOffset = 0;
    this.currentRunnerXOffset = 0;

    const baseX = this.getBaseRunnerX();
    this.runnerX = baseX;
    this.runnerY = this.groundY - RUNNER_CONFIG.height / 2;
    this.chaserX = baseX - 180;
    this.chaserY = this.groundY - CHASER_CONFIG.height / 2;

    soundManager.startBGM();
    if (this.onStateChange) this.onStateChange(this.state);
  }

  public pauseGame() {
    if (this.state === 'PLAYING' || this.state === 'PLAYER_RECOVERING') {
      this.state = 'PAUSED';
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public restartGame() {
    this.startGame();
  }

  public returnToMenu() {
    this.state = 'MENU';
    this.obstacles = [];
    this.particles.clear();
    this.runnerAction = 'IDLE';
    this.chaserAction = 'IDLE';
    this.chaseDistance = CHASE_SYSTEM.initialDistance;
    this.blushIntensity = 0;
    soundManager.stopBGM();
    if (this.onStateChange) this.onStateChange(this.state);
  }

  public getState(): GameState {
    return this.state;
  }

  public getScoreData(): GameScore {
    return {
      score: Math.floor(this.score),
      survivalTime: Math.floor(this.survivalTime),
      vegetablesDodged: this.vegetablesDodged,
      level: this.currentLevelIndex + 1,
      highScore: this.highScore,
      bestTime: this.bestTime,
    };
  }

  public getChaseDistance(): number {
    return this.chaseDistance;
  }

  // Core Game Loop
  private startLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const rawDt = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;
      // Clamp delta time to avoid large physics steps on tab focus
      const dt = Math.min(rawDt, 0.08);

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private update(dt: number) {
    this.animTime += dt;

    if (this.state === 'MENU') {
      this.runnerAction = 'IDLE';
      this.chaserAction = 'IDLE';
      const baseX = this.getBaseRunnerX();
      this.runnerX = baseX + (this.isPortraitMode ? 35 : 50);
      this.chaserX = baseX - (this.isPortraitMode ? 45 : 70);
      this.runnerY = this.groundY - RUNNER_CONFIG.height / 2;
      this.chaserY = this.groundY - CHASER_CONFIG.height / 2;
      this.background.update(dt, 60, this.virtualWidth);
      this.particles.update(dt);
      return;
    }

    if (this.state === 'PAUSED') {
      return;
    }

    const currentDiff = DIFFICULTY_LEVELS[this.currentLevelIndex];

    if (this.state === 'PLAYING' || this.state === 'PLAYER_RECOVERING') {
      // 1. UPDATE TIMER & DIFFICULTY
      this.survivalTime += dt;
      this.score += dt * 15 * (this.currentLevelIndex + 1);

      // Level progression every 25 seconds or based on score
      if (this.score > 1200 && this.currentLevelIndex < 4) {
        this.currentLevelIndex = 4;
      } else if (this.score > 800 && this.currentLevelIndex < 3) {
        this.currentLevelIndex = 3;
      } else if (this.score > 450 && this.currentLevelIndex < 2) {
        this.currentLevelIndex = 2;
      } else if (this.score > 180 && this.currentLevelIndex < 1) {
        this.currentLevelIndex = 1;
      }

      // 2. PARALLAX SCROLLING
      this.scrollOffset += currentDiff.scrollSpeed * dt;
      this.background.update(dt, currentDiff.scrollSpeed, this.virtualWidth);

      // 3. HORIZONTAL NUDGE (Player left/right arrows)
      let nudge = 0;
      if (this.keysPressed['ArrowLeft']) nudge -= 50;
      if (this.keysPressed['ArrowRight']) nudge += 50;
      this.targetRunnerXOffset = nudge;
      this.currentRunnerXOffset += (this.targetRunnerXOffset - this.currentRunnerXOffset) * dt * 6;
      this.runnerX = this.getBaseRunnerX() + this.currentRunnerXOffset;

      // 4. PLAYER VERTICAL PHYSICS
      if (!this.isGrounded) {
        this.runnerVy += RUNNER_CONFIG.gravity * dt;
        if (this.runnerVy > RUNNER_CONFIG.maxFallSpeed) {
          this.runnerVy = RUNNER_CONFIG.maxFallSpeed;
        }
        this.runnerY += this.runnerVy * dt;

        // Ground check
        const targetGroundY = this.groundY - RUNNER_CONFIG.height / 2;
        if (this.runnerY >= targetGroundY) {
          this.runnerY = targetGroundY;
          this.runnerVy = 0;
          this.isGrounded = true;
          this.runnerAction = this.isSliding ? 'SLIDE' : 'RUN';
          this.particles.addDust(this.runnerX, this.groundY, 3);
          soundManager.playLand();
        } else {
          this.runnerAction = this.runnerVy < 0 ? 'JUMP' : 'FALL';
        }
      }

      // 5. SLIDE TIMER (Auto cancel after slide timeout)
      if (this.isSliding) {
        this.slideTimer -= dt;
        if (this.slideTimer <= 0 && !this.keysPressed['ArrowDown']) {
          this.stopSlide();
        }
      }

      // 6. INVULNERABILITY TIMER
      if (this.state === 'PLAYER_RECOVERING') {
        this.invulnerableTimer -= dt;
        if (this.invulnerableTimer <= 0) {
          this.state = 'PLAYING';
          if (this.onStateChange) this.onStateChange(this.state);
        }
      }

      // 7. CHASE DISTANCE SYSTEM
      // Smooth recovery during uninterrupted running
      this.chaseDistance = Math.min(
        CHASE_SYSTEM.maxDistance,
        this.chaseDistance + currentDiff.chaseRecoveryRate * dt
      );

      // Calculate dynamic chaser X position based on chase distance
      const distanceFraction = Math.max(0, Math.min(1, this.chaseDistance / CHASE_SYSTEM.maxDistance));
      const targetChaserX =
        this.runnerX -
        (CHASER_CONFIG.minXOffset + distanceFraction * (CHASER_CONFIG.maxXOffset - CHASER_CONFIG.minXOffset));
      this.chaserX += (targetChaserX - this.chaserX) * dt * 5;
      this.chaserY = this.groundY - CHASER_CONFIG.height / 2;
      this.chaserAction = 'RUN';

      // Dust particles while running
      if (this.isGrounded && Math.random() < 0.25) {
        this.particles.addDust(this.runnerX - 25, this.groundY);
      }
      if (Math.random() < 0.28) {
        this.particles.addDust(this.chaserX - 28, this.groundY);
      }

      // 8. PROCEDURAL OBSTACLE SPAWNING
      this.timeSinceLastSpawn += dt;
      if (this.timeSinceLastSpawn >= this.currentSpawnInterval) {
        this.spawnObstacle(currentDiff);
        this.timeSinceLastSpawn = 0;
        this.currentSpawnInterval =
          currentDiff.minSpawnInterval +
          Math.random() * (currentDiff.maxSpawnInterval - currentDiff.minSpawnInterval);
      }

      // 9. UPDATE OBSTACLES & COLLISIONS
      this.updateObstacles(dt, currentDiff.scrollSpeed);

      // Inform HUD
      if (this.onScoreUpdate) {
        this.onScoreUpdate(this.getScoreData(), this.chaseDistance);
      }
    } else if (this.state === 'PLAYER_CAPTURED') {
      // Transitioning smoothly into the original snug embrace and kiss sequence
      this.background.update(dt, 0); // scenery stops

      // Smoothly bring runner down to ground if captured while airborne
      const targetGroundY = this.groundY - RUNNER_CONFIG.height / 2;
      if (this.runnerY < targetGroundY) {
        this.runnerY += (targetGroundY - this.runnerY) * Math.min(1, dt * 10);
      } else {
        this.runnerY = targetGroundY;
      }

      // Ensure horizontal position is comfortably placed on screen
      this.runnerX = Math.max(220, Math.min(this.virtualWidth - 220, this.runnerX));

      // White Cutu glides right into Yellow Cutu for the loving embrace
      const targetCaptureX = this.runnerX - 22;
      this.chaserX += (targetCaptureX - this.chaserX) * dt * 7;
      this.chaserY = this.groundY - CHASER_CONFIG.height / 2;
      this.runnerAction = 'CAPTURED';
      this.chaserAction = 'CATCH';

      if (Math.abs(this.chaserX - targetCaptureX) < 14) {
        this.state = 'KISS_ANIMATION';
        this.kissTimer = 0;
        this.lastSmoochTime = 0;
        soundManager.playKissSmooch();
        this.particles.addHeart(this.runnerX - 5, this.runnerY - 15, 6);
        this.particles.addKissText(this.runnerX, this.runnerY - 45, 'MWAH! 💋');
        if (this.onStateChange) this.onStateChange(this.state);
      }
    } else if (this.state === 'KISS_ANIMATION') {
      this.kissTimer += dt;
      this.background.update(dt, 0);

      // Keep characters firmly anchored on the ground ("placed accordingly")
      this.runnerY = this.groundY - RUNNER_CONFIG.height / 2;
      this.chaserX = this.runnerX - 18;
      this.chaserY = this.groundY - CHASER_CONFIG.height / 2;

      // Periodic kisses every 0.55s!
      if (this.kissTimer - this.lastSmoochTime >= 0.55 && this.kissTimer < 2.6) {
        this.lastSmoochTime = this.kissTimer;
        soundManager.playKissSmooch();
        this.particles.addHeart(this.runnerX + (Math.random() - 0.5) * 20, this.runnerY - 20, 4);
        const phrases = ['MWAH! 💋', 'CHU! 💖', 'GOT YOU! 💛', 'LOVE YOU! 💕'];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.particles.addKissText(this.runnerX + (Math.random() - 0.5) * 15, this.runnerY - 45, phrase);
      }

      // After 2.8s of adorable original kiss animation, show Game Over screen!
      if (this.kissTimer >= 2.8) {
        this.state = 'GAME_OVER';
        // Save high score
        if (this.score > this.highScore) {
          this.highScore = Math.floor(this.score);
          localStorage.setItem('cutu_high_score', String(this.highScore));
        }
        if (this.survivalTime > this.bestTime) {
          this.bestTime = Math.floor(this.survivalTime);
          localStorage.setItem('cutu_best_time', String(this.bestTime));
        }
        if (this.onStateChange) this.onStateChange(this.state);
      }
    }

    this.particles.update(dt);
  }

  private spawnObstacle(currentDiff: (typeof DIFFICULTY_LEVELS)[0]) {
    // Check safety margin: don't spawn if another obstacle is too close to spawn edge
    if (this.obstacles.length > 0) {
      const lastObs = this.obstacles[this.obstacles.length - 1];
      if (lastObs.x > this.virtualWidth - (this.isPortraitMode ? 220 : 280)) return;
    }

    const roll = Math.random();
    let type: ObstacleType;
    let isFlying = false;
    let isOverhead = false;
    let width = 50;
    let height = 50;
    let y = this.groundY - height;

    if (roll < currentDiff.overheadChance) {
      // Overhead hanging obstacle (requires slide!)
      type = 'overhead_basket';
      isOverhead = true;
      width = 54;
      height = 70;
      // Position high enough so that sliding player (height 54px) passes safely underneath!
      y = this.groundY - RUNNER_CONFIG.slideHeight - height - 8;
    } else if (roll < currentDiff.overheadChance + currentDiff.flyingChance) {
      // Flying obstacle: either low glider (jumpable) or mid-air (slideable)
      const flyingTypes: ObstacleType[] = ['carrot_flying', 'tomato_spin', 'cucumber_flying'];
      type = flyingTypes[Math.floor(Math.random() * flyingTypes.length)];
      isFlying = true;
      width = 44;
      height = 44;
      const isLowGlider = Math.random() < 0.6;
      if (isLowGlider) {
        // Low flying vegetable - jump over it cleanly!
        y = this.groundY - 56;
      } else {
        // Mid-air flying vegetable - slide underneath it!
        y = this.groundY - 105;
      }
    } else {
      // Ground obstacle
      const groundTypes: ObstacleType[] = [
        'carrot_ground',
        'pumpkin_roll',
        'broccoli_bounce',
        'cucumber_ground',
        'eggplant_ground',
      ];
      type = groundTypes[Math.floor(Math.random() * groundTypes.length)];
      width = 48;
      height = type === 'pumpkin_roll' ? 44 : type === 'broccoli_bounce' ? 52 : 50;
      y = this.groundY - height;
    }

    this.obstacles.push({
      id: this.nextObstacleId++,
      type,
      x: this.virtualWidth + 60,
      y,
      width,
      height,
      baseY: y,
      isFlying,
      isOverhead,
      rotation: 0,
      rotationSpeed: type === 'pumpkin_roll' ? 4.5 : type === 'tomato_spin' ? 5 : 0,
      bounceOffset: 0,
      bounceSpeed: type === 'broccoli_bounce' ? 6 : 0,
      speedMultiplier: 1,
      passed: false,
    });
  }

  private updateObstacles(dt: number, scrollSpeed: number) {
    // Accurate dynamic player hitbox tracking actual runnerX and runnerY
    const isSliding = this.isSliding;
    const isAirborne = !this.isGrounded;

    // Fair horizontal width (centered on runnerX)
    const boxWidth = RUNNER_CONFIG.width * 0.5;

    // Vertical height tracking runnerY
    // When airborne (jumping/falling), character feet are tucked up cute for generous clearance!
    const boxHeight = isSliding
      ? RUNNER_CONFIG.slideHeight * 0.72
      : isAirborne
      ? RUNNER_CONFIG.height * 0.58
      : RUNNER_CONFIG.height * 0.75;

    // Center Y adjustment: when sliding, lower to ground; when airborne, tucked slightly up
    const centerYOffset = isSliding ? 14 : isAirborne ? -6 : 0;

    const playerHitbox: Rect = {
      x: this.runnerX - boxWidth / 2,
      y: (this.runnerY + centerYOffset) - boxHeight / 2,
      width: boxWidth,
      height: boxHeight,
    };

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= scrollSpeed * obs.speedMultiplier * dt;

      // Animated rotation/bounce
      if (obs.rotationSpeed !== 0) {
        obs.rotation += obs.rotationSpeed * dt;
      }
      if (obs.bounceSpeed !== 0) {
        obs.bounceOffset = Math.sin(this.animTime * obs.bounceSpeed) * 8;
        obs.y = obs.baseY + obs.bounceOffset;
      }

      // Check dodge score
      if (!obs.passed && obs.x + obs.width < this.runnerX + 15) {
        obs.passed = true;
        this.vegetablesDodged++;
        this.score += 25;
        this.particles.addSparkle(obs.x + 30, obs.y + 10, 2);
        soundManager.playScoreDodge();
      }

      // Collision detection with Yellow Cutu
      if (
        (this.state === 'PLAYING') &&
        !obs.passed
      ) {
        const obsHitbox = getObstacleHitbox(obs);

        // WHEN JUMPING OVER A VEGETABLE: Ensure ZERO damage!
        if (isAirborne && !obs.isOverhead) {
          // 1. Any ground vegetable (carrots, pumpkins, broccoli, cucumbers, eggplants):
          // As long as the player is in the air jumping over it, take ZERO damage!
          if (!obs.isFlying) {
            continue;
          }

          // 2. Flying vegetables:
          // If the player jumped and their feet or center are clearing the vegetable:
          const playerFeet = playerHitbox.y + playerHitbox.height;
          if (playerFeet <= obsHitbox.y + obsHitbox.height * 0.6 || this.runnerY < obs.y) {
            continue;
          }
        }

        // WHEN SLIDING UNDER AN OVERHEAD OBSTACLE: Ensure safe slide with ZERO damage!
        if (isSliding && obs.isOverhead) {
          continue;
        }

        // WHEN SLIDING UNDER HIGH FLYING VEGETABLES: Safe ducking with ZERO damage!
        if (isSliding && obs.isFlying && obs.y < this.groundY - 65) {
          continue;
        }

        if (checkCollision(playerHitbox, obsHitbox)) {
          this.handlePlayerHit(obs);
          break;
        }
      }

      // Remove offscreen
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private handlePlayerHit(obs: Obstacle) {
    soundManager.playHit();
    this.particles.addStars(this.runnerX, this.runnerY, 6);
    this.particles.addDust(this.runnerX, GROUND_Y, 4);

    // Apply penalty to chase distance
    this.chaseDistance = Math.max(0, this.chaseDistance - CHASE_SYSTEM.hitPenalty);

    // Check if chaser caught player!
    if (this.chaseDistance <= 0) {
      this.state = 'PLAYER_CAPTURED';
      soundManager.playCaughtAlert();
      this.runnerAction = 'HIT';
      this.chaserAction = 'REACH';
      if (this.onStateChange) this.onStateChange(this.state);
      return;
    }

    // Otherwise enter recovering state with invulnerability
    this.state = 'PLAYER_RECOVERING';
    this.invulnerableTimer = CHASE_SYSTEM.invulnerabilityDuration;
    this.runnerAction = 'HIT';

    // Temporary slight stumble
    setTimeout(() => {
      if (this.state === 'PLAYER_RECOVERING') {
        this.runnerAction = this.isSliding ? 'SLIDE' : 'RUN';
      }
    }, 450);

    if (this.onStateChange) this.onStateChange(this.state);
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Setup coordinate space: Virtual Width x Height scaled to fit canvas
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    // Clip to virtual boundaries for crisp presentation
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.virtualWidth, this.virtualHeight);
    this.ctx.clip();

    // 1. Draw Background
    this.background.draw(
      this.ctx,
      this.scrollOffset,
      this.animTime,
      this.virtualWidth,
      this.virtualHeight,
      this.groundY
    );

    // 2. Draw Obstacles
    if (this.state !== 'MENU') {
      for (const obs of this.obstacles) {
        drawObstacle(this.ctx, obs, this.animTime, this.groundY);
      }
    }

    // 3. Draw Characters
    if (this.state === 'KISS_ANIMATION') {
      // Draw the original signature kiss caught animation, placed accordingly!
      drawOriginalKissAnimation({
        ctx: this.ctx,
        x: this.runnerX,
        y: this.groundY - RUNNER_CONFIG.height / 2,
        animTime: this.animTime,
        kissTimer: this.kissTimer,
      });
    } else {
      // White Chaser follows behind Yellow Runner
      drawChaser({
        ctx: this.ctx,
        x: this.chaserX,
        y: this.chaserY,
        action: this.chaserAction,
        animTime: this.animTime,
        kissProgress: this.kissTimer / 2.8,
      });

      // Yellow Runner
      drawRunner({
        ctx: this.ctx,
        x: this.runnerX,
        y: this.runnerY,
        action: this.runnerAction,
        animTime: this.animTime,
        isInvulnerable: this.state === 'PLAYER_RECOVERING',
        blushIntensity: this.blushIntensity,
      });
    }

    // 4. Draw Particles on top
    this.particles.draw(this.ctx);

    this.ctx.restore();
  }
}
