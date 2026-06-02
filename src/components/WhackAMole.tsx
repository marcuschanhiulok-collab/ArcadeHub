import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import HowToPlay from './HowToPlay';
import { soundManager } from '../lib/soundManager';

export default function WhackAMole() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      soundManager.play('gameover');
      setGameOver(true);
      setActiveMole(null);
    }
  }, [timeLeft, isPlaying]);

  useEffect(() => {
    let moleTimer: number;
    let hideTimer: number;

    const popMole = () => {
      if (!isPlaying) return;
      const randomHole = Math.floor(Math.random() * 9);
      setActiveMole(randomHole);
      
      hideTimer = window.setTimeout(() => {
        setActiveMole(null);
        moleTimer = window.setTimeout(popMole, Math.random() * 400 + 300);
      }, Math.random() * 700 + 600);
    };

    if (isPlaying) {
      popMole();
    } else {
      setActiveMole(null);
    }

    return () => {
      clearTimeout(moleTimer);
      clearTimeout(hideTimer);
    };
  }, [isPlaying]);

  const whack = (index: number) => {
    if (!isPlaying || activeMole !== index) return;
    setScore(s => s + 10);
    soundManager.play('hit');
    setActiveMole(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto">
      <div className="flex justify-between items-center w-full mb-6 px-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
        <HowToPlay 
          rules={["Whack the moles as they pop up!", "You have 30 seconds.", "Each mole whacked gives you 10 points."]}
          controls={["Click or tap on the moles to whack them."]}
        />
        <div className="flex flex-col items-end">
          <span className="text-sm text-rose-500 font-bold uppercase tracking-wider mb-1">Time</span>
          <span className="text-3xl font-black text-slate-800">{timeLeft}s</span>
        </div>
      </div>
      
      <div className="bg-emerald-600 p-4 sm:p-6 rounded-3xl shadow-inner mb-8 w-full max-w-[360px]">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="relative w-full aspect-square bg-emerald-800 rounded-full shadow-[inset_0_8px_16px_rgba(0,0,0,0.6)] overflow-hidden flex items-end justify-center cursor-crosshair">
              {activeMole === i && (
                <button 
                  onMouseDown={() => whack(i)}
                  className="w-[80%] h-[90%] bg-amber-700 rounded-t-full transition-transform duration-100 animate-in slide-in-from-bottom flex justify-center pt-2 hover:brightness-110"
                >
                  <div className="flex gap-2.5 pt-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-900 rounded-full" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-900 rounded-full" />
                  </div>
                  <div className="absolute top-5 sm:top-6 w-3 h-2 sm:w-4 sm:h-3 bg-pink-300 rounded-full" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {!isPlaying && (
        gameOver ? (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <span className="text-3xl font-black text-rose-500 mb-2">Time's Up!</span>
            <span className="text-slate-600 font-medium mb-6">Final Score: {score}</span>
            <button onClick={startGame} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-bold shadow-xl hover:scale-105">
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        ) : (
          <button onClick={startGame} className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors font-bold shadow-xl hover:scale-105">
            <Play size={20} />
            Start Game
          </button>
        )
      )}
    </div>
  );
}
