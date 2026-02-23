import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play, Pause } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 5;

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Game state refs to avoid dependency issues in animation loop
  const gameState = useRef({
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: INITIAL_BALL_SPEED, dy: INITIAL_BALL_SPEED },
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    keys: { ArrowUp: false, ArrowDown: false, w: false, s: false }
  });

  const isPausedRef = useRef(isPaused);
  const gameOverRef = useRef(gameOver);

  useEffect(() => {
    isPausedRef.current = isPaused;
    gameOverRef.current = gameOver;
  }, [isPaused, gameOver]);

  const resetGame = () => {
    setScore({ player: 0, ai: 0 });
    setGameOver(false);
    setIsPaused(false);
    resetBall();
  };

  const resetBall = () => {
    gameState.current.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED,
      dy: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in gameState.current.keys) {
        gameState.current.keys[e.key as keyof typeof gameState.current.keys] = true;
      }
      if (e.key === ' ') {
        setIsPaused(p => !p);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in gameState.current.keys) {
        gameState.current.keys[e.key as keyof typeof gameState.current.keys] = false;
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

    const update = () => {
      if (isPausedRef.current || gameOverRef.current) return;

      const state = gameState.current;

      // Move player paddle
      if (state.keys.ArrowUp || state.keys.w) {
        state.playerY = Math.max(0, state.playerY - PADDLE_SPEED);
      }
      if (state.keys.ArrowDown || state.keys.s) {
        state.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.playerY + PADDLE_SPEED);
      }

      // Move AI paddle
      const aiCenter = state.aiY + PADDLE_HEIGHT / 2;
      if (aiCenter < state.ball.y - 10) {
        state.aiY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY + PADDLE_SPEED * 0.8);
      } else if (aiCenter > state.ball.y + 10) {
        state.aiY = Math.max(0, state.aiY - PADDLE_SPEED * 0.8);
      }

      // Move ball
      state.ball.x += state.ball.dx;
      state.ball.y += state.ball.dy;

      // Wall collision (top and bottom)
      if (state.ball.y <= 0 || state.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
        state.ball.dy *= -1;
      }

      // Paddle collision
      const hitPlayer = state.ball.x <= PADDLE_WIDTH && state.ball.y + BALL_SIZE >= state.playerY && state.ball.y <= state.playerY + PADDLE_HEIGHT;
      const hitAI = state.ball.x + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH && state.ball.y + BALL_SIZE >= state.aiY && state.ball.y <= state.aiY + PADDLE_HEIGHT;

      if (hitPlayer) {
        state.ball.dx = Math.abs(state.ball.dx) * 1.05; // Increase speed slightly
        state.ball.x = PADDLE_WIDTH; // Prevent sticking
      } else if (hitAI) {
        state.ball.dx = -Math.abs(state.ball.dx) * 1.05;
        state.ball.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
      }

      // Scoring
      if (state.ball.x < 0) {
        setScore(s => {
          const newScore = { ...s, ai: s.ai + 1 };
          if (newScore.ai >= 5) setGameOver(true);
          return newScore;
        });
        resetBall();
      } else if (state.ball.x > CANVAS_WIDTH) {
        setScore(s => {
          const newScore = { ...s, player: s.player + 1 };
          if (newScore.player >= 5) setGameOver(true);
          return newScore;
        });
        resetBall();
      }
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      const state = gameState.current;

      // Clear canvas
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw center line
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#38bdf8'; // sky-400 (Player)
      ctx.fillRect(0, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

      ctx.fillStyle = '#f43f5e'; // rose-500 (AI)
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.fillStyle = '#f8fafc'; // slate-50
      ctx.fillRect(state.ball.x, state.ball.y, BALL_SIZE, BALL_SIZE);
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
        <div className="flex flex-col items-center">
          <span className="text-sm text-sky-500 font-bold uppercase tracking-wider mb-1">Player</span>
          <span className="text-4xl font-black text-slate-800">{score.player}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-rose-500 font-bold uppercase tracking-wider mb-1">Computer</span>
          <span className="text-4xl font-black text-slate-800">{score.ai}</span>
        </div>
      </div>

      <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg border-4 border-slate-900">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full max-w-[600px] aspect-[3/2] bg-slate-900"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white mb-2 drop-shadow-md">
              {score.player >= 5 ? 'You Win! 🎉' : 'Computer Wins! 🤖'}
            </span>
            <span className="text-white/80 mb-8 font-medium">First to 5 wins</span>
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
      
      <p className="mt-6 text-sm text-slate-400 font-medium">Use Up/Down arrows or W/S to move your paddle. Space to pause.</p>
    </div>
  );
}
