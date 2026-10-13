import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameState, GameScore } from './types/game';
import { MobileControls } from './components/MobileControls';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PauseModal } from './components/PauseModal';
import { soundManager } from './utils/audio';
import {
  Smartphone,
  Monitor,
  Wifi,
  BatteryCharging,
  Signal,
  Heart,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CHASE_SYSTEM } from './game/constants';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [scoreData, setScoreData] = useState<GameScore>({
    score: 0,
    survivalTime: 0,
    vegetablesDodged: 0,
    level: 1,
    highScore: 0,
    bestTime: 0,
  });
  const [chaseDistance, setChaseDistance] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Phone Frame toggle for desktop users (defaults to true on wide desktop screens)
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return true;
  });

  // Current time for Android status bar
  const [currentTime, setCurrentTime] = useState<string>('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStateChange: (newState) => {
        setGameState(newState);
      },
      onScoreUpdate: (newScore, newChaseDist) => {
        setScoreData(newScore);
        setChaseDistance(newChaseDist);
      },
    });

    engineRef.current = engine;
    setScoreData(engine.getScoreData());

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // When toggling phone frame, re-trigger engine resize
  const togglePhoneFrame = () => {
    setIsPhoneFrame((prev) => !prev);
    setTimeout(() => {
      engineRef.current?.handleResize();
    }, 60);
  };

  const handleStartGame = () => {
    engineRef.current?.startGame();
  };

  const handleToggleMute = () => {
    const nextMute = soundManager.toggleMute();
    setIsMuted(nextMute);
  };

  const handleTogglePause = () => {
    if (gameState === 'PLAYING' || gameState === 'PLAYER_RECOVERING') {
      engineRef.current?.pauseGame();
    } else if (gameState === 'PAUSED') {
      engineRef.current?.resumeGame();
    }
  };

  const handleRestart = () => {
    engineRef.current?.restartGame();
  };

  const handleMainMenu = () => {
    engineRef.current?.returnToMenu();
  };

  const handleJump = () => {
    engineRef.current?.triggerJump();
  };

  const handleSlideStart = () => {
    engineRef.current?.startSlide();
  };

  const handleSlideEnd = () => {
    engineRef.current?.stopSlide();
  };

  const handleNudgeLeft = () => {
    engineRef.current?.nudgeLeft();
  };

  const handleNudgeRight = () => {
    engineRef.current?.nudgeRight();
  };

  // Touch Swipe & Tap Gestures directly on gameplay screen
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    touchStartX.current = touch.clientX;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gameState !== 'PLAYING' && gameState !== 'PLAYER_RECOVERING') return;

    const touch = e.changedTouches[0];
    const dy = touch.clientY - touchStartY.current;
    const dx = touch.clientX - touchStartX.current;
    const dt = Date.now() - touchStartTime.current;

    // Vertical swipe recognition:
    if (Math.abs(dy) > 30 && dt < 450) {
      if (dy < 0) {
        // Swipe UP -> Jump!
        handleJump();
        return;
      } else {
        // Swipe DOWN -> Slide!
        handleSlideStart();
        setTimeout(() => handleSlideEnd(), 550);
        return;
      }
    }

    // Quick tap on gameplay screen
    if (Math.abs(dy) < 18 && Math.abs(dx) < 18 && dt < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = touch.clientX - rect.left;
      if (relativeX > rect.width * 0.45) {
        handleJump();
      } else {
        handleSlideStart();
        setTimeout(() => handleSlideEnd(), 550);
      }
    }
  };

  const isPlayingOrRecovering = gameState === 'PLAYING' || gameState === 'PLAYER_RECOVERING';
  const isKissing = gameState === 'KISS_ANIMATION' || gameState === 'PLAYER_CAPTURED';
  const isDanger = chaseDistance <= CHASE_SYSTEM.dangerThreshold;

  // Format survival time to mm:ss
  const minutes = Math.floor(scoreData.survivalTime / 60);
  const seconds = scoreData.survivalTime % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#24141B] flex flex-col items-center justify-center select-none font-['Fredoka',sans-serif]">
      {/* Desktop View Switcher Header (Discreet top bar on wide desktop screens) */}
      <div className="hidden sm:flex absolute top-3 z-50 items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-200/80 shadow-md text-xs font-bold text-stone-700">
        <span>View:</span>
        <button
          onClick={togglePhoneFrame}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            isPhoneFrame
              ? 'bg-rose-500 text-white font-extrabold shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Phone</span>
        </button>
        <button
          onClick={togglePhoneFrame}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            !isPhoneFrame
              ? 'bg-rose-500 text-white font-extrabold shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Expand</span>
        </button>
      </div>

      {/* Main Android Phone View Container */}
      <div
        className={`relative overflow-hidden transition-all duration-300 flex flex-col justify-between items-center ${
          isPhoneFrame
            ? 'w-full max-w-[420px] h-full sm:h-[95vh] max-h-[920px] sm:rounded-[48px] sm:border-[9px] sm:border-stone-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] bg-gradient-to-b from-[#FFF0F4] via-[#FFF9FA] to-[#FFEBF2]'
            : 'w-full h-full bg-gradient-to-b from-[#FFF0F4] via-[#FFF9FA] to-[#FFEBF2]'
        }`}
      >
        {/* ======================================================== */}
        {/* SECTION 1: TOP AREA (Android Status Bar & App Header)    */}
        {/* ======================================================== */}
        <div className="w-full flex-none flex flex-col z-20">
          {/* Android Punch-hole Camera Cutout */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-stone-900 border border-stone-800 z-50 shadow-inner hidden sm:block" />

          {/* Android Status Bar (Time, Signal, WiFi, Battery) */}
          <div className="w-full h-8 px-5 pt-1.5 flex items-center justify-between text-stone-800 text-[11px] font-bold select-none pointer-events-none">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-rose-500">5G</span>
              <Signal className="w-3 h-3 fill-current" />
              <Wifi className="w-3 h-3" />
              <BatteryCharging className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          {/* Cute App Header (Title, Sound & Pause Buttons) */}
          <div className="w-full px-3.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">❤️</span>
              <div>
                <h1 className="text-sm font-black text-[#2C1E19] leading-tight tracking-tight">
                  CATCH MY CUTU
                </h1>
                <div className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">
                  2D Endless Runner
                </div>
              </div>
            </div>

            {/* Quick In-Game Audio & Pause Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleMute}
                className="w-8 h-8 rounded-xl bg-white/90 border border-pink-200 shadow-sm flex items-center justify-center text-stone-700 active:scale-90 hover:bg-stone-50 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                )}
              </button>
              <button
                onClick={handleTogglePause}
                className="w-8 h-8 rounded-xl bg-white/90 border border-pink-200 shadow-sm flex items-center justify-center text-stone-700 active:scale-90 hover:bg-stone-50 cursor-pointer"
                title={gameState === 'PAUSED' ? 'Resume' : 'Pause'}
              >
                {gameState === 'PAUSED' ? (
                  <Play className="w-4 h-4 fill-current text-emerald-600" />
                ) : (
                  <Pause className="w-4 h-4 text-stone-700" />
                )}
              </button>
            </div>
          </div>

          {/* Chaser Proximity Tracker Bar */}
          <div className="w-full px-3.5 pb-1">
            <div
              className={`rounded-xl p-1.5 px-2.5 border shadow-sm transition-colors ${
                isDanger
                  ? 'border-rose-400 bg-rose-50/95 animate-pulse'
                  : 'border-pink-200/90 bg-white/90'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="flex items-center gap-1 text-rose-600">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>Chaser Distance</span>
                </span>
                <span
                  className={`text-[10px] font-extrabold ${
                    isDanger ? 'text-rose-600' : 'text-stone-500'
                  }`}
                >
                  {isDanger ? '⚠️ CUTU IS TOO CLOSE!' : `${Math.round(chaseDistance)}% Safe`}
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    isDanger
                      ? 'bg-gradient-to-r from-red-500 to-rose-400'
                      : 'bg-gradient-to-r from-rose-400 via-pink-400 to-emerald-400'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, chaseDistance))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: MIDDLE AREA - THE GAMEPLAY SCREEN!             */}
        {/* (Placed firmly in the middle of the screen of the phone) */}
        {/* ======================================================== */}
        <div className="w-full flex-1 flex flex-col items-center justify-center px-3 my-auto z-10">
          {/* Middle Gameplay Screen Frame */}
          <div
            className="w-full aspect-[1000/560] max-h-[340px] rounded-2xl border-[3.5px] border-rose-300 shadow-[0_10px_30px_-5px_rgba(244,63,94,0.3)] overflow-hidden relative bg-[#82CCDD]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Main Game Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-pointer touch-none"
              tabIndex={0}
            />

            {/* In-Game Mini HUD Overlay (Score, Time, Level) */}
            {(isPlayingOrRecovering || isKissing || gameState === 'PAUSED') && (
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-15">
                <div className="flex items-center gap-1.5">
                  {/* Score */}
                  <div className="bg-white/90 backdrop-blur-md border border-[#FFE153] shadow-sm rounded-xl px-2.5 py-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <div>
                      <div className="text-[8px] text-stone-500 font-bold uppercase leading-none">
                        Score
                      </div>
                      <div className="text-xs font-black text-stone-800 leading-tight">
                        {scoreData.score.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="bg-white/90 backdrop-blur-md border border-pink-200 shadow-sm rounded-xl px-2.5 py-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-500" />
                    <div>
                      <div className="text-[8px] text-stone-500 font-bold uppercase leading-none">
                        Time
                      </div>
                      <div className="text-xs font-black text-rose-600 leading-tight">
                        {timeFormatted}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level / Dodged Badge */}
                <div className="bg-white/90 backdrop-blur-md border border-emerald-200 shadow-sm rounded-xl px-2 py-1 text-[10px] font-black text-emerald-700">
                  🥕 {scoreData.vegetablesDodged}
                </div>
              </div>
            )}

            {/* Sweet Kiss sequence overlay flash */}
            {isKissing && (
              <div className="absolute inset-0 pointer-events-none z-20 bg-pink-500/10 backdrop-blur-[1px] animate-pulse flex items-center justify-center">
                <span className="text-3xl animate-bounce">💋</span>
              </div>
            )}

            {/* On-Screen Touch Gestures Hint */}
            {isPlayingOrRecovering && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/80 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full pointer-events-none">
                Tap or Swipe Up: Jump • Swipe Down: Slide
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: BOTTOM AREA (Phone Gamepad Controls)          */}
        {/* ======================================================== */}
        <div className="w-full flex-none flex flex-col items-center justify-end z-20 pb-2">
          {/* Dedicated Phone Game Controller Buttons */}
          <MobileControls
            onJump={handleJump}
            onSlideStart={handleSlideStart}
            onSlideEnd={handleSlideEnd}
            onNudgeLeft={handleNudgeLeft}
            onNudgeRight={handleNudgeRight}
          />

          {/* Android Home Navigation Bar */}
          <div className="w-32 h-1 bg-stone-400/80 rounded-full my-1.5 pointer-events-none" />
        </div>

        {/* ======================================================== */}
        {/* MODALS & OVERLAYS                                        */}
        {/* ======================================================== */}
        {/* Main Menu */}
        {gameState === 'MENU' && (
          <MainMenu
            onStartGame={handleStartGame}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            highScore={scoreData.highScore}
            bestTime={scoreData.bestTime}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={() => engineRef.current?.resumeGame()}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Game Over Modal (Shows after Kiss animation finishes) */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            scoreData={scoreData}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
          />
        )}

        {/* How To Play Modal */}
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}
      </div>
    </div>
  );
}
