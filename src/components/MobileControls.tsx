import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onJump: () => void;
  onSlideStart: () => void;
  onSlideEnd: () => void;
  onNudgeLeft?: () => void;
  onNudgeRight?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onJump,
  onSlideStart,
  onSlideEnd,
  onNudgeLeft,
  onNudgeRight,
}) => {
  const triggerHaptic = (duration = 20) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch {
      // Ignore if not supported
    }
  };

  return (
    <div className="w-full px-3 py-2 flex items-center justify-between pointer-events-auto select-none gap-2">
      {/* Slide / Duck Button (Left thumb) */}
      <button
        type="button"
        onTouchStart={(e) => {
          e.preventDefault();
          triggerHaptic(25);
          onSlideStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onSlideEnd();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          triggerHaptic(20);
          onSlideStart();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          onSlideEnd();
        }}
        className="w-[84px] h-[78px] sm:w-[94px] sm:h-[86px] rounded-3xl bg-gradient-to-b from-amber-300 to-amber-400 active:from-amber-400 active:to-amber-500 border-3 border-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center text-amber-950 active:scale-95 transition-transform active:shadow-inner touch-manipulation cursor-pointer select-none"
        aria-label="Slide or Duck"
      >
        <ArrowDown className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] text-amber-950" />
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-0.5">SLIDE</span>
      </button>

      {/* Center Mini Nudge / Direction Arrows */}
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNudgeLeft?.()}
            className="w-10 h-10 rounded-2xl bg-white/90 border-2 border-stone-200 shadow-sm flex items-center justify-center text-stone-700 active:scale-90 font-black text-xs hover:bg-stone-50 cursor-pointer"
            title="Step back"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => onNudgeRight?.()}
            className="w-10 h-10 rounded-2xl bg-white/90 border-2 border-stone-200 shadow-sm flex items-center justify-center text-stone-700 active:scale-90 font-black text-xs hover:bg-stone-50 cursor-pointer"
            title="Step forward"
          >
            ▶
          </button>
        </div>
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Position</span>
      </div>

      {/* Jump Button (Right thumb) */}
      <button
        type="button"
        onTouchStart={(e) => {
          e.preventDefault();
          triggerHaptic(30);
          onJump();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          triggerHaptic(25);
          onJump();
        }}
        className="w-[92px] h-[82px] sm:w-[102px] sm:h-[90px] rounded-3xl bg-gradient-to-b from-rose-400 to-rose-500 active:from-rose-500 active:to-rose-600 border-3 border-white shadow-[0_8px_20px_-4px_rgba(244,63,94,0.5)] flex flex-col items-center justify-center text-white active:scale-95 transition-transform active:shadow-inner touch-manipulation cursor-pointer select-none"
        aria-label="Jump"
      >
        <ArrowUp className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3.5] text-white animate-bounce" style={{ animationDuration: '1.4s' }} />
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider mt-0.5">JUMP!</span>
      </button>
    </div>
  );
};
