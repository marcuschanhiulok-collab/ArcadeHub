import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play, Pause } from 'lucide-react';
import HowToPlay from './HowToPlay';
import { soundManager } from '../lib/soundManager';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 450;
const SHIP_SIZE = 15;
const THRUST = 0.1;
const FRICTION = 0.99;
const TURN_SPEED = 0.1;
const BULLET_SPEED = 7;
const BULLET_LIFE = 60; // frames
const ASTEROID_SPEED_BASE = 1;

type Entity = { x: number, y: number, vx: number, vy: number };
type Ship = Entity & { angle: number, thrusting: boolean };
type Bullet = Entity & { life: number };
type Asteroid = Entity & { radius: number, points: number[] };

const createAsteroid = (x: number, y: number, radius: number): Asteroid => {
  const angle = Math.random() * Math.PI * 2;
  const speed = ASTEROID_SPEED_BASE + Math.random();
  const numPoints = 8 + Math.floor(Math.random() * 4);
  const points = Array.from({ length: numPoints }, () => radius * (0.8 + Math.random() * 0.4));
  return {
    x, y, 
    vx: Math.cos(angle) * speed, 
    vy: Math.sin(angle) * speed, 
    radius, points
  };
};

export default function Asteroids() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const state = useRef({
    ship: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0, angle: -Math.PI / 2, thrusting: false } as Ship,
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    keys: { ArrowUp: false, ArrowLeft: false, ArrowRight: false, Space: false },
    lastShot: 0
  });

  const resetGame = () => {
    state.current = {
      ship: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0, angle: -Math.PI / 2, thrusting: false },
      bullets: [],
      asteroids: [
        createAsteroid(Math.random() * CANVAS_WIDTH, 0, 40),
        createAsteroid(0, Math.random() * CANVAS_HEIGHT, 40),
        createAsteroid(CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 40)
      ],
      keys: { ArrowUp: false, ArrowLeft: false, ArrowRight: false, Space: false },
      lastShot: 0
    };
    setScore(0);
    setGameOver(false);
    setHasStarted(false);
    setIsPaused(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { keys } = state.current;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.ArrowUp = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = true;
      if (e.code === 'Space') {
        keys.Space = true;
        if (!hasStarted && !gameOver) {
          setHasStarted(true);
        }
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const { keys } = state.current;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.ArrowUp = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = false;
      if (e.code === 'Space') keys.Space = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasStarted, gameOver]);

  useEffect(() => {
    let animationId: number;

    const wrap = (ent: Entity) => {
      if (ent.x < 0) ent.x = CANVAS_WIDTH;
      if (ent.x > CANVAS_WIDTH) ent.x = 0;
      if (ent.y < 0) ent.y = CANVAS_HEIGHT;
      if (ent.y > CANVAS_HEIGHT) ent.y = 0;
    };

    const dist = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1);

    const update = () => {
      if (gameOver || isPaused || !hasStarted) {
        if (!hasStarted && !gameOver) draw();
        animationId = requestAnimationFrame(update);
        return;
      }
      
      const s = state.current;
      
      if (s.keys.ArrowLeft) s.ship.angle -= TURN_SPEED;
      if (s.keys.ArrowRight) s.ship.angle += TURN_SPEED;
      
      s.ship.thrusting = s.keys.ArrowUp;
      if (s.ship.thrusting) {
        s.ship.vx += Math.cos(s.ship.angle) * THRUST;
        s.ship.vy += Math.sin(s.ship.angle) * THRUST;
      }
      
      s.ship.vx *= FRICTION;
      s.ship.vy *= FRICTION;
      s.ship.x += s.ship.vx;
      s.ship.y += s.ship.vy;
      wrap(s.ship);

      const now = Date.now();
      if (s.keys.Space && now - s.lastShot > 250) {
        s.bullets.push({
          x: s.ship.x + Math.cos(s.ship.angle) * SHIP_SIZE,
          y: s.ship.y + Math.sin(s.ship.angle) * SHIP_SIZE,
          vx: s.ship.vx + Math.cos(s.ship.angle) * BULLET_SPEED,
          vy: s.ship.vy + Math.sin(s.ship.angle) * BULLET_SPEED,
          life: BULLET_LIFE
        });
        s.lastShot = now;
        soundManager.play('shoot');
      }

      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;
        wrap(b);
        if (b.life <= 0) s.bullets.splice(i, 1);
      }

      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const a = s.asteroids[i];
        a.x += a.vx;
        a.y += a.vy;
        wrap(a);

        if (dist(s.ship.x, s.ship.y, a.x, a.y) < a.radius + SHIP_SIZE / 2) {
          if (!gameOver) soundManager.play('explosion');
          setGameOver(true);
        }

        let hit = false;
        for (let j = s.bullets.length - 1; j >= 0; j--) {
          const b = s.bullets[j];
          if (dist(b.x, b.y, a.x, a.y) < a.radius) {
            s.bullets.splice(j, 1);
            hit = true;
            break;
          }
        }

        if (hit) {
          soundManager.play('explosion');
          setScore(sc => sc + (a.radius > 30 ? 20 : (a.radius > 15 ? 50 : 100)));
          if (a.radius > 15) {
            s.asteroids.push(createAsteroid(a.x, a.y, a.radius / 2));
            s.asteroids.push(createAsteroid(a.x, a.y, a.radius / 2));
          }
          s.asteroids.splice(i, 1);
        }
      }

      if (s.asteroids.length === 0) {
        s.asteroids.push(createAsteroid(Math.random() * CANVAS_WIDTH, 0, 40));
        s.asteroids.push(createAsteroid(0, Math.random() * CANVAS_HEIGHT, 40));
        s.asteroids.push(createAsteroid(CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 40));
        s.asteroids.push(createAsteroid(Math.random() * CANVAS_WIDTH, CANVAS_HEIGHT, 40));
      }

      draw();
      animationId = requestAnimationFrame(update);
    };

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const s = state.current;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;

      if (!gameOver) {
        ctx.save();
        ctx.translate(s.ship.x, s.ship.y);
        ctx.rotate(s.ship.angle);
        
        ctx.beginPath();
        ctx.moveTo(SHIP_SIZE, 0);
        ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE * 0.7);
        ctx.lineTo(-SHIP_SIZE * 0.5, 0);
        ctx.lineTo(-SHIP_SIZE, SHIP_SIZE * 0.7);
        ctx.closePath();
        ctx.stroke();

        if (s.ship.thrusting) {
          ctx.strokeStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(-SHIP_SIZE * 0.6, 0);
          ctx.lineTo(-SHIP_SIZE * 1.5, -SHIP_SIZE * 0.3);
          ctx.lineTo(-SHIP_SIZE * 1.2, 0);
          ctx.lineTo(-SHIP_SIZE * 1.5, SHIP_SIZE * 0.3);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.fillStyle = '#fcd34d';
      s.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = '#cbd5e1';
      s.asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.beginPath();
        a.points.forEach((r, i) => {
          const a_angle = (Math.PI * 2 * i) / a.points.length;
          const x = Math.cos(a_angle) * r;
          const y = Math.sin(a_angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [hasStarted, gameOver, isPaused]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center w-full mb-6 px-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
        <HowToPlay 
          rules={[
            "Destroy the asteroids by shooting them.",
            "Large asteroids break into multiple smaller ones.",
            "Avoid crashing into the asteroids!"
          ]}
          controls={[
            "Up Arrow / W to thrust forward.",
            "Left/Right Arrows / A/D to rotate ship.",
            "Spacebar to shoot."
          ]}
        />
        <div className="flex gap-2">
           <button
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver || !hasStarted}
            className="flex items-center justify-center p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            title="Pause"
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
        </div>
      </div>

      <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg border-4 border-slate-900 w-full max-w-[600px] aspect-[4/3]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain bg-slate-900 block"
        />
        
        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-white drop-shadow-md mb-2 tracking-widest uppercase">Asteroids</span>
            <span className="text-white font-medium drop-shadow-md">Press SPACE to Start</span>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-rose-500 mb-2 drop-shadow-md">Game Over!</span>
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

        {isPaused && !gameOver && hasStarted && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-widest drop-shadow-md">PAUSED</span>
          </div>
        )}
      </div>
      <p className="text-sm text-slate-400 font-medium">Up to thrust, Left/Right to rotate, Space to shoot.</p>
    </div>
  );
}
