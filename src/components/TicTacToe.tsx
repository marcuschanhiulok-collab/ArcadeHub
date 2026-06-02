import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import HowToPlay from './HowToPlay';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex justify-between items-center w-full mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tic-Tac-Toe</h2>
        <HowToPlay 
          rules={[
            "The game is played on a grid that's 3 squares by 3 squares.",
            "You are X, your friend is O. Players take turns putting their marks in empty squares.",
            "The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner.",
            "When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie."
          ]}
          controls={[
            "Click on any empty square to place your mark."
          ]}
        />
      </div>
      
      <div className="mb-6 h-8 flex items-center justify-center">
        {winner ? (
          <span className="text-lg font-semibold text-emerald-600">Winner: {winner}</span>
        ) : isDraw ? (
          <span className="text-lg font-semibold text-slate-600">Draw!</span>
        ) : (
          <span className="text-lg font-medium text-slate-600">Next player: <span className={`font-bold ${xIsNext ? 'text-blue-500' : 'text-rose-500'}`}>{xIsNext ? 'X' : 'O'}</span></span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {board.map((square, i) => (
          <button
            key={i}
            className={`w-20 h-20 text-4xl font-bold flex items-center justify-center rounded-xl transition-colors
              ${!square && !winner ? 'hover:bg-slate-50 bg-slate-100' : 'bg-slate-100'}
              ${square === 'X' ? 'text-blue-500' : 'text-rose-500'}
            `}
            onClick={() => handleClick(i)}
            disabled={!!square || !!winner}
          >
            {square}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
      >
        <RotateCcw size={18} />
        Restart Game
      </button>
    </div>
  );
}
