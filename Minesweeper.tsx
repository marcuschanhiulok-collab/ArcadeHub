import React, { useState, useEffect } from 'react';
import { RotateCcw, Flag, Bomb } from 'lucide-react';
import HowToPlay from './HowToPlay';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export default function Minesweeper() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [isFirstClick, setIsFirstClick] = useState(true);

  const initializeGrid = () => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setFlagsPlaced(0);
    setIsFirstClick(true);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  const placeMines = (firstRow: number, firstCol: number, currentGrid: Cell[][]) => {
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      
      // Don't place mine on first click or if already a mine
      if (!currentGrid[r][c].isMine && !(r === firstRow && c === firstCol)) {
        currentGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!currentGrid[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < ROWS && c + j >= 0 && c + j < COLS) {
                if (currentGrid[r + i][c + j].isMine) count++;
              }
            }
          }
          currentGrid[r][c].neighborMines = count;
        }
      }
    }
    return currentGrid;
  };

  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    let newGrid = [...grid.map(row => [...row])];

    if (isFirstClick) {
      newGrid = placeMines(r, c, newGrid);
      setIsFirstClick(false);
    }

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    // Flood fill for empty cells
    const stack = [[r, c]];
    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      if (!newGrid[currR][currC].isRevealed && !newGrid[currR][currC].isFlagged) {
        newGrid[currR][currC].isRevealed = true;
        if (newGrid[currR][currC].neighborMines === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (currR + i >= 0 && currR + i < ROWS && currC + j >= 0 && currC + j < COLS) {
                stack.push([currR + i, currC + j]);
              }
            }
          }
        }
      }
    }

    setGrid(newGrid);
    checkWinCondition(newGrid);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || gameWon || grid[r][c].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    if (!newGrid[r][c].isFlagged && flagsPlaced < MINES) {
      newGrid[r][c].isFlagged = true;
      setFlagsPlaced(prev => prev + 1);
    } else if (newGrid[r][c].isFlagged) {
      newGrid[r][c].isFlagged = false;
      setFlagsPlaced(prev => prev - 1);
    }
    setGrid(newGrid);
  };

  const checkWinCondition = (currentGrid: Cell[][]) => {
    let unrevealedSafeCells = 0;
    currentGrid.forEach(row => row.forEach(cell => {
      if (!cell.isRevealed && !cell.isMine) unrevealedSafeCells++;
    }));

    if (unrevealedSafeCells === 0) {
      setGameWon(true);
      // Flag all remaining mines
      const finalGrid = [...currentGrid.map(row => [...row])];
      finalGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isFlagged = true;
      }));
      setGrid(finalGrid);
      setFlagsPlaced(MINES);
    }
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '', 'text-blue-500', 'text-green-500', 'text-red-500', 
      'text-purple-500', 'text-amber-600', 'text-teal-500', 
      'text-black', 'text-gray-600'
    ];
    return colors[num] || '';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex justify-between items-center w-full mb-6 px-4">
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
          <Flag className="text-rose-500" size={20} />
          <span className="text-xl font-bold text-slate-800">{MINES - flagsPlaced}</span>
        </div>
        
        <HowToPlay 
          rules={[
            "Clear the board without detonating any hidden mines.",
            "Numbers on revealed squares show how many mines are adjacent to that square.",
            "Use logic to figure out where the mines are and flag them.",
            "You win when all non-mine squares are revealed."
          ]}
          controls={[
            "Left Click to reveal a square.",
            "Right Click to place or remove a flag."
          ]}
        />

        <button
          onClick={initializeGrid}
          className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          {gameOver ? '😵' : gameWon ? '😎' : '🙂'}
        </button>
      </div>

      <div className="bg-slate-200 p-2 rounded-xl mb-6">
        <div 
          className="grid gap-[2px]" 
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {grid.map((row, r) => 
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg font-bold transition-colors
                  ${cell.isRevealed 
                    ? cell.isMine 
                      ? 'bg-rose-500' 
                      : 'bg-slate-50' 
                    : 'bg-slate-300 hover:bg-slate-400 shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.2),inset_2px_2px_0px_rgba(255,255,255,0.5)]'
                  }
                `}
                disabled={gameOver || gameWon}
              >
                {cell.isRevealed ? (
                  cell.isMine ? <Bomb size={20} className="text-white" /> : 
                  cell.neighborMines > 0 ? <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span> : ''
                ) : (
                  cell.isFlagged ? <Flag size={18} className="text-rose-500" /> : ''
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {(gameOver || gameWon) && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
          <span className={`text-2xl font-bold mb-4 ${gameWon ? 'text-emerald-500' : 'text-rose-500'}`}>
            {gameWon ? 'You Won! 🎉' : 'Game Over! 💥'}
          </span>
          <button
            onClick={initializeGrid}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
          >
            <RotateCcw size={18} />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
