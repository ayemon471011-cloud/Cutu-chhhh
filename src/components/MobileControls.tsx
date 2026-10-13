import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onJump: () => void;
  onSlideStart: () => void;
  onSlideEnd: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onJump,
  onSlideStart,
  onSlideEnd,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-end pointer-events-none z-20 select-none">
      {/* Slide / Duck Button (Left side) */}
      <button
        type="button"
        onTouchStart={(e) => {
          e.preventDefault();
          onSlideStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onSlideEnd();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onSlideStart();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          onSlideEnd();
        }}
        className="pointer-events-auto w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-400/80 active:bg-amber-500/90 backdrop-blur-md border-4 border-white shadow-xl flex flex-col items-center justify-center text-amber-950 active:scale-90 transition-transform active:shadow-inner touch-manipulation cursor-pointer"
        aria-label="Slide or Duck"
      >
        <ArrowDown className="w-8 h-8 md:w-10 md:h-10 stroke-[3]" />
        <span className="text-[11px] md:text-xs font-black uppercase tracking-wider">Slide</span>
      </button>

      {/* Jump Button (Right side) */}
      <button
        type="button"
        onTouchStart={(e) => {
          e.preventDefault();
          onJump();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onJump();
        }}
        className="pointer-events-auto w-24 h-24 md:w-28 md:h-28 rounded-full bg-rose-500/85 active:bg-rose-600/95 backdrop-blur-md border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white active:scale-90 transition-transform active:shadow-inner touch-manipulation cursor-pointer"
        aria-label="Jump"
      >
        <ArrowUp className="w-9 h-9 md:w-11 md:h-11 stroke-[3] animate-bounce" style={{ animationDuration: '1.2s' }} />
        <span className="text-xs md:text-sm font-black uppercase tracking-wider">Jump!</span>
      </button>
    </div>
  );
};
