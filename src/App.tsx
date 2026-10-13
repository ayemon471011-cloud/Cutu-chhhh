import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameState, GameScore } from './types/game';
import { GameHUD } from './components/GameHUD';
import { MobileControls } from './components/MobileControls';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { PauseModal } from './components/PauseModal';
import { soundManager } from './utils/audio';

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

  const isPlayingOrRecovering = gameState === 'PLAYING' || gameState === 'PLAYER_RECOVERING';
  const isKissing = gameState === 'KISS_ANIMATION' || gameState === 'PLAYER_CAPTURED';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FFF5F7] flex items-center justify-center select-none font-['Fredoka',sans-serif]">
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer touch-none"
        tabIndex={0}
      />

      {/* Sweet Kiss sequence overlay flash */}
      {isKissing && (
        <div className="absolute inset-0 pointer-events-none z-15 bg-pink-500/10 backdrop-blur-[1px] animate-pulse" />
      )}

      {/* In-Game HUD */}
      {(isPlayingOrRecovering || isKissing || gameState === 'PAUSED') && (
        <GameHUD
          scoreData={scoreData}
          chaseDistance={chaseDistance}
          isMuted={isMuted}
          isPaused={gameState === 'PAUSED'}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
        />
      )}

      {/* Mobile Touch Controls */}
      {isPlayingOrRecovering && (
        <MobileControls
          onJump={handleJump}
          onSlideStart={handleSlideStart}
          onSlideEnd={handleSlideEnd}
        />
      )}

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
  );
}
