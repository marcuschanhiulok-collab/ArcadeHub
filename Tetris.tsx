import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play, Pause } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

const COLORS = [
  '#0f172a', // 0: empty (slate-900)
  '#22d3ee', // 1: I (cyan-400)
  '#3b82f6', // 2: J (blue-500)
  '#f97316', // 3: L (orange-500)
  '#facc15', // 4: O (yellow-400)
  '#22c55e', // 5: S (green-500)
  '#a855f7', // 6: T (purple-500)
  '#ef4444', // 7: Z (red-500)
];

const SHAPES = [
  [],
  [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
  [[2,0,0], [2,2,2], [0,0,0]],
  [[0,0,3], [3,3,3], [0,0,0]],
  [[4,4], [4,4]],
  [[0,5,5], [5,5,0], [0,0,0]],
  [[0,6,0], [6,6,6], [0,0,0]],
  [[7,7,0], [0,7,7], [0,0,0]],
];

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const state = useRef({
    board: createEmptyBoard(),
    piece: { matrix: [] as number[][], x: 0, y: 0 },
    dropCounter: 0,
    dropInterval: 1000,
    lastTime: 0
  });

  const spawnPiece = () => {
    const typeId = Math.floor(Math.random() * 7) + 1;
    const matrix = SHAPES[typeId];
    state.current.piece = {
      matrix,
      x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2),
      y: 0
    };
    if (collide(state.current.board, state.current.piece)) {
      setGameOver(true);
    }
  };

  const collide = (board: number[][], piece: { matrix: number[][], x: number, y: number }) => {
    const m = piece.matrix;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
           (board[y + piece.y] && board[y + piece.y][x + piece.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  const merge = (board: number[][], piece: { matrix: number[][], x: number, y: number }) => {
    piece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          board[y + piece.y][x + piece.x] = value;
        }
      });
    });
  };

  const rotate = (matrix: number[][]) => {
    const N = matrix.length;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - 1 - j][i])
    );
    return result;
  };

  const playerDrop = () => {
    state.current.piece.y++;
    if (collide(state.current.board, state.current.piece)) {
      state.current.piece.y--;
      merge(state.current.board, state.current.piece);
      arenaSweep();
      spawnPiece();
    }
    state.current.dropCounter = 0;
  };

  const playerMove = (dir: number) => {
    state.current.piece.x += dir;
    if (collide(state.current.board, state.current.piece)) {
      state.current.piece.x -= dir;
    }
  };

  const playerRotate = () => {
    const pos = state.current.piece.x;
    let offset = 1;
    state.current.piece.matrix = rotate(state.current.piece.matrix);
    while (collide(state.current.board, state.current.piece)) {
      state.current.piece.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > state.current.piece.matrix[0].length) {
        // Rotate back
        state.current.piece.matrix = rotate(rotate(rotate(state.current.piece.matrix)));
        state.current.piece.x = pos;
        return;
      }
    }
  };

  const arenaSweep = () => {
    let rowCount = 1;
    outer: for (let y = ROWS - 1; y >= 0; --y) {
      for (let x = 0; x < COLS; ++x) {
        if (state.current.board[y][x] === 0) {
          continue outer;
        }
      }
      const row = state.current.board.splice(y, 1)[0].fill(0);
      state.current.board.unshift(row);
      ++y;
      setScore(s => s + rowCount * 100);
      rowCount *= 2;
      
      // Speed up slightly
      state.current.dropInterval = Math.max(100, state.current.dropInterval - 10);
    }
  };

  const resetGame = () => {
    state.current.board = createEmptyBoard();
    state.current.dropInterval = 1000;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    spawnPiece();
  };

  useEffect(() => {
    spawnPiece();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;
      if (e.key === 'ArrowLeft') {
        playerMove(-1);
      } else if (e.key === 'ArrowRight') {
        playerMove(1);
      } else if (e.key === 'ArrowDown') {
        playerDrop();
      } else if (e.key === 'ArrowUp') {
        playerRotate();
      } else if (e.key === ' ') {
        // Hard drop
        while (!collide(state.current.board, state.current.piece)) {
          state.current.piece.y++;
        }
        state.current.piece.y--;
        merge(state.current.board, state.current.piece);
        arenaSweep();
        spawnPiece();
        state.current.dropCounter = 0;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused]);

  useEffect(() => {
    let animationId: number;
    const s = state.current;

    const drawMatrix = (ctx: CanvasRenderingContext2D, matrix: number[][], offset: { x: number, y: number }) => {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            ctx.fillStyle = COLORS[value];
            ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, 4);
            ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, 4, BLOCK_SIZE);
          }
        });
      });
    };

    const update = (time = 0) => {
      if (gameOver || isPaused) {
        animationId = requestAnimationFrame(update);
        return;
      }

      const deltaTime = time - s.lastTime;
      s.lastTime = time;
      s.dropCounter += deltaTime;

      if (s.dropCounter > s.dropInterval) {
        playerDrop();
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a'; // slate-900
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          drawMatrix(ctx, s.board, { x: 0, y: 0 });
          drawMatrix(ctx, s.piece.matrix, { x: s.piece.x, y: s.piece.y });
        }
      }

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, isPaused]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex justify-between w-full mb-6 px-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
      </div>

      <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg border-4 border-slate-900 bg-slate-900">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          className="block"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white mb-2 drop-shadow-md">Game Over!</span>
            <span className="text-white/80 mb-8 font-medium">Final Score: {score}</span>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-transform hover:scale-105 font-bold shadow-xl"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-widest drop-shadow-md">PAUSED</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          disabled={gameOver}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
        >
          <RotateCcw size={18} />
          Restart
        </button>
      </div>
      
      <p className="mt-6 text-sm text-slate-400 font-medium text-center">Use Arrow Keys to move and rotate.<br/>Space to hard drop.</p>
    </div>
  );
}
