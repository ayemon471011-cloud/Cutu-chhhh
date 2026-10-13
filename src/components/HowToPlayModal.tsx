import React from 'react';
import { X, ArrowUp, ArrowDown, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm pointer-events-auto select-none animate-fade-in">
      <div className="bg-white rounded-3xl border-4 border-amber-200 shadow-2xl p-6 md:p-7 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playButton();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">
            📖
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-stone-800">How to Play</h2>
            <p className="text-xs font-semibold text-stone-500">Run, Dodge & Escape the Kisses!</p>
          </div>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-stone-700">
          {/* Characters */}
          <div className="bg-gradient-to-r from-amber-50 to-pink-50 p-3.5 rounded-2xl border border-amber-100">
            <div className="font-extrabold text-stone-800 mb-1 flex items-center gap-1.5">
              <span>💛 Yellow Cutu (Player)</span>
              <span className="text-stone-400">&</span>
              <span>🤍 White Cutu (Chaser)</span>
            </div>
            <p className="text-stone-600 leading-relaxed text-xs">
              You play as the nervous Yellow Cutu in the cute duck suit! White Cutu is chasing you with endless love.
              Survive as long as you can!
            </p>
          </div>

          {/* Controls */}
          <div>
            <div className="font-extrabold text-stone-800 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Controls</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center mb-1 shadow-sm">
                  <ArrowUp className="w-5 h-5" />
                </div>
                <div className="font-black text-rose-700">JUMP</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Space, Up Arrow, or Tap Jump</div>
                <div className="text-[10px] text-rose-600 font-bold mt-1">Dodge ground veggies!</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mb-1 shadow-sm">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <div className="font-black text-amber-800">SLIDE / DUCK</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Down Arrow or Tap Slide</div>
                <div className="text-[10px] text-amber-700 font-bold mt-1">Pass under hanging baskets!</div>
              </div>
            </div>
          </div>

          {/* Vegetables & Rules */}
          <div>
            <div className="font-extrabold text-stone-800 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Vegetables & Obstacles</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-xs">
              <li>
                <span className="font-bold text-stone-700">Carrots, Pumpkins, Broccoli, Tomatoes:</span> Watch out for rolling and flying veggies!
              </li>
              <li>
                <span className="font-bold text-stone-700">Overhead Baskets:</span> Too high to jump! Slide underneath to slip through safely.
              </li>
              <li>
                <span className="font-bold text-stone-700">Chase Distance:</span> Every obstacle hit trips you and brings the chaser closer!
              </li>
            </ul>
          </div>

          {/* Kiss GameOver */}
          <div className="bg-pink-50 border border-pink-200 p-3 rounded-2xl flex items-center gap-3">
            <div className="text-2xl">💋</div>
            <div className="text-xs text-rose-700">
              <span className="font-black">The Kiss Penalty:</span> If the chase distance drops to zero, White Cutu will catch you in a tight hug and plant lots of cute cheek kisses!
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playButton();
            onClose();
          }}
          className="mt-5 w-full py-3 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-white font-black rounded-2xl shadow-md active:scale-95 transition cursor-pointer"
        >
          GOT IT, LET&apos;S RUN! 🏃
        </button>
      </div>
    </div>
  );
};
