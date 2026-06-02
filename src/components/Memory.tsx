import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const EMOJIS = ['🚀', '🛸', '👾', '🤖', '🌟', '🌙', '🌍', '☄️'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Memory() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const initializeGame = () => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledEmojis);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches(m => m + 1);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const isGameOver = matches === EMOJIS.length;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex justify-between w-full mb-8 px-2">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Moves</span>
          <span className="text-2xl font-bold text-slate-800">{moves}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Matches</span>
          <span className="text-2xl font-bold text-indigo-600">{matches} / {EMOJIS.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`w-16 h-16 sm:w-20 sm:h-20 text-3xl sm:text-4xl flex items-center justify-center rounded-xl transition-all duration-300 transform perspective-1000
              ${card.isFlipped || card.isMatched 
                ? 'bg-indigo-50 border-2 border-indigo-100 rotate-y-180' 
                : 'bg-slate-800 hover:bg-slate-700 hover:-translate-y-1 shadow-md'}
              ${card.isMatched ? 'opacity-50 scale-95' : ''}
            `}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
              {card.emoji}
            </div>
          </button>
        ))}
      </div>

      {isGameOver ? (
        <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-2xl font-bold text-emerald-500 mb-2">You Won! 🎉</span>
          <span className="text-slate-600 font-medium mb-4">Completed in {moves} moves</span>
          <button
            onClick={initializeGame}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <RotateCcw size={18} />
            Play Again
          </button>
        </div>
      ) : (
        <button
          onClick={initializeGame}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors font-medium"
        >
          <RotateCcw size={18} />
          Restart Game
        </button>
      )}
    </div>
  );
}
