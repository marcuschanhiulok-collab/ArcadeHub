import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play, Pause } from 'lucide-react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ALIEN_ROWS = 4;
const ALIEN_COLS = 8;
const ALIEN_WIDTH = 30;
const ALIEN_HEIGHT = 20;
const ALIEN_PADDING = 15;

type Alien = { x: number, y: number, alive: boolean };
type Bullet = { x: number, y: number, isPlayer: boolean };

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const state = useRef({
    playerX: CANVAS_WIDTH / 2 - 20,
    aliens: [] as Alien[],
    bullets: [] as Bullet[],
    alienDirection: 1,
    alienSpeed: 1,
    keys: { ArrowLeft: false, ArrowRight: false, Space: false },
    lastShot: 0
  });

  const initAliens = () => {
    const aliens: Alien[] = [];
    const offsetX = (CANVAS_WIDTH - (ALIEN_COLS * (ALIEN_WIDTH + ALIEN_PADDING))) / 2;
    for (let r = 0; r < ALIEN_ROWS; r++) {
      for (let c = 0; c < ALIEN_COLS; c++) {
        aliens.push({
          x: offsetX + c * (ALIEN_WIDTH + ALIEN_PADDING),
          y: 50 + r * (ALIEN_HEIGHT + ALIEN_PADDING),
          alive: true
        });
      }
    }
    return aliens;
  };

  const resetGame = () => {
    state.current = {
      playerX: CANVAS_WIDTH / 2 - 20,
      aliens: initAliens(),
      bullets: [],
      alienDirection: 1,
      alienSpeed: 1,
      keys: { ArrowLeft: false, ArrowRight: false, Space: false },
      lastShot: 0
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
  };

  useEffect(() => {
    state.current.aliens = initAliens();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') state.current.keys.ArrowLeft = true;
      if (e.code === 'ArrowRight') state.current.keys.ArrowRight = true;
      if (e.code === 'Space') {
        state.current.keys.Space = true;
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') state.current.keys.ArrowLeft = false;
      if (e.code === 'ArrowRight') state.current.keys.ArrowRight = false;
      if (e.code === 'Space') state.current.keys.Space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let animationId: number;

    const loop = () => {
      if (gameOver || gameWon || isPaused) {
        animationId = requestAnimationFrame(loop);
        return;
      }

      const s = state.current;

      // Player movement
      if (s.keys.ArrowLeft) s.playerX = Math.max(0, s.playerX - PLAYER_SPEED);
      if (s.keys.ArrowRight) s.playerX = Math.min(CANVAS_WIDTH - 40, s.playerX + PLAYER_SPEED);

      // Player shooting
      const now = Date.now();
      if (s.keys.Space && now - s.lastShot > 500) {
        s.bullets.push({ x: s.playerX + 18, y: CANVAS_HEIGHT - 40, isPlayer: true });
        s.lastShot = now;
      }

      // Alien movement
      let hitEdge = false;
      let aliveCount = 0;
      s.aliens.forEach(a => {
        if (!a.alive) return;
        aliveCount++;
        a.x += s.alienSpeed * s.alienDirection;
        if (a.x <= 0 || a.x + ALIEN_WIDTH >= CANVAS_WIDTH) hitEdge = true;
      });

      if (aliveCount === 0) {
        setGameWon(true);
      }

      if (hitEdge) {
        s.alienDirection *= -1;
        s.alienSpeed += 0.2; // Speed up slightly
        s.aliens.forEach(a => {
          if (a.alive) {
            a.y += 20;
            if (a.y + ALIEN_HEIGHT >= CANVAS_HEIGHT - 40) {
              setGameOver(true);
            }
          }
        });
      }

      // Alien shooting (random)
      if (Math.random() < 0.02 && aliveCount > 0) {
        const aliveAliens = s.aliens.filter(a => a.alive);
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        s.bullets.push({ x: shooter.x + ALIEN_WIDTH / 2, y: shooter.y + ALIEN_HEIGHT, isPlayer: false });
      }

      // Bullets movement & collision
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.y += b.isPlayer ? -BULLET_SPEED : BULLET_SPEED;

        // Remove off-screen
        if (b.y < 0 || b.y > CANVAS_HEIGHT) {
          s.bullets.splice(i, 1);
          continue;
        }

        // Collision with aliens
        if (b.isPlayer) {
          let hit = false;
          for (let a of s.aliens) {
            if (a.alive && b.x > a.x && b.x < a.x + ALIEN_WIDTH && b.y > a.y && b.y < a.y + ALIEN_HEIGHT) {
              a.alive = false;
              hit = true;
              setScore(sc => sc + 10);
              break;
            }
          }
          if (hit) {
            s.bullets.splice(i, 1);
            continue;
          }
        } else {
          // Collision with player
          if (b.x > s.playerX && b.x < s.playerX + 40 && b.y > CANVAS_HEIGHT - 30 && b.y < CANVAS_HEIGHT - 10) {
            s.bullets.splice(i, 1);
            setLives(l => {
              if (l <= 1) setGameOver(true);
              return l - 1;
            });
            continue;
          }
        }
      }

      draw();
      animationId = requestAnimationFrame(loop);
    };

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const s = state.current;

      // Background
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Player
      ctx.fillStyle = '#38bdf8'; // sky-400
      ctx.fillRect(s.playerX, CANVAS_HEIGHT - 30, 40, 20);
      ctx.fillRect(s.playerX + 15, CANVAS_HEIGHT - 40, 10, 10);

      // Aliens
      ctx.fillStyle = '#22c55e'; // green-500
      s.aliens.forEach(a => {
        if (a.alive) {
          ctx.fillRect(a.x, a.y, ALIEN_WIDTH, ALIEN_HEIGHT);
        }
      });

      // Bullets
      s.bullets.forEach(b => {
        ctx.fillStyle = b.isPlayer ? '#fcd34d' : '#f43f5e'; // amber-300 : rose-500
        ctx.fillRect(b.x - 2, b.y, 4, 10);
      });
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, gameWon, isPaused]);

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
              {gameWon ? 'Earth Saved! 🎉' : 'Game Over! 💥'}
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
      
      <p className="mt-6 text-sm text-slate-400 font-medium">Use Left/Right arrows to move. Space to shoot.</p>
    </div>
  );
}
