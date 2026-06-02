import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import HowToPlay from './HowToPlay';

type Player = 'red' | 'yellow' | null;

const ROWS = 6;
const COLS = 7;

export default function ConnectFour() {
  const [grid, setGrid] = useState<Player[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);

  const checkWin = (g: Player[][], r: number, c: number, p: Player) => {
    const dirs = [[0,1], [1,0], [1,1], [1,-1]];
    for (let [dr, dc] of dirs) {
      let count = 1;
      for (let i = 1; i < 4; i++) {
        const nr = r + dr*i, nc = c + dc*i;
        if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && g[nr][nc] === p) count++;
        else break;
      }
      for (let i = 1; i < 4; i++) {
        const nr = r - dr*i, nc = c - dc*i;
        if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && g[nr][nc] === p) count++;
        else break;
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const handleColumnClick = (col: number) => {
    if (winner) return;

    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!grid[r][col]) {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column full

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = currentPlayer;
    setGrid(newGrid);

    if (checkWin(newGrid, row, col, currentPlayer)) {
      setWinner(currentPlayer);
    } else if (newGrid.every(r => r.every(c => c !== null))) {
      setWinner('draw');
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
    }
  };

  const resetGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
      <div className="flex justify-between items-center w-full mb-8 px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Connect Four</h2>
          <HowToPlay 
            rules={[
              "Players take turns dropping their colored discs into the grid.",
              "The pieces fall straight down, occupying the lowest available space within the column.",
              "The objective of the game is to be the first to form a horizontal, vertical, or diagonal line of four of one's own discs.",
              "If the grid fills up before either player achieves four in a row, the game is a draw."
            ]}
            controls={[
              "Click on any column to drop your disc into it."
            ]}
          />
        </div>
        
        <div className="flex items-center gap-3">
          {winner ? (
            <span className={`text-xl font-black ${winner === 'red' ? 'text-red-500' : winner === 'yellow' ? 'text-yellow-500' : 'text-slate-500'}`}>
              {winner === 'draw' ? 'Draw!' : `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins! 🎉`}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Current Turn:</span>
              <div className={`w-6 h-6 rounded-full shadow-sm ${currentPlayer === 'red' ? 'bg-red-500' : 'bg-yellow-400'}`} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-600 p-3 sm:p-4 rounded-xl shadow-inner mb-8 inline-block">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {grid.map((row, r) => 
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleColumnClick(c)}
                disabled={!!winner}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-blue-800 shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden transition-transform hover:scale-105 disabled:hover:scale-100"
              >
                {cell && (
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full shadow-sm animate-in slide-in-from-top-full duration-300 ${cell === 'red' ? 'bg-red-500' : 'bg-yellow-400'}`} />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <button
        onClick={resetGame}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium shadow-md"
      >
        <RotateCcw size={18} />
        Restart Game
      </button>
    </div>
  );
}
