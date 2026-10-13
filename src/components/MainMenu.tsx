import React from 'react';
import { Play, HelpCircle, Volume2, VolumeX, Trophy, Sparkles, Heart } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScore: number;
  bestTime: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHowToPlay,
  isMuted,
  onToggleMute,
  highScore,
  bestTime,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 pointer-events-auto select-none bg-gradient-to-b from-pink-50/70 via-transparent to-amber-50/70 backdrop-blur-[2px]">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-xl">
        {/* High Score Badge */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-amber-200 shadow-md">
          <Trophy className="w-4 h-4 text-amber-500" />
          <div className="text-xs font-bold text-stone-700">
            Best: <span className="font-black text-amber-600">{highScore}</span>
            {bestTime > 0 && <span className="text-stone-400 ml-1.5">({formatTime(bestTime)})</span>}
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            soundManager.playButton();
            onToggleMute();
          }}
          className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-pink-200 shadow-md text-stone-700 hover:bg-stone-50 active:scale-95 transition"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-stone-500">Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-stone-600">Sound ON</span>
            </>
          )}
        </button>
      </div>

      {/* Center Title & Hero Card */}
      <div className="flex flex-col items-center text-center max-w-lg my-auto">
        <div className="inline-flex items-center gap-1.5 bg-rose-100/90 text-rose-600 border border-rose-300 px-3.5 py-1 rounded-full text-xs font-extrabold mb-3 shadow-sm animate-bounce" style={{ animationDuration: '2s' }}>
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>CUTEST 2D RUNNER CHASE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1E19] tracking-tight leading-none drop-shadow-sm flex items-center justify-center gap-2">
          <span>CATCH MY</span>
          <span className="text-rose-500 relative">
            CUTU
            <span className="absolute -top-1 -right-6 text-2xl md:text-3xl animate-pulse">❤️</span>
          </span>
        </h1>

        <p className="mt-3 text-sm md:text-base font-semibold text-stone-600 max-w-md">
          Run, jump, slide... but don&apos;t get caught! 💛
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full max-w-xs justify-center">
          <button
            onClick={() => {
              soundManager.playButton();
              onStartGame();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-lg md:text-xl rounded-2xl shadow-xl hover:shadow-rose-300/50 active:scale-95 transition-all flex items-center justify-center gap-2.5 border-2 border-white cursor-pointer group"
          >
            <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
            <span>PLAY GAME</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onOpenHowToPlay();
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-white/95 hover:bg-stone-50 text-stone-700 font-extrabold text-sm md:text-base rounded-2xl shadow-md border-2 border-stone-200 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>

      {/* Footer Instructions Hint */}
      <div className="text-center text-xs font-semibold text-stone-500 flex items-center justify-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-stone-200/60 shadow-sm">
        <span>Controls: ⌨️ [Space / ↑] Jump • [↓] Slide • On-Screen Touch on Mobile</span>
      </div>
    </div>
  );
};
