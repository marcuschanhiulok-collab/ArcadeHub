import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

type Grid = number[][];

const getEmptyCells = (grid: Grid) => {
  const cells: { r: number; c: number }[] = [];
  grid.forEach((row, r) => row.forEach((val, c) => {
    if (val === 0) cells.push({ r, c });
  }));
  return cells;
};

const spawnTile = (grid: Grid): Grid => {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return grid;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initGame = () => {
    let newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    newGrid = spawnTile(spawnTile(newGrid));
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const slide = (row: number[]) => {
    let arr = row.filter(val => val !== 0);
    let scoreIncrease = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        scoreIncrease += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) arr.push(0);
    return { newRow: arr, scoreIncrease };
  };

  const checkGameOver = (g: Grid) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return false;
        if (c < 3 && g[r][c] === g[r][c + 1]) return false;
        if (r < 3 && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || grid.length === 0) return;
      
      let newGrid = [...grid.map(row => [...row])];
      let moved = false;
      let scoreIncrease = 0;

      if (e.key === 'ArrowLeft') {
        for (let r = 0; r < 4; r++) {
          const { newRow, scoreIncrease: inc } = slide(newGrid[r]);
          if (newGrid[r].join(',') !== newRow.join(',')) moved = true;
          newGrid[r] = newRow;
          scoreIncrease += inc;
        }
      } else if (e.key === 'ArrowRight') {
        for (let r = 0; r < 4; r++) {
          const { newRow, scoreIncrease: inc } = slide([...newGrid[r]].reverse());
          newRow.reverse();
          if (newGrid[r].join(',') !== newRow.join(',')) moved = true;
          newGrid[r] = newRow;
          scoreIncrease += inc;
        }
      } else if (e.key === 'ArrowUp') {
        for (let c = 0; c < 4; c++) {
          const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          const { newRow, scoreIncrease: inc } = slide(col);
          for (let r = 0; r < 4; r++) {
            if (newGrid[r][c] !== newRow[r]) moved = true;
            newGrid[r][c] = newRow[r];
          }
          scoreIncrease += inc;
        }
      } else if (e.key === 'ArrowDown') {
        for (let c = 0; c < 4; c++) {
          const col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
          const { newRow, scoreIncrease: inc } = slide(col);
          newRow.reverse();
          for (let r = 0; r < 4; r++) {
            if (newGrid[r][c] !== newRow[r]) moved = true;
            newGrid[r][c] = newRow[r];
          }
          scoreIncrease += inc;
        }
      }

      if (moved) {
        newGrid = spawnTile(newGrid);
        setGrid(newGrid);
        setScore(s => s + scoreIncrease);
        if (checkGameOver(newGrid)) setGameOver(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver]);

  const getTileColor = (val: number) => {
    const colors: Record<number, string> = {
      0: 'bg-slate-200/50 text-transparent',
      2: 'bg-slate-100 text-slate-700',
      4: 'bg-orange-100 text-orange-800',
      8: 'bg-orange-200 text-orange-800',
      16: 'bg-orange-300 text-white',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.5)]',
      256: 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.6)]',
      512: 'bg-yellow-400 text-white shadow-[0_0_20px_rgba(250,204,21,0.7)]',
      1024: 'bg-yellow-500 text-white shadow-[0_0_25px_rgba(234,179,8,0.8)]',
      2048: 'bg-yellow-600 text-white shadow-[0_0_30px_rgba(202,138,4,0.9)]',
    };
    return colors[val] || 'bg-slate-800 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)]';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex justify-between w-full mb-6 px-2">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
        <button
          onClick={initGame}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium h-fit self-end"
        >
          <RotateCcw size={18} />
          Restart
        </button>
      </div>

      <div className="relative bg-slate-300 p-3 rounded-2xl mb-6">
        <div className="grid grid-cols-4 gap-3">
          {grid.map((row, r) => 
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl text-2xl sm:text-3xl font-bold transition-all duration-150 ${getTileColor(val)}`}
              >
                {val !== 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10">
            <span className="text-3xl font-black text-white mb-4 drop-shadow-md">Game Over!</span>
            <button
              onClick={initGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-transform hover:scale-105 font-bold shadow-xl"
            >
              <RotateCcw size={18} />
              Try Again
            </button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-slate-400 font-medium">Use arrow keys to slide tiles.</p>
    </div>
  );
}
