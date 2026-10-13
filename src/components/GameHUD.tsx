import React from 'react';
import { GameScore } from '../types/game';
import { Volume2, VolumeX, Pause, Play, Heart, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { CHASE_SYSTEM } from '../game/constants';

interface GameHUDProps {
  scoreData: GameScore;
  chaseDistance: number; // 0 to 100
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  scoreData,
  chaseDistance,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
}) => {
  const isDanger = chaseDistance <= CHASE_SYSTEM.dangerThreshold;

  // Format survival time to mm:ss
  const minutes = Math.floor(scoreData.survivalTime / 60);
  const seconds = scoreData.survivalTime % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute top-0 left-0 right-0 p-3 md:p-5 pointer-events-none z-10 flex flex-col gap-2">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        {/* Score & Time badge */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md border-2 border-[#FFE153] shadow-md rounded-2xl px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
            <div>
              <div className="text-[10px] md:text-xs text-stone-500 font-bold uppercase tracking-wider">Score</div>
              <div className="text-base md:text-xl font-black text-stone-800 leading-tight">
                {scoreData.score.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border-2 border-pink-200 shadow-md rounded-2xl px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
            <div>
              <div className="text-[10px] md:text-xs text-stone-500 font-bold uppercase tracking-wider">Time</div>
              <div className="text-base md:text-xl font-black text-rose-600 leading-tight">
                {timeFormatted}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-md rounded-2xl px-3 py-1.5 md:px-4 md:py-2 items-center gap-1.5">
            <span className="text-xs font-bold text-emerald-700">Lvl {scoreData.level}</span>
          </div>
        </div>

        {/* Buttons (Pause & Sound) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onTogglePause}
            className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-stone-200 shadow-md flex items-center justify-center text-stone-700 active:scale-95 transition hover:bg-stone-50"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={onToggleMute}
            className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-stone-200 shadow-md flex items-center justify-center text-stone-700 active:scale-95 transition hover:bg-stone-50"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Chase Distance Bar */}
      <div className="w-full max-w-md mx-auto pointer-events-auto mt-1">
        <div
          className={`bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border-2 shadow-lg transition-colors ${
            isDanger ? 'border-rose-400 bg-rose-50/90 animate-pulse' : 'border-pink-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-rose-600">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-bounce" />
              <span>Chaser Distance</span>
            </span>
            <span className={`text-[11px] font-extrabold ${isDanger ? 'text-rose-600' : 'text-stone-500'}`}>
              {isDanger ? '⚠️ CUTU IS TOO CLOSE!' : `${Math.round(chaseDistance)}% Safe`}
            </span>
          </div>

          {/* Distance Track with Cutu Avatars */}
          <div className="relative w-full h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200 p-0.5">
            {/* Gradient Fill */}
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isDanger
                  ? 'bg-gradient-to-r from-red-500 to-rose-400'
                  : 'bg-gradient-to-r from-rose-400 via-pink-400 to-emerald-400'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, chaseDistance))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold mt-1 px-1">
            <span className="text-rose-600 flex items-center gap-0.5">
              <span>💋 Caught!</span>
            </span>
            <span className="text-emerald-600">🏃 Running Far</span>
          </div>
        </div>
      </div>
    </div>
  );
};
