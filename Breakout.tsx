import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play, Pause } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 65;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 10;
const INITIAL_BALL_SPEED = 4;

type Brick = {
  x: number;
  y: number;
  status: number;
  color: string;
};

const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Game state refs
  const gameState = useRef({
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED },
    paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    rightPressed: false,
    leftPressed: false,
    bricks: [] as Brick[][],
  });

  const isPausedRef = useRef(isPaused);
  const gameOverRef = useRef(gameOver);
  const gameWonRef = useRef(gameWon);

  useEffect(() => {
    isPausedRef.current = isPaused;
    gameOverRef.current = gameOver;
    gameWonRef.current = gameWon;
  }, [isPaused, gameOver, gameWon]);

  const initBricks = () => {
    const bricks: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: BRICK_COLORS[r] };
      }
    }
    return bricks;
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    gameState.current = {
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED },
      paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      rightPressed: false,
      leftPressed: false,
      bricks: initBricks(),
    };
  };

  useEffect(() => {
    gameState.current.bricks = initBricks();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') {
        gameState.current.rightPressed = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') {
        gameState.current.leftPressed = true;
      } else if (e.key === ' ') {
        setIsPaused(p => !p);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') {
        gameState.current.rightPressed = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') {
        gameState.current.leftPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const collisionDetection = () => {
      const state = gameState.current;
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          const b = state.bricks[c][r];
          if (b.status === 1) {
            if (
              state.ball.x > b.x &&
              state.ball.x < b.x + BRICK_WIDTH &&
              state.ball.y > b.y &&
              state.ball.y < b.y + BRICK_HEIGHT
            ) {
              state.ball.dy = -state.ball.dy;
              b.status = 0;
              setScore(s => {
                const newScore = s + 10;
                if (newScore === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                  setGameWon(true);
                }
                return newScore;
              });
            }
          }
        }
      }
    };

    const update = () => {
      if (isPausedRef.current || gameOverRef.current || gameWonRef.current) return;

      const state = gameState.current;

      // Move paddle
      if (state.rightPressed && state.paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
        state.paddleX += 7;
      } else if (state.leftPressed && state.paddleX > 0) {
        state.paddleX -= 7;
      }

      // Move ball
      state.ball.x += state.ball.dx;
      state.ball.y += state.ball.dy;

      // Wall collision (left/right)
      if (state.ball.x + state.ball.dx > CANVAS_WIDTH - BALL_RADIUS || state.ball.x + state.ball.dx < BALL_RADIUS) {
        state.ball.dx = -state.ball.dx;
      }

      // Wall collision (top)
      if (state.ball.y + state.ball.dy < BALL_RADIUS) {
        state.ball.dy = -state.ball.dy;
      } 
      // Paddle collision or bottom wall
      else if (state.ball.y + state.ball.dy > CANVAS_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT) {
        if (state.ball.x > state.paddleX && state.ball.x < state.paddleX + PADDLE_WIDTH) {
          // Calculate hit point on paddle to change angle
          const hitPoint = state.ball.x - (state.paddleX + PADDLE_WIDTH / 2);
          state.ball.dx = hitPoint * 0.15;
          state.ball.dy = -state.ball.dy;
        } else if (state.ball.y + state.ball.dy > CANVAS_HEIGHT - BALL_RADIUS) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives === 0) {
              setGameOver(true);
            } else {
              // Reset ball and paddle
              state.ball.x = CANVAS_WIDTH / 2;
              state.ball.y = CANVAS_HEIGHT - 30;
              state.ball.dx = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
              state.ball.dy = -INITIAL_BALL_SPEED;
              state.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
            }
            return newLives;
          });
        }
      }

      collisionDetection();
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      const state = gameState.current;

      // Clear canvas
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bricks
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          if (state.bricks[c][r].status === 1) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            state.bricks[c][r].x = brickX;
            state.bricks[c][r].y = brickY;
            
            ctx.beginPath();
            ctx.roundRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT, 4);
            ctx.fillStyle = state.bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }

      // Draw paddle
      ctx.beginPath();
      ctx.roundRect(state.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - 5, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
      ctx.fillStyle = '#38bdf8'; // sky-400
      ctx.fill();
      ctx.closePath();

      // Draw ball
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc'; // slate-50
      ctx.fill();
      ctx.closePath();
    };

    const gameLoop = () => {
      update();
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
      <div className="flex justify-between w-full mb-6 px-8 max-w-[600px]">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-rose-500 font-bold uppercase tracking-wider mb-1">Lives</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full ${i < lives ? 'bg-rose-500' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg border-4 border-slate-900">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full max-w-[600px] aspect-[3/2] bg-slate-900"
        />
        
        {(gameOver || gameWon) && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className={`text-4xl font-black mb-2 drop-shadow-md ${gameWon ? 'text-emerald-400' : 'text-rose-500'}`}>
              {gameWon ? 'You Win! 🎉' : 'Game Over! 💥'}
            </span>
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

        {isPaused && !gameOver && !gameWon && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-widest drop-shadow-md">PAUSED</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          disabled={gameOver || gameWon}
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
      
      <p className="mt-6 text-sm text-slate-400 font-medium">Use Left/Right arrows or A/D to move your paddle. Space to pause.</p>
    </div>
  );
}
