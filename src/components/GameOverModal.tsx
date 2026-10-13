import React from 'react';
import { GameScore } from '../types/game';
import { RotateCcw, Home, Heart, Trophy, Clock, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  scoreData: GameScore;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  scoreData,
  onRestart,
  onMainMenu,
}) => {
  const isNewHighScore = scoreData.score >= scoreData.highScore && scoreData.score > 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto select-none">
      <div className="bg-white/95 rounded-3xl border-4 border-pink-200 shadow-2xl p-6 md:p-8 max-w-sm w-full text-center relative overflow-hidden">
        {/* Decorative Kiss Hearts at corners */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-pink-100 rounded-full flex items-end justify-start p-4 text-2xl">
          💋
        </div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-rose-100 rounded-full flex items-start justify-end p-4 text-2xl">
          ❤️
        </div>

        {/* Catch Headline */}
        <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-600 px-3.5 py-1 rounded-full text-xs font-black mb-2 animate-bounce">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>SMOOCHED & CAPTURED! 💋</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#2C1E19] leading-tight tracking-tight">
          CAUGHT BY MY CUTU! 💋
        </h2>
        <p className="text-stone-500 font-semibold text-xs md:text-sm mt-1">
          Too slow, little runaway! 💛
        </p>

        {/* Score & Stats Card */}
        <div className="mt-5 bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl p-4 border border-pink-100">
          {isNewHighScore && (
            <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-600 mb-2 bg-amber-100/80 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>NEW BEST RECORD!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-2.5 shadow-sm border border-stone-100">
              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Final Score</div>
              <div className="text-xl md:text-2xl font-black text-stone-800">
                {scoreData.score.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-xl p-2.5 shadow-sm border border-stone-100">
              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Survival Time</div>
              <div className="text-xl md:text-2xl font-black text-rose-600">
                {formatTime(scoreData.survivalTime)}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-around text-xs font-bold text-stone-600 pt-2 border-t border-pink-100">
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Best: {scoreData.highScore}
            </span>
            <span>Dodged: {scoreData.vegetablesDodged} 🥕</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playButton();
              onRestart();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-base rounded-2xl shadow-lg hover:shadow-rose-300/50 active:scale-95 transition flex items-center justify-center gap-2 border-2 border-white cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>TRY AGAIN 💗</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onMainMenu();
            }}
            className="w-full py-3 bg-white hover:bg-stone-50 text-stone-700 font-bold text-sm rounded-2xl shadow-sm border-2 border-stone-200 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
