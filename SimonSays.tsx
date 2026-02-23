import React, { useState, useEffect } from 'react';
import { RotateCcw, Play } from 'lucide-react';

const COLORS = [
  { id: 0, base: 'bg-emerald-500', active: 'bg-emerald-300', shadow: 'shadow-emerald-500/50' },
  { id: 1, base: 'bg-rose-500', active: 'bg-rose-300', shadow: 'shadow-rose-500/50' },
  { id: 2, base: 'bg-amber-400', active: 'bg-amber-200', shadow: 'shadow-amber-400/50' },
  { id: 3, base: 'bg-blue-500', active: 'bg-blue-300', shadow: 'shadow-blue-500/50' },
];

export default function SimonSays() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'showing' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);

  const playSequence = async (seq: number[]) => {
    setStatus('showing');
    await new Promise(resolve => setTimeout(resolve, 800));
    for (let i = 0; i < seq.length; i++) {
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveColor(null);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    setStatus('playing');
    setPlayerStep(0);
  };

  const startGame = () => {
    const firstColor = Math.floor(Math.random() * 4);
    setSequence([firstColor]);
    setScore(0);
    playSequence([firstColor]);
  };

  const handleColorClick = (colorId: number) => {
    if (status !== 'playing') return;

    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    if (colorId !== sequence[playerStep]) {
      setStatus('gameover');
      return;
    }

    const nextStep = playerStep + 1;
    if (nextStep === sequence.length) {
      setScore(s => s + 1);
      const newSequence = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSequence);
      setStatus('showing');
      setTimeout(() => playSequence(newSequence), 1000);
    } else {
      setPlayerStep(nextStep);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex justify-between w-full mb-8 px-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Status</span>
          <span className={`text-lg font-bold ${
            status === 'showing' ? 'text-amber-500 animate-pulse' : 
            status === 'playing' ? 'text-emerald-500' : 
            status === 'gameover' ? 'text-rose-500' : 'text-slate-400'
          }`}>
            {status === 'showing' ? 'Watch...' : 
             status === 'playing' ? 'Your Turn!' : 
             status === 'gameover' ? 'Game Over' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="relative bg-slate-800 p-4 rounded-full mb-8 shadow-xl">
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.id)}
              disabled={status !== 'playing'}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl transition-all duration-150 transform
                ${activeColor === color.id ? `${color.active} scale-95 shadow-lg ${color.shadow}` : `${color.base} shadow-md`}
                ${color.id === 0 ? 'rounded-tl-full' : ''}
                ${color.id === 1 ? 'rounded-tr-full' : ''}
                ${color.id === 2 ? 'rounded-bl-full' : ''}
                ${color.id === 3 ? 'rounded-br-full' : ''}
                ${status === 'playing' ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}
              `}
            />
          ))}
        </div>
        
        {/* Center piece */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-inner border-4 border-slate-800">
          <span className="text-slate-500 font-black text-xl">SIMON</span>
        </div>
      </div>

      {status === 'idle' || status === 'gameover' ? (
        <button
          onClick={startGame}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-transform hover:scale-105 font-bold shadow-lg"
        >
          {status === 'gameover' ? <RotateCcw size={20} /> : <Play size={20} />}
          {status === 'gameover' ? 'Play Again' : 'Start Game'}
        </button>
      ) : (
        <button
          onClick={() => setStatus('idle')}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors font-medium"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      )}
    </div>
  );
}
