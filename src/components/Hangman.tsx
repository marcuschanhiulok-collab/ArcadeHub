import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import HowToPlay from './HowToPlay';

const WORDS = [
  'REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'PROGRAMMING', 'FRONTEND', 
  'BACKEND', 'DATABASE', 'FRAMEWORK', 'COMPONENT', 'INTERFACE', 
  'APPLICATION', 'DEVELOPER', 'SOFTWARE', 'HARDWARE', 'NETWORK'
];

export default function Hangman() {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const maxMistakes = 6;

  const startGame = () => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessed(new Set());
  };

  useEffect(() => {
    startGame();
  }, []);

  const mistakes = Array.from(guessed).filter(letter => !word.includes(letter)).length;
  const isWinner = word.length > 0 && word.split('').every(letter => guessed.has(letter));
  const isGameOver = mistakes >= maxMistakes;

  const guess = (letter: string) => {
    if (isGameOver || isWinner || guessed.has(letter)) return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const parts = [
    <circle key="head" cx="150" cy="80" r="20" stroke="currentColor" strokeWidth="4" fill="none" />, 
    <line key="body" x1="150" y1="100" x2="150" y2="160" stroke="currentColor" strokeWidth="4" />, 
    <line key="larm" x1="150" y1="120" x2="120" y2="100" stroke="currentColor" strokeWidth="4" />, 
    <line key="rarm" x1="150" y1="120" x2="180" y2="100" stroke="currentColor" strokeWidth="4" />, 
    <line key="lleg" x1="150" y1="160" x2="120" y2="200" stroke="currentColor" strokeWidth="4" />, 
    <line key="rleg" x1="150" y1="160" x2="180" y2="200" stroke="currentColor" strokeWidth="4" />
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center w-full mb-6">
        <HowToPlay 
          rules={[
            "Guess the hidden word one letter at a time.",
            "Each incorrect guess brings you closer to being 'hung'.",
            `You have a maximum of ${maxMistakes} incorrect guesses.`,
            "Guess all the letters in the word to win!"
          ]}
          controls={[
            "Click on the letters on the screen to guess them."
          ]}
        />
        <div className="flex flex-col items-end">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Mistakes</span>
          <span className={`text-2xl font-black ${mistakes >= maxMistakes - 1 ? 'text-rose-500' : 'text-slate-800'}`}>
            {mistakes} / {maxMistakes}
          </span>
        </div>
      </div>

      <div className="mb-8 p-4 bg-slate-50 rounded-2xl w-full flex justify-center">
        <svg width="200" height="250" className="text-slate-800" viewBox="0 0 250 250">
          <line x1="20" y1="230" x2="100" y2="230" stroke="currentColor" strokeWidth="4" />
          <line x1="60" y1="20" x2="60" y2="230" stroke="currentColor" strokeWidth="4" />
          <line x1="60" y1="20" x2="150" y2="20" stroke="currentColor" strokeWidth="4" />
          <line x1="150" y1="20" x2="150" y2="60" stroke="currentColor" strokeWidth="4" />
          {parts.slice(0, mistakes)}
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[4rem]">
        {word.split('').map((letter, i) => (
          <div key={i} className={`flex items-end justify-center w-8 h-10 sm:w-12 sm:h-14 font-black text-2xl sm:text-4xl px-2 border-b-4 ${guessed.has(letter) || isGameOver ? 'border-slate-800 text-slate-800' : 'border-slate-300 text-transparent'}`}>
            {guessed.has(letter) || isGameOver ? letter : ''}
          </div>
        ))}
      </div>

      {(isWinner || isGameOver) && (
        <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in">
          <span className={`text-3xl font-black mb-4 ${isWinner ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isWinner ? 'You Won! 🎉' : 'Game Over! 💥'}
          </span>
          <button onClick={startGame} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-bold shadow-lg">
            <RotateCcw size={18} />
            Play Again
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 w-full max-w-lg">
        {alphabet.map((letter) => {
          const isGuessed = guessed.has(letter);
          const isCorrect = word.includes(letter);
          let btnClass = "bg-slate-100 hover:bg-slate-200 text-slate-700";
          if (isGuessed) {
            btnClass = isCorrect ? "bg-emerald-500 text-white opacity-50" : "bg-slate-300 text-slate-400 opacity-50";
          }
          return (
            <button
              key={letter}
              onClick={() => guess(letter)}
              disabled={isGuessed || isGameOver || isWinner}
              className={`w-10 h-12 sm:w-12 sm:h-14 rounded-lg font-bold text-lg sm:text-xl transition-all shadow-sm ${btnClass}`}
            >
              {letter}
            </button>
          )
        })}
      </div>
    </div>
  );
}
