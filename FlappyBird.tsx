import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const GRAVITY = 0.20;
const JUMP = -5;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 140;

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const state = useRef({
    bird: { y: CANVAS_HEIGHT / 2, velocity: 0 },
    pipes: [] as { x: number, topHeight: number, passed: boolean }[],
    frames: 0
  });

  const resetGame = () => {
    state.current = {
      bird: { y: CANVAS_HEIGHT / 2, velocity: 0 },
      pipes: [],
      frames: 0
    };
    setScore(0);
    setGameOver(false);
    setHasStarted(false);
    setIsPaused(false);
  };

  const jump = () => {
    if (gameOver) return;
    if (!hasStarted) setHasStarted(true);
    state.current.bird.velocity = JUMP;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, hasStarted]);

  useEffect(() => {
    let animationId: number;
    
    const loop = () => {
      if (gameOver || isPaused || !hasStarted) {
        if (!gameOver && !isPaused && !hasStarted) draw(); // Draw initial state
        animationId = requestAnimationFrame(loop);
        return;
      }

      const s = state.current;
      s.frames++;

      // Bird physics
      s.bird.velocity += GRAVITY;
      s.bird.y += s.bird.velocity;

      // Spawn pipes
      if (s.frames % 90 === 0) {
        const minPipeHeight = 50;
        const maxPipeHeight = CANVAS_HEIGHT - PIPE_GAP - minPipeHeight;
        const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
        s.pipes.push({ x: CANVAS_WIDTH, topHeight, passed: false });
      }

      // Move pipes & check collisions
      for (let i = s.pipes.length - 1; i >= 0; i--) {
        const p = s.pipes[i];
        p.x -= PIPE_SPEED;

        // Collision
        const birdX = 50; // fixed x position
        const birdRadius = 12;
        
        // Hit ground or ceiling
        if (s.bird.y + birdRadius >= CANVAS_HEIGHT || s.bird.y - birdRadius <= 0) {
          setGameOver(true);
        }

        // Hit pipe
        if (birdX + birdRadius > p.x && birdX - birdRadius < p.x + PIPE_WIDTH) {
          if (s.bird.y - birdRadius < p.topHeight || s.bird.y + birdRadius > p.topHeight + PIPE_GAP) {
            setGameOver(true);
          }
        }

        // Score
        if (p.x + PIPE_WIDTH < birdX && !p.passed) {
          p.passed = true;
          setScore(sc => sc + 1);
        }

        // Remove off-screen pipes
        if (p.x + PIPE_WIDTH < 0) {
          s.pipes.splice(i, 1);
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
      ctx.fillStyle = '#7dd3fc'; // sky-300
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground (simple)
      ctx.fillStyle = '#22c55e'; // green-500
      ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);

      // Pipes
      ctx.fillStyle = '#16a34a'; // green-600
      s.pipes.forEach(p => {
        // Top pipe
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
        // Bottom pipe
        ctx.fillRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - p.topHeight - PIPE_GAP);
        
        // Pipe caps
        ctx.fillStyle = '#15803d'; // green-700
        ctx.fillRect(p.x - 2, p.topHeight - 20, PIPE_WIDTH + 4, 20);
        ctx.fillRect(p.x - 2, p.topHeight + PIPE_GAP, PIPE_WIDTH + 4, 20);
        ctx.fillStyle = '#16a34a';
      });

      // Bird
      ctx.fillStyle = '#fbbf24'; // amber-400
      ctx.beginPath();
      ctx.arc(50, s.bird.y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Bird eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(54, s.bird.y - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(55, s.bird.y - 4, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, isPaused, hasStarted]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md mx-auto">
      <div className="flex justify-between w-full mb-6 px-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Score</span>
          <span className="text-3xl font-black text-slate-800">{score}</span>
        </div>
      </div>

      <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg border-4 border-slate-900 cursor-pointer" onClick={jump}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-sky-300"
        />
        
        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/20 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-white drop-shadow-md mb-2">Flappy Bird</span>
            <span className="text-white font-medium drop-shadow-md">Click or Space to Jump</span>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white mb-2 drop-shadow-md">Game Over!</span>
            <span className="text-white/80 mb-8 font-medium">Final Score: {score}</span>
            <button
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-transform hover:scale-105 font-bold shadow-xl"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-slate-400 font-medium">Press Space or Click the game area to jump.</p>
    </div>
  );
}
