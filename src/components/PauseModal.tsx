import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto select-none animate-fade-in">
      <div className="bg-white/95 rounded-3xl border-4 border-amber-200 shadow-2xl p-6 md:p-8 max-w-xs w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl font-black">
          ⏸️
        </div>

        <h2 className="text-2xl font-black text-stone-800 tracking-tight">GAME PAUSED</h2>
        <p className="text-xs text-stone-500 font-semibold mt-1 mb-6">Take a little breather! 💛</p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playButton();
              onResume();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onRestart();
            }}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold rounded-2xl shadow-sm active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onMainMenu();
            }}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold rounded-2xl shadow-sm active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-stone-500" />
            <span>MAIN MENU</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onToggleMute();
            }}
            className="w-full py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-xs">{isMuted ? 'UNMUTE SOUND' : 'MUTE SOUND'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
